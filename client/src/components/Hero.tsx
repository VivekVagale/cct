import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { ScrollImageSequence } from "@/components/ui/ScrollImageSequence";
import { Magnet } from "@/components/Magnet";
import { HERO_SEQUENCE } from "@/data/heroSequence";

/** Scroll position at which the assembly finishes and the mascot comes alive. */
const ALIVE_AT = 0.8;

/**
 * The mascot is the Hero — not an image beside the copy. The sequence is
 * absolutely positioned across the whole pinned stage and the copy floats over
 * the top. Nothing sits in a card, a column, or a wrapper that would constrain
 * the composition.
 *
 * The section is taller than the viewport so its inner stage can stay pinned
 * while the extra height is consumed scrubbing the sequence. When that budget
 * runs out the next section scrolls up and covers it naturally.
 *
 * The frames ship with their original backdrop rather than keyed transparent.
 * The character's black clothing meets that backdrop with no edge between them,
 * so any matte there is guesswork — it left fringing and a visible frame
 * rectangle over the starfield. Keeping the backdrop and fading the starfield
 * up once the assembly finishes sidesteps the problem instead of approximating
 * a solution to it.
 *
 * There is deliberately no swap to a separate "live mascot" image at the end.
 * The final frame of the sequence already is the assembled character, and the
 * static poses are a different render — different head angle, rim light and
 * framing — so crossfading to one would read as a pop. Instead the canvas
 * itself starts breathing once the assembly completes, which makes the
 * transition invisible by never making one.
 */
export function Hero({ galaxyOpacity }: { galaxyOpacity: MotionValue<number> }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [alive, setAlive] = useState(false);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v >= ALIVE_AT;
    setAlive((prev) => (prev === next ? prev : next));
  });

  // The sequence consumes most of the pin; the tail is the exit.
  const rawSeq = useTransform(scrollYProgress, [0, ALIVE_AT], [0, 1]);
  // A light spring smooths the scroll input without lag you can feel. It only
  // shapes which frame gets chosen — nothing seeks, so unlike the old video
  // scrub there is no decode cost to smoothing here.
  const sequenceProgress = useSpring(rawSeq, {
    stiffness: 220,
    damping: 40,
    mass: 0.35,
    restDelta: 0.0005,
  });

  // Cursor parallax, applied to the whole stage so the character drifts as one
  // rather than sliding around inside a box.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const parallaxX = useSpring(pointerX, { stiffness: 60, damping: 20, mass: 0.6 });
  const parallaxY = useSpring(pointerY, { stiffness: 60, damping: 20, mass: 0.6 });

  const handlePointer = (e: React.MouseEvent) => {
    pointerX.set((e.clientX / window.innerWidth - 0.5) * 22);
    pointerY.set((e.clientY / window.innerHeight - 0.5) * 14);
  };

  const copyOpacity = useTransform(scrollYProgress, [0, 0.06, 0.34, 0.46], [0, 1, 1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 0.46], ["0vh", "-6vh"]);
  const ctaOpacity = useTransform(scrollYProgress, [ALIVE_AT, 0.92], [0, 1]);

  // The starfield is hidden behind the opaque frames for most of the pin, then
  // fades up as the assembly finishes so the two backgrounds meet without a cut.
  // Written straight to a MotionValue the App reads — routing it through state
  // would re-render the Hero on every scroll tick.
  const galaxyReveal = useTransform(scrollYProgress, [ALIVE_AT - 0.08, 0.98], [0, 1]);
  useMotionValueEvent(galaxyReveal, "change", (v) => galaxyOpacity.set(v));

  return (
    <section id="top" ref={wrapperRef} className="relative h-[520vh] pointer-events-auto">
      <div
        onMouseMove={handlePointer}
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
      >
        {/* Overscanned past the viewport on every side: the frames are opaque,
            so any parallax or breathing on an exactly-viewport-sized canvas
            would drag its edge into view. */}
        <motion.div
          style={{ x: parallaxX, y: parallaxY }}
          className="absolute -inset-[5%]"
        >
          {/* Once assembled, the same canvas breathes in place — no image swap,
              so there is nothing to pop. Scale only, for the same reason. */}
          <motion.div
            className="absolute inset-0"
            animate={alive ? { scale: [1, 1.015, 1] } : { scale: 1 }}
            transition={
              alive
                ? { duration: 6, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
            }
          >
            <ScrollImageSequence
              count={HERO_SEQUENCE.count}
              srcFor={HERO_SEQUENCE.srcFor}
              progress={sequenceProgress}
              width={HERO_SEQUENCE.width}
              height={HERO_SEQUENCE.height}
              onReady={() => setReady(true)}
              fit="cover"
              className="w-full h-full"
            />
          </motion.div>
        </motion.div>

        <motion.div
          style={{ opacity: copyOpacity, y: copyY }}
          className="absolute inset-x-0 top-[12%] flex flex-col items-center text-center gap-5 px-6 pointer-events-none"
        >
          <p className="text-xs tracking-[0.24em] uppercase text-[#B8C4D6]">
            Cinematic Automotive CGI Studio
          </p>
          <h1 className="font-display font-normal text-4xl sm:text-6xl md:text-7xl leading-[1.02] text-[#F5F7FA]">
            Every frame
            <br />
            <span className="italic text-[#B8C4D6]">tells a story.</span>
          </h1>
        </motion.div>

        <motion.div
          style={{ opacity: ctaOpacity }}
          className="absolute inset-x-0 bottom-[10%] flex flex-wrap items-center justify-center gap-6 px-6"
        >
          <Magnet padding={40} strength={5}>
            <a
              href="#booking"
              className="text-xs tracking-[0.14em] uppercase bg-white text-[#05070A] px-7 py-4 hover:bg-[#E5E5E5] transition-colors duration-300 inline-block"
            >
              Start a Project
            </a>
          </Magnet>
          <a
            href="#experiences"
            className="text-xs tracking-[0.14em] uppercase text-[#F5F7FA] border-b border-white/30 pb-1 hover:border-white transition-colors duration-300"
          >
            See What We Build
          </a>
        </motion.div>

        <motion.div
          animate={{ opacity: ready ? 0 : 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-x-0 bottom-[4%] text-center text-[10px] tracking-[0.3em] uppercase text-[#B8C4D6]/50 pointer-events-none"
        >
          Scroll
        </motion.div>
      </div>
    </section>
  );
}
