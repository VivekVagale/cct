import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { vehicles, type Vehicle } from "@/data/vehicles";
import { VehicleCard, VEHICLE_NAME_CLASS } from "@/components/VehicleCard";
import { MarqueChips } from "@/components/MarqueChips";
import { VehicleFocus } from "@/components/VehicleFocus";
import { VehicleSearch } from "@/components/VehicleSearch";

/** The chip that filters by nothing. Not a marque, so it cannot collide with one. */
const ALL_MARQUES = "__all__";

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
  const [marque, setMarque] = useState(ALL_MARQUES);

  /*
   * The chips, read off the machines rather than written out.
   *
   * A hardcoded list is a second place to remember, and it fails silently: add a
   * marque to vehicles.ts, forget the chips, and the new machine is unreachable
   * by anything but the search box. Derived, adding a manufacturer to the data
   * is the whole job — the chip appears, in alphabetical order, with no other
   * edit anywhere.
   *
   * Below two marques the row is not offered at all. One chip beside "All" is a
   * control with nothing to decide, and this list was a single manufacturer's
   * range until very recently.
   */
  const marques = useMemo(() => {
    const names = [...new Set(vehicles.map((v) => v.manufacturer))].sort((a, b) =>
      a.localeCompare(b),
    );
    if (names.length < 2) return [];
    return [
      { id: ALL_MARQUES, label: "All" },
      ...names.map((name) => ({ id: name, label: name })),
    ];
  }, []);

  /*
   * Which vehicle is held at centre stage, as distinct from which one is
   * selected. Dismissing the overlay must not throw away the choice — the
   * visitor picked a bike and a colour, and closing the panel they picked them
   * in is not them changing their mind. Tapping the card again re-opens it.
   */
  const [focusedId, setFocusedId] = useState<string | null>(null);

  /*
   * Whether the search bar is currently pinned, so the glass behind it exists
   * only while there is something to hide behind it.
   *
   * A sentinel rather than a scroll position: a 1px marker sits where the bar
   * would be if it were not sticky, and the moment that marker passes under the
   * fixed nav the bar has left the flow and cards are running beneath it. No
   * listener on scroll, and nothing to keep in step with the `top` offset except
   * the margin below, which is that offset.
   *
   * Mounted, not faded. A backdrop-filter costs its blur whether or not it is
   * visible, so the layer is absent rather than transparent — the same reason
   * the nav bar's glass is conditionally rendered instead of animated.
   */
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setPinned(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: "-64px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
   *
   * The chips narrow the same list rather than replacing it, so a marque and a
   * query compose — "Bajaj" plus "150" is both, not the last one pressed.
   */
  const { matched, shown } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inMarque = (v: Vehicle) =>
      marque === ALL_MARQUES || v.manufacturer === marque;
    const matches = (v: Vehicle) =>
      inMarque(v) && (!q || `${v.manufacturer} ${v.name}`.toLowerCase().includes(q));
    const matched = vehicles.filter(matches);
    /*
     * The pin survives a query, not a marque.
     *
     * It exists so that typing into the search cannot make the machine you are
     * part-way through configuring disappear from under you. A marque chip is a
     * different question — asked "show me the Hondas", nobody means "and also
     * the Royal Enfield I picked earlier", and a Bullet sitting under the KTM
     * chip reads as the filter being broken rather than as a courtesy.
     *
     * Nothing is lost by dropping it: the choice is held in state, and the
     * summary above the form goes on naming it whatever the grid is showing.
     */
    const pinned = vehicles.filter(
      (v) => v.id === selectedVehicleId && inMarque(v) && !matches(v),
    );
    return { matched, shown: [...matched, ...pinned] };
  }, [query, marque, selectedVehicleId]);

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

        The offset clears the fixed bar, and whatever sits behind the field goes
        on this element rather than on the search's own wrapper: that wrapper is
        the isolation context GlowButton's bloom is drawn behind, and giving it a
        background would paint over the bloom. See GlowButton.css.

        None of it from lg up. The band exists only to stop cards showing
        through a bar they scroll under, so it belongs exactly where the bar is
        pinned and nowhere else — and a 1,600px container makes it a full-width
        stripe behind a field that is 28rem wide, which is a lot of furniture for
        a problem a desktop does not have.
      */}
      <div ref={sentinelRef} aria-hidden className="h-px lg:hidden" />
      <div className="sticky top-16 sm:top-20 z-20 -mx-6 sm:-mx-10 mb-8 sm:mb-10 px-6 py-3 sm:px-10 lg:static lg:mx-0 lg:px-0 lg:py-0">
        {/* The nav bar's glass, and only while the bar is pinned.

            It was a flat 90% black band that was there the whole time, which is
            a solid stripe across the section even when nothing is behind it to
            hide. This is the same tint, blur and hairline the nav uses, so the
            two surfaces that float over this page are the same surface — and it
            arrives when the bar starts floating and goes when it stops. */}
        {pinned && (
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[#05070A]/55 backdrop-blur-md border-b border-white/[0.06] lg:hidden"
          />
        )}
        <VehicleSearch
          value={query}
          onChange={setQuery}
          resultCount={matched.length}
        />
      </div>

      {/* Under the search, because it narrows the same list the search does.
          Its own name so the radios cannot be confused with the usage chips
          further down the form, which are a real answer the studio reads. */}
      {marques.length > 0 && (
        <div className="mb-8 sm:mb-10">
          <MarqueChips
            name="vehicle-marque"
            label="Filter machines by manufacturer"
            options={marques}
            value={marque}
            onChange={setMarque}
          />
        </div>
      )}

      {/* Says which filter emptied the list, because there are two of them now
          and "no machines match" with an empty query read as a bug. Clearing
          resets both — the reader wants the list back, not an audit of which
          control they last touched. */}
      {matched.length === 0 && (
        <p className="mb-8 text-sm text-[#B8C4D6]">
          {query.trim() && marque !== ALL_MARQUES
            ? `No ${marque} machines match “${query.trim()}”. `
            : query.trim()
              ? `No machines match “${query.trim()}”. `
              : `No ${marque} machines here yet. `}
          {shown.length > 0 && "Still showing your current pick. "}
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setMarque(ALL_MARQUES);
            }}
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
