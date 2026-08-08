import "./Loader.css";

/** Nine slices of the same word, which is what the stylesheet clips them into. */
const SLICES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

/**
 * A word scrolling through itself, for a wait with nothing to show yet.
 *
 * The nine children are not decoration: each one is the whole word clipped to a
 * ninth of the width and set at its own size, so the row reads as one word bent
 * through a lens. They have to be nine, in order, or the clip paths in
 * Loader.css land on the wrong slices.
 *
 * `aria-hidden`, and deliberately. A loader is a picture of waiting; the thing
 * that should be announced is what the wait produces, and in the one place this
 * is used that announcement is already sitting in the document under
 * `role="status"`.
 */
export function Loader({ word = "Loading" }: { word?: string }) {
  return (
    <div className="loader" aria-hidden>
      {SLICES.map((i) => (
        <div className="text" key={i}>
          <span>{word}</span>
        </div>
      ))}
      <div className="line" />
    </div>
  );
}
