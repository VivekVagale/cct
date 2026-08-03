import { motion } from "framer-motion";
import { testimonials } from "@/data/content";
import { TestimonialTicket, TicketBumpFilter } from "@/components/TestimonialTicket";

export function Testimonials() {
  return (
    <section className="relative pointer-events-auto py-32 sm:py-40">
      {/* One filter for the whole section — see TicketBumpFilter. */}
      <TicketBumpFilter />

      <div className="max-w-[1600px] mx-auto px-6 sm:px-10">
        <p className="text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-16 sm:mb-24">
          Client Words
        </p>
        {/* The tickets have a fixed width and cast a wide drop shadow, so they
            are centred in their columns with room around them rather than
            stretched to fill. */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 sm:gap-12 justify-items-center">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <TestimonialTicket t={t} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
