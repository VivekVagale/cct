import { useEffect } from "react";
import type { MotionValue } from "framer-motion";
import Lenis from "lenis";

/**
 * Snap a spring across a discontinuity in what it is following.
 *
 * A spring cannot tell a teleport from a very fast scroll: handed a target a
 * whole page away it travels there, which on the hero's frame index is the
 * assembly playing backwards for a second after a click that was supposed to be
 * a cut.
 *
 * This watches the source for a step no scroll could produce. A wheel or a
 * touch moves a section's progress by a fraction of a percent per event; an
 * anchor jump moves it by most of its range at once. Anything past the
 * threshold is a position the reader was carried to rather than scrolled
 * through, so the spring is placed there instead of sent there.
 *
 * Written against the source rather than against the click, which is where this
 * started and why it did not work. `lenis.scrollTo` sets the position
 * synchronously but the scroll event that updates the source is dispatched
 * afterwards, so a snap fired from the click handler read the value the page
 * was leaving and pinned the spring to that — and the real change arrived a
 * moment later with nothing left to catch it. A discontinuity cannot be
 * mistimed: it is observed in the value itself, whenever it happens to move.
 *
 * `jump` rather than `set`: it stops the running animation outright, where
 * `set` would leave the spring travelling to the same place from a standstill.
 */
export function useSnapOnScrollJump(
  spring: MotionValue<number>,
  source: MotionValue<number>,
  threshold = 0.2,
) {
  useEffect(() => {
    let previous = source.get();
    return source.on("change", (value) => {
      const step = Math.abs(value - previous);
      previous = value;
      if (step > threshold) spring.jump(value);
    });
  }, [spring, source, threshold]);
}

/**
 * Inertial scrolling for the whole document.
 *
 * The page is a scroll-driven film — a 298-frame sequence, three pinned
 * sections, a dozen scroll-linked reveals — and all of it was being played by
 * the operating system's scroll, which arrives in hard ~100px steps from a
 * wheel notch. Every animation on the page was smooth and the thing driving
 * them was not, which is what made a page full of motion feel static: the
 * camera jumped, so the film jumped.
 *
 * Lenis interpolates the real scroll position rather than transforming a
 * container, which is the property that matters here. Everything already
 * built keeps working untouched — `position: sticky` still pins, framer's
 * `useScroll` still reads the same numbers, anchors still resolve — because
 * from the page's point of view this is just a scroll that moves in small
 * steps instead of large ones.
 *
 * Notes for whoever tunes this:
 *
 * - `lerp` is the whole feel. 0.08 is slow and heavy, which is the brief;
 *   above ~0.15 it stops reading as a camera and starts reading as lag.
 * - The rAF loop is ours rather than Lenis's own, so it stops when the tab is
 *   hidden. Both WebGL loops on this page already do the same.
 * - `html { scroll-behavior: smooth }` had to go from index.css. It and Lenis
 *   are two smooth-scroll implementations fighting over the same property, and
 *   the native one wins the anchor jumps and stutters against the interpolated
 *   position for the rest.
 */
export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      // Heavy and slow. The default 0.1 is a website; this is closer to a
      // camera dolly, which is what the hero's scrub and the pinned sections
      // are already pretending to be.
      lerp: 0.08,
      // A notch moves less than the OS would give it. The sequence spends
      // ~20px of scroll per frame, so a smaller step is more frames per notch
      // rather than fewer — the animation plays instead of flicking past.
      wheelMultiplier: 0.9,
      // Touch is left alone. A phone's own momentum is tuned by the platform
      // and fighting it reads as the page being broken, not as it being smooth.
      smoothWheel: true,
      syncTouch: false,
    });

    let frame = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    /*
     * Anchors, by hand — and as a cut, not a move.
     *
     * These used to travel: 1.6s, eased out hard, on the theory that the one
     * move the visitor did not make themselves should read as the camera
     * travelling. It reads as lag instead, and the reason is what the travel
     * passes through. Every section between here and there enters the viewport
     * on the way past, so its reveal fires — a dozen sections' worth of
     * transitions starting and finishing inside 1.6 seconds, while the hero's
     * frame scrub runs its whole assembly backwards or forwards underneath
     * them. The page is not slow at it; it is doing far too much, and all of it
     * is work nobody asked to see. Clicking "Start a Project" is a request to
     * be at the form.
     *
     * So it cuts. Sections that were skipped are left unrevealed and play
     * properly when they are actually scrolled to, which is what their observer
     * was for.
     *
     * Still routed through Lenis rather than left to the browser: Lenis holds
     * its own interpolated position, and a scroll it did not perform is a
     * position it will argue with on the next wheel event.
     */
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      /* No offset. Lenis already subtracts the target's own scroll-margin-top
         when it is given an element, so the -72 this used to pass was applied
         on top of the scroll-mt-16/20 the sections carry — a click landed 136
         to 152px clear of a section that had asked for 64 or 80, and sections
         without the utility got a different number again. The clearance is
         decided once, in CSS, where the browser's own anchor jump reads it too:
         see the section[id] rule in index.css. */
      /* Nothing is announced here. Springs that scrub on scroll notice the jump
         themselves, by the size of the step it puts in their source — see
         useSnapOnScrollJump, and the note there about why announcing it from
         this handler could not work. */
      lenis.scrollTo(target as HTMLElement, { immediate: true });
      /* The hash the click would have set, without the history entry a real
         navigation would leave — going "back" to a scroll position the page no
         longer holds is worse than not offering it. */
      if (window.location.hash !== href) {
        window.history.replaceState(null, "", href);
      }
    };

    document.addEventListener("click", onClick);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
      } else {
        frame = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [enabled]);
}
