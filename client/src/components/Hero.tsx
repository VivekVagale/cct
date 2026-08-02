import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ChromaKeyVideo } from "@/components/ui/ChromaKeyVideo";
import { Magnet } from "@/components/Magnet";

export function Hero() {
  // Outer wrapper is taller than the viewport so the inner content can
  // stay pinned (sticky) in the center of the screen while the user
  // scrolls — it animates in place rather than sliding off to reveal
  // whatever comes next. Once this extra scroll room runs out, the
  // next section naturally scrolls up and covers it.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const rawScale = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0.88]);
  const rawOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);
  const scale = useSpring(rawScale, { stiffness: 140, damping: 30 });
  const opacity = useSpring(rawOpacity, { stiffness: 140, damping: 30 });

  const backdropOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);

  return (
    <section id="top" ref={wrapperRef} className="relative h-[220vh] pointer-events-auto">
      <div className="sticky top-0 h-[100svh] w-full flex items-center justify-center overflow-hidden">
        <motion.p
          style={{ opacity: backdropOpacity }}
          className="absolute inset-0 flex items-center justify-center font-display text-[22vw] sm:text-[14vw] text-white/[0.05] tracking-tight text-center pointer-events-none select-none z-0 whitespace-nowrap"
        >
          COLD CHAIN
        </motion.p>

        <motion.div
          style={{ scale, opacity }}
          className="relative z-10 w-full max-w-3xl mx-auto px-6 flex flex-col items-center text-center gap-6 sm:gap-8"
        >
          <p className="text-xs tracking-[0.24em] uppercase text-[#B8C4D6]">
            Cinematic Automotive CGI Studio
          </p>

          <h1 className="font-display font-normal text-4xl sm:text-6xl md:text-7xl leading-[1.02] text-[#F5F7FA]">
            Every frame
            <br />
            <span className="italic text-[#B8C4D6]">tells a story.</span>
          </h1>

          <div className="w-[68vw] max-w-[420px] h-[32vh] sm:h-[38vh]">
            <ChromaKeyVideo
              src="/video/hero-mascot.mp4"
              className="w-full h-full"
              scrollProgress={scrollYProgress}
            />
          </div>

          <p className="text-sm sm:text-base text-[#B8C4D6] max-w-md leading-relaxed">
            We turn cars and motorcycles into cinema — precision-built CGI, rendered
            frame by frame until it no longer looks rendered at all.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Magnet padding={40} strength={5}>
              <a
                href="#booking"
                className="text-xs tracking-[0.14em] uppercase bg-white text-[#05070A] px-7 py-4 hover:bg-[#E5E5E5] transition-colors duration-300 inline-block"
              >
                Start a Project
              </a>
            </Magnet>
            <a
              href="#experiences"
              className="text-xs tracking-[0.14em] uppercase text-[#F5F7FA] border-b border-white/30 pb-1 hover:border-white transition-colors duration-300"
            >
              See What We Build
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
