import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ChromaKeyVideo } from "@/components/ui/ChromaKeyVideo";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const rawScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const rawOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.15]);
  const y = useSpring(rawY, { stiffness: 120, damping: 30 });
  const scale = useSpring(rawScale, { stiffness: 120, damping: 30 });

  const backdropOpacity = useTransform(scrollYProgress, [0.35, 0.85], [0, 1]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative min-h-[100svh] flex items-center overflow-hidden pointer-events-auto"
    >
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 sm:px-10 pt-28 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left column — static copy */}
        <div className="order-2 lg:order-1">
          <p className="text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-6">
            Cinematic Automotive CGI Studio
          </p>
          <h1 className="font-display font-normal text-[13vw] leading-[0.95] sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl text-[#F5F7FA] mb-8">
            Every frame
            <br />
            <span className="italic text-[#B8C4D6]">tells a story.</span>
          </h1>
          <p className="text-base sm:text-lg text-[#B8C4D6] max-w-md mb-10 leading-relaxed">
            We turn cars and motorcycles into cinema — precision-built CGI, rendered
            frame by frame until it no longer looks rendered at all.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <a
              href="#booking"
              className="text-xs tracking-[0.14em] uppercase bg-white text-[#05070A] px-7 py-4 hover:bg-[#E5E5E5] transition-colors duration-300"
            >
              Start a Project
            </a>
            <a
              href="#projects"
              className="text-xs tracking-[0.14em] uppercase text-[#F5F7FA] border-b border-white/30 pb-1 hover:border-white transition-colors duration-300"
            >
              View the Work
            </a>
          </div>
        </div>

        {/* Right column — mascot + backdrop text, preserved exactly */}
        <div className="order-1 lg:order-2 relative h-[52vh] lg:h-[75vh] flex items-center justify-center">
          <motion.p
            style={{ opacity: backdropOpacity }}
            className="absolute inset-0 flex items-center justify-center font-display text-[16vw] lg:text-[7vw] text-white/[0.06] tracking-tight text-center pointer-events-none select-none z-0 whitespace-nowrap"
          >
            COLD CHAIN
          </motion.p>
          <motion.div style={{ y, scale }} className="relative z-10 w-full h-full">
            <ChromaKeyVideo
              src="/video/hero-mascot.mp4"
              className="w-full h-full mx-auto max-w-[520px]"
              scrollProgress={scrollYProgress}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
