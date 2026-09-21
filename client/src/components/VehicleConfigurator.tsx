import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CARD_FLIGHT } from "./cardFlight";
import { AnimatePresence, motion } from "framer-motion";
import DepthText from "./DepthText";
import { vehicles, type Vehicle } from "@/data/vehicles";
import { VehicleCard, vehicleCardClasses } from "@/components/VehicleCard";
import { MarqueChips } from "@/components/MarqueChips";
import { PendingRender } from "@/components/PendingRender";
import { VehicleFocus } from "@/components/VehicleFocus";
import { VehicleSearch } from "@/components/VehicleSearch";
import { useTilt } from "@/hooks/useTilt";

/** The chip that filters by nothing. Not a marque, so it cannot collide with one. */
const ALL_MARQUES = "__all__";

/**
 * The card that is not a machine.
 *
 * This step is a hard gate — the form will not send without a vehicle — so a
 * client riding something outside these fifty-seven had no way through it at
 * all. This is their way through.
 *
 * The obvious implementation is a row in vehicles.ts, and it is the wrong one.
 * That file is the machines the studio works with; an entry there would mint a
 * marque chip out of whatever went in its manufacturer, answer the search as
 * though it were a bike, and reach VehicleFocus with no colours for the colour
 * step to show. So it is an id the data cannot produce, held here beside the
 * other one, and `vehicles.find` resolving it to undefined is what every
 * consumer already wants rather than a case any of them has to learn.
 */
export const OTHER_VEHICLE_ID = "__other__";

/* The card's two lines. Exported because the echo above the form prints them
   too and the two must never disagree — the same reason VEHICLE_NAME_CLASS is
   exported rather than restated at each end. */
export const OTHER_MACHINE_EYEBROW = "Other";
export const OTHER_MACHINE_NAME = "My machine isn't here";

/**
 * The Other card, built to be indistinguishable from a VehicleCard in every way
 * except what it says.
 *
 * The classes are copied from that component rather than re-derived. A card in
 * this grid that does not tilt, glow, lift and ring like its fifty-seven
 * neighbours reads as broken rather than as different, and the visitor most
 * likely to need this one is already having a bad time.
 */
