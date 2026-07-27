import { motion } from 'framer-motion';

/**
 * Process Section
 * 
 * Design Philosophy:
 * - Elegant animated timeline
 * - Five steps: Discovery, Planning, Production, Rendering, Delivery
 * - Premium visual hierarchy
 * - Staggered entrance animations
 */

interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  index: number;
}

function ProcessStep({ number, title, description, index }: ProcessStepProps) {
  return (
    <motion.div
      className="relative flex gap-6"
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, margin: '-100px' }}
    >
      {/* Timeline node */}
      <div className="flex flex-col items-center">
        <motion.div
          className="w-12 h-12 rounded-full bg-[#7FDBFF] flex items-center justify-center text-[#05070A] font-bold text-lg z-10 relative"
          whileInView={{ scale: 1.1 }}
          transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
        >
          {number}
        </motion.div>
        {index < 4 && (
          <div className="w-1 h-24 bg-gradient-to-b from-[#7FDBFF] to-[#7FDBFF]/20 mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="pb-12 pt-2">
        <h3 className="text-2xl font-bold text-[#F5F7FA] mb-2">{title}</h3>
        <p className="text-[#B8C4D6] max-w-md">{description}</p>
      </div>
    </motion.div>
  );
}

export function ProcessSection() {
  const steps = [
    {
      title: 'Discovery',
      description: 'Understanding your vision, brand identity, and project goals through detailed consultation.',
    },
    {
      title: 'Planning',
      description: 'Developing creative concepts, storyboards, and technical specifications for execution.',
    },
    {
      title: 'Production',
      description: 'Building 3D models, textures, and scenes with premium attention to detail.',
    },
    {
      title: 'Rendering',
      description: 'High-quality rendering with advanced lighting, materials, and post-processing.',
    },
    {
      title: 'Delivery',
      description: 'Final assets, revisions, and seamless handoff of your premium CGI content.',
    },
  ];

  return (
    <section id="process" className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-[#05070A] to-[#0D1117]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl lg:text-6xl font-bold text-[#F5F7FA] mb-4">Our Process</h2>
          <div className="w-16 h-1 bg-[#7FDBFF]" />
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Background vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7FDBFF] via-[#7FDBFF]/50 to-transparent" />

          {/* Steps */}
          <div className="space-y-2">
            {steps.map((step, idx) => (
              <ProcessStep
                key={idx}
                number={idx + 1}
                title={step.title}
                description={step.description}
                index={idx}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
