import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  motionValue,
  type MotionValue,
} from "framer-motion";
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
 *   0.90  advancing unlocks — a visitor who wants to move on is never made to
 *         wait for the rest of this
 *   2.45  the heading has settled
 *   3.05  the supporting content begins, staggered
 *
 * Nothing here is fast on purpose. A heading that arrives in 0.4s is a thing
 * that happened; one that takes two seconds is a thing being said.
 */
export const SCENE = {
  /** The crossfade between two scenes. */
  transition: 0.8,
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
   * This is the one that decides whether the page feels calm or stuck, and it
   * was stuck. At 2.4s it was long enough to protect a heading from being
   * skipped — and long enough that every single scene change waited on it,
   * which is a page that argues with the person reading it.
   *
   * 0.9s is about the length of one wheel gesture's inertia: it stops a single
   * flick advancing twice, and answers anything deliberate after it. Nothing
   * now protects a heading from a visitor who wants to move on, which is the
   * right way round — they can always come back, and coming back is free (see
   * `dwellSettled`).
   */
  dwell: 0.9,
  /**
   * The hold on arriving at a scene that has been read before.
   *
   * Barely a hold at all — long enough that one wheel gesture's inertia cannot
   * fire twice, and no longer. The full dwell exists to stop a heading being
   * skipped before it has finished speaking; a scene the visitor has already
   * been through has no heading left to protect, and making them wait through
   * it again to get back where they were is the delay, not the pacing.
   */
  dwellSettled: 0.3,
} as const;

/**
 * How much wheel a scene has to be pushed against before it yields.
 *
 * Roughly one firm notch. There has to be enough travel for the give to be
 * felt before the scene changes — that is the whole point of it — but every
 * unit above that is a unit of scrolling that looks like nothing happening,
 * and 90 was over that line.
 */
const WHEEL_THRESHOLD = 62;

/** The same, for a finger. */
const SWIPE_THRESHOLD = 50;

/**
 * How long a run of wheel events can pause before the charge is treated as
 * abandoned and relaxes back to nothing. One notch of a mouse wheel is a single
 * event, so this cannot be tight enough to punish a slow, deliberate scroll.
 */
const PUSH_RELEASE_MS = 220;

/** When the supporting content at position `order` starts moving. */
export const contentDelay = (order = 0) =>
  SCENE.headingDelay +
  SCENE.headingDuration +
  SCENE.holdAfterHeading +
  order * SCENE.contentStagger;

/**
 * A scene is unvisited until it is first shown, playing while its entrance
 * runs, and settled from the moment it is left. It never goes back.
 */
type ScenePhase = "unvisited" | "playing" | "settled";

interface SceneContextValue {
  /** True only for the scene currently on screen. */
  active: boolean;
  /** Where this scene is in the deck, for anything that wants to know. */
  index: number;
  phase: ScenePhase;
  /**
   * True when this scene has been seen before in this session.
   *
   * Everything that plays an entrance reads this and renders its finished
   * state instead: the CSS staging in SceneDeck.css, `Reveal`, `RevealLines`,
   * `FoldHeading`. Going back to a scene is turning back to a page already
   * read — the ink does not get laid down again.
   */
  settled: boolean;
  /**
   * How hard the visitor is currently pushing against this scene, -1 to 1.
   *
   * Signed by direction, 1 being a full push towards the next scene. Sprung, so
   * a wheel notch arrives as a shove rather than a step. Anything decorative
   * that wants to drift with the input can read this; the deck itself uses it
   * for the scene's own give.
   */
  push: MotionValue<number>;
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

/**
 * The value outside a deck — the reduced-motion document, and every test that
 * renders a section on its own. `settled: false` there means the sections keep
 * the entrances they have always had.
 */
const SceneContext = createContext<SceneContextValue>({
  active: false,
  index: 0,
  phase: "unvisited",
  settled: false,
  push: motionValue(0),
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
  /**
   * Override the hold before this scene can be left, in seconds.
   *
   * For a scene that is a thing to be *used* rather than read — the sphere is
   * the one — where the deck's ordinary hold is over before the visitor has
   * worked out that it can be turned.
   */
  dwell?: number;
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

  /**
   * Where each scene's inner scroll was when the visitor left it.
   *
   * A scene is remounted from nothing every time it comes back round, which
   * means its scroller comes back at the top — and for the two scenes that are
   * *scrubbed* by that scroll rather than merely scrolled, the top is frame
   * one. Scrolling back up to the hero played the entire assembly again from
   * the beginning, which is the one thing a deck that remembers its scenes
   * must not do.
   */
  const scrollMemory = useRef<Map<string, number>>(new Map());

  /*
   * Stable, and it ignores being detached.
   *
   * Two separate faults lived here. It was an inline arrow, which React treats
   * as a new ref on every render — detach with null, attach with the element,
   * every time — and since the callback sets state, each render queued
   * another, forever.
   *
   * The null is the worse half, and it survives a `useCallback`. Scenes
   * overlap: the incoming one mounts and sets this, and then, most of a second
   * later, the outgoing one finishes its exit and unmounts — handing this
   * callback a null that wipes the *current* scene's scroller. From that
   * moment `innerScrollHasRoom` said no to everything, so a section with
   * content below the fold gave its wheel to the deck and was skipped past
   * instead of read; and `useScene().scroller` went null, which is what
   * `useScroll` needs to measure against, so the hero and the process stages
   * fell back to a window that never moves and froze.
   *
   * A detach is therefore ignored outright. A scene leaving has nothing to say
   * about which element is current — the one that has just arrived does.
   */
  const attachScroller = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    scrollerRef.current = el;
    setScroller(el);
  }, []);

