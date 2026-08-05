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
import ErrorBoundary from "./components/ErrorBoundary";
import Galaxy from "./components/ui/Galaxy";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

function App() {
  /*
   * Inertial scrolling for the whole page.
   *
   * Everything on this page is driven by scroll position, and scroll position
   * was arriving in ~100px steps from a wheel notch. Every animation was
   * smooth and the thing playing them was not — which is what made a page full
   * of motion feel static.
   *
   * Off entirely under prefers-reduced-motion rather than slowed down. Someone
   * who has asked for less motion has not asked for gentler motion.
   */
  useSmoothScroll(!useReducedMotion());

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

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <div className="relative bg-[#05070A] text-[#F5F7FA]">
            {/* Fixed, page-wide starfield — sits behind every section */}
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

            <div className="relative z-10 pointer-events-none">
              <Navigation heroExit={heroExit} />
              <Hero galaxyOpacity={galaxyOpacity} heroExit={heroExit} />
              <WorkShowcase />

              <CinematicLine text="EVERY FRAME TELLS A STORY" />

              <About />
              <CreativeProcess />
              <Projects />

              <CinematicLine text="READY TO TURN YOUR MACHINE INTO CINEMA" />

              <Booking />
              <Testimonials />
              <FAQ />
              <Footer />
            </div>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
