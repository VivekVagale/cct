import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import type { ReelStat } from "@/data/reach";
import { BarChart } from "@/components/charts/bar-chart";
import { Bar } from "@/components/charts/bar";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";

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
export function ReelsBarChart({ reels }: { reels: ReelStat[] }) {
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
    >
      <Grid horizontal />
      <Bar
        dataKey="views"
        lineCap="round"
        fill="var(--chart-1)"
        fadedOpacity={0.3}
        groupGap={4}
      />
      <Bar
        dataKey="likes"
        lineCap="round"
        fill="var(--chart-2)"
        fadedOpacity={0.3}
        groupGap={4}
      />
      <BarXAxis />
      <ChartTooltip showCrosshair={false} />
    </BarChart>
  );
}
