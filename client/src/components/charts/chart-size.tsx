import { type ReactNode, type RefObject, useEffect, useState } from "react";

/**
 * Measures a chart's own box and hands its size to the children.
 *
 * Replaces @visx/responsive's ParentSize, which this registry pins at
 * 4.0.1-alpha.0 and which never rendered its children under React 19 — its
 * element measured correctly in the DOM while the render prop stayed at zero,
 * so a chart mounted as an empty box with no error to explain it. Both
 * BarChart and ChoroplethChart already hold a ref to their container, so
 * observing that removes the dependency rather than pinning a different alpha.
 */
export function ChartSize({
  containerRef,
  children,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  children: (size: { width: number; height: number }) => ReactNode;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      setSize((prev) =>
        // Sub-pixel churn from a scrollbar or a zoom would otherwise re-render
        // the whole chart on every observer tick.
        Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1
          ? prev
          : { width, height },
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  return <>{children(size)}</>;
}
