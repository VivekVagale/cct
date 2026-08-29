import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { MarqueChips, type MarqueChip } from "@/components/MarqueChips";
import { OptionCard } from "@/components/OptionCard";
import { ProjectOptionCard } from "@/components/ProjectOptionCard";
import { useIsPhone } from "@/hooks/useIsPhone";
import { jets, defaultJet } from "@/data/jets";
import { environments, defaultEnvironment } from "@/data/environments";
import { projects } from "@/data/content";

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
  environment: defaultEnvironment.id,
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

/* Each section arrives on the parent's clock, the way the colour cards do.
   The parent staggers; a section only says what its own arrival looks like. */
const SECTION = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

/**
 * Which builds ask a brief, and which questions each one asks.
 *
 * Free Fall puts the machine among jets, so it needs to know which jets and in
 * what light. Studio is a seamless floor and one lighting set-up, so both of
 * those questions have no answer to give -- asking them would be asking a
 * client to choose something that does not vary.
 *
 * A build absent from this table opens no dialog at all. That is how Minecraft
 * and Custom CGI stay untouched.
 */
export interface BriefConfig {
  environment: boolean;
  jets: boolean;
}

export const BUILD_BRIEFS: Record<string, BriefConfig> = {
  "bike-free-fall": { environment: true, jets: true },
  /* Free Fall's brief minus the jets question, which is the whole difference
     between the two entries. The riders and OEM questions are not in this
     table at all — they are asked of every build that opens a brief — so
     "everything except jets" is one flag, not a list. */
  "bike-free-fall-premium": { environment: true, jets: false },
  studio: { environment: false, jets: false },
};

export const hasBrief = (projectId: string) => projectId in BUILD_BRIEFS;

const eyebrowClass = "text-[10px] uppercase tracking-[0.18em] text-[#B8C4D6]";

const fieldClass =
  "w-full rounded-sm border border-white/[0.14] bg-white/[0.02] px-4 py-3 text-sm normal-case tracking-normal text-[#F5F7FA] transition-colors duration-300 focus:border-[#9F6EF2] focus:outline-none";

/**
 * The Free Fall brief, asked once, in front of everything else.
 *
 * These five questions used to be a round of DMs after the request landed —
 * the same five, every time, before the build could start.
 *
 * It is the colour picker, with a build in place of a machine and five
 * questions in place of one. That is the whole design: VehicleFocus's chrome,
 * its layout, its lift, its cards. An earlier version drew a bordered panel
 * with a header bar and a footer, which is a different object from the picker
 * two steps up the same form — same page, same flow, same scrim, two visual
 * languages. See the comments in VehicleFocus for why each mechanism is shaped
 * the way it is, particularly the scroll restore, which exists because phones
 * do not hold their position under `overflow: hidden`.
 *
 * Every control is driven from Booking's state. That is forced, not chosen: a
 * portal renders to document.body, so nothing in here is inside the form
 * element. `new FormData(form)` cannot see these fields and `required` cannot
 * fire on them. It is the same reason VehicleConfigurator sits outside the form
 * and reports upward through props.
 */
