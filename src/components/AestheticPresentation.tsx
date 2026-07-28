import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { birthdayConfig, PhotoItem } from '../config/birthdayConfig';
import { soundEngine } from '../utils/audioSynth';
import { Sparkles, Music, VolumeX, Heart, Gift, Camera, ChevronRight, ChevronLeft, Upload, Star, MessageCircle, Bookmark, Send, UserPlus } from 'lucide-react';

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

export const AestheticPresentation: React.FC = () => {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  
  // Interactive states
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [isBlowing, setIsBlowing] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [customTrackName, setCustomTrackName] = useState("Majboor — Cinematic Autotune Version");

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

  // Toggle music
  const handleToggleMusic = () => {
    const playing = soundEngine.toggleBackgroundMusic();
    setIsPlayingMusic(playing);
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

  // Cute next button labels per slide
  const slideNextLabels = [
    { text: "Begin Her Story 🎀", icon: <Sparkles className="w-4 h-4" /> },
    { text: "View Friendship Stats ✨", icon: <Star className="w-4 h-4" /> },
    { text: "View Instagram Collage 📸", icon: <Camera className="w-4 h-4" /> },
    { text: "Make A Birthday Wish 🎂", icon: <Gift className="w-4 h-4" /> },
    { text: "Explore Photo Memories 🖼️", icon: <Camera className="w-4 h-4" /> },
    { text: "Read Heartfelt Postcard 💌", icon: <Heart className="w-4 h-4" /> },
    { text: "Final Celebration 🎉", icon: <Sparkles className="w-4 h-4" /> },
    { text: "Back to Start 🌸", icon: <ChevronRight className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen py-6 md:py-10 px-4 md:px-8 max-w-4xl mx-auto flex flex-col justify-between items-center relative">
      
      {/* Floating Audio Control Bar */}
      <div className="w-full flex justify-between items-center mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="font-cormorant text-xl font-bold italic text-coquette-pinkDeep">
            Slide {page + 1} of {totalSlides}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMusic}
            className="px-4 py-1.5 rounded-full bg-coquette-pink text-coquette-roseDark text-xs font-sans tracking-wider uppercase font-bold flex items-center gap-2 hover:bg-coquette-pinkDeep hover:text-white transition-colors shadow-sm"
          >
            {isPlayingMusic ? <Music className="w-3.5 h-3.5 animate-spin" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="truncate max-w-[120px] md:max-w-none">
              {isPlayingMusic ? 'Majboor Playing 🎵' : 'Play Song 🎵'}
            </span>
          </button>

          <label className="cursor-pointer text-xs font-sans text-coquette-roseDark/70 hover:text-coquette-roseDark underline hidden sm:flex items-center gap-1">
            <Upload className="w-3 h-3" />
            <span>Upload MP3</span>
            <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Presentation Container */}
      <div className="w-full relative min-h-[520px] md:min-h-[580px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          
          {/* SLIDE 0: /01 Cover with Satin Silk Bow */}
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
                <span className="font-cormorant text-2xl font-bold italic tracking-widest">/01</span>
                <span className="font-sans text-xs tracking-widest uppercase opacity-70">Aesthetic Birthday Deck</span>
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
                  Happy Birthday
                </motion.p>

                <motion.h1 variants={textItemVariants} className="font-script text-6xl md:text-8xl lg:text-9xl text-coquette-roseDark leading-none font-bold">
                  {birthdayConfig.name}
                </motion.h1>

                <motion.p variants={textItemVariants} className="font-cormorant text-xl md:text-2xl text-[#6b3d4a] italic mt-4 max-w-lg">
                  "{birthdayConfig.openingLine}"
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

          {/* SLIDE 1: /02 Hi there / Heart Tag & Photo */}
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
                <span className="font-cormorant text-2xl font-bold italic tracking-widest">/02</span>
                <span className="font-alex text-3xl">Hi there</span>
              </div>

              <motion.div variants={textContainerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-4">
                <motion.div variants={textItemVariants} className="torn-paper p-5 md:p-7 rounded-sm text-coquette-roseDark relative">
                  <div className="washi-tape-white -top-3 left-6 rotate-[-3deg]" />
                  <h3 className="font-script text-4xl text-coquette-pinkDeep mb-2">About You ✨</h3>
                  <p className="font-cormorant text-lg leading-relaxed italic mb-3">
                    "You carry a kind of grace that doesn't try to impress anyone, yet impresses everyone effortlessly."
                  </p>
                  <div className="space-y-1 text-xs font-sans text-coquette-roseDark/80">
                    <p>🌸 <strong>Vibe:</strong> Pure Sunshine & Aesthetic Grace</p>
                    <p>👑 <strong>Superpower:</strong> Making everyone feel special</p>
                    <p>💖 <strong>Status:</strong> The undisputed queen of our hearts</p>
                  </div>
                </motion.div>

                <motion.div variants={textItemVariants} className="relative flex flex-col items-center justify-center">
                  <div className="w-0.5 h-8 bg-coquette-pinkDeep/60 mb-[-4px] z-10" />
                  <div className="w-48 h-44 bg-coquette-pinkLight border border-coquette-pinkDeep/30 rounded-full flex flex-col items-center justify-center p-4 text-center shadow-lg relative mb-4 rotate-[-4deg]">
                    <span className="font-cormorant text-xs font-bold text-coquette-roseDark italic">
                      "Your task is to stay happy: ours is to love you forever."
                    </span>
                  </div>

                  <div
                    className="relative w-44 h-44 bg-white p-2 rounded-2xl shadow-xl cursor-pointer group rotate-[3deg]"
                    onClick={() => setSelectedPhoto(birthdayConfig.photos[0])}
                  >
                    <div className="washi-tape-white -top-2 right-4" />
                    <img src={birthdayConfig.photos[0].url} alt="Photo 1" className="w-full h-full object-cover rounded-xl filter brightness-95 group-hover:scale-105 transition-transform duration-500" />
                  </div>
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
                <span className="font-cormorant text-2xl font-bold italic tracking-widest">/03</span>
                <span className="font-alex text-4xl">Friendship stats</span>
              </div>

              <motion.div variants={textContainerVariants} initial="hidden" animate="visible" className="my-4">
                <motion.p variants={textItemVariants} className="font-cormorant text-xl text-center text-coquette-roseDark italic mb-6">
                  "Some friendships are measured in days — ours is measured in unforgettable memories."
                </motion.p>

                <motion.div variants={textItemVariants} className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                  <div className="torn-paper p-4 rounded-sm flex items-center gap-3">
                    <span className="font-script text-4xl text-coquette-pinkDeep font-bold">365+</span>
                    <span className="font-cormorant text-xs text-coquette-roseDark italic leading-tight">Days of sunshine & smiles</span>
                  </div>

                  <div className="torn-paper p-4 rounded-sm flex items-center gap-3">
                    <span className="font-script text-4xl text-coquette-pinkDeep font-bold">1000+</span>
                    <span className="font-cormorant text-xs text-coquette-roseDark italic leading-tight">Inside jokes & laughs</span>
                  </div>

                  <div className="torn-paper p-4 rounded-sm flex items-center gap-3">
                    <span className="font-script text-4xl text-coquette-pinkDeep font-bold">01</span>
                    <span className="font-cormorant text-xs text-coquette-roseDark italic leading-tight">Best friend in the world</span>
                  </div>

                  <div className="torn-paper p-4 rounded-sm flex items-center gap-3">
                    <span className="font-script text-4xl text-coquette-pinkDeep font-bold">100%</span>
                    <span className="font-cormorant text-xs text-coquette-roseDark italic leading-tight">Pure heart of absolute gold</span>
                  </div>
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

          {/* 🌟 NEW SLIDE 3: /04 Instagram Aesthetic Scrapbook Collage (Matching Image 3) */}
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
                <span className="font-cormorant text-2xl font-bold italic tracking-widest">/04</span>
                <span className="font-alex text-4xl">Insta collage</span>
              </div>

              {/* Instagram Scrapbook Collage Layout (Matching Image 3 Aesthetic in Pink/Cream theme) */}
              <motion.div variants={textContainerVariants} initial="hidden" animate="visible" className="relative my-2 h-[350px] md:h-[370px] flex items-center justify-center">
                
                {/* 1. Left Instagram Post Card Mockup */}
                <motion.div
                  variants={textItemVariants}
                  className="absolute left-2 md:left-8 top-2 w-48 md:w-56 bg-white rounded-xl shadow-xl p-3 border border-coquette-pink/40 rotate-[-6deg] z-10 cursor-pointer group"
                  onClick={() => setSelectedPhoto(birthdayConfig.photos[0])}
                >
                  {/* IG Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-coquette-pinkDeep text-white font-bold text-[9px] flex items-center justify-center">
                        BFF
                      </div>
                      <span className="text-[10px] font-sans font-bold text-coquette-roseDark">bestie.birthday</span>
                    </div>
                    <UserPlus className="w-3.5 h-3.5 text-coquette-pinkDeep" />
                  </div>
                  {/* IG Photo */}
                  <div className="w-full h-36 md:h-40 rounded-lg overflow-hidden mb-2">
                    <img src={birthdayConfig.photos[0].url} alt="IG 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  {/* IG Action Icons */}
                  <div className="flex items-center justify-between text-coquette-pinkDeep">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 fill-coquette-pinkDeep" />
                      <MessageCircle className="w-4 h-4" />
                      <Send className="w-4 h-4" />
                    </div>
                    <Bookmark className="w-4 h-4" />
                  </div>
                </motion.div>

                {/* 2. Center Front Instagram Post Card Mockup */}
                <motion.div
                  variants={textItemVariants}
                  className="absolute right-4 md:right-16 top-10 w-52 md:w-60 bg-white rounded-xl shadow-2xl p-3 border border-coquette-pinkDeep/30 rotate-[4deg] z-20 cursor-pointer group"
                  onClick={() => setSelectedPhoto(birthdayConfig.photos[1])}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-coquette-pinkDeep text-white font-bold text-[9px] flex items-center justify-center">
                        ✨
                      </div>
                      <span className="text-[10px] font-sans font-bold text-coquette-roseDark">birthday.queen</span>
                    </div>
                    <UserPlus className="w-3.5 h-3.5 text-coquette-pinkDeep" />
                  </div>
                  <div className="w-full h-40 md:h-44 rounded-lg overflow-hidden mb-2">
                    <img src={birthdayConfig.photos[1].url} alt="IG 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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

                {/* 3. Open 3D Spiral Journal / Book Page (Matching Image 3) */}
                <motion.div
                  variants={textItemVariants}
                  className="absolute left-6 md:left-24 bottom-2 w-60 md:w-72 bg-[#fffdf9] p-4 rounded-xl shadow-xl border border-coquette-pink/30 rotate-[-2deg] z-30"
                >
                  <div className="washi-tape-white -top-2 left-8" />
                  <h4 className="font-script text-3xl text-coquette-pinkDeep mb-1">Happy Bestie Day!</h4>
                  <p className="font-cormorant text-xs md:text-sm text-coquette-roseDark leading-snug italic">
                    "Another year of chaos, another year of unshakeable friendship! Thanks for every single laugh, late-night chat, and memories we share."
                  </p>
                  <div className="mt-2 text-right">
                    <span className="font-alex text-xl text-coquette-pinkDeep">Forever BFF!</span>
                  </div>
                </motion.div>

                {/* 4. Aesthetic Pill Badges (Matching Image 3) */}
                <motion.div
                  variants={textItemVariants}
                  className="absolute right-2 md:right-8 bottom-4 flex flex-col gap-2 z-30"
                >
                  <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-coquette-pinkDeep/30 text-[10px] font-sans font-bold text-coquette-roseDark shadow-md flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Nikhil ONLINE 24/7 • Bestie Core</span>
                  </div>

                  <div className="px-3 py-1.5 rounded-full bg-coquette-roseDark text-white text-[10px] font-sans font-bold shadow-md">
                    1000+ Followers of Your Smiles ✨
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
                <span className="font-cormorant text-2xl font-bold italic tracking-widest">/05</span>
                <span className="font-alex text-4xl">Make a wish</span>
              </div>

              <div className="text-center my-2 flex flex-col items-center">
                <h2 className="font-script text-5xl text-coquette-roseDark font-bold mb-1">Birthday Cake 🎂</h2>
                <p className="font-cormorant text-lg italic opacity-90 mb-3">
                  Make a wish in your heart, then tap to blow out the candles!
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
                    {isBlowing ? 'Blowing Candles...' : 'Blow Out Candles 🕯️'}
                  </button>
                ) : (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-2">
                    <p className="font-alex text-3xl text-coquette-roseDark font-bold">✨ Wish Unlocked ✨</p>
                    <p className="font-cormorant text-base italic">Your wish has been sent to the universe!</p>
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
                <span className="font-cormorant text-2xl font-bold italic tracking-widest">/06</span>
                <span className="font-alex text-4xl">Favorite moments</span>
              </div>

              <motion.div variants={textContainerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
                {birthdayConfig.photos.slice(2, 5).map((photo) => (
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

          {/* SLIDE 6: /07 Vintage Postcard Letter */}
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
                <span className="font-cormorant text-2xl font-bold italic tracking-widest">/07</span>
                <span className="font-alex text-4xl">Postcard letter</span>
              </div>

              <div className="my-2">
                {!letterOpen ? (
                  <div className="text-center py-8 flex flex-col items-center">
                    <span className="px-4 py-1 rounded-full bg-white/90 text-coquette-roseDark text-xs font-sans font-bold uppercase tracking-wider mb-4 shadow-sm">
                      Ding-dong, please open! a letter for you has arrived 💌
                    </span>
                    <button
                      onClick={() => { soundEngine.playChime(); setLetterOpen(true); }}
                      className="px-8 py-4 rounded-2xl bg-white text-coquette-roseDark font-sans font-bold shadow-xl hover:scale-105 transition-transform border border-coquette-pinkDeep/30 flex items-center gap-3"
                    >
                      <span>Open Postcard Letter 💌</span>
                    </button>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="torn-paper p-5 md:p-7 rounded-sm text-coquette-roseDark relative grid grid-cols-1 md:grid-cols-5 gap-4 max-h-[360px] overflow-y-auto">
                    <div className="absolute -top-3 right-6 z-20 w-12 h-12 rounded-full bg-[#8b1e3f] border-2 border-[#d84b75] shadow-lg flex items-center justify-center text-white">
                      <span className="text-sm">🌹</span>
                    </div>

                    <div className="md:col-span-3 space-y-2 border-r-0 md:border-r border-coquette-pink/40 pr-0 md:pr-4">
                      <p className="font-cormorant text-xs font-bold uppercase text-coquette-pinkDeep">TO. {birthdayConfig.name}</p>
                      {birthdayConfig.letter.paragraphs.slice(0, 3).map((p, idx) => (
                        <p key={idx} className="font-cormorant text-xs md:text-sm leading-relaxed italic text-coquette-roseDark">
                          {p}
                        </p>
                      ))}
                      <div className="pt-2">
                        <p className="font-alex text-xl text-coquette-pinkDeep">{birthdayConfig.letter.closing}</p>
                        <p className="font-serifTitle text-sm font-bold">FROM. {birthdayConfig.letter.sender} ❤️</p>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex flex-col items-center justify-center gap-3 relative">
                      <div className="postage-stamp transform rotate-[-3deg] w-28 h-24">
                        <img src={birthdayConfig.photos[0].url} alt="Stamp 1" className="w-full h-full object-cover rounded-xs" />
                      </div>
                      <div className="postage-stamp transform rotate-[4deg] w-28 h-24">
                        <img src={birthdayConfig.photos[1].url} alt="Stamp 2" className="w-full h-full object-cover rounded-xs" />
                      </div>

                      <div className="absolute bottom-1 right-1 w-14 h-14 rounded-full border border-coquette-roseDark/40 flex flex-col items-center justify-center rotate-[-15deg] pointer-events-none opacity-60">
                        <span className="text-[8px] font-sans font-bold uppercase">POSTAL SERVICE</span>
                        <span className="text-[9px] font-sans font-bold">2026</span>
                      </div>
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
                <span className="font-cormorant text-2xl font-bold italic tracking-widest">/08</span>
                <span className="font-alex text-4xl">Thank you</span>
              </div>

              <motion.div variants={textContainerVariants} initial="hidden" animate="visible" className="my-2 max-w-xl mx-auto space-y-3">
                <motion.h2 variants={textItemVariants} className="font-script text-5xl md:text-6xl text-coquette-roseDark font-bold">
                  Happy Birthday!
                </motion.h2>
                <motion.p variants={textItemVariants} className="font-cormorant text-lg text-[#5c3742] italic">
                  "Thank you for being the most genuine, beautiful, and awesome best friend. Here's to a lifetime of happiness!"
                </motion.p>

                {/* Music Widget */}
                <motion.div variants={textItemVariants} className="p-4 rounded-2xl bg-coquette-pinkLight/50 border border-coquette-pink/50 shadow-md flex flex-col items-center gap-2 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-coquette-pinkDeep text-white flex items-center justify-center animate-spin">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-sans text-xs font-bold text-coquette-roseDark">{customTrackName}</p>
                      <p className="font-sans text-[10px] text-coquette-roseDark/70">Cinematic Autotune Vibe</p>
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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative max-w-2xl w-full bg-white p-6 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedPhoto(null)} className="absolute top-3 right-3 text-sm font-sans font-bold text-gray-500">✕ Close</button>
              <img src={selectedPhoto.url} alt={selectedPhoto.caption} className="w-full max-h-[70vh] object-contain rounded-xl mb-4" />
              <p className="font-cormorant text-xl text-center text-coquette-roseDark italic">"{selectedPhoto.caption}"</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
