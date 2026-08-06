import { useEffect } from "react";

/**
 * Reveals every section's staged content as it comes into view.
 *
 * The sections already mark themselves up for this: `.scene-heading` on the
 * block that leads, `.scene-body` on the block that follows it. That marking
 * was written for the deck, where the timing came from the scene's own clock —
 * a fixed delay after the scene arrived. In a document there is no such clock,
 * and those delays would fire on page load for all eleven sections at once,
 * so everything below the fold would have finished entering before anyone
 * scrolled to it.
 *
 * So the same markers get a scroll trigger instead. One observer for the whole
 * page, elements unobserved the moment they have played, and the observer
 * disconnected when the last one has — no listener outlives its purpose.
 *
 * Transform and opacity only, both compositor properties. Nothing here touches
 * height, margin or top, which would put a layout pass in the middle of a
 * scroll.
 */
export function useScrollReveals(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return;

    const targets = new Set<Element>();
    const collect = () => {
      document
        .querySelectorAll(".scene-heading, .scene-body > *")
        .forEach((el) => {
          if (!el.classList.contains("reveal-in")) {
            el.classList.add("reveal-pending");
            targets.add(el);
          }
        });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("reveal-in");
          observer.unobserve(entry.target);
          targets.delete(entry.target);
        }
        if (targets.size === 0) observer.disconnect();
      },
      {
        /* A quarter of the element, and a margin that starts it just before it
           reaches the fold — content that begins moving only once it is fully
           on screen has already been read by the time it settles. */
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    collect();
    targets.forEach((el) => observer.observe(el));

    /* Sections mount as the page is built — the sphere waits for its section to
       be near, the booking form re-renders as it is filled in. One later sweep
       catches anything that appeared after the first pass. */
    const late = window.setTimeout(() => {
      const before = targets.size;
      collect();
      if (targets.size !== before) targets.forEach((el) => observer.observe(el));
    }, 1200);

    return () => {
      window.clearTimeout(late);
      observer.disconnect();
    };
  }, [enabled]);
}
