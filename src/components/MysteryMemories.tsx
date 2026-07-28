import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { birthdayConfig, PhotoItem } from '../config/birthdayConfig';
import { soundEngine } from '../utils/audioSynth';

export const MysteryMemories: React.FC = () => {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const toggleUnlock = (photo: PhotoItem) => {
    if (!unlockedIds.has(photo.id)) {
      soundEngine.playChime();
      setUnlockedIds((prev) => new Set(prev).add(photo.id));
    } else {
      setSelectedPhoto(photo);
    }
  };

  return (
    <section id="memories-section" className="relative py-24 md:py-40 overflow-hidden bg-dark-800/40">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-warm-400/[0.03] blur-[150px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-rose-soft/[0.03] blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <div className="elegant-divider mb-8" />
          <p className="font-elegant text-lg text-warm-200/40 italic tracking-wider mb-3">
            Unlocked Memories & Secrets
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-medium gold-gradient-text mb-4">
            Mystery Surprise Boxes
          </h2>
          <p className="font-elegant text-lg text-warm-200/50 italic max-w-md mx-auto">
            Tap each mystery card to unlock a hidden photo & secret memory.
          </p>

          {/* Progress Indicator */}
          <div className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-full border border-warm-400/20 bg-dark-900/60 text-xs font-sans tracking-widest text-warm-200/70 uppercase">
            <span>Unlocked {unlockedIds.size} of {birthdayConfig.photos.length} Memories</span>
            {unlockedIds.size === birthdayConfig.photos.length && (
              <span className="text-amber-400">✨ All Revealed!</span>
            )}
          </div>
        </motion.div>

        {/* Mystery Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {birthdayConfig.photos.map((photo, index) => {
            const isUnlocked = unlockedIds.has(photo.id);

            return (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="perspective-1000"
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleUnlock(photo)}
                  className={`relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-500 min-h-[340px] flex flex-col ${
                    isUnlocked
                      ? 'border-warm-400/40 bg-dark-900/80 shadow-2xl shadow-warm-400/5'
                      : 'border-warm-400/20 bg-gradient-to-b from-dark-700 to-dark-900 hover:border-warm-400/50'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {!isUnlocked ? (
                      /* UNOPENED MYSTERY CARD */
                      <motion.div
                        key="locked"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, rotateY: 90 }}
                        transition={{ duration: 0.4 }}
                        className="flex-1 flex flex-col items-center justify-center p-8 text-center relative"
                      >
                        {/* Decorative Lock Badge */}
                        <div className="w-16 h-16 rounded-full border border-warm-400/30 bg-dark-800/80 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                          <span className="text-2xl font-display text-warm-300">🔒</span>
                        </div>

                        <span className="font-sans text-xs tracking-[0.25em] uppercase text-warm-200/40 mb-2">
                          Memory #{index + 1}
                        </span>

                        <h3 className="font-display text-xl text-warm-200 font-medium mb-3">
                          Tap to Unlock Secret
                        </h3>

                        <p className="font-elegant text-sm text-warm-200/40 italic">
                          A special moment waiting for you...
                        </p>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-warm-400/30" />
                      </motion.div>
                    ) : (
                      /* UNLOCKED PHOTO MEMORY CARD */
                      <motion.div
                        key="unlocked"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 flex flex-col h-full"
                      >
                        {/* Photo Image */}
                        <div className="relative h-56 w-full overflow-hidden bg-black">
                          <img
                            src={photo.url}
                            alt={photo.caption}
                            className="w-full h-full object-cover filter brightness-[0.9] hover:brightness-100 transition-all duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />

                          {/* Tag */}
                          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-dark-900/80 backdrop-blur-md border border-warm-400/30 text-[10px] font-sans tracking-widest text-warm-200 uppercase">
                            {photo.location || 'Special Moment'}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-display text-lg text-warm-200 font-medium mb-1">
                              {photo.memoryTitle || photo.caption}
                            </h4>
                            <p className="font-elegant text-sm text-warm-200/60 italic leading-relaxed mb-3">
                              "{photo.secretNote || photo.caption}"
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-warm-400/10 text-[11px] font-sans tracking-wider text-warm-300/60 uppercase">
                            <span>Tap to view full high-res</span>
                            <span>🔍</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal for Unlocked Photos */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative max-w-3xl w-full bg-dark-900 border border-warm-400/30 rounded-xl overflow-hidden shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 text-warm-200/50 hover:text-warm-200 text-sm font-sans tracking-widest uppercase transition-colors"
              >
                Close ✕
              </button>

              <div className="overflow-hidden rounded-lg mb-4 max-h-[65vh] flex justify-center bg-black">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption}
                  className="max-h-[65vh] w-auto object-contain"
                />
              </div>

              <div className="text-center pt-2">
                <h3 className="font-display text-2xl text-warm-200 font-medium mb-2">
                  {selectedPhoto.memoryTitle || 'Unforgettable Moment'}
                </h3>
                <p className="font-elegant text-lg text-warm-200/70 italic max-w-lg mx-auto mb-2">
                  "{selectedPhoto.secretNote || selectedPhoto.caption}"
                </p>
                <span className="text-xs font-sans tracking-widest text-warm-400/50 uppercase">
                  {selectedPhoto.location}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
