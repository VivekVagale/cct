import { motion } from 'framer-motion';
import { CrystalChain } from './CrystalChain';
import CrystalButton from '@/components/ui/CrystalButton';

/**
 * Hero Section - Split Layout
 */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
    },
  },
};

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen bg-gradient-to-b from-[#05070A] to-[#0D1117] overflow-hidden pt-20">
      {/* Full-bleed crystal chain — anchors on the right at rest, then
          zooms/rotates until its glass surface fills the whole screen */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <CrystalChain />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070A] via-[#05070A]/40 to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row h-full lg:h-screen">
        {/* LEFT */}
        <motion.div
          className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 z-10 py-12 lg:py-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#F5F7FA] mb-4 leading-tight tracking-tight"
            variants={itemVariants}
          >
            Cold Chain Theory
          </motion.h1>

          <motion.div
            className="w-16 h-1 bg-[#7FDBFF] mb-8"
            variants={itemVariants}
          />

          <motion.h2
            className="text-xl sm:text-2xl lg:text-3xl text-[#B8C4D6] mb-6 font-light leading-relaxed"
            variants={itemVariants}
          >
            Creating cinematic CGI
            <br />
            for motorcycles and cars.
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg text-[#B8C4D6] mb-12 max-w-lg leading-relaxed font-light"
            variants={itemVariants}
          >
            Custom CGI visuals designed to bring automotive ideas to life
            through cinematic storytelling.
          </motion.p>

          {/* Crystal Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
            variants={itemVariants}
          >
            <CrystalButton
              className="w-full sm:w-auto"
              onClick={() => {}}
            >
              Book a Project
            </CrystalButton>

            <CrystalButton
              className="w-full sm:w-auto"
              onClick={() => {}}
            >
              View Projects
            </CrystalButton>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            animate={{
              y: [0, -100],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-[#7FDBFF] rounded-full flex justify-center p-2">
          <div className="w-1 h-2 bg-[#7FDBFF] rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}