import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { birthdayConfig } from '../config/birthdayConfig';

export const PhotoGallery: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<typeof birthdayConfig.photos[0] | null>(null);

  return (
    <section className="relative py-24 md:py-40 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-dark-900 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent z-10" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <div className="elegant-divider mb-8" />
          <p className="font-elegant text-lg text-warm-200/30 italic tracking-wider mb-4">
            Through my eyes
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-medium gold-gradient-text">
            Moments I'll Never Forget
          </h2>
        </motion.div>

        {/* Photo Grid — elegant 2x3 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {birthdayConfig.photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="photo-hover relative group cursor-pointer overflow-hidden aspect-[3/4] rounded-sm"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover filter brightness-[0.85] group-hover:brightness-100"
                loading="lazy"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end p-5">
                <p className="font-elegant text-base md:text-lg text-white/90 italic leading-relaxed">
                  {photo.caption}
                </p>
              </div>

              {/* Subtle border */}
              <div className="absolute inset-0 border border-white/[0.05] rounded-sm pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Quote between sections */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="text-center mt-24"
        >
          <div className="elegant-divider mb-8" />
          <p className="font-elegant text-xl md:text-2xl text-warm-200/25 italic max-w-xl mx-auto leading-relaxed">
            "{birthdayConfig.quotes[1]}"
          </p>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close hint */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-10 right-0 text-warm-200/30 text-sm font-sans tracking-widest uppercase hover:text-warm-200/60 transition-colors"
              >
                Close
              </button>

              <div className="overflow-hidden rounded-sm">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption}
                  className="w-full max-h-[75vh] object-contain"
                />
              </div>

              <p className="font-elegant text-lg md:text-xl text-warm-200/50 italic text-center mt-6 leading-relaxed">
                {selectedPhoto.caption}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
