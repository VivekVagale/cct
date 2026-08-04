import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [open, setOpen] = useState(false);

  // The panel is the only thing on the page that takes the whole viewport on
  // purpose, so the page behind it must not scroll under it. Restored on close
  // rather than assumed empty, so it composes with anything else that might
  // touch the same property.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape closes it. A menu with no keyboard way out is a trap for anyone not
  // using a touchscreen, and this renders at every width below md — including
  // a narrow desktop window.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50 pointer-events-auto"
    >
      {/* h-16 on phones. The bar is fixed, so its height is subtracted from
          every section's usable viewport for the whole page — 80px of it is
          worth having on a desktop and is not on a 667px screen. */}
      <nav className="max-w-[1600px] mx-auto px-5 sm:px-10 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* The wordmark carries its own lit face, so it needs no halo — that
            is for type sitting directly on the hero. The bloom is painted into
            the background rather than added as a separate glow layer, so the
            anchor creates no stacking context of its own. */}
        <a
          href="#top"
          aria-label="Cold Chain Theory — back to top"
          onClick={() => setOpen(false)}
          className="group relative inline-flex items-center rounded-[14px] px-3 py-1.5 sm:px-5 sm:py-2.5 transition-transform duration-300 ease-out hover:scale-[1.03]"
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
          <span className="font-logo font-medium lowercase text-[13px] sm:text-base tracking-[-0.01em] text-white">
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
            background to sit on.

            It is desktop-only. Below md the bar has to hold the wordmark, the
            way into the four sections, and this — which does not fit across a
            375px screen, and does not fit at all across a 320px one. The panel
            below carries both, and it can give the CTA far more presence than a
            36px-tall pill in a bar ever had. */}
        <div className="hidden md:block">
          <GlowButton href="#booking" className="text-xs tracking-[0.14em] uppercase px-5 py-2.5">
            Start a Project
          </GlowButton>
        </div>

        {/* Two bars that become a cross. Drawn rather than set as a glyph so it
            keeps its weight against both the hoodie and the starfield, the same
            reason the type beside it carries a halo. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden relative -mr-2 flex h-11 w-11 items-center justify-center"
        >
          <span className="relative block h-[13px] w-6">
            <motion.span
              animate={open ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 top-0 block h-[1.5px] origin-center bg-[#F5F7FA] [box-shadow:0_1px_10px_rgba(5,7,10,0.85)]"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 bottom-0 block h-[1.5px] origin-center bg-[#F5F7FA] [box-shadow:0_1px_10px_rgba(5,7,10,0.85)]"
            />
          </span>
        </button>
      </nav>

      {/* Opaque, unlike the bar. The bar avoids a background so it never draws
          an edge across the hero; a panel covering the whole screen has no edge
          to draw, and the links have to be readable over whatever the reader
          happened to stop on. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden fixed inset-0 top-16 bg-[#05070A]/97 px-6 pb-10 pt-4 flex flex-col"
          >
            <ul className="flex flex-col">
              {LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.04 * i, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b border-white/[0.08]"
                >
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-5 font-display text-2xl text-[#F5F7FA]"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>

            {/* Not wrapped in a motion element, unlike the links above it.
                Framer leaves a will-change on what it animates, which makes
                that element a stacking context — and the glow is a negative-z
                pseudo-element that only paints behind the ring while no
                ancestor between it and the page is one. The button arrives
                without the stagger rather than arriving flattened. */}
            <div className="mt-10">
              <GlowButton
                href="#booking"
                onClick={() => setOpen(false)}
                wrapperClassName="w-full"
                className="text-center text-xs tracking-[0.14em] uppercase px-6 py-4"
              >
                Start a Project
              </GlowButton>
            </div>

            <a
              href="mailto:coldchaintheory@gmail.com"
              className="mt-auto pt-8 text-sm text-[#B8C4D6]"
            >
              coldchaintheory@gmail.com
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
