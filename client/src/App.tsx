import { Suspense, lazy, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { MobileBooking } from "./components/MobileBooking";
import { useIsPhoneRoute } from "@/hooks/useIsPhone";

/**
 * The whole story, loaded only where it can be told.
 *
 * Lazy is doing real work here rather than tidying: everything reachable from
 * DesktopSite — the 298-frame hero sequence, three.js and its four @react-three
 * packages, the visx charts and their geojson — is in one chunk that a phone
 * never fetches. Import it eagerly and Vite bundles all of it into the entry
 * whether the branch below renders it or not.
 */
const DesktopSite = lazy(() =>
  import("./components/DesktopSite").then((m) => ({ default: m.DesktopSite })),
);

function App() {
  /*
   * Which of the two sites to serve, decided once.
   *
   * Locked at first paint rather than followed — see useIsPhoneRoute. The two
   * layouts are different React trees, so following a resize would unmount the
   * one being filled in and take every typed field with it.
   */
  const phoneRoute = useIsPhoneRoute();
  /*
   * The way out of the phone route, for the visitor who takes the nudge.
   *
   * A reload with a query string was the other option and is worse: it throws
   * away a part-filled booking to show somebody a film. This swaps the tree in
   * place, which costs the chunk download and nothing else.
   */
  const [forceDesktop, setForceDesktop] = useState(false);
  const showDesktop = !phoneRoute || forceDesktop;

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          {/* True black on the phone, the site's near-black everywhere else.

              #05070A is the ground the starfield is tuned against — it is what
              the stars sit in. With no stars there is nothing for it to be the
              ground of, and on the OLED panel most phones have, #000 is not a
              darker colour so much as pixels that are switched off: less light,
              less power, and a deeper black than the panel can otherwise make. */}
          <div
            className={`relative text-[#F5F7FA] ${
              showDesktop ? "bg-[#05070A]" : "bg-black"
            }`}
          >

            {showDesktop ? (
              /* No spinner. The desktop site opens behind its own curtain — see
                 Preloader — and a second loading state in front of that one
                 would be a flash of grey before a black screen that is already
                 doing this job properly. The starfield is already painted. */
              <Suspense fallback={null}>
                <DesktopSite />
              </Suspense>
            ) : (
              <MobileBooking onSeeTheWork={() => setForceDesktop(true)} />
            )}
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
