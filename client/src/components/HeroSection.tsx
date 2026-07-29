import { StaticButton } from '@/components/ui/StaticButton';

/**
 * Hero Section
 *
 * Content sits over the page-wide Galaxy background (rendered once
 * in App.tsx, fixed behind every section).
 */

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen pt-16 md:pt-[72px] pointer-events-none">
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-72px)]">
        {/* LEFT — content */}
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
      </div>
    </section>
  );
}
