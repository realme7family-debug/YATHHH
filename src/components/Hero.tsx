import React from 'react';
import { motion } from 'framer-motion';
import { birthdayConfig } from '../config/birthdayConfig';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dark ambient background */}
      <div className="absolute inset-0 bg-dark-900">
        {/* Warm radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-warm-300/[0.03] blur-[150px]" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-warm-400/15 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        {/* Top decorative */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 80 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="h-px bg-gradient-to-r from-transparent via-warm-400/40 to-transparent mx-auto mb-12"
        />

        {/* Quote */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="font-elegant text-lg md:text-xl text-warm-200/40 italic mb-10 tracking-wide"
        >
          "{birthdayConfig.quotes[0]}"
        </motion.p>

        {/* Main heading */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.9 }}
          className="font-display text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.15] mb-8"
        >
          <span className="gold-gradient-text">
            Today is yours.
          </span>
          <br />
          <span className="text-warm-200/60 text-3xl md:text-4xl lg:text-5xl font-light italic mt-2 block">
            And you deserve it all.
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="font-elegant text-lg md:text-xl text-warm-200/30 max-w-md mx-auto leading-relaxed"
        >
          Scroll down — I made something for you.
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="mt-20"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="flex flex-col items-center"
          >
            <div className="w-[1px] h-10 bg-gradient-to-b from-warm-400/40 to-transparent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
