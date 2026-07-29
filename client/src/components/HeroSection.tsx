import { StaticButton } from '@/components/ui/StaticButton';
import Galaxy from '@/components/ui/Galaxy';

/**
 * Hero Section
 *
 * Static split layout: content left, right half intentionally
 * reserved and empty for the future custom hero animation. No
 * animation library, no placeholder graphic in the reserved zone.
 */

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen bg-[#05070A] pt-16 md:pt-[72px]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-72px)]">
        {/* LEFT — content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-16 lg:py-0">
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

        {/* RIGHT — reserved zone, now filled with the Galaxy background */}
        <div className="hidden lg:block w-1/2 relative">
          <Galaxy
            density={0.8}
            glowIntensity={0.4}
            saturation={0}
            hueShift={140}
            mouseInteraction
            mouseRepulsion
            twinkleIntensity={0.35}
            rotationSpeed={0.05}
          />
        </div>
      </div>
    </section>
  );
}
