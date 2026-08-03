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
    <div className="scrolldown" aria-hidden>
      <div className="chevrons">
        <div className="chevrondown" />
        <div className="chevrondown" />
      </div>
    </div>
  );
}
