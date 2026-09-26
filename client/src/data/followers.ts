/**
 * Who follows the account, transcribed from Instagram's "Follower insights"
 * export (Edits, 27 Jun – 25 Sep 2026, 90 days).
 *
 * Not the same measurement as `audience.ts`. That file is where the reels were
 * *watched*; this is who *follows*. The two disagree at the edges (Nepal is
 * third for views and absent here) and that is expected, so they are kept in
 * separate files and printed under separate headings rather than merged.
 *
 * Percentages are exactly as Instagram printed them. They are not renormalised:
 * the age buckets sum to 100.0, the top-five lists do not and are not meant to.
 */

export const followerWindow = {
  label: "Followers · 27 Jun – 25 Sep 2026",
  capturedAt: "2026-09-25",
  total: 4002,
};

export const followerGender = { men: 94.7, women: 5.3 };

export const followerAges: { range: string; share: number }[] = [
  { range: "13–17", share: 11.3 },
  { range: "18–24", share: 40.2 },
  { range: "25–34", share: 35.7 },
  { range: "35–44", share: 8.9 },
  { range: "45–54", share: 2.6 },
  { range: "55–64", share: 0.8 },
  { range: "65+", share: 0.5 },
];

/** 18–34, the bracket the section leads on. Summed here, not typed. */
export const coreAgeShare = followerAges
  .filter((a) => a.range === "18–24" || a.range === "25–34")
  .reduce((sum, a) => sum + a.share, 0);

/** Instagram's top five only. */
export const followerCities: { city: string; share: number }[] = [
  { city: "Bangalore", share: 19.2 },
  { city: "Chennai", share: 12.0 },
  { city: "Mumbai", share: 5.7 },
  { city: "Delhi", share: 5.3 },
  { city: "Pune", share: 4.7 },
];

/** Instagram's top five only. */
export const followerCountries: { country: string; share: number }[] = [
  { country: "India", share: 92.8 },
  { country: "Brazil", share: 1.4 },
  { country: "Colombia", share: 0.5 },
  { country: "United Arab Emirates", share: 0.4 },
  { country: "Morocco", share: 0.4 },
];
