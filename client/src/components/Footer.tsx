export function Footer() {
  return (
    <footer className="relative pointer-events-auto border-t border-white/[0.08] py-16">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-10">
        <div>
          <p className="text-sm tracking-[0.22em] uppercase text-[#F5F7FA] mb-4">
            Cold Chain Theory
          </p>
          <a
            href="mailto:coldchaintheory@gmail.com"
            className="text-[#B8C4D6] hover:text-[#F5F7FA] transition-colors duration-300 text-sm"
          >
            coldchaintheory@gmail.com
          </a>
        </div>

        <div className="flex flex-col sm:items-end gap-4">
          <div className="flex items-center gap-6 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
            <a href="#experiences" className="hover:text-[#F5F7FA] transition-colors duration-300">
              Work
            </a>
            <a href="#about" className="hover:text-[#F5F7FA] transition-colors duration-300">
              About
            </a>
            <a href="#booking" className="hover:text-[#F5F7FA] transition-colors duration-300">
              Book
            </a>
            <a href="#" className="hover:text-[#F5F7FA] transition-colors duration-300">
              Instagram
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
