import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HERO_SEQUENCE, HERO_SEQUENCE_MOBILE } from "@/data/heroSequence";

/**
 * Must stay identical to the Hero's own `PORTRAIT_QUERY`. Preloading the
 * landscape frames for a phone would warm 2.6x the bytes of the set that is
 * actually about to be drawn, and leave the real ones still arriving.
 */
const PORTRAIT_QUERY = "(orientation: portrait) and (max-width: 900px)";

/**
 * The curtain the site opens behind.
 *
 * This exists for one reason, and it is not decoration. The hero is a 298-frame
 * image sequence scrubbed by scroll: land on the page, scroll immediately, and
 * the assembly stutters through whichever frames happen to have arrived. The
 * fix is not to make the frames load faster — they are already WebP and already
 * budgeted — it is to not start the story until enough of it exists to be told.
 *
 * So the curtain holds while the opening frames are fetched, and it reports
 * honestly on that fetch rather than animating a fake bar to 90% and waiting.
 * The count is real: one image resolved is one image counted.
 *
 * What it deliberately does *not* wait for: the sphere's twelve renders, the
 * geojson, the rest of the sequence. Those are wanted later and are already
 * being fetched at idle priority behind this. A loading screen that waits for
 * the whole site is a loading screen someone leaves.
 */

/** How many frames of the opening have to exist before the story can start. */
const CRITICAL_FRAMES = 48;

/**
 * The shortest time the curtain is allowed to be up, in ms.
 *
 * On a fast connection the frames are there almost at once, and a curtain that
 * appears and vanishes inside 200ms reads as a flash of broken page rather than
 * as an opening. If it is going to be seen at all it should look intended.
 */
const MIN_VISIBLE_MS = 900;

export function Preloader({ onDone }: { onDone: () => void }) {
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(true);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const startedAt = performance.now();
    let live = true;

    const sequence = window.matchMedia(PORTRAIT_QUERY).matches
      ? HERO_SEQUENCE_MOBILE
      : HERO_SEQUENCE;
    const frames = Array.from(
      { length: Math.min(CRITICAL_FRAMES, sequence.count) },
      (_, i) => sequence.srcFor(i),
    );

    let loaded = 0;
    const total = frames.length + 1; // + the fonts

    const tick = () => {
      loaded += 1;
      if (live) setProgress(loaded / total);
    };

    const settle = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        // The first frames are the page. Everything else on this document is
        // explicitly low priority, so say so here too rather than leaving them
        // to compete as equals.
        img.fetchPriority = "high";
        img.onload = img.onerror = () => resolve();
        img.src = src;
      }).then(tick);

    const fonts = (document.fonts?.ready ?? Promise.resolve()).then(tick);

    Promise.all([...frames.map(settle), fonts]).then(() => {
      if (!live) return;
      const held = performance.now() - startedAt;
      window.setTimeout(
        () => {
          if (!live) return;
          setOpen(false);
          doneRef.current();
        },
        Math.max(0, MIN_VISIBLE_MS - held),
      );
    });

    return () => {
      live = false;
    };
  }, []);

  const pct = Math.round(progress * 100);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] bg-[#05070A] flex flex-col items-center justify-center gap-8 px-8"
          // Lifts away rather than dissolving in place. The page underneath is
          // already assembled and already still; a curtain that fades reveals a
          // frozen image, where one that moves hands the motion over.
          exit={
            reduceMotion
              ? { opacity: 0, transition: { duration: 0.3 } }
              : {
                  y: "-100%",
                  transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] },
                }
          }
          aria-live="polite"
          aria-label={`Loading, ${pct} percent`}
        >
          <div className="w-full max-w-[420px]">
            <div className="flex items-baseline justify-between mb-5">
              <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#B8C4D6]/70">
                Cold Chain Theory
              </span>
              <span className="font-display text-3xl sm:text-5xl text-[#F5F7FA] [font-variant-numeric:tabular-nums]">
                {pct}
              </span>
            </div>

            {/* One hairline, filling. The brand violet, because this is the
                first thing anyone sees and it should be the site's colour and
                not a default blue. */}
            <div className="h-px w-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full origin-left bg-[var(--brand,#7A44E0)]"
                style={{ scaleX: progress }}
                transition={{ duration: 0.2, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
