import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReelStat } from "@/data/reach";

/**
 * Views per reel, ordered by the date it went out.
 *
 * Hand-rolled SVG rather than a charting library: this is four columns, and the
 * bundle already trips vite's 500KB warning without adding one.
 *
 * A column chart, not a line — each reel is a discrete event with a magnitude,
 * and a line between them would imply a continuous signal that was measured in
 * between. There isn't one.
 *
 * Colour is emphasis, not a value ramp: the biggest column takes the accent and
 * the rest sit in the muted step. Shading every column by its own height would
 * encode the value twice — once as height, once as lightness — and spend the
 * only free channel on something the reader can already see.
 *
 * The x-scale is derived from the dates in the data, so handing this more reels
 * widens the axis on its own. Nothing here is pinned to February.
 */

const CHART_H = 200; // plot only; the axis band is laid out below it in the DOM
const MAX_BAR_W = 24; // cap the mark and let the band's leftover be air
const BAR_GAP = 2; // surface-coloured gap between neighbours

const ACCENT = "#F5F7FA";
const MUTED = "#B8C4D6";

/** Y ticks at round numbers, so the axis carries what isn't directly labelled. */
const TICKS = [0, 500_000, 1_000_000, 1_500_000, 2_000_000];
const Y_MAX = 2_000_000;

const tickLabel = (v: number) => (v === 0 ? "0" : v >= 1_000_000 ? `${v / 1_000_000}M` : `${v / 1000}K`);

