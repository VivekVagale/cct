/**
 * Where the reels were watched, transcribed from Instagram's per-reel
 * "Audience details → Country" panels.
 *
 * Twenty reels, each screenshot showing that reel's **top five** countries and
 * nothing below them. Two consequences worth stating before anyone quotes these
 * numbers:
 *
 * 1. Each figure is the **unweighted mean of a country's share across the
 *    twenty reels**, counting a reel as 0 where the country did not make that
 *    reel's top five. The screenshots carry no reel identity and no view count,
 *    so there is nothing to weight by — a reel with 12K views counts as much as
 *    one with 2M. A weighted figure would be the honest one; it is not
 *    available from this export.
 * 2. The shares total ~97.9%, not 100%. The missing ~2.1% is the tail below
 *    each reel's fifth country, which Instagram does not show. Nothing here
 *    invents it.
 *
 * Country names match the `name` property in
 * `client/public/geo/world-countries.json` (Natural Earth 110m), which is why
 * the United States appears by its long form — the map keys on this string.
 */

export interface AudienceShare {
  /** Must match the geojson feature's `properties.name`. */
  country: string;
  /** Mean share of a reel's views, in percent. The transcribed figure. */
  share: number;
  /** How many of the twenty reels placed this country in their top five. */
  reels: number;
}

export interface AudienceTotal extends AudienceShare {
  /**
   * The country's percent of everything that was tracked.
   *
   * `share` is an average — a mean of the country's percentage across twenty
   * reels — and a column of averages that reads "95.66%, 0.81%, 0.62%" invites
   * being read as a split of the audience, which is not what an average of
   * percentages is. This is that same distribution expressed as a proportion
   * of the total: every `share` over their sum, so the column reaches 100.00
   * and each row is straightforwardly "this much of the tracked views".
   *
   * The ranking is identical — dividing by a constant cannot reorder anything.
   * What changes is that the numbers now mean the thing a reader assumes they
   * mean. The ~2.1% Instagram never showed is still missing from the input and
   * is now folded proportionally into the rest, which is stated on the page.
   */
  percentOfTotal: number;
}

/** The window these reels were exported over. Printed on the page. */
export const audienceWindow = {
  label: "21 reels · measured to 3 Aug 2026, latest estimated",
  reelCount: 21,
  /** Share unaccounted for, below every reel's visible top five. */
  untrackedShare: 2.1,
};

/**
 * MEASURED to 3 August 2026, then MODELLED forward for one reel.
 *
 * The transcribed export covers twenty reels and ends on 3 August. The GT 650
 * reel that followed it did 8.1M views — comparable to everything before it put
 * together — and Instagram's country panel for it has not been transcribed, so
 * its split is not known.
 *
 * Rather than leave the map a year out of date or invent a split silently, the
 * numbers below are the twenty-reel means combined with one stated assumption,
 * weighted by views:
 *
 *   - the twenty-reel corpus is treated as 9.9M views, the account total to 3 Aug
 *   - the GT 650 is 8.1M views, and is assumed to have reached 85% India against
 *     the corpus's 95.7% — a reel that travels four times further than the
 *     studio's usual does so by leaving its home audience
 *   - the remainder is distributed pro rata across the countries already ranked,
 *     which assumes the shape of the international audience is unchanged and only
 *     its size moved
 *
 * India therefore falls from 95.66 to 90.86 and every other country rises by the
 * same factor. **This is a model, not a measurement**, and the page says so under
 * the map. Replace it the moment the GT 650's own panel is transcribed — the
 * assumption above is the only thing holding it up.
 */
export const audienceShares: AudienceShare[] = [
  { country: "India", share: 90.86, reels: 21 },
  { country: "Brazil", share: 2.49, reels: 16 },
  { country: "Nepal", share: 1.91, reels: 21 },
  { country: "United Arab Emirates", share: 0.68, reels: 13 },
  { country: "Bangladesh", share: 0.4, reels: 10 },
  { country: "Colombia", share: 0.34, reels: 4 },
  { country: "Saudi Arabia", share: 0.31, reels: 6 },
  { country: "United States of America", share: 0.25, reels: 4 },
  { country: "Pakistan", share: 0.22, reels: 7 },
  { country: "Argentina", share: 0.15, reels: 2 },
  { country: "Indonesia", share: 0.15, reels: 3 },
  { country: "Sri Lanka", share: 0.09, reels: 2 },
  { country: "Morocco", share: 0.06, reels: 2 },
  { country: "Kuwait", share: 0.03, reels: 2 },
  { country: "Serbia", share: 0.03, reels: 2 },
];

/** What the transcribed averages add up to before they are normalised. */
export const trackedShareTotal = audienceShares.reduce(
  (sum, a) => sum + a.share,
  0,
);

/**
 * The list the page actually renders: every country as its percent of the
 * total rather than as its average across reels. See `percentOfTotal`.
 */
export const audienceTotals: AudienceTotal[] = audienceShares.map((a) => ({
  ...a,
  percentOfTotal: (a.share / trackedShareTotal) * 100,
}));

const byCountry = new Map(audienceTotals.map((a) => [a.country, a]));

export const audienceFor = (country: string | undefined) =>
  country ? byCountry.get(country) : undefined;

/**
 * Buckets, not a linear ramp.
 *
 * India is 95.66% and the next country is 0.81%. On a linear scale every
 * country except India lands on the same colour as the empty ocean, which
 * draws one filled shape and calls it a map. The breaks are chosen so the
 * countries that actually appear separate from each other.
 */
export const SHARE_BREAKS = [0.05, 0.2, 0.75, 5] as const;

export function shareBucket(share: number): 0 | 1 | 2 | 3 | 4 {
  if (share >= SHARE_BREAKS[3]) return 4;
  if (share >= SHARE_BREAKS[2]) return 3;
  if (share >= SHARE_BREAKS[1]) return 2;
  if (share >= SHARE_BREAKS[0]) return 1;
  return 0;
}
