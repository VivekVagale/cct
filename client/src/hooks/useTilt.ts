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
 * The one line that puts the tilt back.
 *
 * Off while we see how the desktop feels without it. Navigation was heavy, and
 * this is the remaining thing doing work on every pointer move: two springs per
 * card, each writing a transform frame by frame, across a grid of sixty-four —
 * plus a radial-gradient string rebuilt per move for the cursor-follow sheen.
 *
 * `true` restores all of it. Nothing else has to change: the springs, the
 * handlers and the components that read them are untouched, and with this off
 * the motion values simply never receive a value.
 *
 * What survives either way is the sheen's own `group-hover` opacity, which is
 * CSS. With the tracking off it sits centred on the card instead of following
 * the cursor — a plain highlight on hover rather than none at all.
 */
const TILT_ENABLED = false;

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
