import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { AnimatedText } from "@/components/AnimatedText";

export function About() {
  return (
    /* scroll-mt clears the fixed bar. The nav links are anchors, so without it a
       jump lands the section's own top at y=0 and the bar covers the first line
       of whatever is there — which the mobile menu made reachable in one tap. */
    <section
      id="about"
      className="relative min-h-[100svh] flex items-center pointer-events-auto py-24 sm:py-32 scroll-mt-16 sm:scroll-mt-20"
    >
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <div className="lg:col-span-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
            className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-6 sm:mb-8"
          >
            About the Studio
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-3xl sm:text-6xl lg:text-7xl text-[#F5F7FA] leading-[1.05] mb-8 sm:mb-12 max-w-4xl"
          >
            We don't render cars. We build the world a machine deserves.
          </motion.h2>
          <AnimatedText
            text="Cold Chain Theory is a small studio built around one idea: precision is what makes a machine feel cinematic. We take fewer projects and hold each one to the standard of a real production — every panel gap, every reflection, every frame of motion considered before it's rendered. Craftsmanship over volume, always."
            className="text-base sm:text-lg text-[#B8C4D6] leading-relaxed max-w-2xl"
          />
        </div>
        <div className="lg:col-span-4 flex justify-center lg:justify-end">
          <Mascot pose="armsCrossed" size="xl" parallax />
        </div>
      </div>
    </section>
  );
}
