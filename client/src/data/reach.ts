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
  label: "Jan 2026 – Sep 2026",
  capturedAt: "2026-09-26",
};

/** The ratio the section leads on — roughly 4,000 views for every follower. */
export const headline = {
  /* 4,002 on the 25 Sep follower-insights export, up from 3.9K on 12 Sep and
     3.6K before that. */
  followers: "4K",
  /* 16M: the 14.3M of the earlier account export plus 1.127M across the six
     reels added 12 Sep and 541K across the three added 26 Sep (15.968M).
     Still includes the GT 650's 8.1M, about half of everything the account
     has done. */
  views: "16M",
};

/*
 * Read the note above `newReels` before refreshing these.
 *
 * These are a sum of two different kinds of measurement: an account-level
 * export covering Jan–Apr, plus nine individually transcribed reels from
 * Aug–Sep. They are floors, not totals — anything posted between those two
 * periods is not counted here, because no export for it has been supplied.
 */
export const reachStats: ReachStat[] = [
  /* 1.523M + 93.8K across the first six + 49.1K across the next three. */
  { label: "Likes", value: "1.666M", amount: 1.666, suffix: "M" },
  /* Down from the 138K previously on this page. The studio's current export
     says 100K; where they disagree the newer figure wins. Plus 11.6K, plus
     4.1K. */
  { label: "Shares", value: "116K", amount: 116, suffix: "K" },
  /* 52K + 5.3K + 2.1K. */
  { label: "Saves", value: "59K", amount: 59, suffix: "K" },
  /* 21K + 3.5K + 1.7K = 26.2K. */
  { label: "Reposts", value: "26K", amount: 26, suffix: "K" },
  { label: "Reels", value: "46", amount: 46 },
];

/**
 * Reels added one at a time, transcribed from their insight exports: six on
 * 12 Sep 2026, three more on 26 Sep 2026.
 *
 * Kept as data rather than folded silently into the totals above, so the next
 * person to refresh this file can see exactly what was added and to what.
 *
 * **Not in `topReels`, deliberately.** That list is what the chart plots, and
 * the chart is the studio's 1M+ work — the smallest column on it is 1M. The
 * best of these nine is 357K, which would sit at roughly a third of the shortest
 * existing bar and make the argument look weaker than it is. They count toward
 * the totals and stay off the graph.
 *
 * Nothing renders this array today. It exists so the arithmetic above is
 * checkable rather than asserted.
 */
export const newReels = [
  { postedAt: "2026-08-21", title: "One with kalyani", views: 204_000, likes: "20K", comments: 426, reposts: 608, shares: "2.2K", saves: "1K" },
  { postedAt: "2026-08-22", title: "1/1 Pulsar NS 160", views: 357_000, likes: "33K", comments: 456, reposts: 1_300, shares: "3.5K", saves: "1.6K" },
  { postedAt: "2026-08-27", title: "Rate this out of 10", views: 170_000, likes: "7.8K", comments: 307, reposts: 169, shares: "935", saves: "455" },
  { postedAt: "2026-08-30", title: "Bajaj Pulsar N 160", views: 142_000, likes: "10K", comments: 910, reposts: 388, shares: "1.1K", saves: "675" },
  { postedAt: "2026-09-01", title: "COOKED? · NS 400Z", views: 239_000, likes: "22K", comments: 229, reposts: 1_000, shares: "3.7K", saves: "1.5K" },
  { postedAt: "2026-09-03", title: "Duke 390", views: 15_000, likes: "1K", comments: 37, reposts: 28, shares: "136", saves: "41" },
  /* Added 26 Sep 2026, exports downloaded that day. */
  { postedAt: "2026-09-08", title: "Rate its beauty · Free Fall", views: 214_000, likes: "19K", comments: 420, reposts: 563, shares: "1.3K", saves: "968" },
  { postedAt: "2026-09-14", title: "1/1 KTM RC390 · Free Fall", views: 281_000, likes: "27K", comments: 432, reposts: 1_100, shares: "2.6K", saves: "1K" },
  { postedAt: "2026-09-21", title: "Harrier + Interceptor · Free Fall", views: 46_000, likes: "3.1K", comments: 77, reposts: 57, shares: "166", saves: "105" },
] as const;

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
