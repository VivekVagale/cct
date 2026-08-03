import { useEffect, useMemo, useRef } from "react";

/**
 * An isometric grid of cubes that tilt away from the cursor, with ripples that
 * travel outward from a cell.
 *
 * The published version of this component drives its transforms with GSAP.
 * Nothing else here needs GSAP, and a tween engine is a large dependency to add
 * for one decorative grid, so the same behaviour is done with a rAF loop and
 * direct style writes.
 *
 * Nothing is routed through React state. At the default grid size this is 64
 * cubes reacting to every pointer move — as state that is 64 re-renders a
 * frame. Transforms are written straight to the nodes through refs instead, and
 * the component re-renders only when the grid itself changes shape.
 */
export interface CubesProps {
  gridSize?: number;
  maxAngle?: number;
  /** Cell radius the cursor's influence reaches. */
  radius?: number;
  borderStyle?: string;
  faceColor?: string;
  rippleColor?: string;
  /** Multiplier: higher travels outward faster. */
  rippleSpeed?: number;
  autoAnimate?: boolean;
  rippleOnClick?: boolean;
  className?: string;
}

/** Per-cell delay of a ripple front at speed 1, in ms. */
const RIPPLE_STEP_MS = 110;
/** How long a cube holds the ripple colour once the front reaches it. */
const RIPPLE_HOLD_MS = 260;
/** Gap between automatic ripples. */
const AUTO_RIPPLE_MS = 2600;
/**
 * Turning the plane 45° puts its diagonal across the box, so the grid needs
 * √2 ≈ 1.41x the width it is given. Scaling the rotated result back down keeps
 * it inside its container instead of bleeding out of the column; the extra
 * headroom is for the cubes' own depth, which hangs below the plane.
 */
const FIT_SCALE = 0.64;

