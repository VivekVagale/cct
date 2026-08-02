import { useMemo } from "react";
import InfiniteMenu, { type MenuItem } from "@/components/ui/InfiniteMenu";
import { projects } from "@/data/projects";
import { experiences } from "@/data/content";

/**
 * Replaces the scrolling image marquee with a draggable sphere of work.
 *
 * The marquee was a passive strip you could only watch go past; this is
 * something the visitor turns, which suits a studio whose product is motion.
 * Items are the studio's own projects and experiences — not the component's
 * placeholder imagery — and each links to the section it belongs to.
 */
export function WorkShowcase() {
  const items = useMemo<MenuItem[]>(
    () => [
      ...projects.map((p) => ({
        image: p.image,
        link: "#experiences",
        title: p.title,
        description: `${p.vehicle} — ${p.category}`,
      })),
      ...experiences
        .filter((e) => !e.comingSoon)
        .map((e) => ({
          image: e.image,
          link: "#booking",
          title: e.title,
          description: e.description,
        })),
    ],
    [],
  );

  return (
    <section className="relative pointer-events-auto py-24 sm:py-32">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 mb-10">
        <p className="text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-4">Selected Work</p>
        <h2 className="font-display text-4xl sm:text-6xl text-[#F5F7FA] leading-[1.05] max-w-xl">
          Turn it over.
        </h2>
      </div>

      <div className="relative h-[70vh] min-h-[420px] w-full pointer-events-auto">
        <InfiniteMenu items={items} scale={2.2} />
      </div>
    </section>
  );
}
