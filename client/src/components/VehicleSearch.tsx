import type { CSSProperties, ReactNode } from "react";
import { Search, X } from "lucide-react";
import { BorderBeam } from "border-beam";
import "./GlowButton.css";

interface VehicleSearchProps {
  value: string;
  onChange: (value: string) => void;
  /** Announced to screen readers as the list narrows. */
  resultCount: number;
  className?: string;
}

/**
 * The one line that takes the beam back out.
 *
 * `false` returns the bar to the gradient ring and bloom it wore before, with
 * nothing else to undo: GlowButton.css is untouched, both dressings are still
 * in this file, and the field inside them is the same element either way. The
 * package stays in package.json doing nothing, which costs a dependency and
 * saves reinstalling it if the answer changes again.
 */
const BEAM = true;

/**
 * The vehicle filter, wearing the travelling beam.
 *
 * Two dressings, one field. The beam is `size="line"` — a glow that travels the
 * bottom edge rather than the whole border, which is the one that suits a
 * control this wide and this short; `md` rings all four sides and reads as a
 * loading state on something you are meant to type into.
 *
 * Only one of them may be on at a time. The ring and bloom are a glow system
 * already — a gradient background showing through the wrapper's padding, plus a
 * blurred negative-z pseudo-element — and stacking the beam on top of that gives
 * one control two light sources that do not agree about where the light is.
 *
 * The radius is set on the field rather than left to the wrapper. Under the ring
 * it came from `--glow-radius` on the span, and `.glow-button__field` derives its
 * own from that minus the ring width; with no span there is no property, the
 * `calc()` is invalid and the pill squares off. Setting both here resolves the
 * same arithmetic to 999px, and BorderBeam reads its own radius off the child,
 * so the beam follows the pill instead of cutting its corners.
 */
export function VehicleSearch({
  value,
  onChange,
  resultCount,
  className,
}: VehicleSearchProps) {
  /* Built once and dressed by whichever branch is live, so the two cannot drift
     — a field that differs between them is a bug nobody sees until the switch
     is thrown. */
  const field: ReactNode = (
    <div
      className="glow-button__field px-4 py-2.5 sm:px-5 sm:py-3"
      style={
        BEAM
          ? ({ "--glow-radius": "999px", "--glow-ring": "0px" } as CSSProperties)
          : undefined
      }
    >
      <Search className="w-4 h-4 shrink-0 text-[#B8C4D6]" aria-hidden />

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        aria-label="Search vehicles by name"
        /* The UA's own clear affordance is suppressed: it only appears on
           some engines, it sits at a different inset from ours, and it is
           not keyboard reachable in the same way. One clear button, ours. */
        className="
          min-w-0 flex-1 bg-transparent
          text-sm sm:text-base text-[#F5F7FA] placeholder:text-[#B8C4D6]/60
          focus:outline-none
          [&::-webkit-search-cancel-button]:appearance-none
        "
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="
            shrink-0 rounded-full p-1 text-[#B8C4D6]
            transition-colors duration-200 hover:text-[#F5F7FA]
            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white
          "
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <div className={className}>
      {BEAM ? (
        <BorderBeam
          size="line"
          colorVariant="colorful"
          strength={0.7}
          className="block w-full max-w-md"
        >
          {field}
        </BorderBeam>
      ) : (
        /* GlowButton.css carries the warning that matters here: nothing may
           make .glow-button a stacking context, or the bloom paints over the
           ring instead of behind it. No transform, no opacity, no filter on
           the wrapper. */
        <span
          className="glow-button block w-full max-w-md"
          style={{ "--glow-radius": "999px" } as CSSProperties}
        >
          {field}
        </span>
      )}

      {/* Announced, not shown — the list itself is the visible feedback. */}
      <p aria-live="polite" className="sr-only">
        {resultCount} {resultCount === 1 ? "vehicle" : "vehicles"} shown
      </p>
    </div>
  );
}
