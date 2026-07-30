import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useConfig } from '../context/ConfigContext';
import { soundEngine } from '../utils/audioSynth';
import { Sparkles, Heart } from 'lucide-react';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const { config } = useConfig();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Play subtle chime sound at start
    soundEngine.playChime();

    // Smooth 5-second progress timer
    const intervalTime = 50; // update every 50ms
    const totalDuration = 5000;
    const increment = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    // Auto complete after 5 seconds
    const timeout = setTimeout(() => {
      onComplete();
    }, 5100);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  const handleSkip = () => {
    soundEngine.playPop();
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      onClick={handleSkip}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070709] text-white px-6 overflow-hidden cursor-pointer select-none"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#d84b75]/20 via-[#e8d5b7]/10 to-[#f4b6c6]/20 blur-[130px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#070709]/60 to-[#070709]" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-coquette-pink/40"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main Intro Animation Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto">
        {/* Animated Icon badge */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-16 h-16 rounded-full border border-warm-400/30 bg-white/5 backdrop-blur-md flex items-center justify-center mb-8 shadow-2xl shadow-pink-500/10"
        >
          <Sparkles className="w-7 h-7 text-[#f4b6c6] animate-pulse" />
        </motion.div>

        {/* Subtitle tag */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-cormorant text-xs md:text-sm uppercase tracking-[0.35em] text-[#e8d5b7]/80 font-semibold mb-4"
        >
          ✨ A Magical Birthday Surprise ✨
        </motion.p>

        {/* Main Happy Birthday title */}
        <motion.h1
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-script text-6xl md:text-8xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-[#fff5f7] via-[#f4b6c6] to-[#e8d5b7] font-bold leading-none mb-3 drop-shadow-lg"
        >
          Happy Birthday
        </motion.h1>

        {/* Name reveal */}
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 1.6, ease: 'easeOut' }}
          className="font-alex text-4xl md:text-6xl text-[#f4b6c6] mb-8"
        >
          {config.name}
        </motion.p>

        {/* Short aesthetic line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.3 }}
          className="font-cormorant italic text-sm md:text-base text-white/60 max-w-md leading-relaxed mb-10"
        >
          "{config.openingLine || 'To the one who makes every moment unforgettable'}"
        </motion.p>

        {/* 5-second Progress Bar & Skip Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.8 }}
          className="flex flex-col items-center gap-3 w-full max-w-xs"
        >
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-[#d84b75] via-[#f4b6c6] to-[#e8d5b7] rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>

          <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-white/40 flex items-center gap-1.5">
            <span>Tap anywhere to start presentation</span>
            <Heart className="w-3 h-3 text-[#f4b6c6] inline fill-[#f4b6c6]" />
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
