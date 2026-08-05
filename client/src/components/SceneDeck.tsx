import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./SceneDeck.css";

/**
 * How long a scene's entrance takes, and how long each beat of it waits.
 *
 * These are the pacing, and they are the only numbers to touch to change it.
 * The sequence a scene plays through:
 *
 *   0.00  the previous scene begins leaving, this one begins arriving
 *   0.55  the heading starts drawing — after the transition has landed, not
 *         during it, so the two are never competing
 *   2.45  the heading has settled
 *   3.05  the supporting content begins, staggered
 *   3.20  advancing unlocks
 *
 * Nothing here is fast on purpose. A heading that arrives in 0.4s is a thing
 * that happened; one that takes two seconds is a thing being said.
 */
export const SCENE = {
  /** The crossfade between two scenes. */
  transition: 1.1,
  /** Quiet after the transition lands, before the heading starts. */
  headingDelay: 0.55,
  /** The heading's own draw. */
  headingDuration: 1.9,
  /** Quiet after the heading settles, before anything else moves. */
  holdAfterHeading: 0.6,
  /** Between one piece of supporting content and the next. */
  contentStagger: 0.18,
  /** Supporting content's own fade. */
  contentDuration: 1.2,
  /**
   * How long a scene is held before the next one can be asked for.
   *
   * This is the one that decides whether the page feels calm or stuck. Long
   * enough that a heading is never skipped past before it has finished
   * speaking; short enough that a second deliberate scroll is answered rather
   * than swallowed. A visitor who wants to move on is not made to wait for the
   * full content stagger — only for the heading.
   */
  dwell: 2.4,
} as const;

/** When the supporting content at position `order` starts moving. */
export const contentDelay = (order = 0) =>
  SCENE.headingDelay +
  SCENE.headingDuration +
  SCENE.holdAfterHeading +
  order * SCENE.contentStagger;

type ScenePhase = "idle" | "playing";

interface SceneContextValue {
  /** True only for the scene currently on screen. */
  active: boolean;
  /** Where this scene is in the deck, for anything that wants to know. */
  index: number;
  phase: ScenePhase;
  /**
   * The element a scrolling scene actually scrolls, or null in the document
   * fallback.
   *
   * Two sections are scrubbed by scroll position rather than merely revealed by
   * it — the hero's 298-frame sequence and the process section's five pinned
   * stages. `useScroll` measures against the window by default, and in a deck
   * the window never moves, so both would sit frozen on their first frame.
   * They read this and hand it to `useScroll` as `container` instead.
   */
  scroller: HTMLElement | null;
}

const SceneContext = createContext<SceneContextValue>({
  active: false,
  index: 0,
  phase: "idle",
  scroller: null,
});

export const useScene = () => useContext(SceneContext);

export interface SceneDefinition {
  /** Stable id. Doubles as the anchor a nav link can ask for. */
  id: string;
  render: () => ReactNode;
  /**
   * Set where the content genuinely cannot fit a screen — the analytics and
   * the booking form. The scene scrolls inside its own frame and the deck
   * refuses to advance until that inner scroll has reached its end, so the
   * viewport still never moves but nothing is cut off either.
   */
  scrolls?: boolean;
}

/**
 * The page as a deck of scenes rather than a document.
 *
 * The viewport does not move. There is no page scroll at all — the body is
 * locked and the deck is a fixed, full-screen frame. A wheel notch, a swipe or
 * an arrow key is an *instruction to advance*, not a distance to travel: the
 * current scene animates out, the next animates in, and the frame they play in
 * stays exactly where it is.
 *
 * Three things this has to get right or it becomes a trap rather than a story.
 *
 * **It cannot swallow intent.** A scene is locked for `SCENE.dwell` so a
 * heading is never skipped before it has finished speaking, and the wheel needs
 * a real push — accumulated delta past a threshold — rather than firing on the
 * first pixel of a trackpad's inertia. Past that, every input is answered.
 *
 * **It cannot be mouse-only.** Arrow keys, Page Up/Down, Home, End and space
 * all move the deck, and the frame takes focus so they arrive without a click
 * first. A scroll-jacked page with no keyboard route is a page some visitors
 * simply cannot read.
 *
 * **It cannot be the only way.** Under prefers-reduced-motion the deck does not
 * mount at all — the sections render as an ordinary document and scroll the
 * ordinary way. Turning a page into a slideshow is exactly the kind of motion
 * that setting exists to refuse.
 */
