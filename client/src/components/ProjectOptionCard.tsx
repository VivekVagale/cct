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
  live = true,
}: {
  project: Project;
  selected: boolean;
  onSelect: () => void;
  /**
   * Whether this card is somewhere a visitor could be looking.
   *
   * True on the desktop, where the grid is simply on the page. False on the
   * wizard's build step until it is the step being shown — and that is not the
   * same question as whether the element is visible, which is why it is a prop
   * rather than something measured here.
   *
   * The wizard keeps all six steps mounted so FormData can collect them, so
   * these four cards exist from first paint. `preload="none"` and a
   * `display: none` ancestor were both expected to stop the loops downloading
   * until then, and neither did: measured, all four mp4s were fetched while the
   * visitor was still on step 01 — 875KB spent on a screen that might never be
   * reached. autoPlay asks for the media whatever the element's display.
   *
   * So the element itself is not rendered until the step is. Nothing to autoplay
   * means nothing to fetch.
   */
  live?: boolean;
}) {
  const { ref, rotateX, rotateY, glowBackground, onMouseMove, onMouseLeave } =
    useTilt<HTMLButtonElement>();

  const disabled = Boolean(project.comingSoon);

  const videoRef = useRef<HTMLVideoElement>(null);
  /* The loop is only shown once it is actually playing. A <video> with nothing
     decoded yet paints its first frame — or a black box — over the still, and a
     card that flashes black is worse than one that simply does not move. Set
     from `playing`, and cleared only by an error: see the note on the element. */
  const [videoReady, setVideoReady] = useState(false);
  /* Reduced motion is read once rather than watched. A visitor changing the
     system setting mid-form is not worth a listener, and the query cannot be
     read at all where there is no matchMedia. */
  const [wantsMotion] = useState(
    () =>
      typeof window === "undefined" ||
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const video = wantsMotion && live ? project.video : undefined;

  /*
   * The loop runs whenever the card can be seen, and stops when it cannot.
   *
   * It used to start on selection, on the reasoning that a click is a gesture
   * every browser accepts as permission to play where a hover is not. That is
   * true of video with sound. These are muted and `playsInline`, which every
   * engine autoplays without a gesture at all — so the permission this was
   * working around was never needed, and the cost of it was a grid of stills
   * where the studio has four loops of its actual work.
   *
   * Visibility rather than mount, and the wizard is why. All six of its steps
   * stay mounted so FormData can collect them, so a card on step 02 exists from
   * the moment the page opens — four videos decoding behind a visitor who is
   * still choosing a machine. `hidden` resolves to `display: none`, which an
   * IntersectionObserver reports as not intersecting, so the same check answers
   * that and an off-screen card on the desktop grid at once.
   *
   * With `preload="none"` below, nothing is fetched until the card is rendered
   * and playback begins: a phone that never reaches step 02 never downloads a
   * frame of the four loops, which are 875KB between them.
   *
   * Paused rather than rewound on the way out. Rewinding was right when playing
   * meant "you chose this" and the next visit should open on the shot the still
   * promised; for an ambient loop, carrying on from where it was is what looks
   * uninterrupted.
   *
   * `play()` rejects rather than throws — Low Power Mode on iOS refuses muted
   * autoplay outright — and the catch leaves the still in place, which is the
   * same thing that happens on a build with no loop at all.
   */
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !video) return;

    /* Nothing to fall back to when there is no observer: the autoPlay attribute
       on the element is already the mechanism, and this only trims what plays
       off-screen. */
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void el.play().catch(() => setVideoReady(false));
        } else {
          el.pause();
        }
      },
      /* A quarter visible is enough to be worth playing, and is reached well
         before a card scrolling up into a phone's viewport is being looked at. */
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [video]);

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
            /* autoPlay is the mechanism; the observer above is the economy.

               Muted and `playsInline`, this is the case every engine starts on
               its own with no gesture — and, importantly, one the browser only
               starts for a video it is actually rendering. A `display: none`
               card does not autoplay, which is what keeps the wizard's five
               unseen steps from decoding anything.

               It is an attribute rather than a play() call because that call is
               the one thing here that could fail quietly in an unusual engine,
               and most of this site's traffic arrives in one. The observer then
               pauses what scrolls away and resumes it, which is worth having and
               is not worth depending on. */
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            tabIndex={-1}
            onPlaying={() => setVideoReady(true)}
            /* Nothing on pause. A paused <video> goes on painting the frame it
               stopped at, so the still underneath has nothing to add — and
               fading it back in every time a card crosses the observer's
               threshold would make a scroll past this grid flicker. Cleared only
               where there is genuinely no frame to show. */
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
            apart by reading them. Never alongside it either: a build that
            cannot be ordered yet should say that and nothing else, which is
            what the !disabled gate is for.

            Driven off a list rather than written out three times. They are the
            same chip with a different word, and three copies of it is three
            places for the styling to drift apart. Order is fixed here rather
            than taken from the flags, so two builds that happen to carry the
            same pair always read them in the same order.

            They are independent claims, so a card can carry more than one and
            would then show two identical violet chips. Nothing does today; the
            moment something does, the second one wants its own tint. */}
        {!disabled &&
          (
            [
              [project.isNew, "New"],
              [project.isPopular, "Popular"],
              [project.isPremium, "Premium"],
            ] as const
          )
            .filter(([shown]) => shown)
            .map(([, label], index) => (
              <span
                key={label}
                className={`inline-block mt-3 ${index > 0 ? "ml-2" : ""} text-[10px] tracking-[0.18em] uppercase text-[#C9AEFF] border border-[#9F6EF2]/50 bg-[#7A44E0]/[0.12] px-2.5 py-1`}
              >
                {label}
              </span>
            ))}
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
