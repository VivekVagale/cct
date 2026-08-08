import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { Vehicle } from "@/data/vehicles";
import { VehicleCard } from "@/components/VehicleCard";
import { ColorCard } from "@/components/ColorCard";
import { useBouncyScroll } from "@/hooks/useBouncyScroll";
import { useIsPhone } from "@/hooks/useIsPhone";

interface VehicleFocusProps {
  vehicle: Vehicle;
  selectedColorId: string | null;
  onSelectColor: (colorId: string) => void;
  onDismiss: () => void;
}

/**
 * The selected vehicle, held at centre stage while its colours are chosen.
 *
 * This exists because of where the colours used to live. They opened in a panel
 * below the whole vehicle grid, which on a tall grid put them off the bottom of
 * the screen — the visitor picked a bike, saw nothing happen, and scrolled past
 * the colour step entirely. Bringing the card to the middle of the viewport
 * makes that failure impossible: the thing you just chose and the choice it
 * unlocked are the only things on screen.
 *
 * It is portalled to the body on purpose. The scrim blurs everything behind it,
 * and an element cannot sit above a blur it is nested inside — rendering here
 * from inside the grid would blur the card along with its own background.
 * layoutId still pairs across the portal, because a portal moves the DOM node
 * without moving the React tree.
 */
