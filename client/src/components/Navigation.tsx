import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const LINKS = [
  { label: "Work", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Process", href: "#process" },
  { label: "Experiences", href: "#experiences" },
  { label: "Book", href: "#booking" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 inset-x-0 z-50 pointer-events-auto transition-colors duration-500 ${
        scrolled ? "bg-[#05070A]/80 backdrop-blur-md border-b border-white/[0.06]" : "bg-transparent"
      }`}
    >
      <nav className="max-w-[1600px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
        <a href="#top" className="text-sm tracking-[0.22em] uppercase text-[#F5F7FA] font-medium">
          Cold Chain Theory
        </a>
        <ul className="hidden md:flex items-center gap-10">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-xs tracking-[0.14em] uppercase text-[#B8C4D6] hover:text-[#F5F7FA] transition-colors duration-300"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#booking"
          className="text-xs tracking-[0.14em] uppercase border border-white/20 px-5 py-2.5 text-[#F5F7FA] hover:bg-white hover:text-[#05070A] transition-colors duration-300"
        >
          Start a Project
        </a>
      </nav>
    </motion.header>
  );
}
