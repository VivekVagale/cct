import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { Mascot } from "@/components/Mascot";
import Cubes from "@/components/ui/Cubes";
import { Magnet } from "@/components/Magnet";
import { VehicleConfigurator } from "@/components/VehicleConfigurator";
import { ProjectOptionCard } from "@/components/ProjectOptionCard";
import { SparkleButton } from "@/components/SparkleButton";
import { MarqueChips, type MarqueChip } from "@/components/MarqueChips";
import { ThankYouCard } from "@/components/ThankYouCard";
import { vehicles, type Vehicle, type VehicleColor } from "@/data/vehicles";
import { projects } from "@/data/content";
import { submitBookingForm } from "@/lib/formHandler";
import DepthText from "@/components/DepthText";
import { useIsPhone } from "@/hooks/useIsPhone";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Who the work is for.
 *
 * Four rather than two, because "personal or company" collapses the cases that
 * behave least alike: a business shooting its own product, a dealership
 * shooting stock it is selling, and an agency shooting for someone else all
 * have different approvals, deadlines and definitions of finished.
 *
 * `commercial` rather than `brand`, which read as a question about whether the
 * client considers themselves a brand — a judgement rather than a fact.
 * Commercial asks the thing that actually changes the job: whether the work is
 * being sold behind.
 */
const USAGE_OPTIONS: MarqueChip[] = [
  { id: "personal", label: "Personal", hint: "My own machine" },
  { id: "commercial", label: "Commercial", hint: "For a business" },
  { id: "dealership", label: "Dealership", hint: "Stock we sell" },
  { id: "agency", label: "Agency", hint: "For a client" },
];

const fieldClass =
  "bg-transparent border-b border-white/20 focus:border-white/60 outline-none py-3 text-[#F5F7FA] text-base normal-case tracking-normal transition-colors";

/**
 * The numbered heading above each part of the request.
 *
 * The section asks for four separate things across two layouts — a vehicle
 * grid, a column of fields, a card grid, a button — and without a running
 * count there is nothing telling a visitor how much is left, or that the
 * machine they picked at the top belongs to the form at the bottom at all.
 */
function Step({
  number,
  title,
  hint,
}: {
  number: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-5 sm:mb-6">
      <p className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-2">
        Step {number}
      </p>
      <h3 className="font-display text-xl sm:text-2xl text-[#F5F7FA] leading-tight">
        {title}
      </h3>
      {hint && <p className="text-sm text-[#B8C4D6] mt-2 max-w-md">{hint}</p>}
    </div>
  );
}

/**
 * What the visitor picked in step 01, repeated where they fill the form in.
 *
 * The configurator is a long way up the page by the time anyone reaches Full
 * Name, and its selection is only visible as a glow on a card that has since
 * scrolled off. Without this the form asks for a name, an email and a
 * description of a machine it never names — and a client who picked the wrong
 * colour has no way to find that out before the request is sent.
 *
 * It states what is missing as plainly as what is chosen. A vehicle with no
 * colour yet is a half-made decision, and saying so here is cheaper than a
 * validation error after the submit.
 */
function ChosenMachine({
  vehicle,
  color,
}: {
  vehicle?: Vehicle;
  color?: VehicleColor;
}) {
  if (!vehicle) {
    return (
      <p className="text-sm text-[#B8C4D6] normal-case tracking-normal">
        No machine picked yet.{" "}
        <a
          href="#booking"
          /* Padded to a real target: it is inline in a sentence, so it
             inherited the line's height, and it is the only way back to the
             configurator from down here. */
          className="inline-block py-1.5 -my-1.5 text-[#F5F7FA] border-b border-white/30 transition-colors duration-300 hover:border-white"
        >
          Step 01 is at the top of this section.
        </a>{" "}
        You can send the form without one.
      </p>
    );
  }

  return (
    <div className="selected-glow flex items-center gap-4 rounded-sm border bg-[#7A44E0]/[0.07] p-3 sm:p-4">
      <img
        src={color?.image ?? vehicle.image}
        alt=""
        className="h-14 w-20 shrink-0 rounded-sm object-cover sm:h-16 sm:w-24"
      />
      <div className="min-w-0 normal-case tracking-normal">
        <p className="text-[10px] tracking-[0.18em] uppercase text-[#B8C4D6]">
          {vehicle.manufacturer}
        </p>
        <p className="font-display text-base sm:text-lg text-[#F5F7FA]">
          {vehicle.name}
        </p>
        {color ? (
          <p className="mt-1 flex items-center gap-2 text-xs text-[#B8C4D6]">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/20"
              style={{ backgroundColor: color.swatch }}
            />
            {color.name}
          </p>
        ) : (
          <p className="mt-1 text-xs text-[#B8C4D6]">
            No colour chosen — tap the card above to pick one.
          </p>
        )}
      </div>
    </div>
  );
}

