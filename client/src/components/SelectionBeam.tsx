import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { BorderBeam } from "border-beam";
import { BEAM_REST, type BeamMotion } from "./beamMotion";

/**
 * The beam a chosen control wears, so "chosen" looks the same everywhere.
 *
 * `selected-glow` was already doing that job — one violet ring and bloom shared
 * by the chips, the machine cards, the colour cards and the build cards, put in
 * one place precisely because each surface had been drawing its own. This is the
 * same idea for the beam.
 *
 * Two states, not three. It lights when the thing is chosen, and it is dark
 * otherwise.
 *
 * It used to lift under the pointer as well, and that came out because it made
 * the desktop feel heavy to move around. The cost was never the beam that was
 * lit — it was the eighty-odd that were not. Every wrapper carried `mouseenter`,
 * `mouseleave`, `focusin` and `focusout`, so sweeping a pointer across a
 * sixty-four card grid meant a React state change and three to six fresh
 * animations for each card the cursor happened to cross, on top of the tilt
 * springs those cards already run. Almost none of it survived long enough to be
 * seen.
 *
 * So there are no listeners here at all now, and nothing to attach on mount.
 * A chosen thing lights, and choosing is a click.
 */
export function SelectionBeam({
  selected,
  rest = BEAM_REST,
  className,
  children,
}: {
  selected: boolean;
  /**
   * What the lit state looks like, for a control the default is wrong for.
   *
   * A beam's light is spread along a perimeter, so the same numbers give a small
   * control far less of it than a card. The marque chips pass
   * `BEAM_REST_STRONG` for that reason.
   */
  rest?: BeamMotion;
  /** Layout classes for the wrapper, which becomes the element in the grid. */
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  /*
   * The corner radius, measured and clamped.
   *
   * Auto-detection reads the child's `border-radius` literally, and Tailwind v4's
   * `rounded-full` is `calc(infinity * 1px)` — 24,403,200px, which drew two
   * crescents either side of a chip instead of a pill. Clamping to half the
   * height is the rule that covers both cases: a pill resolves to its true
   * radius, and an ordinary `rounded-sm` card keeps its own small one.
   */
  const [radius, setRadius] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const child = el?.firstElementChild;
    if (!el || !child) return;
    const measure = () => {
      /* `offsetHeight`, not a bounding rect. Machine cards sit inside a box that
         rotates in 3D under the pointer, and a rect is transform-aware — it
         would report the tilted card as taller and hand the beam a radius that
         changes as the cursor moves. The layout height does not move. */
      const height = (child as HTMLElement).offsetHeight;
      if (height <= 0) return;
      const declared = parseFloat(
        getComputedStyle(child).borderTopLeftRadius || "0",
      );
      const safe = Number.isFinite(declared) ? declared : 0;
      setRadius(Math.min(safe, height / 2));
    };
    measure();
    /* Cards reflow and rows rewrap; a stale radius brings the artefact back. */
    const observer = new ResizeObserver(measure);
    observer.observe(child);
    return () => observer.disconnect();
  }, []);

  const ready = radius !== null;
  const lit = selected && ready;

  return (
    <BorderBeam
      ref={ref}
      size="md"
      colorVariant="colorful"
      brightness={1.3}
      duration={rest.duration}
      saturation={rest.saturation}
      /* Nothing shown before the radius is known, so the artefact never gets a
         frame to appear in. */
      strength={lit ? rest.strength : 0}
      active={lit}
      {...(ready ? { borderRadius: radius } : {})}
      className={className}
    >
      {children}
    </BorderBeam>
  );
}
