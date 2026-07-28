import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { birthdayConfig } from '../config/birthdayConfig';
import { soundEngine } from '../utils/audioSynth';

export const Letter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const handleOpen = () => {
    if (isOpen) return;
    soundEngine.playChime();
    setIsOpen(true);
    setTimeout(() => setShowContent(true), 600);
  };

  const { letter } = birthdayConfig;

  return (
    <section className="relative py-28 md:py-44 overflow-hidden">
      {/* Warm ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full bg-warm-300/[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <div className="elegant-divider mb-8" />
          <p className="font-elegant text-lg text-warm-200/30 italic tracking-wider mb-4">
            Words from the heart
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-medium gold-gradient-text">
            A Letter For You
          </h2>
        </motion.div>

        {/* Envelope / Letter */}
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              {/* Envelope visual */}
              <motion.button
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpen}
                className="group w-full max-w-md aspect-[4/3] relative border border-warm-400/20 rounded-sm overflow-hidden cursor-pointer transition-all duration-700 hover:border-warm-400/40"
              >
                {/* Envelope body */}
                <div className="absolute inset-0 bg-gradient-to-br from-dark-700 via-dark-800 to-dark-900" />

                {/* Envelope flap — triangle */}
                <svg
                  className="absolute top-0 left-0 w-full h-1/2 opacity-60"
                  viewBox="0 0 400 150"
                  preserveAspectRatio="none"
                >
                  <polygon
                    points="0,0 400,0 200,150"
                    fill="none"
                    stroke="rgba(196, 164, 132, 0.15)"
                    strokeWidth="1"
                  />
                </svg>

                {/* Wax seal */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(196, 164, 132, 0.1)',
                        '0 0 40px rgba(196, 164, 132, 0.2)',
                        '0 0 20px rgba(196, 164, 132, 0.1)',
                      ],
                    }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-16 h-16 rounded-full border border-warm-400/30 flex items-center justify-center bg-dark-800"
                  >
                    <span className="font-display text-xl text-warm-300/70 italic">♥</span>
                  </motion.div>
                </div>
              </motion.button>

              <p className="font-sans text-xs text-warm-200/20 tracking-[0.3em] uppercase mt-6">
                Tap to open
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="letter"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* The Letter — on warm paper */}
              <div className="letter-paper rounded-sm p-8 md:p-12 shadow-2xl shadow-black/40 relative overflow-hidden">
                {/* Subtle paper lines */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-full h-px bg-warm-600"
                      style={{ marginTop: i === 0 ? '60px' : '32px' }}
                    />
                  ))}
                </div>

                <div className="relative z-10">
                  {/* Salutation */}
                  {showContent && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="font-elegant text-2xl md:text-3xl text-[#5a4a3a] italic mb-8"
                    >
                      {letter.salutation}
                    </motion.p>
                  )}

                  {/* Paragraphs — staggered reveal */}
                  {showContent && letter.paragraphs.map((para, idx) => (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 + idx * 0.5 }}
                      className="font-elegant text-lg md:text-xl text-[#4a3f32] leading-[1.9] mb-5"
                    >
                      {para}
                    </motion.p>
                  ))}

                  {/* Closing */}
                  {showContent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + letter.paragraphs.length * 0.5 + 0.5, duration: 1 }}
                      className="mt-10 text-right"
                    >
                      <p className="font-elegant text-lg text-[#6a5a48] italic">
                        {letter.closing}
                      </p>
                      <p className="font-display text-2xl md:text-3xl text-[#3d3528] mt-2">
                        {letter.sender}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
