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

  const total = text.length;

  /*
   * Split into words, not straight into characters.
   *
   * Every character is its own inline-block — it has to be, so each can carry
   * its own opacity — and the browser treats each one as a box it may wrap
   * after. Handed the string a glyph at a time it broke lines mid-word:
   * "pr / ojects", "Craftsmanshi / p". It was always wrong and merely survivable
   * in a wide column, where few lines end inside a word; at a phone's measure
   * most of them do.
   *
   * Each word becomes one nowrap box, and the spaces between them are left as
   * ordinary text so they stay the only place a line can break. The spaces are
   * not animated — they are invisible either way, and keeping them out of the
   * markup is what leaves a real break opportunity behind.
   *
   * Indices stay keyed to position in the original string, so the reveal is
   * timed exactly as before.
   */
  const tokens: { text: string; start: number }[] = [];
  let cursor = 0;
  for (const token of text.split(/(\s+)/)) {
    if (token) tokens.push({ text: token, start: cursor });
    cursor += token.length;
  }

  return (
    <p ref={ref} className={className}>
      {tokens.map((token, t) =>
        /\s/.test(token.text) ? (
          <span key={t}> </span>
        ) : (
          <span key={t} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {token.text.split("").map((char, i) => (
              <Char
                key={i}
                char={char}
                index={token.start + i}
                total={total}
                progress={scrollYProgress}
              />
            ))}
          </span>
        ),
      )}
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

  // Only ever a non-space now \u2014 the spaces are plain text between the words \u2014
  // so the nbsp substitution the old version needed is gone with them.
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ visibility: "hidden" }}>{char}</span>
      <motion.span style={{ opacity, position: "absolute", left: 0, top: 0 }}>{char}</motion.span>
    </span>
  );
}
