import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";

export function About() {
  return (
    <section
      id="about"
      className="relative min-h-[100svh] flex items-center pointer-events-auto py-32"
    >
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
            className="text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-8"
          >
            About the Studio
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-4xl sm:text-6xl lg:text-7xl text-[#F5F7FA] leading-[1.05] mb-12 max-w-4xl"
          >
            We don't render cars. We build the world a machine deserves.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-base sm:text-lg text-[#B8C4D6] leading-relaxed max-w-2xl"
          >
            Cold Chain Theory is a small studio built around one idea: precision is
            what makes a machine feel cinematic. We take fewer projects and hold
            each one to the standard of a real production — every panel gap, every
            reflection, every frame of motion considered before it's rendered.
            Craftsmanship over volume, always.
          </motion.p>
        </div>
        <div className="lg:col-span-4 flex justify-center lg:justify-end">
          <Mascot pose="armsCrossed" size="xl" parallax />
        </div>
      </div>
    </section>
  );
}
