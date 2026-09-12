import { ProjectOptionCard } from "@/components/ProjectOptionCard";
import { projects } from "@/data/content";

/**
 * The nine builds, and the way back into whichever brief one of them opened.
 *
 * Two up on a phone, three on a desktop. A single column gave each card the full
 * width of the form, which at a 4:3 image is most of the screen per option —
 * these carry a sentence of description as well as a title, and that sentence is
 * what makes them comparable, so they want width rather than count.
 *
 * No price on them. See PriceBlock: the figure belongs to the step after this
 * one, and a price list is not what this page is selling.
 */
export function BuildGrid({
  selectedId,
  onSelect,
  briefed,
  summary,
  onEditBrief,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  /** Whether the chosen build asks a brief at all. */
  briefed: boolean;
  /** One line of what was answered in it. */
  summary: string;
  onEditBrief: () => void;
}) {
  return (
    <>
      {/* Same reasoning as the CGI Projects grid: these are that card with a
          selected state, so they need the same column width to hold the same
          title and description. */}
      <div
        role="radiogroup"
        aria-label="Project"
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3"
      >
        {projects.map((project) => (
          <ProjectOptionCard
            key={project.id}
            project={project}
            selected={selectedId === project.id}
            onSelect={() => onSelect(project.id)}
          />
        ))}
      </div>

      {/* The way back into the brief.

          The dialog opens once, on selection, and a client who closes it has no
          other route to what they answered -- the same problem step 01 has,
          answered the same way: echo the choice where it was made, with a
          control that reopens it. */}
      {briefed && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-white/[0.1] bg-white/[0.02] px-4 py-3">
          <p className="text-[11px] leading-relaxed text-[#B8C4D6]">{summary}</p>
          <button
            type="button"
            onClick={onEditBrief}
            className="shrink-0 border-b border-white/30 pb-0.5 text-[11px] uppercase tracking-[0.16em] text-[#F5F7FA] transition-colors duration-300 hover:border-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9F6EF2]"
          >
            Edit build
          </button>
        </div>
      )}
    </>
  );
}
