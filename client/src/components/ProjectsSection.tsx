import { ProjectCard } from '@/components/ui/ProjectCard';
import { projects } from '@/data/projects';

/**
 * Projects Section — static gallery grid. No animation library.
 */
export function ProjectsSection() {
  return (
    <section id="projects" className="w-full py-24 lg:py-32 bg-[#05070A]/70 relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-16">
          <span className="text-xs font-medium tracking-[0.2em] text-[#B8C4D6] mb-4 block">
            SELECTED WORK
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#F5F7FA]">Featured Projects</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>

        <p className="text-center text-[#B8C4D6] text-sm mt-16">More projects coming soon.</p>
      </div>
    </section>
  );
}
