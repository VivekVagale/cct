import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/data/content";

export function FAQ() {
  return (
    <section className="relative pointer-events-auto py-20 sm:py-40">
      <div className="max-w-3xl mx-auto px-6 sm:px-10">
        <p className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-4 sm:mb-5 text-center">
          Questions
        </p>
        <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F5F7FA] text-center leading-[0.98] mb-10 sm:mb-20">
          FAQ
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, i) => (
            <AccordionItem
              key={item.question}
              value={`item-${i}`}
              className="border-white/[0.08]"
            >
              <AccordionTrigger className="font-display text-base sm:text-xl text-[#F5F7FA] hover:no-underline py-5 sm:py-6 text-left gap-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-[#B8C4D6] leading-relaxed pb-6">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
