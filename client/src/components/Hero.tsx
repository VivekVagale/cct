import { useEffect, useRef, useState } from "react";
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
import { Mascot } from "@/components/Mascot";
import { HERO_SEQUENCE } from "@/data/heroSequence";

/**
 * The pin's three phases. The ending plays out while the section is still
 * pinned, so nothing slides upward: by the time the sticky releases, the frames
 * are already gone and what remains is the mascot over the same starfield the
 * next section sits on, leaving nothing visible to scroll away.
 */
const ASSEMBLY_END = 0.78; // frames finish scrubbing; mascot starts breathing
const DISSOLVE_END = 0.9; // frames gone, starfield up, static pose in
const HOLD_UNTIL = 1; // mascot breathing over stars, nothing moving

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
 * rectangle over the starfield.
 *
 * That makes the ending a dissolve rather than a reveal. Fading the starfield up
 * behind opaque frames shows nothing: it would reach full opacity while still
 * hidden and appear all at once when the pin released. So the frames fade out as
 * the starfield rises and a transparent pose fades in over it, all while the
 * section is still pinned — the backdrop melts into stars and nothing slides.
 *
 * The pose is a different render from the final frame (wider framing, smaller
 * chain, darker blue), so the handover is perceptible by design: a long overlap
 * makes it read as the character settling rather than as a cut.
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
    const next = v >= ASSEMBLY_END;
    setAlive((prev) => (prev === next ? prev : next));
  });

  // The sequence consumes most of the pin; the tail is the exit.
  const rawSeq = useTransform(scrollYProgress, [0, ASSEMBLY_END], [0, 1]);
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
  // Reaches 1 and holds, so the section ends on a call to action over the stars.
  const ctaOpacity = useTransform(scrollYProgress, [ASSEMBLY_END, DISSOLVE_END], [0, 1]);

  // Handing off to the starfield.
  //
  // The frames are opaque and cover the viewport, so simply fading the
  // starfield up behind them shows nothing: it would reach full opacity while
  // still hidden, and the stars would appear all at once the moment the pin
  // released. The stage has to dissolve as the starfield rises, so the two
  // cross over on screen and the black backdrop melts into stars.
  const framesOpacity = useTransform(scrollYProgress, [ASSEMBLY_END, DISSOLVE_END], [1, 0]);
  const galaxyReveal = useTransform(scrollYProgress, [ASSEMBLY_END, DISSOLVE_END], [0, 1]);
  // The static pose arrives slightly behind the frames leaving, so the two
  // overlap and the swap reads as a settle rather than a cut. It is a different
  // render from the final frame — wider framing, smaller chain — so the overlap
  // is doing real work here.
  const poseOpacity = useTransform(
    scrollYProgress,
    [ASSEMBLY_END + 0.03, DISSOLVE_END, HOLD_UNTIL],
    [0, 1, 1],
  );

  // Written straight to a MotionValue the App reads — routing it through state
  // would re-render the Hero on every scroll tick. Seeded on mount as well as
  // on change, so landing deep in the page starts with the right value.
  useEffect(() => {
    galaxyOpacity.set(galaxyReveal.get());
    return galaxyReveal.on("change", (v) => galaxyOpacity.set(v));
  }, [galaxyReveal, galaxyOpacity]);

  return (
    <section id="top" ref={wrapperRef} className="relative h-[520vh] pointer-events-auto">
      <div
        onMouseMove={handlePointer}
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
      >
        {/* Overscanned past the viewport on every side: the frames are opaque,
            so any parallax or breathing on an exactly-viewport-sized canvas
            would drag its edge into view. */}
        <motion.div style={{ x: parallaxX, y: parallaxY }} className="absolute -inset-[5%]">
          <motion.div style={{ opacity: framesOpacity }} className="absolute inset-0">
            {/* Once assembled, the canvas breathes in place. Scale only: the
                frames are opaque, so translating one would drag its edge in. */}
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

          {/* The transparent pose that takes over, so the mascot survives the
              dissolve and sits on the starfield. The aspect box reproduces the
              canvas' cover geometry, and the pose is placed at the fractions the
              character occupies in the final frame, so the two line up at any
              viewport rather than only at the aspect this was tuned on. */}
          <motion.div
            style={{ opacity: poseOpacity }}
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
          >
            <div className="relative aspect-[16/9] min-w-full min-h-full">
              <Mascot
                pose="neutral"
                animateIn={false}
                className="absolute left-[50.5%] top-[53.4%] -translate-x-1/2 -translate-y-1/2 w-auto h-[93.2%] [&>img]:h-full [&>img]:w-auto"
              />
            </div>
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
