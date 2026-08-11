import { testimonials } from "@/data/content";
import { Reveal } from "@/components/Reveal";
import { TestimonialTicket, TicketBumpFilter } from "@/components/TestimonialTicket";

export function Testimonials() {
  /*
   * No quotes, no section.
   *
   * Rendering the band with an empty grid leaves "Client Words" sitting over a
   * gap, which reads worse than the section not being there — an empty heading
   * is a claim the page cannot back. It comes back the moment data/content.ts
   * has a real quote in it; nothing else has to be switched on.
   */
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="relative pointer-events-auto py-20 sm:py-40">
      {/* One filter for the whole section — see TicketBumpFilter. */}
      <TicketBumpFilter />

      <div className="max-w-[1600px] mx-auto px-6 sm:px-10">
        <p className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-10 sm:mb-24">
          Client Words
        </p>
        {/* The tickets have a fixed width and cast a wide drop shadow, so they
            are centred in their columns with room around them rather than
            stretched to fill.

            Three across from lg rather than xl. A ticket cannot reflow, and
            that used to rule out lg — about 282px of column against a 360px
            card, which would have run into its neighbours instead of
            shrinking. The card is 268px now and clears it, so the row closes
            up a breakpoint earlier and two across arrives at sm. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12 justify-items-center">
          {testimonials.map((t, i) => (
            // Same wrapper, so no layout changes — only the curve, which is
            // now the one every other entrance on the page uses. `scale`
            // because a ticket is an object arriving, not a paragraph.
            <Reveal delay={i * 0.12} key={t.name} scale>
              <TestimonialTicket t={t} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
