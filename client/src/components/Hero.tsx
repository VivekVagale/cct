import { useEffect, useMemo, useRef, useState } from "react";
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
import { ScrollCue } from "@/components/ScrollCue";
import { HERO_SEQUENCE, HERO_SEQUENCE_MOBILE } from "@/data/heroSequence";
import { useScene } from "@/components/SceneDeck";
import {
  useStableViewportHeight,
  useStableScrollProgress,
} from "@/hooks/useStableViewport";

/**
 * The pin's phases, in vh of scroll rather than as fractions of the section.
 *
 * Fractions were unmaintainable: they only mean anything relative to the
 * section's height, so changing the height silently retimed every phase, and
 * changing a phase meant re-deriving all the others by hand. Lengths compose,
 * and the section height falls out of them.
 */
const REVEAL_VH = 50; // starfield up behind the frames, CTA in
const HOLD_VH = 42; // final frame breathing over stars
const EXIT_VH = 100; // the final frame dissolving away
const STAGE_VH = 100; // the sticky stage itself

/**
 * ASSEMBLY_VH is how fast the sequence scrubs, and it is the only number to
 * touch to change that. 298 frames across 660vh is ~20px of scroll per frame at
 * a 900px viewport, so an ordinary wheel notch advances about five frames — and
 * 6,134px, about fifty-one notches, before the deck will move on.
 *
 * That length is the point and not an oversight. It was cut to 300 on the
 * theory that the damped scroll had made a shorter scrub safe, and put back:
 * the assembly is the first thing anyone sees and it is worth the scrolling.
 * The shorter version played the same animation in a third of the distance,
 * which is a different thing being said, not the same thing said efficiently.
 *
 * The cost is page length: spending less scroll per frame means spending more
 * scroll overall. There is no way around that trade, only a choice of where to
 * sit on it.
 */
const ASSEMBLY_VH = 660;

/**
 * The scrub is shorter on phones — 400vh rather than 660.
 *
 * vh is a unit of screen, not of effort, and the two come apart on touch. A
 * wheel notch is a fixed ~100px, so on a desktop the vh figure is close to a
 * count of how much work the sequence costs. A swipe is not fixed: it carries
 * most of a screen per flick and then keeps going under momentum. The same 852vh
 * of section is around nine flicks on a phone against a scroll wheel's steady
 * turn, and it is all before the first word of the page.
 *
 * 400vh at a ~700px viewport is ~9.4px of scroll per frame. That figure was
 * rejected for the wheel — at 9.9px a notch jumped ten frames and read as
 * flicking through the animation rather than playing it. It does not carry the
 * same cost here, because a swipe was never going to advance one frame at a
 * time: it covers 40-80 either way, so what the number actually changes on
 * touch is how long the section lasts, not how smooth it looks.
 */
const MOBILE_ASSEMBLY_VH = 400;

/**
 * The phase geometry, derived from whichever scrub length applies.
 *
 * Lengths compose and the fractions fall out of them, which is the whole reason
 * the phases are expressed in vh — one number changes and the other three
 * re-derive themselves rather than needing to be worked out by hand.
 */
function geometry(assemblyVh: number) {
  const scroll = assemblyVh + REVEAL_VH + HOLD_VH + EXIT_VH;
  return {
    totalVh: scroll + STAGE_VH,
    assemblyEnd: assemblyVh / scroll,
    revealEnd: (assemblyVh + REVEAL_VH) / scroll,
    holdEnd: (assemblyVh + REVEAL_VH + HOLD_VH) / scroll,
  };
}

const DESKTOP_GEOMETRY = geometry(ASSEMBLY_VH);
const MOBILE_GEOMETRY = geometry(MOBILE_ASSEMBLY_VH);

/**
 * Which sequence a viewport gets.
 *
 * Orientation, not width, because orientation is what makes the landscape
 * sequence wasteful. The canvas fits with "cover", so a portrait viewport keeps
 * a centre strip about a quarter of the frame's width and discards the rest —
 * and then still upscales it, because it wants ~1928px of frame height and the
 * landscape frame only has 1440. Phones were paying full freight for a soft
 * result. The portrait sequence is that same centre strip, delivered at the
 * size it is actually drawn at.
 *
 * The max-width guard keeps portrait tablets on the landscape sequence, where
 * the strip would be too narrow to fill them.
 */