  // Put a returning scene back where it was left, before the frame is drawn.
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = scrollMemory.current.get(el.id) ?? 0;
  }, [index, scroller]);

  const count = scenes.length;

  /*
   * Which scenes have been shown, and whether the one on screen is one of them.
   *
   * The set is a ref because nothing should re-render when it grows. Whether
   * the *current* scene was already in it has to be state, though, and has to
   * be settled at the moment the scene changes rather than derived while
   * rendering — a scene that recomputed it would flip from playing to settled
   * partway through its own entrance and snap to the end of it.
   */
  const seen = useRef<Set<string>>(new Set());
  const [settled, setSettled] = useState(false);

  /**
   * How many scene changes have happened. Part of the key each scene is
   * mounted under, and the reason the deck cannot lock up.
   *
   * `AnimatePresence` identifies its children by key, and the key was the
   * scene's id. Scenes overlap by design — the outgoing one takes 0.64s to
   * leave — and a scene that has been read can be asked for again 0.3s after
   * it was left. Turn back within that window and the deck tried to mount a
   * child under a key that was already present as an exiting child. It does
   * not resolve that by starting a second copy: the entering scene is dropped,
   * and since the deck's own index had already moved, every input after that
   * was answered by a scene that was not on screen. The deck was simply dead,
   * and only a reload brought it back.
   *
   * Counting the visit into the key makes a return a genuinely new child, so
   * a scene can be arriving and leaving at the same time without the two ever
   * being mistaken for one another.
   */
  const [visit, setVisit] = useState(0);

  useEffect(() => {
    const id = scenes[index]?.id;
    if (id) seen.current.add(id);
  }, [scenes, index]);

  /*
   * The give. How hard the deck is currently being pushed, -1 to 1.
   *
   * The page does not scroll, which leaves nothing to tell a visitor their
   * wheel was heard — a screen that answers a gesture with nothing at all
   * reads as broken long before it reads as deliberate. So the input drives a
   * few pixels of movement in the scene itself: it leans away from the push,
   * settles back slightly in depth, and dims a touch as it goes. Sprung, so a
   * wheel notch — which arrives as one discrete event — lands as a shove and
   * relaxes rather than stepping.
   *
   * Deliberately tiny. 7px and 1.6% is under the threshold of being noticed
   * and well over the threshold of being felt, which is the whole brief. It is
   * also on its own timeline, entirely separate from the scene transition: the
   * two can overlap without either waiting for the other.
   */
  const push = useMotionValue(0);
  const pushRelease = useRef<number | null>(null);

  // Underdamped just enough to have a settle rather than a stop, nowhere near
  // enough to bounce. A deck that springs back visibly is a toy.
  const pushSpring = useSpring(push, {
    stiffness: 240,
    damping: 34,
    mass: 0.45,
  });
  /** Leans away from the push: a shove downwards moves the scene up. */
  const pushY = useTransform(pushSpring, [-1, 1], [7, -7]);
  /* Depth and light both fall off with the *size* of the push regardless of
     its direction — the scene withdraws from the visitor either way, which is
     what makes the next one feel like it is already behind this one. */
  const pushScale = useTransform(pushSpring, (v) => 1 - Math.abs(v) * 0.016);
  const pushDim = useTransform(
    pushSpring,
    (v) => `brightness(${1 - Math.abs(v) * 0.07})`,
  );

  const charge = useCallback(
    (amount: number) => {
      push.set(Math.max(-1, Math.min(1, amount)));
      if (pushRelease.current !== null) window.clearTimeout(pushRelease.current);
      pushRelease.current = window.setTimeout(() => {
        wheelAccumulator.current = 0;
        push.set(0);
      }, PUSH_RELEASE_MS);
    },
    [push],
  );

  const release = useCallback(() => {
    if (pushRelease.current !== null) window.clearTimeout(pushRelease.current);
    pushRelease.current = null;
    push.set(0);
  }, [push]);

  useEffect(() => release, [release]);

  /*
   * One held instruction, for a push that arrived while the deck was busy.
   * See `go`, which is the only place it is set.
   */
  const queued = useRef(0);
  const queuedTimer = useRef<number | null>(null);
  const goRef = useRef<(delta: number) => boolean>(() => false);

  /** Move to `target`, from any input. The one place scene state changes. */
  const jump = useCallback(
    (target: number, delta: number, dwell: number) => {
      // Remember how far into this scene the visitor got, before it goes.
      const leaving = scrollerRef.current;
      if (leaving?.id) scrollMemory.current.set(leaving.id, leaving.scrollTop);

      lockedUntil.current = performance.now() + dwell * 1000;
      wheelAccumulator.current = 0;
      // Any move at all discharges a held one. A visitor who has just clicked
      // a nav link is not also asking for the scroll they abandoned to arrive
      // on top of it.
      queued.current = 0;
      if (queuedTimer.current !== null) {
        window.clearTimeout(queuedTimer.current);
        queuedTimer.current = null;
      }
      release();
      setDirection(delta);
      setSettled(seen.current.has(scenes[target].id));
      setIndex(target);
      setVisit((n) => n + 1);
    },
    [scenes, release],
  );

  /*
   * One held instruction, for a push that arrived while the deck was busy.
   *
   * A scene is locked for its dwell, and a fast scroll spends most of its life
   * inside one of those locks — so every notch of it was being answered with
   * nothing at all, and by the time the lock lifted the gesture was over and
   * its charge had already relaxed away. Scrolling hard did less than
   * scrolling gently, which is the wrong way round and reads as a dead page.
   *
   * A push that lands during a lock is remembered and played the moment the
   * lock ends. Exactly one, never a queue: five notches into a locked scene is
   * a visitor asking to move on, not asking to travel five scenes, and a deck
   * that spends the next fifteen seconds working through a backlog has taken
   * the page away from them.
   */
  const go = useCallback(
    (delta: number) => {
      const now = performance.now();

      if (now < lockedUntil.current) {
        const next = index + delta;
        // Nothing to hold at either end of the deck — the push has nowhere to
        // go when the lock lifts either.
        if (next < 0 || next >= count) return false;

        queued.current = Math.sign(delta);
        if (queuedTimer.current !== null) {
          window.clearTimeout(queuedTimer.current);
        }
        queuedTimer.current = window.setTimeout(
          () => {
            queuedTimer.current = null;
            const held = queued.current;
            queued.current = 0;
            if (held !== 0) goRef.current(held);
          },
          // A few ms past the lock, not exactly on it: `performance.now` and
          // the timer are not the same clock, and landing a millisecond early
          // means the call is refused and the instruction is lost.
          Math.max(0, lockedUntil.current - now) + 16,
        );
        return false;
      }

      const next = index + delta;
      if (next < 0 || next >= count) return false;

      queued.current = 0;
      const target = scenes[next];
      jump(
        next,
        delta,
        // A scene already read is handed back almost immediately. Only a first
        // sighting is worth holding, and only that one has anything to hold
        // for. This is most of what made moving back and forth feel slow.
        seen.current.has(target.id)
          ? SCENE.dwellSettled
          : (target.dwell ?? SCENE.dwell),
      );
      return true;
    },
    [index, count, jump, scenes],
  );

  goRef.current = go;

  useEffect(
    () => () => {
      if (queuedTimer.current !== null) window.clearTimeout(queuedTimer.current);
    },
    [],
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
    /*
     * A scroller with only a few pixels of travel is not a scrolling scene,
     * it is a rounding error — and it used to cost a whole wheel notch to
     * clear before the deck would listen, which is the "I have to scroll
     * twice" of a section that looks like it fits. The floor is well above
     * the fractional-pixel case the old 2px was written for and well below
     * anything a reader would call content.
     */
    if (max <= 24) return false;
    return delta > 0 ? el.scrollTop < max - 2 : el.scrollTop > 2;
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const onWheel = (e: WheelEvent) => {
      const delta = e.deltaY;
      if (innerScrollHasRoom(Math.sign(delta))) return; // the scene wants it

      e.preventDefault();

      /*
       * A real direction change resets the run-up, or a flick down followed by
       * a flick up would arrive already half-charged.
       *
       * "Real" is the part that matters. A fast scroll is not a clean run of
       * same-signed deltas — a trackpad's inertia and a free-spinning wheel
       * both emit the odd small opposite-signed event in the middle of one, and
       * treating each of those as a change of mind zeroed the accumulator over
       * and over. The harder the gesture, the more of them, so the deck was at
       * its most likely to ignore a scroll exactly when the scroll was most
       * emphatic. Anything under this is noise inside a gesture, not a reversal
       * of it.
       */
      const REVERSAL_FLOOR = 12;
      if (
        Math.sign(delta) !== Math.sign(wheelAccumulator.current) &&
        Math.abs(delta) > REVERSAL_FLOOR
      ) {
        wheelAccumulator.current = 0;
      }
      wheelAccumulator.current += delta;

      // The push is answered before the threshold is anywhere near — this is
      // the frame the visitor learns their scroll landed. Clamped, so leaning
      // on the wheel during the hold does not wind up a charge that fires the
      // moment it lifts.
      charge(wheelAccumulator.current / WHEEL_THRESHOLD);

      if (Math.abs(wheelAccumulator.current) > WHEEL_THRESHOLD) {
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
          jump(0, -1, 0);
          break;
        case "End":
          e.preventDefault();
          jump(count - 1, 1, 0);
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
      // A finger gets the give live, under the finger, for the whole length of
      // the drag — the one input where the feedback can track the gesture
      // continuously rather than being fed discrete notches.
      charge(dy / SWIPE_THRESHOLD);
      if (Math.abs(dy) > SWIPE_THRESHOLD) {
        if (go(Math.sign(dy))) touchStart.current = null;
      }
    };

    const onTouchEnd = () => {
      touchStart.current = null;
      release();
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
  }, [reduceMotion, go, innerScrollHasRoom, count, jump, charge, release]);

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

  /* A scene's starting scroll position is handled by the layout effect above,
     which is the only thing that should touch it: this one ran once, on the
     deck's own mount, and said the opposite — every scene starts at the top —
     which is exactly what the memory exists to stop. */

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
      jump(target, target > index ? 1 : -1, 0);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [reduceMotion, scenes, index, jump]);

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
          className={`scene${settled ? " scene--settled" : ""}`}
          custom={direction}
          // Not the id alone — see `visit`.
          key={`${current.id}#${visit}`}
          initial="enter"
          animate="center"
          exit="exit"
          variants={SCENE_VARIANTS}
          aria-roledescription="scene"
          aria-label={`Scene ${index + 1} of ${count}`}
        >
          {/* The give lives on its own element inside the transition's, because
              both want a transform and the outer one is driven by variants —
              a style transform on the same node would be overwritten by the
              animation the moment a scene changed. Two nodes, two timelines,
              neither aware of the other. */}
          <motion.div
            className="scene-push"
            style={{ y: pushY, scale: pushScale, filter: pushDim }}
          >
            {/* The scroller is handed down as state, not as the ref itself: a
                ref is populated after the first render, and a scene reading it
                during that render would measure against the window and stay
                frozen there. Setting state on mount costs one extra render and
                makes the element available on the one that matters. */}
            <SceneContext.Provider
              value={{
                active: true,
                index,
                phase: settled ? "settled" : "playing",
                settled,
                push: pushSpring,
                scroller,
              }}
            >
              <div
                className={current.scrolls ? "scene-scroller" : "scene-fixed"}
                ref={attachScroller}
                id={current.id}
              >
                {current.render()}
              </div>
            </SceneContext.Provider>
          </motion.div>
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
