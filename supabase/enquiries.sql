-- The Instagram enquiry log, as a table.
--
-- This is the Google Form sheet the studio has been working from since before
-- the site had a booking form -- 604 rows at the time of writing. It is a
-- separate table from `bookings` on purpose:
--
--   * `bookings` is the website form. Its security model is a per-column
--     insert grant, and every column on it is one the page writes. Adding
--     fifteen columns nothing on the site touches would widen that surface for
--     no reason.
--   * The two have different shapes and different lifetimes. This one stops
--     growing the day the sheet does.
--
-- Run it the same way: SQL Editor -> New query -> paste -> Run. Safe twice.

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  imported_at timestamptz not null default now(),

  -- Every sheet column is text, including the two timestamps.
  --
  -- Not laziness: this is a CSV export of a Google Form that has been edited by
  -- hand for months. The vehicle column alone holds registration numbers, jokes
  -- and empty strings, and the payment column holds dates in more than one
  -- format. A typed import fails on the first bad cell and rolls back the whole
  -- file, which is a poor trade for sorting that the dashboard can do on text
  -- anyway. Convert a column once the data is in and you can see what is in it
  -- -- there is a statement for `submitted_at` at the bottom.
  submitted_at    text not null default '',  -- A  Timestamp
  status          text not null default '',  -- B  STATUS
  contact_status  text not null default '',  -- C  Contact Status
  instagram       text not null default '',  -- D  Instagram username
  vehicle         text not null default '',  -- E  Vehicle name + model + colour
  availability    text not null default '',  -- F  AVAILABILITY
  column_7        text not null default '',  -- G  "Column 7", Google's placeholder
  free_links      text not null default '',  -- H  FREE LINKS
  number_plate    text not null default '',  -- I  Custom name/number on plate
  plan            text not null default '',  -- J  Brochure plan: 720p / 1080p / 4K
  hdri            text not null default '',  -- K  HDRI
  note            text not null default '',  -- L  NOTE
  f               text not null default '',  -- M  "F"
  payment_at      text not null default '',  -- N  PAYMENT TIMESTAMP
  banking_name    text not null default ''   -- O  banking name
);

-- Row-level security on, and deliberately no policies at all.
--
-- A table with RLS enabled and no policy is readable and writable by nobody
-- through the API -- not anon, not authenticated. The dashboard still shows it,
-- because the Table Editor uses your own login and bypasses these rules.
--
-- That is the whole point. This table holds customer phone numbers, email
-- addresses, Instagram handles and vehicle registration numbers. The
-- publishable key ships inside the page and anyone can read it out of the
-- network tab, so any policy granting `anon` a select here would publish the
-- lot. Do not add one to debug something.
alter table public.enquiries enable row level security;

-- Nothing in the API may touch it either way.
revoke all on public.enquiries from anon, authenticated;

create index if not exists enquiries_contact_status_idx
  on public.enquiries (contact_status);

-- The column the outreach work runs off. A trigram index would be better for
-- the `ilike '%duke%'` searches, but that needs pg_trgm; plain btree at least
-- helps the exact-match and prefix cases.
create index if not exists enquiries_vehicle_idx
  on public.enquiries (vehicle);

-- Optional, and only once the rows are in and you have looked at them.
--
-- Google writes its Form timestamps as `DD/MM/YYYY HH:MM:SS` in this sheet.
-- This adds a real timestamp column beside the text one rather than replacing
-- it, so a row whose text does not parse keeps its original value instead of
-- being silently emptied.
--
--   alter table public.enquiries add column if not exists submitted_on timestamptz;
--
--   update public.enquiries
--      set submitted_on = to_timestamp(submitted_at, 'DD/MM/YYYY HH24:MI:SS')
--    where submitted_at ~ '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$'
--      and submitted_on is null;
--
--   select count(*) from public.enquiries where submitted_on is null;
