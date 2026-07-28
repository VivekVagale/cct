import type { ProcessStepData } from '@/data/process';

/**
 * Static process step — oversized, low-opacity number as the
 * organizing visual element (editorial/timeline feel, not a card).
 */
export function ProcessStep({ number, title, description }: ProcessStepData) {
  return (
    <div className="relative pl-6 lg:pl-0 border-l lg:border-l-0 border-white/[0.12]">
      <span className="block text-5xl lg:text-6xl font-bold text-[#7FDBFF]/20 leading-none mb-4">
        {number}
      </span>
      <h3 className="text-xl font-bold text-[#F5F7FA] mb-2">{title}</h3>
      <p className="text-sm text-[#B8C4D6] leading-relaxed max-w-xs">{description}</p>
    </div>
  );
}
