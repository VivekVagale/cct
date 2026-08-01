import { motion } from "framer-motion";
import { testimonials } from "@/data/content";

export function Testimonials() {
  return (
    <section className="relative pointer-events-auto py-32 sm:py-40">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10">
        <p className="text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-16 sm:mb-24">
          Client Words
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 sm:gap-8">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col"
            >
              <blockquote className="font-display text-xl sm:text-2xl text-[#F5F7FA] leading-[1.4] mb-8">
                "{t.quote}"
              </blockquote>
              <figcaption className="text-xs tracking-[0.1em] uppercase text-[#B8C4D6]">
                {t.name} — {t.role}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
