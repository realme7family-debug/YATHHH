import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useConfig } from '../context/ConfigContext';
import { soundEngine } from '../utils/audioSynth';

interface CakeSectionProps {
  onWishBlown?: () => void;
}

export const CakeSection: React.FC<CakeSectionProps> = ({ onWishBlown }) => {
  const { config } = useConfig();
  const [isBlown, setIsBlown] = useState(false);
  const [isBlowing, setIsBlowing] = useState(false);

  const handleBlowCandles = () => {
    if (isBlown || isBlowing) return;
    setIsBlowing(true);

    soundEngine.playBlowSound();

    setTimeout(() => {
      setIsBlown(true);
      setIsBlowing(false);
      soundEngine.playChime();

      // Golden & Rose confetti burst
      const warmColors = ['#c4a484', '#d4a574', '#e8d5b7', '#c9a0a0', '#ffffff', '#ffd700'];
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: warmColors,
        ticks: 120,
        zIndex: 100,
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 100,
          origin: { y: 0.5 },
          colors: warmColors,
          ticks: 100,
        });
      }, 300);

      if (onWishBlown) {
        onWishBlown();
      }
    }, 600);
  };

  return (
    <section id="cake-section" className="relative py-24 md:py-36 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-warm-300/[0.04] blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="elegant-divider mb-8" />
          <p className="font-elegant text-lg text-warm-200/40 italic tracking-wider mb-3">
            A Special Tradition
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-medium gold-gradient-text mb-4">
            Make A Birthday Wish
          </h2>
          <p className="font-elegant text-lg text-warm-200/50 italic max-w-md mx-auto mb-12">
            Close your eyes for a second, make a wish in your heart...
          </p>
        </motion.div>

        {/* Animated Cake Container */}
        <div className="relative flex flex-col items-center justify-center my-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative cursor-pointer group"
            onClick={handleBlowCandles}
          >
            {/* Soft Ambient Light under cake */}
            <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-64 h-12 rounded-full transition-opacity duration-1000 ${isBlown ? 'bg-warm-400/5 blur-md' : 'bg-amber-500/20 blur-xl animate-pulse'}`} />

            {/* Cake SVG Art */}
            <svg
              width="280"
              height="280"
              viewBox="0 0 300 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-2xl filter transition-transform duration-500 group-hover:scale-[1.03]"
            >
              {/* Stand / Plate */}
              <ellipse cx="150" cy="260" rx="120" ry="18" fill="url(#plateGrad)" stroke="#c4a484" strokeWidth="1.5" opacity="0.8" />
              <ellipse cx="150" cy="254" rx="100" ry="12" fill="#1a1816" opacity="0.6" />

              {/* Bottom Cake Layer */}
              <rect x="50" y="180" width="200" height="70" rx="12" fill="url(#cakeBottomGrad)" />
              <path d="M50 200 Q100 215 150 200 T250 200 V238 C250 248 240 250 230 250 H70 C60 250 50 248 50 238 Z" fill="#2a241f" opacity="0.5" />
              {/* Gold Trim Bottom Layer */}
              <path d="M50 180 Q100 192 150 180 T250 180" stroke="#d4a574" strokeWidth="3" fill="none" opacity="0.8" />

              {/* Frosting Drips Bottom */}
              <path d="M50 180 Q65 200 80 180 T110 195 T140 180 T170 195 T200 180 T230 195 T250 180" fill="url(#frostingGrad)" />

              {/* Top Cake Layer */}
              <rect x="80" y="120" width="140" height="60" rx="10" fill="url(#cakeTopGrad)" />
              {/* Gold Trim Top Layer */}
              <path d="M80 120 Q115 130 150 120 T220 120" stroke="#d4a574" strokeWidth="3" fill="none" opacity="0.8" />
              {/* Frosting Drips Top */}
              <path d="M80 120 Q95 135 110 120 T140 135 T170 120 T200 135 T220 120" fill="url(#frostingGrad)" />

              {/* Strawberries / Toppings */}
              <circle cx="100" cy="114" r="8" fill="#a83244" />
              <circle cx="130" cy="112" r="9" fill="#c44156" />
              <circle cx="150" cy="110" r="10" fill="#a83244" />
              <circle cx="170" cy="112" r="9" fill="#c44156" />
              <circle cx="200" cy="114" r="8" fill="#a83244" />

              {/* Candles */}
              {/* Candle 1 (Left) */}
              <rect x="110" y="70" width="8" height="42" rx="3" fill="url(#candleGrad)" />
              <line x1="114" y1="70" x2="114" y2="62" stroke="#4a3b32" strokeWidth="1.5" />

              {/* Candle 2 (Center - Taller) */}
              <rect x="146" y="60" width="8" height="50" rx="3" fill="url(#candleGrad)" />
              <line x1="150" y1="60" x2="150" y2="52" stroke="#4a3b32" strokeWidth="1.5" />

              {/* Candle 3 (Right) */}
              <rect x="182" y="70" width="8" height="42" rx="3" fill="url(#candleGrad)" />
              <line x1="186" y1="70" x2="186" y2="62" stroke="#4a3b32" strokeWidth="1.5" />

              {/* Candle Flames (Only if NOT blown) */}
              <AnimatePresence>
                {!isBlown && (
                  <g id="flames">
                    {/* Flame 1 */}
                    <g className="animate-pulse">
                      <ellipse cx="114" cy="54" rx="6" ry="10" fill="url(#flameGrad)" />
                      <ellipse cx="114" cy="56" rx="3" ry="5" fill="#fff" />
                    </g>
                    {/* Flame 2 */}
                    <g className="animate-pulse" style={{ animationDelay: '0.2s' }}>
                      <ellipse cx="150" cy="44" rx="7" ry="11" fill="url(#flameGrad)" />
                      <ellipse cx="150" cy="46" rx="3.5" ry="6" fill="#fff" />
                    </g>
                    {/* Flame 3 */}
                    <g className="animate-pulse" style={{ animationDelay: '0.4s' }}>
                      <ellipse cx="186" cy="54" rx="6" ry="10" fill="url(#flameGrad)" />
                      <ellipse cx="186" cy="56" rx="3" ry="5" fill="#fff" />
                    </g>
                  </g>
                )}
              </AnimatePresence>

              {/* Smoke Particles (When blown) */}
              {isBlown && (
                <g id="smoke">
                  <path d="M114 60 C110 45 120 35 112 20" stroke="rgba(200,180,160,0.5)" strokeWidth="2" strokeLinecap="round" fill="none" className="animate-fade-in" />
                  <path d="M150 50 C145 35 155 25 148 10" stroke="rgba(200,180,160,0.6)" strokeWidth="2.5" strokeLinecap="round" fill="none" className="animate-fade-in" />
                  <path d="M186 60 C182 45 192 35 184 20" stroke="rgba(200,180,160,0.5)" strokeWidth="2" strokeLinecap="round" fill="none" className="animate-fade-in" />
                </g>
              )}

              {/* SVG Gradients */}
              <defs>
                <linearGradient id="plateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3d352e" />
                  <stop offset="100%" stopColor="#1a1613" />
                </linearGradient>
                <linearGradient id="cakeBottomGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4a3b30" />
                  <stop offset="50%" stopColor="#382c23" />
                  <stop offset="100%" stopColor="#292019" />
                </linearGradient>
                <linearGradient id="cakeTopGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#574639" />
                  <stop offset="100%" stopColor="#3d3127" />
                </linearGradient>
                <linearGradient id="frostingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f5efe5" />
                  <stop offset="100%" stopColor="#e2d4c0" />
                </linearGradient>
                <linearGradient id="candleGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#e8d5b7" />
                  <stop offset="50%" stopColor="#faf6f0" />
                  <stop offset="100%" stopColor="#c4a484" />
                </linearGradient>
                <radialGradient id="flameGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#ffb703" />
                  <stop offset="100%" stopColor="#fb8500" />
                </radialGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Interactive Button Prompt */}
          <div className="mt-8">
            {!isBlown ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleBlowCandles}
                disabled={isBlowing}
                className="group relative px-8 py-4 border border-warm-400/40 rounded-full bg-dark-800/80 backdrop-blur-md text-warm-200 font-sans text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:border-warm-300 shadow-xl shadow-amber-950/20 flex items-center justify-center gap-3 mx-auto"
              >
                <span>{isBlowing ? 'Blowing Out Candles...' : 'Blow Out The Candles 🕯️'}</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="space-y-3"
              >
                <p className="font-display text-2xl md:text-3xl gold-gradient-text font-medium italic">
                  ✨ Wish Unlocked ✨
                </p>
                <p className="font-elegant text-lg text-warm-200/60 italic max-w-sm mx-auto">
                  {config.wishesUnlockedMessage}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
