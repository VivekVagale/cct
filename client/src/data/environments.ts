/**
 * The light a Free Fall build is set in.
 *
 * Two of them, and no surcharge on either -- this is a look, not an extra.
 * It is a thumbnail picker rather than a pair of chips because the words
 * "bright" and "dark" describe a photograph badly, and the client is choosing
 * between two photographs.
 *
 * Same `image?` shape as `Jet` for the same reason: the frames are not shot
 * yet, and until they are the card draws `PendingRender` instead of standing
 * in something that is not the studio's work.
 */
export interface Environment {
  id: string;
  name: string;
  hint?: string;
  image?: string;
  /* The dot in the caption bar, the way a colourway carries one. Light and
     dark is exactly the kind of choice a swatch says faster than a word. */
  swatch: string;
}

export const environments: Environment[] = [
  {
    id: "bright",
    name: "Bright",
    hint: "Daylight, open sky",
    swatch: "#E4E9F0",
  },
  {
    id: "dark",
    name: "Dark",
    hint: "Night, low key",
    swatch: "#14161A",
  },
];
