import { useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useParallax } from "@/components/Reveal";
import { Mascot } from "@/components/Mascot";
import { AnimatedText } from "@/components/AnimatedText";
import { StatCounter } from "@/components/StatCounter";
import { ReelsBarChart, ReelsChartLegend } from "@/components/ReelsBarChart";
import { AudienceMap } from "@/components/AudienceMap";
import { headline, reachStats, reachWindow, topReels } from "@/data/reach";
import { audienceTotals, audienceWindow } from "@/data/audience";
import { FoldHeading } from "@/components/FoldHeading";
import { useScene } from "@/components/SceneDeck";

/**
 * What the studio is, argued with what the work did rather than with adjectives.
 *
 * This replaced three sentences of studio philosophy — precision, craftsmanship,
 * fewer projects held to a higher standard. All true, and indistinguishable from
 * what every other studio's About section claims, because assertions of quality
 * cost nothing to make.
 *
 * The lead is the ratio, not the view count: 3.6K followers against 9.9M views
 * says the work travelled without an audience behind it, which is the thing a
 * client is actually buying. 9.9M on its own would just look like a big account.
 *
 * The reel list under the chart is the chart's table view, not a repeat of it.
 * Every value the tooltip shows is also written there, so no number on this page
 * is reachable only by hovering.
 */
