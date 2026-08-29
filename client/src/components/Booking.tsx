import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import Cubes from "@/components/ui/Cubes";
import { Magnet } from "@/components/Magnet";
import {
  VehicleConfigurator,
  OTHER_VEHICLE_ID,
  OTHER_MACHINE_EYEBROW,
  OTHER_MACHINE_NAME,
} from "@/components/VehicleConfigurator";
import { ProjectOptionCard } from "@/components/ProjectOptionCard";
import { PendingRender } from "@/components/PendingRender";
import { SparkleButton } from "@/components/SparkleButton";
import { MarqueChips, type MarqueChip } from "@/components/MarqueChips";
import { ThankYouCard, preloadThankYou } from "@/components/ThankYouCard";
import {
  BuildBriefDialog,
  BUILD_BRIEFS,
  hasBrief,
  FREE_FALL_DEFAULTS,
  type FreeFallAnswers,
} from "@/components/BuildBriefDialog";
import { jets } from "@/data/jets";
import { environments } from "@/data/environments";
import { deliveries } from "@/data/deliveries";
import { vehicles, type Vehicle, type VehicleColor } from "@/data/vehicles";
import { projects } from "@/data/content";
import { submitBookingForm } from "@/lib/formHandler";
import DepthText from "@/components/DepthText";
import { useIsPhone } from "@/hooks/useIsPhone";

type Status = "idle" | "submitting" | "success" | "error";

/* Which builds carry a brief, and which questions each asks, lives in
   BuildBriefDialog beside the dialog that renders them. Two builds use it now:
   Free Fall asks all five questions, Studio asks three -- it has no jets and
   one lighting set-up, so those two have nothing to choose between. */

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

/**
 * What the `vehicle` column says when the machine is not one of ours.
 *
 * Not left empty. The studio reads a table where an empty vehicle means the
 * form failed, and they would have to be told once per row that this one is
 * different. It says where the machine actually is instead, and every such
 * row sorts together. Twenty-three characters against a two-hundred limit.
 */
