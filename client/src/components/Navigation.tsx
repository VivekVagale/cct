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
        {/* The wordmark carries its own lit face, so it needs no halo — that
            is for type sitting directly on the hero. The bloom is painted into
            the background rather than added as a separate glow layer, so the
            anchor creates no stacking context of its own. */}
        <a
          href="#top"
          aria-label="Cold Chain Theory — back to top"
          className="group relative inline-flex items-center rounded-[14px] px-4 py-2 sm:px-5 sm:py-2.5 transition-transform duration-300 ease-out hover:scale-[1.03]"
          style={{
            background: [
              // Bottom-centre bloom: the bright core of the badge.
              "radial-gradient(115% 95% at 50% 118%, #ffe6fc 0%, #f6b8ff 16%, #c079f2 40%, rgba(150,90,235,0) 72%)",
              // The violet body it sits in.
              "radial-gradient(120% 130% at 50% -20%, #a274f5 0%, #7a44e0 55%, #6c34d8 100%)",
            ].join(","),
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.75)",
              "inset 0 0 0 1px rgba(226,203,255,0.5)",
              "0 6px 26px rgba(138,74,235,0.5)",
            ].join(","),
          }}
        >
          <span className="font-logo font-semibold lowercase text-sm sm:text-base tracking-[-0.01em] text-[#0b0a14]">
            @coldchaintheory
          </span>
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
