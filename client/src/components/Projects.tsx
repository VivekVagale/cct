import { motion } from "framer-motion";
import { projects, type Project } from "@/data/content";
import { PendingRender } from "@/components/PendingRender";
import { PLACEHOLDER_SWATCH } from "@/components/ProjectOptionCard";
import { useTilt } from "@/hooks/useTilt";
import { FoldHeading } from "@/components/FoldHeading";
import AccordionGallery from "@/components/AccordionGallery";
import { galleryItems } from "@/data/gallery";

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
      /* h-full and a column, because the card is no longer the grid item —
         the reveal wrapper is. A grid stretches its own children, so the
         wrapper fills the row and the card inside has to be told to fill the
         wrapper, or every card shrinks to its own text and the row goes
         ragged. The caption takes the leftover space so the images stay on one
         line across a row. */
      className={`group relative flex h-full flex-col overflow-hidden rounded-sm border border-white/[0.1] bg-white/[0.02] transition-colors duration-300 hover:border-white/30 ${
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

      {/* 4:3 everywhere, matching the build cards in step 04 of the form.
          These were 9:16 on a phone, which is the shape the renders are — and
          three of them across a 375px screen made each one a tall sliver about
          110px wide, so the range read as a filmstrip rather than as a set of
          projects. The two card grids in this flow are now the same shape at
          every width, which is the point of them looking alike at all. */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* A build with no frame yet draws the placeholder rather than borrowing
            a picture of something else, and takes the same held-back treatment
            the photograph would. */}
        {project.image ? (
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
        ) : (
          <div
            className={`h-full w-full transition-opacity duration-700 ${
              disabled ? "opacity-70 group-hover:opacity-85" : "opacity-100"
            }`}
          >
            <PendingRender swatch={PLACEHOLDER_SWATCH} label="No frame yet" />
          </div>
        )}
        {/* Fades the image into the caption. Stops at the image's own bottom
            edge so the caption below stays clear of it. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/70 via-transparent to-transparent" />
      </div>

      {/* Transparent caption — no fill of its own, so the page's starfield
          reads through the bottom of the card. */}
      <div className="relative z-10 flex flex-1 flex-col p-2 sm:p-5">
        <h3
          className={`font-display text-[11px] leading-tight sm:text-xl mb-1 sm:mb-1.5 ${
            disabled ? "text-[#B8C4D6]" : "text-[#F5F7FA]"
          }`}
        >
          {project.title}
        </h3>

        <p className="hidden sm:block text-xs text-[#B8C4D6] leading-relaxed mb-3">
          {project.description}
        </p>

        {disabled ? (
          <span className="inline-block text-[8px] sm:text-[10px] tracking-[0.12em] sm:tracking-[0.18em] uppercase text-[#B8C4D6]/70 border border-white/15 px-1.5 py-0.5 sm:px-2.5 sm:py-1 transition-colors duration-300 group-hover:border-white/30 group-hover:text-[#B8C4D6]">
            Coming Soon
          </span>
        ) : (
          <span className="inline-block text-[8px] sm:text-[10px] tracking-[0.12em] sm:tracking-[0.18em] uppercase text-[#F5F7FA] border-b border-white/30 pb-0.5 sm:pb-1 group-hover:border-white transition-colors duration-300">
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
        {/* A section heading is the loudest thing on its scene now. In a
            document a 6xl heading is large; on a screen of its own with a
            title card either side of it, it read as a label on a slide. The
            measure widens with it, or the type only gets taller and the line
            breaks in the same three places. */}
        <h2 className="font-display text-5xl sm:text-8xl lg:text-9xl text-[#F5F7FA] max-w-4xl leading-[0.98]">
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
      {/* The gallery opens the section, before the cards.
          
          Panels are a fixed height and share the width between them, so an
          image here is cropped to a tall sliver when its panel is closed and to
          something near square when it is open. `object-fit: cover` on a
          centred subject survives both; anything with its subject near an edge
          will not. See data/gallery.ts. */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 mb-12 sm:mb-20">
        {/* Small, and the same eyebrow treatment the section's own kicker uses.
            Two blocks under one heading need naming or the visitor reads the
            gallery as the projects — but these are subheads inside a section
            that already has a title, so they sit at the eyebrow's weight rather
            than competing with "CGI Projects" above them. */}
        <h3 className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-4 sm:mb-5">
          Workflow
        </h3>
        <AccordionGallery items={galleryItems} height={460} />
      </div>

      {/* `scene-body--tight`, because this is a grid and not a reading order.
          On the deck's ordinary cascade the seventh card started 3.95s in and
          finished past five seconds — a long wait for a section whose whole
          content is the cards. Cards a row apart still arrive a beat apart;
          the beat is just shorter. */}
      <h3 className="max-w-[1600px] mx-auto px-6 sm:px-10 text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-4 sm:mb-5">
        Projects Range
      </h3>

      <div /* Three up on a phone. The renders are 9:16, so three narrow columns show
             each one nearly whole where one wide column showed a letterboxed
             strip — and a range reads as a range when several are on screen at
             once. The caption shrinks with them. */
          className="scene-body scene-body--tight max-w-[1600px] mx-auto px-6 sm:px-10 grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
        {projects.map((project) => (
          /* The wrapper is what the scroll reveal animates.
          
             It has to be a separate element. The reveal transitions `transform`
             over 650ms, and the card's 3D tilt writes `transform` on every
             pointer move — on one node the tilt inherits that transition and
             crawls half a second behind the cursor, which reads as no tilt at
             all rather than as a slow one. Reveal on the outside, tilt on the
             inside, and neither knows about the other. */
          <div key={project.id} className="h-full">
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </section>
  );
}
