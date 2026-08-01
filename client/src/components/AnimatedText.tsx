import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
}

/**
 * Reveals text character by character as it scrolls through view —
 * each glyph's opacity is driven by its position in the string
 * relative to overall scroll progress, rather than a single fade.
 */
export function AnimatedText({ text, className }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.35"],
  });

  const chars = text.split("");

  return (
    <p ref={ref} className={className}>
      {chars.map((char, i) => (
        <Char key={i} char={char} index={i} total={chars.length} progress={scrollYProgress} />
      ))}
    </p>
  );
}

function Char({
  char,
  index,
  total,
  progress,
}: {
  char: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.18, 1]);

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ visibility: "hidden" }}>{char === " " ? "\u00A0" : char}</span>
      <motion.span style={{ opacity, position: "absolute", left: 0, top: 0 }}>
        {char === " " ? "\u00A0" : char}
      </motion.span>
    </span>
  );
}
