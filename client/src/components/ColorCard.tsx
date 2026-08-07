import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { VehicleColor } from "@/data/vehicles";

interface ColorCardProps {
  color: VehicleColor;
  selected: boolean;
  onSelect: () => void;
}

export function ColorCard({ color, selected, onSelect }: ColorCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      /* Variants rather than a fixed initial/animate pair, so the parent owns
         the timing. The colours are meant to arrive after the card has finished
         travelling — two motions competing for the eye is what makes a
         transition like this read as cheap — and only the parent knows when
         that is. */
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
      {/*
        The lift happens here, not on the button.

        It used to be `whileHover={{ y: -3 }}` on the button itself, with the
        card inside it shrinking to 0.98 at the same time — a lift and a shrink
        pulling against each other, on the element that is also the hover target.
        Both move the box out from under the cursor: near an edge the pointer
        stops being over the card, the hover ends, the card returns, the pointer
        is over it again, and it oscillates. That flicker is what reads as glitch
        rather than as a lift, and it is worst on the ranges with only two
        colours, where each card is wide enough that most of its area is edge.

        The button never moves now, so the hover test is stable, and everything
        the reader sees moves together on this wrapper — the ring included, which
        would otherwise have stayed behind while the card rose off it.
      */}
      <div className="relative h-full transition-transform duration-300 ease-out group-hover:-translate-y-[3px]">
      {/* The ring, violet once chosen. Same two custom properties the vehicle
          and project cards use, so the three pickers in this flow cannot drift
          apart — a colour is as chosen as the machine it belongs to. */}
      <div
        className="absolute -inset-px rounded-sm transition-all duration-300"
        style={{
          boxShadow: selected
            ? "var(--selected-ring), var(--selected-bloom)"
            : "0 0 0 1px rgba(255,255,255,0.10)",
        }}
      />
      {/* Full height with the caption pushed to the bottom, so a two-line
          colour name makes its own card no taller than its neighbour — the
          grid stretches both and the caption bars stay on one line together. */}
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-sm"
      >
        <div className="aspect-[4/3] overflow-hidden">
          {/* Driven by the group rather than by its own hover, so it answers to
              the caption as well as to the image. Inside overflow-hidden, so it
              cannot reach the hit area no matter how far it scales. */}
          <img
            src={color.image}
            alt={color.name}
            className="w-full h-full object-cover transition-transform duration-400 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <div className="mt-auto px-3 py-2.5 sm:px-4 sm:py-3 bg-[#0D1117] flex items-center gap-2 sm:gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full border border-white/20 flex-shrink-0"
            style={{ backgroundColor: color.swatch }}
          />
          <span
            className={`text-xs tracking-[0.08em] uppercase transition-colors duration-300 ${
              selected ? "text-[#F5F7FA]" : "text-[#B8C4D6] group-hover:text-[#F5F7FA]"
            }`}
          >
            {color.name}
          </span>
        </div>
      </div>

      {selected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#9F6EF2] flex items-center justify-center z-10"
        >
          <Check className="w-3 h-3 text-[#05070A]" strokeWidth={3} />
        </motion.div>
      )}
      </div>
    </motion.button>
  );
}
