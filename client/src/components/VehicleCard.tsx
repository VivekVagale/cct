import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { PendingRender } from "@/components/PendingRender";
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

/**
 * The card at two densities, from one place.
 *
 * The booking wizard puts this grid three across on a 390px screen, where a
 * cell is about 102px. That is not the two-up card narrowed — a card narrowed
 * is one whose caption no longer fits it, and this caption is a marque and a
 * model name with nothing in them that can break badly. It is the card scaled:
 * the crop stays 4:3, and the padding and both type sizes come down together so
 * the proportions hold.
 *
 * Returned as a set rather than exported as six constants because the grid is
 * sized by an invisible copy of each card, and the copy has to use exactly what
 * the real one uses or the cells stop matching their contents. One call, three
 * classes, used at both ends.
 */
export function vehicleCardClasses(compact?: boolean) {
  return compact
    ? {
        name: "font-display text-[11px] leading-[1.15] min-h-[2.3em]",
        cap: "relative px-2 pt-2 pb-2.5",
        marque: "text-[8px] tracking-[0.1em] uppercase text-[#B8C4D6] mb-0.5",
      }
    : {
        name: VEHICLE_NAME_CLASS,
        cap: "relative p-3.5 sm:p-5",
        marque: "text-[10px] tracking-[0.18em] uppercase text-[#B8C4D6] mb-1",
      };
}

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
  /** Three-up on a phone rather than two. See vehicleCardClasses. */
  compact?: boolean;
}

export function VehicleCard({
  vehicle,
  selected,
  onSelect,
  tilt = true,
  compact,
}: VehicleCardProps) {
  const cls = vehicleCardClasses(compact);
  const { ref, rotateX, rotateY, glowBackground, onMouseMove, onMouseLeave } =
    useTilt<HTMLDivElement>();

  return (
    /*
     * Three nested boxes, and each one has to be its own.
     *
     * The outer div measures and listens. `useTilt` reads
     * `ref.current.getBoundingClientRect()` on every pointer move, so the element
     * it holds must not be the one that rotates — a rotated box reports a larger
     * rect, which moves the pointer fraction, which changes the rotation. That is
     * a feedback loop, and it is why the ref moved off the button.
     *
     * The middle div rotates, and it contains the beam as well as the card. With
     * the rotation on the button the beam stayed flat while the card tilted away
     * from it, and a selected card slid out from under its own border.
     *
     * The rotation still is not on framer's layout wrapper: the configurator's
     * `layoutId` node is above all of this, and the original warning holds —
     * projection measures a rendered box and a rotated box measures wrong.
     */
    <motion.div
      ref={ref}
      onMouseMove={tilt ? onMouseMove : undefined}
      onMouseLeave={tilt ? onMouseLeave : undefined}
      className="h-full w-full"
    >
      <motion.div
        className="h-full w-full"
        whileTap={{ scale: 0.97 }}
        style={
          tilt ? { rotateX, rotateY, transformPerspective: 900 } : undefined
        }
      >
        <motion.button
          type="button"
          onClick={onSelect}
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
            {/* A machine with no render at all takes the paint of its first
            colourway. It is the one the cover would have been shot in — the
            covers on this page are all the first colour's file — so the grid
            keeps the ordering it would have had. */}
            {vehicle.pending ? (
              <PendingRender swatch={vehicle.colors[0]?.swatch ?? "#6E7378"} />
            ) : (
              <motion.img
                src={vehicle.image}
                alt={vehicle.name}
                /* Sixty-four of these render at once and every one of them used to
               be fetched on mount — about 5MB of covers before a visitor had
               scrolled past the first row. The browser is better placed than we
               are to decide which are about to be seen. */
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                animate={{ scale: selected ? 1.06 : 1 }}
                whileHover={tilt ? { scale: 1.08, y: -4 } : undefined}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/70 via-transparent to-transparent" />
          </div>

          {/* These stay two-up on a phone where the project cards drop to one:
          the caption is a marque and a model name, not a sentence, so it still
          reads in a ~156px column. It does need the smaller step of the scale
          to do it — at text-xl in that width the longer names broke to three
          lines. */}
          <motion.div
            className={cls.cap}
            animate={{ y: selected ? -2 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {vehicle.manufacturer && (
              <p className={cls.marque}>{vehicle.manufacturer}</p>
            )}
            <h4 className={`${cls.name} text-[#F5F7FA]`}>{vehicle.name}</h4>
          </motion.div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
