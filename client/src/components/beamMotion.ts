import { useCallback, useLayoutEffect, useRef } from "react";

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

/**
 * Carries the beam's position across a change of speed.
 *
 * A CSS animation keeps its *elapsed time* when `animation-duration` changes,
 * not its progress. Half a second into a 3s pass is a fifth of the way round;
 * the moment the duration becomes 1.2s that same half second is reinterpreted as
 * five twelfths, and the beam jumps there. Every hover and every unhover moved
 * it, which reads as the effect restarting rather than speeding up.
 *
 * So: read how far round each animation is *before* React re-renders, then put
 * it back at the same fraction of the new duration afterwards. The animation
 * itself never restarts — the package keys its keyframe names off a stable
 * `useId`, so only the duration changes underneath a running animation, which is
 * exactly the case this can repair.
 *
 * `capture` has to run in the event handler rather than in an effect. Effects
 * fire after commit, by which time the old duration is gone and the progress it
 * described is unrecoverable.
 */
export function useBeamPhase(lit: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useRef(new Map<string, number>());

  /* Name plus pseudo-element: the beam runs several animations at once, some of
     them on ::before and ::after, and they are at different points in their own
     cycles. Keyed only by name, the two pseudo-elements would overwrite each
     other and land on one another's phase. */
  const keyOf = (a: Animation) => {
    const effect = a.effect as KeyframeEffect | null;
    const name = (a as unknown as { animationName?: string }).animationName ?? "";
    return `${name}|${effect?.pseudoElement ?? ""}`;
  };

  const secondsOf = (a: Animation) => {
    const d = a.effect?.getTiming().duration;
    return typeof d === "number" && d > 0 ? d : null;
  };

  const capture = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    phase.current.clear();
    for (const a of el.getAnimations({ subtree: true })) {
      const total = secondsOf(a);
      const now = Number(a.currentTime);
      if (total === null || Number.isNaN(now)) continue;
      /* Modulo because these loop: at 7.5s into a 3s pass the fraction that
         matters is the 0.5 of the current lap, not 2.5 laps' worth. */
      phase.current.set(keyOf(a), (now % total) / total);
    }
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || phase.current.size === 0) return;
    for (const a of el.getAnimations({ subtree: true })) {
      const fraction = phase.current.get(keyOf(a));
      const total = secondsOf(a);
      if (fraction === undefined || total === null) continue;
      try {
        a.currentTime = fraction * total;
      } catch {
        /* A finished or otherwise unsettable animation is not worth failing a
           hover over — it simply keeps whatever phase it had. */
      }
    }
  }, [lit]);

  return { ref, capture };
}
