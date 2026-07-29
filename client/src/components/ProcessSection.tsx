import { ProcessStep } from '@/components/ui/ProcessStep';
import { processSteps } from '@/data/process';

/**
 * Process Section — static, editorial 4-step layout. Horizontal row
 * on desktop, stacked with a connecting line on mobile. No animation
 * library.
 */
export function ProcessSection() {
  return (
    <section id="process" className="w-full py-24 lg:py-32 relative z-10 pointer-events-none">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pointer-events-auto">
        <div className="mb-16">
          <span className="text-xs font-medium tracking-[0.2em] text-[#B8C4D6] mb-4 block">
            HOW IT WORKS
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#F5F7FA]">Our Process</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
          {processSteps.map((step) => (
            <ProcessStep key={step.number} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}
