/**
 * The light a Free Fall build is set in.
 *
 * Nine of them now, where there were two placeholders, and no surcharge on any
 * -- this is a look, not an extra, and the line under the jets grid still
 * prices only stickers, OEM parts and the jet. It is a thumbnail picker
 * rather than a row of chips because "bright" and "dark" describe a sky badly,
 * and the client is choosing between photographs.
 *
 * Same `image?` shape as `Jet` for the same reason: an option with no frame
 * yet draws `PendingRender` rather than standing in something that is not the
 * studio's work. All nine have one, so nothing draws it today.
 *
 * The swatch is the frame's own average colour, measured rather than picked --
 * a dot chosen by eye would be someone's idea of what "Coral Horizon" ought to
 * look like, and the point of the dot is to say what it does look like.
 */
export interface Environment {
  id: string;
  name: string;
  hint?: string;
  image?: string;
  /* The dot in the caption bar, the way a colourway carries one. */
  swatch: string;
  /**
   * What the dialog opens on. Exactly one entry carries it.
   *
   * There was no flag here while there were two of these and the dialog took
   * `environments[0]`. With nine, the default is a choice rather than a
   * consequence of the order, and it should survive someone sorting the list.
   */
  isDefault?: boolean;
}

/* Default first, then alphabetical, as in `jets.ts`. White Clouds leads
   because it is the plainest daylight of the nine and the closest thing to
   the "Bright" this list used to open on: a client who opens the brief,
   changes nothing and closes it gets an ordinary sky rather than someone
   else's idea of a dramatic one. */
export const environments: Environment[] = [
  {
    id: "white-clouds",
    name: "White Clouds",
    image: "/environments/white-clouds.webp",
    swatch: "#C2C5C8",
    isDefault: true,
  },
  {
    id: "aerial-mountains",
    name: "Aerial Mountains",
    image: "/environments/aerial-mountains.webp",
    swatch: "#AC968E",
  },
  {
    id: "aurora-evening",
    name: "Aurora Evening",
    image: "/environments/aurora-evening.webp",
    swatch: "#949BAF",
  },
  {
    id: "celestial-dream",
    name: "Celestial Dream",
    image: "/environments/celestial-dream.webp",
    swatch: "#657A85",
  },
  {
    id: "coral-horizon",
    name: "Coral Horizon",
    image: "/environments/coral-horizon.webp",
    swatch: "#F08264",
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    image: "/environments/golden-hour.webp",
    swatch: "#D9AC77",
  },
  {
    id: "late-afternoon",
    name: "Late Afternoon",
    image: "/environments/late-afternoon.webp",
    swatch: "#E7E0D2",
  },
  {
    id: "lilac-haze",
    name: "Lilac Haze",
    image: "/environments/lilac-haze.webp",
    swatch: "#A88595",
  },
  {
    id: "warm-clouds",
    name: "Warm Clouds",
    image: "/environments/warm-clouds.webp",
    swatch: "#C4B592",
  },
];

/** The entry the dialog opens on, resolved the way `defaultJet` is. */
export const defaultEnvironment =
  environments.find((environment) => environment.isDefault) ?? environments[0];
