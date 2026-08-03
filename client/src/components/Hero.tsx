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
const ZOOM_VH = 100; // the push into the chin
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
const SCROLL_VH = ASSEMBLY_VH + REVEAL_VH + HOLD_VH + ZOOM_VH;
const TOTAL_VH = SCROLL_VH + STAGE_VH;

const ASSEMBLY_END = ASSEMBLY_VH / SCROLL_VH;
const REVEAL_END = (ASSEMBLY_VH + REVEAL_VH) / SCROLL_VH;
const HOLD_END = (ASSEMBLY_VH + REVEAL_VH + HOLD_VH) / SCROLL_VH;

/**
 * Where the push lands: the deepest point of the final frame's opaque-but-unlit
 * region, which is the jaw under the visor. Measured off f_0297 as the pixel
 * furthest from anything lit or transparent.
 *
 * Its clear radius is only 61px, which is what sets ZOOM_SCALE. At 8x the
 * window is still 19% lit; at 14x it is 0.4% lit with a peak luminance of 23,
 * which is black. Do not lower ZOOM_SCALE without re-checking that — the whole
 * point of the push is that it ends in darkness.
 */
const CHIN = { x: 0.5125, y: 0.6132 };
const ZOOM_SCALE = 14;

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
 * The section then ends by pushing the camera into the dark under the helmet's
 * chin rather than scrolling the mascot off the top. The frame is opaque there,
 * so the push runs out of picture and into black, and the stage fades from that
 * black to the starfield just before the sticky releases. Fading matters: left
 * on black, the sticky would release on a black rectangle and you would watch
 * that rectangle slide up against the stars.
 */
export function Hero({ galaxyOpacity }: { galaxyOpacity: MotionValue<number> }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [alive, setAlive] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // Breathing stops when the push starts. Its scale would otherwise multiply
  // into the zoom — 1.5% of a 14x stage is a very visible wobble.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v >= ASSEMBLY_END && v < HOLD_END;
    setAlive((prev) => (prev === next ? prev : next));
  });

  // Where the chin lands on screen, as a transform-origin.
  //
  // The canvas draws with "cover", so the chin's position depends on the
  // viewport's aspect — it is not a fixed percentage of the stage. This
  // reproduces the same geometry ScrollImageSequence draws with, so the two
  // cannot drift apart.
  //
  // Resize-driven, not scroll-driven, so React state is fine here: this
  // recomputes when the window changes, not on every scroll tick.
  useEffect(() => {
    const measure = () => {
      const el = stageRef.current;
      if (!el) return;
      const { width: cw, height: ch } = el.getBoundingClientRect();
      if (!cw || !ch) return;
      const { width: fw, height: fh } = HERO_SEQUENCE;
      const s = Math.max(cw / fw, ch / fh);
      const x = ((cw - fw * s) / 2 + CHIN.x * fw * s) / cw;
      const y = ((ch - fh * s) / 2 + CHIN.y * fh * s) / ch;
      setOrigin(`${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

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

  // In over the reveal, out again as the push begins — the buttons cannot ride
  // along on a face that is rushing at the viewer. Nothing overlays the
  // assembly before it: the sequence plays clean.
  const ctaOpacity = useTransform(
    scrollYProgress,
    [ASSEMBLY_END, REVEAL_END, HOLD_END, HOLD_END + 0.02],
    [0, 1, 1, 0],
  );

  // The starfield rises behind the frames rather than replacing them. The
  // frames are keyed, so their backdrop is already clear — the stars appear
  // through it and the final frame stays exactly where it is.
  const galaxyReveal = useTransform(scrollYProgress, [ASSEMBLY_END, REVEAL_END], [0, 1]);

  // The push. Stops approximating an exponential, so it reads as a camera
  // moving at a constant speed rather than one coasting to a halt — a linear
  // ramp in scale decelerates visibly as the subject fills the frame.
  const zoom = useTransform(
    scrollYProgress,
    [HOLD_END, 0.912, 0.941, 0.971, 1],
    [1, 1.93, 3.74, 7.24, ZOOM_SCALE],
  );

  // A veil, for the aspects the measurement does not cover. CHIN's clear radius
  // was measured at 16:9; on a much taller or wider viewport "cover" crops
  // differently and something lit could sit closer to the centre than it does
  // there. Rather than re-measure per aspect, black is guaranteed on the way
  // out — by then the frame is doing nearly all of the work anyway.
  // Lands fully before the stage begins to fade. Overlapping the two would mean
  // the veil is still climbing while the stage is already dissolving, so the
  // black never actually arrives — the push would hand straight to the stars
  // and skip the beat it was aiming for.
  const veilOpacity = useTransform(scrollYProgress, [0.93, 0.965], [0, 1]);

  // Then black to starfield, so the sticky never releases on a black rectangle
  // that would be seen sliding up against the stars.
  const stageOpacity = useTransform(scrollYProgress, [0.97, 1], [1, 0]);

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
        ref={stageRef}
        onMouseMove={handlePointer}
        style={{ opacity: stageOpacity }}
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
      >
        {/* Overscanned past the viewport on every side, so the parallax and the
            breathing have room to move without pulling the canvas' own edge
            into frame. */}
        <motion.div style={{ x: parallaxX, y: parallaxY }} className="absolute -inset-[5%]">
          {/* The push sits inside the parallax, not outside it. Outside, the
              pointer's 22px drift would be multiplied by the zoom and the stage
              would fly around under the cursor. */}
          {/* No will-change here on purpose. Framer already promotes an element
              it is animating a transform on, and pinning a permanent
              compositor layer across a full-bleed stage on top of the page's
              two WebGL contexts was enough to stall compositing outright. */}
          <motion.div
            className="absolute inset-0"
            style={{ scale: zoom, transformOrigin: origin }}
          >
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
        </motion.div>

        <motion.div
          style={{ opacity: veilOpacity }}
          className="absolute inset-0 bg-[#05070A] pointer-events-none"
        />

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
      </motion.div>
    </section>
  );
}
