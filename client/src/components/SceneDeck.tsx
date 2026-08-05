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
  dwell: 0.55,
  /**
   * The hold on a scene that is part of the flow rather than a beat.
   *
   * Barely there. A section the visitor has just read to the end of, still
   * scrolling, should hand over the moment they ask — the section's own length
   * was the pacing, and making them wait again on the far side of it is the
   * page arguing with a decision they have already made twice.
   */
  dwellFlow: 0.15,
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
 * About two firm notches, or one deliberate push.
 *
 * This has been moved twice in both directions and the two failures are worth
 * writing down, because they are not opposites. Too high and a scroll spends
 * its length looking like nothing is happening — that was 90 with a 2.4s hold
 * behind it, and it read as lag. Too low and a scene changes off a gesture the
 * visitor did not think of as a decision, which reads as the page being
 * twitchy and out of their control — that was 62.
 *
 * The hold is what buys the room to sit high: at 0.9s a scene answers a
 * deliberate push immediately, so the threshold no longer has to compensate
 * for a long lockout by firing early. The give is also visible for this whole
 * distance now rather than being over before it starts.
 */
const WHEEL_THRESHOLD = 118;

/** The same, for a finger. */
const SWIPE_THRESHOLD = 72;

/**
 * How long a run of wheel events can pause before the charge is treated as
 * abandoned and relaxes back to nothing. One notch of a mouse wheel is a single
 * event, so this cannot be tight enough to punish a slow, deliberate scroll.
 */
const PUSH_RELEASE_MS = 220;

/**
 * How much of the remaining distance a scrolling scene covers each frame.
 *
 * The deck's scenes used to scroll natively, which means a wheel notch is
 * applied to `scrollTop` in one step and the content arrives where it arrives.
 * That is what "stepped" feels like, and no amount of easing elsewhere hides
 * it, because the thing being eased is not the thing that jumped.
 *
 * So the wheel no longer touches the scroller. It moves a *target*, and each
 * frame the scroller closes a fraction of the gap to it. One notch becomes a
 * short glide; a run of notches becomes one long one, because they land on the
 * target while the element is still travelling toward the last of them. It is
 * the same technique as the smooth-scroll library on the reduced-motion path,
 * applied to the element that actually moves inside a fixed frame.
 *
 * 0.085 is roughly a quarter-second to settle. Lower reads as syrup and puts
 * the content behind the hand; higher gives the step back.
 */
const SCROLL_LERP = 0.085;

