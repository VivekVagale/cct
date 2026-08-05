import { useMemo } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { WorkShowcase } from "./components/WorkShowcase";
import { About } from "./components/About";
import { CreativeProcess } from "./components/CreativeProcess";
import { Projects } from "./components/Projects";
import { Booking } from "./components/Booking";
import { Testimonials } from "./components/Testimonials";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { CinematicLine } from "./components/CinematicLine";
import { SceneDeck, type SceneDefinition } from "./components/SceneDeck";
import ErrorBoundary from "./components/ErrorBoundary";
import Galaxy from "./components/ui/Galaxy";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

function App() {
  const reduceMotion = useReducedMotion();

  /*
   * Inertial scrolling, for the document fallback only.
   *
   * The deck has no page scroll to smooth — a wheel notch there is an
   * instruction to change scene, not a distance to travel, and Lenis
   * interpolating a scroll position that nothing reads would be two systems
   * arguing over an input only one of them uses. It stays for the
   * reduced-motion path, which *is* an ordinary document.
   */
  useSmoothScroll(Boolean(reduceMotion));

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
      { id: "work", render: () => <WorkShowcase /> },
      {
        id: "every-frame",
        render: () => <CinematicLine text="EVERY FRAME TELLS A STORY" />,
      },
      { id: "about", render: () => <About />, scrolls: true },
      // Five pinned stages, scrubbed the same way.
      { id: "process", scrolls: true, render: () => <CreativeProcess /> },
      { id: "projects", render: () => <Projects />, scrolls: true },
      {
        id: "into-cinema",
        render: () => <CinematicLine text="READY TO TURN YOUR MACHINE INTO CINEMA" />,
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
            <motion.div style={{ opacity: galaxyOpacity }} className="fixed inset-0 z-0">
              <Galaxy
                opacity={galaxyOpacity}
                density={0.8}
                glowIntensity={0.4}
                saturation={0}
                hueShift={140}
                mouseInteraction
                mouseRepulsion
                twinkleIntensity={0.35}
                rotationSpeed={0.05}
              />
            </motion.div>

            {/* Above the deck, not inside it: the bar is the one element that
                belongs to the whole story rather than to any one scene, so it
                must not dissolve with them. */}
            <div className="relative z-20 pointer-events-none">
              <Navigation heroExit={heroExit} />
            </div>

            <SceneDeck scenes={scenes} />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
