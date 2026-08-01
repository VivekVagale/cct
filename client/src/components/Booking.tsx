import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { experiences } from "@/data/content";
import { submitBookingForm } from "@/lib/formHandler";

type Status = "idle" | "submitting" | "success" | "error";

export function Booking() {
  const [status, setStatus] = useState<Status>("idle");
  const [experience, setExperience] = useState(experiences[0].title);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const data = new FormData(form);

    const ok = await submitBookingForm({
      fullName: String(data.get("fullName") || ""),
      email: String(data.get("email") || ""),
      instagram: String(data.get("instagram") || ""),
      projectType: experience,
      vehicle: String(data.get("vehicle") || ""),
      description: String(data.get("description") || ""),
    }).catch(() => false);

    setStatus(ok ? "success" : "error");
  }

  if (status === "success") {
    return (
      <section id="booking" className="relative pointer-events-auto py-32 sm:py-40">
        <div className="max-w-2xl mx-auto px-6 text-center flex flex-col items-center">
          <Mascot pose="fistPump" size="lg" />
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
        <div className="lg:col-span-5">
          <p className="text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-5">
            Start a Project
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-[#F5F7FA] leading-[1.05] mb-8 max-w-md">
            Ready to turn your machine into cinema.
          </h2>
          <p className="text-[#B8C4D6] leading-relaxed max-w-sm mb-10">
            Tell us about the vehicle and the story you want it to tell. We'll
            follow up to scope the shot list together.
          </p>
          <Mascot pose="pointing" size="md" className="hidden lg:block" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
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
          <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
            Vehicle
            <input
              name="vehicle"
              placeholder="Make, model, year"
              className="bg-transparent border-b border-white/20 focus:border-white/60 outline-none py-3 text-[#F5F7FA] text-base normal-case tracking-normal transition-colors"
            />
          </label>

          <label className="sm:col-span-2 flex flex-col gap-3 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
            Experience
            <div className="flex flex-wrap gap-2">
              {experiences.map((exp) => (
                <button
                  type="button"
                  key={exp.id}
                  onClick={() => setExperience(exp.title)}
                  className={`text-xs tracking-[0.1em] uppercase px-4 py-2.5 border transition-colors duration-300 normal-case ${
                    experience === exp.title
                      ? "bg-white text-[#05070A] border-white"
                      : "border-white/20 text-[#B8C4D6] hover:border-white/50"
                  }`}
                >
                  {exp.title}
                </button>
              ))}
            </div>
          </label>

          <label className="sm:col-span-2 flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
            Project Description
            <textarea
              name="description"
              rows={4}
              className="bg-transparent border-b border-white/20 focus:border-white/60 outline-none py-3 text-[#F5F7FA] text-base normal-case tracking-normal resize-none transition-colors"
            />
          </label>

          <div className="sm:col-span-2 flex items-center gap-6 mt-4">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="text-xs tracking-[0.14em] uppercase bg-white text-[#05070A] px-8 py-4 hover:bg-[#E5E5E5] transition-colors duration-300 disabled:opacity-50"
            >
              {status === "submitting" ? "Sending..." : "Submit Request"}
            </button>
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
