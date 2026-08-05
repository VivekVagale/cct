import type { CSSProperties } from "react";
import { Search, X } from "lucide-react";
import "./GlowButton.css";

interface VehicleSearchProps {
  value: string;
  onChange: (value: string) => void;
  /** Announced to screen readers as the list narrows. */
  resultCount: number;
  className?: string;
}

/**
 * The vehicle filter, wearing the primary button's ring and bloom.
 *
 * It borrows GlowButton's CSS rather than restating it. The ring is the
 * wrapper's gradient background showing through its own padding and the bloom
 * is a negative-z pseudo-element, so the two controls cannot drift apart —
 * there is one gradient, one ring width, one blur. GlowButton.css carries the
 * warning that matters here: nothing may make .glow-button a stacking context,
 * or the bloom paints over the ring instead of behind it. No transform, no
 * opacity, no filter on the wrapper.
 *
 * The pill radius is set by overriding the custom property the stylesheet
 * already exposes, which is what it is there for.
 */
export function VehicleSearch({
  value,
  onChange,
  resultCount,
  className,
}: VehicleSearchProps) {
  return (
    <div className={className}>
      <span
        className="glow-button block w-full max-w-md"
        style={{ "--glow-radius": "999px" } as CSSProperties}
      >
        <div className="glow-button__field px-4 py-2.5 sm:px-5 sm:py-3">
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
      </span>

      {/* Announced, not shown — the list itself is the visible feedback. */}
      <p aria-live="polite" className="sr-only">
        {resultCount} {resultCount === 1 ? "vehicle" : "vehicles"} shown
      </p>
    </div>
  );
}
