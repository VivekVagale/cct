import { useEffect, useMemo, useRef, useState } from "react";
import InfiniteMenu, { type MenuItem } from "@/components/ui/InfiniteMenu";
import { showcaseItems } from "@/data/showcase";
import { FoldHeading } from "@/components/FoldHeading";

/**
 * Replaces the scrolling image marquee with a draggable sphere of work.
 *
 * The marquee was a passive strip you could only watch go past; this is
 * something the visitor turns, which suits a studio whose product is motion.
 *
 * Every disc is a real frame from the studio's own work. It used to be five
 * showcase entries topped up with three borrowed from `projects`, because five
 * did not fill a twelve-disc sphere — and all eight were Unsplash photographs
 * of other people's motorcycles, on the section called Selected Work, for a
 * studio selling CAD-accurate rendering. `showcaseItems` is twelve renders now
 * and there is nothing left to pad with.
 */
/**
 * Phones get a nearer camera. `scale` is a camera-distance multiplier, so the
 * desktop's 2.2 pulls back far enough to hold a wide arc of discs — on a narrow
 * viewport that same framing renders each disc too small to read as a project.
 */
const NARROW_QUERY = "(max-width: 640px)";

export function WorkShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia(NARROW_QUERY).matches,
  );

  // Read on mount and followed live, so a rotate re-frames the sphere. Safe as
  // state: this changes on resize, not on every scroll tick.
  useEffect(() => {
    const mql = window.matchMedia(NARROW_QUERY);
    const sync = () => setNarrow(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

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
    () =>
      showcaseItems.map((p) => ({
        image: p.image,
        link: "#projects",
        title: p.title,
        // The vehicle only when it is actually known — see data/showcase.ts.
        description: p.vehicle ? `${p.vehicle} — ${p.category}` : p.category,
        focusY: p.focusY,
      })),
    [],
  );

  return (
    // Full-bleed: the sphere is the section, not a panel sitting inside one.
    // The heading floats over it so nothing steals vertical space from the
    // canvas, and stays click-through so it never blocks a drag.
    // Shorter than a viewport on phones. At a full 100svh the sphere was the
    // entire screen for the whole section, which left a reader mid-section with
    // nothing on screen to tell them the page continued past it. Leaving a strip
    // of the sections either side keeps it a panel you scroll through rather
    // than a screen you land in.
    <section
      ref={sectionRef}
      className="relative h-[74svh] sm:h-[100svh] w-full overflow-hidden pointer-events-auto"
    >
      <div className="absolute inset-0">
        {near && <InfiniteMenu items={items} scale={narrow ? 1.5 : 2.2} />}
      </div>

      <div className="absolute inset-x-0 top-0 z-10 px-6 sm:px-10 pt-20 sm:pt-28 pointer-events-none">
        <div className="max-w-[1600px] mx-auto">
          <p className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-2 sm:mb-3">
            Selected Work
          </p>
          <h2 className="font-display text-3xl sm:text-6xl text-[#F5F7FA] leading-[1.05] max-w-xl">
            <FoldHeading text="Turn it over." />
          </h2>
        </div>
      </div>

      {/* The gesture differs by input: a mouse drags in any direction, a finger
          only has the horizontal axis here because the vertical one belongs to
          the page. Naming the wrong one is worse than naming none. */}
      <p className="absolute inset-x-0 bottom-6 sm:bottom-8 z-10 text-center text-[10px] tracking-[0.3em] uppercase text-[#B8C4D6]/50 pointer-events-none">
        <span className="sm:hidden">Swipe sideways to explore</span>
        <span className="hidden sm:inline">Drag to explore</span>
      </p>
    </section>
  );
}