const OTHER_VEHICLE_LABEL = "Other — see description";

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
  other,
}: {
  vehicle?: Vehicle;
  color?: VehicleColor;
  other?: boolean;
}) {
  /* Ahead of the missing-vehicle branch, because Other is a choice that was
     made and not one that is absent. The paragraph below would send this
     visitor back to step 01 to redo the thing they just did. */
  if (other) {
    return (
      <div className="selected-glow flex items-center gap-4 rounded-sm border bg-[#7A44E0]/[0.07] p-3 sm:p-4">
        <div className="h-14 w-20 shrink-0 overflow-hidden rounded-sm sm:h-16 sm:w-24">
          <PendingRender swatch="#6E7378" label="No render" />
        </div>
        <div className="min-w-0 normal-case tracking-normal">
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#B8C4D6]">
            {OTHER_MACHINE_EYEBROW}
          </p>
          <p className="font-display text-base sm:text-lg text-[#F5F7FA]">
            {OTHER_MACHINE_NAME}
          </p>
          {/* Where the colour line sits on every other machine. There is no
              colour to choose and no card to tap, so "tap the card above to
              pick one" would point at a control this visitor does not have.
              This says what they owe us instead. */}
          <p className="mt-1 text-xs text-[#B8C4D6]">
            Tell us the make, model and year in step 03 below.
          </p>
        </div>
      </div>
    );
  }

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
        The form needs one before it can be sent.
      </p>
    );
  }

  return (
    <div className="selected-glow flex items-center gap-4 rounded-sm border bg-[#7A44E0]/[0.07] p-3 sm:p-4">
      {/* 80px wide, so the full "Render in progress" cannot sit on one line and
          wraps to three. The echo is captioned by the marque, the model and the
          colour name immediately beside it — this only has to say which of the
          two kinds of thing the picture is. */}
      {(color?.pending ?? vehicle.pending) ? (
        <div className="h-14 w-20 shrink-0 overflow-hidden rounded-sm sm:h-16 sm:w-24">
          <PendingRender
            swatch={color?.swatch ?? vehicle.colors[0]?.swatch ?? "#6E7378"}
            label="No render"
          />
        </div>
      ) : (
        <img
          src={color?.image ?? vehicle.image}
          alt=""
          className="h-14 w-20 shrink-0 rounded-sm object-cover sm:h-16 sm:w-24"
        />
      )}
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
  /*
   * The chosen build, held by id.
   *
   * It was the title, and every comparison downstream was a string match
   * against display copy. That works until the copy moves -- and it is moving:
   * Project Minecraft is a trademark the studio has been told about, and its
   * title is the one place the word appears. A rename would have quietly
   * stopped the Free Fall dialog opening with nothing to catch it, which is
   * the same failure the About sentence and the Unsplash comment had.
   *
   * The title is derived where it is needed, so `project_type` keeps receiving
   * exactly the strings it always has.
   */
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0].id);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [colorId, setColorId] = useState<string | null>(null);
  /*
   * Who the work is for. Drives the brief more than the machine does — the
   * same bike shot for someone's own feed and for a dealership's campaign are
   * two different jobs.
   */
  const [usage, setUsage] = useState("personal");
  /*
   * Free Fall's answers, and whether its dialog is open.
   *
   * Kept here rather than in the dialog because the dialog is unmounted most
   * of the time and these have to survive it being closed -- dismissing keeps
   * the answers, the way dismissing the colour picker keeps the machine. It
   * also means they survive switching to another build and back, which is why
   * the payload is gated instead of the state being cleared.
   */
  const [freeFall, setFreeFall] = useState<FreeFallAnswers>(FREE_FALL_DEFAULTS);
  const [freeFallOpen, setFreeFallOpen] = useState(false);
  /** The section the thank-you card lands in. See the layout effect below. */
  const thanksRef = useRef<HTMLElement>(null);

  // Resolved once here rather than in two places: the summary above the form
  // and the label sent with the request must never name different machines.
  // Priced builds carry their own figure; the rest are quoted in conversation.
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedPrice = selectedProject?.price;

  const briefed = hasBrief(selectedProjectId);
  const brief = BUILD_BRIEFS[selectedProjectId];

  /* One line of what was answered, so the row under the grid is a summary
     rather than a control labelled "Edit" with nothing visible to edit. It
     reads off the same state the dialog writes, so it cannot describe a build
     the dialog is not holding. */
  const freeFallSummary = [
    freeFall.plate.trim() ? `Plate "${freeFall.plate.trim()}"` : "No plate text",
    freeFall.stickers === "none"
      ? "no stickers"
      : `${freeFall.stickers} sticker${freeFall.stickers === "1" ? "" : "s"}`,
    brief?.environment
      ? environments.find((e) => e.id === freeFall.environment)?.name.toLowerCase() ?? ""
      : "",
    freeFall.oem === "yes" ? "OEM parts" : "stock",
    brief?.jets ? jets.find((jet) => jet.id === freeFall.jetId)?.name ?? "" : "",
    brief?.delivery
      ? deliveries.find((d) => d.id === freeFall.deliveryId)?.name ?? ""
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  /* Both undefined when the choice is Other, on purpose: there is no Vehicle
     behind that id, so nothing downstream may reach for a manufacturer, a
     render or a colour list. */
  const chosenVehicle = vehicles.find((v) => v.id === vehicleId);
  const chosenColor = chosenVehicle?.colors.find((c) => c.id === colorId);
  const isOther = vehicleId === OTHER_VEHICLE_ID;

  /* Picking Free Fall opens its brief. Picking it again reopens it, because
     the card is the obvious thing to click when you want to change an answer
     and a second click that did nothing would read as the card being stuck. */
  function handleSelectProject(id: string) {
    setSelectedProjectId(id);
    if (hasBrief(id)) setFreeFallOpen(true);
  }

  function handleSelectVehicle(id: string) {
    setVehicleId(id);
    setColorId(null); // changing the vehicle clears the color selection
    /* Start fetching the confirmation here, five steps before it can be
       needed.

       It used to start at the click on Submit, which reads like the right
       moment and is not: the insert is a 16ms round trip and the confirmation
       is a megabyte and a half of physics engine and model, so the request
       finishes and the reader is left watching a loader. Picking a machine is
       the first thing on this form that cannot be done by accident -- it is
       step 01, the button will not send without it, and everything after it is
       typing. Someone who has done it is filling the form in, and the several
       steps that follow are the download.

       Idle rather than immediately: the vehicle picker is a grid of renders
       and this must not compete with the one the reader just asked to see.
       requestIdleCallback is absent on Safari before 17, where a timeout is
       the same idea with a worse guess at when. */
    const start = () => preloadThankYou();
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(start, { timeout: 3000 });
    } else {
      window.setTimeout(start, 1200);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    /* The button is disabled without one, so this is the second lock rather
       than the first — a form can still be submitted by pressing Enter in a
       field, and a request naming no machine is not a request. */
    if (!vehicleId) return;
    /* Second call, and a cheap one: `preloadThankYou` is idempotent -- the
       import is cached by the module system and the model behind a promise
       that is only created once. This is the backstop for the reader who
       reached this button without the idle callback in `handleSelectVehicle`
       ever running, whose wait is then what it always was rather than worse. */
    preloadThankYou();
    setStatus("submitting");
    const form = e.currentTarget;
    const data = new FormData(form);

    /* Other is tested first so it cannot fall through to the empty string.
       chosenColor is undefined under it, so no colour can be appended. */
    const vehicleLabel = isOther
      ? OTHER_VEHICLE_LABEL
      : chosenVehicle
        ? `${chosenVehicle.manufacturer} ${chosenVehicle.name}${
            chosenColor ? ` — ${chosenColor.name}` : ""
          }`
        : "";

    /* The brief travels only under the build it belongs to.
    
       The answers are not cleared when another build is chosen -- switching
       away and back should not silently blank what someone typed -- so the
       gate is here rather than in the state. Without it a Minecraft request
       would arrive carrying a jet and a plate nobody asked it for.

       The example used to be Jet Mist, which now asks a brief of its own —
       the same three questions Studio asks. The builds this still guards are
       the ones absent from BUILD_BRIEFS entirely.
    
       Names, not ids: the studio reads these columns, and `su-30-mkk` in an
       inbox is worse than nothing. Same reason `vehicle` is sent as a label. */
    /* Say when an answer is the one nobody chose.

       The table was recording the default jet as "MiG-29", which reads in an
       inbox exactly like a client who went looking and picked the MiG-29 — and
       the difference matters, because the line under the grid prices every
       other jet against that one. Marked rather than blanked: the studio still
       needs to know which aircraft is in the shot, and an empty cell would
       trade one ambiguity for a worse one.

       Only on the way to the table. The summary the client reads on the page
       still says "MiG-29", because they are looking at the picker while they
       read it and "Default jet" there would describe nothing they can see. */
    const asDefault = (name: string, isDefault: boolean, noun: string) =>
      name && isDefault ? `Default ${noun} (${name})` : name;

    const chosenJet = jets.find((jet) => jet.id === freeFall.jetId);
    const jetName = asDefault(
      chosenJet?.name ?? "",
      Boolean(chosenJet?.isDefault),
      "jet",
    );
    const environmentName =
      environments.find((e) => e.id === freeFall.environment)?.name ?? "";
    const chosenDelivery = deliveries.find(
      (d) => d.id === freeFall.deliveryId,
    );
    const deliveryName = asDefault(
      chosenDelivery?.name ?? "",
      Boolean(chosenDelivery?.isDefault),
      "delivery",
    );

    const ok = await submitBookingForm({
      fullName: String(data.get("fullName") || ""),
      email: String(data.get("email") || ""),
      instagram: String(data.get("instagram") || ""),
      whatsapp: String(data.get("whatsapp") || ""),
      projectType: selectedProject?.title ?? "",
      vehicle: vehicleLabel,
      description: String(data.get("description") || ""),
      usage,
      freeFallPlate: briefed ? freeFall.plate : "",
      freeFallStickers: briefed ? freeFall.stickers : "",
      freeFallEnvironment: briefed && brief?.environment ? environmentName : "",
      freeFallOem: briefed ? freeFall.oem : "",
      freeFallOemDetails:
        briefed && freeFall.oem === "yes" ? freeFall.oemDetails : "",
      /* Both the jet and the delivery ride this one column.

         They are the same question — which aircraft is in the shot — asked of
         two builds that answer it differently, and no build turns both on. The
         alternative was a `free_fall_delivery` column, which this client cannot
         create: the insert names its columns explicitly and PostgREST rejects
         the whole row for one it does not know, so shipping that ahead of the
         migration would have broken every submission on the site rather than
         just this build's. Add the column and split these two if the studio
         ever wants them apart in the table. */
      freeFallJet: briefed
        ? brief?.jets
          ? jetName
          : brief?.delivery
            ? deliveryName
            : ""
        : "",
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
                other={isOther}
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

        {/* The cubes. The pose that stood here went to step 05 and then to
            step 04, which is where it is now -- a figure beside a grid of
            builds rather than beside a text field. Step 03 keeps the cubes on
            their own; the column is the tallest in the form and would read as
            empty without something in it.

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
              /* The stock line opens on "the card above says what it is", which
                 is false the moment the card above is Other — that one names
                 nothing. Under it this field is the only place the machine gets
                 named at all, so it says so. */
              hint={
                isOther
                  ? "The card above doesn't name it, so start here: make, model and year. Then what you have done to it, then the closest kind of build."
                  : "The card above says what it is. This is where you say what you have done to it, then pick the closest kind of build."
              }
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
                /* Required only under Other, and by the browser rather than by
                   us. React drops the attribute entirely when this is false, so
                   the fifty-seven-machine path is untouched, and the field stays
                   uncontrolled — toggling the flag does not remount it or throw
                   away what has been typed.

                   Deliberately not paired with a disabled submit button. A
                   disabled button suppresses constraint validation altogether
                   and leaves a dead control with no message, which is the exact
                   failure the hint under it was written to fix. The vehicle gate
                   needs its own lock in JS because a selected card is not
                   something a native constraint can express; a textarea is, so
                   the browser owns this one.

                   `required` rejects only the empty string, so a single space
                   satisfies it. Not worth policing — that is a reply away. */
                required={isOther}
                /* The column is `char_length(description) <= 5000`; past it the
                   insert 400s and the form can only say something went wrong.
                   Pre-existing, and likelier now this field carries the machine
                   itself. */
                maxLength={5000}
                placeholder={
                  isOther
                    ? "Make, model and year first — then the exhaust, the guards, the decals, a respray that isn't the stock colour, and anything you want the shot to do with it."
                    : "Aftermarket exhaust, crash guards, custom decals, a respray that isn't the stock colour — and anything you want the shot to do with it."
                }
                className={`${fieldClass} resize-none placeholder:text-[#B8C4D6]/40`}
              />
            </label>
          </div>
        </div>

        {/* Step 04 is its own row so it can have its own left column.
            It used to sit under the description inside step 03's column, which
            put the cubes beside it -- and the cubes are step 03's answer to an
            empty column, not step 04's. The build grid keeps the width it had:
            eight columns of twelve at the same gap, which is what makes these
            cards the same size as the ones on the projects scene.

            The row break also puts the form's own gap between the description
            and the legend, where there was none. Choosing a build is not the
            last line of the paragraph above it. */}
        <div className="hidden lg:flex lg:col-span-4 justify-center items-start">
          {/* Sticky like the other two, so the pose stays level with the grid
              rather than scrolling off at the first row of cards. */}
          <div className="sticky top-28">
            <Mascot pose="fistPump" size="lg" parallax />
          </div>
        </div>

        <div className="lg:col-span-8">
          <div>
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
                    selected={selectedProjectId === project.id}
                    onSelect={() => handleSelectProject(project.id)}
                  />
                ))}
              </div>

              {/* The way back into the brief.
              
                  The dialog opens once, on selection, and a client who closes
                  it has no other route to what they answered -- the same
                  problem step 01 has, answered the same way: echo the choice
                  where it was made, with a control that reopens it. */}
              {briefed && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-white/[0.1] bg-white/[0.02] px-4 py-3">
                  <p className="text-[11px] leading-relaxed text-[#B8C4D6]">
                    {freeFallSummary}
                  </p>
                  <button
                    type="button"
                    onClick={() => setFreeFallOpen(true)}
                    className="shrink-0 border-b border-white/30 pb-0.5 text-[11px] uppercase tracking-[0.16em] text-[#F5F7FA] transition-colors duration-300 hover:border-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9F6EF2]"
                  >
                    Edit build
                  </button>
                </div>
              )}
            </fieldset>
          </div>

        </div>

        {/* Not a detail of the brief, so not in the column with the fields:
            this is the question that decides what the work is for, and it is
            worth nothing buried where someone has already scrolled past.
            Centred on the same axis as the button below it. */}
        <div className="lg:col-span-12 mt-4 sm:mt-8 flex flex-col items-center gap-6 text-center">
          <Step number="05" title="Who's it for?" />
          {/* The pose that stood here is beside step 04 now. It read as a
              reaction to the question, which was the argument for putting it
              here -- but this step is a heading, a sentence and four chips, and
              a figure at the top of it pushed the chips a screen down from the
              question they answer. Step 04 is a grid of pictures with an empty
              column beside it, which is somewhere for a figure to stand. */}
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
            {/* Two sizes, because this one element renders two different kinds
                of thing. A figure is five glyphs and wants to be the largest
                thing on the step — it was getting skimmed past at the size the
                sentence needed. "Quoted after we talk" is a sentence, and at
                display size it wraps to three lines inside max-w-md and reads
                as a headline the studio never wrote. leading-none because a
                single line of 72px type does not need the 1.5 line box that
                comes with it. */}
            <p
              className={
                selectedPrice
                  ? "font-display text-6xl sm:text-7xl leading-none tracking-tight text-[#F5F7FA]"
                  : "font-display text-2xl sm:text-3xl text-[#F5F7FA]"
              }
            >
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
            <SparkleButton
              type="submit"
              disabled={status === "submitting" || !vehicleId}
            >
              {status === "submitting" ? "Sending..." : "Submit Request"}
            </SparkleButton>
          </Magnet>
          {/* Says why the button is dead, and takes them to the fix.

              A disabled control with no explanation is a dead end — the reader
              can see they cannot send and not what to do about it, and step 01
              is several screens up by the time anyone reaches this button. The
              request is a quote for a specific machine; without one there is
              nothing to quote. */}
          {!vehicleId && (
            <p className="max-w-md text-sm text-[#B8C4D6] normal-case tracking-normal leading-relaxed">
              Pick a machine before you send this —{" "}
              <a
                href="#booking"
                className="inline-block py-1.5 -my-1.5 text-[#F5F7FA] border-b border-white/30 transition-colors duration-300 hover:border-white"
              >
                step 01 is at the top of this section.
              </a>
            </p>
          )}
          {status === "error" && (
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
        {freeFallOpen && (
          <BuildBriefDialog
            projectId={selectedProjectId}
            value={freeFall}
            onChange={setFreeFall}
            onDone={() => setFreeFallOpen(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
