import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { processStages } from "@/data/content";
import { Mascot } from "@/components/Mascot";

export function CreativeProcess() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.75", "end 0.25"],
  });

  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="process" className="relative pointer-events-auto py-32 sm:py-40">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10">
        <div className="flex items-end justify-between gap-8 mb-20 sm:mb-28">
          <div>
            <p className="text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-5">
              How We Work
            </p>
            <h2 className="font-display text-4xl sm:text-6xl text-[#F5F7FA] max-w-xl leading-[1.05]">
              Creative Process
            </h2>
          </div>
          <Mascot pose="thinking" size="md" className="hidden md:block" />
        </div>

        <div ref={sectionRef} className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-16">
          {/* Line sidebar — tracks scroll progress through the stages */}
          <div className="hidden lg:flex flex-col sticky top-32 h-fit self-start">
            <div className="relative w-px bg-white/[0.08]" style={{ height: 420 }}>
              <motion.div
                className="absolute top-0 left-0 w-px bg-white origin-top"
                style={{ height: 420, scaleY: lineScale }}
              />
              {processStages.map((stage, i) => {
                const stageProgress = i / (processStages.length - 1);
                return (
                  <div
                    key={stage.index}
                    className="absolute -left-[3px] flex items-center gap-4"
                    style={{ top: `${stageProgress * 100}%` }}
                  >
                    <span className="block w-[7px] h-[7px] rounded-full bg-[#B8C4D6]" />
                    <span className="text-[10px] tracking-[0.14em] uppercase text-[#B8C4D6] whitespace-nowrap">
                      {stage.index} — {stage.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/[0.08]">
            {processStages.map((stage, i) => (
              <motion.div
                key={stage.index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-8 py-10 sm:py-14 border-b border-white/[0.08] items-baseline"
              >
                <span
                  className="sm:col-span-2 font-display font-black text-[#F5F7FA]/90 leading-none"
                  style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}
                >
                  {stage.index}
                </span>
                <h3 className="sm:col-span-3 font-display text-2xl sm:text-3xl text-[#F5F7FA]">
                  {stage.title}
                </h3>
                <p className="sm:col-span-7 text-sm sm:text-base text-[#B8C4D6] leading-relaxed max-w-2xl">
                  {stage.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
