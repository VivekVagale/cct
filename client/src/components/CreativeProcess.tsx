import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";
import { processStages, type ProcessStage } from "@/data/content";
import { Mascot } from "@/components/Mascot";
import { useIsMobile } from "@/hooks/useMobile";

/**
 * A horizontal cinematic journey rather than a vertical timeline.
 *
 * On desktop the section pins and vertical scroll drives the track sideways,
 * so the pipeline reads as one continuous move through the stages. On mobile
 * that inversion fights the platform's own scrolling, so it degrades to a
 * native snap carousel — same composition, thumb-driven.
 */
export function CreativeProcess() {
  const isMobile = useIsMobile();

  return (
    <section id="process" className="relative pointer-events-auto">
      {isMobile ? <MobileTrack /> : <PinnedTrack />}
    </section>
  );
}

function SectionHeading({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-4">How We Work</p>
      <h2 className="font-display text-4xl sm:text-6xl text-[#F5F7FA] leading-[1.05]">
        Creative Process
      </h2>
    </div>
  );
}

function PinnedTrack() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const progress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 36,
    mass: 0.4,
    restDelta: 0.0005,
  });

  // One panel per stage; the track travels its own width minus one viewport.
  const shift = ((processStages.length - 1) / processStages.length) * 100;
  const x = useTransform(progress, [0, 1], ["0%", `-${shift}%`]);
  const lineScale = useTransform(progress, [0, 1], [0, 1]);

  return (
    <div ref={ref} style={{ height: `${processStages.length * 100}vh` }} className="relative">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col">
        <div className="max-w-[1600px] w-full mx-auto px-6 sm:px-10 pt-24 sm:pt-28 shrink-0">
          <SectionHeading />
        </div>

        {/* Energy line: fills left to right as the pipeline advances. */}
        <div className="relative h-px mt-10 mx-6 sm:mx-10 bg-white/[0.08] shrink-0">
          <motion.div
            style={{ scaleX: lineScale }}
            className="absolute inset-0 origin-left bg-gradient-to-r from-[#4DD8E8]/40 via-[#4DD8E8] to-[#4DD8E8]/40"
          />
        </div>

        <motion.div
          style={{ x, width: `${processStages.length * 100}%` }}
          className="flex flex-1 min-h-0"
        >
          {processStages.map((stage, i) => (
            <Panel key={stage.index} stage={stage} index={i} progress={progress} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Stages brighten as they approach and dim once passed, so the active one
 * carries the eye without the others disappearing.
 */
function Panel({
  stage,
  index,
  progress,
}: {
  stage: ProcessStage;
  index: number;
  progress: MotionValue<number>;
}) {
  const last = processStages.length - 1;
  const at = index / last;
  const span = 1 / last;

  const opacity = useTransform(
    progress,
    [at - span, at - span * 0.35, at, at + span * 0.35, at + span],
    [0.25, 0.6, 1, 0.6, 0.25],
  );
  const scale = useTransform(progress, [at - span, at, at + span], [0.92, 1, 0.92]);

  return (
    <motion.div
      style={{ opacity, scale, width: `${100 / processStages.length}%` }}
      className="shrink-0 h-full flex flex-col items-center justify-center gap-6 px-6 sm:px-10 text-center"
    >
      <Mascot
        pose={stage.pose}
        animateIn={false}
        className="w-auto h-[34vh] [&>img]:h-full [&>img]:w-auto"
      />
      <div className="flex flex-col items-center gap-3 max-w-md">
        <span className="font-display font-black text-[#F5F7FA]/25 leading-none text-5xl sm:text-6xl">
          {stage.index}
        </span>
        <h3 className="font-display text-2xl sm:text-4xl text-[#F5F7FA]">{stage.title}</h3>
        <p className="text-sm sm:text-base text-[#B8C4D6] leading-relaxed">{stage.description}</p>
      </div>
    </motion.div>
  );
}

function MobileTrack() {
  return (
    <div className="py-24">
      <div className="px-6 mb-10">
        <SectionHeading />
      </div>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {processStages.map((stage) => (
          <div
            key={stage.index}
            className="snap-center shrink-0 w-[82vw] flex flex-col items-center text-center gap-5"
          >
            <Mascot pose={stage.pose} className="w-auto h-[30vh] [&>img]:h-full [&>img]:w-auto" />
            <span className="font-display font-black text-[#F5F7FA]/25 leading-none text-5xl">
              {stage.index}
            </span>
            <h3 className="font-display text-2xl text-[#F5F7FA]">{stage.title}</h3>
            <p className="text-sm text-[#B8C4D6] leading-relaxed">{stage.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