export function BuildBriefDialog({
  projectId,
  value,
  onChange,
  onDone,
}: {
  projectId: string;
  value: FreeFallAnswers;
  onChange: (next: FreeFallAnswers) => void;
  onDone: () => void;
}) {
  const brief = BUILD_BRIEFS[projectId] ?? { environment: false, jets: false };
  const project = projects.find((p) => p.id === projectId);
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

      {/* The dialog is the content, not a panel holding it. Nothing is drawn
          around it — the scrim is the separation, exactly as in the colour
          picker. The lift is that picker's too: same curve and duration, a
          shorter exit that travels less, and under reduced motion a fade that
          does not travel, since travel is what the setting asks not to see. */}
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
        className="relative z-10 my-auto flex max-h-[calc(100dvh-2.5rem)] w-full max-w-[min(92vw,430px)] flex-col focus:outline-none md:max-w-[min(94vw,940px)]"
      >
        <p id={titleId} className="sr-only">
          {project?.title ?? "Your build"} — a few things about it
        </p>

        <div className="flex justify-end pb-3">
          <button
            type="button"
            onClick={handleDone}
            aria-label="Close"
            className="rounded-full p-2 text-[#B8C4D6] transition-colors duration-200 hover:text-[#F5F7FA] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-col gap-6 md:flex-row md:items-start md:gap-8">
          {/* The build, at the size the machine gets in the colour picker.
              Inert — `onSelect` is a no-op — because this is a picture of what
              was chosen and not a second place to choose it. */}
          {project && (
            <div className="shrink-0 md:w-[400px]">
              <ProjectOptionCard
                project={project}
                selected
                onSelect={() => {}}
              />
            </div>
          )}

          {/* min-h-0 so the brief can shrink and scroll rather than pushing the
              dialog past the viewport; min-w-0 because a flex item's default
              minimum is its content width, and a card grid has a wide one. */}
          <motion.div
            className="flex min-h-0 min-w-0 flex-1 flex-col"
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
              className={`mb-3 ${eyebrowClass}`}
            >
              Build — {project?.title ?? ""}
            </motion.p>

            {/* Block flow with vertical spacing, never a flex column: a flex
                item defaults to `flex-shrink: 1`, so in a column with a height
                cap the sections are compressed below their own content and
                spill over the heading of the next one instead of the container
                scrolling. That shipped once and looked like overlapping text.

                data-lenis-prevent because smooth scrolling captures the wheel
                globally and a nested scroller never sees a native scroll
                otherwise. The padding is the selected ring's overhang, which
                the overflow would otherwise clip off the top row of cards. */}
            <div
              data-lenis-prevent
              className="max-h-[46dvh] space-y-6 overflow-y-auto overscroll-contain p-1 md:max-h-[64dvh]"
            >
              <motion.label
                variants={SECTION}
                className={`flex flex-col gap-2 ${eyebrowClass}`}
              >
                What should the plate read?
                <input
                  type="text"
                  value={value.plate}
                  onChange={(e) => set("plate", e.target.value)}
                  maxLength={40}
                  placeholder="A name, a number, anything"
                  className={`${fieldClass} placeholder:text-[#B8C4D6]/40`}
                />
              </motion.label>

              <motion.div variants={SECTION} className="flex flex-col gap-3">
                <p className={eyebrowClass}>Stickers on the machine</p>
                <MarqueChips
                  name="free-fall-stickers"
                  label="Stickers on the machine"
                  value={value.stickers}
                  onChange={(id) => set("stickers", id)}
                  options={STICKER_OPTIONS}
                />
              </motion.div>

              {brief.environment && (
              <motion.div variants={SECTION} className="flex flex-col gap-3">
                <p className={eyebrowClass}>The light it is set in</p>
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
                      swatch={environment.swatch}
                      selected={value.environment === environment.id}
                      onSelect={() => set("environment", environment.id)}
                    />
                  ))}
                </div>
              </motion.div>
              )}

              <motion.div variants={SECTION} className="flex flex-col gap-3">
                <p className={eyebrowClass}>OEM parts or accessories fitted</p>
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
                  <label className={`mt-1 flex flex-col gap-2 ${eyebrowClass}`}>
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
              </motion.div>

              {brief.jets ? (
              <motion.div variants={SECTION} className="flex flex-col gap-3">
                <p className={eyebrowClass}>The jets around it</p>
                <div
                  role="radiogroup"
                  aria-label="The jets around it"
                  className="grid grid-cols-2 gap-3"
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
                <p className="text-[11px] normal-case leading-relaxed tracking-normal text-[#B8C4D6]/70">
                  Extra charges apply per sticker, for OEM parts, and for any
                  jet other than the studio default. Nothing is charged here —
                  we will quote it when we talk the build through.
                </p>
              </motion.div>
              ) : (
                /* Same statement minus the jet, for a build that does not have
                   one. Dropping the line entirely on those builds would leave
                   stickers and OEM parts looking free. */
                <motion.p
                  variants={SECTION}
                  className="text-[11px] normal-case leading-relaxed tracking-normal text-[#B8C4D6]/70"
                >
                  Extra charges apply per sticker and for OEM parts. Nothing is
                  charged here — we will quote it when we talk the build
                  through.
                </motion.p>
              )}
            </div>

            {/* Outside the scroller. The colour picker closes on a choice and
                this one cannot: there are five answers and one of them can be
                wrong, so there has to be a moment where the client says they
                are finished. It stays in sight rather than at the end of a
                list that scrolls. */}
            <motion.button
              variants={SECTION}
              type="button"
              onClick={handleDone}
              className="mt-5 w-full rounded-sm border border-white/[0.14] bg-white/[0.03] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-[#F5F7FA] transition-colors duration-300 hover:border-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9F6EF2]"
            >
              Done
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
