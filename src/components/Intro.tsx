import React from 'react';
import { motion } from 'framer-motion';
import { birthdayConfig } from '../config/birthdayConfig';
import { soundEngine } from '../utils/audioSynth';

interface IntroProps {
  onEnter: () => void;
}

export const Intro: React.FC<IntroProps> = ({ onEnter }) => {
  const handleEnter = () => {
    soundEngine.playChime();
    onEnter();
  };

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-900 px-6"
    >
      {/* Ambient warm glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-warm-300/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-warm-400/20 to-transparent" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] rounded-full bg-warm-300/40"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-5%`,
            }}
            animate={{
              y: [0, -(window.innerHeight + 100)],
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Small decorative line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 60 }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          className="h-px bg-warm-400/40 mx-auto mb-10"
        />

        {/* Opening line */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="font-elegant text-xl md:text-2xl text-warm-200/70 italic tracking-wide mb-6"
        >
          {birthdayConfig.openingLine}
        </motion.p>

        {/* Name — dramatic reveal */}
        <motion.h1
          initial={{ opacity: 0, y: 20, letterSpacing: '0.3em' }}
          animate={{ opacity: 1, y: 0, letterSpacing: '0.15em' }}
          transition={{ duration: 1.5, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-medium gold-gradient-text mb-4"
        >
          Happy Birthday
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="font-display text-2xl md:text-3xl italic text-warm-200/50 mb-14"
        >
          {birthdayConfig.name}
        </motion.p>

        {/* Enter button — elegant, minimal */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.8 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleEnter}
          className="group relative px-10 py-4 border border-warm-400/30 rounded-none text-warm-200/80 font-sans text-sm tracking-[0.2em] uppercase transition-all duration-500 hover:border-warm-400/60 hover:text-warm-200 hover:bg-warm-400/5"
        >
          Open Your Surprise
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-warm-300/50 group-hover:w-full transition-all duration-500" />
        </motion.button>

        {/* Bottom decorative line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 60 }}
          transition={{ duration: 1.5, delay: 3.2, ease: 'easeOut' }}
          className="h-px bg-warm-400/20 mx-auto mt-14"
        />
      </div>
    </motion.div>
  );
};