/** Below this the glide is over and the last fraction of a pixel is snapped. */
const SCROLL_SETTLE_PX = 0.3;

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
  /**
   * Whether this scene is a beat in the story or a part of the flow.
   *
   * Not every section wants to be launched into. A beat — the sphere, the two
   * title cards, the piece about the studio — is a thing to arrive at, and it
   * gets the full push: the depth, the blur, and a hold long enough to take it
   * in before it can be left. Everything else is a section the visitor is
   * reading their way through, and the change between those should feel like
   * the scroll continuing rather than a slide being advanced — a short
   * dissolve and almost no hold at all, so a continuous scroll runs through
   * them without ever being stopped.
   *
   * A scene that scrolls inside its frame is paced by its own length either
   * way: the deck will not leave it until its content has been read to the
   * end.
   */
  beat?: boolean;
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
export function SceneDeck({
  scenes,
  onSceneChange,
  paused = false,
}: {
  scenes: SceneDefinition[];
  /**
   * Ignore input entirely.
   *
   * Held true while the loading curtain is up. The deck is mounted underneath
   * it so its first scene can fetch what it needs, but a scroll landing during
   * that would scrub an image sequence that is still full of gaps.
   */
  paused?: boolean;
  /**
   * Which scene is on screen, for the few things that live outside the deck
   * and need to know — the starfield behind it, principally.
   */
  onSceneChange?: (index: number, id: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const lockedUntil = useRef(0);
  const wheelAccumulator = useRef(0);
  const touchStart = useRef<number | null>(null);
  /** How far the current drag has already been handed to the scene. */
  const lastTouchDelta = useRef(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [scroller, setScroller] = useState<HTMLElement | null>(null);

  /*
   * Every mounted scene's scroller, by scene id.
   *
   * One element per scene and they all persist, so this is a lookup rather
   * than the single moving target it used to be — which is what made it
   * fragile. It was a lone ref, and the *outgoing* scene's unmount handed it a
   * null most of a second after the incoming scene had set it: from then on
   * `innerScrollHasRoom` said no to everything, so a section with content
   * below the fold gave its wheel to the deck and got skipped instead of read,
   * and `useScene().scroller` went null, which is what the hero's frame
   * sequence and the process stages measure against.
   *
   * Nothing unmounts now, and the current scene's element is looked up rather
   * than remembered.
   */
  const scrollers = useRef<Map<string, HTMLDivElement>>(new Map());
  const attachScroller = useCallback(
    (id: string, el: HTMLDivElement | null) => {
      if (el) scrollers.current.set(id, el);
      else scrollers.current.delete(id);
    },
    [],
  );

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

  /**
   * Every scene that has been reached, and is therefore still on the page.
   *
   * This is the difference between a deck and a slideshow that rebuilds itself.
   * A scene used to be mounted when it became current and thrown away when it
   * stopped being current, which meant going back a chapter reconstructed it
   * from nothing: the DOM again, the WebGL context and its texture atlas again,
   * the frame sequence's canvas again, every entrance from its first frame.
   * Marking the animations as already-played only hid the cheapest part of
   * that.
   *
   * A scene is built once, the first time it is reached, and stays built. Going
   * back is a transition between two things that both already exist. Nothing is
   * re-created, no timeline restarts, and the scene the visitor returns to is
   * the scene they left — same scroll position, same canvas, same everything.
   *
   * Scenes ahead of the furthest point reached are *not* mounted: the deck
   * would otherwise open by building the whole site at once, which is the cost
   * this ordering exists to spread out.
   */
  const [mounted, setMounted] = useState<string[]>([scenes[0]?.id]);

  /**
   * Scenes that have finished leaving and are now stood down.
   *
   * A mounted scene that is not current still costs something — it is painted,
   * it can be tabbed into, and anything inside it driving a canvas thinks it is
   * on screen. Parking sets `content-visibility: hidden`, which skips its
   * rendering entirely while keeping its state, and is what the sphere's and
   * the warped type's intersection observers read to stop drawing.
   *
   * It cannot happen the moment a scene stops being current: it is still
   * visible then, fading out. The exit animation says when.
   */
  const [parked, setParked] = useState<string[]>([]);
  const unpark = useCallback(
    (id: string) => setParked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p)),
    [],
  );

  /*
   * Stand every scene but the current one down, once the transition is over.
   *
   * On a timer rather than on the exit animation's completion callback: that
   * callback does not fire when an animation is interrupted, and interrupting
   * one is exactly what turning back mid-transition does. A scene that missed
   * its callback would stay painted and, worse, would keep its canvases
   * believing they were on screen — the sphere drawing at full rate behind a
   * scene nobody is looking at.
   */
  useEffect(() => {
    const currentId = scenes[index]?.id;
    if (!currentId) return;
    const timer = window.setTimeout(
      () => setParked(mounted.filter((id) => id !== currentId)),
      SCENE.transition * 1000 + 120,
    );
    return () => window.clearTimeout(timer);
  }, [index, mounted, scenes]);

  // Point the wheel logic and `useScene().scroller` at whichever scene is
  // current. A layout effect, so it is true before the frame is painted.
  useLayoutEffect(() => {
    const el = scrollers.current.get(scenes[index]?.id) ?? null;
    scrollerRef.current = el;
    setScroller(el);
  }, [index, scenes, mounted]);


  useEffect(() => {
    const id = scenes[index]?.id;
    if (id) seen.current.add(id);
    if (id) onSceneChange?.(index, id);
  }, [scenes, index, onSceneChange]);

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
      // Build it if this is the first time it has been reached; wake it if it
      // is one we have already been through.
      const id = scenes[target].id;
      setMounted((m) => (m.includes(id) ? m : [...m, id]));
      unpark(id);
      setIndex(target);
    },
    [scenes, release, unpark],
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
      /*
       * Three cases, in order of how little the visitor should be made to
       * wait. A scene already read has nothing left to show and is handed back
       * at once. A scene that is part of the flow gets the flow's hold, which
       * is barely a hold. Only a beat on its first sighting is worth stopping
       * for, and even that one is over well before its entrance is.
       */
      const dwell = seen.current.has(target.id)
        ? SCENE.dwellSettled
        : target.beat
          ? (target.dwell ?? SCENE.dwell)
          : SCENE.dwellFlow;
      jump(next, delta, dwell);
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
  /*
   * The damped scroll for whichever scene is currently scrolling. See
   * SCROLL_LERP. `target` is where the content has been asked to go; the frame
   * loop is what actually moves it there.
   */
  const glideState = useRef({ target: 0, running: false, frame: 0 });

  const runGlide = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) {
      glideState.current.running = false;
      return;
    }
    const max = Math.max(0, el.scrollHeight - el.clientHeight);
    const target = Math.min(max, Math.max(0, glideState.current.target));
    glideState.current.target = target;

    const gap = target - el.scrollTop;
    if (Math.abs(gap) < SCROLL_SETTLE_PX) {
      el.scrollTop = target;
      glideState.current.running = false;
      return;
    }
    el.scrollTop += gap * SCROLL_LERP;
    glideState.current.frame = requestAnimationFrame(runGlide);
  }, []);

  /**
   * Hand a scroll to the current scene, if it has anywhere left to go.
   *
   * Returns whether the scene took it. False means the content is against one
   * of its ends and the push belongs to the deck instead — which is what makes
   * one continuous gesture read the section to its end and then carry on into
   * the next scene without ever being stopped and asked again.
   */
  const glide = useCallback(
    (delta: number) => {
      const el = scrollerRef.current;
      if (!el || !el.classList.contains("scene-scroller")) return false;
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 24) return false;

      const from = glideState.current.target;
      const to = Math.min(max, Math.max(0, from + delta));
      if (to === from) return false;

      glideState.current.target = to;
      if (!glideState.current.running) {
        glideState.current.running = true;
        glideState.current.frame = requestAnimationFrame(runGlide);
      }
      return true;
    },
    [runGlide],
  );

  // A new scene starts its glide from wherever that scene actually is, which
  // for one already visited is where it was left.
  useLayoutEffect(() => {
    glideState.current.target = scrollerRef.current?.scrollTop ?? 0;
  }, [index, scroller]);

  useEffect(
    () => () => cancelAnimationFrame(glideState.current.frame),
    [],
  );

  const innerScrollHasRoom = useCallback((delta: number) => {
    const el = scrollerRef.current;
    if (!el) return false;
    /*
     * Only a scene that actually scrolls can be given the wheel.
     *
     * This used to ask the element how much taller its content was than its
     * box — and a *fixed* scene answers that question too. Its box is
     * `overflow: hidden`, so content that does not quite fit reports travel
     * that can never be travelled: the deck handed every notch to an element
     * whose scrollTop is nailed to zero, waited for it to reach an end it
     * could not reach, and stopped moving for good. One interstitial
     * overflowing by 48px was enough to make the whole page a dead end.
     */
    if (!el.classList.contains("scene-scroller")) return false;
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
    if (reduceMotion || paused) return;

    const onWheel = (e: WheelEvent) => {
      const delta = e.deltaY;

      /*
       * The browser never scrolls anything here. Every notch is taken, and
       * either the current scene glides under it or the deck advances — those
       * are the only two outcomes, and there is no third one where the content
       * jumps by exactly one notch because the default fired.
       */
      e.preventDefault();

      if (glide(delta)) {
        // The section is still being read. Nothing else to do; the frame loop
        // has it from here.
        wheelAccumulator.current = 0;
        return;
      }

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
      lastTouchDelta.current = 0;
      glideState.current.target = scrollerRef.current?.scrollTop ?? 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStart.current === null) return;
      const dy = touchStart.current - (e.touches[0]?.clientY ?? 0);
      // A finger drags the content directly rather than through the damping —
      // under a touch the content should be where the finger is — but the
      // moment it runs out of travel the drag becomes a push on the deck.
      if (glide(dy - lastTouchDelta.current)) {
        lastTouchDelta.current = dy;
        return;
      }
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
      lastTouchDelta.current = 0;
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
  }, [reduceMotion, paused, go, innerScrollHasRoom, count, jump, charge, release, glide]);

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
          <div data-scene={scene.id} key={scene.id}>
            {scene.render()}
          </div>
        ))}
      </>
    );
  }

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
      {scenes.map((scene, i) => {
        if (!mounted.includes(scene.id)) return null;
        const isCurrent = i === index;
        // A scene is stood down once it has finished leaving. Until then it is
        // still on screen, fading out, and must stay drawn.
        const isParked = !isCurrent && parked.includes(scene.id);

        return (
          <motion.div
            key={scene.id}
            className="scene"
            custom={{ direction, beat: Boolean(scene.beat) }}
            variants={SCENE_VARIANTS}
            // `enter` runs on the mount that first shows the scene and never
            // again — a scene mounts once and stays.
            initial="enter"
            animate={isCurrent ? "center" : "exit"}
            style={{
              /* Parked scenes are not painted and cannot be reached: their
                 contents are skipped by the renderer, which is also what tells
                 the sphere's and the warped type's observers to stop drawing.
                 State — including scroll position, a canvas's pixels and every
                 timeline mid-flight — is kept. `visibility` is the fallback
                 where content-visibility is not understood. */
              contentVisibility: isParked ? "hidden" : "visible",
              visibility: isParked ? "hidden" : "visible",
              pointerEvents: isCurrent ? "auto" : "none",
            }}
            inert={!isCurrent}
            aria-hidden={!isCurrent}
            aria-roledescription="scene"
            aria-label={`Scene ${i + 1} of ${count}`}
          >
            {/* The give lives on its own element inside the transition's,
                because both want a transform and the outer one is driven by
                variants — a style transform on the same node would be
                overwritten by the animation the moment a scene changed. Two
                nodes, two timelines, neither aware of the other. */}
            <motion.div
              className="scene-push"
              style={
                isCurrent
                  ? { y: pushY, scale: pushScale, filter: pushDim }
                  : undefined
              }
            >
              <SceneContext.Provider
                value={{
                  active: isCurrent,
                  index: i,
                  phase: isCurrent ? "playing" : "settled",
                  settled: false,
                  push: pushSpring,
                  scroller: isCurrent ? scroller : null,
                }}
              >
                <div
                  className={scene.scrolls ? "scene-scroller" : "scene-fixed"}
                  ref={(el) => attachScroller(scene.id, el)}
                  /* Deliberately not `id`. Every section already carries its
                     own — `#about` belongs to the About section, not to the
                     box the deck happens to put it in — and setting it here as
                     well put two elements with the same id on the page, which
                     makes `getElementById` a coin toss and an anchor
                     ambiguous. The deck matches anchors against its own scene
                     list rather than the DOM, so it never needed one. */
                  data-scene={scene.id}
                >
                  {scene.render()}
                </div>
              </SceneContext.Provider>
            </motion.div>
          </motion.div>
        );
      })}
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
/**
 * What a scene's transition needs to know: which way the deck is going, and
 * whether the scene arriving is a beat or part of the flow.
 */
