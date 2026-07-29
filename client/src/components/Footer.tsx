/**
 * Footer — minimal, static. Logo, nav links, Instagram/Email,
 * copyright. No animation library, no icons/emoji, no gradients.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#05070A] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 mb-10">
          {/* Logo + tagline */}
          <div>
            <span className="text-[#F5F7FA] font-semibold text-lg tracking-tight">
              Cold Chain Theory
            </span>
            <p className="text-[#B8C4D6] text-sm mt-2 max-w-xs">
              Premium cinematic CGI for cars and motorcycles.
            </p>
          </div>

          {/* Nav links */}
          <div className="flex gap-6">
            {['Projects', 'Process', 'Contact'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-[#B8C4D6] hover:text-[#F5F7FA] text-sm font-medium"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Instagram / Email */}
          <div className="flex gap-6">
            <a href="#" className="text-[#B8C4D6] hover:text-[#7FDBFF] text-sm font-medium">
              Instagram
            </a>
            <a
              href="mailto:coldchaintheory@gmail.com"
              className="text-[#B8C4D6] hover:text-[#7FDBFF] text-sm font-medium"
            >
              Email
            </a>
          </div>
        </div>

        <div className="h-px bg-white/[0.08] mb-8" />

        <p className="text-center text-[#B8C4D6]/70 text-xs">
          &copy; {currentYear} Cold Chain Theory. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
