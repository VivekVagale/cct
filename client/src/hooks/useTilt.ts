import { useRef, type MouseEvent } from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Shared 3D cursor-tilt behavior: continuous rotation from pointer
 * position (±12° on both axes, spring-eased) plus a cursor-follow
 * radial highlight. Used by any card that should feel like a
 * premium automotive configurator tile.
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
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mvX.set((e.clientX - rect.left) / rect.width);
    mvY.set((e.clientY - rect.top) / rect.height);
  };

  const onMouseLeave = () => {
    mvX.set(0.5);
    mvY.set(0.5);
  };

  return { ref, rotateX, rotateY, glowBackground, onMouseMove, onMouseLeave };
}
