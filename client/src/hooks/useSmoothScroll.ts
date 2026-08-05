import { useEffect } from "react";
import Lenis from "lenis";

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
     * Anchors, by hand.
     *
     * The nav's links are ordinary `href="#about"`. Left alone the browser
     * jumps the scroll position itself, Lenis sees a position it did not
     * produce, and the two argue for a frame or two — which lands as a flick
     * in the middle of an otherwise slow page. Routed through `scrollTo`, the
     * jump becomes the same eased move as every other scroll on the page.
     */
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, {
        // Long, and eased out hard. This is the one move on the page the
        // visitor did not make themselves, so it has to read as the camera
        // travelling rather than as a cut.
        duration: 1.6,
        easing: (t) => 1 - (1 - t) ** 3,
        // The bar is fixed and 64-80px tall; without this the section's own
        // first line lands underneath it.
        offset: -72,
      });
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
