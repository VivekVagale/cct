import { useLayoutEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import Cubes from "@/components/ui/Cubes";
import { Magnet } from "@/components/Magnet";
import { VehicleConfigurator } from "@/components/VehicleConfigurator";
import { SparkleButton } from "@/components/SparkleButton";
import { ThankYouCard } from "@/components/ThankYouCard";
import { BuildBriefDialog } from "@/components/BuildBriefDialog";
import { BOOKING_STEPS } from "@/data/bookingSteps";
import { Step } from "@/components/booking/Step";
import { ChosenMachine } from "@/components/booking/ChosenMachine";
import { BuildGrid } from "@/components/booking/BuildGrid";
import { PriceBlock } from "@/components/booking/PriceBlock";
import { MachineNotes, machineNotesHint } from "@/components/booking/MachineNotes";
import { UsageChips } from "@/components/booking/UsageChips";
import { ContactFields } from "@/components/booking/ContactFields";
import { useBookingForm } from "@/components/booking/useBookingForm";
import DepthText from "@/components/DepthText";
import { useIsPhone } from "@/hooks/useIsPhone";

const [MACHINE, BUILD, PRICE, NOTES, USAGE, CONTACT] = BOOKING_STEPS;

/**
 * The booking form, stacked.
 *
 * Six steps down a page, because a desktop has the room for all of them at once
 * and a visitor scanning them can see how much there is before starting. The
 * phone runs the same six one at a time — see BookingWizard — and everything
 * inside a step is the same component in both places. What is local to this file
 * is the arrangement: which steps get a figure beside them, which centre on the
 * page, and where the grid breaks.
 *
 * The order changed when the wizard was built, and it changed here too. Step
 * numbers are printed, so an order that differs between the two layouts makes
 * "Step 02" mean two things on one site. The reasoning for the order itself is
 * in data/bookingSteps.ts, where both layouts read it from.
 */
export function Booking() {
  const isPhone = useIsPhone();
  const form = useBookingForm();
  /** The section the thank-you card lands in. See the layout effect below. */
  const thanksRef = useRef<HTMLElement>(null);

  /*
   * Take the reader to the answer, because the page has just moved out from
   * under them.
   *
   * A successful submission replaces the entire form — six steps, a vehicle grid
   * and a configurator, several thousand pixels of it — with one small card. The
   * document shortens by that much in a single commit while the scroll position
   * stays the number it was, so the reader is left staring at whatever has slid
   * up into that place: the FAQ. They submitted a booking and the site appeared
   * to change the subject.
   *
   * In a layout effect, so it lands before the browser paints: the card is the
   * first thing seen rather than something that arrives after a jump. The
   * section's own scroll-margin keeps it clear of the fixed bar.
   */
  useLayoutEffect(() => {
    if (form.status !== "success") return;
    thanksRef.current?.scrollIntoView({ block: "start" });
  }, [form.status]);

  if (form.status === "success") {
    return (
      /* Full bleed, and no vertical padding.

         The confirmation is a lanyard now: the band hangs from the top of the
         screen and the card drops into the middle of it. A centred column with
         40 units of padding above it would have started the rope a third of the
         way down the section and hung it in a 672px box, which is neither the
         top of the screen nor the middle of it. */
      <section
        id="booking"
        ref={thanksRef}
        className="relative pointer-events-auto scroll-mt-16 sm:scroll-mt-20"
      >
        <ThankYouCard />
      </section>
    );
  }

  return (
    /*
     * overflow-x-clip contains the sparkle button's particle pen.
     *
     * The pen is a decorative square around the submit button at width:200% with
     * aspect-ratio:1 — about 391px across, centred on the button, so it reaches
     * ~98px past each side. It is unshrinkable, and on a narrow phone Chromium
     * grows the layout viewport to fit content it cannot shrink: the whole page
     * rendered at a 383px viewport on a 320px and a 375px screen, every section
     * scaled to a width the device does not have.
     *
     * clip, not hidden. `hidden` would make this section a scroll container, and
     * the pinned sections rely on position:sticky, which does not survive one.
     * `clip` does no such thing — and it only bites at the section's own edges,
     * which are the viewport's, so it takes nothing off the effect that was not
     * already off-screen.
     */
    <section
      id="booking"
      className="relative pointer-events-auto py-20 sm:py-40 scroll-mt-16 sm:scroll-mt-20 overflow-x-clip"
    >
      {/* The configurator is the section's opening act rather than the form's
          first field. It reads at the same width as What We Build, on the same
          gutter as every other band here, so the left edge line runs unbroken
          down the section even though the layout underneath it changes. */}
      {/* items-start, not items-end. Bottom-aligned, the mascot's own height
          carried it up past the heading and out of the band it belongs to — it
          read as floating above the section rather than standing beside the
          step. Aligned at the top it starts level with the Step 01 line and
          hangs down the side of the copy instead. */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 mb-10 sm:mb-16 flex items-start justify-between gap-8">
        <div className="scene-heading">
          <p className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-4 sm:mb-5">
            Step {MACHINE.number} — Configure
          </p>
          {/* Extruded, like the five process titles. Same treatment for the same
              reason: this heading opens a section with the whole band to itself,
              so the depth has room to read.

              A step larger than the process titles, which share their screen
              with a stage heading and a 13rem step number. The size lives here
              rather than in a type class because the component lays its layers
              out against a font size it has to be told. */}
          <h2 className="font-display text-[#F5F7FA] max-w-4xl leading-[0.98]">
            <DepthText
              text={MACHINE.title}
              /* 2rem at the floor, not 2.5. The extrusion is drawn to the right
                 of the type, so the box is always wider than the words —
                 measured at 393px against a 375px viewport, which the document's
                 horizontal clip was hiding by cutting the last letter's depth
                 off. */
              fontSize="clamp(2rem, 8vw, 8rem)"
              fontWeight={400}
              faceColor="#F5F7FA"
              depthColor="#9F6EF2"
              /* Half the layers and no pointer tracking on a phone: each layer
                 is another draw of the same word, and there is no cursor on a
                 touch screen for the tracking to follow. */
              layers={isPhone ? 7 : 14}
              depth={5}
              tilt={9}
              pointerTracking={!isPhone}
              shadow
            />
          </h2>
          <p className="text-sm sm:text-base text-[#B8C4D6] mt-4 sm:mt-5 max-w-md">
            {MACHINE.hint}
          </p>
        </div>
        {/* Bigger than the two beside the form. This one stands next to the
            section's own heading with the full width of the band to itself,
            where the other two share a column with the fields. */}
        <Mascot pose="projectReady" size="xl" className="hidden lg:block shrink-0" />
      </div>

      <VehicleConfigurator
        selectedVehicleId={form.vehicleId}
        selectedColorId={form.colorId}
        onSelectVehicle={form.handleSelectVehicle}
        onSelectColor={form.setColorId}
      />

      {/* The form is the whole band, not the right-hand column of it. The last
          step has to centre on the page; as a child of the eight-column half it
          could only ever centre on that half, which put it a sixth of the page
          right of where it looked like it should be. The two-column split lives
          inside the form and stops above the button. */}
      <form
        onSubmit={form.handleSubmit}
        className="max-w-[1600px] mx-auto px-6 sm:px-10 mt-20 sm:mt-32 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12"
      >
        {/* ── 02 · Build ──────────────────────────────────────────────────
            A figure beside a grid of builds. Sticky, so the pose stays level
            with the grid rather than scrolling off at the first row of cards.
            Desktop only: stacked on a phone this is a screen of mascot between
            the visitor and the thing they came to choose. */}
        <div className="hidden lg:flex lg:col-span-4 justify-center items-start">
          <div className="sticky top-28">
            <Mascot pose="fistPump" size="lg" parallax />
          </div>
        </div>

        <div className="lg:col-span-8">
          {/* A fieldset rather than a label: a label may caption one control,
              and this is a group of them. The legend carries the step for a
              screen reader — the numbering is visual, the grouping is
              structural. */}
          <fieldset className="flex flex-col gap-3 border-0 p-0 m-0">
            <legend className="mb-3">
              <Step step={BUILD} />
            </legend>
            {/* Before the grid rather than after it: it is the answer to "am I
                choosing a build for the right bike", and that question is asked
                on the way in, not on the way out. */}
            <div className="mb-6 max-w-xl">
              <ChosenMachine
                vehicle={form.chosenVehicle}
                color={form.chosenColor}
                other={form.isOther}
              />
            </div>
            <BuildGrid
              selectedId={form.selectedProjectId}
              onSelect={form.handleSelectProject}
              briefed={form.briefed}
              summary={form.freeFallSummary}
              onEditBrief={() => form.setFreeFallOpen(true)}
            />
          </fieldset>
        </div>

        {/* ── 03 · Price ──────────────────────────────────────────────────
            Its own row, centred on the page. The figure is the section's one
            piece of display type below the heading and it cannot sit flush left
            in an eight-column half — it reads as a caption on the column rather
            than as the answer to the step above it. */}
        <div className="lg:col-span-12 mt-4 sm:mt-8 flex flex-col items-center gap-6 text-center">
          <Step step={PRICE} />
          <PriceBlock price={form.selectedPrice} />
        </div>

        {/* ── 04 · Your machine ───────────────────────────────────────────
            The cubes. Step 04 keeps them on their own; the column is the tallest
            in the form and would read as empty without something in it.

            The pointer reaches the cubes: the grid tilts toward the cursor and
            that is all it does. The click ripple stays off, because a click
            there leads nowhere. */}
        <div className="hidden lg:flex lg:col-span-4 flex-col items-center gap-10">
          <div className="sticky top-28 flex flex-col items-center gap-10">
            {/* An explicit square, because the grid has no intrinsic size. It
                used to inherit one from the column, which the mascot above it
                was holding open — take the mascot away and the flex column
                collapses to nothing and the cubes render into a zero-height box.
                Nothing was removed; there was simply no longer anywhere for them
                to be. */}
            <div aria-hidden className="w-full aspect-square cubes-fill">
              <Cubes
                gridSize={6}
                maxAngle={45}
                radius={3}
                borderStyle="2px dashed #B497CF"
                faceColor="#1a1a2e"
                rippleColor="#ff6b6b"
                rippleSpeed={1.5}
                autoAnimate
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <Step step={NOTES} hint={machineNotesHint(form.isOther)} />
          <MachineNotes isOther={form.isOther} />
        </div>

        {/* ── 05 · Who's it for ───────────────────────────────────────────
            Not a detail of the brief, so not in the column with the fields: this
            is the question that decides what the work is for, and it is worth
            nothing buried where someone has already scrolled past. Centred on
            the same axis as the button below it. */}
        <div className="lg:col-span-12 mt-4 sm:mt-8 flex flex-col items-center gap-6 text-center">
          <Step step={USAGE} />
          <UsageChips value={form.usage} onChange={form.setUsage} />
        </div>

        {/* ── 06 · How we reach you ───────────────────────────────────────
            A pose beside the fields, where a column of studio copy used to be.
            That copy said the section's heading again in a longer form and then
            asked for the story — which is what the description field already
            asks for. */}
        <div className="hidden lg:flex lg:col-span-4 justify-center items-start">
          <div className="sticky top-28">
            <Mascot pose="neutral" size="lg" parallax />
          </div>
        </div>

        <div className="lg:col-span-8">
          <Step step={CONTACT} />
          <ContactFields />
        </div>

        {/* text-center as well as items-center: items-center centres the block,
            and the block is only as wide as its widest line, so a heading was
            still setting flush to the left edge above a button that was centred
            on something else again. */}
        <div className="lg:col-span-12 mt-4 sm:mt-8 flex flex-col items-center gap-4 text-center">
          <Magnet padding={40} strength={5}>
            <SparkleButton
              type="submit"
              disabled={form.status === "submitting" || !form.vehicleId}
            >
              {form.status === "submitting" ? "Sending..." : "Submit Request"}
            </SparkleButton>
          </Magnet>
          {/* Says why the button is dead, and takes them to the fix.

              A disabled control with no explanation is a dead end — the reader
              can see they cannot send and not what to do about it, and step 01
              is several screens up by the time anyone reaches this button. The
              request is a quote for a specific machine; without one there is
              nothing to quote. */}
          {!form.vehicleId && (
            <p className="max-w-md text-sm text-[#B8C4D6] normal-case tracking-normal leading-relaxed">
              Pick a machine before you send this —{" "}
              <a
                href="#booking"
                className="inline-block py-1.5 -my-1.5 text-[#F5F7FA] border-b border-white/30 transition-colors duration-300 hover:border-white"
              >
                step {MACHINE.number} is at the top of this section.
              </a>
            </p>
          )}
          {form.status === "error" && (
            <span className="text-xs text-[#FF4444]">
              Something went wrong — please email us directly.
            </span>
          )}
        </div>
      </form>

      {/* Outside the form on purpose, and unavoidably: it portals to the body,
          so it is not inside this element in the DOM either way. That is what
          makes every control in it controlled state rather than something
          FormData could collect -- see the note in BuildBriefDialog.

          AnimatePresence so the scrim's exit runs; without it the overlay is
          removed on the same frame the state flips and the blur snaps off. */}
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
    </section>
  );
}
