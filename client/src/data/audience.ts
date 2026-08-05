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
  /** Mean share of a reel's views, in percent. */
  share: number;
  /** How many of the twenty reels placed this country in their top five. */
  reels: number;
}

/** The window these reels were exported over. Printed on the page. */
export const audienceWindow = {
  label: "20 reels · exported 3 Aug 2026",
  reelCount: 20,
  /** Share unaccounted for, below every reel's visible top five. */
  untrackedShare: 2.1,
};

export const audienceShares: AudienceShare[] = [
  { country: "India", share: 95.66, reels: 20 },
  { country: "Brazil", share: 0.81, reels: 15 },
  { country: "Nepal", share: 0.62, reels: 20 },
  { country: "United Arab Emirates", share: 0.22, reels: 12 },
  { country: "Bangladesh", share: 0.13, reels: 9 },
  { country: "Colombia", share: 0.11, reels: 3 },
  { country: "Saudi Arabia", share: 0.1, reels: 5 },
  { country: "United States of America", share: 0.08, reels: 3 },
  { country: "Pakistan", share: 0.07, reels: 6 },
  { country: "Argentina", share: 0.05, reels: 1 },
  { country: "Indonesia", share: 0.05, reels: 2 },
  { country: "Sri Lanka", share: 0.03, reels: 1 },
  { country: "Morocco", share: 0.02, reels: 1 },
  { country: "Kuwait", share: 0.01, reels: 1 },
  { country: "Serbia", share: 0.01, reels: 1 },
];

const byCountry = new Map(audienceShares.map((a) => [a.country, a]));

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