export function About() {
  /*
   * Which row of each table the pointer is on, held here because the chart and
   * its table are siblings. Both charts take it as a prop and set their own
   * hover from it, so a row and the shape it names highlight together — the
   * table stops being a static copy of the chart and starts being a way to
   * read it.
   *
   * Focus counts as well as hover: the rows are reachable with a keyboard, and
   * a link that only works for a pointer is a link half the visitors do not
   * have.
   */
  const [hoveredReel, setHoveredReel] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  /*
   * Hovering a row re-renders this whole section — two charts, a map of ~180
   * shapes, five counters and two tables — because the highlight is state held
   * here so the row and the shape it names light together.
   *
   * That is the right structure and the wrong priority. Marked as a transition,
   * React is free to finish the frame the visitor is scrolling in before it
   * repaints the map, instead of holding the scroll while it does. The
   * highlight lands a frame or two later, which nobody can see; the stutter it
   * used to cause, they could.
   */
  const [, startHighlight] = useTransition();
  const hoverReel = (v: string | null) => startHighlight(() => setHoveredReel(v));
  const hoverCountry = (v: string | null) =>
    startHighlight(() => setHoveredCountry(v));

  /*
   * Depth, from two layers moving at different rates.
   *
   * The mascot lags the page as it passes, so it sits behind the copy beside
   * it rather than on the same flat plane. Small on purpose: past about 120px
   * the parallax stops reading as depth and starts reading as the element being
   * in the wrong place.
   */
  const aboutMascotRef = useRef<HTMLDivElement>(null);
  const aboutMascotY = useParallax(aboutMascotRef, 70);

  /*
   * The page's entrance, as props, and nothing at all once the scene has been
   * read.
   *
   * These two headings were the last pair on the page still writing an
   * `initial`/`whileInView` out by hand. Everything else routes through Reveal
   * or the deck's own staging, both of which know about `settled` — so on the
   * way back up this section every element held its position except these two,
   * which dropped 20 and 30 pixels and faded themselves in again.
   */
  const { settled } = useScene();
  const entrance = (distance: number) =>
    settled
      ? {}
      : {
          initial: { opacity: 0, y: distance },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.3 },
          transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    /* scroll-mt clears the fixed bar. The nav links are anchors, so without it a
       jump lands the section's own top at y=0 and the bar covers the first line
       of whatever is there — which the mobile menu made reachable in one tap. */
    <section
      id="about"
      className="relative pointer-events-auto py-20 sm:py-32 scroll-mt-16 sm:scroll-mt-20"
    >
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-8">
            <motion.p
              {...entrance(20)}
              className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-6 sm:mb-8"
            >
              About Us
            </motion.p>

            <motion.h2
              /* No framer entrance here any more: `scene-heading` means the
                 deck stages this, and two systems animating one element's
                 transform is what pinned the project cards flat for a whole
                 session. The deck's staging also carries the scroll float,
                 which a hand-written entrance cannot.

                 Two figures and two words, so it is already the longest line
                 on the page — a step under the one-or-two-word headings, and
                 the measure goes with it so it still breaks after the first
                 figure rather than mid-number. */
              className="scene-heading font-display text-5xl sm:text-7xl lg:text-8xl text-[#F5F7FA] leading-[0.98] mb-4 sm:mb-6 max-w-5xl"
            >
              <FoldHeading
                text={`${headline.followers} followers. ${headline.views} views.`}
              />
            </motion.h2>

            <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#B8C4D6]/60 mb-8 sm:mb-10">
              {reachWindow.label}
            </p>

            <AnimatedText
              text="You commission the build, and it goes out from here. Three of the four below were made for someone's own machine — every one a 3D render, none of it filmed."
              className="text-base sm:text-lg text-[#B8C4D6] leading-relaxed max-w-2xl"
            />
          </div>

          {/* Scroll parallax on top of the mascot's own pointer parallax, and
              they do not fight: the pose drifts a few px toward the cursor
              inside its box, this moves the box itself against the page. The
              column lags the copy beside it, which is what puts the two at
              different depths instead of on one flat plane. */}
          <motion.div
            ref={aboutMascotRef}
            style={{ y: aboutMascotY }}
            className="lg:col-span-4 flex justify-center lg:justify-end"
          >
            <Mascot pose="armsCrossed" size="xl" parallax />
          </motion.div>
        </div>

        {/* Engagement, not reach. The follower-to-view ratio above is the reach
            claim and it stands on its own; a second one only invites arithmetic
            against it. */}
        <dl className="mt-14 sm:mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4 border-t border-white/[0.08] pt-10">
          {reachStats.map((stat) => (
            <div key={stat.label}>
              {/* No type-scale class on the figure: the counter lays its digits
                  out against a pixel height, so it reads the breakpoint itself
                  rather than inheriting a size it cannot measure with. */}
              <dd className="font-display text-[#F5F7FA] leading-none mb-2">
                <StatCounter amount={stat.amount} suffix={stat.suffix} />
              </dd>
              <dt className="text-[10px] sm:text-xs tracking-[0.18em] uppercase text-[#B8C4D6]">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>

        <div className="mt-16 sm:mt-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <ReelsBarChart reels={topReels} hoveredTitle={hoveredReel} />
            <ReelsChartLegend />
          </div>

          {/* The chart's table view. Same numbers, reachable without a pointer. */}
          <div className="lg:col-span-5">
            <ul className="divide-y divide-white/[0.08] border-t border-white/[0.08]">
              {[...topReels]
                .sort((a, b) => b.views - a.views)
                .map((reel) => (
                  <li
                    key={reel.title}
                    tabIndex={0}
                    onMouseEnter={() => hoverReel(reel.title)}
                    onMouseLeave={() => hoverReel(null)}
                    onFocus={() => hoverReel(reel.title)}
                    onBlur={() => hoverReel(null)}
                    className="chart-row py-4 px-3 -mx-3 flex items-baseline justify-between gap-4 focus:outline-none"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-[#F5F7FA]">
                        {reel.vehicle} {reel.title}
                      </p>
                      <p className="text-xs text-[#B8C4D6]/70 mt-1">
                        {reel.likes} likes{reel.shares ? ` · ${reel.shares} shares` : ""}
                        {reel.client && <> · for {reel.client}</>}
                      </p>
                    </div>
                    <p className="shrink-0 font-display text-base sm:text-lg text-[#F5F7FA] [font-variant-numeric:tabular-nums]">
                      {reel.viewsLabel}
                    </p>
                  </li>
                ))}
            </ul>

            {/* No forecast. What these reels did is evidence; what the next one
                does is not something a page can promise. */}
            <p className="mt-8 text-sm sm:text-base text-[#B8C4D6] leading-relaxed">
              What your machine does here depends on the work.{" "}
              <a
                href="#booking"
                className="text-[#F5F7FA] border-b border-white/30 hover:border-white transition-colors duration-300"
              >
                What theirs did is on the chart.
              </a>
            </p>

          </div>
        </div>

        {/* Where those views came from. Its own band rather than a third
            column: a world map at a quarter of the width is a blue smudge. */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8">
            <p className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-4">
              {audienceWindow.label}
            </p>
            <h3 className="font-display text-3xl sm:text-6xl text-[#F5F7FA] leading-[1.0] mb-6">
              <FoldHeading text="Where it landed." />
            </h3>
            <AudienceMap hoveredCountry={hoveredCountry} />
          </div>

          {/* The map's table view, same as the chart has one.
              Centred against the map rather than starting at the top of the
              band: the map column carries an eyebrow and a heading above the
              chart, so a list flush to the top of its own column sat a
              heading's height higher than the thing it describes. */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <ul className="divide-y divide-white/[0.08] border-t border-white/[0.08]">
              {audienceTotals.slice(0, 8).map((row) => (
                <li
                  key={row.country}
                  tabIndex={0}
                  onMouseEnter={() => hoverCountry(row.country)}
                  onMouseLeave={() => hoverCountry(null)}
                  onFocus={() => hoverCountry(row.country)}
                  onBlur={() => hoverCountry(null)}
                  className="chart-row py-3 px-3 -mx-3 flex items-baseline justify-between gap-4 focus:outline-none"
                >
                  <span className="text-sm text-[#F5F7FA]">{row.country}</span>
                  <span className="shrink-0 text-sm text-[#B8C4D6] [font-variant-numeric:tabular-nums]">
                    {row.percentOfTotal.toFixed(2)}%
                  </span>
                </li>
              ))}
            </ul>
            {/* Said out loud rather than left for someone to notice the
                column does not reach 100. */}
            <p className="mt-6 text-xs sm:text-sm text-[#B8C4D6]/70 leading-relaxed">
              Share of all tracked views across {audienceWindow.reelCount}{" "}
              reels. Instagram reports only each reel’s top five countries, so
              roughly {audienceWindow.untrackedShare}% of views sit below what
              it will show and are not counted here.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