export default function Cubes({
  gridSize = 8,
  maxAngle = 45,
  radius = 3,
  borderStyle = "1px solid rgba(255,255,255,0.2)",
  faceColor = "#1a1a2e",
  rippleColor = "#ff6b6b",
  rippleSpeed = 1.5,
  autoAnimate = true,
  rippleOnClick = true,
  className,
}: CubesProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cubeRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Pointer position in cell coordinates. Held in a ref so a move does not
  // re-render; null means the pointer is not over the grid.
  const pointer = useRef<{ row: number; col: number } | null>(null);
  const rippleTimers = useRef<number[]>([]);

  const cells = useMemo(
    () =>
      Array.from({ length: gridSize * gridSize }, (_, i) => ({
        row: Math.floor(i / gridSize),
        col: i % gridSize,
      })),
    [gridSize],
  );

  // Tilt. One loop for the whole grid rather than a listener per cube, and it
  // only runs while there is something to settle.
  useEffect(() => {
    let raf = 0;
    let running = true;
    // Current angles, eased toward the target so cubes settle rather than snap.
    const state = cells.map(() => ({ rx: 0, ry: 0, z: 0 }));

    const tick = () => {
      if (!running) return;
      const p = pointer.current;

      for (let i = 0; i < cells.length; i++) {
        const { row, col } = cells[i];
        let tx = 0;
        let ty = 0;
        let tz = 0;

        if (p) {
          const dr = row - p.row;
          const dc = col - p.col;
          const dist = Math.hypot(dr, dc);
          if (dist <= radius) {
            // Falls off to nothing at the radius edge, so there is no ring.
            const falloff = 1 - dist / radius;
            const norm = dist || 1;
            tx = (dr / norm) * maxAngle * falloff;
            ty = (-dc / norm) * maxAngle * falloff;
            tz = falloff * 18;
          }
        }

        const s = state[i];
        s.rx += (tx - s.rx) * 0.14;
        s.ry += (ty - s.ry) * 0.14;
        s.z += (tz - s.z) * 0.14;

        const node = cubeRefs.current[i];
        if (node) {
          node.style.transform = `translateZ(${s.z.toFixed(2)}px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [cells, maxAngle, radius]);

  // Ripples. Each cube is repainted on its own timer, offset by how long the
  // front takes to reach it.
  useEffect(() => {
    const timers = rippleTimers.current;

    const ripple = (row: number, col: number) => {
      for (let i = 0; i < cells.length; i++) {
        const dist = Math.hypot(cells[i].row - row, cells[i].col - col);
        const delay = (dist * RIPPLE_STEP_MS) / Math.max(rippleSpeed, 0.01);
        const on = window.setTimeout(() => {
          const node = cubeRefs.current[i];
          if (node) node.dataset.rippling = "true";
          const off = window.setTimeout(() => {
            const n = cubeRefs.current[i];
            if (n) delete n.dataset.rippling;
          }, RIPPLE_HOLD_MS);
          timers.push(off);
        }, delay);
        timers.push(on);
      }
    };

    const el = wrapRef.current;
    const onClick = (e: MouseEvent) => {
      const p = toCell(e, el, gridSize);
      if (p) ripple(p.row, p.col);
    };
    if (rippleOnClick && el) el.addEventListener("click", onClick);

    let auto = 0;
    if (autoAnimate) {
      auto = window.setInterval(() => {
        ripple(
          Math.floor(Math.random() * gridSize),
          Math.floor(Math.random() * gridSize),
        );
      }, AUTO_RIPPLE_MS);
    }

    return () => {
      if (rippleOnClick && el) el.removeEventListener("click", onClick);
      if (auto) clearInterval(auto);
      timers.forEach(clearTimeout);
      timers.length = 0;
    };
  }, [cells, gridSize, rippleOnClick, rippleSpeed, autoAnimate]);

  // Cube depth has to be half a cell in real pixels — the cells themselves are
  // sized in percentages, which translateZ cannot use.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => {
      const w = el.getBoundingClientRect().width;
      el.style.setProperty("--half", `${w / gridSize / 2}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [gridSize]);

  const pct = 100 / gridSize;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={className}
      style={{ perspective: "1200px", width: "100%", height: "100%" }}
      onPointerMove={(e) => {
        pointer.current = toCell(e.nativeEvent, wrapRef.current, gridSize);
      }}
      onPointerLeave={() => {
        pointer.current = null;
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          // Isometric: the grid is a plane laid down and turned 45°. The scale
          // is listed first so it applies to the rotated result.
          transform: `scale(${FIT_SCALE}) rotateX(58deg) rotateZ(45deg)`,
        }}
      >
        {cells.map((cell, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${cell.col * pct}%`,
              top: `${cell.row * pct}%`,
              width: `${pct}%`,
              height: `${pct}%`,
              transformStyle: "preserve-3d",
            }}
          >
            <div
              ref={(n) => {
                cubeRefs.current[i] = n;
              }}
              className="cubes-cube"
              style={{
                position: "absolute",
                inset: 0,
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
            >
              <Face transform="translateZ(var(--half))" border={borderStyle} face={faceColor} ripple={rippleColor} />
              <Face transform="rotateX(90deg) translateZ(var(--half))" border={borderStyle} face={faceColor} ripple={rippleColor} />
              <Face transform="rotateY(90deg) translateZ(var(--half))" border={borderStyle} face={faceColor} ripple={rippleColor} />
            </div>
          </div>
        ))}
      </div>

      {/* The ripple colour is swapped by a data attribute the loop sets, so a
          ripple costs no React work. */}
      <style>{`
        .cubes-cube > i { transition: background-color 220ms ease-out; }
        .cubes-cube[data-rippling="true"] > i { background-color: var(--cubes-ripple) !important; }
      `}</style>
    </div>
  );
}

function Face({
  transform,
  border,
  face,
  ripple,
}: {
  transform: string;
  border: string;
  face: string;
  ripple: string;
}) {
  return (
    <i
      style={
        {
          position: "absolute",
          inset: 0,
          display: "block",
          transform,
          background: face,
          border,
          boxSizing: "border-box",
          "--cubes-ripple": ripple,
        } as React.CSSProperties
      }
    />
  );
}

function toCell(e: MouseEvent | PointerEvent, el: HTMLElement | null, gridSize: number) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  // The grid is rotated for display only; hit-testing stays in its own
  // untransformed coordinates, which is what the cells are laid out in.
  const col = Math.floor(((e.clientX - r.left) / r.width) * gridSize);
  const row = Math.floor(((e.clientY - r.top) / r.height) * gridSize);
  if (row < 0 || col < 0 || row >= gridSize || col >= gridSize) return null;
  return { row, col };
}
