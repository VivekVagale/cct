import { motion } from "framer-motion";
import { projects, type Project } from "@/data/content";
import { useTilt } from "@/hooks/useTilt";
import { FoldHeading } from "@/components/FoldHeading";

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { ref, rotateX, rotateY, glowBackground, onMouseMove, onMouseLeave } =
    useTilt<HTMLAnchorElement>();

  const disabled = Boolean(project.comingSoon);

  return (
    <motion.a
      ref={ref}
      href={disabled ? undefined : "#booking"}
      aria-disabled={disabled}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      /* Reveal's timing, applied here rather than by wrapping in it: the tilt
         writes rotateX/rotateY to this same element, and a wrapper animating
         y would be a second transform on a node that already has one. */
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 1.1,
        delay: (index % 4) * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`group relative overflow-hidden rounded-sm border border-white/[0.1] bg-white/[0.02] transition-colors duration-300 hover:border-white/30 ${
        disabled ? "cursor-default" : "cursor-pointer"
      }`}
    >
      {/* Cursor-follow highlight. Coming-soon cards get it too — they are not
          clickable, but a card that ignores the pointer entirely reads as
          broken rather than as unavailable, and four of the seven are
          coming soon. The badge carries the state instead. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: glowBackground }}
      />

      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
            disabled
              ? "opacity-40 grayscale group-hover:opacity-65 group-hover:grayscale-[0.55]"
              : "opacity-60 group-hover:opacity-85"
          }`}
        />
        {/* Fades the image into the caption. Stops at the image's own bottom
            edge so the caption below stays clear of it. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/70 via-transparent to-transparent" />
      </div>

      {/* Transparent caption — no fill of its own, so the page's starfield
          reads through the bottom of the card. */}
      <div className="relative z-10 p-4 sm:p-5">
        <h3
          className={`font-display text-lg sm:text-xl mb-1.5 ${
            disabled ? "text-[#B8C4D6]" : "text-[#F5F7FA]"
          }`}
        >
          {project.title}
        </h3>

        <p className="text-xs text-[#B8C4D6] leading-relaxed mb-3">
          {project.description}
        </p>

        {disabled ? (
          <span className="inline-block text-[10px] tracking-[0.18em] uppercase text-[#B8C4D6]/70 border border-white/15 px-2.5 py-1 transition-colors duration-300 group-hover:border-white/30 group-hover:text-[#B8C4D6]">
            Coming Soon
          </span>
        ) : (
          <span className="inline-block text-[10px] tracking-[0.18em] uppercase text-[#F5F7FA] border-b border-white/30 pb-1 group-hover:border-white transition-colors duration-300">
            Inquire
          </span>
        )}
      </div>
    </motion.a>
  );
}

export function Projects() {
  return (
    <section
      id="projects"
      className="relative pointer-events-auto py-20 sm:py-40 scroll-mt-16 sm:scroll-mt-20"
    >
      <div className="scene-heading max-w-[1600px] mx-auto px-6 sm:px-10 mb-10 sm:mb-24">
        <p className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-4 sm:mb-5">
          What We Build
        </p>
        <h2 className="font-display text-3xl sm:text-6xl text-[#F5F7FA] max-w-xl leading-[1.05]">
          <FoldHeading text="CGI Projects" />
        </h2>
      </div>

      {/* Separate bordered cards with a real gap, rather than the old
          gap-px hairline grid — that trick draws its lines with the gap's
          background showing between opaque tiles, which cannot survive cards
          that are meant to be see-through.

          One column on phones, not two. Each card carries a title, a sentence
          of description and a badge, and two across a 375px viewport is a
          ~156px column — the description broke to five or six lines of
          two words and the badge wrapped. The column count moves up a
          breakpoint the whole way rather than only at the bottom, so no width
          gets a card narrower than its own contents. */}
      <div className="scene-body max-w-[1600px] mx-auto px-6 sm:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
