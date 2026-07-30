import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useConfig } from '../context/ConfigContext';
import { PhotoItem } from '../config/birthdayConfig';
import { soundEngine } from '../utils/audioSynth';
import { IntroSplash } from './IntroSplash';
import { 
  Sparkles, Music, VolumeX, Heart, Gift, Camera, ChevronRight, ChevronLeft, 
  Upload, Star, MessageCircle, Bookmark, Send, UserPlus, Settings, RotateCcw,
  Pause, Play
} from 'lucide-react';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const textItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// Typographic Word-by-Word Letter Animation Component
const TypographicAnimatedLetter: React.FC<{
  salutation: string;
  paragraphs: string[];
  closing: string;
  sender: string;
  animKey: number;
}> = ({ salutation, paragraphs, closing, sender, animKey }) => {
  let currentDelay = 0.2;
  const salutationDelay = currentDelay;
  currentDelay += 0.4;

  const paragraphDelays: number[] = [];
  paragraphs.forEach((pText) => {
    paragraphDelays.push(currentDelay);
    const words = pText.split(/\s+/);
    currentDelay += words.length * 0.045 + 0.35;
  });

  const closingDelay = currentDelay;
  const senderDelay = closingDelay + 0.6;

  return (
    <div key={animKey} className="space-y-3.5">
      {/* Salutation */}
      <motion.p
        initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, delay: salutationDelay, ease: [0.16, 1, 0.3, 1] }}
        className="font-cormorant text-xs md:text-sm font-bold uppercase text-coquette-pinkDeep tracking-widest"
      >
        {salutation}
      </motion.p>

      {/* Paragraphs with word-by-word reveal */}
      {paragraphs.map((pText, pIdx) => {
        const words = pText.split(' ');
        const pStartDelay = paragraphDelays[pIdx];

        return (
          <p
            key={pIdx}
            className="font-cormorant text-xs md:text-sm leading-relaxed italic text-coquette-roseDark flex flex-wrap gap-x-1.5 gap-y-1"
          >
            {words.map((word, wIdx) => {
              const wordDelay = pStartDelay + wIdx * 0.045;
              return (
                <motion.span
                  key={wIdx}
                  initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.55,
                    delay: wordDelay,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              );
            })}
          </p>
        );
      })}

      {/* Closing & Sender */}
      <div className="pt-2 flex flex-col items-start gap-1 border-t border-coquette-pink/30 mt-3">
        <motion.p
          initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: closingDelay, ease: 'easeOut' }}
          className="font-alex text-2xl md:text-3xl text-coquette-pinkDeep"
        >
          {closing}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, scale: 0.85, filter: 'blur(6px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: senderDelay, ease: [0.34, 1.56, 0.64, 1] }}
          className="font-serifTitle text-sm md:text-base font-bold text-coquette-roseDark flex items-center gap-2"
        >
          <span>FROM. {sender}</span>
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.6, delay: senderDelay + 0.3 }}
            className="inline-block text-coquette-pinkDeep text-base"
          >
            ❤️
          </motion.span>
        </motion.p>
      </div>
    </div>
  );
};

interface PresentationProps {
  onOpenAdmin?: () => void;
}

