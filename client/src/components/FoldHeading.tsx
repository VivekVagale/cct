import FoldText from "@/components/FoldText";

/**
 * A section heading that unfolds a word at a time as it comes into view.
 *
 * Wraps FoldText so the page's headings share one set of numbers instead of
 * each call site inventing its own, and so the two things that have to be got
 * right are got right once.
 *
 * **It stays real text.** FoldText renders spans and keeps a screen-reader copy
 * beside the visual one, which is why the headings use this and the two
 * interstitials use WarpText — that one rasterises to a canvas and hands back
 * an image. Put this inside the real `h2`; the heading tag, its size and its
 * colour stay where they were.
 *
 * **It inherits its type.** `fontSize`, `fontWeight` and `color` are all
 * `inherit`, so the heading's own classes still govern. The stylesheet's
 * `line-height: 0.95` and `letter-spacing: -0.04em` are not inherited though —
 * they are set on `.fold-text` itself, unlayered, which beats a Tailwind
 * utility. The `!` prefixes below are what put the page's leading back.
 *
 * Word, not character. A char split on "Ready to turn your machine into
 * cinema." is 42 hinges and reads as a slot machine; a word split is nine and
 * reads as a title card. The timing is the page's — around a second, on the
 * same curve everything else enters with.
 */
export function FoldHeading({
  text,
  className = "",
  stagger = 0.06,
}: {
  text: string;
  className?: string;
  stagger?: number;
}) {
  return (
    <FoldText
      text={text}
      color="inherit"
      duration={1}
      ease="power3.out"
      fontSize="inherit"
      fontWeight="inherit"
      hinge="top"
      splitBy="word"
      stagger={stagger}
      trigger="scroll"
      // Shallower than the stock 700. At that depth a word at the outside of a
      // wide heading swings far enough to read as falling off the line rather
      // than folding down onto it.
      perspective={1100}
      creaseShading={0.4}
      className={`!leading-[1.05] !tracking-normal ${className}`.trim()}
    />
  );
}
