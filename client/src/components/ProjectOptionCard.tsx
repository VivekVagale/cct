import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/content";
import { PendingRender } from "@/components/PendingRender";
import { useTilt } from "@/hooks/useTilt";

/* The ground a build with no frame is drawn on. Neutral on purpose: the
   placeholder is saying there is no picture, and a hue here would be the
   card guessing at one. */
export const PLACEHOLDER_SWATCH = "#6E7378";

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
 *
 * A build carrying a `video` plays it in the thumbnail once it is the selected
 * one — see the note on the element below for why it is selection and not hover
 * that starts it.
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

  const videoRef = useRef<HTMLVideoElement>(null);
  /* The loop is only shown once it is actually playing. A <video> with nothing
     decoded yet paints its first frame — or a black box — over the still, and a
     card that flashes black on selection is worse than one that simply does not
     move. Set from `playing`, cleared by `pause`, `ended` and any error. */
  const [videoReady, setVideoReady] = useState(false);
  /* Reduced motion is read once rather than watched. A visitor changing the
     system setting mid-form is not worth a listener, and the query cannot be
     read at all where there is no matchMedia. */
  const [wantsMotion] = useState(
    () =>
      typeof window === "undefined" ||
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const video = wantsMotion ? project.video : undefined;

  /* Play on selection, and on deselection rewind rather than merely pause: the
     next visit to this card should open on the shot the still promised, not on
     whatever frame the loop happened to stop at.

     `play()` rejects rather than throws — a browser that refuses it (a data
     saver, a policy the muted attribute does not satisfy) leaves the still in
     place, which is the same thing that happens when there is no loop at all. */
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !video) return;

    if (selected) {
      void el.play().catch(() => setVideoReady(false));
      return;
    }

    el.pause();
    el.currentTime = 0;
    setVideoReady(false);
  }, [selected, video]);

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
        {/* A build with no frame yet draws the placeholder instead of borrowing
            a picture of something else. It takes the same opacity treatment the
            photograph would — the grey of a coming-soon card is the signal, and
            a placeholder at full strength would read as the one live card in
            the row. */}
        {project.image ? (
          <motion.img
            src={project.image}
            alt=""
            className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
              disabled
                ? "opacity-40 grayscale group-hover:opacity-65 group-hover:grayscale-[0.55]"
                : videoReady
                  ? "opacity-0"
                  : "opacity-60 group-hover:opacity-85"
            }`}
            animate={{ scale: selected ? 1.06 : 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <div
            className={`h-full w-full transition-opacity duration-700 ${
              disabled ? "opacity-70 group-hover:opacity-90" : "opacity-90"
            }`}
          >
            <PendingRender swatch={PLACEHOLDER_SWATCH} label="No frame yet" />
          </div>
        )}

        {/* The still stays mounted underneath rather than being swapped out.
            It is the poster while the loop downloads, the fallback if it never
            does, and what shows again the moment the build is deselected — one
            element doing all three, instead of three states to keep in sync.

            The two cross-fade rather than stack. They carry the same opacity,
            and a card sitting on the starfield shows what is behind it: two
            translucent copies of the same shot laid over each other would come
            out brighter than every other card in the grid, which is a change of
            state nobody asked for. Only one of them is ever visible.

            Selection starts it, not hover. A click is a gesture every browser
            accepts as permission to play, where a hover is not, and on a phone
            there is no hover to speak of; picking a build is also the moment a
            visitor has asked to see more of it. Muted and `playsInline` are
            what stop iOS taking the video fullscreen.

            The loop is decoration — the card is already labelled by its title
            and description — so it is hidden from assistive technology and the
            element carries no controls to tab into. */}
        {video && (
          <motion.video
            ref={videoRef}
            aria-hidden
            src={video}
            poster={project.image}
            muted
            loop
            playsInline
            preload="none"
            tabIndex={-1}
            onPlaying={() => setVideoReady(true)}
            onPause={() => setVideoReady(false)}
            onError={() => setVideoReady(false)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              videoReady ? "opacity-60 group-hover:opacity-85" : "opacity-0"
            }`}
            animate={{ scale: selected ? 1.06 : 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        )}

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
        {/* The New badge exactly, with a different word — asked for as "the
            same one". Gated on !disabled for the same reason: a build that
            cannot be ordered yet should say that and nothing else.

            The two are independent, so both can render on one card and would
            then be two identical violet chips reading New and Premium. Nothing
            carries both today; the moment one does, this wants its own tint. */}
        {!disabled && project.isPremium && (
          <span className="inline-block mt-3 ml-2 text-[10px] tracking-[0.18em] uppercase text-[#C9AEFF] border border-[#9F6EF2]/50 bg-[#7A44E0]/[0.12] px-2.5 py-1">
            Premium
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
