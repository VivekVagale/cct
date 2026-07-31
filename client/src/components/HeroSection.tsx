import { useEffect, useRef } from 'react';
import { StaticButton } from '@/components/ui/StaticButton';

/**
 * Hero Section
 *
 * Left column: unchanged existing content, sitting over the page-wide
 * Galaxy background (rendered once in App.tsx).
 *
 * Right column: scroll-scrubbed voxel-assembly video. The section is
 * pinned (sticky) inside a tall scroll track, and scroll position
 * drives the video's currentTime directly. A "COLD CHAIN THEORY"
 * backdrop text sits behind the video (mix-blend-mode: screen lets
 * the video's black background drop out and reveal it), fading in
 * only during the final stretch of the scrub.
 */

const TEXT_FADE_START = 0.8;
const TEXT_FADE_END = 1.0;

export function HeroSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const durationRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    const track = trackRef.current;
    const text = textRef.current;
    if (!video || !track || !text) return;

    const update = () => {
      tickingRef.current = false;
      const duration = durationRef.current;
      if (!duration) return;

      const rect = track.getBoundingClientRect();
      const scrollable = track.offsetHeight - window.innerHeight;
      let progress = scrollable > 0 ? -rect.top / scrollable : 0;
      progress = Math.min(1, Math.max(0, progress));

      video.currentTime = progress * duration;

      const textOpacity = Math.min(
        1,
        Math.max(0, (progress - TEXT_FADE_START) / (TEXT_FADE_END - TEXT_FADE_START)),
      );
      text.style.opacity = String(textOpacity);
    };

    const onLoadedMetadata = () => {
      durationRef.current = video.duration || 0;
      update();
    };

    const onScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(update);
      }
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div ref={trackRef} className="relative h-[350vh]">
      <section className="sticky top-0 w-full h-screen pt-16 md:pt-[72px] pointer-events-none overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row h-full">
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

          {/* RIGHT — scroll-scrubbed voxel assembly + backdrop text drop */}
          <div className="w-full lg:w-1/2 h-[55vh] lg:h-full relative">
            <div
              ref={textRef}
              className="absolute inset-0 z-0 flex items-center justify-center text-center opacity-0"
            >
              <h2 className="font-semibold text-[#F5F7FA] tracking-[0.06em] uppercase leading-none text-[clamp(28px,4vw,56px)]">
                Cold Chain Theory
              </h2>
            </div>

            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <video
                ref={videoRef}
                src="/video/character-voxels.mp4"
                muted
                playsInline
                preload="auto"
                className="max-w-[92%] max-h-[78vh] w-auto h-auto mix-blend-screen"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
