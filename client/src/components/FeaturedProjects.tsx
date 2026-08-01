import { motion } from "framer-motion";
import { projects } from "@/data/projects";
import { Mascot } from "@/components/Mascot";

export function FeaturedProjects() {
  return (
    <section id="projects" className="relative pointer-events-auto py-32 sm:py-40">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 mb-20 sm:mb-28 flex items-end justify-between gap-8">
        <div>
          <p className="text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-5">
            Selected Work
          </p>
          <h2 className="font-display text-4xl sm:text-6xl text-[#F5F7FA] max-w-xl leading-[1.05]">
            Featured Projects
          </h2>
        </div>
        <Mascot pose="pointing" size="md" className="hidden md:block" />
      </div>

      <div className="relative">
        {projects.map((project, i) => (
          <div
            key={project.id}
            className="sticky top-20 sm:top-24"
            style={{ zIndex: i + 1 }}
          >
            <motion.article
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="mx-4 sm:mx-10 mb-8 bg-[#0D1117] border border-white/[0.06] overflow-hidden group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-5">
                <div className="lg:col-span-3 relative overflow-hidden aspect-[4/3] lg:aspect-auto">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/40 via-transparent to-transparent" />
                </div>
                <div className="lg:col-span-2 p-8 sm:p-12 flex flex-col justify-center">
                  <p className="text-xs tracking-[0.18em] uppercase text-[#B8C4D6] mb-4">
                    {project.category} — {project.year}
                  </p>
                  <h3 className="font-display text-3xl sm:text-4xl text-[#F5F7FA] mb-3">
                    {project.title}
                  </h3>
                  <p className="text-sm text-[#B8C4D6] mb-6">{project.vehicle}</p>
                  <p className="text-sm sm:text-base text-[#B8C4D6] leading-relaxed mb-8">
                    {project.description}
                  </p>
                  <span className="text-xs tracking-[0.14em] uppercase text-[#F5F7FA] border-b border-white/30 self-start pb-1 group-hover:border-white transition-colors duration-300">
                    View Project
                  </span>
                </div>
              </div>
            </motion.article>
          </div>
        ))}
      </div>
    </section>
  );
}
