import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";
import { processStages, type ProcessStage } from "@/data/content";
import { Mascot } from "@/components/Mascot";

/**
 * A vertical cinematic journey: the section pins once and each stage occupies
 * the whole viewport, crossfading into the next as you scroll.
 *
 * Stages overlap deliberately — the outgoing mascot is still fading as the
 * incoming one arrives — so there is never a frame where the stage is empty
 * and never a hard cut between them. The mascot is the composition here, not
 * an illustration beside the text: it is absolutely positioned, scaled to
 * roughly half the viewport, and the type sits over it.
 *
 * Note this deliberately avoids a progress rail with stage dots down the edge;
 * that pattern was built once before and rejected.
 */
export function CreativeProcess() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const progress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 36,
    mass: 0.4,
    restDelta: 0.0005,
  });

  // The heading recedes as the first stage takes over, so the section reads as
  // one continuous move rather than a titled block followed by content.
  const headingOpacity = useTransform(progress, [0, 0.12], [1, 0]);
  const headingY = useTransform(progress, [0, 0.12], ["0vh", "-8vh"]);

  return (
    <section
      id="process"
      ref={ref}
      className="relative pointer-events-auto"
      style={{ height: `${processStages.length * 100}vh` }}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <motion.div
          style={{ opacity: headingOpacity, y: headingY }}
          className="absolute inset-x-0 top-[16%] z-20 px-6 sm:px-10 max-w-[1600px] mx-auto pointer-events-none"
        >
          <p className="text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-4">How We Work</p>
          <h2 className="font-display text-4xl sm:text-6xl text-[#F5F7FA] leading-[1.05]">
            Creative Process
          </h2>
        </motion.div>

        {processStages.map((stage, i) => (
          <Stage key={stage.index} stage={stage} index={i} progress={progress} />
        ))}
      </div>
    </section>
  );
}

function Stage({
  stage,
  index,
  progress,
}: {
  stage: ProcessStage;
  index: number;
  progress: MotionValue<number>;
}) {
  const count = processStages.length;
  // Each stage owns a slice of the scroll, with the window reaching into its
  // neighbours so the crossfades overlap instead of butting up against each other.
  const span = 1 / count;
  const at = (index + 0.5) * span;

  // Narrow enough that only one stage is ever legible — a wider window puts
  // two stages' type on top of each other — but still wide enough that the
  // handover is a crossfade rather than a cut.
  const opacity = useTransform(
    progress,
    [at - span * 0.58, at - span * 0.24, at + span * 0.24, at + span * 0.58],
    [0, 1, 1, 0],
  );
  // A slow drift through the frame; the mascot never simply cuts into place.
  const y = useTransform(progress, [at - span, at + span], ["8vh", "-8vh"]);
  const scale = useTransform(progress, [at - span, at, at + span], [0.95, 1, 1.03]);

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 flex items-center justify-center">
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <Mascot
          pose={stage.pose}
          animateIn={false}
          parallax
          sizing="height"
        className="h-[52vh] sm:h-[58vh]"
        />
      </motion.div>

      <motion.div
        style={{ y }}
        className="absolute inset-x-0 bottom-[8%] flex flex-col items-center text-center gap-2 px-6 pointer-events-none"
      >
        <span className="font-display font-black text-[#F5F7FA]/20 leading-none text-6xl sm:text-8xl">
          {stage.index}
        </span>
        <h3 className="font-display text-3xl sm:text-5xl text-[#F5F7FA]">{stage.title}</h3>
        <p className="text-sm sm:text-base text-[#B8C4D6] leading-relaxed max-w-lg">
          {stage.description}
        </p>
      </motion.div>
    </motion.div>
  );
}
