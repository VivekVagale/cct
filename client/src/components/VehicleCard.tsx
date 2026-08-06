import { motion } from "framer-motion";
import type { Vehicle } from "@/data/vehicles";
import { useTilt } from "@/hooks/useTilt";

/**
 * The model name's type and the height it is given, exported because the grid
 * renders an invisible copy of this caption to hold each cell open while a card
 * is away at centre stage — see VehicleConfigurator. Two elements deciding one
 * measurement in two places is how they came apart: the card was restyled, the
 * spacer was not, and the cell was then sized by neither.
 *
 * Two lines are reserved whether or not the name needs them. "Super Meteor 650"
 * is the only name that wraps in a two-up phone column, and an unreserved
 * second line made its cell 24px taller than the row — the grid stretched its
 * neighbour to match, so one card ran long and the card beside it gained dead
 * space under its caption. At 1.15 line-height, 2.3em is exactly two lines.
 */
export const VEHICLE_NAME_CLASS =
  "font-display text-base sm:text-xl leading-[1.15] min-h-[2.3em]";

interface VehicleCardProps {
  vehicle: Vehicle;
  selected: boolean;
  onSelect: () => void;
  /**
   * Off while the card is held at centre stage.
   *
   * The tilt is a hover affordance for a tile in a grid — something to invite
   * the pointer. A card the visitor is already reading, with its colours laid
   * out beneath it, should not wobble under the cursor while they choose.
   */
  tilt?: boolean;
}

export function VehicleCard({
  vehicle,
  selected,
  onSelect,
  tilt = true,
}: VehicleCardProps) {
  const { ref, rotateX, rotateY, glowBackground, onMouseMove, onMouseLeave } =
    useTilt<HTMLButtonElement>();

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onSelect}
      onMouseMove={tilt ? onMouseMove : undefined}
      onMouseLeave={tilt ? onMouseLeave : undefined}
      whileTap={{ scale: 0.97 }}
      /* The rotation lives here and nowhere else. Framer's layout projection
         measures a rendered box, and a rotated box measures wrong — so the
         flight to centre stage is animated by a plain wrapper above this
         element rather than by this element itself. Keeping the two on
         separate nodes is what stops the promotion from skewing. */
      style={tilt ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      role="radio"
      aria-checked={selected}
      /* Not transition-all: the tilt writes to transform on this same element,
         and a CSS transition on transform fights the frame-by-frame value
         framer is setting there. */
      className={`group relative w-full text-left overflow-hidden rounded-sm border transition-[border-color,background-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
        selected
          ? "selected-glow bg-[#7A44E0]/[0.07]"
          : "border-white/[0.1] bg-white/[0.02] hover:border-white/30"
      }`}
    >
      {/* Cursor-follow highlight */}
      {tilt && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: glowBackground }}
        />
      )}

      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={vehicle.image}
          alt={vehicle.name}
          className="w-full h-full object-cover"
          animate={{ scale: selected ? 1.06 : 1 }}
          whileHover={tilt ? { scale: 1.08, y: -4 } : undefined}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/70 via-transparent to-transparent" />
      </div>

      {/* These stay two-up on a phone where the project cards drop to one:
          the caption is a marque and a model name, not a sentence, so it still
          reads in a ~156px column. It does need the smaller step of the scale
          to do it — at text-xl in that width the longer names broke to three
          lines. */}
      <motion.div
        className="relative p-3.5 sm:p-5"
        animate={{ y: selected ? -2 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {vehicle.manufacturer && (
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#B8C4D6] mb-1">
            {vehicle.manufacturer}
          </p>
        )}
        <h4 className={`${VEHICLE_NAME_CLASS} text-[#F5F7FA]`}>{vehicle.name}</h4>
      </motion.div>
    </motion.button>
  );
}
