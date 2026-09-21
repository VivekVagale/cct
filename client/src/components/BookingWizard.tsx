import {
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type TouchEvent,
} from "react";
import { AnimatePresence } from "framer-motion";
import { VehicleConfigurator } from "@/components/VehicleConfigurator";
import { BuildBriefDialog } from "@/components/BuildBriefDialog";
import { SparkleButton } from "@/components/SparkleButton";
import { ThankYouCard } from "@/components/ThankYouCard";
import { BOOKING_STEPS } from "@/data/bookingSteps";
import { headline, reachWindow } from "@/data/reach";
import { vehicles } from "@/data/vehicles";
import { Step } from "@/components/booking/Step";
import { ChosenMachine } from "@/components/booking/ChosenMachine";
import { BuildGrid } from "@/components/booking/BuildGrid";
import { PriceBlock } from "@/components/booking/PriceBlock";
import {
  MachineNotes,
  machineNotesHint,
} from "@/components/booking/MachineNotes";
import { UsageChips } from "@/components/booking/UsageChips";
import { ContactFields } from "@/components/booking/ContactFields";
import { DesktopNudgeBar } from "@/components/booking/DesktopNudge";
import { useBookingForm } from "@/components/booking/useBookingForm";

const TOTAL = BOOKING_STEPS.length;

/**
 * The booking, one decision per screen.
 *
 * The desktop stacks all six steps down a page because it has the room. A phone
 * does not: the same form there is a four-thousand-pixel scroll through a
 * vehicle grid, a card grid, five headings and seven fields, with the submit
 * button somewhere past the end of it. Giving each step the screen turns that
 * into six short decisions with a visible end.
 *
 * Everything inside the steps is the component the desktop uses. What is local
 * to this file is the shell: which step is showing, how you get to the next one,
 * and what stops you.
 *
 * ── The one mechanical thing worth knowing ───────────────────────────────────
 *
 * All six steps stay mounted. They are hidden with the `hidden` attribute rather
 * than being conditionally rendered, for two reasons that are really the same
 * reason:
 *
 * 1. `FormData` collects the whole form on submit. Unmount step 04 and the
 *    description is simply not in the row — silently, with no error anywhere.
 * 2. The fields are uncontrolled. Unmounting throws away what was typed, so
 *    going Back and forward again would clear the form a step at a time.
 *
 * The cost of that is the reason for `stepValid` below: `required` on a field
 * inside a hidden step still blocks submit, and the browser cannot focus it to
 * say why — Chrome logs "An invalid form control is not focusable" and nothing
 * happens. So the native validation is run per step, against the visible step
 * only, and the form's own submit is reached with every step already past it.
 */
