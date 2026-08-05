/**
 * Instagram performance, transcribed from the account's own insight exports.
 *
 * Everything the About section states about reach comes from here, so refreshing
 * the numbers is a one-file edit rather than a hunt through JSX.
 *
 * Figures are the strings Instagram reported, not derived from raw integers.
 * The export says "2M" and "9.9M"; rendering "2.0M" or "9,900,000" would invent
 * precision the source does not have. `views` carries a number alongside the
 * label purely so the chart has something to measure a column against.
 *
 * Deliberately absent: the "Viewers" figure, at both reel and account level.
 * Instagram counts unique accounts that watched, which is neither followers nor
 * anything the per-reel numbers agree with — the export reports 1.5K viewers on
 * a reel with 1.6M views, against 4.7M viewers for the account overall. Two
 * numbers that contradict each other on the same page cost more than the one
 * they add.
 */

export interface ReachStat {
  label: string;
  value: string;
}

export interface ReelStat {
  title: string;
  vehicle: string;
  /** ISO date. The chart derives its x-scale from these, so it widens by itself
   *  as more reels are added — nothing about the axis is hardcoded to February. */
  postedAt: string;
  /** Column geometry only. Never rendered. */
  views: number;
  /** What Instagram reported, and what the page shows. */
  viewsLabel: string;
  likes: string;
  /** Column geometry only, same as `views`. Never rendered — `likes` is. */
  likesValue: number;
  shares: string;
  /** Set only where the reel's caption credited a commissioning client. */
  client?: string;
}

/**
 * The window the account-level figures cover. Printed on the page: undated
 * metrics read as inflated the moment a reader thinks to ask, and these are
 * already some months behind.
 */
export const reachWindow = {
  label: "90 days · Jan–Apr 2026",
  capturedAt: "2026-08-04",
};

/** The ratio the section leads on — 2,750 views for every follower. */
export const headline = {
  followers: "3.6K",
  views: "9.9M",
};

export const reachStats: ReachStat[] = [
  { label: "Likes", value: "1.2M" },
  { label: "Shares", value: "138K" },
  { label: "Saves", value: "52K" },
  { label: "Reposts", value: "21K" },
  { label: "Reels", value: "37" },
];

/**
 * The four biggest, all inside nine days in February — together 6.2M of the
 * quarter's 9.9M. Three were commissioned work, which is the section's actual
 * argument: this is what a client's own machine did.
 */
export const topReels: ReelStat[] = [
  {
    title: "Flying Superbike",
    vehicle: "Vacuo",
    postedAt: "2026-02-08",
    views: 1_600_000,
    viewsLabel: "1.6M",
    likes: "214K",
    likesValue: 214_000,
    shares: "26K",
  },
  {
    title: "Hunter 350",
    vehicle: "Royal Enfield",
    postedAt: "2026-02-11",
    views: 1_600_000,
    viewsLabel: "1.6M",
    likes: "147K",
    likesValue: 147_000,
    shares: "23K",
    client: "@ruthvik_mayya",
  },
  {
    title: "Continental GT 650",
    vehicle: "Royal Enfield",
    postedAt: "2026-02-14",
    views: 2_000_000,
    viewsLabel: "2M",
    likes: "303K",
    likesValue: 303_000,
    shares: "35K",
    client: "@sravan.k.k",
  },
  {
    title: "Interceptor 650",
    vehicle: "Royal Enfield",
    postedAt: "2026-02-16",
    views: 1_000_000,
    viewsLabel: "1M",
    likes: "137K",
    likesValue: 137_000,
    shares: "16K",
    client: "@jainand.kk",
  },
];
