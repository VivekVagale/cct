import { motion, useReducedMotion } from "framer-motion";
import { useScene } from "@/components/SceneDeck";

interface AnimatedTextProps {
  text: string;
  className?: string;
}

/**
 * A paragraph that fades in.
 *
 * It used to reveal a character at a time, each glyph's opacity driven by its
 * own slice of the page's scroll past the element. That effect cannot exist in
 * a deck: `useScroll` measures the window, the window never moves, and the
 * progress it hands out therefore sits at 0 forever — which rendered the first
 * few words at full strength and left the rest of the sentence at the 0.18 the
 * ramp starts from. Permanently, in the middle of the section.
 *
 * It could have been rewired to the scene's own scroller like the hero and the
 * process stages were. It is not worth it: those two are *scrubbed* by scroll —
 * a frame sequence and five pinned stages, where the scroll position is the
 * animation. This was only ever a fade with extra steps, and a per-character
 * reveal on a paragraph someone is meant to read is a thing that delays the
 * reading. One fade, on the page's own curve, matching every other entrance.
 */
export function AnimatedText({ text, className }: AnimatedTextProps) {
  const reduceMotion = useReducedMotion();
  // A scene already read keeps its paragraph where it was. See SceneDeck.
  const { settled } = useScene();

  if (reduceMotion || settled) {
    return <p className={className}>{text}</p>;
  }

  return (
    <motion.p
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
    >
      {text}
    </motion.p>
  );
}
