import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { PendingRender } from "@/components/PendingRender";
import { PLACEHOLDER_SWATCH } from "@/components/ProjectOptionCard";

/**
 * A picture with a name, one of a row of them, one chosen.
 *
 * The Free Fall dialog picks two things by eye -- the jet and the light -- and
 * both are the same interaction: a small grid of 4:3 frames where exactly one
 * is selected. This is that card, shared by both, rather than the two grids
 * drifting apart the way the page's selection treatments did before
 * `selected-glow` was pulled into one place.
 *
 * It is `ProjectOptionCard` with everything Free Fall does not need taken out:
 * no video, no tilt, no coming-soon state, no price. What is left is the part
 * that matters -- the 4:3 box, the `PendingRender` fallback for an option whose
 * frame has not been shot, and `role="radio"` so a grid of these is a real
 * radio group to a screen reader instead of a set of buttons.
 *
 * No per-card charge badge. The surcharge is one line under the grid: a badge
 * on every card but one turns a picker into a price list, and the studio quotes
 * the figure in conversation anyway.
 */
export function OptionCard({
  name,
  hint,
  image,
  selected,
  onSelect,
}: {
  name: string;
  hint?: string;
  image?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      className={`group relative overflow-hidden rounded-sm border text-left transition-[border-color,background-color,box-shadow] duration-300 ${
        selected
          ? "selected-glow bg-[#7A44E0]/[0.07]"
          : "border-white/[0.1] bg-white/[0.02] hover:border-white/30"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {image ? (
          <motion.img
            src={image}
            alt=""
            className="h-full w-full object-cover opacity-60 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-85"
            animate={{ scale: selected ? 1.06 : 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <div className="h-full w-full opacity-90">
            <PendingRender swatch={PLACEHOLDER_SWATCH} label="No frame yet" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/70 via-transparent to-transparent" />

        {/* The tick, for the case the glow cannot carry on its own: two frames
            that are both placeholders look alike, and the ring around one of
            them is the only difference between them. The colour cards already
            answer this the same way. */}
        {selected && (
          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#7A44E0] text-[#F5F7FA]">
            <Check className="h-3 w-3" />
          </span>
        )}
      </div>

      <div className="px-3 py-2.5">
        <span
          className={`block text-[11px] uppercase tracking-[0.16em] transition-colors duration-300 ${
            selected ? "text-[#F5F7FA]" : "text-[#B8C4D6]"
          }`}
        >
          {name}
        </span>
        {hint && (
          <span className="mt-1 block text-[10px] tracking-normal text-[#B8C4D6]/70">
            {hint}
          </span>
        )}
      </div>
    </motion.button>
  );
}