export function SceneDeck({ scenes }: { scenes: SceneDefinition[] }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const lockedUntil = useRef(0);
  const wheelAccumulator = useRef(0);
  const touchStart = useRef<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [scroller, setScroller] = useState<HTMLElement | null>(null);

  const count = scenes.length;

  const go = useCallback(
    (delta: number) => {
      const now = performance.now();
      if (now < lockedUntil.current) return false;

      const next = index + delta;
      if (next < 0 || next >= count) return false;

      lockedUntil.current = now + SCENE.dwell * 1000;
      wheelAccumulator.current = 0;
      setDirection(delta);
      setIndex(next);
      return true;
    },
    [index, count],
  );

  /*
   * Whether the scene's own scroller still has somewhere to go in `delta`'s
   * direction. A scrolling scene keeps its wheel events until it is at the end
   * of its travel; only then does a further push mean "next scene".
   *
   * The 2px tolerance is for fractional device pixels — at a 1.25 scale factor
   * a scroller at its true bottom reports a remainder under one CSS pixel, and
   * an exact comparison leaves the deck permanently stuck on that scene.
   */
  const innerScrollHasRoom = useCallback((delta: number) => {
    const el = scrollerRef.current;
    if (!el) return false;
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 2) return false;
    return delta > 0 ? el.scrollTop < max - 2 : el.scrollTop > 2;
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const onWheel = (e: WheelEvent) => {
      const delta = e.deltaY;
      if (innerScrollHasRoom(Math.sign(delta))) return; // the scene wants it

      e.preventDefault();

      // Direction changes reset the run-up, or a flick down followed by a
      // flick up would arrive already half-charged.
      if (Math.sign(delta) !== Math.sign(wheelAccumulator.current)) {
        wheelAccumulator.current = 0;
      }
      wheelAccumulator.current += delta;

      // ~One firm notch. Below this a trackpad's tail-off would advance two
      // scenes for one gesture.
      if (Math.abs(wheelAccumulator.current) > 60) {
        go(Math.sign(wheelAccumulator.current));
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      // Never steal a key from something being typed into.
      if (target?.closest("input, textarea, select, [contenteditable]")) return;

      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
          if (innerScrollHasRoom(1)) return;
          e.preventDefault();
          go(1);
          break;
        case " ":
          if (innerScrollHasRoom(e.shiftKey ? -1 : 1)) return;
          e.preventDefault();
          go(e.shiftKey ? -1 : 1);
          break;
        case "ArrowUp":
        case "PageUp":
          if (innerScrollHasRoom(-1)) return;
          e.preventDefault();
          go(-1);
          break;
        case "Home":
          e.preventDefault();
          lockedUntil.current = 0;
          setDirection(-1);
          setIndex(0);
          break;
        case "End":
          e.preventDefault();
          lockedUntil.current = 0;
          setDirection(1);
          setIndex(count - 1);
          break;
        default:
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStart.current = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStart.current === null) return;
      const dy = touchStart.current - (e.touches[0]?.clientY ?? 0);
      if (innerScrollHasRoom(Math.sign(dy))) return;
      // A swipe has to be a real one: 48px, against a wheel's 60 units.
      if (Math.abs(dy) > 48) {
        if (go(Math.sign(dy))) touchStart.current = null;
      }
    };

    const onTouchEnd = () => {
      touchStart.current = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [reduceMotion, go, innerScrollHasRoom, count]);

  // The document itself must not scroll — there is nothing below the fold to
  // scroll to, and a rubber-band on a locked page reads as breakage.
  useEffect(() => {
    if (reduceMotion) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [reduceMotion]);

  // A new scene starts at the top of its own travel; without this, arriving
  // back at a scrolling scene would land halfway down it.
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
  }, []);

  /*
   * Anchors still work. The nav's links are `#about` and the like, and in a
   * deck there is nothing for the browser to jump to — so a click on one is
   * turned into a scene change instead.
   */
  useEffect(() => {
    if (reduceMotion) return;
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!href?.startsWith("#") || href === "#") return;
      const target = scenes.findIndex((s) => `#${s.id}` === href);
      if (target === -1) return;
      e.preventDefault();
      lockedUntil.current = 0;
      setDirection(target > index ? 1 : -1);
      setIndex(target);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [reduceMotion, scenes, index]);

  /*
   * The document, unchanged, for anyone who has asked for less motion.
   *
   * Not a slower deck — a deck is the motion. A page that rebuilds itself on
   * every input is the thing the setting is refusing, so it gets the sections
   * stacked and the browser's own scroll.
   */
  if (reduceMotion) {
    return (
      <>
        {scenes.map((scene) => (
          <div id={scene.id} key={scene.id}>
            {scene.render()}
          </div>
        ))}
      </>
    );
  }

  const current = scenes[index];

  return (
    <div
      className="scene-deck"
      ref={frameRef}
      tabIndex={-1}
      // Announced as a slideshow, because that is what it is. Without this a
      // screen reader is handed a page whose entire contents change with no
      // explanation of why.
      role="region"
      aria-roledescription="carousel"
      aria-label="Cold Chain Theory, in scenes"
    >
      <AnimatePresence custom={direction} initial={false} mode="sync">
        <motion.div
          className="scene"
          custom={direction}
          key={current.id}
          initial="enter"
          animate="center"
          exit="exit"
          variants={SCENE_VARIANTS}
          aria-roledescription="scene"
          aria-label={`Scene ${index + 1} of ${count}`}
        >
          {/* The scroller is handed down as state, not as the ref itself: a ref
              is populated after the first render, and a scene reading it during
              that render would measure against the window and stay frozen
              there. Setting state on mount costs one extra render and makes the
              element available on the one that matters. */}
          <SceneContext.Provider
            value={{ active: true, index, phase: "playing", scroller }}
          >
            <div
              className={current.scrolls ? "scene-scroller" : "scene-fixed"}
              ref={(el) => {
                scrollerRef.current = el;
                setScroller(el);
              }}
              id={current.id}
            >
              {current.render()}
            </div>
          </SceneContext.Provider>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * The transition itself: a camera push rather than a slide.
 *
 * The outgoing scene recedes and blurs as if the focus has left it; the
 * incoming one arrives slightly forward of rest and settles back. Nothing
 * translates the full height of the screen, because a scene sliding up the
 * viewport is the exact thing this deck exists to stop looking like — the
 * movement is in depth, not down the page.
 *
 * The two overlap deliberately (`mode="sync"`), so one dissolves into the
 * other rather than the frame going empty between them.
 */
const SCENE_VARIANTS = {
  enter: (direction: number) => ({
    opacity: 0,
    scale: direction > 0 ? 0.94 : 1.06,
    filter: "blur(14px)",
  }),
  center: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: SCENE.transition,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    scale: direction > 0 ? 1.06 : 0.94,
    filter: "blur(14px)",
    transition: {
      duration: SCENE.transition * 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};
