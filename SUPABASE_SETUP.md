# Booking form → Supabase

Project: `https://uqhgatgzgsnooanlfurs.supabase.co`

The form is wired and the publishable key is in the code, so there is no Vercel
variable to set and nothing to remember on deploy. **One step remains**, and
until it is done every submission fails and the thank-you card cannot appear.

Connecting the GitHub repo in Supabase does not create tables. It links the
project to the repo; the step below is still required.

---

## The one step: create the table

Supabase dashboard → **SQL Editor** → **New query** → paste the contents of
[`supabase/bookings.sql`](supabase/bookings.sql) → **Run**.

Safe to run twice.

It creates `public.bookings`, turns on row-level security, and grants exactly
one thing: insert. There is deliberately no select policy — that is what stops a
visitor reading other people's submissions with the key that ships in the page.

Read your bookings in **Table Editor → `bookings`**, which uses your own login
and is not subject to those policies.

---

## Studio-side columns on `bookings`

`progress`, plus three carried over from the enquiry sheet for reference while
working a job: `contact_status` (a dropdown, the sheet's five values),
`number_plate` (free text), `payment_at` (date picker), `payment_stage` (half or
full, blank until you pick) and `amount_paid` in rupees.

Two columns read themselves and cannot be edited: `payment_at_label` and
`created_at_label`, both rendering as **Sunday, 17 August 2026, 10:41 PM**. The
dashboard has no display-format setting, so this is how a date is made readable
— type into `payment_at`, read the label beside it.

`amount_paid` is the one number on the table worth totalling:

```sql
select payment_stage, count(*), sum(amount_paid)
from public.bookings
group by payment_stage;
```

None of them is in the insert grant, so nothing on the site writes them and a
hand-written POST cannot either. Fill them in the Table Editor. Re-run
[`supabase/bookings.sql`](supabase/bookings.sql) to add them to a table that
already exists — it is safe to run twice.

`contact_status` and `progress` are not duplicates: one is where the render has
got to, the other is where the conversation has got to.

## The enquiry log, separately

The Instagram enquiry sheet the studio has worked from since before this form
existed lives in its own table, not in `bookings`. Run
[`supabase/enquiries.sql`](supabase/enquiries.sql) the same way, then:

**Table Editor → `enquiries` → Import data from CSV**, using a CSV exported
from the sheet with **File → Download → Comma-separated values**.

Match the columns by position: the file's fifteen columns are `submitted_at`,
`status`, `contact_status`, `instagram`, `vehicle`, `availability`, `column_7`,
`free_links`, `number_plate`, `plan`, `hdri`, `note`, `f`, `payment_at`,
`banking_name`, in that order. Leave `id` and `imported_at` alone; they fill
themselves.

Every column is text, on purpose — the sheet is months of hand-editing and a
typed import fails on the first bad cell and rolls back the whole file. There
is a statement at the bottom of the SQL for converting the timestamp once the
rows are in.

`enquiries` has row-level security on and **no policies at all**, so nothing
reachable with the publishable key can read or write it. It holds customer
phone numbers, emails, handles and registration numbers, and the publishable
key is readable by anyone who opens the network tab. Read it in the dashboard,
which uses your own login. Do not add a select policy for `anon`.

## Checking it works

Submit the form on the live site, then look in Table Editor. A row appears, or
the browser console says why it did not.

- **404** — the table does not exist. The step above has not been run.
- **401** — the key was rejected. It has been rotated; see below.
- **403** or a row-level security message — the insert policy is missing. Re-run
  the SQL, which recreates it.

---

## Which key, and where it lives

`sb_publishable_C0PVLl3tfWI1kynpoNfV-g_vCZApJFJ`, in
`client/src/lib/formHandler.ts`.

That is deliberate. A publishable key identifies the project and carries no
authority of its own — what it may do is decided entirely by the policies in the
SQL. It is sent with every submission and is readable by anyone who opens the
network tab, so putting it in an environment variable would hide it from nobody
while adding a step to every deploy. **Rotating it means editing that line.**

`VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_SUPABASE_URL` still override the
defaults if the project ever moves.

The `sb_secret_` and `service_role` keys are the opposite of this one: they
bypass row-level security completely. They must never go into a `VITE_`
variable, this repo, or anything under `client/`, all of which is compiled into
a bundle the public can read. If one is ever pasted somewhere public, rotate it
in the dashboard immediately.

---

## Worth knowing before this is live

**Anyone can post to this table.** That is what an insert policy for `anon`
means, and it is the exposure every public form has. The length limits in the
SQL cap what one junk row can cost and row-level security stops anyone reading
the table, but neither stops volume. If spam arrives, the answer is Supabase's
Attack Protection or a captcha ahead of the submit — say the word.

**Nothing emails you when a booking lands.** The row appears in the dashboard
and that is all. A database webhook or an edge function can send one; it is a
separate piece of work.
