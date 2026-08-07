import { useEffect } from "react";

/** How much of a wheel notch is taken per frame. Lower is slower and heavier. */
const GLIDE = 0.18;
/** How fast an overscrolled list returns to its end. */
const RETURN = 0.16;
/** Of a wheel notch pushed past an end, how much becomes rubber. */
const RUBBER = 0.09;
/** How far it will stretch, in pixels, however hard it is pushed. */
const RUBBER_MAX = 64;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/**
 * Smooth, rubber-banded scrolling for one nested list.
 *
 * The colour picker scrolls natively, which on a wheel means the list arrives in
 * hard ~100px steps inside a page whose every other scroll is interpolated — the
 * one place on the site that still jumps. This gives it the same damped feel,
 * and gives its ends something to push against: past the last row the content
 * stretches by a damped fraction of the push and springs back on release.
 *
 * Two things it deliberately does not do.
 *
 * It leaves touch alone. A phone's momentum and its own rubber band are tuned by
 * the platform, and this would be a worse copy of both fighting the real one —
 * the same reason the page's Lenis sets `syncTouch: false`.
 *
 * It is not Lenis. Lenis would smooth this list in three lines, and it has no
 * rubber band at all: it eases toward a clamped scrollTop, so an end is a wall.
 * The bounce is the part that had to be written.
 *
 * The wrapper must hold exactly one child, which is what gets stretched.
 */
export function useBouncyScroll(
  ref: React.RefObject<HTMLElement | null>,
  enabled = true,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const content = el.firstElementChild as HTMLElement | null;
    if (!content) return;

    /** Where the list is heading, which leads where it actually is. */
    let target = el.scrollTop;
    /** Pixels of stretch past an end. Signed: positive is past the top. */
    let rubber = 0;
    let frame = 0;
    let running = false;

    /*
     * How far this list can actually travel, with a couple of pixels of slack
     * treated as none.
     *
     * A range with two colours fits exactly, and "exactly" in a grid of rounded
     * heights means a pixel or two either way. Without the slack a remainder
     * that small still counts as scrollable, and the wheel is then swallowed by
     * a list that has nowhere to go.
     */
    const limit = () => {
      const room = el.scrollHeight - el.clientHeight;
      return room > 2 ? room : 0;
    };

    const tick = () => {
      el.scrollTop += (target - el.scrollTop) * GLIDE;
      rubber += -rubber * RETURN;
      content.style.transform = `translate3d(0, ${rubber.toFixed(2)}px, 0)`;

      if (Math.abs(target - el.scrollTop) < 0.5 && Math.abs(rubber) < 0.15) {
        el.scrollTop = target;
        rubber = 0;
        content.style.transform = "";
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      const max = limit();
      // Nothing to scroll — a range with two colours. Leave the event alone
      // rather than swallow it into a list that cannot move.
      if (max <= 0) return;
      e.preventDefault();

      const pushingPast =
        (e.deltaY < 0 && target <= 0) || (e.deltaY > 0 && target >= max);

      if (pushingPast) {
        rubber = clamp(rubber - e.deltaY * RUBBER, -RUBBER_MAX, RUBBER_MAX);
      } else {
        target = clamp(target + e.deltaY, 0, max);
      }
      start();
    };

    /*
     * A scroll this hook did not cause — a keyboard, a scrollbar drag, or the
     * browser bringing a focused card into view. Without this the next wheel
     * event would resume from wherever the animation last was and jump back.
     */
    const onScroll = () => {
      if (!running) target = el.scrollTop;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      content.style.transform = "";
    };
  }, [ref, enabled]);
}
