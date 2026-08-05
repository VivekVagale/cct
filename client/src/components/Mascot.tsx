import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { MASCOT_POSES, type MascotPose } from "@/data/mascot";
import { useScene } from "@/components/SceneDeck";
import { cn } from "@/lib/utils";

interface MascotProps {
  pose: MascotPose;
  className?: string;
  /** Enable cursor parallax within the mascot's own bounding area. */
  parallax?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Scroll-triggered fade/rise on entry. The Hero disables this: it hands off
   * from the final frame of the image sequence, and the transition only reads
   * as invisible if the mascot is already at rest when it appears.
   */
  animateIn?: boolean;
  /**
   * Which axis drives the mascot's size. The other follows from the image's own
   * proportions, so the pose is never stretched.
   *
   * This is a prop rather than something call sites override with classes: the
   * image needs `w-full h-auto` in one mode and `h-full w-auto` in the other,
   * and passing the opposite pair through `className` leaves both on the
   * element, which renders as `object-fit: fill` and squashes the pose.
   */
  sizing?: "width" | "height";
}

/*
 * The mobile step of each size is a vw-capped min(), not a fixed width.
 *
 * These were fixed rem widths at every viewport, and the top two were wider
 * than the phone they had to fit inside: xl is 24rem, or 384px, against a
 * 375px viewport that has already spent 48px on the section's own gutters. The
 * mascot pushed the document wider than the screen, and because the page has no
 * horizontal-overflow guard that turned into a sideways scroll on every section
 * one appeared in.
 *
 * The cap is against the gutters rather than the full viewport — 78vw leaves
 * the pose clear of both edges instead of bleeding into them.
 */
const sizes: Record<NonNullable<MascotProps["size"]>, string> = {
  sm: "w-[min(12rem,52vw)] sm:w-64",
  md: "w-[min(15rem,64vw)] sm:w-80",
  lg: "w-[min(18rem,72vw)] sm:w-[26rem]",
  xl: "w-[min(20rem,78vw)] sm:w-[34rem]",
};

/**
 * The mascot — same character throughout the site, never redesigned.
 * Only the pose changes per-section; motion is limited to a gentle
 * breathing scale, a slow float, and (optionally) subtle cursor
 * parallax so it reads as present rather than decorative.
 */
export function Mascot({
  pose,
  className,
  parallax = false,
  size = "md",
  animateIn = true,
  sizing = "width",
}: MascotProps) {
  // A pose on a scene already read is simply standing there. Its rise and fade
  // belong to the first sighting, not to every return. The breathing loop on
  // the image below is not an entrance and keeps running.
  const { settled } = useScene();
  const entering = animateIn && !settled;

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

  /*
   * Two nodes, because the parallax and the entrance both want `y`.
   *
   * They used to share one: `style={{ x, y }}` put a spring on the element's
   * y, and `animate` set that same y to 0 on every render. Nothing was wrong
   * on a static page — but the booking form re-renders on each keystroke and
   * each pick, and every one of those renders had framer reassert y: 0 over a
   * spring the pointer was still driving. That fight is the stutter that
   * appeared beside step 02 as soon as a vehicle and a colour were chosen.
   *
   * The outer element carries the pointer parallax and the sizing; the inner
   * one carries the entrance. Neither can touch the other's transform.
   */
  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative select-none",
        sizing === "width" ? sizes[size] : "w-fit",
        className,
      )}
      style={parallax ? { x, y } : undefined}
    >
      <motion.div
        className="w-full h-full"
        initial={entering ? { opacity: 0, y: 24 } : false}
        animate={entering && !inView ? { opacity: 0, y: 24 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
      <motion.img
        src={MASCOT_POSES[pose]}
        alt="Cold Chain Theory mascot"
        className={cn(
          "block drop-shadow-[0_20px_60px_rgba(0,0,0,0.55)]",
          // Exactly one axis is constrained; the other is intrinsic, so the
          // rendered aspect always matches the file's.
          sizing === "width" ? "w-full h-auto" : "h-full w-auto max-w-none",
        )}
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
    </motion.div>
  );
}
