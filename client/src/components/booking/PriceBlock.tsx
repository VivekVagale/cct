/**
 * The price, and when it is due.
 *
 * Said on its own step rather than on the build cards: it depends on the build
 * the visitor has just chosen, and a figure on every card would be a price list
 * on a page that is selling a conversation. A build with no fixed price says so
 * — the form never invents one.
 *
 * The second paragraph is the part that matters legally and practically.
 * Nothing is taken on this page: the form sends a request, the studio comes back
 * on WhatsApp or Instagram, and payment happens in that conversation before any
 * work starts. A visitor who reads a number without that sentence reasonably
 * assumes they are about to be charged.
 *
 * It follows the build now instead of closing the form. The number is the thing
 * people came to find out, and it was at the bottom of the longest section on
 * the site, several screens below the choice it prices.
 *
 * `compact` is the phone's version. A whole wizard screen for one figure was a
 * step the visitor had to press through to learn a number, so on the phone the
 * price sits at the foot of the description step instead — a line of small
 * print under the field, not a headline. The two sentences stay: the figure
 * without "nothing is charged here" still reads as a charge.
 */
export function PriceBlock({
  price,
  compact,
}: {
  price?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="rounded-sm border border-white/[0.1] bg-white/[0.02] p-4">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[10px] tracking-[0.24em] uppercase text-[#B8C4D6]">
            Cost estimate
          </p>
          <p
            className={
              price
                ? "font-display text-2xl leading-none tracking-tight text-[#F5F7FA]"
                : "font-display text-base text-[#F5F7FA]"
            }
          >
            {price ?? "Quoted after we talk"}
          </p>
        </div>
        <p className="mt-2 text-xs text-[#B8C4D6] leading-relaxed">
          Nothing is charged here — we settle it with you on WhatsApp or
          Instagram before work starts. Every job goes out as a collab post on
          your handle.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      {/* Labelled as an estimate, in the label rather than in a footnote. The
          figure is what the build usually costs; what it finally costs is
          settled in the conversation that follows, and calling it a total
          without saying "estimate" invites someone to treat it as a quote they
          have been given. */}
      <p className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-2">
        Total project cost estimate
      </p>
      {/* Two sizes, because this one element renders two different kinds of
          thing. A figure is five glyphs and wants to be the largest thing on the
          step — it was getting skimmed past at the size the sentence needed.
          "Quoted after we talk" is a sentence, and at display size it wraps to
          three lines inside max-w-md and reads as a headline the studio never
          wrote. leading-none because a single line of 72px type does not need
          the 1.5 line box that comes with it. */}
      <p
        className={
          price
            ? "font-display text-6xl sm:text-7xl leading-none tracking-tight text-[#F5F7FA]"
            : "font-display text-2xl sm:text-3xl text-[#F5F7FA]"
        }
      >
        {price ?? "Quoted after we talk"}
      </p>
      <p className="mt-3 text-sm text-[#B8C4D6] leading-relaxed">
        Nothing is charged here. We&rsquo;ll reach out on WhatsApp or Instagram
        to talk the build through, and payment happens then — work starts once
        it&rsquo;s done.
      </p>
      {/* Stated, not offered.

          This was a toggle, defaulting to off, because the collab used to be
          charged for and was the client's to opt into. It is included on every
          job now — the studio wants the work in its own feed as much as the
          client wants it in theirs, and the reach the About section argues from
          only holds if it keeps landing there. A free inclusion drawn as a
          checkbox invites someone to consider opting out of the one thing you
          want them to say yes to. */}
      <p className="mt-5 text-sm text-[#B8C4D6] leading-relaxed">
        Every job goes out as a collab post on your handle — the reel lands in
        both feeds at once, in front of both sets of followers.
      </p>
    </div>
  );
}
