import { useChartStable } from "./chart-context";

/**
 * A numeric axis down the left of a cartesian chart.
 *
 * The vendored set has a `BarYAxis`, but it labels *categories* off the band
 * scale — it is the axis a horizontal bar chart needs. There is no component
 * for the value axis, so this is ours. It lives here beside `chart-size.tsx`
 * rather than in the registry's files, which a re-run of the shadcn add would
 * overwrite.
 *
 * Rendered as a child of BarChart, so it sits inside the group already
 * translated by the margin — x=0 is the plot's left edge and the labels hang
 * off into the margin at negative x. The chart's svg is `overflow-visible`, so
 * nothing clips them.
 *
 * Ticks come from the same scale the grid rows use, at the same count, so a
 * label always lands on a line rather than between two.
 */
export function ChartValueAxis({
  numTicks = 5,
  format,
}: {
  numTicks?: number;
  /** Formats a tick value. Defaults to the raw number. */
  format?: (value: number) => string;
}) {
  const { yScale, innerHeight } = useChartStable();

  if (!yScale) {
    return null;
  }

  const ticks = yScale.ticks(numTicks);

  return (
    <g aria-hidden>
      {/* The rule itself, at a tenth of white. Any heavier and it competes
          with the bars for the eye, which is the opposite of what an axis is
          for — the numbers are the content here, the line only says where
          they are measured from. */}
      <line
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={1}
        x1={0}
        x2={0}
        y1={0}
        y2={innerHeight}
      />

      {ticks.map((tick) => (
        <text
          dy="0.32em"
          fill="#B8C4D6"
          fillOpacity={0.6}
          fontSize={10}
          key={tick}
          style={{ fontVariantNumeric: "tabular-nums" }}
          textAnchor="end"
          x={-10}
          y={yScale(tick)}
        >
          {format ? format(tick) : tick}
        </text>
      ))}
    </g>
  );
}
