import { motion } from "framer-motion";
import { experiences, type Experience } from "@/data/content";
import { useTilt } from "@/hooks/useTilt";

function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  const { ref, rotateX, rotateY, glowBackground, onMouseMove, onMouseLeave } =
    useTilt<HTMLAnchorElement>();

  const disabled = Boolean(exp.comingSoon);

  return (
    <motion.a
      ref={ref}
      href={disabled ? undefined : "#booking"}
      aria-disabled={disabled}
      onMouseMove={disabled ? undefined : onMouseMove}
      onMouseLeave={disabled ? undefined : onMouseLeave}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      style={
        disabled
          ? undefined
          : { rotateX, rotateY, transformPerspective: 900 }
      }
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08 }}
      className={`group relative bg-[#05070A] aspect-[4/5] overflow-hidden flex flex-col justify-end p-8 ${
        disabled ? "cursor-default" : "cursor-pointer"
      }`}
    >
      {!disabled && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: glowBackground }}
        />
      )}

      <img
        src={exp.image}
        alt={exp.title}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
          disabled
            ? "opacity-25 grayscale"
            : "opacity-50 group-hover:opacity-75 group-hover:scale-105"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/30 to-transparent" />

      <div className="relative z-10">
        <h3
          className={`font-display text-2xl sm:text-3xl mb-2 ${
            disabled ? "text-[#B8C4D6]" : "text-[#F5F7FA]"
          }`}
        >
          {exp.title}
        </h3>

        {disabled ? (
          <span className="inline-block text-[10px] tracking-[0.18em] uppercase text-[#B8C4D6]/70 border border-white/15 px-3 py-1.5">
            Coming Soon
          </span>
        ) : (
          <>
            <p className="text-sm text-[#B8C4D6] leading-relaxed mb-4 max-w-xs opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-500">
              {exp.description}
            </p>
            <span className="text-xs tracking-[0.14em] uppercase text-[#F5F7FA] border-b border-white/30 pb-1 group-hover:border-white transition-colors duration-300">
              Inquire
            </span>
          </>
        )}
      </div>
    </motion.a>
  );
}

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
          <ExperienceCard key={exp.id} exp={exp} index={i} />
        ))}
      </div>
    </section>
  );
}
