import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Counts a figure up once, when it first scrolls into view.
 *
 * Takes the display string rather than a number — "1.2M", "138K", "37" — and
 * animates only the numeric part, keeping whatever unit was attached. The data
 * file stays readable that way, and the value that lands is character-for-
 * character the one Instagram reported rather than something reconstructed from
 * a float. A count to 1.2 that ends on "1.1999999M" is the failure this avoids.
 *
 * The final value is also rendered invisibly underneath, which is what reserves
 * the width. Without it the element is as wide as whatever is currently on
 * screen, so "0" growing to "138K" drags the rest of the row along with it for
 * the length of the animation.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  // once: true — the same contract as every other reveal on the page, so
  // scrolling back up does not replay it.
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();

  // Split "1.2M" into 1.2 and "M". Anything without a leading number is passed
  // through untouched rather than animated to NaN.
  const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(value.trim());
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : "";
  // Decimal places come from the source string, so 1.2 counts through tenths
  // and 37 counts through whole numbers.
  const decimals = match?.[1].includes(".") ? match[1].split(".")[1].length : 0;

  // The mid-flight value, and whether the count has finished.
  //
  // `done` is tracked separately rather than inferred from "no current frame".
  // Inferring it meant the gap between the element entering view and the
  // animation's first frame rendered the *final* value, which then dropped to
  // zero and counted back up — measured at ~1.4s of the answer sitting on
  // screen before the animation visibly undid it.
  const [frame, setFrame] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // A wall of spinning digits is exactly what this setting is for, and an
  // unparseable value has nothing to count. Both skip straight to the answer.
  const willAnimate = target !== null && !reduceMotion;

  useEffect(() => {
    if (!willAnimate || !inView) return;

    const controls = animate(0, target, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setFrame(v.toFixed(decimals)),
      // Land on the source string, not on the animation's last frame.
      onComplete: () => setDone(true),
    });
    return () => controls.stop();
  }, [inView, willAnimate, target, decimals]);

  /*
   * Three states, in order of precedence:
   *   not animating (reduced motion, or an unparseable value) → the answer
   *   finished                                                → the answer
   *   anything else                                           → 0, then frames
   *
   * The last one is the important case: until the animation produces a frame,
   * the figure holds at zero. It must not fall back to `value` there, or the
   * answer flashes up and then counts itself back from nothing.
   */
  const shown = !willAnimate || done ? value : `${frame ?? 0}${suffix}`;

  return (
    <span ref={ref} className={cn("relative inline-block", className)}>
      {/* Reserves the final width so the row does not shuffle as digits are
          added. aria-hidden, so the value is announced once, not twice. */}
      <span aria-hidden className="invisible">
        {value}
      </span>
      <span className="absolute inset-0">{shown}</span>
    </span>
  );
}
