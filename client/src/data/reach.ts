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
  /** What Instagram reported, as one string. Still the source of truth. */
  value: string;
  /**
   * The same figure split for the odometer: the number it rolls to, and the
   * letter beside it.
   *
   * Split rather than parsed out of `value` at render, because "1.2M" and
   * "138K" do not share a shape and a regex for both is a worse thing to
   * maintain than two fields. The counter cannot roll the letter anyway —
   * spelling 1.2M out as 1,200,000 would be seven digits wide and would claim
   * a precision the export does not have.
   */
  amount: number;
  suffix?: string;
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
  /** Optional: Instagram reports it per reel and not every export carries it. */
  shares?: string;
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
  { label: "Likes", value: "1.2M", amount: 1.2, suffix: "M" },
  { label: "Shares", value: "138K", amount: 138, suffix: "K" },
  { label: "Saves", value: "52K", amount: 52, suffix: "K" },
  { label: "Reposts", value: "21K", amount: 21, suffix: "K" },
  { label: "Reels", value: "37", amount: 37 },
];

/**
 * The four biggest, all inside nine days in February — together 6.2M of the
 * quarter's 9.9M. Three were commissioned work, which is the section's actual
 * argument: this is what a client's own machine did.
 */
export const topReels: ReelStat[] = [
  {
    /*
     * The studio's best-performing reel by a wide margin — 8.1M against 2M for
     * the next one, which is why it leads the table.
     *
     * Two figures here are not from the export and are marked as such rather
     * than guessed quietly. `postedAt` is a placeholder: the chart derives its
     * whole x-scale from these dates, so this column is currently sitting one
     * day after the previous reel and will move once the real date is known.
     * `shares` is simply absent — the table prints likes alone for this row
     * rather than showing a number nobody supplied.
     */
    title: "GT 650 MR Clean",
    vehicle: "Royal Enfield",
    postedAt: "2026-02-17",
    views: 8_100_000,
    viewsLabel: "8.1M",
    likes: "722K",
    likesValue: 722_000,
    client: "@grand_turismo_650",
  },
  {
    title: "Himalayan 450",
    vehicle: "Royal Enfield",
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