export function VehicleFocus({
  vehicle,
  selectedColorId,
  onSelectColor,
  onDismiss,
}: VehicleFocusProps) {
  const reduceMotion = useReducedMotion();
  const isPhone = useIsPhone();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  /* Damped wheel scrolling and a rubber band at the ends, for the one list on
     the site that still moved in hard steps. Under reduced motion it keeps the
     browser's plain scroll, which is the setting's whole point. */
  const colorListRef = useRef<HTMLDivElement>(null);
  useBouncyScroll(colorListRef, !reduceMotion);

  /*
   * Focus goes in on open and comes back out on close.
   *
   * Without the restore, dismissing drops focus onto the body and a keyboard
   * visitor is returned to the top of the document — having to tab back through
   * the whole page to reach the grid they were just in.
   */
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => previous?.focus?.();
  }, []);

  /*
   * The page must not scroll underneath a fixed overlay. Compensating the
   * scrollbar's width as it goes keeps the layout from jolting sideways at the
   * moment the lock is applied.
   */
  useEffect(() => {
    const root = document.documentElement;
    const gap = window.innerWidth - root.clientWidth;
    const { overflow, paddingRight } = root.style;
    /*
     * Where the reader was, remembered rather than assumed.
     *
     * `overflow: hidden` on the root is supposed to hold the scroll position
     * while it makes the page unscrollable, and on a desktop it does. On a
     * phone it is not dependable: the root stops being a scroll container, and
     * what the position means while it is not one — and where it resolves to
     * when it becomes one again — differs by engine. Choosing a colour then
     * returned the reader somewhere up the page rather than to the picker they
     * were using, which is the whole complaint: picking a colour is not a
     * request to go anywhere.
     *
     * Restored only if it actually drifted, so on every browser that already
     * held it this costs nothing and cannot fight the page's own smooth scroll.
     */
    const y = window.scrollY;
    root.style.overflow = "hidden";
    if (gap > 0) root.style.paddingRight = `${gap}px`;
    return () => {
      root.style.overflow = overflow;
      root.style.paddingRight = paddingRight;
      if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
    };
  }, []);

  // Escape closes; Tab is kept inside the dialog.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onDismiss();
      return;
    }
    if (e.key !== "Tab") return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-5 sm:p-8">
      {/* The blur is the whole background in one layer — siblings, the form
          beneath, and the starfield behind that. A tinted scrim carries most of
          the separation so the blur radius can stay modest; this page already
          runs two full-viewport WebGL loops and a heavy backdrop filter
          recomposites all of it every frame. */}
      <motion.div
        aria-hidden
        onClick={onDismiss}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        // Out faster than in. The scrim is the last thing holding the overlay
        // mounted, so its duration is how long the dismissal takes.
        exit={{ opacity: 0, transition: { duration: 0.2, ease: "linear" } }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        /* fixed, not absolute. The overlay around it scrolls when the card and
           its colours are taller than the viewport, and an absolute scrim is
           positioned against that scroll container — so it slid up with the
           content and left the bottom of the page sharp behind the colours. */
        /*
         * Opaque on a phone rather than blurred.
         *
         * A full-viewport backdrop-filter recomposites everything beneath it on
         * every frame, and beneath it is the whole page plus a WebGL starfield
         * that is now drawing there too. On top of that this is the moment the
         * card is flying to the middle of the screen, so the blur is being
         * recomputed for each frame of a layout animation — which is what makes
         * opening a vehicle stutter on a phone and not on a desktop.
         *
         * At 94% black almost nothing shows through anyway, so the blur was
         * buying very little of the separation it costs. A desktop keeps it.
         */
        className={
          isPhone
            ? "fixed inset-0 bg-[#05070A]/[0.94]"
            : "fixed inset-0 bg-[#05070A]/80 backdrop-blur-md"
        }
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        /* Capped against the viewport in both directions.
           
              It was capped on width alone, so on a window shorter than about
              900px — which is any browser that is not fullscreen — the card's
              own height ran past the bottom of the screen and took the colour
              row with it. The scrim's `overflow-y-auto` could not save it
              either: the card is centred, and a centred flex child taller than
              its scroll container overflows in both directions at once.
           
              `dvh` rather than `vh` because mobile browsers shrink the visible
              area as their chrome appears, and `vh` keeps reporting the larger
              figure.
           
              430px rather than 520. Width is the only honest lever here: the
              photo is a 4:3 box, so its height follows its width, and the
              caption under it follows the type. Narrowing the card shortens
              the whole thing in proportion and everything keeps its shape —
              which capping any one part of it did not.
           
              From md the dialog goes wide instead, because the colours move
              beside the machine rather than under it. */
          className="relative z-10 my-auto flex w-full max-w-[min(92vw,430px)] md:max-w-[min(94vw,940px)] max-h-[calc(100dvh-2.5rem)] flex-col focus:outline-none"
      >
        <p id={titleId} className="sr-only">
          {vehicle.manufacturer} {vehicle.name} — choose a colour
        </p>

        <motion.div
          className="flex justify-end pb-3"
          exit={{ opacity: 0, transition: { duration: 0.14 } }}
        >
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close"
            className="rounded-full p-2 text-[#B8C4D6] transition-colors duration-200 hover:text-[#F5F7FA] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>

        {/* The travelling element. layoutId pairs it with the empty slot left
            behind in the grid, and Framer interpolates between the two boxes —
            which is why the rotation from useTilt is switched off here: layout
            projection measures a rendered box, and a rotated one measures
            wrong. */}
        <div className="flex min-h-0 flex-col gap-6 md:flex-row md:items-start md:gap-8">
        <motion.div
          /* Nothing overriding the card's own geometry.
          
             This used to cap the image's height, which cannot work: the photo
             sits in a fixed 4:3 box, so the box kept its height while the
             picture shrank inside it and the caption ended up below where the
             card believed it stopped — under the colour row. The card is scaled
             by its width instead, on the wrapper above. */
          className="shrink-0 md:w-[400px]"
          layoutId={reduceMotion ? undefined : `vehicle-focus-${vehicle.id}`}
          initial={reduceMotion ? { opacity: 0 } : false}
          animate={reduceMotion ? { opacity: 1 } : undefined}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <VehicleCard vehicle={vehicle} selected onSelect={() => {}} tilt={false} />
        </motion.div>

        {/* The colours stagger in behind the card and leave all at once.
            Without the exit they had no exit animation at all, so they stayed
            at full opacity for the whole of the scrim's fade — the blur lifted,
            the card flew home, and the colour row hung over an unblurred page
            until AnimatePresence finally unmounted it. Shorter than the scrim
            so they are gone before the background is sharp again. */}
        <motion.div
          /* min-h-0 so the list inside can shrink and scroll rather than
             pushing the card past the viewport — the card is a flex column
             with a height cap, and a child that refuses to shrink defeats it. */
          /* Beside the machine from md up, and the part that scrolls.
          
             Under the card, a long range pushed the colours off the bottom of
             a laptop screen and left the visitor scrolling a modal to find
             them. Beside it, the machine stays in view while the colours are
             chosen — which is the whole point of looking at a colour — and the
             list has the dialog's full height to use before it needs to
             scroll at all. */
          className="flex min-h-0 flex-1 flex-col pt-0 md:pt-0"
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: 6, transition: { duration: 0.14 } }}
          variants={{
            hidden: {},
            show: {
              transition: reduceMotion
                ? {}
                : { delayChildren: 0.3, staggerChildren: 0.06 },
            },
          }}
        >
          <motion.p
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
            className="mb-3 text-[10px] tracking-[0.18em] uppercase text-[#B8C4D6]"
          >
            Colour — {vehicle.manufacturer} {vehicle.name}
          </motion.p>

          {/* Columns from the data, not a breakpoint: vehicles carry two or
              three colours and a fixed three-up leaves a hole under the ones
              that carry two. */}
          {/*
            Three across, wrapping, and scrolling inside its own box.

            The column count used to be the number of colours, which was fine
            when a machine had two or three and absurd once the real range
            arrived — Meteor 350 has twenty, and twenty columns of a 430px card
            is a row of 20px slivers with the names clipped to one letter. A
            fixed three keeps every card the same usable size whatever the
            machine, and the rows simply continue downward.

            `overscroll-contain` is the other half. Without it a wheel at the
            end of this list chains straight through to the page behind, which
            is what made scrolling here move the site instead of the colours.
          */}
          <div
            ref={colorListRef}
            role="radiogroup"
            aria-label={`Colour for ${vehicle.manufacturer} ${vehicle.name}`}
            /* Two across, not three.
            
               Each of these carries a photograph of that exact colourway and a
               name that must not be clipped — "Signals Commando Sand" and
               "Bruntingthorpe Blue" are real entries in this range. Three
               columns of a 940px dialog left a ~170px card, which is a thumbnail
               with a truncated caption. Two gives ~260px: an image big enough to
               tell one paint from another, and room for the longest name on two
               lines rather than an ellipsis.
            
               More of them simply means more rows and more scrolling, which is
               the correct trade — a colour picker exists to be looked at. */
            /* Lenis has to be told to keep its hands off this one.
            
               Smooth scrolling works by capturing the wheel globally and
               calling preventDefault on it, then moving the page itself — which
               means a nested scroller never receives a native scroll at all.
               The list was scrollable and the wheel simply never reached it.
               `data-lenis-prevent` is the library's own opt-out for exactly
               this case. */
            data-lenis-prevent
            /* Padded on every side, not just the right.

               The selected ring is drawn one pixel outside its card, and the
               top row of cards sits flush against this container's edge — so
               `overflow-y-auto` clipped the ring's top line and left the violet
               open above the card it belongs to. The padding is the ring's own
               overhang plus room for the bloom to start before it is cut. */
            className="max-h-[46dvh] md:max-h-[64dvh] overflow-y-auto overscroll-contain p-1"
          >
            {/* The scroller and the grid are two elements now. useBouncyScroll
                stretches the wrapper's single child past the ends, so the thing
                being stretched has to be the whole grid rather than each card. */}
            <div className="grid grid-cols-2 gap-3">
              {vehicle.colors.map((color) => (
                <ColorCard
                  key={color.id}
                  color={color}
                  selected={color.id === selectedColorId}
                  onSelect={() => onSelectColor(color.id)}
                />
              ))}
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
