import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { MarqueChips, type MarqueChip } from "@/components/MarqueChips";
import { OptionCard } from "@/components/OptionCard";
import { useIsPhone } from "@/hooks/useIsPhone";
import { jets, defaultJet } from "@/data/jets";
import { environments } from "@/data/environments";
import { projects } from "@/data/content";
import { ProjectOptionCard } from "@/components/ProjectOptionCard";

/** Everything the Free Fall build needs that the rest of the form does not. */
export interface FreeFallAnswers {
  plate: string;
  stickers: string;
  environment: string;
  /** "no" or "yes". A string rather than a boolean so it maps to a chip id. */
  oem: string;
  oemDetails: string;
  /** The jet's id. The name is resolved at submit; see Booking. */
  jetId: string;
}

/**
 * What a client who opens the dialog and changes nothing has chosen.
 *
 * Every one of these is the option that costs nothing extra. That is not a
 * coincidence and it should stay true: this object is what gets submitted when
 * someone picks Free Fall, glances at the dialog and closes it, and a default
 * that quietly adds a charge would be a charge nobody chose.
 */
export const FREE_FALL_DEFAULTS: FreeFallAnswers = {
  plate: "",
  stickers: "none",
  environment: environments[0].id,
  oem: "no",
  oemDetails: "",
  jetId: defaultJet.id,
};

const STICKER_OPTIONS: MarqueChip[] = [
  { id: "none", label: "None" },
  { id: "1", label: "1" },
  { id: "2", label: "2" },
  { id: "2+", label: "2+" },
];

const OEM_OPTIONS: MarqueChip[] = [
  { id: "no", label: "No", hint: "Stock machine" },
  { id: "yes", label: "Yes", hint: "Parts fitted" },
];

/* The card shown beside the brief. Resolved from the same list the form's
   grid renders, so it cannot drift from the build actually selected. */
const freeFallProject = projects.find((project) => project.id === "bike-free-fall");

const fieldClass =
  "w-full rounded-sm border border-white/[0.14] bg-white/[0.02] px-4 py-3 text-sm text-[#F5F7FA] transition-colors duration-300 focus:border-[#9F6EF2] focus:outline-none";

/**
 * The Free Fall brief, asked once, in front of everything else.
 *
 * These five questions used to be a round of DMs after the request landed —
 * the same five, every time, before the build could start. They are here
 * rather than inline under the project grid because they are a brief rather
 * than a field: opening them over the page is what says the choice just made
 * has consequences to answer, and a panel appearing three steps up a long form
 * is a change most visitors scroll straight past.
 *
 * The mechanics — portal, scrim, focus trap, scroll lock — are VehicleFocus's,
 * which solved all of this for the colour picker. See the comments there for
 * why each is shaped the way it is, particularly the scroll restore, which
 * exists because phones do not hold their position under `overflow: hidden`.
 *
 * Every control is driven from Booking's state. That is forced, not chosen: a
 * portal renders to document.body, so nothing in here is inside the form
 * element. `new FormData(form)` cannot see these fields and `required` cannot
 * fire on them. It is the same reason VehicleConfigurator sits outside the form
 * and reports upward through props.
 */
