import { useState, type FormEvent } from "react";
import { Mascot } from "@/components/Mascot";
import { Magnet } from "@/components/Magnet";
import { VehicleConfigurator } from "@/components/VehicleConfigurator";
import { ExperienceOptionCard } from "@/components/ExperienceOptionCard";
import Cubes from "@/components/ui/Cubes";
import { vehicles } from "@/data/vehicles";
import { experiences } from "@/data/content";
import { submitBookingForm } from "@/lib/formHandler";

type Status = "idle" | "submitting" | "success" | "error";

export function Booking() {
  const [status, setStatus] = useState<Status>("idle");
  const [experience, setExperience] = useState(experiences[0].title);
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
      projectType: experience,
      vehicle: vehicleLabel,
      description: String(data.get("description") || ""),
    }).catch(() => false);

    setStatus(ok ? "success" : "error");
  }

  if (status === "success") {
    return (
      <section id="booking" className="relative pointer-events-auto py-32 sm:py-40">
        <div className="max-w-2xl mx-auto px-6 text-center flex flex-col items-center">
          <Mascot pose="fistPump" size="xl" />
          <h2 className="font-display text-3xl sm:text-4xl text-[#F5F7FA] mt-8 mb-4">
            Request received.
          </h2>
          <p className="text-[#B8C4D6]">
            We'll be in touch within two business days to talk through your project.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="relative pointer-events-auto py-32 sm:py-40">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <p className="text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-5">
            Start a Project
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-[#F5F7FA] leading-[1.05] mb-8 max-w-md">
            Ready to turn your machine into cinema.
          </h2>
          <p className="text-[#B8C4D6] leading-relaxed max-w-sm mb-10">
            Configure the vehicle, tell us the story you want it to tell. We'll
            follow up to scope the shot list together.
          </p>
          <Mascot pose="pointing" size="lg" className="hidden lg:block" />

          {/* Square, because the grid is square and a non-square box would
              shear the isometric projection. */}
          <div className="hidden lg:block relative mt-12 w-full max-w-[420px] aspect-square">
            <Cubes
              gridSize={8}
              maxAngle={45}
              radius={3}
              borderStyle="2px dashed #B497CF"
              faceColor="#1a1a2e"
              rippleColor="#ff6b6b"
              rippleSpeed={1.5}
              autoAnimate
              rippleOnClick
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-8 flex flex-col gap-10"
        >
          <VehicleConfigurator
            selectedVehicleId={vehicleId}
            selectedColorId={colorId}
            onSelectVehicle={handleSelectVehicle}
            onSelectColor={setColorId}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
              Full Name
              <input
                name="fullName"
                required
                className="bg-transparent border-b border-white/20 focus:border-white/60 outline-none py-3 text-[#F5F7FA] text-base normal-case tracking-normal transition-colors"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
              Email
              <input
                name="email"
                type="email"
                required
                className="bg-transparent border-b border-white/20 focus:border-white/60 outline-none py-3 text-[#F5F7FA] text-base normal-case tracking-normal transition-colors"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
              Instagram
              <input
                name="instagram"
                className="bg-transparent border-b border-white/20 focus:border-white/60 outline-none py-3 text-[#F5F7FA] text-base normal-case tracking-normal transition-colors"
              />
            </label>
          </div>

          {/* A fieldset rather than a label: a label may caption one control,
              and this is a group of them. */}
          <fieldset className="flex flex-col gap-3 border-0 p-0 m-0">
            <legend className="text-xs tracking-[0.14em] uppercase text-[#B8C4D6] mb-3">
              Experience
            </legend>
            <div
              role="radiogroup"
              aria-label="Experience"
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              {experiences.map((exp) => (
                <ExperienceOptionCard
                  key={exp.id}
                  exp={exp}
                  selected={experience === exp.title}
                  onSelect={() => setExperience(exp.title)}
                />
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
            Project Description
            <textarea
              name="description"
              rows={4}
              className="bg-transparent border-b border-white/20 focus:border-white/60 outline-none py-3 text-[#F5F7FA] text-base normal-case tracking-normal resize-none transition-colors"
            />
          </label>

          <div className="flex items-center gap-6">
            <Magnet padding={40} strength={5}>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="text-xs tracking-[0.14em] uppercase bg-white text-[#05070A] px-8 py-4 hover:bg-[#E5E5E5] transition-colors duration-300 disabled:opacity-50"
              >
                {status === "submitting" ? "Sending..." : "Submit Request"}
              </button>
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
