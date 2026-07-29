import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { ProcessSection } from "./components/ProcessSection";
import { BookingSection } from "./components/BookingSection";
import { Footer } from "./components/Footer";
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

            <div className="relative z-10">
              <Navigation />
              <HeroSection />
              <ProjectsSection />
              <ProcessSection />
              <BookingSection />
              <Footer />
            </div>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
