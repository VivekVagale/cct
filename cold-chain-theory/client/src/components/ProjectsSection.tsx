import { motion } from 'framer-motion';

/**
 * Projects Section
 * 
 * Design Philosophy:
 * - Glass cards with hover elevation
 * - Two featured projects: "Bike Free Falling" and "Jet Shot"
 * - Premium hover animations
 * - Room for future projects
 */

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  index: number;
}

function ProjectCard({ title, description, image, index }: ProjectCardProps) {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl bg-[#0D1117]/60 backdrop-blur-md border border-[#7FDBFF]/20 hover:border-[#7FDBFF]/50 transition-all duration-300"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, margin: '-100px' }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(127, 219, 255, 0.1)' }}
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#7FDBFF]/10 to-[#05070A]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#F5F7FA] mb-2">{title}</h3>
        <p className="text-[#B8C4D6] text-sm mb-4 line-clamp-2">{description}</p>

        {/* View Project Button */}
        <motion.button
          className="inline-flex items-center gap-2 text-[#7FDBFF] font-semibold text-sm hover:gap-3 transition-all duration-200"
          whileHover={{ x: 4 }}
        >
          View Project
          <span>→</span>
        </motion.button>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#7FDBFF]/0 via-[#7FDBFF]/5 to-[#7FDBFF]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}

export function ProjectsSection() {
  const projects = [
    {
      title: 'Bike Free Falling',
      description: 'Cinematic motorcycle CGI with dynamic motion and premium lighting setup.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    },
    {
      title: 'Jet Shot',
      description: 'High-speed automotive CGI capturing motion and luxury aesthetics.',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop',
    },
  ];

  return (
    <section id="projects" className="relative w-full py-16 sm:py-24 bg-[#05070A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl lg:text-6xl font-bold text-[#F5F7FA] mb-4">Featured Projects</h2>
          <div className="w-16 h-1 bg-[#7FDBFF]" />
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {projects.map((project, idx) => (
            <ProjectCard
              key={idx}
              title={project.title}
              description={project.description}
              image={project.image}
              index={idx}
            />
          ))}
        </div>

        {/* Future Projects Placeholder */}
        <motion.div
          className="text-center py-12 px-8 rounded-xl bg-[#0D1117]/40 border border-[#7FDBFF]/10 backdrop-blur-md"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-[#B8C4D6] text-lg">More projects coming soon...</p>
        </motion.div>
      </div>
    </section>
  );
}
