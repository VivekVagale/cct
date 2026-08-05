import { motion } from "framer-motion";
import { projects, type Project } from "@/data/content";
import { useTilt } from "@/hooks/useTilt";
import { FoldHeading } from "@/components/FoldHeading";

/**
 * The card has no entrance of its own.
 *
 * It used to carry Reveal's timing directly — an `initial`/`whileInView` pair
 * on this element. Two things were wrong with that, and they were the same
 * thing seen from two sides. The card is a direct child of `.scene-body`, so
 * the deck was *already* staging it, and two systems animating one element's
 * opacity on two different clocks is what made the grid appear, vanish and
 * come back several seconds later. The other side: `whileInView` knows nothing
 * about a scene having been read before, so every trip back to this section
 * played the whole grid in again from nothing.
 *
 * The deck stages it now and only the deck. That gets the return visit right
 * for free — a settled scene switches its staging off and the cards are simply
 * there — and leaves this element's transform to the tilt alone.
 */
function ProjectCard({ project }: { project: Project }) {
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
          /* A live card runs at full strength, like the vehicle cards two
             sections down — those carry no opacity at all, and these were
             sitting at 0.6, so the same kind of render looked washed out in
             one place and not the other.

             A coming-soon card is grey. Fully desaturated and held back, and
             it stays that way under the pointer — the colour is the signal,
             and a card that finds its colour on hover is one that looks
             available the moment anyone touches it. It lifts slightly so the
             card still feels alive rather than disabled-and-dead. */
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
            disabled
              ? "opacity-55 grayscale group-hover:opacity-70"
              : "opacity-100"
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
      {/* `scene-body--tight`, because this is a grid and not a reading order.
          On the deck's ordinary cascade the seventh card started 3.95s in and
          finished past five seconds — a long wait for a section whose whole
          content is the cards. Cards a row apart still arrive a beat apart;
          the beat is just shorter. */}
      <div className="scene-body scene-body--tight max-w-[1600px] mx-auto px-6 sm:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
