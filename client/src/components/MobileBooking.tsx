import { BookingWizard } from "@/components/BookingWizard";

/**
 * What a phone gets: the booking, and a way to the rest.
 *
 * The full site opens on a 298-frame image sequence scrubbed by scroll, behind a
 * curtain that waits for the first 96 of them — about 8MB before anything can be
 * read. Behind that sit a WebGL sphere, a world map, five charts and their
 * geojson, none of which a phone was ever going to enjoy and none of which are
 * part of making a booking. The studio's read was that a phone visitor is there
 * to book, and the numbers agree with them.
 *
 * So this route carries the form and the two things that support it: a bar that
 * says where you are, and a route out to the full site for anyone who wants it.
 * The starfield behind it belongs to the page and is painted by App at both
 * widths — it is the one continuous surface the two layouts share, and dropping
 * it here is what would make them look like different sites.
 */
export function MobileBooking({ onSeeTheWork }: { onSeeTheWork: () => void }) {
  return (
    /* A fixed-height shell, not a tall page.
     *
     * This is what makes the footer a footer. With a min-height the flex column
     * grows to its content, the step's own scroller never becomes the thing
     * that scrolls, and the Next button ends up at the bottom of a
     * four-thousand-pixel document — measured at y=3776 on the first build.
     * Pinned under the thumb is the entire argument for a wizard, so the shell
     * is exactly the viewport and only the step inside it scrolls.
     *
     * h-screen is the fallback and the inline dvh overrides it where supported:
     * 100vh on a phone is the viewport with the browser chrome retracted, so a
     * bar sized to it sits under the address bar until the visitor scrolls.
     *
     * overflow-clip on both axes, and the vertical half is not decoration.
     * The submit button's particle pen is a square at width:200% centred on the
     * button, so on the last step it hangs 103px below a footer that is already
     * at the bottom of the viewport — measured. That made the document taller
     * than the screen and let the whole shell scroll, header and all, which is
     * the one thing a fixed shell exists to prevent. clip rather than hidden so
     * this never becomes a scroll container itself.
     */
    <div
      className="relative z-10 flex h-screen flex-col overflow-clip"
      style={{ height: "100dvh" }}
    >
      {/* Not the full Navigation. That bar carries four section anchors and a
          panel that opens over the viewport, and none of those sections are
          here — a menu whose every item is a dead link is worse than no menu.
          The wordmark and the one link out are what is left of it, at the same
          height, with the same glass. */}
      <header className="shrink-0 border-b border-white/[0.06] bg-[#05070A]/55 backdrop-blur-md">
        <nav className="flex h-16 items-center justify-between gap-3 px-4">
          <span
            className="group relative inline-flex items-center rounded-[14px] px-3 py-1.5"
            style={{
              background: [
                "radial-gradient(115% 95% at 50% 118%, #ffe6fc 0%, #f6b8ff 16%, #c079f2 40%, rgba(150,90,235,0) 72%)",
                "radial-gradient(120% 130% at 50% -20%, #a274f5 0%, #7a44e0 55%, #6c34d8 100%)",
              ].join(","),
              boxShadow: [
                "inset 0 1px 0 rgba(255,255,255,0.75)",
                "inset 0 0 0 1px rgba(226,203,255,0.5)",
                "0 6px 26px rgba(138,74,235,0.5)",
              ].join(","),
            }}
          >
            <span className="font-logo font-medium lowercase text-[13px] tracking-[-0.01em] text-white">
              @coldchaintheory
            </span>
          </span>

          {/* `py-3 -my-3` is hit area, not layout — the same trick the desktop
              nav links use, for the same reason. */}
          <button
            type="button"
            onClick={onSeeTheWork}
            className="block py-3 -my-3 text-[11px] tracking-[0.14em] uppercase text-[#B8C4D6] transition-colors duration-300 hover:text-[#F5F7FA]"
          >
            See the work
          </button>
        </nav>
      </header>

      <BookingWizard onSeeTheWork={onSeeTheWork} />
    </div>
  );
}