function OtherMachineCard({
  selected,
  onSelect,
  compact,
}: {
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  const { ref, rotateX, rotateY, glowBackground, onMouseMove, onMouseLeave } =
    useTilt<HTMLButtonElement>();
  const cls = vehicleCardClasses(compact);

  return (
    /* No beam, like every other card in this grid — see VehicleCard's `beam`
       prop. A card here that glowed while its fifty-seven neighbours could not
       would read as broken rather than as different. */
    <div className="block h-full w-full">
      <motion.button
        ref={ref}
        type="button"
        onClick={onSelect}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        whileTap={{ scale: 0.97 }}
        style={{ rotateX, rotateY, transformPerspective: 900 }}
        role="radio"
        aria-checked={selected}
        className={`group relative w-full text-left overflow-hidden rounded-sm border transition-[border-color,background-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
          selected
            ? "selected-glow bg-[#7A44E0]/[0.07]"
            : "border-white/[0.1] bg-white/[0.02] hover:border-white/30"
        }`}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: glowBackground }}
        />

        <div className="relative aspect-[4/3] overflow-hidden">
          {/* A question mark rather than a swatch, in the section heading's own
              treatment — the same face and depth colours "Pick your machine."
              is extruded in, so the card answers the heading instead of
              borrowing a placeholder built for a paint that has no render yet.
              There is no machine here to have a colour, which is what the grey
              swatch was always straining to say.

              Still, deliberately, not a photograph: the reasoning that keeps
              PendingRender off the other cards holds here too.

              Static. No pointer tracking and no orbit — each layer is another
              draw of the same glyph, this sits in a grid beside seventy others,
              and the whole configurator has just been taken off per-frame work.
              Seven layers for the same reason the phone gets seven. */}
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center bg-[#0B0E13]"
          >
            <DepthText
              text="?"
              fontSize={
                compact ? "clamp(2rem, 9vw, 3rem)" : "clamp(3rem, 7vw, 5rem)"
              }
              fontWeight={400}
              faceColor="#F5F7FA"
              depthColor="#9F6EF2"
              layers={7}
              depth={5}
              tilt={9}
              pointerTracking={false}
              autoOrbit={false}
              className="font-display"
            />
          </div>
          {/* Outside the picture, as on every other card. Left off, this card's
            bottom edge is visibly lighter than its row. */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/70 via-transparent to-transparent" />
        </div>

        <motion.div
          className={cls.cap}
          animate={{ y: selected ? -2 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* The eyebrow is load-bearing, not decoration. Every cell in this grid
            is sized by an invisible copy of a card that prints a marque line
            unconditionally; a card with no eyebrow sits a line short of its
            row and puts its name where its neighbours put their marque. */}
          <p className={cls.marque}>{OTHER_MACHINE_EYEBROW}</p>
          <h4 className={`${cls.name} text-[#F5F7FA]`}>
            {OTHER_MACHINE_NAME}
            {/* Appended rather than substituted: an aria-label here would replace
              the visible text instead of extending it, and the accessible name
              has to contain what the eye reads. */}
            <span className="sr-only"> — describe it in step 03</span>
          </h4>
        </motion.div>
      </motion.button>
    </div>
  );
}

interface VehicleConfiguratorProps {
  selectedVehicleId: string | null;
  selectedColorId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  onSelectColor: (colorId: string) => void;
  /**
   * Three across at a smaller scale, for the booking wizard.
   *
   * The step owns a whole screen there rather than sitting above a form, so the
   * grid is not competing with anything below it for height — and sixty-four
   * machines two-up is twenty-two screens of scroll to reach the end of. Three
   * across is seven.
   */
  compact?: boolean;
}

export function VehicleConfigurator({
  selectedVehicleId,
  selectedColorId,
  onSelectVehicle,
  onSelectColor,
  compact,
}: VehicleConfiguratorProps) {
  const cardClasses = vehicleCardClasses(compact);
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
    const names = [...new Set(vehicles.map(v => v.manufacturer))].sort((a, b) =>
      a.localeCompare(b)
    );
    if (names.length < 2) return [];
    return [
      { id: ALL_MARQUES, label: "All" },
      ...names.map(name => ({ id: name, label: name })),
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
      ([entry]) =>
        setPinned(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: "-64px 0px 0px 0px", threshold: 0 }
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
      inMarque(v) &&
      (!q || `${v.manufacturer} ${v.name}`.toLowerCase().includes(q));
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
      v => v.id === selectedVehicleId && inMarque(v) && !matches(v)
    );
    return { matched, shown: [...matched, ...pinned] };
  }, [query, marque, selectedVehicleId]);

  /* The `?? null` is load-bearing rather than defensive. OTHER_VEHICLE_ID
     matches no machine, so even if a later edit routed the Other card through
     handleSelectVehicle this resolves to null and the colour dialog never
     mounts — which is why VehicleFocus needs no guard against a vehicle with
     an empty colour list. */
  const focusedVehicle = vehicles.find(v => v.id === focusedId) ?? null;

  /* Stable, because every card is handed it and VehicleCard is memoised — a new
     function here each render would defeat that entirely. */
  const handleSelectVehicle = useCallback(
    (id: string) => {
      onSelectVehicle(id);
      setFocusedId(id);
    },
    [onSelectVehicle]
  );

  /*
   * Everything once, with the filtered-out cells hidden.
   *
   * `shown` still decides what is visible and in what order; the rest are
   * appended behind it so a card never has to be created or destroyed to change
   * a filter.
   */
  const shownIds = useMemo(() => new Set(shown.map(v => v.id)), [shown]);
  const rendered = useMemo(
    () => [...shown, ...vehicles.filter(v => !shownIds.has(v.id))],
    [shown, shownIds]
  );

  return (
    /* Compact carries no gutter of its own.

       This container's 24px each side is right when the configurator is a band
       on a page that sets its own margins. Inside the wizard it is the second
       gutter in a row — the step already pads to 16px — and the two stacked came
       to 44px a side on a 375px screen, measured. That is 88px of a 375px
       viewport spent on nothing, and it came straight out of the cards: 89px
       each where there was room for 107.

       Also no max-width. A 1600px cap cannot bind at this size, and leaving it
       on only invites the same mistake back. */
    <div className={compact ? "-mx-4" : "max-w-[1600px] mx-auto px-6 sm:px-10"}>
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
      {/* The negative margins pull this band out to the container's own edges
          so the blur behind it spans the full width. With no container padding
          to escape — compact — there is nothing to pull out of, and the pair
          would push the field off both sides of the screen.

          It does not stick in the wizard either: the step is its own scroller
          with a fixed footer under it, so there is no fixed page bar to clear
          and `top-16` would pin the field 64px down inside a box that starts at
          the top of the content. It scrolls with the grid it filters. */}
      <div
        className={
          compact
            ? /* No plate behind it. The field carries its own opaque black and a
               shadow (see .glow-button__field), so it stays readable with cards
               passing behind the strip — and a tinted, blurred band pinned
               across the top of a phone is the same furniture the bottom dock
               was. Only the field floats. */
              "sticky top-0 z-20 mb-4 px-4 py-3"
            : "sticky top-16 sm:top-20 z-20 -mx-6 sm:-mx-10 mb-8 sm:mb-10 px-6 py-3 sm:px-10 lg:static lg:mx-0 lg:px-0 lg:py-0"
        }
      >
        {/* The nav bar's glass, and only while the bar is pinned.

            It was a flat 90% black band that was there the whole time, which is
            a solid stripe across the section even when nothing is behind it to
            hide. This is the same tint, blur and hairline the nav uses, so the
            two surfaces that float over this page are the same surface — and it
            arrives when the bar starts floating and goes when it stops. */}
        {/* Never in compact: the band is not pinned there, so a glass plate
            behind it would be a stripe across a field that is sitting still. */}
        {pinned && !compact && (
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
        <div className={compact ? "mb-4 px-4" : "mb-8 sm:mb-10"}>
          <MarqueChips
            name="vehicle-marque"
            label="Filter machines by manufacturer"
            options={marques}
            value={marque}
            onChange={setMarque}
            /* Only here. The other three chip rows are questions inside a form,
               where a row lighting as the pointer crosses it reads as loading
               rather than answerable. */
            beam
          />
        </div>
      )}

      {/* Says which filter emptied the list, because there are two of them now
          and "no machines match" with an empty query read as a bug. Clearing
          resets both — the reader wants the list back, not an audit of which
          control they last touched. */}
      {matched.length === 0 && (
        <p
          className={
            compact
              ? "mb-6 px-4 text-sm text-[#B8C4D6]"
              : "mb-8 text-sm text-[#B8C4D6]"
          }
        >
          {query.trim() && marque !== ALL_MARQUES
            ? `No ${marque} machines match “${query.trim()}”. `
            : query.trim()
              ? `No machines match “${query.trim()}”. `
              : `No ${marque} machines here yet. `}
          {/* True only because Other is not in `shown` — it is always drawn,
              and a card that is always drawn is not a pin. Push it into
              `shown` and this sentence starts claiming a selection nobody
              made. */}
          {shown.length > 0 && "Still showing your current pick. "}
          Not on this list at all? Pick Other, below.{" "}
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

      {/* The What We Build ladder, one step short at the bottom. That section
          drops to a single column on phones because its cards carry a sentence
          of description that broke to two-word lines in half a narrow viewport;
          these carry a marque and a model name, which survive the same width —
          and five vehicles stacked one-up is a very long scroll to reach a form.

          Not gated on `shown.length` any more: the grid always holds at least
          the Other card, and hiding it when a search matches nothing would hide
          it at the one moment it answers the question being asked. */}
      <div
        role="radiogroup"
        aria-label="Vehicle"
        /* Edge to edge, all but the 4px the selected ring needs to draw in.
           Three across on a 375px screen is arithmetic: every pixel of gutter
           and gap is a third of a pixel off each card, so the gutter goes and
           the gap comes down to 8. 108px becomes 117. That is the ceiling at
           this column count — 2-up is the only way to go materially bigger. */
        className={
          compact
            ? "grid grid-cols-3 gap-2 px-1"
            : "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        }
      >
        {rendered.map(vehicle => (
          <div
            key={vehicle.id}
            /* `hidden` rather than absent.
               Filtering used to render only what matched, so going back to ALL
               created forty-four cards in one synchronous commit — about 150ms,
               roughly 3ms a card, each building four framer components and seven
               framer objects in useTilt before anything is drawn. Every card is
               built once now and filtering is a class change.
               The full set is mounted at rest anyway: ALL is the default, so
               this is weight the page already carried. */
            className={shownIds.has(vehicle.id) ? "relative" : "hidden"}
          >
            {/* Holds the cell open while the card is away at centre stage.
                  Without it the grid reflows the moment the card leaves and
                  reflows back as it returns, so the card flies home to a slot
                  that is still moving. `invisible` also takes its buttons out
                  of the tab order, which a copy of a real card must not keep. */}
            <div
              aria-hidden
              className="invisible rounded-sm border border-transparent"
            >
              <div className="aspect-[4/3]" />
              {/* Same metrics the real caption uses, from the same helper —
                    this box is what actually sizes the grid cell, so it has to
                    follow the density the cards are drawn at. */}
              <div className={cardClasses.cap}>
                <p className={cardClasses.marque}>{vehicle.manufacturer}</p>
                <h4 className={cardClasses.name}>{vehicle.name}</h4>
              </div>
            </div>

            {focusedId !== vehicle.id && (
              <motion.div
                /* Paired with the panel's copy — and dropped in compact for
                     the same reason it is dropped there: see VehicleFocus. Both
                     halves have to go together, or framer holds a measurement
                     open for a partner that never arrives. */
                layoutId={
                  CARD_FLIGHT && !compact
                    ? `vehicle-focus-${vehicle.id}`
                    : undefined
                }
                className="absolute inset-0"
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <VehicleCard
                  vehicle={vehicle}
                  selected={vehicle.id === selectedVehicleId}
                  onSelect={handleSelectVehicle}
                  compact={compact}
                />
              </motion.div>
            )}
          </div>
        ))}

        {/* Last, and outside the map, because it is not a vehicle. Keeping it
              out of `matched` and `shown` is what lets those two stay Vehicle[]
              and lets the result count go on meaning machines.

              Never filtered — not by the query, not by the marque. Someone who
              searches for their bike and finds nothing is exactly who this is
              for, and a control that only appears on failure is one nobody
              knows exists.

              Same cell shape as the cards above: an invisible copy sizes the
              grid slot and the real card lies over it, so parity is by
              construction rather than by two pieces of markup that happen to
              measure alike. No layoutId — this card is never promoted to centre
              stage, so there is nothing for one to pair with. */}
        <div className="relative">
          <div
            aria-hidden
            className="invisible rounded-sm border border-transparent"
          >
            <div className="aspect-[4/3]" />
            <div className={cardClasses.cap}>
              <p className={cardClasses.marque}>{OTHER_MACHINE_EYEBROW}</p>
              <h4 className={cardClasses.name}>{OTHER_MACHINE_NAME}</h4>
            </div>
          </div>

          <div className="absolute inset-0">
            <OtherMachineCard
              compact={compact}
              selected={selectedVehicleId === OTHER_VEHICLE_ID}
              /* Straight to the parent, deliberately not through
                   handleSelectVehicle: that one also sets focusedId, which is
                   what opens the colour dialog. There are no colours here. */
              onSelect={() => onSelectVehicle(OTHER_VEHICLE_ID)}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {focusedVehicle && (
          <VehicleFocus
            key={focusedVehicle.id}
            vehicle={focusedVehicle}
            selectedColorId={selectedColorId}
            onSelectColor={colorId => {
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
               * 520ms is that hold on a desktop, where the card also has a
               * flight home to make and the pointer is nowhere near the thing it
               * just clicked.
               *
               * On a phone it was the lag. There is no flight any more, the
               * thumb is resting on the row that just lit up, and the grid card
               * behind carries the same selected ring — so the confirmation has
               * already been delivered three ways before this timer starts. Half
               * a second of a panel sitting still after a tap is not a beat, it
               * is a page that has stopped responding. One frame at 120ms is
               * enough for the badge to paint and not enough to read as a hang.
               */
              window.setTimeout(() => setFocusedId(null), compact ? 120 : 520);
            }}
            onDismiss={() => setFocusedId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