export function Booking() {
  const isPhone = useIsPhone();
  const [status, setStatus] = useState<Status>("idle");
  const [selectedProject, setSelectedProject] = useState(projects[0].title);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [colorId, setColorId] = useState<string | null>(null);
  /*
   * Who the work is for. Drives the brief more than the machine does — the
   * same bike shot for someone's own feed and for a dealership's campaign are
   * two different jobs.
   */
  const [usage, setUsage] = useState("personal");
  /** The section the thank-you card lands in. See the layout effect below. */
  const thanksRef = useRef<HTMLElement>(null);

  // Resolved once here rather than in two places: the summary above the form
  // and the label sent with the request must never name different machines.
  // Priced builds carry their own figure; the rest are quoted in conversation.
  const selectedPrice = projects.find(
    (p) => p.title === selectedProject,
  )?.price;

  const chosenVehicle = vehicles.find((v) => v.id === vehicleId);
  const chosenColor = chosenVehicle?.colors.find((c) => c.id === colorId);

  function handleSelectVehicle(id: string) {
    setVehicleId(id);
    setColorId(null); // changing the vehicle clears the color selection
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const data = new FormData(form);

    const vehicleLabel = chosenVehicle
      ? `${chosenVehicle.manufacturer} ${chosenVehicle.name}${
          chosenColor ? ` — ${chosenColor.name}` : ""
        }`
      : "";

    const ok = await submitBookingForm({
      fullName: String(data.get("fullName") || ""),
      email: String(data.get("email") || ""),
      instagram: String(data.get("instagram") || ""),
      whatsapp: String(data.get("whatsapp") || ""),
      projectType: selectedProject,
      vehicle: vehicleLabel,
      description: String(data.get("description") || ""),
      usage,
    }).catch(() => false);

    setStatus(ok ? "success" : "error");
  }

  /*
   * Take the reader to the answer, because the page has just moved out from
   * under them.
   *
   * A successful submission replaces the entire form — six steps, a vehicle
   * grid and a configurator, several thousand pixels of it — with one small
   * card. The document shortens by that much in a single commit while the
   * scroll position stays the number it was, so the reader is left staring at
   * whatever has slid up into that place: the FAQ. They submitted a booking and
   * the site appeared to change the subject.
   *
   * In a layout effect, so it lands before the browser paints: the card is the
   * first thing seen rather than something that arrives after a jump. The
   * section's own scroll-margin keeps it clear of the fixed bar.
   */
  useLayoutEffect(() => {
    if (status !== "success") return;
    thanksRef.current?.scrollIntoView({ block: "start" });
  }, [status]);

  if (status === "success") {
    return (
      <section
        id="booking"
        ref={thanksRef}
        className="relative pointer-events-auto py-20 sm:py-40 scroll-mt-16 sm:scroll-mt-20"
      >
        <div className="max-w-2xl mx-auto px-6 flex justify-center">
          <ThankYouCard />
        </div>
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
     * clip, not hidden. `hidden` would make this section a scroll container,
     * and the pinned sections rely on position:sticky, which does not survive
     * one. `clip` does no such thing — and it only bites at the section's own
     * edges, which are the viewport's, so it takes nothing off the effect that
     * was not already off-screen.
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
          carried it up past the heading and out of the band it belongs to —
          it read as floating above the section rather than standing beside the
          step. Aligned at the top it starts level with the Step 01 line and
          hangs down the side of the copy instead. */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 mb-10 sm:mb-16 flex items-start justify-between gap-8">
        <div className="scene-heading">
          <p className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-4 sm:mb-5">
            Step 01 — Configure
          </p>
          {/* Extruded, like the five process titles. Same treatment for the
              same reason: this heading opens a section with the whole band to
              itself, so the depth has room to read.

              A step larger than the process titles, which share their screen
              with a stage heading and a 13rem step number. The size lives here
              rather than in a type class because the component lays its layers
              out against a font size it has to be told. */}
          <h2 className="font-display text-[#F5F7FA] max-w-4xl leading-[0.98]">
            <DepthText
              text="Pick your machine."
              /* 2rem at the floor, not 2.5. The extrusion is drawn to the
                 right of the type, so the box is always wider than the words —
                 measured at 393px against a 375px viewport, which the
                 document's horizontal clip was hiding by cutting the last
                 letter's depth off. */
              fontSize="clamp(2rem, 8vw, 8rem)"
              fontWeight={400}
              faceColor="#F5F7FA"
              depthColor="#9F6EF2"
              /* Half the layers and no pointer tracking on a phone: each
                 layer is another draw of the same word, and there is no cursor
                 on a touch screen for the tracking to follow. */
              layers={isPhone ? 7 : 14}
              depth={5}
              tilt={9}
              pointerTracking={!isPhone}
              shadow
            />
          </h2>
          <p className="text-sm sm:text-base text-[#B8C4D6] mt-4 sm:mt-5 max-w-md">
            Choose the vehicle, then its colour. Six steps in all — this is the
            only one that needs a decision from you before the form.
          </p>
        </div>
        {/* Moved up from the copy column below. Two mascots in one section is
            clutter, and this is where the visitor is actually being asked to
            do something. */}
        {/* Bigger than the two beside the form. This one stands next to the
            section's own heading with the full width of the band to itself,
            where the other two share a column with the fields. */}
        <Mascot pose="projectReady" size="xl" className="hidden lg:block shrink-0" />
      </div>

      <VehicleConfigurator
        selectedVehicleId={vehicleId}
        selectedColorId={colorId}
        onSelectVehicle={handleSelectVehicle}
        onSelectColor={setColorId}
      />

      {/* The form is the whole band, not the right-hand column of it.
          Step 04 is the section's last word and has to centre on the page; as
          a child of the eight-column half it could only ever centre on that
          half, which put it a sixth of the page right of where it looked like
          it should be. The two-column split now lives inside the form and
          stops above the button. */}
      <form
        onSubmit={handleSubmit}
        className="max-w-[1600px] mx-auto px-6 sm:px-10 mt-20 sm:mt-32 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12"
      >
        {/* A figure beside the fields, where a column of studio copy used to
            be. That copy said the section's heading again in a longer form and
            then asked for the story — which is what the description field two
            steps down already asks for. Deleting it left the left third of the
            band empty for the height of the form, so each step gets a pose
            instead.

            Sticky, so the pose stays level with whichever part of the step is
            on screen rather than scrolling off at the first field. Desktop
            only: stacked on a phone this is a screen of mascot between the
            visitor and the input they came for. */}
        <div className="hidden lg:flex lg:col-span-4 justify-center items-start">
          <div className="sticky top-28">
            <Mascot pose="neutral" size="lg" parallax />
          </div>
        </div>

        <div className="lg:col-span-8">
          {/* One field per row rather than two across.
              A single column gives every field the same left edge and one
              reading order, which is what makes a form scannable — and the
              pairs it replaces put Email beside Full Name at desktop width
              and stacked them anyway on a phone, so the two-column version
              was only ever the desktop's layout. Capped rather than run to
              the column's full width: an underline five hundred pixels long
              reads as a rule across the page, not as a field. */}
          <div>
            <Step
              number="02"
              title="Tell us who you are."
              hint="Name and email are all we need. The handles below are how we reply."
            />
            <div className="flex flex-col gap-5 sm:gap-6 max-w-xl">
              {/* Before the first field rather than after the last: it is the
                  answer to "am I filling this in for the right bike", and that
                  question is asked on the way in, not on the way out. */}
              <ChosenMachine
                vehicle={chosenVehicle}
                color={chosenColor}
              />

              <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
                Full Name
                <input name="fullName" required className={fieldClass} />
              </label>
              <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
                Email
                <input name="email" type="email" required className={fieldClass} />
              </label>
              <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
                Your Instagram @handle
                <input
                  name="instagram"
                  placeholder="@yourhandle"
                  className={`${fieldClass} placeholder:text-[#B8C4D6]/40`}
                />
              </label>
              <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
                WhatsApp @handle/number (optional)
                <input
                  name="whatsapp"
                  placeholder="+91 98765 43210"
                  className={`${fieldClass} placeholder:text-[#B8C4D6]/40`}
                />
              </label>
            </div>
          </div>
        </div>

        {/* The cubes. The pose that stood here moved down to step 05, where a
            reaction to a question is worth more than a figure standing beside a
            text field. Step 03 keeps the cubes on their own — the column is the
            tallest in the form and would read as empty without something in it.

            The pointer reaches the cubes: the grid tilts toward the cursor and
            that is all it does. The click ripple stays off, because a click
            there leads nowhere. */}
        <div className="hidden lg:flex lg:col-span-4 flex-col items-center gap-10">
          <div className="sticky top-28 flex flex-col items-center gap-10">
            {/* An explicit square, because the grid has no intrinsic size.
                It used to inherit one from the column, which the mascot above
                it was holding open — take the mascot away and the flex column
                collapses to nothing and the cubes render into a zero-height
                box. Nothing was removed; there was simply no longer anywhere
                for them to be. */}
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
          <div>
            <Step
              number="03"
              title="Tell us about your machine."
              hint="The card above says what it is. This is where you say what you have done to it, then pick the closest kind of build."
            />
            {/* The old prompt here described a finished shot — wet streets,
                headlight flare, no rider — and got shot briefs back. The
                render is built from the bike, so what is needed first is the
                bike: the parts on it, the paint, anything that would be wrong
                if we modelled it from the catalogue photo. */}
            <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6] max-w-xl mb-8 sm:mb-10">
              Your Build
              <textarea
                name="description"
                rows={4}
                placeholder="Aftermarket exhaust, crash guards, custom decals, a respray that isn't the stock colour — and anything you want the shot to do with it."
                className={`${fieldClass} resize-none placeholder:text-[#B8C4D6]/40`}
              />
            </label>

            {/* A fieldset rather than a label: a label may caption one control,
                and this is a group of them. */}
            <fieldset className="flex flex-col gap-3 border-0 p-0 m-0">
              {/* A step, not a field label. Choosing the kind of build is a
                  decision on the same footing as choosing the machine, and it
                  was reading as one more input on the end of the description.
                  The legend still carries it for a screen reader — the numbering
                  is visual, the grouping is structural. */}
              <legend className="mb-3">
                <span className="block text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-2">
                  Step 04
                </span>
                <span className="block font-display text-xl sm:text-2xl text-[#F5F7FA] leading-tight">
                  Pick the kind of build.
                </span>
              </legend>
              {/* Same reasoning as the CGI Projects grid: these are that card
                  with a selected state, so they need the same column width to
                  hold the same title and description. */}
              <div
                role="radiogroup"
                aria-label="Project"
                /* Two up on a phone, not one.
                
                   A single column gave each card the full width of the form,
                   which at a 4:3 image is most of the screen per option — nine
                   of them became a very long scroll through very large pictures
                   for what is a pick-one control. Two up halves the height of
                   every card and lets a visitor see several at once, which is
                   what makes a set of options comparable. */
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3"
              >
                {projects.map((project) => (
                  <ProjectOptionCard
                    key={project.id}
                    project={project}
                    selected={selectedProject === project.title}
                    onSelect={() => setSelectedProject(project.title)}
                  />
                ))}
              </div>
            </fieldset>
          </div>

        </div>

        {/* Not a detail of the brief, so not in the column with the fields:
            this is the question that decides what the work is for, and it is
            worth nothing buried where someone has already scrolled past.
            Centred on the same axis as the button below it. */}
        <div className="lg:col-span-12 mt-4 sm:mt-8 flex flex-col items-center gap-6 text-center">
          <Step number="05" title="Who's it for?" />
          {/* Down from step 03. A pose reacting to a question the visitor has
              just been asked reads as an answer being received; the same pose
              beside a description field was only filling a column. Desktop
              only, like the other two — stacked on a phone it is a screen of
              mascot between the question and the chips. */}
          <Mascot
            pose="fistPump"
            size="lg"
            parallax
            className="hidden lg:block"
          />
          {/* The explanation sits between the pose and the chips rather than
              under the heading. It is the sentence that makes the four options
              mean something, so it belongs where the eye is about to reach for
              them — under the heading it was read before the question had
              landed, and scrolled past before the answer was needed. */}
          <p className="max-w-md text-sm text-[#B8C4D6] leading-relaxed">
            The same machine shot for your own feed and for a brand campaign are
            two different jobs — this tells us which one we&rsquo;re making.
          </p>

          <MarqueChips
            name="usage"
            label="Who the work is for"
            value={usage}
            onChange={setUsage}
            options={USAGE_OPTIONS}
          />
        </div>

        {/* text-center as well as items-center: items-center centres the
            block, and the block is only as wide as its widest line, so "Step
            05" was still setting flush to the left edge of "Send it." above a
            button that was centred on something else again. */}
        <div className="lg:col-span-12 mt-4 sm:mt-8 flex flex-col items-center gap-4 text-center">
          <Step number="06" title="Submit request." />

          {/* The price, and when it is due.
          
              Said here rather than on the cards: it depends on the build the
              visitor has just chosen, and a figure on every card would be a
              price list on a page that is selling a conversation. A build with
              no fixed price says so — the form never invents one.
          
              The second line is the part that matters legally and practically.
              Nothing is taken on this page: the form sends a request, the
              studio comes back on WhatsApp or Instagram, and payment happens
              in that conversation before any work starts. A visitor who reads
              a number without that sentence reasonably assumes they are about
              to be charged. */}
          <div className="max-w-md">
            {/* Labelled as an estimate, in the label rather than in a footnote.
                The figure is what the build usually costs; what it finally
                costs is settled in the conversation that follows, and calling
                it a total without saying "estimate" invites someone to treat it
                as a quote they have been given. */}
            <p className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-2">
              Total project cost estimate
            </p>
            <p className="font-display text-2xl sm:text-3xl text-[#F5F7FA]">
              {selectedPrice ?? "Quoted after we talk"}
            </p>
            <p className="mt-3 text-sm text-[#B8C4D6] leading-relaxed">
              Nothing is charged here. We&rsquo;ll reach out on WhatsApp or
              Instagram to talk the build through, and payment happens then —
              work starts once it&rsquo;s done.
            </p>
          </div>
          {/* Stated, not offered.
          
              This was a toggle, defaulting to off, because the collab used to
              be charged for and was the client's to opt into. It is included on
              every job now — the studio wants the work in its own feed as much
              as the client wants it in theirs, and the reach the About section
              argues from only holds if it keeps landing there. A free inclusion
              drawn as a checkbox invites someone to consider opting out of the
              one thing you want them to say yes to. */}
          <p className="max-w-md text-sm text-[#B8C4D6] leading-relaxed">
            Every job goes out as a collab post on your handle — the reel lands
            in both feeds at once, in front of both sets of followers.
          </p>
          <Magnet padding={40} strength={5}>
            <SparkleButton type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending..." : "Submit Request"}
            </SparkleButton>
          </Magnet>
          {status === "error" && (
            <span className="text-xs text-[#FF4444]">
              Something went wrong — please email us directly.
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
