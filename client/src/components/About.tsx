import { useState } from "react";
import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { AnimatedText } from "@/components/AnimatedText";
import { CountUp } from "@/components/CountUp";
import Cubes from "@/components/ui/Cubes";
import { ReelsBarChart } from "@/components/ReelsBarChart";
import { AudienceMap } from "@/components/AudienceMap";
import { headline, reachStats, reachWindow, topReels } from "@/data/reach";
import { audienceShares, audienceWindow } from "@/data/audience";

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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7 }}
              className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-6 sm:mb-8"
            >
              About Us
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-3xl sm:text-6xl lg:text-7xl text-[#F5F7FA] leading-[1.05] mb-4 sm:mb-6 max-w-4xl"
            >
              {headline.followers} followers. {headline.views} views.
            </motion.h2>

            <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#B8C4D6]/60 mb-8 sm:mb-10">
              {reachWindow.label}
            </p>

            <AnimatedText
              text="You commission the build, and it goes out from here. Three of the four below were made for someone's own machine — every one a 3D render, none of it filmed."
              className="text-base sm:text-lg text-[#B8C4D6] leading-relaxed max-w-2xl"
            />
          </div>

          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <Mascot pose="armsCrossed" size="xl" parallax />
          </div>
        </div>

        {/* Engagement, not reach. The follower-to-view ratio above is the reach
            claim and it stands on its own; a second one only invites arithmetic
            against it. */}
        <dl className="mt-14 sm:mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4 border-t border-white/[0.08] pt-10">
          {reachStats.map((stat) => (
            <div key={stat.label}>
              <dd className="font-display text-2xl sm:text-4xl text-[#F5F7FA] leading-none mb-2">
                <CountUp value={stat.value} />
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
          </div>

          {/* The chart's table view. Same numbers, reachable without a pointer. */}
          <div className="lg:col-span-5">
            <ul className="divide-y divide-white/[0.08] border-t border-white/[0.08]">
              {[...topReels]
                .sort((a, b) => b.views - a.views)
                .map((reel) => (
                  <li
                    key={reel.postedAt}
                    tabIndex={0}
                    onMouseEnter={() => setHoveredReel(reel.title)}
                    onMouseLeave={() => setHoveredReel(null)}
                    onFocus={() => setHoveredReel(reel.title)}
                    onBlur={() => setHoveredReel(null)}
                    className="chart-row py-4 px-3 -mx-3 flex items-baseline justify-between gap-4 focus:outline-none"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-[#F5F7FA]">
                        {reel.vehicle} {reel.title}
                      </p>
                      <p className="text-xs text-[#B8C4D6]/70 mt-1">
                        {reel.likes} likes · {reel.shares} shares
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
            <h3 className="font-display text-2xl sm:text-4xl text-[#F5F7FA] leading-[1.05] mb-6">
              Where it landed.
            </h3>
            <AudienceMap hoveredCountry={hoveredCountry} />
          </div>

          {/* The map's table view, same as the chart has one. */}
          <div className="lg:col-span-4">
            {/* Decoration, and only that. It carries no reading of the numbers
                under it, so it is hidden from assistive tech and takes no
                clicks — the ripple-on-click it used to have invited an
                interaction that leads nowhere.

                Full column width rather than the half it sat at beside the
                bar chart: here it heads the country table, and a grid at half
                width above a list at full width reads as a mistake. Desktop
                only, where there is room to spare.

                The pointer reaches it. It used to carry pointer-events-none,
                which killed the tilt-under-the-cursor the grid exists for —
                the cubes only ever ran their idle animation and never
                responded to anything. Hover is back; the click ripple stays
                off, because a click here leads nowhere and an element that
                answers a click is claiming otherwise. */}
            <div
              aria-hidden
              className="hidden lg:block relative mb-10 w-full cubes-fill"
            >
              <Cubes
                gridSize={6}
                maxAngle={45}
                radius={3}
                borderStyle="2px dashed #B497CF"
                faceColor="#1a1a2e"
                rippleColor="#ff6b6b"
                rippleSpeed={1.5}
                autoAnimate
              />
            </div>

            <ul className="divide-y divide-white/[0.08] border-t border-white/[0.08]">
              {audienceShares.slice(0, 8).map((row) => (
                <li
                  key={row.country}
                  tabIndex={0}
                  onMouseEnter={() => setHoveredCountry(row.country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onFocus={() => setHoveredCountry(row.country)}
                  onBlur={() => setHoveredCountry(null)}
                  className="chart-row py-3 px-3 -mx-3 flex items-baseline justify-between gap-4 focus:outline-none"
                >
                  <span className="text-sm text-[#F5F7FA]">{row.country}</span>
                  <span className="shrink-0 text-sm text-[#B8C4D6] [font-variant-numeric:tabular-nums]">
                    {row.share.toFixed(2)}%
                  </span>
                </li>
              ))}
            </ul>
            {/* Said out loud rather than left for someone to notice the
                column does not reach 100. */}
            <p className="mt-6 text-xs sm:text-sm text-[#B8C4D6]/70 leading-relaxed">
              Mean share across {audienceWindow.reelCount} reels. Instagram
              reports only each reel’s top five countries, so{" "}
              {audienceWindow.untrackedShare}% sits below what it will show.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
