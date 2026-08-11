import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PendingRender } from "@/components/PendingRender";
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
        Nothing about this card's box moves on hover, and that is the fix.

        It was `whileHover={{ y: -3 }}` on the button with the card inside it
        scaling to 0.98 — a lift and a shrink pulling against each other on the
        element that is also the hover target. Moving the box out from under the
        cursor lets hover end, which returns the box, which starts hover again.
        That was corrected once by moving the lift to this wrapper so the button
        itself held still, and it was reported flickering again on the same
        two-colour range afterwards, on a build carrying that change.

        So the lift is gone rather than relocated. A 3px rise is not worth a
        third attempt at explaining why it flickers, and the ring below does the
        same job — it says which card the pointer is on without any part of the
        card changing size or position. What is left that still moves is the
        photograph, and it is sealed inside `overflow-hidden`: it cannot reach
        the hit area at any scale.
      */}
      <div className="relative h-full">
      {/* The ring, violet once chosen, and brighter under the pointer.
          Same two custom properties the vehicle and project cards use, so the
          three pickers in this flow cannot drift apart — a colour is as chosen
          as the machine it belongs to.

          Class-driven while unselected so `group-hover` can reach it; inline
          only for the selected state, which an inline style has to own because
          it is built from those custom properties. */}
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
          colour name makes its own card no taller than its neighbour — the
          grid stretches both and the caption bars stay on one line together. */}
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-sm"
      >
        <div className="aspect-[4/3] overflow-hidden">
          {/* Driven by the group rather than by its own hover, so it answers to
              the caption as well as to the image. Inside overflow-hidden, so it
              cannot reach the hit area no matter how far it scales.

              `transform-gpu` keeps it on its own compositing layer for good
              rather than being promoted at the start of each hover and dropped
              at the end — that churn is a repaint, and a repaint under a moving
              pointer is the other thing that reads as flicker. */}
          {color.pending ? (
            /* No scale on hover here, and nothing to scale: the lift on the
               photograph is what tells a visitor there is a picture under the
               pointer, and a colour with no picture should not claim one. The
               ring outside still answers the hover. */
            <PendingRender swatch={color.swatch} />
          ) : (
            <img
              src={color.image}
              alt={color.name}
              className="w-full h-full object-cover transform-gpu transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          )}
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
