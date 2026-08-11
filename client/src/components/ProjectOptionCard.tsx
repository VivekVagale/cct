import { motion } from "framer-motion";
import type { Project } from "@/data/content";
import { useTilt } from "@/hooks/useTilt";

/**
 * The booking form's project picker, as a card rather than a text chip.
 *
 * Visually this is the CGI Projects card — 4:3 image, transparent caption —
 * with the vehicle picker's selected treatment on top, because here it has to
 * read as a chosen option in a form rather than as a link out to one.
 *
 * Coming-soon options cannot be selected, but they still tilt and glow. An
 * option that ignores the pointer entirely reads as broken rather than as
 * unavailable; the badge is what carries the state.
 */
export function ProjectOptionCard({
  project,
  selected,
  onSelect,
}: {
  project: Project;
  selected: boolean;
  onSelect: () => void;
}) {
  const { ref, rotateX, rotateY, glowBackground, onMouseMove, onMouseLeave } =
    useTilt<HTMLButtonElement>();

  const disabled = Boolean(project.comingSoon);

  return (
    <motion.button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={disabled ? undefined : onSelect}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={`group relative text-left overflow-hidden rounded-sm border transition-[border-color,background-color,box-shadow] duration-300 ${
        disabled ? "cursor-default" : "cursor-pointer"
      } ${
        selected
          ? "selected-glow bg-[#7A44E0]/[0.07]"
          : "border-white/[0.1] bg-white/[0.02] hover:border-white/30"
      }`}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: glowBackground }}
      />

      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={project.image}
          alt=""
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
            disabled
              ? "opacity-40 grayscale group-hover:opacity-65 group-hover:grayscale-[0.55]"
              : "opacity-60 group-hover:opacity-85"
          }`}
          animate={{ scale: selected ? 1.06 : 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/70 via-transparent to-transparent" />
      </div>

      {/* Transparent caption, so the starfield reads through the card. */}
      <div className="relative z-10 p-3 sm:p-4">
        <h4
          className={`font-display text-sm sm:text-lg normal-case tracking-normal mb-1 ${
            disabled ? "text-[#B8C4D6]" : "text-[#F5F7FA]"
          }`}
        >
          {project.title}
        </h4>
        <p className="text-xs text-[#B8C4D6] leading-relaxed normal-case tracking-normal">
          {project.description}
        </p>
        {disabled && (
          <span className="inline-block mt-3 text-[10px] tracking-[0.18em] uppercase text-[#B8C4D6]/70 border border-white/15 px-2.5 py-1 transition-colors duration-300 group-hover:border-white/30 group-hover:text-[#B8C4D6]">
            Coming Soon
          </span>
        )}
        {/* The same badge shape as Coming Soon, in the brand violet rather than
            the muted grey — the two say opposite things and should not be told
            apart by reading them. Never both: a build cannot be new and not yet
            available. */}
        {!disabled && project.isNew && (
          <span className="inline-block mt-3 text-[10px] tracking-[0.18em] uppercase text-[#C9AEFF] border border-[#9F6EF2]/50 bg-[#7A44E0]/[0.12] px-2.5 py-1">
            New
          </span>
        )}
      </div>

      {selected && (
        <motion.div
          layoutId="project-selected-indicator"
          className="absolute top-3 right-3 z-20 w-2 h-2 rounded-full bg-[#9F6EF2] shadow-[0_0_10px_rgba(159,110,242,0.9)]"
        />
      )}
    </motion.button>
  );
}
