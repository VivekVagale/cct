/**
 * How the beam behaves at rest and under a pointer, for every control wearing one.
 *
 * One place because there are two of them — the search bar and the primary
 * button — and they sit on the same screen. Two controls in one family idling at
 * different speeds or different colour reads as a bug rather than a hierarchy,
 * and numbers copied into two files do not stay equal for long.
 *
 * The presets' own defaults were the starting point and are deliberately not
 * kept: `line` idles at 2.4s and `md` at 1.96s, which are tuned per shape rather
 * than per feel, and the faster of the two was busy enough at rest to pull the
 * eye off the grid it sits above.
 */
export interface BeamMotion {
  /** Opacity of beam, glow and bloom together. Tops out at 1. */
  strength: number;
  /** Seconds for one pass, so smaller is faster. */
  duration: number;
  /**
   * Colour saturation multiplier.
   *
   * This rather than `brightness`, which multiplies every channel at once and
   * walks the colour toward white — louder and less itself at the same time.
   * Saturation pulls away from grey instead, which is what "more" looks like on
   * a rainbow beam.
   */
  saturation: number;
}

/** Idling: slow, and desaturated enough to sit behind the content. */
export const BEAM_REST: BeamMotion = {
  strength: 0.7,
  duration: 3,
  saturation: 0.9,
};

/** Hovered or focused: quicker and richer, both at once. */
export const BEAM_LIT: BeamMotion = {
  strength: 1,
  duration: 1.2,
  saturation: 2.8,
};
