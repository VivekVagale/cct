import "./ScrollCue.css";

/**
 * The "scroll to play" cue for the top of the hero.
 *
 * The hero animates on scroll and nothing else on the first screen says so —
 * left alone, it reads as a still image. This is the only prompt to move.
 *
 * The chevrons nest inside the mouse rather than following it: the CSS offsets
 * them 48px down from their parent's top and pulls them 3px left, which lands
 * them under a 50px-tall body with a 3px border. As siblings they would sit
 * 48px below it with the border uncorrected.
 *
 * Decorative, so it is hidden from assistive tech. It carries no information a
 * screen reader needs — the page below it is linear and reachable without any
 * prompt to scroll.
 */
export function ScrollCue() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Desktop only, and deliberately quiet.
      
          A phone is already full-screen and a touch device has no F11, so on
          those this line would be an instruction nobody can follow. `hidden
          lg:block` rather than a media query in JS: it is one line of type, and
          rendering it only to hide it costs nothing next to the risk of the two
          breakpoints drifting apart.
      
          Dimmer than the line below it. This is a suggestion about how to watch
          and that one is what to do next — if both arrive at the same weight
          the visitor reads neither. */}
      <p className="hidden lg:block text-[10px] tracking-[0.28em] uppercase text-[#B8C4D6]/45">
        Press F11 for fullscreen
      </p>

      <div className="scrolldown" aria-hidden>
        <div className="chevrons">
          <div className="chevrondown" />
          <div className="chevrondown" />
        </div>
      </div>

      {/* Not `aria-hidden`, unlike the mouse above it. The graphic carries no
          information — this says what the page wants, and a visitor who cannot
          see an animated mouse should still be told there is something below. */}
      <p className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase text-[#B8C4D6]/70">
        Scroll down to experience
      </p>
    </div>
  );
}
