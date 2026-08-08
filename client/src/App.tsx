import { useCallback, useEffect, useMemo, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { WorkShowcase, preloadShowcase } from "./components/WorkShowcase";
import { About } from "./components/About";
import { CreativeProcess } from "./components/CreativeProcess";
import { Projects } from "./components/Projects";
import { Booking } from "./components/Booking";
import { Testimonials } from "./components/Testimonials";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { CinematicLine } from "./components/CinematicLine";
import { Preloader } from "./components/Preloader";
import { SceneDeck, type SceneDefinition } from "./components/SceneDeck";
import ErrorBoundary from "./components/ErrorBoundary";
import Galaxy from "./components/ui/Galaxy";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { useIsPhone } from "@/hooks/useIsPhone";
import { useScrollReveals } from "@/hooks/useScrollReveals";

function App() {
  const reduceMotion = useReducedMotion();
  /*
   * A phone runs a cut-down version of the page, and it is not a matter of
   * taste — a device was measured getting hot enough to notice while sitting on
   * this site. The costs that matter are the ones that run for the whole
   * session rather than the ones tied to a section, so what goes is the
   * permanent WebGL: the starfield behind every scene, and Lenis's frame loop.
   */
  const isPhone = useIsPhone();

  /*
   * Inertial scrolling, for everyone.
   *
   * This is the smoothness the references have. It was switched off for all but
   * reduced-motion visitors while the deck owned the wheel — which meant the
   * one system that could have made scrolling feel good was running only for
   * the people who had asked for less of it. Off under reduced motion, where
   * interpolating someone's scroll is the opposite of what they requested.
   */
  /*
   * Not on a phone. A touch device already has momentum scrolling tuned by the
   * platform, Lenis is explicitly not syncing touch here anyway (`syncTouch:
   * false`), so all it contributed was a rAF loop running for the life of the
   * page and a scroll position being interpolated that nothing on touch reads.
   */
  useSmoothScroll(!reduceMotion && !isPhone);

  // Every section's heading and content block, revealed as it is scrolled to
  // rather than on the deck's old fixed clock. See useScrollReveals.
  useScrollReveals(!reduceMotion);

  // The starfield is faded up by the Hero as its assembly finishes, so the page
  // opens on flat black and the stars arrive with the reveal.
  //
  // This is a deliberate look, not a technical constraint. The frames are keyed,
  // so the stars *can* show through from the very first one — that was tried and
  // it read as busy behind an assembling mascot. Black holds the assembly, and
  // the starfield arriving is what makes the reveal land.
  const galaxyOpacity = useMotionValue(0);

  // How far through its dissolve the hero's stage is. The nav bar's glass waits
  // on this rather than on the starfield: the stars come up behind a mascot
  // that is still there, and a bar that puts a plate on at that moment is
  // drawing an edge across the helmet — which is the thing the bar has always
  // refused to do.
  const heroExit = useMotionValue(0);

  /*
   * The starfield belongs to the page, not to the hero.
   *
   * Its opacity is written by the hero as that scene's assembly finishes, which
   * is right for the reveal itself and wrong as the only thing holding it up.
   * The hero measures its own scroll to produce that number, and a scene that
   * is not the current one cannot be relied on to measure anything: stood down,
   * its subtree is not rendered, the measurement comes back as zero, and the
   * page behind every later scene went black.
   *
   * So past the first scene this stops being the hero's business. Anywhere but
   * the hero, the stars are simply up — a floor under the value rather than a
   * second thing writing it, so the hero's own reveal still plays out in full
   * on the way through.
   */
  /*
   * The curtain is up until the opening frames exist. See Preloader.
   *
   * The deck is mounted behind it the whole time — that is the point, it is
   * what gives the frames something to load into — but it must not *listen*
   * yet: a scroll during the load would scrub an assembly that is still full
   * of holes, which is the exact hiccup the curtain is there to remove.
   */
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => {
    setReady(true);
    // The sphere's renders and the project cards, warmed the moment the hero's
    // frames are in and the network is free. See preloadShowcase — at idle
    // priority these were measured as still not requested at all.
    preloadShowcase();
  }, []);

  const handleSceneChange = useCallback(
    (index: number) => {
      // Deck only, and the deck is off. Kept because it is the deck's answer to
      // a scene that cannot measure itself; in a document the hero owns this
      // value outright and must be allowed to take it back down — see the note
      // in Hero, and the black edges it exists to hide.
      if (index > 0 && galaxyOpacity.get() < 1) {
        animate(galaxyOpacity, 1, { duration: 0.7, ease: [0.16, 1, 0.3, 1] });
      }
    },
    [galaxyOpacity],
  );

  /*
   * The story, as scenes.
   *
   * The order is the old document's order, and the two interstitials stay as
   * scenes of their own — in a deck a line of type alone on the screen is a
   * title card, which is more of what it always wanted to be than a band
   * between two sections was.
   *
   * `scrolls` marks the two that cannot fit a screen. Analytics carries five
   * counters, a bar chart, two tables and a world map; the booking form carries
   * a vehicle grid, five steps and seven project cards. Those scroll inside
   * their own frame and the deck holds until they reach the end of it — the
   * viewport still never moves.
   */
  const scenes = useMemo<SceneDefinition[]>(
    () => [
      {
        // Scrolls inside its frame: the 298-frame sequence is scrubbed by
        // scroll distance, and there is no scrubbing a sequence with a
        // discrete "next scene" instruction. The viewport still never moves.
        id: "top",
        scrolls: true,
        render: () => <Hero galaxyOpacity={galaxyOpacity} heroExit={heroExit} />,
      },
      {
        id: "work",
        render: () => <WorkShowcase />,
        // A beat: the sphere is arrived at, not read past.
        beat: true,
        // Longer than anywhere else, because this scene is a thing to be used
        // rather than read — at the ordinary hold the sphere was gone before a
        // visitor had worked out it could be turned at all. First sighting
        // only: coming back to it is as immediate as anywhere else.
        dwell: 2.6,
      },
      {
        id: "every-frame",
        beat: true,
        dwell: 1.6,
        render: () => (
          <CinematicLine id="every-frame" text="EVERY FRAME TELLS A STORY" />
        ),
      },
      { id: "about", render: () => <About />, scrolls: true, beat: true, dwell: 1.2 },
      // Five pinned stages, scrubbed the same way.
      { id: "process", scrolls: true, render: () => <CreativeProcess /> },
      { id: "projects", render: () => <Projects />, scrolls: true },
      {
        id: "into-cinema",
        beat: true,
        dwell: 1.6,
        render: () => (
          <CinematicLine
            id="into-cinema"
            text="READY TO TURN YOUR MACHINE INTO CINEMA"
          />
        ),
      },
      { id: "booking", render: () => <Booking />, scrolls: true },
      { id: "testimonials", render: () => <Testimonials />, scrolls: true },
      { id: "faq", render: () => <FAQ />, scrolls: true },
      { id: "footer", render: () => <Footer /> },
    ],
    [galaxyOpacity, heroExit],
  );

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <div className="relative bg-[#05070A] text-[#F5F7FA]">
            {/* The one thing that does not change between scenes. A fixed
                camera needs a fixed background, and this is it — the deck
                dissolves its scenes in front of a starfield that never cuts. */}
            {/* The starfield everywhere, and on a phone at a fraction of what
                it costs on a desktop.

                It was desktop-only, with a still gradient in its place, because
                a full-screen WebGL canvas drawing every frame from first paint
                to the footer is the single largest continuous cost on the page
                — and the report that removed it was a phone getting hot, not a
                phone stuttering. The gradient reads as flat black, which is
                worse to look at for the length of this page than it is cheap.

                So the phone gets the same sky, drawn as a wallpaper rather than
                as an instrument:

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
              />
            </motion.div>

            {/* Above the deck, not inside it: the bar is the one element that
                belongs to the whole story rather than to any one scene, so it
                must not dissolve with them. */}
            <div className="relative z-20 pointer-events-none">
              <Navigation heroExit={heroExit} />
            </div>

            <SceneDeck
              scenes={scenes}
              onSceneChange={handleSceneChange}
              paused={!ready}
            />

            <Preloader onDone={handleReady} />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
