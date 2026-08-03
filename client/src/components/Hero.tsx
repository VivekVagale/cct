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
import { GlowButton } from "@/components/GlowButton";
import { HERO_SEQUENCE } from "@/data/heroSequence";

/**
 * The pin's phases, in vh of scroll rather than as fractions of the section.
 *
 * Fractions were unmaintainable: they only mean anything relative to the
 * section's height, so changing the height silently retimed every phase, and
 * changing a phase meant re-deriving all the others by hand. Lengths compose,
 * and the section height falls out of them.
 */
const ASSEMBLY_VH = 660; // the scrub — see below, this is the speed control
const REVEAL_VH = 50; // starfield up behind the frames, CTA in
const HOLD_VH = 42; // final frame breathing over stars
const EXIT_VH = 100; // the final frame dissolving away
const STAGE_VH = 100; // the sticky stage itself

/**
 * ASSEMBLY_VH is how fast the sequence scrubs, and it is the only number to
 * touch to change that. 298 frames across 660vh is ~20px of scroll per frame at
 * a 900px viewport, so an ordinary wheel notch advances about five frames. At
 * the 327.6vh this used to be it was ~9.9px per frame — ten frames a notch,
 * which read as flicking through the animation rather than playing it.
 *
 * The cost is page length: spending less scroll per frame means spending more
 * scroll overall. There is no way around that trade, only a choice of where to
 * sit on it.
 */
const SCROLL_VH = ASSEMBLY_VH + REVEAL_VH + HOLD_VH + EXIT_VH;
const TOTAL_VH = SCROLL_VH + STAGE_VH;

const ASSEMBLY_END = ASSEMBLY_VH / SCROLL_VH;
const REVEAL_END = (ASSEMBLY_VH + REVEAL_VH) / SCROLL_VH;
const HOLD_END = (ASSEMBLY_VH + REVEAL_VH + HOLD_VH) / SCROLL_VH;

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
 *
 * The section ends by dissolving that final frame away over a full screen of
 * scroll, so the mascot fades into the starfield instead of sliding off the
 * top. Only opacity changes, which is why it holds up while two WebGL contexts
 * are already on the page.
 *
 * A camera push into the dark under the helmet's chin was built here first and
 * pulled. Two reasons, and they are worth knowing before anyone rebuilds it.
 * Its smoothness could not be demonstrated: screenshots of the middle of the
 * pin never complete in CI, because software GL will not composite the
 * starfield, the sphere and a fully opaque hero canvas at once. And the picture
 * ran out before the travel did — at zoom Z the screen shows 2560/Z pixels of
 * source across ~2880 device pixels, so the deep end was only acceptable
 * because it was black, while the middle of the move would have shown the visor
 * and chain at a 3-9x upscale. Anyone reviving it needs an answer to the second
 * point, not just the first.
 */
export function Hero({ galaxyOpacity }: { galaxyOpacity: MotionValue<number> }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [alive, setAlive] = useState(false);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // Keeps breathing through the dissolve — better than freezing a beat before
  // the mascot disappears.
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

  // Reaches 1 and holds. It does not fade itself out — the stage dissolve below
  // carries it, so the buttons and the mascot leave as one image rather than as
  // two elements fading on separate curves. Nothing overlays the assembly
  // before it: the sequence plays clean.
  const ctaOpacity = useTransform(scrollYProgress, [ASSEMBLY_END, REVEAL_END], [0, 1]);

  // The starfield rises behind the frames rather than replacing them. The
  // frames are keyed, so their backdrop is already clear — the stars appear
  // through it and the final frame stays exactly where it is.
  const galaxyReveal = useTransform(scrollYProgress, [ASSEMBLY_END, REVEAL_END], [0, 1]);

  // The exit: the whole stage dissolves across EXIT_VH, so the mascot fades
  // into the starfield that is already behind it. Spread over a full screen of
  // scroll rather than snapped at the end, so it stays gradual under the hand.
  const stageOpacity = useTransform(scrollYProgress, [HOLD_END, 1], [1, 0]);

  // Written straight to a MotionValue the App reads — routing it through state
  // would re-render the Hero on every scroll tick. Seeded on mount as well as
  // on change, so landing deep in the page starts with the right value.
  useEffect(() => {
    galaxyOpacity.set(galaxyReveal.get());
    return galaxyReveal.on("change", (v) => galaxyOpacity.set(v));
  }, [galaxyReveal, galaxyOpacity]);

  return (
    <section
      id="top"
      ref={wrapperRef}
      style={{ height: `${TOTAL_VH}vh` }}
      className="relative pointer-events-auto"
    >
      {/* Height has to be an inline style rather than an h-[...] class: it is
          derived from the phase lengths at runtime, and Tailwind's JIT only
          sees class names it can find in the source. */}
      <motion.div
        onMouseMove={handlePointer}
        style={{ opacity: stageOpacity }}
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
      >
        {/* Overscanned just enough for the parallax to move without pulling the
            canvas' own edge into frame.

            16px, not the 5% this used to be. The overscan magnifies whatever it
            adds — at 5% on a 1440px viewport that was 72px a side, and since the
            canvas fits with "cover", the extra was spent cropping the frame
            rather than showing it. It only ever needed to cover the parallax
            drift, which tops out at 11px across and 7px down. A fixed 16px
            clears that at any viewport, where a percentage did not: on a phone
            5% is only ~10px, narrower than the drift it was supposed to hide.

            The breathing needs no allowance at all — it only ever scales up
            from 1, so it cannot expose an edge. */}
        <motion.div style={{ x: parallaxX, y: parallaxY }} className="absolute -inset-[16px]">
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
            <GlowButton href="#booking" className="text-xs tracking-[0.14em] uppercase px-7 py-4">
              Start a Project
            </GlowButton>
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
      </motion.div>
    </section>
  );
}
