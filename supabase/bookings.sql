-- The bookings table, and the policies that decide what a browser may do to it.
--
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> Run.
-- It is written to be safe to run twice.

-- The studio's pipeline, as a type rather than as a rule.
--
-- An enum, not text with a check constraint, because the Table Editor renders
-- an enum column as a dropdown and a checked text column as a box you can type
-- anything into — the constraint would catch a bad value on save, which is a
-- worse place to learn about it than not being offered it.
--
-- The order is declaration order, and that is also how the column sorts.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_progress') then
    create type public.booking_progress as enum (
      'yet to do',
      'next one',
      'in progress',
      'completed'
    );
  end if;
end
$$;

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

  -- Where the job has got to. Studio-side only: nothing on the site writes it
  -- or can read it, and it is edited in the dashboard.
  progress public.booking_progress not null default 'yet to do'
);

-- Three columns carried over from the enquiry sheet, for reference while
-- working a booking: its columns C, I and N.
--
-- Studio-side, like `progress`. None of them is in the insert grant at the
-- bottom of this file, so nothing on the site can write them and a hand-written
-- POST cannot either. They are filled in the Table Editor.
--
-- `contact_status` overlaps `progress` and that is not an accident to fix
-- blindly: `progress` is where the render has got to, this is where the
-- conversation has got to. A job can be 'completed' and still 'Outstanding'.
-- If they do collapse into one in practice, drop this rather than `progress` --
-- the site has no opinion about either, but `progress` is the older column.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_contact_status') then
    create type public.booking_contact_status as enum (
      'awaiting',
      'contacted',
      'on hold',
      'outstanding',
      'model confirmation?'
    );
  end if;
end
$$;

-- The sheet's five values, lowercased. The sheet also holds pairs in one cell
-- -- 'Outstanding, On Hold' -- which an enum cannot take. Those rows pick the
-- one that is actually true; a column that accepts both says neither.
alter table public.bookings
  add column if not exists contact_status public.booking_contact_status
  not null default 'awaiting';

-- Sheet column I. Free text: the sheet holds names, numbers, and both.
alter table public.bookings
  add column if not exists number_plate text not null default ''
  check (char_length(number_plate) <= 200);

-- Sheet column N. Free text, and this is settled: the studio types into it by
-- hand and wants to write things that are not dates -- 'advance paid', 'half on delivery', '2nd
-- Aug approx'. A date column rejects all of those and pushes the note into
-- `note` or nowhere, which costs more than the sorting it buys.
--
-- It was a date type for two commits and carried a `payment_at_label` beside it
-- to render it readably. Both are gone: with no date type there is nothing to
-- render, and the conversion below keeps anything already typed.
alter table public.bookings
  add column if not exists payment_at text not null default ''
  check (char_length(payment_at) <= 200);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings'
      and column_name = 'payment_at' and data_type <> 'text'
  ) then
    alter table public.bookings
      alter column payment_at type text
      using coalesce(to_char(payment_at, 'DD/MM/YYYY HH24:MI'), '');
    alter table public.bookings alter column payment_at set default '';
    update public.bookings set payment_at = '' where payment_at is null;
    alter table public.bookings alter column payment_at set not null;
  end if;
end
$$;

alter table public.bookings drop column if exists payment_at_label;

alter table public.bookings
  add column if not exists created_at_label text;

-- Filled by a trigger, not a generated column.
--
-- Two attempts went the generated route and Postgres refused both with 42P17,
-- generation expression is not immutable. The rule that kills it is not the
-- timezone, which was the first guess: `to_char` is STABLE for every timestamp
-- variant it takes, because it reads `lc_time` for its day and month names. No
-- generated column can call it at all, zoned or not.
--
-- A trigger has no immutability rule.
create or replace function public.bookings_set_labels()
returns trigger
language plpgsql
as $$
begin
  new.created_at_label := to_char(
    new.created_at at time zone 'Asia/Kolkata',
    'FMDay, FMDD FMMonth YYYY, HH12:MI AM');
  return new;
end
$$;

drop trigger if exists bookings_labels on public.bookings;
create trigger bookings_labels
  before insert or update on public.bookings
  for each row execute function public.bookings_set_labels();

-- Fires the trigger on every existing row, which is how rows written before
-- the trigger existed get their labels. A no-op write, and safe to repeat.
update public.bookings set id = id;

