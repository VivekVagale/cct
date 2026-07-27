import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * Navigation Component
 * 
 * Design Philosophy:
 * - Transparent with backdrop blur (glassmorphism)
 * - Cold Chain Theory logo/wordmark
 * - Premium navigation links
 * - Crystal blue accent on active/hover
 */

export function Navigation() {
  const [activeLink, setActiveLink] = useState('home');

  const navLinks = [
    { id: 'projects', label: 'Projects', href: '#projects' },
    { id: 'process', label: 'Process', href: '#process' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#05070A]/40 border-b border-[#7FDBFF]/10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
        {/* Logo/Wordmark */}
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-[#7FDBFF] to-[#5FC8FF] rounded-lg flex items-center justify-center">
            <span className="text-[#05070A] font-bold text-sm">CC</span>
          </div>
          <span className="text-[#F5F7FA] font-bold text-lg tracking-tight">Cold Chain</span>
        </motion.div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <motion.a
              key={link.id}
              href={link.href}
              className="relative text-[#B8C4D6] hover:text-[#F5F7FA] transition-colors duration-200 font-medium"
              onHoverStart={() => setActiveLink(link.id)}
              onClick={() => setActiveLink(link.id)}
            >
              {link.label}
              {activeLink === link.id && (
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#7FDBFF]"
                  layoutId="activeLink"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </motion.a>
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          className="px-6 py-2 bg-[#7FDBFF] text-[#05070A] font-semibold rounded-lg hover:bg-[#5FC8FF] transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Book Project
        </motion.button>
      </div>
    </motion.nav>
  );
}
