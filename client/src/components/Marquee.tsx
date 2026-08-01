import { useEffect, useRef, useState } from "react";
import { projects } from "@/data/projects";
import { experiences } from "@/data/content";

const ROW_1 = [...projects.map((p) => p.image), ...experiences.slice(0, 4).map((e) => e.image)];
const ROW_2 = [...experiences.slice(3).map((e) => e.image), ...projects.slice(1).map((p) => p.image)];

function repeat<T>(arr: T[], times: number): T[] {
  return Array.from({ length: times }, () => arr).flat();
}

export function Marquee() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const raw = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
      setOffset(raw);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const row1 = repeat(ROW_1, 3);
  const row2 = repeat(ROW_2, 3);

  return (
    <section ref={sectionRef} className="relative pointer-events-none overflow-hidden py-16 sm:py-20">
      <div className="flex flex-col gap-3">
        <div
          className="flex gap-3"
          style={{ transform: `translateX(${offset - 200}px)`, willChange: "transform" }}
        >
          {row1.map((src, i) => (
            <img
              key={i}
              src={src}
              loading="lazy"
              alt=""
              className="w-[280px] sm:w-[360px] md:w-[420px] h-[180px] sm:h-[230px] md:h-[270px] object-cover rounded-2xl flex-shrink-0 opacity-80"
            />
          ))}
        </div>
        <div
          className="flex gap-3"
          style={{ transform: `translateX(${-(offset - 200)}px)`, willChange: "transform" }}
        >
          {row2.map((src, i) => (
            <img
              key={i}
              src={src}
              loading="lazy"
              alt=""
              className="w-[280px] sm:w-[360px] md:w-[420px] h-[180px] sm:h-[230px] md:h-[270px] object-cover rounded-2xl flex-shrink-0 opacity-80"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
