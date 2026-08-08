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
