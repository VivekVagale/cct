import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * The page's one entrance.
 *
 * Sections were each doing their own `initial`/`whileInView` pair with their
 * own duration and their own distance — 0.7s here, 0.9s there, 20px, 30px,
 * some with a delay and some without. Individually all fine; together they
 * read as a dozen unrelated animations rather than as one camera moving down a
 * page, which is most of what made the scroll feel like stacked divs.
 *
 * One component, one curve, one distance. What varies is `delay`, which is how
 * a group of children stagger, and `distance`, for the rare thing that needs
 * to travel further than a paragraph.
 *
 * Slower than what it replaces, deliberately. 1.1s against 0.7-0.9, on the
 * site's own easing — which spends most of its time decelerating, so the last
 * third of the move is almost still and the element settles rather than
 * stopping.
 *
 * `amount: 0.25` and `once` are the other half of the feel: the element starts
 * when a quarter of it is in view rather than at its first pixel, and having
 * arrived it stays. Re-animating on the way back up is the single fastest way
 * to make a long page feel like a toy.
 *
 * Only transform and opacity, so every one of these is a compositor job.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = 28,
  /** A touch of scale, for images and cards. Off for type, which it blurs. */
  scale = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  scale?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance, scale: scale ? 0.965 : 1 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A layer that moves at its own speed as the page passes it.
 *
 * Foreground and background travelling together is what makes a page read as
 * flat. Giving a backdrop a slower rate than the type over it separates the
 * two in depth for the cost of one transform — and it is a transform, so it
 * composites rather than laying out.
 *
 * `speed` is how far the layer drifts across its own passage, in px. Positive
 * lags behind the scroll (background), negative runs ahead of it (foreground).
 * Keep it small: past about 120 the parallax stops reading as depth and starts
 * reading as the element being in the wrong place.
 *
 * Sprung, not linear. Wheel input is stepped even under Lenis at the moment a
 * notch lands, and a raw transform of it lands with it; the spring is what
 * turns the step into a drift.
 */
export function useParallax(
  ref: React.RefObject<HTMLElement | null>,
  speed = 60,
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [-speed, speed]);
  return useSpring(raw, { stiffness: 90, damping: 30, mass: 0.5 });
}

/**
 * A headline that arrives a line at a time.
 *
 * Takes its lines as an array rather than splitting a string, because there is
 * no reliable way to know where a browser will break a line until it has, and
 * a reveal that guesses wrong staggers half a word. The call site knows the
 * copy; it can say where the breaks are.
 *
 * Each line is masked by its own overflow-hidden box and rises into it, so the
 * type appears from behind an edge rather than fading in place — the same
 * gesture as a title card.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  if (reduceMotion) {
    return (
      <div className={className}>
        {lines.map((line) => (
          <span className={lineClassName} key={line} style={{ display: "block" }}>
            {line}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={className} ref={ref}>
      {lines.map((line, i) => (
        // The mask. Its height comes from the line inside it, so nothing here
        // needs to know the type's line-height.
        <span key={line} style={{ display: "block", overflow: "hidden" }}>
          <motion.span
            className={lineClassName}
            initial={{ y: "110%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 1.1,
              // 90ms apart. Close enough to read as one movement, far enough
              // that the eye follows it down the block.
              delay: delay + i * 0.09,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ display: "block" }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </div>
  );
}
