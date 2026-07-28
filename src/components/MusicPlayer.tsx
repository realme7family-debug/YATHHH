import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { soundEngine } from '../utils/audioSynth';

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    const playing = soundEngine.toggleBackgroundMusic();
    setIsPlaying(playing);
  };

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
      onClick={toggleMusic}
      className="fixed bottom-6 right-6 z-40 w-10 h-10 flex items-center justify-center border border-warm-400/20 bg-dark-900/80 backdrop-blur-sm transition-all duration-500 hover:border-warm-400/40 hover:bg-dark-800/80 group"
      title={isPlaying ? 'Pause Music' : 'Play Music'}
    >
      {/* Animated sound bars */}
      <div className="flex items-end gap-[3px] h-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-[2px] bg-warm-400/50 group-hover:bg-warm-300/70 transition-colors"
            animate={
              isPlaying
                ? {
                    height: [4, 12 + i * 2, 6, 14 - i, 4],
                  }
                : {
                    height: 4,
                  }
            }
            transition={
              isPlaying
                ? {
                    repeat: Infinity,
                    duration: 0.8 + i * 0.15,
                    ease: 'easeInOut',
                  }
                : { duration: 0.3 }
            }
            style={{ height: 4 }}
          />
        ))}
      </div>
    </motion.button>
  );
};
