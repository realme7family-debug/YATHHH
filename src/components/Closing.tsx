import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { birthdayConfig } from '../config/birthdayConfig';
import { soundEngine } from '../utils/audioSynth';

export const Closing: React.FC = () => {
  const [celebrated, setCelebrated] = useState(false);

  const handleCelebrate = () => {
    if (celebrated) return;
    setCelebrated(true);
    soundEngine.playChime();

    // Elegant warm-toned confetti
    const warmColors = ['#c4a484', '#d4a574', '#e8d5b7', '#c9a0a0', '#b8956a', '#faf6f0'];

    const duration = 4000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return;

      const particleCount = 30 * (timeLeft / duration);
      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: warmColors,
        ticks: 100,
        zIndex: 100,
      });
      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: warmColors,
        ticks: 100,
        zIndex: 100,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  return (
    <section className="relative py-32 md:py-48 overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-warm-400/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-warm-300/[0.02] blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        {/* Final quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
        >
          <div className="elegant-divider mb-10" />

          <p className="font-elegant text-xl md:text-2xl text-warm-200/25 italic mb-16 leading-relaxed">
            "{birthdayConfig.quotes[2]}"
          </p>

          <h2 className="font-display text-4xl md:text-6xl font-medium gold-gradient-text leading-tight mb-4">
            Happy Birthday.
          </h2>

          <p className="font-elegant text-xl md:text-2xl text-warm-200/40 italic mt-4 mb-16">
            Stay beautiful. Stay you.
          </p>
        </motion.div>

        {/* Celebrate button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {!celebrated ? (
            <button
              onClick={handleCelebrate}
              className="group relative px-10 py-4 border border-warm-400/25 text-warm-200/60 font-sans text-sm tracking-[0.2em] uppercase transition-all duration-500 hover:border-warm-400/50 hover:text-warm-200/90 hover:bg-warm-400/5"
            >
              Celebrate
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-warm-300/40 group-hover:w-full transition-all duration-500" />
            </button>
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-elegant text-xl text-warm-300/60 italic"
            >
              Here's to you. Always.
            </motion.p>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-28"
        >
          <div className="elegant-divider mb-6" />
          <p className="font-sans text-xs text-warm-200/15 tracking-[0.2em] uppercase">
            Made with love — {birthdayConfig.name}'s Birthday
          </p>
        </motion.div>
      </div>
    </section>
  );
};
