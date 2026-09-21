import { useRef, type MouseEvent } from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Whether there is a pointer to follow at all.
 *
 * Read once at module scope rather than per card: a grid renders sixty-four of
 * these, and the answer cannot change for a device mid-session in any way that
 * matters — a phone does not grow a mouse.
 *
 * Not `'ontouchstart' in window`, which is true on a touchscreen laptop that
 * also has a trackpad. `(hover: none)` is the actual question: can this input
 * rest over an element without committing to it? If it cannot, there is no
 * hover state to preview and nothing for the tilt to track.
 */
const CAN_HOVER =
  typeof window === "undefined" ||
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * The one line that takes the tilt back out.
 *
 * It was off for a spell while the desktop's navigation lag was being chased,
 * and it turned out not to be the cause: clicking a marque cost one 385ms task
 * on the main thread, and that was sixty-four BorderBeams being torn down as the
 * grid filtered, not these springs. The grid stopped carrying beams and the task
 * went to nothing, so the tilt came back.
 *
 * `false` disables it without touching anything else: the springs, the handlers
 * and the components reading them stay as they are, and the motion values simply
 * never receive a value. Worth reaching for if a low-end machine struggles —
 * this is still two springs per card writing a transform on every pointer move,
 * plus a radial-gradient string rebuilt per move for the cursor-follow sheen.
 * It is just no longer the expensive thing.
 */
const TILT_ENABLED = true;

/**
 * Shared 3D cursor-tilt behavior: continuous rotation from pointer
 * position (±12° on both axes, spring-eased) plus a cursor-follow
 * radial highlight. Used by any card that should feel like a
 * premium automotive configurator tile.
 *
 * Inert on a touchscreen, and that is not an optimisation.
 *
 * A tap emits compatibility mouse events — `mousemove` then `mouseup` — with no
 * `mouseleave` behind them, so every handler here fires on touch and then never
 * unfires. The card tilts to wherever the thumb landed and stays tilted, and the
 * cursor-follow highlight sits burned into the spot that was last touched, on a
 * card the visitor has already selected and moved on from. Sixty-four cards in
 * the machine grid, each holding a stale pose.
 *
 * It is also a spring per card per axis, animating transforms in a grid that is
 * already scrolling — paid for on the device least able to afford it, to show an
 * effect that exists to invite a cursor that is not there.
 *
 * `whileTap` is untouched and still runs. That one answers a real gesture.
 */
export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const mvX = useMotionValue(0.5);
  const mvY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mvY, [0, 1], [12, -12]), {
    stiffness: 220,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mvX, [0, 1], [-12, 12]), {
    stiffness: 220,
    damping: 20,
  });

  const glowX = useTransform(mvX, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(mvY, [0, 1], ["0%", "100%"]);
  const glowBackground = useTransform([glowX, glowY], (latest) => {
    const [gx, gy] = latest as [string, string];
    return `radial-gradient(280px circle at ${gx} ${gy}, rgba(255,255,255,0.14), transparent 65%)`;
  });

  const onMouseMove = (e: MouseEvent<T>) => {
    if (!TILT_ENABLED || !CAN_HOVER) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mvX.set((e.clientX - rect.left) / rect.width);
    mvY.set((e.clientY - rect.top) / rect.height);
  };

  const onMouseLeave = () => {
    if (!TILT_ENABLED) return;
    mvX.set(0.5);
    mvY.set(0.5);
  };

  return { ref, rotateX, rotateY, glowBackground, onMouseMove, onMouseLeave };
}
