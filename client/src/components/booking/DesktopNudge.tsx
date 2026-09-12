import { useState } from "react";

const DISMISSED_KEY = "cct.desktop-nudge.dismissed";

/**
 * Read through a try/catch because the accessor itself throws in a private
 * window and in a browser set to block site data — not just the read.
 */
function wasDismissed() {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function remember() {
  try {
    window.localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    /* A visitor who cannot be remembered sees it again next time. That is the
       correct failure — the alternative is refusing to dismiss it at all. */
  }
}

/**
 * One line, on the first screen, and gone for good when dismissed.
 *
 * The phone is served a booking form and nothing else, which is right — but it
 * means a visitor arriving from the studio's bio link never sees the film, the
 * work, the process or the numbers unless they are told those exist.
 *
 * Deliberately not an interstitial and deliberately not a redirect. A splash
 * screen in front of a booking form loses the booking, which is the one thing
 * this page exists to take. It is a recommendation the visitor can act on, park
 * or dismiss, placed where a recommendation is acted on — before they start,
 * not in the middle of the request.
 */
export function DesktopNudgeBar({ onSeeTheWork }: { onSeeTheWork: () => void }) {
  const [dismissed, setDismissed] = useState(wasDismissed);
  if (dismissed) return null;

  return (
    <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#7A44E0]/[0.10] px-4 py-2.5">
      <svg
        aria-hidden
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="shrink-0 text-[#C9AEFF]"
      >
        <rect x="2" y="4" width="20" height="13" rx="1.5" />
        <path d="M8 21h8M12 17v4" />
      </svg>
      <p className="flex-1 text-[11.5px] leading-snug text-[#B8C4D6]">
        <span className="font-semibold text-[#F5F7FA]">Best on a desktop.</span>{" "}
        The film, the process and the numbers live there —{" "}
        <button
          type="button"
          onClick={onSeeTheWork}
          className="border-b border-white/30 text-[#F5F7FA] transition-colors duration-300 hover:border-white"
        >
          see the work
        </button>
        .
      </p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          remember();
          setDismissed(true);
        }}
        className="shrink-0 px-1 py-1 text-base leading-none text-[#B8C4D6] transition-colors duration-300 hover:text-[#F5F7FA]"
      >
        &times;
      </button>
    </div>
  );
}

/**
 * The full case, at the foot of the last screen.
 *
 * Where the bar is a line somebody skims on the way in, this is for the reader
 * who has just sent a request and is looking for what happens next. It names
 * what is actually on the other site rather than asserting that it is better —
 * a list of things worth a laptop is an argument; "optimised for desktop" is
 * not.
 */
export function DesktopPitch({ onSeeTheWork }: { onSeeTheWork: () => void }) {
  return (
    <div className="rounded-sm border border-[#9F6EF2]/40 bg-[#7A44E0]/[0.07] p-4">
      <h4 className="font-display text-base text-[#F5F7FA]">
        See it properly on a desktop
      </h4>
      <p className="mt-1.5 text-xs leading-relaxed text-[#B8C4D6]">
        This page carries the booking. Everything that makes the case for it is
        built for a bigger screen, and does not run here.
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {[
          "The opening film — 298 frames, scrubbed as you scroll",
          "The work showcase, turned by hand in 3D",
          "Discovery to delivery, the five stages in full",
          "15.4M views broken down reel by reel, and where they landed",
          "All 64 machines and 296 colourways",
        ].map((line) => (
          <li
            key={line}
            className="flex items-start gap-2.5 text-xs leading-snug text-[#B8C4D6]"
          >
            <span
              aria-hidden
              className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#9F6EF2]"
            />
            {line}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onSeeTheWork}
        className="mt-4 w-full rounded-sm border border-white/[0.14] bg-black/25 px-3 py-2.5 text-left text-[11px] tracking-[0.14em] uppercase text-[#F5F7FA] transition-colors duration-300 hover:border-white/30"
      >
        Load the full site here
      </button>
    </div>
  );
}
