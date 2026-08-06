import { useEffect, useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import type { ReelStat } from "@/data/reach";
import { BarChart } from "@/components/charts/bar-chart";
import { Bar } from "@/components/charts/bar";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { ChartValueAxis } from "@/components/charts/chart-value-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { useChartHover, useChartStable } from "@/components/charts/chart-context";

/** 0, 500K, 1M, 1.5M, 2M — the axis has to fit in the margin beside a chart. */
const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/**
 * Lets the reel list beside the chart drive the chart's hover.
 *
 * The chart derives its hovered bar from `tooltipData`, so there is nothing to
 * set but that — and setting it is what makes the highlight and the tooltip
 * arrive together rather than the list producing a different, lesser version
 * of hovering. The geometry mirrors the chart's own pointer handler: band
 * position for the group, one x per series across the group, one y per series
 * from the value scale.
 *
 * It renders nothing. It is a child only because that is what puts it inside
 * the chart's provider.
 */
function ListHoverBridge({
  index,
  xDataKey,
}: {
  index: number | null;
  xDataKey: string;
}) {
  const { data, barScale, bandWidth, yScale, lines, innerHeight } =
    useChartStable();
  const { setTooltipData } = useChartHover();

  useEffect(() => {
    if (index === null) {
      setTooltipData(null);
      return;
    }

    const point = data[index];
    if (!(point && barScale && bandWidth)) {
      return;
    }

    const barPos = barScale(String(point[xDataKey]));
    if (barPos === undefined) {
      return;
    }

    // 4px is the chart's own hardcoded gap between grouped series, and the
    // value the Bars below are given. Both have to agree or the tooltip's
    // marker sits beside the bar it belongs to.
    const groupGap = lines.length > 1 ? 4 : 0;
    const barWidth =
      lines.length > 0
        ? (bandWidth - groupGap * (lines.length - 1)) / lines.length
        : bandWidth;

    const yPositions: Record<string, number> = {};
    const xPositions: Record<string, number> = {};

    lines.forEach((line, i) => {
      const value = point[line.dataKey];
      if (typeof value !== "number") {
        return;
      }
      yPositions[line.dataKey] = yScale(value) ?? innerHeight;
      xPositions[line.dataKey] = barPos + i * (barWidth + groupGap) + barWidth / 2;
    });

    setTooltipData({
      point,
      index,
      x: barPos + bandWidth / 2,
      yPositions,
      xPositions,
    });
  }, [
    index,
    data,
    barScale,
    bandWidth,
    yScale,
    lines,
    innerHeight,
    xDataKey,
    setTooltipData,
  ]);

  return null;
}

/**
 * Views and likes per reel, ordered by the date it went out.
 *
 * Two series rather than one because they answer different questions: views is
 * how far a reel travelled, likes is what it did to the people it reached. The
 * second sits at roughly a seventh of the first on the same axis, which is the
 * point — the proportion is legible without a second scale that would let the
 * two be read as comparable magnitudes.
 *
 * Ordered by date, not by size. These four landed inside nine days, and sorting
 * them by height would hide that. The table beside the chart in About is sorted
 * by views for anyone who wants the ranking.
 */
export function ReelsBarChart({
  reels,
  /** Title of the reel the list beside the chart is hovering, if any. */
  hoveredTitle = null,
}: {
  reels: ReelStat[];
  hoveredTitle?: string | null;
}) {
  const reduceMotion = useReducedMotion();

  const chartData = useMemo(
    () =>
      [...reels]
        .sort((a, b) => a.postedAt.localeCompare(b.postedAt))
        .map((reel) => ({
          reel: reel.title,
          views: reel.views,
          likes: reel.likesValue,
        })),
    [reels],
  );

  const hoveredIndex = useMemo(() => {
    if (!hoveredTitle) {
      return null;
    }
    const i = chartData.findIndex((d) => d.reel === hoveredTitle);
    return i === -1 ? null : i;
  }, [chartData, hoveredTitle]);

  return (
    <BarChart
      data={chartData}
      xDataKey="reel"
      // Zero rather than a shorter duration: the bars grow from nothing, and a
      // fast grow is still motion someone asked not to see.
      animationDuration={reduceMotion ? 0 : 1100}
      animationEasing="cubic-bezier(0.85, 0, 0.15, 1)"
      barGap={0.2}
      aspectRatio="16 / 9"
      // Wider on the left than the default 40 so "1.5M" clears the plot.
      margin={{ left: 56 }}
    >
      <Grid horizontal />
      <ChartValueAxis format={(value) => compact.format(value)} />
      {/* Two ends of the violet ramp rather than two neighbours on it: the
          likes bar sits at about a seventh of the views bar, and adjacent
          steps would leave the short one reading as a shadow of the tall one
          instead of a series in its own right. */}
      <Bar
        dataKey="views"
        lineCap="round"
        fill="var(--chart-4)"
        fadedOpacity={0.3}
        groupGap={4}
      />
      <Bar
        dataKey="likes"
        lineCap="round"
        fill="var(--chart-1)"
        fadedOpacity={0.3}
        groupGap={4}
      />
      <BarXAxis />
      <ChartTooltip showCrosshair={false} />
      <ListHoverBridge index={hoveredIndex} xDataKey="reel" />
    </BarChart>
  );
}

/**
 * Which colour is which.
 *
 * Two series means a legend is not optional: without one the only thing saying
 * that the tall bar is views and the short one is likes is the tooltip, which
 * requires a pointer and says nothing to anyone reading the chart from across
 * the room.
 *
 * The swatch carries the colour and the label wears the page's ordinary muted
 * ink rather than the series colour. Colouring the text to match is the common
 * version and it is wrong twice over: it puts two encodings on one meaning, and
 * it fails the moment the palette goes near the background — --chart-1 is a
 * pale violet that would be a whisper as type on this page.
 *
 * Small, low and centred under the plot, so it reads as a caption rather than
 * as a second thing to look at.
 */
export function ReelsChartLegend() {
  const series = [
    { label: "Views", fill: "var(--chart-4)" },
    { label: "Likes", fill: "var(--chart-1)" },
  ];

  return (
    <ul className="mt-5 flex items-center justify-center gap-6">
      {series.map((s) => (
        <li key={s.label} className="flex items-center gap-2">
          {/* A rounded bar rather than a dot: the legend should show the mark
              the chart actually draws. */}
          <span
            aria-hidden
            className="block h-2 w-4 rounded-full"
            style={{ background: s.fill }}
          />
          <span className="text-[10px] sm:text-xs tracking-[0.18em] uppercase text-[#B8C4D6]">
            {s.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