-- What has been paid, in two columns rather than one sentence.
--
-- `payment_stage` is nullable with no default, unlike `progress` and
-- `contact_status`. Those have a true starting state - every job begins 'yet to
-- do' and 'awaiting'. This one does not: a booking nobody has discussed money
-- for is not half paid, and defaulting to 'half' would fill the column with an
-- answer nobody gave. Blank means blank.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_payment_stage') then
    create type public.booking_payment_stage as enum ('half', 'full');
  end if;
end
$$;

alter table public.bookings
  add column if not exists payment_stage public.booking_payment_stage;

-- Rupees. Numeric, not text, and this is the one column here where the type is
-- worth the constraint: it is the only field on the table that anyone will ever
-- want a sum of. `payment_at` beside it is free text precisely so the notes
-- that do not fit a number have somewhere to go.
alter table public.bookings
  add column if not exists amount_paid numeric(10,2)
  check (amount_paid >= 0);

-- Project Free Fall's brief.
--
-- Six columns rather than six sentences in `description`, because these are
-- the questions every Free Fall job used to take a round of DMs to settle and
-- the studio wants to read them at a glance, sort by them, and count them.
-- Prefixed so it is obvious at the Table Editor's width that they belong to
-- one build and are empty under the other three.
--
-- Unlike the columns above, these ARE written by the site, so they go in the
-- insert grant at the foot of this file. Adding a column without adding it
-- there is a 403 on every submission, not a missing value.
--
-- Text with a length ceiling, matching the other insertable columns and for
-- the same stated reason: the form decides what a valid answer is, and these
-- checks only cap what one row can cost, since the key that writes here ships
-- in the page.
alter table public.bookings
  add column if not exists free_fall_plate text not null default ''
  check (char_length(free_fall_plate) <= 100);

-- 'none', '1', '2', '2+'. Text, not an enum: an enum rejects a value the API
-- sends and the client sees a failed submission, where a column that stores
-- what arrived leaves the studio a row to read. The dropdown enums on this
-- table are all studio-side, where a bad value cannot come from a stranger.
alter table public.bookings
  add column if not exists free_fall_stickers text not null default ''
  check (char_length(free_fall_stickers) <= 20);

alter table public.bookings
  add column if not exists free_fall_environment text not null default ''
  check (char_length(free_fall_environment) <= 50);

alter table public.bookings
  add column if not exists free_fall_oem text not null default ''
  check (char_length(free_fall_oem) <= 20);

alter table public.bookings
  add column if not exists free_fall_oem_details text not null default ''
  check (char_length(free_fall_oem_details) <= 1000);

-- The jet's name, not its id. A person reads this column.
alter table public.bookings
  add column if not exists free_fall_jet text not null default ''
  check (char_length(free_fall_jet) <= 100);

-- There is no collab_post column. The collab used to be a toggle and is now
-- simply included in every job, so the field was true on every row and recorded
-- nothing. If it ever becomes a choice again, add it then; rows written before
-- that date are collab-included by their date alone.
alter table public.bookings drop column if exists collab_post;

-- Bringing an existing table up to the shape above.
--
-- `progress` shipped first as text with a check constraint and six statuses.
-- These statements convert it in place and are no-ops on a table created fresh
-- by the block above, which is already an enum.
alter table public.bookings drop constraint if exists bookings_progress_check;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings'
      and column_name = 'progress' and data_type <> 'USER-DEFINED'
  ) then
    alter table public.bookings alter column progress drop default;
    alter table public.bookings
      alter column progress type public.booking_progress
      using (
        case progress
          when 'new' then 'yet to do'
          when 'contacted' then 'next one'
          when 'quoted' then 'next one'
          when 'in production' then 'in progress'
          when 'delivered' then 'completed'
          when 'closed' then 'completed'
          else 'yet to do'
        end::public.booking_progress
      );
    alter table public.bookings alter column progress set default 'yet to do';
    alter table public.bookings alter column progress set not null;
  end if;
end
$$;

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
grant insert (full_name, email, instagram, whatsapp, project_type, vehicle, description, usage,
              free_fall_plate, free_fall_stickers, free_fall_environment,
              free_fall_oem, free_fall_oem_details, free_fall_jet)
  on public.bookings to anon, authenticated;

-- Newest first is how these get read.
create index if not exists bookings_created_at_idx
  on public.bookings (created_at desc);
