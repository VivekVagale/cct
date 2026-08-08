import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { vehicles, type Vehicle } from "@/data/vehicles";
import { VehicleCard, VEHICLE_NAME_CLASS } from "@/components/VehicleCard";
import { VehicleFocus } from "@/components/VehicleFocus";
import { VehicleSearch } from "@/components/VehicleSearch";

interface VehicleConfiguratorProps {
  selectedVehicleId: string | null;
  selectedColorId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  onSelectColor: (colorId: string) => void;
}

export function VehicleConfigurator({
  selectedVehicleId,
  selectedColorId,
  onSelectVehicle,
  onSelectColor,
}: VehicleConfiguratorProps) {
  const [query, setQuery] = useState("");

  /*
   * Which vehicle is held at centre stage, as distinct from which one is
   * selected. Dismissing the overlay must not throw away the choice — the
   * visitor picked a bike and a colour, and closing the panel they picked them
   * in is not them changing their mind. Tapping the card again re-opens it.
   */
  const [focusedId, setFocusedId] = useState<string | null>(null);

  /*
   * Two lists, because a pinned selection must not be mistaken for a match.
   *
   * `matched` is what the query actually found; `shown` is what gets rendered,
   * which also keeps the selected vehicle on screen even when it does not match.
   * Letting a filter hide the current selection would make the colour step
   * vanish mid-configuration — the exact failure this section was rebuilt to get
   * rid of. Counting them separately is what lets a query that finds nothing
   * still say so, instead of silently leaving one unrelated card on screen.
   *
   * The marque is matched as well as the model: someone typing "kawasaki" wants
   * the two Ninjas, and the marque is printed on the card, so a name-only match
   * would read as broken rather than strict.
   */
  const { matched, shown } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { matched: vehicles, shown: vehicles };
    const matches = (v: Vehicle) =>
      `${v.manufacturer} ${v.name}`.toLowerCase().includes(q);
    const matched = vehicles.filter(matches);
    const pinned = vehicles.filter(
      (v) => v.id === selectedVehicleId && !matches(v),
    );
    return { matched, shown: [...matched, ...pinned] };
  }, [query, selectedVehicleId]);

  const focusedVehicle = vehicles.find((v) => v.id === focusedId) ?? null;

  const handleSelectVehicle = (id: string) => {
    onSelectVehicle(id);
    setFocusedId(id);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 sm:px-10">
      {/*
        The search stays on screen for as long as the grid it filters.

        Filtering changes the height of everything below it — typing "bullet"
        takes fifteen cards down to two and 1,498px out of the document — while
        the bar itself sits above the grid and does not move with it. Scrolled
        down among the cards, which is where anyone is when they decide to
        search, the bar is already off the top of the screen: the list under
        your thumb collapses and the control that did it is nowhere, with
        nothing to bring it back. Sticky is the fix rather than a scroll
        correction, because it also means the query can be changed or cleared
        without scrolling back up to find the field.

        The offset clears the fixed bar, and the background is on this element
        rather than on the search's own wrapper: that wrapper is the isolation
        context GlowButton's bloom is drawn behind, and giving it a background
        would paint over the bloom. See GlowButton.css.
      */}
      <div className="sticky top-16 sm:top-20 z-20 -mx-6 sm:-mx-10 mb-8 sm:mb-10 bg-[#05070A]/90 px-6 py-3 backdrop-blur-sm sm:px-10">
        <VehicleSearch
          value={query}
          onChange={setQuery}
          resultCount={matched.length}
        />
      </div>

      {matched.length === 0 && (
        <p className="mb-8 text-sm text-[#B8C4D6]">
          No machines match “{query.trim()}”.{" "}
          {shown.length > 0 && "Still showing your current pick. "}
          <button
            type="button"
            onClick={() => setQuery("")}
            className="border-b border-white/30 text-[#F5F7FA] transition-colors duration-300 hover:border-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            Show all
          </button>
        </p>
      )}

      {shown.length > 0 && (
        /* The What We Build ladder, one step short at the bottom. That section
           drops to a single column on phones because its cards carry a
           sentence of description that broke to two-word lines in half a
           narrow viewport; these carry a marque and a model name, which
           survive the same width — and five vehicles stacked one-up is a very
           long scroll to reach a form. */
        <div
          role="radiogroup"
          aria-label="Vehicle"
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        >
          {shown.map((vehicle) => (
            <div key={vehicle.id} className="relative">
              {/* Holds the cell open while the card is away at centre stage.
                  Without it the grid reflows the moment the card leaves and
                  reflows back as it returns, so the card flies home to a slot
                  that is still moving. `invisible` also takes its buttons out
                  of the tab order, which a copy of a real card must not keep. */}
              <div aria-hidden className="invisible rounded-sm border border-transparent">
                <div className="aspect-[4/3]" />
                <div className="p-3.5 sm:p-5">
                  <p className="text-[10px] tracking-[0.18em] uppercase mb-1">
                    {vehicle.manufacturer}
                  </p>
                  {/* Same metric the real caption uses, from the same constant
                      — this box is what actually sizes the grid cell. */}
                  <h4 className={VEHICLE_NAME_CLASS}>{vehicle.name}</h4>
                </div>
              </div>

              {focusedId !== vehicle.id && (
                <motion.div
                  layoutId={`vehicle-focus-${vehicle.id}`}
                  className="absolute inset-0"
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <VehicleCard
                    vehicle={vehicle}
                    selected={vehicle.id === selectedVehicleId}
                    onSelect={() => handleSelectVehicle(vehicle.id)}
                  />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {focusedVehicle && (
          <VehicleFocus
            key={focusedVehicle.id}
            vehicle={focusedVehicle}
            selectedColorId={selectedColorId}
            onSelectColor={(colorId) => {
              onSelectColor(colorId);
              /*
               * Closes after the choice has been seen, not with it.
               *
               * Choosing a colour finishes the job the panel was opened for, so
               * it closes itself rather than leaving the visitor to work out how
               * to get back to the form — but closing on the same frame as the
               * click threw the confirmation away with the panel. The ring and
               * the check badge landed and were gone inside one frame, so the
               * only evidence a colour had been picked was the panel vanishing,
               * which reads as a dismissal rather than a selection.
               *
               * Long enough to register as an answer, short enough that nobody
               * waits for it.
               */
              window.setTimeout(() => setFocusedId(null), 520);
            }}
            onDismiss={() => setFocusedId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
