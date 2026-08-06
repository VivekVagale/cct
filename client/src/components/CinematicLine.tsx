import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import WarpText from "@/components/WarpText";
import { useScene } from "@/components/SceneDeck";
import { cn } from "@/lib/utils";

interface CinematicLineProps {
  text: string;
  className?: string;
  /** The anchor this title card answers to. Each one owns its own id. */
  id?: string;
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
export function CinematicLine({ text, className, id }: CinematicLineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  /*
   * In the deck this line is a title card on a screen of its own, and its
   * entrance is the deck's — `.scene-heading` fades and unblurs it on the
   * scene's own clock.
   *
   * The scroll-linked opacity below must not run there. It is driven by the
   * window's scroll position, and in the deck the window never moves: the
   * transform would sit at its starting value and hold the card at opacity 0
   * forever, which is a blank screen rather than a subtle reveal. It stays for
   * the reduced-motion document, where the window does scroll.
   */
  const { active: inDeck } = useScene();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.35"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [28, 0]);

  return (
    <div
      ref={ref}
      id={id}
      className={cn(
        /* Height follows the type, with a floor so the card still reads as a
           full moment rather than a band. It used to be `h-full` clipped to the
           screen, which was right while this was a fixed scene and wrong now:
           the line runs to two lines at this size, and a clipped card would cut
           the second one off with no way to scroll to it. */
        "relative w-full min-h-[78vh] py-[8vh] flex items-center justify-center text-center px-4 sm:px-6",
        className,
      )}
    >
      <motion.div
        style={reduceMotion || inDeck ? undefined : { opacity, y }}
        className="scene-heading w-full max-w-[88vw]"
      >
        {reduceMotion ? (
          // No canvas at all under reduced motion. The shader's whole output is
          // drift, refraction and a ripple — there is nothing left of it to
          // keep, so this falls back to the type it is made of.
          <p className="font-display text-5xl sm:text-8xl md:text-9xl text-[#F5F7FA] leading-[1.02]">
            {text}
          </p>
        ) : (
          <WarpText
            text={text}
            color="#F5F7FA"
            // font-display is on the wrapper and the component inherits it, so
            // the warped type is the same face as the rest of the page.
            fontFamily="inherit"
            /* Sized to the screen, not to a line of copy — and no longer
               capped at whatever kept it on one line. Two lines is the better
               shape for a card anyway: a single line spanning a 1920px monitor
               is a strip of type, where two stacked lines are a title. The rem
               floor keeps it readable on a phone; the ceiling only stops it
               outgrowing a very wide monitor. */
            fontSize="clamp(3.5rem, 15vw, 17rem)"
            fontWeight={400}
            letterSpacing="0.01em"
            lineHeight={1.02}
            /*
             * Past the stock defaults now, not under them.
             *
             * The earlier numbers were set for a band inside a scrolling
             * document, where the line went past and had to stay legible on
             * the way. In the deck it is a title card on a screen of its own
             * with nothing else on it and five seconds to be looked at — the
             * restraint was reading as a static line with a slight wobble
             * rather than as an effect. The type is roughly half again as
             * large and the field moves enough to see it move.
             */
            warpStrength={0.11}
            warpScale={1.9}
            speed={0.6}
            pointerStrength={0.85}
            refraction={0.03}
            /* In vh, not rem. The card is a fixed scene now — whatever this
               reserves has to fit the screen it is on, at every size, or the
               scene clips content it can never scroll to. */
            className="font-display !min-h-[46vh] sm:!min-h-[58vh]"
          />
        )}
      </motion.div>
    </div>
  );
}