const PORTRAIT_QUERY = "(orientation: portrait) and (max-width: 900px)";

/**
 * Decoded-frame ceilings. A phone tab is killed at a small fraction of what a
 * desktop tolerates, so it gets a much tighter one — which still buys a larger
 * window in frames, since a portrait frame is 2.6x smaller.
 */
const DESKTOP_BUDGET = 500 * 1024 * 1024;
const MOBILE_BUDGET = 180 * 1024 * 1024;

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
 * tools/build_hero_frames.py, which finds it as the black connected to the
 * frame border, so the character's equally-black clothing stays solid. That is
 * what lets the section simply end on its final frame: there is no backdrop
 * left to hide the starfield, so the stars come up behind the mascot and the
 * frame stays put.
 *
 * The Hero owns the starfield's opacity and hands it to App through a
 * MotionValue, so the assembly plays against flat black and the stars rise with
 * the reveal. Keying means they *could* be on from the first frame — that was
 * built and rejected: stars behind an assembling mascot read as busy, and
 * having them arrive is what gives the reveal its beat.
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
export function Hero({
  galaxyOpacity,
  /**
   * How far through its dissolve the stage is: 0 while the mascot is up, 1
   * once it has gone. The nav bar reads it to decide when to put its glass on,
   * which has to be as the hero leaves rather than when the starfield arrives —
   * those are two different moments, and only the second one clears the space
   * under the bar.
   */
  heroExit,
}: {
  galaxyOpacity: MotionValue<number>;
  heroExit: MotionValue<number>;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [alive, setAlive] = useState(false);
  // Whether the page has moved at all. Only ever flips false -> true, so this
  // is one re-render for the life of the section, not one per scroll tick.
  const [scrolled, setScrolled] = useState(false);
  // Media-query driven, so it follows a rotate. State is safe here for the same
  // reason the old resize measurement was: this changes on orientation, not on
  // every scroll tick.
  //
  // Read synchronously for the first render, not defaulted to false and
  // corrected in the effect. Defaulting meant a phone mounted the landscape
  // sequence, started pulling 133KB frames, and only then swapped — measured at
  // 8 wasted desktop frames, about a megabyte of a mobile visitor's data, plus
  // a full teardown and refetch on a connection least able to afford it.
  const [portrait, setPortrait] = useState(
    () => typeof window !== "undefined" && window.matchMedia(PORTRAIT_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(PORTRAIT_QUERY);
    const sync = () => setPortrait(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  /*
   * Every second frame on a phone.
   *
   * 298 frames is 298 decodes and 298 frames held in memory, and a phone is
   * where both hurt — it has the tighter decode budget and it is the device
   * that was measured getting hot. Halving the set halves the memory and the
   * decode work outright.
   *
   * It costs almost nothing to look at. The note on MOBILE_ASSEMBLY_VH already
   * says why: a swipe covers 40 to 80 frames whatever the sequence length, so
   * touch was never advancing one frame at a time and cannot tell 149 apart
   * from 298. This would be plainly visible under a wheel, which is why it is
   * not done on the desktop set.
   */
  const baseSequence = portrait ? HERO_SEQUENCE_MOBILE : HERO_SEQUENCE;
  const sequence = useMemo(() => {
    if (!portrait) return baseSequence;
    const srcFor = baseSequence.srcFor;
    return {
      ...baseSequence,
      count: Math.ceil(baseSequence.count / 2),
      srcFor: (i: number) => srcFor(Math.min(baseSequence.count - 1, i * 2)),
    };
  }, [portrait, baseSequence]);
  const budgetBytes = portrait ? MOBILE_BUDGET : DESKTOP_BUDGET;
  // Same media query the sequence choice uses. A portrait phone is exactly the
  // case the shorter scrub is for, and having one switch drive both keeps the
  // section's length and its frame source from ever disagreeing.
  const { totalVh, assemblyEnd, revealEnd, holdEnd } = portrait
    ? MOBILE_GEOMETRY
    : DESKTOP_GEOMETRY;

  /*
   * Measured against the scene's own scroller, not the window.
   *
   * In the deck the window never moves, so a sequence scrubbed from window
   * scroll would sit on frame one forever. `container` points useScroll at the
   * element that does move; it is null in the reduced-motion document
   * fallback, where the window is the right answer and framer's default
   * already is that.
   */
  const { scroller, active, inDeck } = useScene();
  /*
   * Whether this scene is the one on screen, readable from inside a motion
   * value subscription without re-subscribing on every change.
   *
   * The two values below belong to the whole page — the starfield behind every
   * scene, and the nav bar's glass — but they are written from here, by this
   * scene's scroll. That only holds while this scene is the current one. A
   * scene that is not current is stood down with `content-visibility: hidden`,
   * its subtree stops being rendered, and `useScroll` measuring a target inside
   * it gets nothing back and reports zero. The hero would then dutifully write
   * that zero out: the starfield went black for the entire rest of the site,
   * and the nav lost its glass.
   */
  const activeRef = useRef(active);
  // Outside a deck there is no "current scene" and the hero is simply on the
  // page, so it always speaks. Guarding on `active` alone left the starfield
  // at zero for the whole document.
  activeRef.current = inDeck ? active : true;
  /*
   * The section's height, and the scroll maths that reads it, both in pixels
   * taken from a viewport height that browser chrome cannot move.
   *
   * In `vh` this section is 692vh on a phone. `vh` is re-resolved whenever the
   * layout viewport changes, and the soft keyboard changes it: focus the
   * booking form's name field and this section lost around 2,000px while the
   * scroll position stayed put, which slid the whole page up and left the
   * reader in the reviews. The URL bar sliding back in on an upward scroll is
   * the same defect at a tenth the size, felt as the scrub stuttering.
   *
   * See useStableViewport for why framer's own `useScroll` cannot be left to
   * measure this: its divisor is read live and moves with the bar even when the
   * section does not.
   */
  const viewportHeight = useStableViewportHeight();
  const stableProgress = useStableScrollProgress(wrapperRef, viewportHeight);
  const { scrollYProgress: deckProgress } = useScroll({
    target: wrapperRef,
    container: scroller ? { current: scroller } : undefined,
    offset: ["start start", "end end"],
  });
  /* The deck keeps framer's measurement: it scrolls an element rather than the
     window, which is what `container` is for and what the hook above does not
     do. Nothing reaches that branch while the deck is off. */
  const scrollYProgress = scroller ? deckProgress : stableProgress;

  // Keeps breathing through the dissolve — better than freezing a beat before
  // the mascot disappears.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v >= assemblyEnd;
    setAlive((prev) => (prev === next ? prev : next));
    // One-way latch for the scroll cue. It is a flag, not a curve: the cue goes
    // the moment the page moves and never comes back, even if the reader
    // scrolls back to the top. A threshold this small is any real scroll at all
    // — about 4px — while still ignoring subpixel noise.
    if (v > 0.0005) setScrolled((prev) => prev || true);
  });

  // The sequence consumes most of the pin; the tail is the exit.
  const rawSeq = useTransform(scrollYProgress, [0, assemblyEnd], [0, 1]);
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
  const ctaOpacity = useTransform(scrollYProgress, [assemblyEnd, revealEnd], [0, 1]);


  // The starfield rises behind the frames rather than replacing them. The
  // frames are keyed, so their backdrop is already clear — the stars appear
  // through it and the final frame stays exactly where it is.
  const galaxyReveal = useTransform(scrollYProgress, [assemblyEnd, revealEnd], [0, 1]);

  // The exit: the whole stage dissolves across EXIT_VH, so the mascot fades
  // into the starfield that is already behind it. Spread over a full screen of
  // scroll rather than snapped at the end, so it stays gradual under the hand.
  const stageOpacity = useTransform(scrollYProgress, [holdEnd, 1], [1, 0]);

  // Written straight to a MotionValue the App reads — routing it through state
  // would re-render the Hero on every scroll tick. Seeded on mount as well as
  // on change, so landing deep in the page starts with the right value.
  useEffect(() => {
    /*
     * Follows the scroll in both directions.
     *
     * It was one-way for a while — once the stars were up they stayed up — to
     * survive the scene deck, where a scene that was not current stopped being
     * rendered, measured as zero and would have written that zero out. There is
     * no such state in a document: the hero is always mounted and always
     * measurable, and the `activeRef` guard below still covers the deck if it
     * is ever switched back on.
     *
     * And the latch was wrong here anyway. The frames are keyed but their edges
     * are not perfectly clean, so the black behind them is doing real work —
     * scroll back up with the starfield still lit and those edges are suddenly
     * visible against it. The backdrop has to go back to black exactly as it
     * came up.
     */
    const apply = (v: number) => {
      if (!activeRef.current) return;
      galaxyOpacity.set(v);
    };
    apply(galaxyReveal.get());
    return galaxyReveal.on("change", apply);
  }, [galaxyReveal, galaxyOpacity]);

  // The same arrangement for the exit, inverted: 1 means the stage has gone.
  // Not one-way — scrolling back up through the hero genuinely brings the
  // stage back — but silent for the same reason once the scene is stood down.
  useEffect(() => {
    const apply = (v: number) => {
      if (activeRef.current) heroExit.set(1 - v);
    };
    apply(stageOpacity.get());
    return stageOpacity.on("change", apply);
  }, [stageOpacity, heroExit]);

  return (
    <section
      id="top"
      ref={wrapperRef}
      style={{
        height: viewportHeight
          ? `${Math.round((totalVh / 100) * viewportHeight)}px`
          : `${totalVh}vh`,
      }}
      className="relative pointer-events-auto"
    >
      {/* Height has to be an inline style rather than an h-[...] class: it is
          derived from the phase lengths at runtime, and Tailwind's JIT only
          sees class names it can find in the source.

          Resolved to pixels here rather than left in `vh`, which is the unit
          that made this section change height under the keyboard. The `vh`
          fallback is for the one render before a viewport height exists. */}
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
              count={sequence.count}
              srcFor={sequence.srcFor}
              progress={sequenceProgress}
              width={sequence.width}
              height={sequence.height}
              budgetBytes={budgetBytes}
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

        {/* Appears once the frames are ready, so it does not share the screen
            with the loading line below it, and leaves the instant the page
            moves. It was tied to scroll position before — fading across a span
            of scroll — which meant it was still on screen while the assembly
            was already running. It is a prompt to start, so it ends when the
            reader starts. */}
        <motion.div
          animate={{ opacity: ready && !scrolled ? 1 : 0 }}
          transition={{ duration: scrolled ? 0.25 : 0.6 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <ScrollCue />
        </motion.div>

        <motion.div
          style={{ opacity: ctaOpacity }}
          className="absolute inset-x-0 bottom-[12%] sm:bottom-[10%] flex flex-col sm:flex-row flex-wrap items-center justify-center gap-5 sm:gap-6 px-6"
        >
          {/* Stacked below sm. Side by side these two came to ~330px against a
              375px viewport, so they wrapped anyway — but wrapped they sat
              hard against both gutters with the row's gap between them, which
              read as two orphaned controls rather than a primary action and
              its alternative. */}
          <Magnet padding={40} strength={5}>
            <GlowButton
              href="#booking"
              className="text-xs tracking-[0.14em] uppercase px-6 py-3.5 sm:px-7 sm:py-4"
            >
              Start a Project
            </GlowButton>
          </Magnet>
          {/* `py-3 -my-3` again: the underline stays exactly where it is and
              the target grows from 21px to 44px. This sits beside a full-height
              button, so the two read as a pair while only one of them was
              actually reachable with a thumb. */}
          <a
            href="#projects"
            className="inline-block py-3 -my-3 text-xs tracking-[0.14em] uppercase text-[#F5F7FA] border-b border-white/30 hover:border-white transition-colors duration-300"
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
