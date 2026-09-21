import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { BorderBeam } from "border-beam";
import { BEAM_LIT, BEAM_REST } from "./beamMotion";

/**
 * Whether there is a pointer that can rest on something without committing.
 *
 * The same question `useTilt` asks, for the same reason it asks it. A tap emits
 * compatibility mouse events — `mouseover`, `mousemove`, `mouseup` — with no
 * `mouseleave` behind them, so the lift fires on touch and then never unfires.
 * Measured on a phone viewport: tapping a card took it to full strength and it
 * was still there afterwards, on a card the visitor had already moved past.
 *
 * Focus goes with it. A tap focuses the button it lands on and leaves it
 * focused, so `focusin` sticks in exactly the same way — and every control here
 * already carries its own `focus-visible` ring, which is the part a keyboard
 * actually needs.
 *
 * What remains on touch is the chosen thing's own beam, which is the half that
 * was never about the pointer.
 *
 * Read once at module scope: a grid renders sixty-four of these and a phone does
 * not grow a mouse mid-session.
 */
const CAN_HOVER =
  typeof window === "undefined" ||
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * The beam every selectable control wears, so "chosen" looks the same everywhere.
 *
 * `selected-glow` was already doing that job — one violet ring and bloom shared
 * by the chips, the machine cards, the colour cards and the build cards, put in
 * one place precisely because each surface had been drawing its own. This is the
 * same idea for the beam: four copies of the state, the measuring and the props
 * would not stay equal, and the drift would show as one card lighting differently
 * from the one beside it.
 *
 * Three states, matching the search bar and the primary button:
 *
 *   plain        no beam, no animation, nothing running
 *   chosen       a beam idling at rest speed
 *   under the    the lift — quicker and more saturated
 *   pointer
 */
export function SelectionBeam({
  selected,
  interactive = true,
  className,
  children,
}: {
  selected: boolean;
  /**
   * Whether the pointer should lift it.
   *
   * `false` for anything that only reports a choice rather than offering one —
   * the booking form's summary of the chosen machine is a receipt, and a panel
   * that brightens under the cursor claims to be clickable when it is not.
   * It still carries the idling beam, because it is still showing a chosen
   * thing.
   */
  interactive?: boolean;
  /** Layout classes for the wrapper, which becomes the element in the grid. */
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const lit = hovered || focused;
  const shown = lit || selected;

  /*
   * Listeners attached rather than passed.
   *
   * BorderBeam's props type extends HTMLAttributes but it does not spread the
   * unrecognised ones onto its root, so handlers given to it never fire — and a
   * wrapper div inside it is worse, because it reads its corner radius off its
   * first child and would measure the wrapper instead of the control. Attaching
   * to the root through the ref avoids both.
   *
   * `focusin`/`focusout` rather than `focus`/`blur`: the native pair does not
   * bubble, and the thing taking focus is a button or a hidden radio inside.
   */
  useEffect(() => {
    const el = ref.current;
    if (!el || !interactive || !CAN_HOVER) return;
    const on = () => setHovered(true);
    const off = () => setHovered(false);
    const fin = () => setFocused(true);
    const fout = () => setFocused(false);
    el.addEventListener("mouseenter", on);
    el.addEventListener("mouseleave", off);
    el.addEventListener("focusin", fin);
    el.addEventListener("focusout", fout);
    return () => {
      el.removeEventListener("mouseenter", on);
      el.removeEventListener("mouseleave", off);
      el.removeEventListener("focusin", fin);
      el.removeEventListener("focusout", fout);
    };
  }, [interactive]);

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

  return (
    <BorderBeam
      ref={ref}
      size="md"
      colorVariant="colorful"
      brightness={1.3}
      duration={lit ? BEAM_LIT.duration : BEAM_REST.duration}
      saturation={lit ? BEAM_LIT.saturation : BEAM_REST.saturation}
      /* Nothing shown before the radius is known, so the artefact never gets a
         frame to appear in. */
      strength={!ready ? 0 : lit ? BEAM_LIT.strength : shown ? BEAM_REST.strength : 0}
      active={shown && ready}
      {...(ready ? { borderRadius: radius } : {})}
      className={className}
    >
      {children}
    </BorderBeam>
  );
}