type SceneMotion = { direction: number; beat: boolean };

const SCENE_VARIANTS = {
  enter: ({ direction, beat }: SceneMotion) => ({
    opacity: 0,
    // A beat arrives from somewhere. A section in the flow is already where it
    // belongs and only has to appear — no depth to travel, no focus to find,
    // because the visitor is reading their way forward rather than being taken
    // somewhere.
    scale: beat ? (direction > 0 ? 0.94 : 1.06) : 1,
    filter: beat ? "blur(14px)" : "blur(0px)",
  }),
  center: ({ direction, beat }: SceneMotion) => ({
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: !beat
      ? { duration: 0.42, ease: [0.16, 1, 0.3, 1] as const }
      : {
      /*
       * Going forward is the story being told and takes the full push. Going
       * back is navigation, and navigation should not be a production number:
       * the scene being returned to is already built and already finished, so
       * the only honest thing left to do is get out of its way. Three quarters
       * of the time, and no blur to resolve — a returning scene that has to
       * come into focus is pretending to be assembling itself, which is the
       * exact impression this deck now exists to avoid.
       */
      duration: direction > 0 ? SCENE.transition : SCENE.transition * 0.55,
      ease: [0.16, 1, 0.3, 1] as const,
      filter: { duration: direction > 0 ? SCENE.transition : 0.18 },
    },
  }),
  exit: ({ direction, beat }: SceneMotion) => ({
    opacity: 0,
    scale: beat ? (direction > 0 ? 1.06 : 0.94) : 1,
    filter: beat ? "blur(14px)" : "blur(0px)",
    transition: !beat
      ? { duration: 0.36, ease: [0.16, 1, 0.3, 1] as const }
      : {
          duration:
            direction > 0 ? SCENE.transition * 0.8 : SCENE.transition * 0.45,
          ease: [0.16, 1, 0.3, 1] as const,
        },
  }),
};
