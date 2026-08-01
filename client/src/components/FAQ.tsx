import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/data/content";

export function FAQ() {
  return (
    <section className="relative pointer-events-auto py-32 sm:py-40">
      <div className="max-w-3xl mx-auto px-6 sm:px-10">
        <p className="text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-5 text-center">
          Questions
        </p>
        <h2 className="font-display text-4xl sm:text-5xl text-[#F5F7FA] text-center mb-16 sm:mb-20">
          FAQ
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, i) => (
            <AccordionItem
              key={item.question}
              value={`item-${i}`}
              className="border-white/[0.08]"
            >
              <AccordionTrigger className="font-display text-lg sm:text-xl text-[#F5F7FA] hover:no-underline py-6">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-[#B8C4D6] leading-relaxed pb-6">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
