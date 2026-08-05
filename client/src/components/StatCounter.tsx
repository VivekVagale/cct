import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import Counter from "@/components/Counter";

/**
 * A reach figure, rolled up a digit at a time.
 *
 * Wraps the React Bits Counter, which is a good odometer and not a
 * scroll-triggered one — three things it does not do on its own have to happen
 * here.
 *
 * **It has to be told to start.** The vendored component seeds its spring at
 * the value it is handed and then sets the same value, so nothing moves on
 * mount. Held at 0 until the figure is actually on screen, it rolls.
 *
 * **The places have to be fixed up front.** Left to itself it derives them from
 * the current value, so a counter animating 0 to 1.2 would render one digit
 * wide, then three — a layout shift in the middle of its own animation, in a
 * row of five. They are computed once from the target instead.
 *
 * **The suffix is not its business.** Instagram reports 1.2M and 138K, and a
 * digit-roller that had to spell out 1,200,000 would be seven digits wide and
 * would claim a precision the export does not have. The letter is type beside
 * the counter, not part of it.
 */
/**
 * The reel is laid out against a pixel height, so the size cannot come from a
 * responsive class — the component has to know the number it is measuring
 * with. Read here rather than passed from the call site as two elements at two
 * breakpoints: that renders both, and the hidden one still mounts ten springs
 * per digit and animates them where nobody can see it.
 *
 * 24 and 36 are what text-2xl and text-4xl resolve to; 640px is `sm`.
 */
const WIDE_QUERY = "(min-width: 640px)";

export function StatCounter({
  amount,
  suffix,
}: {
  amount: number;
  /** K, M — rendered as type, not rolled. */
  suffix?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [wide, setWide] = useState(
    () => typeof window !== "undefined" && window.matchMedia(WIDE_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(WIDE_QUERY);
    const sync = () => setWide(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const fontSize = wide ? 36 : 24;
  const ref = useRef<HTMLSpanElement>(null);
  // `once`, and a third of the way in. A figure that re-rolls every time it
  // crosses the fold reads as a gimmick rather than as a number.
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (inView) setValue(amount);
  }, [inView, amount]);

  // Derived from the target, never from the animating value — see above.
  const places = [...amount.toString()].map((ch, i, all) => {
    if (ch === ".") return "." as const;
    const dot = all.indexOf(".");
    const exponent = dot === -1 ? all.length - i - 1 : i < dot ? dot - i - 1 : -(i - dot);
    return 10 ** exponent;
  });

  if (reduceMotion) {
    return (
      <span ref={ref}>
        {amount}
        {suffix}
      </span>
    );
  }

  return (
    <span className="inline-flex items-baseline" ref={ref}>
      <Counter
        // The digits are already spaced by their own 1ch boxes; the stock 8px
        // gap on top of that reads as five separate numbers rather than one.
        gap={0}
        // The gradients mask the top and bottom of the reel. They are the page's
        // own background, not the stock black, or they draw two grey bands
        // across every figure.
        gradientFrom="#05070A"
        gradientHeight={fontSize * 0.28}
        gradientTo="transparent"
        fontSize={fontSize}
        // No padding and no chrome: this sits in a row of type, not in a box.
        horizontalPadding={0}
        padding={0}
        places={places}
        // A long roll, not a flick.
        //
        // On the stock spring a figure was at rest in about half a second —
        // the reel had barely become a reel before it stopped being one, and
        // in a row of five the last of them had settled before the eye
        // reached it. Soft and heavy: roughly two and a half seconds to
        // settle, and the high damping against that low stiffness is what
        // stops a slow spring from overshooting and rocking on the final
        // digit.
        spring={{ stiffness: 26, damping: 26, mass: 1.4 }}
        textColor="#F5F7FA"
        value={value}
      />
      {suffix && <span>{suffix}</span>}
    </span>
  );
}
