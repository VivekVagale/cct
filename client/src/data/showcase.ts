export interface ShowcaseItem {
  id: string;
  title: string;
  /** Only where it is known for certain. Never guessed. */
  vehicle?: string;
  category: string;
  year: string;
  description: string;
  image: string;
  /**
   * Where the sphere takes its square crop from, vertically. 0 top, 1 bottom,
   * omitted means the middle.
   *
   * The discs are circles cut from a square, so a 9:16 export loses 44% of its
   * height before it is even masked. Set this per image rather than
   * re-exporting: a bike low in a reel frame wants about 0.65, a helmet high in
   * one wants about 0.3.
   */
  focusY?: number;
}

/**
 * The sphere's discs — real frames from Project Free Fall, not stock.
 *
 * These replace five Unsplash photographs of other people's motorcycles, which
 * is the last thing a studio selling CAD-accurate rendering should have been
 * showing on the section called Selected Work.
 *
 * There are exactly twelve because the sphere has exactly twelve. The discs sit
 * on the vertices of an icosahedron — `DISC_INSTANCE_COUNT` is
 * `icoGeo.vertices.length`, and that geometry has twelve, unsubdivided — and
 * the assignment is `index % items.length`. Any fewer and images repeat around
 * the back; any more and the extras are never drawn. This list is a fixed
 * length for a geometric reason, so count before adding.
 *
 * The section used to top up its five with three entries borrowed from
 * `projects`. It no longer does: those carry Unsplash imagery of their own, and
 * with twelve real renders there is nothing left to pad with.
 *
 * Sources are 1080x1920 PNGs at ~2.6MB each, re-encoded to 720x1280 WebP —
 * 34MB down to 736KB. The full 9:16 frame is kept rather than a square export
 * so `focusY` still has something to choose from; 720 wide still gives the
 * 512px atlas cell more pixels than it samples.
 *
 * No `vehicle` on any of them. It was filled in from what the frames appeared
 * to show — tank shape, wheel, a badge caught in the light — and only two of
 * the twelve were actually legible. A studio that sells model-accurate work
 * cannot publish a guess at a model name, and the user does not need the line,
 * so the discs read as the shot and the project. The field stays on the type
 * for the day something is known for certain.
 */
export const showcaseItems: ShowcaseItem[] = [
  {
    id: "too-clean",
    title: "Too Clean",
    category: "Project Free Fall",
    year: "2026",
    description:
      "Chrome tank and polished cases against a mountain dusk. Every reflection is calculated — there is no photograph underneath this.",
    image: "/showcase/too-clean.webp",
  },
  {
    id: "spot-on-angles",
    title: "Spot On Angles",
    category: "Project Free Fall",
    year: "2026",
    description:
      "The number board and the fins, lit from behind at the hour the light goes orange and stays there for four minutes.",
    image: "/showcase/spot-on-angles.webp",
  },
  {
    id: "white-beauty",
    title: "White Beauty",
    category: "Project Free Fall",
    year: "2026",
    description:
      "Falling in formation with a flight of fighters. Nothing here was shot, which is the only way this frame exists.",
    image: "/showcase/white-beauty.webp",
  },
  {
    id: "stealth-bombers",
    title: "Sci-Fi Stealth Bombers",
    category: "Project Free Fall",
    year: "2026",
    description:
      "Two flying wings and a twin, all at the same altitude and all built to the same tolerances.",
    image: "/showcase/stealth-bombers.webp",
  },
  {
    id: "braking-power",
    title: "Braking Power",
    category: "Project Free Fall",
    year: "2026",
    description:
      "A disc, a caliper and the drilling through both, close enough that a modelled part has nowhere to hide.",
    image: "/showcase/braking-power.webp",
  },
  {
    id: "batmobile",
    title: "Batmobile",
    category: "Project Free Fall",
    year: "2026",
    description:
      "Filigree over matte black, with the sun coming in low across the tank seam.",
    image: "/showcase/batmobile.webp",
    // The tank sits above the middle of the frame.
    focusY: 0.45,
  },
  {
    id: "tank-decor",
    title: "Tank Decor FTW",
    category: "Project Free Fall",
    year: "2026",
    description:
      "Made Like A Gun, and every sticker over it placed by hand — the decals are geometry, not a texture painted flat.",
    image: "/showcase/tank-decor.webp",
  },
  {
    id: "tibetan-flags",
    title: "Tibetan Flags",
    category: "Project Free Fall",
    year: "2026",
    description:
      "Sand paint under prayer flags, with the front wheel catching the last of the light off the snow.",
    image: "/showcase/tibetan-flags.webp",
    // The bike sits low; the flags own the top of the frame.
    focusY: 0.55,
  },
  {
    id: "it-say-grrr",
    title: "It Say Grrr",
    category: "Project Free Fall",
    year: "2026",
    description:
      "Front three-quarter, blue rim lit from behind the spokes. The flare is rendered, not added afterwards.",
    image: "/showcase/it-say-grrr.webp",
  },
  {
    id: "custom-plates",
    title: "Custom Plates",
    category: "Project Free Fall",
    year: "2026",
    description:
      "CHAOS, standing proud of the plate. Modelled rather than decalled, so it casts and catches its own light.",
    image: "/showcase/custom-plates.webp",
    // The plate is high in the frame.
    focusY: 0.4,
  },
  {
    id: "peak-customisation",
    title: "Peak Customisation",
    category: "Project Free Fall",
    year: "2026",
    description:
      "A saloon at altitude between two fighters, holding its own shadows against the cloud deck.",
    image: "/showcase/peak-customisation.webp",
  },
  {
    id: "chopper-delivery",
    title: "Chopper Delivery",
    category: "Project Free Fall",
    year: "2026",
    description:
      "Slung under a gunship above the weather. The rig is four cables and the physics that go with them.",
    image: "/showcase/chopper-delivery.webp",
  },
];
