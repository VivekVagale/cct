export function Footer() {
  return (
    <footer id="footer" className="relative pointer-events-auto border-t border-white/[0.08] py-12 sm:py-16">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8 sm:gap-10">
        <div>
          <p className="text-sm tracking-[0.22em] uppercase text-[#F5F7FA] mb-4">
            Cold Chain Theory
          </p>
          <a
            href="mailto:coldchaintheory@gmail.com"
            className="inline-block py-2 -my-2 text-[#B8C4D6] hover:text-[#F5F7FA] transition-colors duration-300 text-sm"
          >
            coldchaintheory@gmail.com
          </a>
        </div>

        <div className="flex flex-col sm:items-end gap-4">
          {/* Wraps rather than overflowing: uppercase links with this much
              tracking run wider than a 375px viewport's content box. */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
            <a href="#projects" className="inline-block py-2 -my-2 hover:text-[#F5F7FA] transition-colors duration-300">
              Work
            </a>
            <a href="#about" className="inline-block py-2 -my-2 hover:text-[#F5F7FA] transition-colors duration-300">
              About
            </a>
            <a href="#booking" className="inline-block py-2 -my-2 hover:text-[#F5F7FA] transition-colors duration-300">
              Book
            </a>
          </div>
          <p className="text-xs text-[#B8C4D6]/60">
            © {new Date().getFullYear()} Cold Chain Theory. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
