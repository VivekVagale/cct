import { motion } from "framer-motion";
import { experiences } from "@/data/content";

export function CGIExperiences() {
  return (
    <section id="experiences" className="relative pointer-events-auto py-32 sm:py-40">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 mb-16 sm:mb-24">
        <p className="text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-5">
          What We Build
        </p>
        <h2 className="font-display text-4xl sm:text-6xl text-[#F5F7FA] max-w-xl leading-[1.05]">
          CGI Experiences
        </h2>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06]">
        {experiences.map((exp, i) => (
          <motion.a
            key={exp.id}
            href="#booking"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: (i % 3) * 0.08 }}
            className="relative group bg-[#05070A] aspect-[4/5] overflow-hidden flex flex-col justify-end p-8"
          >
            <img
              src={exp.image}
              alt={exp.title}
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/30 to-transparent" />
            <div className="relative z-10">
              <h3 className="font-display text-2xl sm:text-3xl text-[#F5F7FA] mb-2">
                {exp.title}
              </h3>
              <p className="text-sm text-[#B8C4D6] leading-relaxed mb-4 max-w-xs opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-500">
                {exp.description}
              </p>
              <span className="text-xs tracking-[0.14em] uppercase text-[#F5F7FA] border-b border-white/30 pb-1 group-hover:border-white transition-colors duration-300">
                Inquire
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
