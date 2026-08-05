import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import WarpText from "@/components/WarpText";
import { cn } from "@/lib/utils";

interface CinematicLineProps {
  text: string;
  className?: string;
}

/**
 * A full-bleed line of editorial type between major sections, rendered through
 * WarpText — the type is rasterised to a canvas and pushed through a noise
 * field, so it drifts and refracts on its own and bulges under the pointer.
 *
 * This is the only place on the page it belongs, and the reason is worth
 * writing down before someone puts it on a section heading.
 *
 * WarpText is not text. It rasterises to a canvas and hands back a `role="img"`
 * — nothing inside it can be selected, searched, or found by a screen reader
 * beyond its label. On a heading that carries the page's meaning that is a bad
 * trade. These two lines carry none: they are punctuation between chapters,
 * and they are already centred and already display-only, which is the shape the
 * component wants. Every heading that says something stays real type and gets
 * `RevealLines` instead.
 *
 * It is also a WebGL context each. Two here, plus the starfield and the sphere,
 * is four on the page — which holds because WarpText stops its loop when it
 * scrolls out of view and when the tab hides, and only one of these two is ever
 * on screen. Adding more instances is how that stops being true.
 *
 * The scroll entrance stays on the wrapper rather than moving into the
 * component: opacity and y on a plain div composite, where the same values
 * inside would mean re-rasterising the canvas.
 */
export function CinematicLine({ text, className }: CinematicLineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.35"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [28, 0]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full py-20 sm:py-40 flex items-center justify-center text-center px-6",
        className,
      )}
    >
      <motion.div
        style={reduceMotion ? undefined : { opacity, y }}
        className="w-full max-w-4xl"
      >
        {reduceMotion ? (
          // No canvas at all under reduced motion. The shader's whole output is
          // drift, refraction and a ripple — there is nothing left of it to
          // keep, so this falls back to the type it is made of.
          <p className="font-display text-2xl sm:text-5xl md:text-6xl text-[#F5F7FA] leading-[1.15]">
            {text}
          </p>
        ) : (
          <WarpText
            text={text}
            color="#F5F7FA"
            // font-display is on the wrapper and the component inherits it, so
            // the warped type is the same face as the rest of the page.
            fontFamily="inherit"
            fontSize="clamp(1.5rem, 5.5vw, 3.75rem)"
            fontWeight={400}
            letterSpacing="0.04em"
            lineHeight={1.15}
            // Gentler than the stock 0.08/0.38. At the defaults the line
            // visibly swims, which suits a landing-page hero and not a
            // sentence someone is meant to read on the way past.
            warpStrength={0.045}
            warpScale={1.5}
            speed={0.35}
            pointerStrength={0.3}
            refraction={0.012}
            className="font-display !min-h-[7.5rem] sm:!min-h-[11rem]"
          />
        )}
      </motion.div>
    </div>
  );
}
