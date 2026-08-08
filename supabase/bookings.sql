-- The bookings table, and the policies that decide what a browser may do to it.
--
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> Run.
-- It is written to be safe to run twice.

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- The two the form requires.
  full_name text not null check (char_length(full_name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320),

  -- The rest are optional in the form, so they are empty strings rather than
  -- nulls: "asked and left blank" and "never asked" read the same in an inbox
  -- otherwise, and the form does ask for all of these.
  instagram text not null default '' check (char_length(instagram) <= 200),
  whatsapp text not null default '' check (char_length(whatsapp) <= 100),
  project_type text not null default '' check (char_length(project_type) <= 200),
  vehicle text not null default '' check (char_length(vehicle) <= 200),
  description text not null default '' check (char_length(description) <= 5000),

  -- Personal, brand, dealership or agency — the chips above the submit button.
  -- See USAGE_OPTIONS in Booking.tsx.
  usage text not null default '' check (char_length(usage) <= 100),

  -- Where the job has got to. Studio-side only: nothing in the site writes it
  -- or can read it, and it is edited in the dashboard. The check exists so a
  -- typo cannot quietly become a third spelling of a status.
  progress text not null default 'new'
    check (progress in ('new','contacted','quoted','in production','delivered','closed'))
);

-- There is no collab_post column. The collab used to be a toggle and is now
-- simply included in every job, so the field was true on every row and recorded
-- nothing. If it ever becomes a choice again, add it then; rows written before
-- that date are collab-included by their date alone.
alter table public.bookings drop column if exists collab_post;

-- The length checks above are not validation — the form does that, and anyone
-- can post here without going near the form. They are a ceiling on what a
-- single row can cost, because the key that writes to this table ships in the
-- page and is readable by anyone who opens it.

alter table public.bookings enable row level security;

-- Insert, and only insert.
--
-- With row-level security on and no select policy, the anon key can add a
-- booking and cannot read one — not its own, not anyone else's. That is the
-- whole security model here, so do not add a select policy for `anon` in order
-- to debug something; read the rows in the dashboard, which uses your own
-- credentials and is not subject to these policies.
drop policy if exists "Anyone may submit a booking" on public.bookings;
create policy "Anyone may submit a booking"
  on public.bookings
  for insert
  to anon, authenticated
  with check (true);

-- Which columns a submission may write.
--
-- The policy above decides whether a row may be inserted; this decides what it
-- is allowed to contain. Without it, `with check (true)` lets a hand-written
-- POST set anything on the row it creates — its own created_at, or a progress
-- of 'delivered' on a job that does not exist. It could never read the result,
-- but it could poison the column the studio works from.
--
-- Revoke first, then grant. A table-level INSERT privilege implies every
-- column, and a column-level revoke does not take it back: the table grant has
-- to go before per-column grants mean anything.
revoke insert on public.bookings from anon, authenticated;
grant insert (full_name, email, instagram, whatsapp, project_type, vehicle, description, usage)
  on public.bookings to anon, authenticated;

-- Newest first is how these get read.
create index if not exists bookings_created_at_idx
  on public.bookings (created_at desc);