export const AestheticPresentation: React.FC<PresentationProps> = ({ onOpenAdmin }) => {
  const { config } = useConfig();
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);

  // Interactive states
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [isBlowing, setIsBlowing] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [letterAnimKey, setLetterAnimKey] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [customTrackName, setCustomTrackName] = useState(config.customTrackName || "Majboor — Cinematic Version");
  const [showIntroSplash, setShowIntroSplash] = useState(true);

  const totalSlides = 8;

  // Change slide with sound
  const paginate = (newDirection: number) => {
    soundEngine.playPop();
    const newPage = page + newDirection;
    if (newPage >= 0 && newPage < totalSlides) {
      setPage([newPage, newDirection]);
    }
  };

  const goToSlide = (slideIndex: number) => {
    soundEngine.playPop();
    setPage([slideIndex, slideIndex > page ? 1 : -1]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        if (page < totalSlides - 1) paginate(1);
      } else if (e.key === 'ArrowLeft') {
        if (page > 0) paginate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page]);

  const userManuallyPausedRef = useRef(false);

  // Sync custom song track name from config
  useEffect(() => {
    if (config.customTrackName) {
      setCustomTrackName(config.customTrackName);
    }
  }, [config.customTrackName]);

  // Autoplay background music by default on link open / first user interaction
  useEffect(() => {
    // Attempt playback immediately on mount
    soundEngine.startBackgroundMusic();
    const timer = setTimeout(() => {
      setIsPlayingMusic(soundEngine.getIsPlayingBg());
    }, 200);

    // Bypasses browser autoplay policy on first user interaction anywhere on screen
    const handleFirstInteraction = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('button')) return;

      if (!userManuallyPausedRef.current && !soundEngine.getIsPlayingBg()) {
        soundEngine.startBackgroundMusic();
        setTimeout(() => {
          setIsPlayingMusic(soundEngine.getIsPlayingBg());
        }, 100);
      }
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Candle blowing handler
  const handleBlowCandles = () => {
    if (candlesBlown || isBlowing) return;
    setIsBlowing(true);
    soundEngine.playBlowSound();

    setTimeout(() => {
      setCandlesBlown(true);
      setIsBlowing(false);
      soundEngine.playChime();

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f4b6c6', '#d84b75', '#ffffff', '#e8d5b7', '#f9cbd6'],
        zIndex: 100,
      });
    }, 600);
  };

  // Toggle music with explicit user pause flag and event stopPropagation
  const handleToggleMusic = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (soundEngine.getIsPlayingBg()) {
      userManuallyPausedRef.current = true;
      soundEngine.stopBackgroundMusic();
      setIsPlayingMusic(false);
    } else {
      userManuallyPausedRef.current = false;
      soundEngine.startBackgroundMusic();
      setTimeout(() => {
        setIsPlayingMusic(soundEngine.getIsPlayingBg());
      }, 100);
    }
  };

  // Custom audio upload handler
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      soundEngine.setCustomAudioUrl(url);
      setCustomTrackName(file.name);
      setIsPlayingMusic(true);
    }
  };

  // Cute next button labels per slide from config
  const slideNextLabels = [
    { text: config.slide1BtnText || "Begin Her Story 🎀", icon: <Sparkles className="w-4 h-4" /> },
    { text: config.slide2BtnText || "View Friendship Stats ✨", icon: <Star className="w-4 h-4" /> },
    { text: config.slide3BtnText || "View Instagram Collage 📸", icon: <Camera className="w-4 h-4" /> },
    { text: config.slide4BtnText || "Make A Birthday Wish 🎂", icon: <Gift className="w-4 h-4" /> },
    { text: config.slide5BtnText || "Explore Photo Memories 🖼️", icon: <Camera className="w-4 h-4" /> },
    { text: config.slide6BtnText || "Read Heartfelt Postcard 💌", icon: <Heart className="w-4 h-4" /> },
    { text: config.slide7BtnText || "Final Celebration 🎉", icon: <Sparkles className="w-4 h-4" /> },
    { text: config.slide8BtnText || "Back to Start 🌸", icon: <ChevronRight className="w-4 h-4" /> },
  ];

  return (
    <>
      <AnimatePresence>
        {showIntroSplash && (
          <IntroSplash onComplete={() => setShowIntroSplash(false)} />
        )}
      </AnimatePresence>
      <div className="min-h-screen py-6 md:py-10 px-4 md:px-8 max-w-4xl mx-auto flex flex-col justify-between items-center relative font-sans">
      
      {/* Top Slide Counter & Audio Bar */}
      <div className="w-full flex justify-between items-center mb-3 px-2">
        <div className="flex items-center gap-3">
          <span className="font-cormorant text-xl font-bold italic text-coquette-pinkDeep">
            Slide {page + 1} of {totalSlides}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMusic}
            className={`px-4 py-1.5 rounded-full text-xs font-sans tracking-wider uppercase font-bold flex items-center gap-2 transition-all shadow-md ${
              isPlayingMusic 
                ? 'bg-coquette-pinkDeep text-white hover:bg-coquette-roseDark' 
                : 'bg-coquette-pink text-coquette-roseDark hover:bg-coquette-pinkDeep hover:text-white'
            }`}
          >
            {isPlayingMusic ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-white text-white" />
                <span>Pause Song ⏸️</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-coquette-roseDark text-coquette-roseDark" />
                <span>Play Song 🎵</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Presentation Container */}
      <div className="w-full relative min-h-[520px] md:min-h-[580px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          
          {/* SLIDE 0: /01 Cover */}
          {page === 0 && (
            <motion.div
              key="slide-0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full canva-card canva-card-cream p-6 md:p-12 min-h-[500px] md:min-h-[540px] flex flex-col justify-between border border-[#e8dacf]"
            >
              <div className="absolute -top-4 -left-4 z-20 w-24 h-24 pointer-events-none drop-shadow-md">
                <svg viewBox="0 0 100 90" fill="#f4b6c6">
                  <path d="M50 40 C30 10 0 10 10 40 C20 70 45 50 50 45 C55 50 80 70 90 40 C100 10 70 10 50 40 Z" fill="#f4b6c6" stroke="#d84b75" strokeWidth="2" />
                  <ellipse cx="50" cy="42" rx="8" ry="7" fill="#d84b75" />
                  <path d="M44 48 L25 85 L42 75 Z" fill="#f4b6c6" stroke="#d84b75" strokeWidth="1.5" />
                  <path d="M56 48 L75 85 L58 75 Z" fill="#f4b6c6" stroke="#d84b75" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="flex justify-between items-center text-coquette-pinkDeep pl-16">
                <span className="font-cormorant text-2xl font-bold italic tracking-widest">{config.page1Tag || "/01"}</span>
                <span className="font-sans text-xs tracking-widest uppercase opacity-70">{config.subtitle || "Aesthetic Birthday Deck"}</span>
              </div>

              <motion.div variants={textContainerVariants} initial="hidden" animate="visible" className="my-6 relative">
                <motion.div variants={textItemVariants} className="absolute -top-8 right-2 md:right-8 w-20 h-28 opacity-90 animate-ribbon pointer-events-none">
                  <svg viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="50" cy="50" rx="35" ry="45" stroke="#d84b75" strokeWidth="4" fill="#fdfbf7" />
                    <ellipse cx="50" cy="50" rx="28" ry="38" stroke="#f4b6c6" strokeWidth="2" fill="#fff5f7" />
                    <path d="M50 95 L50 135" stroke="#d84b75" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="50" cy="40" r="15" fill="rgba(244,182,198,0.3)" />
                  </svg>
                </motion.div>

                <motion.p variants={textItemVariants} className="font-alex text-4xl md:text-5xl text-coquette-pinkDeep mb-1">
                  {config.coverGreeting || "Happy Birthday"}
                </motion.p>

                <motion.h1 variants={textItemVariants} className="font-script text-6xl md:text-8xl lg:text-9xl text-coquette-roseDark leading-none font-bold">
                  {config.name}
                </motion.h1>

                <motion.p variants={textItemVariants} className="font-cormorant text-xl md:text-2xl text-[#6b3d4a] italic mt-4 max-w-lg">
                  "{config.openingLine}"
                </motion.p>
              </motion.div>

              <div className="flex justify-end pt-4 border-t border-[#ebdcd0]">
                <button
                  onClick={() => paginate(1)}
                  className="px-6 py-3 rounded-full bg-coquette-pinkDeep text-white font-sans font-bold text-xs tracking-wider uppercase flex items-center gap-2 hover:bg-coquette-roseDark transition-all duration-300 shadow-md hover:scale-105"
                >
                  <span>{slideNextLabels[0].text}</span>
                  {slideNextLabels[0].icon}
                </button>
              </div>
            </motion.div>
          )}

          {/* SLIDE 1: /02 About Her */}
          {page === 1 && (
            <motion.div
              key="slide-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full canva-card canva-card-pink p-6 md:p-12 min-h-[500px] md:min-h-[540px] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center text-coquette-roseDark">
                <span className="font-cormorant text-2xl font-bold italic tracking-widest">{config.page2Tag || "/02"}</span>
                <span className="font-alex text-3xl">{config.aboutTag || "Hi there"}</span>
              </div>

              <motion.div variants={textContainerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-4">
                <motion.div variants={textItemVariants} className="torn-paper p-5 md:p-7 rounded-sm text-coquette-roseDark relative">
                  <div className="washi-tape-white -top-3 left-6 rotate-[-3deg]" />
                  <h3 className="font-script text-4xl text-coquette-pinkDeep mb-2">{config.aboutTitle}</h3>
                  <p className="font-cormorant text-lg leading-relaxed italic mb-3">
                    "{config.aboutQuote}"
                  </p>
                  <div className="space-y-1 text-xs font-sans text-coquette-roseDark/80">
                    <p>🌸 <strong>{config.vibeLabel || "Vibe"}:</strong> {config.vibe}</p>
                    <p>👑 <strong>{config.superpowerLabel || "Superpower"}:</strong> {config.superpower}</p>
                    <p>💖 <strong>{config.statusLabel || "Status"}:</strong> {config.status}</p>
                  </div>
                </motion.div>

                <motion.div variants={textItemVariants} className="relative flex flex-col items-center justify-center">
                  <div className="w-0.5 h-8 bg-coquette-pinkDeep/60 mb-[-4px] z-10" />
                  <div className="w-48 h-44 bg-coquette-pinkLight border border-coquette-pinkDeep/30 rounded-full flex flex-col items-center justify-center p-4 text-center shadow-lg relative mb-4 rotate-[-4deg]">
                    <span className="font-cormorant text-xs font-bold text-coquette-roseDark italic">
                      "{config.heartTagQuote}"
                    </span>
                  </div>

                  {config.photos[0] && (
                    <div
                      className="relative w-44 h-44 bg-white p-2 rounded-2xl shadow-xl cursor-pointer group rotate-[3deg]"
                      onClick={() => setSelectedPhoto(config.photos[0])}
                    >
                      <div className="washi-tape-white -top-2 right-4" />
                      <img src={config.photos[0].url} alt="Photo 1" className="w-full h-full object-cover rounded-xl filter brightness-95 group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                </motion.div>
              </motion.div>

              <div className="flex justify-between items-center pt-4 border-t border-coquette-roseDark/20">
                <button onClick={() => paginate(-1)} className="text-xs font-sans font-bold text-coquette-roseDark/70 hover:text-coquette-roseDark uppercase">
                  ← Prev
                </button>
                <button
                  onClick={() => paginate(1)}
                  className="px-6 py-3 rounded-full bg-white text-coquette-roseDark font-sans font-bold text-xs tracking-wider uppercase flex items-center gap-2 hover:bg-coquette-pinkLight transition-all duration-300 shadow-md hover:scale-105"
                >
                  <span>{slideNextLabels[1].text}</span>
                  {slideNextLabels[1].icon}
                </button>
              </div>
            </motion.div>
          )}

          {/* SLIDE 2: /03 Friendship Stats */}
          {page === 2 && (
            <motion.div
              key="slide-2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full canva-card canva-card-cream p-6 md:p-12 min-h-[500px] md:min-h-[540px] flex flex-col justify-between border border-[#e8dacf]"
            >
              <div className="flex justify-between items-center text-coquette-pinkDeep">
                <span className="font-cormorant text-2xl font-bold italic tracking-widest">{config.page3Tag || "/03"}</span>
                <span className="font-alex text-4xl">{config.statsTag || config.statsTitle || "Friendship stats"}</span>
              </div>

              <motion.div variants={textContainerVariants} initial="hidden" animate="visible" className="my-4">
                <motion.p variants={textItemVariants} className="font-cormorant text-xl text-center text-coquette-roseDark italic mb-6">
                  "{config.statsSubtitle}"
                </motion.p>

                <motion.div variants={textItemVariants} className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                  {config.stats.map((stat, idx) => (
                    <div key={idx} className="torn-paper p-4 rounded-sm flex items-center gap-3">
                      <span className="font-script text-4xl text-coquette-pinkDeep font-bold">{stat.number}</span>
                      <span className="font-cormorant text-xs text-coquette-roseDark italic leading-tight">{stat.label}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              <div className="flex justify-between items-center pt-4 border-t border-[#ebdcd0]">
                <button onClick={() => paginate(-1)} className="text-xs font-sans font-bold text-coquette-roseDark/70 hover:text-coquette-roseDark uppercase">
                  ← Prev
                </button>
                <button
                  onClick={() => paginate(1)}
                  className="px-6 py-3 rounded-full bg-coquette-pinkDeep text-white font-sans font-bold text-xs tracking-wider uppercase flex items-center gap-2 hover:bg-coquette-roseDark transition-all duration-300 shadow-md hover:scale-105"
                >
                  <span>{slideNextLabels[2].text}</span>
                  {slideNextLabels[2].icon}
                </button>
              </div>
            </motion.div>
          )}

          {/* SLIDE 3: /04 Instagram Scrapbook */}
          {page === 3 && (
            <motion.div
              key="slide-3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full canva-card canva-card-pink p-5 md:p-8 min-h-[500px] md:min-h-[540px] flex flex-col justify-between text-coquette-roseDark relative overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <span className="font-cormorant text-2xl font-bold italic tracking-widest">{config.page4Tag || "/04"}</span>
                <span className="font-alex text-4xl">{config.instaTag || "Insta collage"}</span>
              </div>

              <motion.div variants={textContainerVariants} initial="hidden" animate="visible" className="relative my-2 h-[350px] md:h-[370px] flex items-center justify-center">
                {config.photos[0] && (
                  <motion.div
                    variants={textItemVariants}
                    className="absolute left-2 md:left-8 top-2 w-48 md:w-56 bg-white rounded-xl shadow-xl p-3 border border-coquette-pink/40 rotate-[-6deg] z-10 cursor-pointer group"
                    onClick={() => setSelectedPhoto(config.photos[0])}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-coquette-pinkDeep text-white font-bold text-[9px] flex items-center justify-center">
                          BFF
                        </div>
                        <span className="text-[10px] font-sans font-bold text-coquette-roseDark">{config.igHandle1 || "bestie.birthday"}</span>
                      </div>
                      <UserPlus className="w-3.5 h-3.5 text-coquette-pinkDeep" />
                    </div>
                    <div className="w-full h-36 md:h-40 rounded-lg overflow-hidden mb-2">
                      <img src={config.photos[0].url} alt="IG 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex items-center justify-between text-coquette-pinkDeep">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 fill-coquette-pinkDeep" />
                        <MessageCircle className="w-4 h-4" />
                        <Send className="w-4 h-4" />
                      </div>
                      <Bookmark className="w-4 h-4" />
                    </div>
                  </motion.div>
                )}

                {config.photos[1] && (
                  <motion.div
                    variants={textItemVariants}
                    className="absolute right-4 md:right-16 top-10 w-52 md:w-60 bg-white rounded-xl shadow-2xl p-3 border border-coquette-pinkDeep/30 rotate-[4deg] z-20 cursor-pointer group"
                    onClick={() => setSelectedPhoto(config.photos[1])}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-coquette-pinkDeep text-white font-bold text-[9px] flex items-center justify-center">
                          ✨
                        </div>
                        <span className="text-[10px] font-sans font-bold text-coquette-roseDark">{config.igHandle2 || "birthday.queen"}</span>
                      </div>
                      <UserPlus className="w-3.5 h-3.5 text-coquette-pinkDeep" />
                    </div>
                    <div className="w-full h-40 md:h-44 rounded-lg overflow-hidden mb-2">
                      <img src={config.photos[1].url} alt="IG 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex items-center justify-between text-coquette-pinkDeep">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 fill-coquette-pinkDeep" />
                        <MessageCircle className="w-4 h-4" />
                        <Send className="w-4 h-4" />
                      </div>
                      <Bookmark className="w-4 h-4" />
                    </div>
                  </motion.div>
                )}

                <motion.div
                  variants={textItemVariants}
                  className="absolute left-6 md:left-24 bottom-2 w-60 md:w-72 bg-[#fffdf9] p-4 rounded-xl shadow-xl border border-coquette-pink/30 rotate-[-2deg] z-30"
                >
                  <div className="washi-tape-white -top-2 left-8" />
                  <h4 className="font-script text-3xl text-coquette-pinkDeep mb-1">{config.instaTitle}</h4>
                  <p className="font-cormorant text-xs md:text-sm text-coquette-roseDark leading-snug italic">
                    "{config.instaNote}"
                  </p>
                  <div className="mt-2 text-right">
                    <span className="font-alex text-xl text-coquette-pinkDeep">{config.instaSignoff || "Forever BFF!"}</span>
                  </div>
                </motion.div>

                <motion.div
                  variants={textItemVariants}
                  className="absolute right-2 md:right-8 bottom-4 flex flex-col gap-2 z-30"
                >
                  <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-coquette-pinkDeep/30 text-[10px] font-sans font-bold text-coquette-roseDark shadow-md flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>{config.badge1}</span>
                  </div>

                  <div className="px-3 py-1.5 rounded-full bg-coquette-roseDark text-white text-[10px] font-sans font-bold shadow-md">
                    {config.badge2}
                  </div>
                </motion.div>
              </motion.div>

              <div className="flex justify-between items-center pt-3 border-t border-coquette-roseDark/20">
                <button onClick={() => paginate(-1)} className="text-xs font-sans font-bold text-coquette-roseDark/70 hover:text-coquette-roseDark uppercase">
                  ← Prev
                </button>
                <button
                  onClick={() => paginate(1)}
                  className="px-6 py-3 rounded-full bg-white text-coquette-roseDark font-sans font-bold text-xs tracking-wider uppercase flex items-center gap-2 hover:bg-coquette-pinkLight transition-all duration-300 shadow-md hover:scale-105"
                >
                  <span>{slideNextLabels[3].text}</span>
                  {slideNextLabels[3].icon}
                </button>
              </div>
            </motion.div>
          )}

          {/* SLIDE 4: /05 Candle Blowing Cake */}
          {page === 4 && (
            <motion.div
              key="slide-4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full canva-card canva-card-pink p-6 md:p-12 min-h-[500px] md:min-h-[540px] flex flex-col justify-between text-coquette-roseDark"
            >
              <div className="flex justify-between items-center">
                <span className="font-cormorant text-2xl font-bold italic tracking-widest">{config.page5Tag || "/05"}</span>
                <span className="font-alex text-4xl">{config.cakeTag || "Make a wish"}</span>
              </div>

              <div className="text-center my-2 flex flex-col items-center">
                <h2 className="font-script text-5xl text-coquette-roseDark font-bold mb-1">{config.cakeTitle || "Birthday Cake 🎂"}</h2>
                <p className="font-cormorant text-lg italic opacity-90 mb-3">
                  {config.cakeWishPrompt}
                </p>

                <div className="relative cursor-pointer group my-1" onClick={handleBlowCandles}>
                  <svg width="200" height="190" viewBox="0 0 300 300" className="drop-shadow-xl group-hover:scale-105 transition-transform duration-300">
                    <ellipse cx="150" cy="260" rx="110" ry="16" fill="#ffffff" opacity="0.8" />
                    <ellipse cx="150" cy="254" rx="90" ry="10" fill="#e8b0bd" opacity="0.6" />
                    <rect x="60" y="180" width="180" height="65" rx="12" fill="#ffffff" />
                    <path d="M60 180 Q80 200 100 180 T140 200 T180 180 T220 200 T240 180 V230 C240 240 230 245 220 245 H80 C70 245 60 240 60 230 Z" fill="#f9cbd6" />
                    <rect x="90" y="125" width="120" height="55" rx="10" fill="#ffffff" />
                    <path d="M90 125 Q105 140 120 125 T150 140 T180 125 T210 125 V170 C210 175 205 180 195 180 H105 C95 180 90 175 90 170 Z" fill="#f4b6c6" />
                    <circle cx="110" cy="120" r="7" fill="#d84b75" />
                    <circle cx="150" cy="116" r="8" fill="#d84b75" />
                    <circle cx="190" cy="120" r="7" fill="#d84b75" />
                    <rect x="120" y="75" width="7" height="40" rx="2" fill="#fffdf9" />
                    <rect x="146.5" y="65" width="7" height="50" rx="2" fill="#fffdf9" />
                    <rect x="173" y="75" width="7" height="40" rx="2" fill="#fffdf9" />
                    <AnimatePresence>
                      {!candlesBlown && (
                        <g id="flames">
                          <ellipse cx="123.5" cy="62" rx="5" ry="9" fill="#ffb703" className="animate-pulse" />
                          <ellipse cx="150" cy="52" rx="6" ry="10" fill="#ffb703" className="animate-pulse" />
                          <ellipse cx="176.5" cy="62" rx="5" ry="9" fill="#ffb703" className="animate-pulse" />
                        </g>
                      )}
                    </AnimatePresence>
                  </svg>
                </div>

                {!candlesBlown ? (
                  <button
                    onClick={handleBlowCandles}
                    disabled={isBlowing}
                    className="mt-2 px-7 py-2.5 rounded-full bg-white text-coquette-roseDark font-sans font-bold text-xs tracking-wider uppercase shadow-lg hover:scale-105 transition-transform"
                  >
                    {isBlowing ? (config.cakeBlowingBtnText || 'Blowing Candles...') : (config.cakeBlowBtnText || 'Blow Out Candles 🕯️')}
                  </button>
                ) : (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-2">
                    <p className="font-alex text-3xl text-coquette-roseDark font-bold">{config.wishesUnlockedMessage}</p>
                  </motion.div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-coquette-roseDark/20">
                <button onClick={() => paginate(-1)} className="text-xs font-sans font-bold text-coquette-roseDark/70 hover:text-coquette-roseDark uppercase">
                  ← Prev
                </button>
                <button
                  onClick={() => paginate(1)}
                  className="px-6 py-3 rounded-full bg-white text-coquette-roseDark font-sans font-bold text-xs tracking-wider uppercase flex items-center gap-2 hover:bg-coquette-pinkLight transition-all duration-300 shadow-md hover:scale-105"
                >
                  <span>{slideNextLabels[4].text}</span>
                  {slideNextLabels[4].icon}
                </button>
              </div>
            </motion.div>
          )}

          {/* SLIDE 5: /06 Photo Gallery */}
          {page === 5 && (
            <motion.div
              key="slide-5"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full canva-card canva-card-cream p-6 md:p-12 min-h-[500px] md:min-h-[540px] flex flex-col justify-between border border-[#e8dacf]"
            >
              <div className="flex justify-between items-center text-coquette-pinkDeep">
                <span className="font-cormorant text-2xl font-bold italic tracking-widest">{config.page6Tag || "/06"}</span>
                <span className="font-alex text-4xl">{config.photosTag || "Favorite moments"}</span>
              </div>

              <motion.div variants={textContainerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
                {config.photos.slice(2, 5).map((photo) => (
                  <motion.div
                    key={photo.id}
                    variants={textItemVariants}
                    className="bg-white p-2.5 rounded-xl shadow-md border border-coquette-pink/30 hover:scale-105 transition-transform cursor-pointer group"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div className="washi-tape-white -top-2 left-1/2 -translate-x-1/2" />
                    <img src={photo.url} alt={photo.caption} className="w-full h-40 object-cover rounded-lg mb-2" />
                    <p className="font-cormorant text-xs text-center text-coquette-roseDark italic truncate">
                      {photo.caption}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="flex justify-between items-center pt-4 border-t border-[#ebdcd0]">
                <button onClick={() => paginate(-1)} className="text-xs font-sans font-bold text-coquette-roseDark/70 hover:text-coquette-roseDark uppercase">
                  ← Prev
                </button>
                <button
                  onClick={() => paginate(1)}
                  className="px-6 py-3 rounded-full bg-coquette-pinkDeep text-white font-sans font-bold text-xs tracking-wider uppercase flex items-center gap-2 hover:bg-coquette-roseDark transition-all duration-300 shadow-md hover:scale-105"
                >
                  <span>{slideNextLabels[5].text}</span>
                  {slideNextLabels[5].icon}
                </button>
              </div>
            </motion.div>
          )}

          {/* SLIDE 6: /07 Vintage Postcard Letter with Typographic Animation */}
          {page === 6 && (
            <motion.div
              key="slide-6"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full canva-card canva-card-pink p-6 md:p-10 min-h-[500px] md:min-h-[540px] flex flex-col justify-between text-coquette-roseDark relative"
            >
              <div className="absolute -top-4 -left-4 z-20 w-24 h-24 pointer-events-none drop-shadow-md">
                <svg viewBox="0 0 100 90" fill="#f4b6c6">
                  <path d="M50 40 C30 10 0 10 10 40 C20 70 45 50 50 45 C55 50 80 70 90 40 C100 10 70 10 50 40 Z" fill="#f4b6c6" stroke="#d84b75" strokeWidth="2" />
                  <ellipse cx="50" cy="42" rx="8" ry="7" fill="#d84b75" />
                  <path d="M44 48 L25 85 L42 75 Z" fill="#f4b6c6" stroke="#d84b75" strokeWidth="1.5" />
                  <path d="M56 48 L75 85 L58 75 Z" fill="#f4b6c6" stroke="#d84b75" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="flex justify-between items-center pl-16">
                <span className="font-cormorant text-2xl font-bold italic tracking-widest">{config.page7Tag || "/07"}</span>
                <div className="flex items-center gap-3">
                  <span className="font-alex text-4xl">{config.letterTag || "Postcard letter"}</span>
                  {letterOpen && (
                    <button
                      onClick={() => {
                        soundEngine.playPop();
                        setLetterAnimKey((prev) => prev + 1);
                      }}
                      className="px-2.5 py-1 rounded-full bg-white/80 hover:bg-white text-coquette-roseDark text-[10px] font-sans font-bold flex items-center gap-1 shadow-sm transition-all"
                      title="Replay text animation"
                    >
                      <RotateCcw className="w-3 h-3 text-coquette-pinkDeep" />
                      <span>Replay Text</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="my-2">
                {!letterOpen ? (
                  <div className="text-center py-6 flex flex-col items-center justify-center min-h-[310px]">
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: [0, -6, 0], scale: 1 }}
                      transition={{
                        opacity: { duration: 0.6 },
                        y: { repeat: Infinity, duration: 3.5, ease: "easeInOut" }
                      }}
                      onClick={() => {
                        soundEngine.playChime();
                        setLetterOpen(true);
                      }}
                      className="relative w-72 md:w-84 h-48 bg-gradient-to-br from-[#fffdf9] via-[#fdf7f2] to-[#fcefe8] rounded-xl shadow-2xl border border-coquette-pink/60 p-5 flex flex-col items-center justify-between cursor-pointer group hover:shadow-coquette-pink/40 transition-all duration-500"
                    >
                      <div className="washi-tape-white -top-3 left-1/2 -translate-x-1/2" />
                      <div className="w-full flex justify-between items-center text-[10px] font-sans font-bold text-coquette-roseDark/60 uppercase tracking-widest">
                        <span>AIR MAIL</span>
                        <span>CONFIDENTIAL</span>
                      </div>

                      <div className="w-14 h-14 rounded-full bg-[#8b1e3f] border-2 border-[#d84b75] shadow-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 z-10 my-auto">
                        <span className="text-2xl animate-pulse">🌹</span>
                      </div>

                      <div className="z-10 text-center space-y-0.5">
                        <p className="font-cormorant text-xs font-bold text-coquette-roseDark/80 uppercase tracking-widest">
                          {config.letterBadge || `A Letter For ${config.name} 💌`}
                        </p>
                        <p className="font-alex text-xl text-coquette-pinkDeep">
                          Tap to open smooth letter ✨
                        </p>
                      </div>
                    </motion.div>

                    <button
                      onClick={() => {
                        soundEngine.playChime();
                        setLetterOpen(true);
                      }}
                      className="mt-6 px-8 py-3.5 rounded-full bg-coquette-pinkDeep text-white font-sans font-bold text-xs tracking-wider uppercase shadow-xl hover:bg-coquette-roseDark transition-all duration-300 flex items-center gap-2 hover:scale-105"
                    >
                      <span>{config.letterOpenBtnText || "Open Postcard Letter 💌"}</span>
                    </button>
                  </div>
                ) : (
                  <motion.div
                    key={`postcard-open-${letterAnimKey}`}
                    initial={{ opacity: 0, scale: 0.92, rotateX: -12, y: 25 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="torn-paper p-5 md:p-7 rounded-sm text-coquette-roseDark relative grid grid-cols-1 md:grid-cols-5 gap-4 max-h-[370px] overflow-y-auto"
                  >
                    <div className="absolute -top-3 right-6 z-20 w-12 h-12 rounded-full bg-[#8b1e3f] border-2 border-[#d84b75] shadow-lg flex items-center justify-center text-white">
                      <span className="text-sm">🌹</span>
                    </div>

                    <div className="md:col-span-3 space-y-2 border-r-0 md:border-r border-coquette-pink/40 pr-0 md:pr-4">
                      <TypographicAnimatedLetter
                        salutation={config.letter.salutation}
                        paragraphs={config.letter.paragraphs}
                        closing={config.letter.closing}
                        sender={config.letter.sender}
                        animKey={letterAnimKey}
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-col items-center justify-center gap-3 relative pt-2 md:pt-0">
                      {config.photos[0] && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.6, rotate: -15, y: -10 }}
                          animate={{ opacity: 1, scale: 1, rotate: -3, y: 0 }}
                          transition={{ duration: 0.7, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                          className="postage-stamp transform w-28 h-24 shadow-md"
                        >
                          <img src={config.photos[0].url} alt="Stamp 1" className="w-full h-full object-cover rounded-xs" />
                        </motion.div>
                      )}

                      {config.photos[1] && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.6, rotate: 15, y: 10 }}
                          animate={{ opacity: 1, scale: 1, rotate: 4, y: 0 }}
                          transition={{ duration: 0.7, delay: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                          className="postage-stamp transform w-28 h-24 shadow-md"
                        >
                          <img src={config.photos[1].url} alt="Stamp 2" className="w-full h-full object-cover rounded-xs" />
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, scale: 1.5, rotate: -45 }}
                        animate={{ opacity: 0.7, scale: 1, rotate: -15 }}
                        transition={{ duration: 0.6, delay: 1.1, ease: 'easeOut' }}
                        className="absolute bottom-1 right-1 w-16 h-16 rounded-full border-2 border-dashed border-coquette-roseDark/50 flex flex-col items-center justify-center pointer-events-none opacity-60"
                      >
                        <span className="text-[7px] font-sans font-bold uppercase tracking-widest text-coquette-roseDark">POSTAL SERVICE</span>
                        <span className="text-[9px] font-sans font-extrabold text-coquette-pinkDeep">2026</span>
                        <span className="text-[6px] font-sans text-coquette-roseDark/70">BESTIE AIRMAIL</span>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-coquette-roseDark/20">
                <button onClick={() => paginate(-1)} className="text-xs font-sans font-bold text-coquette-roseDark/70 hover:text-coquette-roseDark uppercase">
                  ← Prev
                </button>
                <button
                  onClick={() => paginate(1)}
                  className="px-6 py-3 rounded-full bg-white text-coquette-roseDark font-sans font-bold text-xs tracking-wider uppercase flex items-center gap-2 hover:bg-coquette-pinkLight transition-all duration-300 shadow-md hover:scale-105"
                >
                  <span>{slideNextLabels[6].text}</span>
                  {slideNextLabels[6].icon}
                </button>
              </div>
            </motion.div>
          )}

          {/* SLIDE 7: /08 Thank You & Celebration */}
          {page === 7 && (
            <motion.div
              key="slide-7"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full canva-card canva-card-cream p-6 md:p-12 min-h-[500px] md:min-h-[540px] flex flex-col justify-between border border-[#e8dacf] text-center"
            >
              <div className="flex justify-between items-center text-coquette-pinkDeep">
                <span className="font-cormorant text-2xl font-bold italic tracking-widest">{config.page8Tag || "/08"}</span>
                <span className="font-alex text-4xl">{config.thankYouTag || "Thank you"}</span>
              </div>

              <motion.div variants={textContainerVariants} initial="hidden" animate="visible" className="my-2 max-w-xl mx-auto space-y-3">
                <motion.h2 variants={textItemVariants} className="font-script text-5xl md:text-6xl text-coquette-roseDark font-bold">
                  {config.thankYouTitle || "Happy Birthday!"}
                </motion.h2>
                <motion.p variants={textItemVariants} className="font-cormorant text-lg text-[#5c3742] italic">
                  "{config.thankYouMessage || "Thank you for being the most genuine, beautiful, and awesome best friend. Here's to a lifetime of happiness!"}"
                </motion.p>

                {/* Music Widget */}
                <motion.div variants={textItemVariants} className="p-4 rounded-2xl bg-coquette-pinkLight/50 border border-coquette-pink/50 shadow-md flex flex-col items-center gap-2 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-coquette-pinkDeep text-white flex items-center justify-center animate-spin">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-sans text-xs font-bold text-coquette-roseDark">{customTrackName}</p>
                      <p className="font-sans text-[10px] text-coquette-roseDark/70">Cinematic Birthday Vibe</p>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleMusic}
                    className="px-5 py-1.5 rounded-full bg-coquette-roseDark text-white font-sans font-bold text-xs uppercase tracking-wider hover:bg-coquette-pinkDeep transition-colors shadow-sm"
                  >
                    {isPlayingMusic ? 'Pause Music' : 'Play Track 🎵'}
                  </button>
                </motion.div>
              </motion.div>

              <div className="flex justify-between items-center pt-4 border-t border-[#ebdcd0]">
                <button onClick={() => paginate(-1)} className="text-xs font-sans font-bold text-coquette-roseDark/70 hover:text-coquette-roseDark uppercase">
                  ← Prev
                </button>
                <button
                  onClick={() => goToSlide(0)}
                  className="px-6 py-3 rounded-full bg-coquette-pinkDeep text-white font-sans font-bold text-xs tracking-wider uppercase flex items-center gap-2 hover:bg-coquette-roseDark transition-all duration-300 shadow-md hover:scale-105"
                >
                  <span>{slideNextLabels[7].text}</span>
                  {slideNextLabels[7].icon}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Floating Bottom Pagination Dots Navigation */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={() => paginate(-1)}
          disabled={page === 0}
          className="w-9 h-9 rounded-full bg-white text-coquette-roseDark disabled:opacity-30 shadow-md flex items-center justify-center font-bold hover:bg-coquette-pink transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-md">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                page === i ? 'w-6 bg-coquette-pinkDeep' : 'w-2.5 bg-coquette-pink/60 hover:bg-coquette-pink'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => paginate(1)}
          disabled={page === totalSlides - 1}
          className="w-9 h-9 rounded-full bg-white text-coquette-roseDark disabled:opacity-30 shadow-md flex items-center justify-center font-bold hover:bg-coquette-pink transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl p-4 relative"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-gray-700 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
              <img src={selectedPhoto.url} alt={selectedPhoto.caption} className="w-full h-80 object-cover rounded-xl mb-4" />
              <p className="font-script text-2xl text-coquette-pinkDeep mb-1">{selectedPhoto.memoryTitle || "Special Memory"}</p>
              <p className="font-cormorant text-base italic text-coquette-roseDark mb-2">{selectedPhoto.caption}</p>
              {selectedPhoto.secretNote && (
                <p className="font-sans text-xs bg-coquette-pinkLight p-3 rounded-lg text-coquette-roseDark border border-coquette-pinkDeep/20">
                  💌 {selectedPhoto.secretNote}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
    </>
  );
};
