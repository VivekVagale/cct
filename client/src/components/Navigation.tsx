import { motion } from "framer-motion";
import { GlowButton } from "@/components/GlowButton";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Process", href: "#process" },
  { label: "Experiences", href: "#experiences" },
  { label: "Book", href: "#booking" },
];

/**
 * Legibility comes from a shadow on the type, not from anything behind it.
 *
 * The bar has no background, no blur and no bottom border, because every one of
 * those draws an edge across the viewport — and at the end of the hero that edge
 * lands straight across the mascot's helmet. A halo on the text reads over both
 * the bright hoodie and the starfield without putting a line anywhere.
 *
 * Blurred rather than offset: an offset shadow reads as cheap, a halo reads as
 * depth. It is also the cheapest option going — backdrop-filter over the hero
 * would re-blur on every composited frame while the sequence scrubs.
 */
const HALO = "[text-shadow:0_1px_10px_rgba(5,7,10,0.85)]";

export function Navigation() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50 pointer-events-auto"
    >
      <nav className="max-w-[1600px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
        <a
          href="#top"
          className={`text-sm tracking-[0.22em] uppercase text-[#F5F7FA] font-medium ${HALO}`}
        >
          Cold Chain Theory
        </a>
        <ul className="hidden md:flex items-center gap-10">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`text-xs tracking-[0.14em] uppercase text-[#B8C4D6] hover:text-[#F5F7FA] transition-colors duration-300 ${HALO}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        {/* The button carries its own edge, which is fine here: it is a control
            a few hundred px wide, not a line spanning the viewport. It needs no
            halo either — the face is opaque, so the type already has its own
            background to sit on. */}
        <GlowButton href="#booking" className="text-xs tracking-[0.14em] uppercase px-5 py-2.5">
          Start a Project
        </GlowButton>
      </nav>
    </motion.header>
  );
}
