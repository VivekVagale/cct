import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { FeaturedProjects } from "./components/FeaturedProjects";
import { About } from "./components/About";
import { CreativeProcess } from "./components/CreativeProcess";
import { CGIExperiences } from "./components/CGIExperiences";
import { Booking } from "./components/Booking";
import { Testimonials } from "./components/Testimonials";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { CinematicLine } from "./components/CinematicLine";
import ErrorBoundary from "./components/ErrorBoundary";
import Galaxy from "./components/ui/Galaxy";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <div className="relative bg-[#05070A] text-[#F5F7FA]">
            {/* Fixed, page-wide starfield — sits behind every section */}
            <div className="fixed inset-0 z-0">
              <Galaxy
                density={0.8}
                glowIntensity={0.4}
                saturation={0}
                hueShift={140}
                mouseInteraction
                mouseRepulsion
                twinkleIntensity={0.35}
                rotationSpeed={0.05}
              />
            </div>

            <div className="relative z-10 pointer-events-none">
              <Navigation />
              <Hero />
              <FeaturedProjects />

              <CinematicLine text="EVERY FRAME TELLS A STORY" />

              <About />
              <CreativeProcess />
              <CGIExperiences />

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