export function BookingWizard({ onSeeTheWork }: { onSeeTheWork: () => void }) {
  const form = useBookingForm();
  const [index, setIndex] = useState(0);
  /* The message under the footer, when Next will not go. Cleared on any change
     of step so it cannot outlive the thing it was describing. */
  const [gate, setGate] = useState<string | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);

  /*
   * A drag on the footer scrolls the step behind it.
   *
   * The document is fixed — see useAppShellViewport — so nothing scrolls except
   * the step's own box, and that box stops above the footer. The bottom strip of
   * the screen is where a thumb naturally rests, so a swipe starting there moved
   * nothing and the whole wizard read as scrolling only sometimes.
   *
   * Forwarded rather than restyled: the footer is pinned on purpose, and the
   * button inside it has to keep working.
   *
   * `dragging` is what protects the tap. It only arms past a few pixels of
   * vertical travel, so a press that stays put is still a press and the button
   * fires normally — and once it is armed the move is consumed, so a drag that
   * happens to start on the button scrolls instead of pressing it.
   */
  const dragFrom = useRef<number | null>(null);
  const dragging = useRef(false);

  function onFooterTouchStart(e: TouchEvent<HTMLDivElement>) {
    dragFrom.current = e.touches[0].clientY;
    dragging.current = false;
  }

  function onFooterTouchMove(e: TouchEvent<HTMLDivElement>) {
    const start = dragFrom.current;
    const scroller = scrollerRef.current;
    if (start === null || !scroller) return;
    const y = e.touches[0].clientY;
    const travelled = start - y;
    if (!dragging.current && Math.abs(travelled) < 6) return;
    dragging.current = true;
    /* One to one with the finger, and no momentum. A flick would have to be
       simulated, and a scroll that keeps moving after the thumb has left the
       glass is worse than one that stops where it was put. */
    scroller.scrollTop += travelled;
    dragFrom.current = y;
  }

  function onFooterTouchEnd() {
    dragFrom.current = null;
  }

  function onFooterClickCapture(e: MouseEvent<HTMLDivElement>) {
    /* The tail of a drag is not a tap. Without this the finger lifting after a
       scroll lands as a click on whatever is underneath, which here is Next. */
    if (dragging.current) {
      e.preventDefault();
      e.stopPropagation();
      dragging.current = false;
    }
  }
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  const step = BOOKING_STEPS[index];
  const isLast = index === TOTAL - 1;

  /* Back to the top of the new step, before the browser paints it. The scroller
     keeps its offset across a step change otherwise, so a visitor who scrolled
     to the bottom of the machine grid lands halfway down the build grid. */
  useLayoutEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [index]);

  /**
   * Whether the visible step may be left.
   *
   * Two gates, and they are different in kind. The first is ours: a request
   * naming no machine is not a request, and a selected card is not something a
   * native constraint can express. The second is the browser's — it owns
   * `required` on the description under Other and on name and email — and it is
   * asked here, for this step only, so that it can actually show its message.
   */
  function stepValid() {
    if (step.id === "machine" && !form.vehicleId) {
      setGate(
        "Pick a machine before you carry on — the studio quotes for one."
      );
      return false;
    }

    const el = stepRefs.current[index];
    if (el) {
      const controls = el.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("input, textarea, select");
      for (const control of controls) {
        if (!control.checkValidity()) {
          control.reportValidity();
          return false;
        }
      }
    }

    setGate(null);
    return true;
  }

  function next() {
    if (!stepValid()) return;
    setGate(null);
    form.clearError();
    setIndex(i => Math.min(i + 1, TOTAL - 1));
  }

  function back() {
    setGate(null);
    form.clearError();
    setIndex(i => Math.max(i - 1, 0));
  }

  /**
   * The form may only be sent from the last step.
   *
   * The keys on the two buttons stop the specific way this went wrong, and this
   * stops the rest of them. A form submits for reasons that have nothing to do
   * with its buttons — Enter in a single-line field is the common one — and
   * every step of this wizard lives inside one form element, so any of them
   * could reach a submit handler that assumes six steps of answers behind it.
   *
   * Nothing is reported when it fires. A submission the visitor did not ask for
   * should not produce an error they have to read; it should simply not happen.
   */
  function submitIfLast(e: FormEvent<HTMLFormElement>) {
    if (!isLast) {
      e.preventDefault();
      return;
    }
    /* Step 06 is the one step `next` never checks, because there is no Next to
       press on it — and the form carries `noValidate`, so nothing else does
       either. Without this line every `required` on the contact step is inert
       on the phone: name, email and handle could all be empty and the row went
       in anyway. Same call the other five steps get, so the browser reports the
       first empty field on the step the reader is already looking at. */
    if (!stepValid()) {
      e.preventDefault();
      return;
    }
    void form.handleSubmit(e);
  }

  /* The confirmation replaces the wizard entirely, the way it replaces the
     desktop form. No scroll correction needed here — the shell is one screen
     tall and does not shorten under the reader. */
  if (form.status === "success") {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ThankYouCard />
      </div>
    );
  }

  return (
    /* overflow-x-clip contains the sparkle button's particle pen, which is a
       decorative square at width:200% centred on the button — about 390px
       across. It is unshrinkable, and Chromium grows the layout viewport to fit
       content it cannot shrink, so without this the whole wizard renders at a
       width the phone does not have. Same reason the desktop section carries it.

       clip rather than hidden: hidden would make this a scroll container, and
       the footer is positioned against this box. */
    <div className="flex min-h-0 flex-1 flex-col overflow-x-clip">
      {/* Only on the first screen. It is a recommendation to act on before
          starting, and carrying it through five more steps would be nagging. */}
      {index === 0 && <DesktopNudgeBar onSeeTheWork={onSeeTheWork} />}

      {/* Back and the count live up here now.

          They were in the footer beside the button, which is what made that
          footer a bar: three things in a row need a plate behind them to read as
          a group, and a plate across the bottom of a phone is a dock. Moved to
          the top they sit with the progress they describe, and the bottom is
          left holding one control. */}
      <div className="flex shrink-0 items-center justify-between px-4 pt-3">
        <button
          type="button"
          onClick={back}
          disabled={index === 0}
          /* `py-2 -my-2` is hit area rather than layout — 11px type on one line
             is a 15px target otherwise. */
          className="-my-2 py-2 pr-3 text-[11px] tracking-[0.14em] uppercase text-[#B8C4D6] transition-opacity disabled:opacity-30"
        >
          &larr; Back
        </button>
        <span className="text-[11px] tabular-nums text-[#B8C4D6]">
          {step.number} / {String(TOTAL).padStart(2, "0")}
        </span>
      </div>

      {/* Six segments, one per step. A bar that fills continuously would say
          "68% done", which is a claim about effort this form cannot make — the
          steps are not the same size. Segments say which of six, which is true. */}
      <div className="flex shrink-0 gap-1 px-4 pt-2.5" aria-hidden>
        {BOOKING_STEPS.map((s, i) => (
          <span
            key={s.id}
            className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
              i < index
                ? "bg-[#7A44E0]"
                : i === index
                  ? "bg-[#9F6EF2]"
                  : "bg-white/[0.12]"
            }`}
          />
        ))}
      </div>

      <form
        onSubmit={submitIfLast}
        /* One listener for the whole form rather than one per field: change
           events bubble, and every control here is a descendant. */
        onChange={form.clearError}
        onInput={form.clearError}
        className="flex min-h-0 flex-1 flex-col"
        /* The browser's own validation bubbles are asked for explicitly, per
           step, in stepValid. Left on, submit would also try to report a field
           inside a hidden step and fail silently. */
        noValidate
      >
        {/* overscroll-contain stops the gesture chaining.

            Without it, a drag that reaches the end of a step carries on into the
            document, which has nowhere to go and rubber-bands instead — the page
            bounces while the content under the thumb sits still. `contain` ends
            the gesture at this box, which is the only thing on the phone route
            that is supposed to move. */}
        <div
          ref={scrollerRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          {/* 16px, not 20. The gutter is the only thing between a card and the
              edge of the screen, and every pixel of it comes out of the cards —
              at 44px a side (this plus the configurator's own, before that one
              was dropped) a machine card was 89px wide where there was room for
              107.

              Centred in the leftover height, which is what the price, the
              description and the usage chips needed. Those three are short — a
              figure, one field, four chips — and against a footer pinned to the
              bottom of the screen they sat at the top with a third of the
              viewport empty underneath, which reads as a step that failed to
              load rather than a step that is simply brief.

              `min-h-full` with `justify-center` is the safe half of that
              pattern: the box grows past the viewport when the step is taller
              than it, so free space is never negative and nothing is ever
              centred off the top edge where a scroller cannot reach it. The two
              grid steps have no free space to distribute and are unaffected. */}
          <div className="flex min-h-full flex-col justify-center px-4 pb-8 pt-4">
            {/* ── 01 · Machine ──────────────────────────────────────────── */}
            <section
              ref={el => {
                stepRefs.current[0] = el;
              }}
              hidden={index !== 0}
            >
              <Step step={BOOKING_STEPS[0]} of={TOTAL} />
              {/* Three across and smaller, because this step owns the screen —
                  see the compact note in VehicleConfigurator. The search and the
                  marque chips inside it are what keep 64 machines short. */}
              <VehicleConfigurator
                compact
                selectedVehicleId={form.vehicleId}
                selectedColorId={form.colorId}
                onSelectVehicle={form.handleSelectVehicle}
                onSelectColor={form.setColorId}
              />
            </section>

            {/* ── 02 · Build ────────────────────────────────────────────── */}
            <section
              ref={el => {
                stepRefs.current[1] = el;
              }}
              hidden={index !== 1}
            >
              <Step step={BOOKING_STEPS[1]} of={TOTAL} />
              {/* The machine, repeated. The step that named it is a screen back
                  by now, and picking a build for the wrong bike is the mistake
                  this costs nothing to prevent. */}
              <div className="mb-5">
                <ChosenMachine
                  vehicle={form.chosenVehicle}
                  color={form.chosenColor}
                  other={form.isOther}
                  onGoToMachines={() => setIndex(0)}
                />
              </div>
              <BuildGrid
                /* The four loops are not rendered — and so not downloaded —
                   until this is the step on screen. See ProjectOptionCard. */
                live={index === 1}
                selectedId={form.selectedProjectId}
                onSelect={form.handleSelectProject}
                briefed={form.briefed}
                summary={form.freeFallSummary}
                onEditBrief={() => form.setFreeFallOpen(true)}
              />
            </section>

            {/* ── 03 · Price ────────────────────────────────────────────── */}
            <section
              ref={el => {
                stepRefs.current[2] = el;
              }}
              hidden={index !== 2}
              className="flex flex-col items-center text-center"
            >
              <Step
                step={BOOKING_STEPS[2]}
                of={TOTAL}
                className="self-start text-left"
              />
              <PriceBlock price={form.selectedPrice} />
            </section>

            {/* ── 04 · Description ──────────────────────────────────────── */}
            <section
              ref={el => {
                stepRefs.current[3] = el;
              }}
              hidden={index !== 3}
            >
              <Step
                step={BOOKING_STEPS[3]}
                of={TOTAL}
                hint={machineNotesHint(form.isOther)}
              />
              <div className="mb-5">
                <ChosenMachine
                  vehicle={form.chosenVehicle}
                  color={form.chosenColor}
                  other={form.isOther}
                  onGoToMachines={() => setIndex(0)}
                />
              </div>
              <MachineNotes isOther={form.isOther} />
            </section>

            {/* ── 05 · Usage ────────────────────────────────────────────── */}
            <section
              ref={el => {
                stepRefs.current[4] = el;
              }}
              hidden={index !== 4}
            >
              <Step step={BOOKING_STEPS[4]} of={TOTAL} />
              <UsageChips value={form.usage} onChange={form.setUsage} />
            </section>

            {/* ── 06 · Contact ──────────────────────────────────────────── */}
            <section
              ref={el => {
                stepRefs.current[5] = el;
              }}
              hidden={index !== 5}
            >
              <Step step={BOOKING_STEPS[5]} of={TOTAL} />
              <ContactFields />

              {/* The receipt. Five screens of decisions are not all visible any
                  more, and the last thing before a submit should be what is
                  about to be sent. */}
              <dl className="mt-6 rounded-sm border border-white/[0.1] bg-white/[0.02] p-4">
                {[
                  [
                    "Machine",
                    form.isOther
                      ? "Other — see description"
                      : form.chosenVehicle
                        ? `${form.chosenVehicle.manufacturer} ${form.chosenVehicle.name}`
                        : "—",
                  ],
                  ["Colour", form.chosenColor?.name ?? "Not chosen"],
                  ["Build", form.selectedProject?.title ?? "—"],
                  ["Estimate", form.selectedPrice ?? "Quoted after we talk"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 border-b border-white/[0.06] py-2 last:border-0"
                  >
                    <dt className="pt-0.5 text-[10px] tracking-[0.12em] uppercase text-[#B8C4D6]">
                      {label}
                    </dt>
                    <dd className="text-right text-[13px] font-semibold text-[#F5F7FA]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Proof, below the form and never above it.
                  Someone arriving cold from a bio link has no reason to trust a
                  form; these are that reason. Placed after the work of filling it
                  in, so the argument never delays the thing being argued for. */}
              <div className="mt-6 border-t border-white/[0.06] pt-5">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#B8C4D6]">
                  Why us — {reachWindow.label}
                </p>
                <div className="mt-3 flex gap-6">
                  {[
                    [headline.views, "views"],
                    [headline.followers, "followers"],
                    [String(vehicles.length), "machines"],
                  ].map(([figure, label]) => (
                    <div key={label}>
                      <div className="font-display text-2xl tabular-nums text-[#F5F7FA]">
                        {figure}
                      </div>
                      <div className="mt-0.5 text-[10.5px] text-[#B8C4D6]">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
                {/* The same caveat reach.ts carries. The figures are a sum of an
                    account export and six individually transcribed reels, so
                    anything posted between those periods is uncounted. */}
                <p className="mt-3 text-[11px] leading-relaxed text-[#B8C4D6]">
                  Floors, not totals — an account export plus reels transcribed
                  one by one. Anything between those is uncounted.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* ── One control, centred, on nothing ───────────────────────────
            No plate, no hairline, no blur. It had all three because it was a bar
            carrying three things; carrying one, it does not need to be a bar at
            all — and the dark strip across the bottom of the screen was reading
            as browser furniture rather than as part of the page.

            Nothing is needed behind it either. This row is `shrink-0` in a flex
            column, so the scroller's box ends exactly where this begins and the
            step can never scroll underneath it. The usual gradient scrim would
            be solving a problem the layout already prevents.

            The safe-area inset stays: without it the button sits under the home
            gesture strip on a notched phone, and the tap opens the app switcher
            instead. */}
        {gate && (
          <p className="shrink-0 px-4 pb-2 text-center text-[11.5px] leading-snug text-[#B8C4D6]">
            {gate}
          </p>
        )}
        <div
          className="flex shrink-0 justify-center px-4 pt-1"
          onTouchStart={onFooterTouchStart}
          onTouchMove={onFooterTouchMove}
          onTouchEnd={onFooterTouchEnd}
          onTouchCancel={onFooterTouchEnd}
          onClickCapture={onFooterClickCapture}
          style={{
            paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {/* Two buttons, and the keys are what make them two.

              Without them React sees the same component in the same slot and
              keeps the DOM node, changing only its attributes — so the tap that
              moves from step 05 to 06 runs `next`, re-renders synchronously, and
              the browser then performs that same click's default action on an
              element which is, by the time it gets there, `type="submit"`.
              Arriving at the last step sent the form. With no name and no email
              in it, which is why it came back as "something went wrong" the
              instant the step appeared.

              A key forces a fresh element, so the node that was clicked is gone
              before there is a default action to perform on it. */}
          {isLast ? (
            <SparkleButton
              key="submit"
              type="submit"
              disabled={form.status === "submitting" || !form.vehicleId}
            >
              {form.status === "submitting" ? "Sending..." : "Submit Request"}
            </SparkleButton>
          ) : (
            <SparkleButton key="next" type="button" onClick={next}>
              Next
            </SparkleButton>
          )}
        </div>

        {form.status === "error" && (
          <p className="shrink-0 px-4 pb-3 text-center text-xs text-[#FF4444]">
            Something went wrong — please email us directly.
          </p>
        )}
      </form>

      {/* Outside the form in the DOM either way — it portals to the body. That
          is what makes every control in it controlled state rather than
          something FormData could collect. */}
      <AnimatePresence>
        {form.freeFallOpen && (
          <BuildBriefDialog
            projectId={form.selectedProjectId}
            value={form.freeFall}
            onChange={form.setFreeFall}
            onDone={() => form.setFreeFallOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
