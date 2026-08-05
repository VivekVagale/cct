import { useState, type FormEvent } from "react";
import { Mascot } from "@/components/Mascot";
import { Magnet } from "@/components/Magnet";
import { VehicleConfigurator } from "@/components/VehicleConfigurator";
import { ProjectOptionCard } from "@/components/ProjectOptionCard";
import { SparkleButton } from "@/components/SparkleButton";
import { ThankYouCard } from "@/components/ThankYouCard";
import { vehicles } from "@/data/vehicles";
import { projects } from "@/data/content";
import { submitBookingForm } from "@/lib/formHandler";

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

export function Booking() {
  const [status, setStatus] = useState<Status>("idle");
  const [selectedProject, setSelectedProject] = useState(projects[0].title);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [colorId, setColorId] = useState<string | null>(null);

  function handleSelectVehicle(id: string) {
    setVehicleId(id);
    setColorId(null); // changing the vehicle clears the color selection
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const data = new FormData(form);

    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const color = vehicle?.colors.find((c) => c.id === colorId);
    const vehicleLabel = vehicle
      ? `${vehicle.manufacturer} ${vehicle.name}${color ? ` — ${color.name}` : ""}`
      : "";

    const ok = await submitBookingForm({
      fullName: String(data.get("fullName") || ""),
      email: String(data.get("email") || ""),
      instagram: String(data.get("instagram") || ""),
      whatsapp: String(data.get("whatsapp") || ""),
      projectType: selectedProject,
      vehicle: vehicleLabel,
      description: String(data.get("description") || ""),
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
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 mb-10 sm:mb-16 flex items-end justify-between gap-8">
        <div>
          <p className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-4 sm:mb-5">
            Step 01 — Configure
          </p>
          <h2 className="font-display text-3xl sm:text-6xl text-[#F5F7FA] max-w-xl leading-[1.05]">
            Pick your machine.
          </h2>
          <p className="text-sm sm:text-base text-[#B8C4D6] mt-4 sm:mt-5 max-w-md">
            Choose the vehicle, then its colour. Four steps in all — this is the
            only one that needs a decision from you before the form.
          </p>
        </div>
        {/* Moved up from the copy column below. Two mascots in one section is
            clutter, and this is where the visitor is actually being asked to
            do something. */}
        <Mascot pose="projectReady" size="lg" className="hidden lg:block shrink-0" />
      </div>

      <VehicleConfigurator
        selectedVehicleId={vehicleId}
        selectedColorId={colorId}
        onSelectVehicle={handleSelectVehicle}
        onSelectColor={setColorId}
      />

      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 mt-20 sm:mt-32 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        <div className="lg:col-span-4">
          <p className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-4 sm:mb-5">
            Start a Project
          </p>
          <h2 className="font-display text-3xl sm:text-5xl text-[#F5F7FA] leading-[1.05] mb-6 sm:mb-8 max-w-md">
            Ready to turn your machine into cinema.
          </h2>
          <p className="text-sm sm:text-base text-[#B8C4D6] leading-relaxed max-w-sm mb-0 lg:mb-10">
            Tell us the story you want it to tell. We'll follow up to scope the
            shot list together.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-8 flex flex-col gap-8 sm:gap-10"
        >
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

          <div>
            <Step
              number="03"
              title="Tell us about the shot."
              hint="Describe it in your own words first, then pick the closest kind of build."
            />
            <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6] max-w-xl mb-8 sm:mb-10">
              Project Description
              <textarea
                name="description"
                rows={4}
                placeholder="A night ride through wet city streets, headlight flare, no rider."
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

          {/* Centred on the form column, which is where the eye already is
              after a column of centred cards — left-aligned it sat under the
              first card with three cards' width of empty space beside it. */}
          <div className="flex flex-col items-center gap-4">
            <Step number="04" title="Send it." />
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
      </div>
    </section>
  );
}
