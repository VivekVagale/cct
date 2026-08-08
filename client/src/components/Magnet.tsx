import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";

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
 *
 * It does nothing at all without a cursor to drift toward.
 *
 * A tap is delivered as a mouse event too — a browser synthesises a mousemove
 * at the touch point before the click — so on a phone this fired once, pulled
 * the button a fifth of the way toward wherever the thumb landed, and stopped.
 * The move that puts it back is `mouseleave`, and a finger never leaves: it
 * lifts. So the button simply stayed off-centre from the first tap onward,
 * which is what "it isn't in the centre after clicking, before it's fine"
 * describes. Both of the site's primary buttons are wrapped in this.
 */
export function Magnet({ children, padding = 80, strength = 4, className }: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("translate3d(0px, 0px, 0)");
  const [transition, setTransition] = useState("transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)");
  const [hasCursor, setHasCursor] = useState(
    () => typeof window === "undefined" || !window.matchMedia("(pointer: coarse)").matches,
  );

  useEffect(() => {
    const mql = window.matchMedia("(pointer: coarse)");
    const sync = () => setHasCursor(!mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

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

  /* Same box, no handlers and no transform — so the button a thumb is aiming at
     is exactly where it was drawn, and stays there. */
  if (!hasCursor) {
    return (
      <div ref={ref} className={className} style={{ display: "inline-block" }}>
        {children}
      </div>
    );
  }

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
