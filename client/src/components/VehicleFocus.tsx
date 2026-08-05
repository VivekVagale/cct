import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { Vehicle } from "@/data/vehicles";
import { VehicleCard } from "@/components/VehicleCard";
import { ColorCard } from "@/components/ColorCard";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

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
    root.style.overflow = "hidden";
    if (gap > 0) root.style.paddingRight = `${gap}px`;
    return () => {
      root.style.overflow = overflow;
      root.style.paddingRight = paddingRight;
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
        className="fixed inset-0 bg-[#05070A]/80 backdrop-blur-md"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="relative z-10 my-auto w-full max-w-[min(90vw,520px)] focus:outline-none"
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
        <motion.div
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
          className="pt-5"
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
          <div
            role="radiogroup"
            aria-label={`Colour for ${vehicle.manufacturer} ${vehicle.name}`}
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${vehicle.colors.length}, minmax(0, 1fr))`,
            }}
          >
            {vehicle.colors.map((color) => (
              <ColorCard
                key={color.id}
                color={color}
                selected={color.id === selectedColorId}
                onSelect={() => onSelectColor(color.id)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>,
    document.body,
  );
}
