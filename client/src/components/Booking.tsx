import { useState, type FormEvent } from "react";
import { Mascot } from "@/components/Mascot";
import Cubes from "@/components/ui/Cubes";
import { Magnet } from "@/components/Magnet";
import { VehicleConfigurator } from "@/components/VehicleConfigurator";
import { ProjectOptionCard } from "@/components/ProjectOptionCard";
import { SparkleButton } from "@/components/SparkleButton";
import { CollabToggle } from "@/components/CollabToggle";
import { ThankYouCard } from "@/components/ThankYouCard";
import { vehicles, type Vehicle, type VehicleColor } from "@/data/vehicles";
import { projects } from "@/data/content";
import { submitBookingForm } from "@/lib/formHandler";
import { FoldHeading } from "@/components/FoldHeading";

type Status = "idle" | "submitting" | "success" | "error";

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
          className="text-[#F5F7FA] border-b border-white/30 transition-colors duration-300 hover:border-white"
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
  const [status, setStatus] = useState<Status>("idle");
  const [selectedProject, setSelectedProject] = useState(projects[0].title);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [colorId, setColorId] = useState<string | null>(null);
  // Off by default. A collab post puts the reel in the client's own feed under
  // both names, and that is theirs to opt into rather than to notice and undo.
  const [collabPost, setCollabPost] = useState(false);

  // Resolved once here rather than in two places: the summary above the form
  // and the label sent with the request must never name different machines.
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
      collabPost,
    }).catch(() => false);

    setStatus(ok ? "success" : "error");
  }

  if (status === "success") {
    return (
      <section
        id="booking"
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
        <div>
          <p className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-4 sm:mb-5">
            Step 01 — Configure
          </p>
          <h2 className="font-display text-5xl sm:text-8xl lg:text-9xl text-[#F5F7FA] max-w-4xl leading-[0.98]">
            <FoldHeading text="Pick your machine." />
          </h2>
          <p className="text-sm sm:text-base text-[#B8C4D6] mt-4 sm:mt-5 max-w-md">
            Choose the vehicle, then its colour. Five steps in all — this is the
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

        {/* The second pose, and the cubes under it. Step 03 is the tallest
            part of the form — a description field and seven project cards — so
            this column has the room for both where step 02's does not.

            The pointer reaches the cubes: the grid tilts toward the cursor and
            that is all it does. The click ripple stays off, because a click
            there leads nowhere. */}
        <div className="hidden lg:flex lg:col-span-4 flex-col items-center gap-10">
          <div className="sticky top-28 flex flex-col items-center gap-10">
            <Mascot pose="fistPump" size="lg" parallax />
            <div aria-hidden className="w-full cubes-fill">
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
              <legend className="text-xs tracking-[0.14em] uppercase text-[#B8C4D6] mb-3">
                Project
              </legend>
              {/* Same reasoning as the CGI Projects grid: these are that card
                  with a selected state, so they need the same column width to
                  hold the same title and description. */}
              <div
                role="radiogroup"
                aria-label="Project"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
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

        {/* The collab question sits before the button rather than beside the
            fields: it is a decision about what happens after the work is
            delivered, not a detail of the brief, and the answer is worth
            nothing if it is buried in a column someone has already scrolled
            past. Centred on the same axis as the button below it. */}
        <div className="lg:col-span-12 mt-4 sm:mt-8 flex flex-col items-center gap-6 text-center">
          <Step
            number="04"
            title="Post it together?"
            hint="Collab post with @coldchaintheory for better engagement — the reel goes out from both accounts at once and reaches both sets of followers."
          />
          <CollabToggle checked={collabPost} onChange={setCollabPost} />
        </div>

        {/* text-center as well as items-center: items-center centres the
            block, and the block is only as wide as its widest line, so "Step
            05" was still setting flush to the left edge of "Send it." above a
            button that was centred on something else again. */}
        <div className="lg:col-span-12 mt-4 sm:mt-8 flex flex-col items-center gap-4 text-center">
          <Step number="05" title="Send it." />
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
