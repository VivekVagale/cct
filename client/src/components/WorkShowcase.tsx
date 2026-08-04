import { useEffect, useMemo, useRef, useState } from "react";
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
  const sectionRef = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);

  // The sphere's WebGL context is not created until the section is close.
  //
  // It used to exist from first paint, a full viewport below the fold, running
  // its render loop against the same GPU the hero's canvas and the starfield
  // are competing for — during the one part of the page where that competition
  // is most visible. Once created it stays: this defers the cost, it does not
  // tear anything down behind the visitor.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
    // Full-bleed: the sphere is the section, not a panel sitting inside one.
    // The heading floats over it so nothing steals vertical space from the
    // canvas, and stays click-through so it never blocks a drag.
    <section
      ref={sectionRef}
      className="relative h-[100svh] w-full overflow-hidden pointer-events-auto"
    >
      <div className="absolute inset-0">{near && <InfiniteMenu items={items} scale={2.2} />}</div>

      <div className="absolute inset-x-0 top-0 z-10 px-6 sm:px-10 pt-24 sm:pt-28 pointer-events-none">
        <div className="max-w-[1600px] mx-auto">
          <p className="text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-3">Selected Work</p>
          <h2 className="font-display text-4xl sm:text-6xl text-[#F5F7FA] leading-[1.05] max-w-xl">
            Turn it over.
          </h2>
        </div>
      </div>

      <p className="absolute inset-x-0 bottom-8 z-10 text-center text-[10px] tracking-[0.3em] uppercase text-[#B8C4D6]/50 pointer-events-none">
        Drag to explore
      </p>
    </section>
  );
}