export function FreeFallDialog({
  value,
  onChange,
  onDone,
}: {
  value: FreeFallAnswers;
  onChange: (next: FreeFallAnswers) => void;
  onDone: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const isPhone = useIsPhone();
  const dialogRef = useRef<HTMLDivElement>(null);
  const oemRef = useRef<HTMLTextAreaElement>(null);
  const titleId = useId();

  /*
   * The one piece of state that is the dialog's own business.
   *
   * Constraint validation is not available — see the note above about the
   * portal — so this stands in for the browser's bubble. It is set by Done
   * rather than by typing, so the message appears when the client says they
   * are finished and not while they are still working.
   */
  const [oemMissing, setOemMissing] = useState(false);

  const set = <K extends keyof FreeFallAnswers>(
    key: K,
    next: FreeFallAnswers[K],
  ) => onChange({ ...value, [key]: next });

  // Focus in on open, and back where it came from on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => previous?.focus?.();
  }, []);

  /* The page must not scroll under a fixed overlay. VehicleFocus's lock,
     including the scroll restore that phones need. */
  useEffect(() => {
    const root = document.documentElement;
    const gap = window.innerWidth - root.clientWidth;
    const { overflow, paddingRight } = root.style;
    const y = window.scrollY;
    root.style.overflow = "hidden";
    if (gap > 0) root.style.paddingRight = `${gap}px`;
    return () => {
      root.style.overflow = overflow;
      root.style.paddingRight = paddingRight;
      if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
    };
  }, []);

  /*
   * Escape closes without validating, and that is deliberate.
   *
   * Dismissing keeps the answers, the way dismissing the colour picker keeps
   * the machine. A dialog that refuses to close until a field is filled traps
   * someone who opened it to look — and the defaults it opens with are a
   * complete answer on their own, every one of them free.
   */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onDone();
      return;
    }
    if (e.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])',
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

  /*
   * Done is never disabled.
   *
   * The step-03 textarea carries a comment on exactly this: a disabled button
   * suppresses validation entirely and leaves a dead control with no message,
   * which is worse than a button that explains itself. The mechanism has to
   * differ here because the browser's own is unavailable, but the rule it was
   * protecting is the same one.
   */
  function handleDone() {
    if (value.oem === "yes" && !value.oemDetails.trim()) {
      setOemMissing(true);
      oemRef.current?.focus();
      return;
    }
    onDone();
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-5 sm:p-8">
      <motion.div
        aria-hidden
        onClick={handleDone}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2, ease: "linear" } }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={
          isPhone
            ? "fixed inset-0 bg-[#05070A]/[0.94]"
            : "fixed inset-0 bg-[#05070A]/80 backdrop-blur-md"
        }
      />

      {/* The lift, borrowed from the colour picker so the two modals on this
          page open the same way. Same curve and same duration as the card's
          flight there -- a long ease-out that covers most of the distance
          immediately and settles slowly, which is what makes it read as the
          panel arriving rather than a box appearing.

          Out is shorter than in and travels less, matching VehicleFocus's
          colour column: a dismissal is an answer already given, and an exit
          that takes as long as the entrance feels like the page arguing.

          Under reduced motion it fades and does not travel. The setting is
          about movement, and a panel sliding up the screen is the movement it
          is asking not to see. */}
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={
          reduceMotion
            ? { opacity: 0, transition: { duration: 0.14 } }
            : { opacity: 0, y: 6, transition: { duration: 0.14 } }
        }
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 my-auto flex max-h-[calc(100dvh-2.5rem)] w-full max-w-[min(92vw,640px)] md:max-w-[min(94vw,940px)] flex-col rounded-sm border border-white/[0.1] bg-[#080A0F] focus:outline-none"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#B8C4D6]/70">
              Project Free Fall
            </p>
            <h3
              id={titleId}
              className="mt-1 font-display text-2xl text-[#F5F7FA]"
            >
              A few things about your build
            </h3>
          </div>
          <button
            type="button"
            onClick={handleDone}
            aria-label="Close"
            className="rounded-full p-2 text-[#B8C4D6] transition-colors duration-200 hover:text-[#F5F7FA] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* The build on the left, its brief on the right, from md up.
        
            The same arrangement the colour picker uses, and for the same
            reason: the thing being configured stays in view while it is being
            configured. Stacked under 768px, where two columns would leave the
            brief a strip too narrow for a four-up grid of jets.
        
            The card is inert here -- `onSelect` is a no-op. It is a picture of
            what was chosen, not a second place to choose it, and the grid it
            came from is still behind the scrim. */}
        <div className="flex min-h-0 flex-col md:flex-row">
          {freeFallProject && (
            <div className="shrink-0 px-6 pt-6 md:w-[320px] md:pr-0">
              <ProjectOptionCard
                project={freeFallProject}
                selected
                onSelect={() => {}}
              />
            </div>
          )}

          {/* min-w-0 so the brief can shrink rather than forcing the panel
              wider than its cap -- a flex item's default minimum is its content
              width, and a four-up card grid has a wide one. */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Block flow with vertical spacing, not a flex column.
        
            It was `flex flex-col gap-8` and every section came out crushed: a
            flex item defaults to `flex-shrink: 1`, so in a column with a height
            cap the children are compressed below their own content instead of
            the container scrolling. The plate label was rendered 32px tall
            holding 70px of label and input, the environment block 134px tall
            holding a 267px grid, and each section's contents spilled over the
            heading of the next one. Every section would need `shrink-0` to
            survive; block layout does not have the failure mode at all.
        
            data-lenis-prevent so the page's smooth scroll does not eat the
            wheel in here; overscroll-contain so reaching the bottom does not
            start scrolling the locked page behind it. */}
        <div
          data-lenis-prevent
          className="min-h-0 space-y-8 overflow-y-auto overscroll-contain px-6 py-6"
        >
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.14em] text-[#B8C4D6]">
            What should the plate read?
            <input
              type="text"
              value={value.plate}
              onChange={(e) => set("plate", e.target.value)}
              maxLength={40}
              placeholder="A name, a number, anything"
              className={`${fieldClass} placeholder:text-[#B8C4D6]/40`}
            />
          </label>

          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[#B8C4D6]">
              Stickers on the machine
            </p>
            <MarqueChips
              name="free-fall-stickers"
              label="Stickers on the machine"
              value={value.stickers}
              onChange={(id) => set("stickers", id)}
              options={STICKER_OPTIONS}
            />
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[#B8C4D6]">
              The light it is set in
            </p>
            <div
              role="radiogroup"
              aria-label="The light it is set in"
              className="grid grid-cols-2 gap-3"
            >
              {environments.map((environment) => (
                <OptionCard
                  key={environment.id}
                  name={environment.name}
                  hint={environment.hint}
                  image={environment.image}
                  selected={value.environment === environment.id}
                  onSelect={() => set("environment", environment.id)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[#B8C4D6]">
              OEM parts or accessories fitted
            </p>
            <MarqueChips
              name="free-fall-oem"
              label="OEM parts or accessories fitted"
              value={value.oem}
              onChange={(id) => {
                set("oem", id);
                if (id === "no") setOemMissing(false);
              }}
              options={OEM_OPTIONS}
            />

            {value.oem === "yes" && (
              <label className="mt-1 flex flex-col gap-2 text-xs uppercase tracking-[0.14em] text-[#B8C4D6]">
                Which ones?
                <textarea
                  ref={oemRef}
                  value={value.oemDetails}
                  onChange={(e) => {
                    set("oemDetails", e.target.value);
                    if (oemMissing) setOemMissing(false);
                  }}
                  rows={3}
                  maxLength={1000}
                  aria-invalid={oemMissing}
                  placeholder="Crash guard, top box, bar-end mirrors..."
                  className={`${fieldClass} resize-none placeholder:text-[#B8C4D6]/40 ${
                    oemMissing ? "border-[#E0574A]" : ""
                  }`}
                />
                {oemMissing && (
                  <span className="normal-case tracking-normal text-[#E0574A]">
                    Tell us which parts, or set this back to No.
                  </span>
                )}
              </label>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[#B8C4D6]">
              The jets around it
            </p>
            <div
              role="radiogroup"
              aria-label="The jets around it"
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {jets.map((jet) => (
                <OptionCard
                  key={jet.id}
                  name={jet.name}
                  hint={jet.hint}
                  image={jet.image}
                  selected={value.jetId === jet.id}
                  onSelect={() => set("jetId", jet.id)}
                />
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-[#B8C4D6]/70">
              Extra charges apply per sticker, for OEM parts, and for any jet
              other than the studio default. Nothing is charged here — we will
              quote it when we talk the build through.
            </p>
          </div>
        </div>

          </div>
        </div>

        <div className="border-t border-white/[0.08] px-6 py-5">
          <button
            type="button"
            onClick={handleDone}
            className="w-full rounded-sm border border-white/[0.14] bg-white/[0.03] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-[#F5F7FA] transition-colors duration-300 hover:border-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9F6EF2]"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
