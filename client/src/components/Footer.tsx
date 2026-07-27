import { motion } from 'framer-motion';

/**
 * Footer Component
 * 
 * Design Philosophy:
 * - Minimal, elegant footer
 * - Social links (Instagram, Email, YouTube)
 * - Premium typography
 * - Glassmorphism styling
 */

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { label: 'Instagram', href: '#', icon: '📷' },
    { label: 'Email', href: 'mailto:hello@coldchaintheory.com', icon: '✉️' },
    { label: 'YouTube', href: '#', icon: '▶️' },
  ];

  return (
    <motion.footer
      className="relative w-full bg-[#05070A] border-t border-[#7FDBFF]/10 backdrop-blur-md"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#7FDBFF] to-[#5FC8FF] rounded-lg flex items-center justify-center">
                <span className="text-[#05070A] font-bold text-sm">CC</span>
              </div>
              <span className="text-[#F5F7FA] font-bold text-lg">Cold Chain Theory</span>
            </div>
            <p className="text-[#B8C4D6] text-sm">Premium automotive CGI studio creating cinematic visual narratives.</p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-[#F5F7FA] font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              {['Projects', 'Process', 'Contact'].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase()}`} className="text-[#B8C4D6] hover:text-[#7FDBFF] transition-colors duration-200">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-[#F5F7FA] font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-[#0D1117] border border-[#7FDBFF]/20 flex items-center justify-center text-[#7FDBFF] hover:bg-[#7FDBFF]/10 hover:border-[#7FDBFF]/50 transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#7FDBFF]/20 to-transparent mb-8" />

        {/* Bottom Footer */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between text-[#B8C4D6] text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p>&copy; {currentYear} Cold Chain Theory. All rights reserved.</p>
          <p>Crafted with precision and luxury.</p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
