import { useEffect, useState } from 'react';

/**
 * Navigation
 *
 * Sticky, transparent over the hero, solid surface once scrolled.
 * No animation libraries — background swap is a plain scroll-position
 * class change, per the static-foundation brief.
 */

const NAV_LINKS = [
  { label: 'Projects', href: '#projects' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 ${
        scrolled ? 'bg-[#0D1117] border-b border-white/[0.08]' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 md:h-[72px] flex items-center justify-between">
        {/* Logo / wordmark */}
        <a href="#" className="text-[#F5F7FA] font-semibold text-lg tracking-tight">
          Cold Chain Theory
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[#B8C4D6] hover:text-[#F5F7FA] text-sm font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Book Project CTA (desktop) */}
        <a
          href="#contact"
          className="hidden md:inline-block px-5 py-2 bg-[#7FDBFF] text-[#05070A] text-sm font-semibold rounded-md hover:bg-[#9FE4FF]"
        >
          Book Project
        </a>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#F5F7FA]"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            {mobileOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0D1117] border-b border-white/[0.08] px-6 py-6 flex flex-col gap-5">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[#B8C4D6] hover:text-[#F5F7FA] text-base font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="inline-block text-center px-5 py-3 bg-[#7FDBFF] text-[#05070A] text-sm font-semibold rounded-md"
            onClick={() => setMobileOpen(false)}
          >
            Book Project
          </a>
        </div>
      )}
    </nav>
  );
}
