// Audio Synthesizer & Audio Track Engine for Birthday Experience

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isPlayingBg = false;
  private timer: number | null = null;
  private audioEle: HTMLAudioElement | null = null;
  private defaultAudioUrl: string = "/majboor.webm";
  private customAudioUrl: string | null = null;

  constructor() {
    // Pre-initialize HTML5 Audio element for Majboor track
    if (typeof window !== 'undefined') {
      this.audioEle = new Audio(this.defaultAudioUrl);
      this.audioEle.loop = true;
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Set custom audio URL (e.g. user upload)
  setCustomAudioUrl(url: string) {
    this.customAudioUrl = url;
    if (this.audioEle) {
      this.audioEle.src = url;
      if (this.isPlayingBg) {
        this.audioEle.play().catch(() => {});
      }
    }
  }

  // Blow out candles sound
  playBlowSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.5);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
      whiteNoise.stop(this.ctx.currentTime + 0.5);
    } catch {
      // Fallback
    }
  }

  // Soft warm pop
  playPop() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // Fallback
    }
  }

  // Chime sound
  playChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [329.63, 392.00, 493.88, 587.33, 659.25];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = this.ctx!.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.9);
      });
    } catch {
      // Fallback
    }
  }

  // Toggle background music (Plays downloaded Majboor track!)
  toggleBackgroundMusic(): boolean {
    this.initCtx();
    if (this.isPlayingBg) {
      this.stopBackgroundMusic();
      return false;
    } else {
      this.startBackgroundMusic();
      return true;
    }
  }

  getIsPlayingBg(): boolean {
    return this.isPlayingBg;
  }

  private startBackgroundMusic() {
    if (this.isPlayingBg) return;
    this.isPlayingBg = true;

    if (!this.audioEle) {
      const trackSrc = this.customAudioUrl || this.defaultAudioUrl;
      this.audioEle = new Audio(trackSrc);
      this.audioEle.loop = true;
    }

    this.audioEle.play().catch(() => {
      // If HTML5 audio is blocked by browser autoplay policy, fallback to synth
      this.startSynthFallback();
    });
  }

  private startSynthFallback() {
    const melody = [
      { note: 220.00, duration: 0.8 },
      { note: 261.63, duration: 0.8 },
      { note: 293.66, duration: 1.2 },
      { note: 329.63, duration: 1.4 },
      { note: 0, duration: 0.4 },

      { note: 329.63, duration: 0.8 },
      { note: 392.00, duration: 0.8 },
      { note: 349.23, duration: 1.2 },
      { note: 293.66, duration: 1.4 },
      { note: 0, duration: 0.4 },
    ];

    let noteIdx = 0;

    const playNextNote = () => {
      if (!this.isPlayingBg || !this.ctx) return;
      const item = melody[noteIdx];
      if (item.note > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(item.note, this.ctx.currentTime);
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + item.duration * 0.95);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + item.duration * 0.95);
      }
      noteIdx = (noteIdx + 1) % melody.length;
      this.timer = window.setTimeout(playNextNote, item.duration * 1000);
    };

    playNextNote();
  }

  stopBackgroundMusic() {
    this.isPlayingBg = false;
    if (this.audioEle) {
      this.audioEle.pause();
    }
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

export const soundEngine = new SoundEngine();
