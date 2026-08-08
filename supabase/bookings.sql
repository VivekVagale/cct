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

  -- Personal, brand, dealership or agency. See USAGE_OPTIONS in Booking.tsx.
  usage text not null default '' check (char_length(usage) <= 100),

  -- Always true today: the collab post is included rather than chosen. Stored
  -- anyway, so the day it becomes a choice the old rows still say what they meant.
  collab_post boolean not null default true
);

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

-- Newest first is how these get read.
create index if not exists bookings_created_at_idx
  on public.bookings (created_at desc);
