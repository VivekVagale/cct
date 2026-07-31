import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { StaticButton } from '@/components/ui/StaticButton';
import { ChromaKeyVideo } from '@/components/ui/ChromaKeyVideo';

/**
 * Hero Section
 *
 * Left column: unchanged existing content, sitting over the page-wide
 * Galaxy background (rendered once in App.tsx).
 *
 * Right column: the green-screen character video, chroma-keyed in
 * real time via WebGL (ChromaKeyVideo — genuinely transparent, not a
 * rectangular video element). It autoplays and loops on its own; a
 * "COLD CHAIN THEORY" backdrop text sits behind it at a lower
 * z-index and shows through the canvas's real alpha transparency.
 * Motion is scroll-driven with Framer Motion (useScroll + useTransform,
 * spring-smoothed) — restrained translateY/scale/opacity as the
 * section scrolls through view, GPU-accelerated transforms only.
 */

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });

  const y = useTransform(smoothProgress, [0, 1], [0, 50]);
  const scale = useTransform(smoothProgress, [0, 1], [1, 0.94]);
  const characterOpacity = useTransform(smoothProgress, [0, 0.85], [1, 0.35]);
  const textOpacity = useTransform(smoothProgress, [0.45, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen pt-16 md:pt-[72px] pointer-events-none overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-72px)]">
        {/* LEFT — content (unchanged) */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-16 lg:py-0 pointer-events-auto">
          <span className="text-xs font-medium tracking-[0.2em] text-[#B8C4D6] mb-6">
            COLD CHAIN THEORY
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-[64px] font-bold text-[#F5F7FA] leading-[1.05] tracking-tight mb-6">
            Cinematic CGI for cars and motorcycles.
          </h1>

          <h2 className="text-xl lg:text-2xl text-[#F5F7FA] font-medium mb-6">
            Photorealistic automotive renders and visual storytelling.
          </h2>

          <p className="text-base lg:text-lg text-[#B8C4D6] leading-relaxed max-w-lg mb-10">
            We create advertisements, product renders, and cinematic edits for
            automotive brands, influencers, and enthusiasts who want their
            vehicles to feel real on screen.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <StaticButton href="#contact" variant="primary">
              Book a Project
            </StaticButton>
            <StaticButton href="#projects" variant="secondary">
              View Projects
            </StaticButton>
          </div>
        </div>

        {/* RIGHT — chroma-keyed character, scroll-driven parallax */}
        <div className="w-full lg:w-1/2 h-[55vh] lg:h-full relative">
          {/* Backdrop text — sits behind the character, shows through
              the canvas's real alpha transparency, no blend-mode needed */}
          <motion.div
            style={{ opacity: textOpacity }}
            className="absolute inset-0 z-0 flex items-center justify-center text-center"
          >
            <h2 className="font-semibold text-[#F5F7FA] tracking-[0.06em] uppercase leading-none text-[clamp(28px,4vw,56px)]">
              Cold Chain Theory
            </h2>
          </motion.div>

          <motion.div
            style={{ y, scale, opacity: characterOpacity, willChange: 'transform, opacity' }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <ChromaKeyVideo
              src="/video/character-greenscreen.mp4"
              className="w-full max-w-[92%] max-h-[78vh] aspect-square mx-auto"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
