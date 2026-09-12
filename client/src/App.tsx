import { Suspense, lazy, useEffect, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Galaxy from "./components/ui/Galaxy";
import { MobileBooking } from "./components/MobileBooking";
import { useIsPhone, useIsPhoneRoute } from "@/hooks/useIsPhone";
import { useOverlayOpen } from "@/lib/overlayState";

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

  /*
   * The starfield's opacity, and the reason it lives up here.
   *
   * It belongs to the page rather than to either layout. On the desktop the
   * Hero writes it as its assembly finishes, so the site opens on flat black
   * and the stars arrive with the reveal. The phone has no hero to do that, and
   * a booking form behind a black screen waiting for a reveal that is never
   * coming is not a design — so on that route it is simply up from the start.
   */
  const galaxyOpacity = useMotionValue(0);
  useEffect(() => {
    if (!showDesktop) galaxyOpacity.set(1);
  }, [showDesktop, galaxyOpacity]);

  /* Quality, not routing. This one follows the device: a tablet rotated into a
     wider viewport should get the richer sky, and nothing is lost by giving it
     to them mid-session. */
  const isPhone = useIsPhone();

  /* The sky stops while an overlay is over it, and only on a phone.
     That is where the scrim is opaque — the desktop's is 80% with a blur behind
     it, so the starfield genuinely shows through and stopping it would be a
     visible change rather than a saving. */
  const overlayOpen = useOverlayOpen();

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <div className="relative bg-[#05070A] text-[#F5F7FA]">
            {/* The one thing that does not change between scenes — or between
                layouts. A fixed camera needs a fixed background, and this is
                it: the deck dissolves its scenes in front of a starfield that
                never cuts, and the booking wizard sits on the same one.

                Kept on the phone route deliberately. It is the surface both
                sites share, and a booking form on flat black would read as a
                different product rather than as the same studio.

                The phone gets the same sky drawn as a wallpaper rather than as
                an instrument:

                - Nothing reactive. No pointer to track on a touchscreen anyway,
                  and no listeners bound for one.
                - 60% resolution, which is 36% of the fragments. The shader is
                  four star layers of nine cells for every pixel of every frame,
                  so pixel count is the only lever that divides the cost rather
                  than trimming it. A soft, dark, edgeless image is exactly what
                  survives being upscaled.
                - 30fps rather than 60, halving what is left. Nothing in a
                  slowly rotating starfield moves fast enough to show it.
                - Slower rotation and less twinkle, so what is drawn at half the
                  rate is also asking to move half as much.

                Together that is roughly a fifth of the desktop cost. It still
                runs continuously, which is the thing to watch if the heat ever
                comes back — the next lever is fpsCap, then dropping it below
                the fold entirely. */}
            <motion.div style={{ opacity: galaxyOpacity }} className="fixed inset-0 z-0">
              {/* The phone runs the component's own defaults: density 1,
                  glowIntensity 0.3, twinkleIntensity 0.3, rotationSpeed 0.1.
                  Desktop keeps the values this site tuned — a dimmer, slower
                  sky under a page that already has a great deal moving on it.

                  The pointer props are the one default not taken. There is no
                  cursor on a touchscreen, and a tap arrives as a synthetic
                  mousemove with no mouseleave behind it — so the starfield
                  would lean toward wherever a thumb last landed and stay
                  leaning, which is the fault the submit button had. Off is also
                  what "not reactive, like a live wallpaper" asked for. */}
              <Galaxy
                opacity={galaxyOpacity}
                saturation={0}
                hueShift={140}
                density={isPhone ? 1 : 0.8}
                glowIntensity={isPhone ? 0.3 : 0.4}
                twinkleIntensity={isPhone ? 0.3 : 0.35}
                rotationSpeed={isPhone ? 0.1 : 0.05}
                mouseInteraction={!isPhone}
                mouseRepulsion={!isPhone}
                resolutionScale={isPhone ? 0.6 : 1}
                fpsCap={isPhone ? 30 : 0}
                paused={isPhone && overlayOpen}
              />
            </motion.div>

            {showDesktop ? (
              /* No spinner. The desktop site opens behind its own curtain — see
                 Preloader — and a second loading state in front of that one
                 would be a flash of grey before a black screen that is already
                 doing this job properly. The starfield is already painted. */
              <Suspense fallback={null}>
                <DesktopSite galaxyOpacity={galaxyOpacity} />
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
