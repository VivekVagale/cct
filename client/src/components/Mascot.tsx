import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { MASCOT_POSES, type MascotPose } from "@/data/mascot";
import { cn } from "@/lib/utils";

interface MascotProps {
  pose: MascotPose;
  className?: string;
  /** Enable cursor parallax within the mascot's own bounding area. */
  parallax?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes: Record<NonNullable<MascotProps["size"]>, string> = {
  sm: "w-28 sm:w-36",
  md: "w-40 sm:w-52",
  lg: "w-56 sm:w-72",
  xl: "w-72 sm:w-[26rem]",
};

/**
 * The mascot — same character throughout the site, never redesigned.
 * Only the pose changes per-section; motion is limited to a gentle
 * breathing scale, a slow float, and (optionally) subtle cursor
 * parallax so it reads as present rather than decorative.
 */
export function Mascot({ pose, className, parallax = false, size = "md" }: MascotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const x = useSpring(mvX, { stiffness: 60, damping: 20, mass: 0.6 });
  const y = useSpring(mvY, { stiffness: 60, damping: 20, mass: 0.6 });
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!parallax) return;
    const handle = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const nx = (e.clientX / w - 0.5) * 2;
      const ny = (e.clientY / h - 0.5) * 2;
      mvX.set(nx * 10);
      mvY.set(ny * 8);
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [parallax, mvX, mvY]);

  return (
    <motion.div
      ref={ref}
      className={cn("relative select-none", sizes[size], className)}
      style={parallax ? { x, y } : undefined}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        src={MASCOT_POSES[pose]}
        alt="Cold Chain Theory mascot"
        className="w-full h-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
        animate={{
          y: [0, -10, 0],
          scale: [1, 1.015, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
