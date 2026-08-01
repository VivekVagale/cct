import { useRef, useState, type ReactNode, type MouseEvent as ReactMouseEvent } from "react";

interface MagnetProps {
  children: ReactNode;
  padding?: number;
  strength?: number;
  className?: string;
}

/**
 * Wraps an element (typically a button) so it drifts slightly toward
 * the cursor when the pointer comes within `padding` pixels, and
 * eases back to rest when the cursor leaves.
 */
export function Magnet({ children, padding = 80, strength = 4, className }: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("translate3d(0px, 0px, 0)");
  const [transition, setTransition] = useState("transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)");

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const reach = Math.max(rect.width, rect.height) / 2 + padding;

    if (dist < reach) {
      setTransition("transform 0.3s ease-out");
      setTransform(`translate3d(${dx / strength}px, ${dy / strength}px, 0)`);
    }
  };

  const handleMouseLeave = () => {
    setTransition("transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)");
    setTransform("translate3d(0px, 0px, 0)");
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ willChange: "transform", transform, transition, display: "inline-block" }}
    >
      {children}
    </div>
  );
}
