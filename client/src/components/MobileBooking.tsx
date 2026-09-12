import { useEffect } from "react";
import { BookingWizard } from "@/components/BookingWizard";
import { useAppShellViewport } from "@/hooks/useAppShellViewport";

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
  /* Holds the document still and reports how much of it the keyboard has left.
     Most of this site's phone traffic comes through Instagram's in-app browser,
     which is a WKWebView — see the hook for why that needs the older lock. */
  const shellHeight = useAppShellViewport();

  /*
   * Black all the way out to the edges of the browser.
   *
   * The shell below paints its own black and covers the viewport, which is
   * enough right up until the two places it is not: a rubber-band overscroll,
   * where iOS reveals the document's background behind the page, and the
   * browser's own chrome, which takes its colour from the theme-color meta. Both
   * would have shown #05070A — the ground the starfield was tuned against, and
   * now the ground of nothing — as a faintly blue seam around a black page.
   *
   * Restored on unmount rather than assumed, because "Load the full site here"
   * swaps this tree for the desktop one in place, and that one wants its own
   * ground back.
   */
  useEffect(() => {
    const root = document.documentElement;
    const meta = document.querySelector('meta[name="theme-color"]');
    const previousRoot = root.style.backgroundColor;
    const previousBody = document.body.style.backgroundColor;
    const previousTheme = meta?.getAttribute("content") ?? null;

    root.style.backgroundColor = "#000";
    document.body.style.backgroundColor = "#000";
    meta?.setAttribute("content", "#000000");

    return () => {
      root.style.backgroundColor = previousRoot;
      document.body.style.backgroundColor = previousBody;
      if (previousTheme !== null) meta?.setAttribute("content", previousTheme);
    };
  }, []);

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
      /* The visual viewport where it can be measured, a CSS height where it
         cannot. dvh answers the browser's own chrome and says nothing about the
         keyboard, which is the one that hides the submit button. */
      style={shellHeight !== null ? { height: shellHeight } : { height: "100dvh" }}
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
