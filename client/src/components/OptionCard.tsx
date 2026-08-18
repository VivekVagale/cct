import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PendingRender } from "@/components/PendingRender";
import { PLACEHOLDER_SWATCH } from "@/components/ProjectOptionCard";

/**
 * A picture with a name, one of a row of them, one chosen.
 *
 * This is `ColorCard` with its data swapped out, and deliberately so rather
 * than merely similar: the Free Fall brief picks two things by eye, in a modal
 * that opens beside the chosen build exactly as the colour picker opens beside
 * the chosen machine, and a card that was nearly the same would read as a
 * different part of the site. Same ring built from the same two custom
 * properties, same caption bar, same check badge, same variants so the parent
 * owns the timing.
 *
 * What it does not copy is the swatch dot, which is optional here. A colourway
 * has a paint to show and an environment has a light, but a jet has neither,
 * and a dot invented for it would be decoration pretending to be information.
 *
 * No per-card price badge either. The surcharge is one line under the grid: a
 * badge on every card but one turns a picker into a price list, and the studio
 * quotes the figure in conversation anyway.
 */
export function OptionCard({
  name,
  image,
  swatch,
  selected,
  onSelect,
}: {
  name: string;
  image?: string;
  /** The caption dot. Omitted where the option has no colour to stand for. */
  swatch?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      role="radio"
      aria-checked={selected}
      className="group relative h-full text-left rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
    >
      <div className="relative h-full">
        {/* The ring, violet once chosen, brighter under the pointer. The same
            two custom properties the vehicle, colour and project cards use, so
            the four pickers in this flow cannot drift apart. */}
        <div
          className={`absolute -inset-px rounded-sm transition-all duration-300 ${
            selected
              ? ""
              : "shadow-[0_0_0_1px_rgba(255,255,255,0.10)] group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.34)]"
          }`}
          style={
            selected
              ? { boxShadow: "var(--selected-ring), var(--selected-bloom)" }
              : undefined
          }
        />

        {/* Full height with the caption pushed to the bottom, so a two-line
            name makes its own card no taller than its neighbour. */}
        <div className="relative flex h-full flex-col overflow-hidden rounded-sm">
          <div className="aspect-[4/3] overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover transform-gpu transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              /* No scale on hover, and nothing to scale: the lift on the
                 photograph is what says there is a picture under the pointer,
                 and an option with no frame shot yet should not claim one. */
              <PendingRender
                swatch={swatch ?? PLACEHOLDER_SWATCH}
                label="No frame yet"
              />
            )}
          </div>

          <div className="mt-auto flex items-center gap-2 bg-[#0D1117] px-3 py-2.5 sm:gap-2.5 sm:px-4 sm:py-3">
            {swatch && (
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full border border-white/20"
                style={{ backgroundColor: swatch }}
              />
            )}
            <span
              className={`text-xs uppercase tracking-[0.08em] transition-colors duration-300 ${
                selected
                  ? "text-[#F5F7FA]"
                  : "text-[#B8C4D6] group-hover:text-[#F5F7FA]"
              }`}
            >
              {name}
            </span>
          </div>
        </div>

        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#9F6EF2]"
          >
            <Check className="h-3 w-3 text-[#05070A]" strokeWidth={3} />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
