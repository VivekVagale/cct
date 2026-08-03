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
import { HERO_SEQUENCE } from "@/data/heroSequence";

/**
 * The pin's three phases. The ending plays out while the section is still
 * pinned, so nothing slides upward: by the time the sticky releases, the
 * starfield is already up behind the final frame, leaving nothing visible to
 * scroll away.
 */
const ASSEMBLY_END = 0.78; // frames finish scrubbing; mascot starts breathing
const REVEAL_END = 0.9; // starfield up behind the frames, copy and CTA in
const HOLD_UNTIL = 1; // final frame breathing over stars, nothing moving

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
 * The frames carry their own alpha — the black backdrop is keyed out by
 * tools/key_hero_frames.py, which finds it as the black connected to the frame
 * border, so the character's equally-black clothing stays solid. That is what
 * lets the section simply end on its final frame: there is no backdrop left to
 * hide the starfield, so the stars come up behind the mascot and the frame
 * stays put.
 *
 * Nothing is swapped in at the end. An earlier cut dissolved the frames out and
 * faded a separate static pose in, because opaque frames left no way to reveal
 * the starfield — that pose is gone, and with it the visible handover between
 * two different renders.
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

  // Reaches 1 and holds, so the section ends on a call to action over the
  // stars. Nothing overlays the assembly before it — the sequence plays clean.
  const ctaOpacity = useTransform(scrollYProgress, [ASSEMBLY_END, REVEAL_END], [0, 1]);

  // The starfield rises behind the frames rather than replacing them. The
  // frames are keyed, so their backdrop is already clear — the stars appear
  // through it and the final frame stays exactly where it is.
  const galaxyReveal = useTransform(scrollYProgress, [ASSEMBLY_END, REVEAL_END], [0, 1]);

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
        {/* Overscanned past the viewport on every side, so the parallax and the
            breathing have room to move without pulling the canvas' own edge
            into frame. */}
        <motion.div style={{ x: parallaxX, y: parallaxY }} className="absolute -inset-[5%]">
          {/* Once assembled, the canvas breathes in place. */}
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

        {/* The hero carries no visible copy: the assembly plays clean from the
            first frame, and by the time it finishes the character fills the
            viewport, leaving nowhere for a headline that would not sit across
            the helmet. The page still needs its one h1, so the wording stays
            here for the document outline and for screen readers. The same line
            is set visibly further down the page, in the CinematicLine band. */}
        <h1 className="sr-only">
          Cold Chain Theory — cinematic automotive CGI studio. Every frame tells a story.
        </h1>

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
