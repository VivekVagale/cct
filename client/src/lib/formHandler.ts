export interface BookingFormData {
  fullName: string;
  email: string;
  instagram: string;
  /** Optional — a handle or a number, whichever the client gave. */
  whatsapp: string;
  projectType: string;
  vehicle: string;
  description: string;
  /**
   * Personal, brand, dealership or agency — the chips above the submit button.
   * See USAGE_OPTIONS in Booking.
   *
   * There is no collab flag beside it any more. The collab post was a toggle
   * once; it is included in every job now, so the field was true on every
   * submission and told an inbox nothing it did not already know.
   */
  usage: string;

  /*
   * Project Free Fall's brief, and empty strings under every other build.
   *
   * Not optional fields: the caller sends all six every time, blank when the
   * chosen build is not Free Fall. An absent key and a blank answer read the
   * same in the studio's table otherwise, which is the reasoning the columns
   * above are already written with.
   */
  freeFallPlate: string;
  freeFallStickers: string;
  freeFallEnvironment: string;
  freeFallOem: string;
  freeFallOemDetails: string;
  /** The jet's name, not its id -- a person reads this column. */
  freeFallJet: string;
}

/**
 * The project's REST endpoint.
 *
 * Defaulted rather than required, because it is not a secret — it is in every
 * request the browser makes — and because the variable that genuinely has to be
 * set is the key below. One thing to forget is better than two, and a missing
 * URL would fail identically to a missing key while being much harder to
 * diagnose from the console.
 */
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://uqhgatgzgsnooanlfurs.supabase.co";

/**
 * The publishable key, and it is in the file on purpose.
 *
 * Publishable is Supabase's own word for it: it identifies the project and
 * carries no authority of its own. What it may do is decided entirely by the
 * row-level security policies on the table — see supabase/bookings.sql, which
 * grants insert and withholds select, so this key can post a booking and cannot
 * read one back. It is sent with every submission the browser makes and is
 * readable by anyone who opens the network tab, so keeping it in an environment
 * variable would hide it from nobody while adding a step that has to be
 * repeated on every deploy. The environment variable still overrides it, which
 * is the escape hatch if the project ever moves.
 *
 * Rotating it means editing this line.
 *
 * The `sb_secret_` and `service_role` keys are the opposite of this one and must
 * never appear here. They bypass row-level security completely, and everything
 * under client/ is compiled into a bundle any visitor can read.
 */
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_C0PVLl3tfWI1kynpoNfV-g_vCZApJFJ";

/**
 * Isolated submission logic. Swap the implementation here — a row in Supabase
 * today, a queue or a booking backend later — without touching the form.
 *
 * Written against PostgREST directly rather than through @supabase/supabase-js.
 * The client library is worth its size when a page needs auth, realtime or
 * storage; this needs one authenticated POST, which is the fetch below, and the
 * bundle is already ~1MB with no code splitting.
 */
export async function submitBookingForm(data: BookingFormData): Promise<boolean> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      /*
       * Bearer only for the old key format.
       *
       * A legacy anon key is a JWT and belongs in both headers, which is what
       * the Supabase client sends. The current `sb_publishable_` keys are not
       * JWTs, and handing one to a header that is parsed as a token is a way to
       * be refused for malformed credentials while holding a perfectly good
       * key. The apikey header is the one that resolves the role either way.
       */
      ...(SUPABASE_KEY.startsWith("eyJ")
        ? { Authorization: `Bearer ${SUPABASE_KEY}` }
        : {}),
      "Content-Type": "application/json",
      /*
       * Nothing comes back, and that is deliberate on both sides. The table
       * grants insert and not select, so asking for the inserted row — which is
       * PostgREST's default when the header is `return=representation` — would
       * be refused by the very policy that keeps submissions private, and a
       * successful write would report itself as a failure.
       */
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      full_name: data.fullName,
      email: data.email,
      instagram: data.instagram,
      whatsapp: data.whatsapp,
      project_type: data.projectType,
      vehicle: data.vehicle,
      description: data.description,
      usage: data.usage,
      free_fall_plate: data.freeFallPlate,
      free_fall_stickers: data.freeFallStickers,
      free_fall_environment: data.freeFallEnvironment,
      free_fall_oem: data.freeFallOem,
      free_fall_oem_details: data.freeFallOemDetails,
      free_fall_jet: data.freeFallJet,
    }),
  });

  return response.ok;
}
