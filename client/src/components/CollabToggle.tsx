import { useId } from "react";
import "./CollabToggle.css";

interface CollabToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Word under the switch. Changes colour with the state, like the track. */
  label?: string;
}

/**
 * The collab-post switch.
 *
 * A real checkbox does the work — the whole holographic assembly is a `label`
 * pointing at it, so a click anywhere on the track toggles it, the space bar
 * works, and the value arrives in `FormData` like any other field. The input is
 * a 0×0 transparent box rather than `display: none`, which would take it out of
 * the accessibility tree and off the tab order entirely.
 *
 * Every layer inside the track is decoration and is left out of that tree; the
 * accessible name is on the input.
 */
export function CollabToggle({
  checked,
  onChange,
  label = "Collab post",
}: CollabToggleProps) {
  const id = useId();

  return (
    <div className="toggle-container">
      <div className="toggle-wrap">
        <input
          id={id}
          name="collabPost"
          type="checkbox"
          className="toggle-input"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label="Post this as a collab with Cold Chain Theory"
        />

        <label htmlFor={id} className="toggle-track">
          <span className="holo-glow" aria-hidden />

          <span className="track-lines" aria-hidden>
            <span className="track-line" />
          </span>

          {/* Not the only signal the state has — the thumb moves and the whole
              track changes colour — but the only one that says so in words. */}
          <span className="toggle-data" aria-hidden>
            <span className="data-text off">Off</span>
            <span className="data-text on">On</span>
            <span className="status-indicator off" />
            <span className="status-indicator on" />
          </span>

          <span className="energy-rings" aria-hidden>
            <span className="energy-ring" />
            <span className="energy-ring" />
            <span className="energy-ring" />
          </span>

          <span className="toggle-thumb" aria-hidden>
            <span className="thumb-core" />
            <span className="thumb-inner" />
            <span className="thumb-scan" />
            <span className="thumb-particles">
              <span className="thumb-particle" />
              <span className="thumb-particle" />
              <span className="thumb-particle" />
              <span className="thumb-particle" />
              <span className="thumb-particle" />
            </span>
          </span>

          <span className="interface-lines" aria-hidden>
            <span className="interface-line" />
            <span className="interface-line" />
            <span className="interface-line" />
            <span className="interface-line" />
            <span className="interface-line" />
            <span className="interface-line" />
          </span>

          <span className="toggle-reflection" aria-hidden />
        </label>

        <span className="toggle-label" aria-hidden>
          {label}
        </span>
      </div>
    </div>
  );
}
