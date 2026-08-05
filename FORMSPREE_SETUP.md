# Booking form endpoint

The booking form posts JSON to whatever URL `VITE_BOOKING_FORM_ENDPOINT` names.
Nothing in the code is Formspree-specific — Formspree is just the cheapest thing
that accepts a JSON POST and mails it to you. Any endpoint that does the same
works with no code change.

**Until that variable is set, the form cannot succeed.** `submitBookingForm`
returns `false` when it is missing, so every submission lands on the red error
line and the client is told to email instead. The thank-you card is built and
working, but nobody can reach it.

## 1. Create the form

Sign up at <https://formspree.io>, create a form, and point it at the inbox that
should receive requests. You end up with a URL shaped like:

```
https://formspree.io/f/xxxxxxxx
```

## 2. Set the variable in Vercel

Dashboard → the `cold-chain-theory` project → Settings → Environment Variables.

| Field | Value |
| --- | --- |
| Name | `VITE_BOOKING_FORM_ENDPOINT` |
| Value | the URL from step 1 |
| Environments | Production, and Preview if you want to test there first |

For local development, put the same line in `.env.local` at the repo root:

```
VITE_BOOKING_FORM_ENDPOINT=https://formspree.io/f/xxxxxxxx
```

## 3. Redeploy

**This step is not optional.** Vite inlines `import.meta.env` values at build
time, so the variable does nothing to deployments that already exist. Every
build made before you added it will keep failing. Trigger a fresh deploy — any
push to `main` does it, or use Redeploy in the Vercel dashboard.

## 4. Test it

Submit the form once yourself. You should land on the thank-you card, and the
request should arrive in the inbox with these fields:

| Field | Notes |
| --- | --- |
| `fullName` | required |
| `email` | required |
| `instagram` | how we reply |
| `whatsapp` | optional, handle or number |
| `projectType` | the project card the client picked |
| `vehicle` | marque, model and colour, or empty if they skipped step 01 |
| `description` | free text |

Formspree asks you to confirm the destination address on the first submission.
Until you click that link, submissions are held rather than delivered — an empty
inbox after one test usually means the confirmation email, not a broken form.

## Changing providers later

`client/src/lib/formHandler.ts` is the only file that knows how a request is
sent. It posts JSON with `Content-Type: application/json` and
`Accept: application/json` — the second header matters, because Formspree
answers a JSON POST with a redirect to its own thank-you page unless the request
asks for JSON, and a followed redirect would resolve as ok and report a failed
submission as a success.

Swap the body shape or the transport there and the form component needs no
changes; it only knows `submitBookingForm(data)` and whether it resolved true.
