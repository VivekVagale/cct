import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface CinematicLineProps {
  text: string;
  className?: string;
}

/**
 * A full-bleed line of editorial type used between major sections,
 * with a subtle scroll-linked reveal (opacity + tracking + rise).
 */
export function CinematicLine({ text, className }: CinematicLineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.35"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [28, 0]);
  const letterSpacing = useTransform(scrollYProgress, [0, 1], ["0.02em", "0.06em"]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full py-20 sm:py-40 flex items-center justify-center text-center px-6",
        className,
      )}
    >
      <motion.p
        style={{ opacity, y, letterSpacing }}
        className="font-display text-2xl sm:text-5xl md:text-6xl text-[#F5F7FA] max-w-4xl leading-[1.15]"
      >
        {text}
      </motion.p>
    </div>
  );
}
