import type { Project } from '@/data/projects';

/**
 * Static project card — no hover animation library. Border color
 * change on hover is a plain CSS pseudo-class swap, not a transition.
 */
export function ProjectCard({ title, description, image }: Project) {
  return (
    <div className="flex flex-col bg-[#0D1117] border border-white/[0.08] hover:border-[#7FDBFF]/40 rounded-lg overflow-hidden">
      <div className="aspect-[4/3] overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-[#F5F7FA] mb-2">{title}</h3>
        <p className="text-sm text-[#B8C4D6] leading-relaxed line-clamp-2 mb-4 flex-1">
          {description}
        </p>
        <button className="inline-flex items-center gap-2 text-[#7FDBFF] font-semibold text-sm self-start">
          View Project <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