const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export function ViewsChart({ reels }: { reels: ReelStat[] }) {
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  /*
   * The columns do not animate their own height, and that is deliberate.
   *
   * A staggered grow-in was built twice and pulled both times. A column that
   * starts collapsed has no area, and an element with no area has an
   * intersection ratio of zero no matter where it sits in the viewport — so the
   * observer that is supposed to start the animation never reaches its
   * threshold, and every column stays at nothing. Animating height hit it;
   * scaling hit it too, because the observer measures the transformed box.
   * Moving the trigger to the full-size plot did not fix it either: the
   * callback delivered once at ratio 0 and never fired again, while an observer
   * created by hand on that same element in that same scroll position reported
   * ratio 1.
   *
   * So the marks are always at their true height, and the reveal is a fade and
   * rise on the figure as a whole — the same `whileInView` shape used by every
   * other section here, which works. A chart whose bars are always right is
   * worth more than a staggered entrance that can render an empty plot.
   */
  const ordered = [...reels].sort((a, b) => a.postedAt.localeCompare(b.postedAt));
  const peak = ordered.reduce((best, r, i) => (r.views > ordered[best].views ? i : best), 0);

  return (
    <motion.figure
      className="m-0"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <figcaption
        id={titleId}
        className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-6"
      >
        Peak week — February 2026
      </figcaption>

      {/* Grid, not a fixed-height box. The axis band is a row of its own, so it
          can never be cropped out of a container sized for the plot alone. */}
      <div className="relative flex gap-3 sm:gap-4">
        {/* Y axis. tabular-nums here and nowhere else on the page — these are
            numbers stacked in a column that have to align with each other. */}
        <div
          className="relative shrink-0 text-[10px] text-[#B8C4D6]/60 [font-variant-numeric:tabular-nums]"
          style={{ height: CHART_H }}
          aria-hidden
        >
          {TICKS.map((t) => (
            <span
              key={t}
              className="absolute right-0 -translate-y-1/2 tabular-nums"
              style={{ top: CHART_H - (t / Y_MAX) * CHART_H }}
            >
              {tickLabel(t)}
            </span>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative" style={{ height: CHART_H }}>
            {/* Hairline gridlines, solid and one step off the surface. Dashes
                would read as a threshold or a projection; this is just a grid. */}
            {TICKS.map((t) => (
              <div
                key={t}
                aria-hidden
                className="absolute inset-x-0 h-px bg-white/[0.07]"
                style={{ top: CHART_H - (t / Y_MAX) * CHART_H }}
              />
            ))}

            {/* One pointer handler for the whole plot, resolving the column
                from the pointer's x rather than from which element it entered.

                The pointer only has to be somewhere in the band — never on the
                mark, which at 24px wide is a pinpoint — and there is no
                enter/leave ordering between neighbours to get wrong. Focus is
                still per-button, because the keyboard genuinely does move
                between discrete controls. */}
            <div
              className="absolute inset-0 flex items-end"
              onPointerMove={(e) => {
                const { left, width } = e.currentTarget.getBoundingClientRect();
                const band = Math.floor(((e.clientX - left) / width) * ordered.length);
                setActive(Math.min(Math.max(band, 0), ordered.length - 1));
              }}
              onPointerLeave={() => setActive(null)}
            >
              {ordered.map((reel, i) => {
                const h = (reel.views / Y_MAX) * CHART_H;
                const isPeak = i === peak;
                const isActive = active === i;
                return (
                  <button
                    key={reel.postedAt}
                    type="button"
                    // The band is the hit target, not the painted column — a
                    // 24px mark is a pinpoint to land on. Full height and full
                    // band width, so the pointer only has to be in the
                    // neighbourhood.
                    className="group relative flex h-full flex-1 cursor-pointer flex-col justify-end bg-transparent focus:outline-none"
                    style={{ paddingInline: BAR_GAP / 2 }}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive((v) => (v === i ? null : v))}
                    aria-describedby={titleId}
                    aria-label={`${reel.vehicle} ${reel.title}, posted ${dayLabel(
                      reel.postedAt,
                    )}: ${reel.viewsLabel} views, ${reel.likes} likes, ${reel.shares} shares`}
                  >
                    <span
                      aria-hidden
                      className="mx-auto block w-full origin-bottom rounded-t-[4px]"
                      style={{
                        height: h,
                        maxWidth: MAX_BAR_W,
                        // Square at the baseline, 4px round at the data end —
                        // the rounding belongs to the value, not to the axis.
                        background: isPeak ? ACCENT : MUTED,
                        opacity: isPeak ? 1 : isActive ? 0.85 : 0.55,
                        // The mark visibly answers the pointer.
                        filter: isActive ? "brightness(1.15)" : undefined,
                        transition: "opacity 0.2s ease, filter 0.2s ease",
                      }}
                    />
                    {/* Focus ring on the mark rather than the whole band, so
                        keyboard focus points at the column it selected. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto rounded-t-[4px] ring-white/70 transition-[box-shadow] group-focus-visible:ring-2"
                      style={{ maxWidth: MAX_BAR_W, height: h }}
                    />
                  </button>
                );
              })}
            </div>

            {/* The one direct label: the peak, on its cap. A number over every
                column is noise and goes unread — the axis and the tooltip carry
                the other three. */}
            <span
              aria-hidden
              className="pointer-events-none absolute text-xs font-medium text-[#F5F7FA] [font-variant-numeric:tabular-nums]"
              style={{
                bottom: (ordered[peak].views / Y_MAX) * CHART_H + 10,
                left: `${((peak + 0.5) / ordered.length) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              {ordered[peak].viewsLabel}
            </span>
          </div>

          {/* X axis, in its own row below the plot. */}
          <div className="mt-3 flex border-t border-white/[0.07] pt-2" aria-hidden>
            {ordered.map((reel) => (
              <span
                key={reel.postedAt}
                className="flex-1 text-center text-[10px] text-[#B8C4D6]/60"
              >
                {dayLabel(reel.postedAt)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Readout. Value first, name second: the reader already knows which
          column they are pointing at and wants the number. Reserves its row so
          the layout does not jump as it appears. */}
      <div className="mt-5 min-h-[2.5rem] sm:min-h-[1.75rem]" aria-hidden>
        {active !== null && (
          <p className="text-xs text-[#B8C4D6]">
            <span className="text-sm font-medium text-[#F5F7FA] [font-variant-numeric:tabular-nums]">
              {ordered[active].viewsLabel} views
            </span>
            {"  ·  "}
            {ordered[active].vehicle} {ordered[active].title}
            {"  ·  "}
            {ordered[active].likes} likes · {ordered[active].shares} shares
          </p>
        )}
      </div>
    </motion.figure>
  );
}
