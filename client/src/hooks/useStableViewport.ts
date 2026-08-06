import { useEffect, useRef, useState } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";

/**
 * A viewport height that browser chrome cannot move.
 *
 * `vh` is not a constant on a phone. A mobile browser re-resolves it whenever
 * the layout viewport changes, and two ordinary things change it: the URL bar
 * sliding in on an upward scroll, and the soft keyboard opening under a form
 * field. Anything sized in `vh` therefore changes height while the visitor is
 * reading, and on this page that was catastrophic rather than cosmetic — the
 * hero is 692vh tall on a phone, about 4,800px, so a keyboard that takes 300px
 * of a 700px viewport took roughly 2,000px out of the document. The scroll
 * position stays where it was while the page shortens underneath it, which
 * lands the reader most of a section further down: type your name into the
 * booking form and the page jumps to the reviews.
 *
 * So the height is captured in pixels and held. It is re-taken only when the
 * width changes as well, which is a rotation or a real resize — never for a
 * height-only change, which on a touch device is always chrome.
 *
 * The width test is skipped on a fine pointer: a desktop window is dragged to
 * arbitrary heights on purpose and has no chrome that comes and goes, so there
 * every resize is genuine and is taken.
 */
export function useStableViewportHeight() {
  const [height, setHeight] = useState(() =>
    typeof window === "undefined" ? 0 : window.innerHeight,
  );

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let width = window.innerWidth;

    /*
     * Held from the first scroll, not from mount.
     *
     * Freezing at mount froze whatever the first frame happened to report, and
     * the first frame is the least trustworthy one there is — the viewport is
     * still settling, and a value taken 50ms early was measured 6% short and
     * then kept for the life of the page. Nothing that makes a mobile viewport
     * change height can happen before the reader scrolls: the URL bar only
     * retracts on a scroll, and the keyboard needs a field that is far below
     * the fold. So every resize before the first scroll is layout settling and
     * is taken, and every height-only resize after it is chrome and is not.
     *
     * Landing deep in the page — a reload partway down, or an anchor — skips
     * the grace period, since the scroll that would have ended it already
     * happened.
     */
    let settled = window.scrollY > 0;
    const freeze = () => {
      settled = true;
    };
    window.addEventListener("scroll", freeze, { passive: true, once: true });

    const sync = () => {
      const nextWidth = window.innerWidth;
      const heightOnly = nextWidth === width;
      width = nextWidth;
      if (coarse && heightOnly && settled) return;
      setHeight(window.innerHeight);
    };

    window.addEventListener("resize", sync);
    /* Fires on devices that rotate without reporting a resize first, and is
       harmless where the resize already covered it — sync is idempotent. */
    window.addEventListener("orientationchange", sync);
    return () => {
      window.removeEventListener("scroll", freeze);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, []);

  return height;
}

/**
 * How far a pinned section has been scrolled through, 0 to 1, measured against
 * a viewport height that does not move.
 *
 * framer's `useScroll` with `offset: ["start start", "end end"]` divides by
 * `sectionHeight - window.innerHeight`, read live. That denominator changes the
 * moment the URL bar slides, so the same scroll position maps to a different
 * progress before and after — and the bar slides in precisely when the reader
 * scrolls up. On the hero that arrives as the frame index jumping several
 * frames backwards mid-gesture, which is the "glitches when I scroll up" this
 * replaces. Freezing the section's height alone is not enough; the divisor has
 * to be frozen with it, which means doing this arithmetic here rather than
 * asking framer for it.
 *
 * The semantics are otherwise framer's exactly: 0 when the section's top meets
 * the viewport top, 1 when its bottom meets the viewport bottom — which is the
 * moment a `sticky top-0` child stops being pinned.
 */
export function useStableScrollProgress(
  ref: React.RefObject<HTMLElement | null>,
  viewportHeight: number,
): MotionValue<number> {
  const progress = useMotionValue(0);
  // Read inside the listeners without making them a dependency, so scrolling
  // never re-subscribes.
  const viewportRef = useRef(viewportHeight);
  viewportRef.current = viewportHeight;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let top = 0;
    let span = 1;

    const measure = () => {
      top = el.getBoundingClientRect().top + window.scrollY;
      // Never zero: a section shorter than the viewport would divide by nothing
      // and report Infinity, which framer would happily carry into a transform.
      span = Math.max(1, el.offsetHeight - viewportRef.current);
    };

    const update = () => {
      const raw = (window.scrollY - top) / span;
      progress.set(raw < 0 ? 0 : raw > 1 ? 1 : raw);
    };

    const remeasure = () => {
      measure();
      update();
    };

    remeasure();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", remeasure);
    /* The section's own height is set from the frozen viewport, so it changes
       when that does — and everything above it settles as images arrive, which
       moves `top` without either a scroll or a resize. */
    const observer = new ResizeObserver(remeasure);
    observer.observe(el);
    observer.observe(document.documentElement);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", remeasure);
      observer.disconnect();
    };
  }, [ref, progress, viewportHeight]);

  return progress;
}
