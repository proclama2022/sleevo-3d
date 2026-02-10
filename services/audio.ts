// Audio service for managing background music and sound effects

import { ShopTheme } from '../types';

// Audio Settings Interface
export interface AudioSettings {
  musicVolume: number; // 0-1
  sfxVolume: number;   // 0-1
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

// Default settings
const DEFAULT_SETTINGS: AudioSettings = {
  musicVolume: 0.15, // Lowered from 0.2 to let SFX emerge
  sfxVolume: 0.7,    // Increased from 0.5 for better ASMR presence
  musicEnabled: true,
  sfxEnabled: true,
};

const SETTINGS_KEY = 'sleevo_audio_settings';

// Audio context for Web Audio API
let audioContext: AudioContext | null = null;

// Current playing music
let currentMusicSource: AudioBufferSourceNode | null = null;
let currentMusicGain: GainNode | null = null;
let currentTheme: ShopTheme | null = null;

// Settings state
let settings: AudioSettings = DEFAULT_SETTINGS;

/**
 * Initialize audio context
 * Must be called after user interaction (e.g., button click)
 */
export const initAudioContext = (): void => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  // Resume if suspended (iOS requirement)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
};

/**
 * Load audio settings from localStorage
 */
export const loadAudioSettings = (): AudioSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load audio settings:', error);
    settings = DEFAULT_SETTINGS;
  }
  return settings;
};

/**
 * Save audio settings to localStorage
 */
export const saveAudioSettings = (newSettings: Partial<AudioSettings>): void => {
  settings = { ...settings, ...newSettings };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save audio settings:', error);
  }
};

/**
 * Get current audio settings
 */
export const getAudioSettings = (): AudioSettings => {
  return { ...settings };
};

// ============================================
// BACKGROUND MUSIC GENERATION
// ============================================

/**
 * Generate theme-specific background music using Web Audio API
 * Each theme has a different tempo, chord progression, and feel
 */
const generateThemeMusic = (theme: ShopTheme): AudioBuffer => {
  if (!audioContext) {
    initAudioContext();
  }

  const ctx = audioContext!;
  const sampleRate = ctx.sampleRate;

  // Theme configurations
  const themeConfig = {
    Basement: {
      bpm: 90,
      chords: [
        { notes: [261.63, 329.63, 392.00], duration: 2 }, // C major
        { notes: [246.94, 311.13, 369.99], duration: 2 }, // B minor
        { notes: [220.00, 277.18, 329.63], duration: 2 }, // A minor
        { notes: [293.66, 369.99, 440.00], duration: 2 }, // D minor
      ],
      waveType: 'sine' as OscillatorType,
      reverb: 0.3,
    },
    Store: {
      bpm: 120,
      chords: [
        { notes: [261.63, 329.63, 392.00], duration: 1.5 }, // C major
        { notes: [293.66, 369.99, 440.00], duration: 1.5 }, // D major
        { notes: [329.63, 415.30, 493.88], duration: 1.5 }, // E major
        { notes: [293.66, 369.99, 440.00], duration: 1.5 }, // D major
      ],
      waveType: 'triangle' as OscillatorType,
      reverb: 0.2,
    },
    Expo: {
      bpm: 140,
      chords: [
        { notes: [261.63, 329.63, 392.00, 493.88], duration: 1 }, // C major 7
        { notes: [220.00, 277.18, 329.63, 440.00], duration: 1 }, // A minor 7
        { notes: [246.94, 311.13, 369.99, 493.88], duration: 1 }, // B minor 7
        { notes: [293.66, 369.99, 440.00, 554.37], duration: 1 }, // D major 7
      ],
      waveType: 'square' as OscillatorType,
      reverb: 0.4,
    },
  };

  const config = themeConfig[theme];
  const beatDuration = 60 / config.bpm;

  // Calculate total duration (loop all chords twice for variety)
  const totalBeats = config.chords.reduce((sum, chord) => sum + chord.duration, 0) * 2;
  const duration = totalBeats * beatDuration;

  // Create buffer
  const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);
  const channelL = buffer.getChannelData(0);
  const channelR = buffer.getChannelData(1);

  let currentTime = 0;

  // Generate music loop (play chords twice)
  for (let loop = 0; loop < 2; loop++) {
    for (const chord of config.chords) {
      const chordDuration = chord.duration * beatDuration;
      const chordSamples = Math.floor(chordDuration * sampleRate);
      const startSample = Math.floor(currentTime * sampleRate);

      // Generate chord tones
      for (let i = 0; i < chordSamples; i++) {
        const t = i / sampleRate;
        let sample = 0;

        // Mix all notes in the chord
        for (const freq of chord.notes) {
          const envelope = Math.exp(-2 * t / chordDuration); // Decay envelope

          if (config.waveType === 'sine') {
            sample += Math.sin(2 * Math.PI * freq * t) * envelope;
          } else if (config.waveType === 'triangle') {
            const period = 1 / freq;
            const phase = (t % period) / period;
            sample += (phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase) * envelope;
          } else if (config.waveType === 'square') {
            sample += (Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1) * envelope * 0.5;
          }
        }

        // Normalize by number of notes
        sample = sample / chord.notes.length * 0.3;

        // Apply slight reverb simulation (simple delay)
        const reverbDelay = Math.floor(0.05 * sampleRate);
        const reverbSample = startSample + i - reverbDelay;
        if (reverbSample >= 0) {
          sample += (channelL[reverbSample] || 0) * config.reverb * 0.3;
        }

        // Stereo panning for depth
        const pan = Math.sin(t * 0.5) * 0.2;
        const sampleIndex = startSample + i;
        if (sampleIndex < channelL.length) {
          channelL[sampleIndex] = sample * (0.5 + pan);
          channelR[sampleIndex] = sample * (0.5 - pan);
        }
      }

      currentTime += chordDuration;
    }
  }

  return buffer;
};

/**
 * Play or switch background music for a given theme
 */
export const playThemeMusic = (theme: ShopTheme): void => {
  if (!settings.musicEnabled) return;

  // Don't restart if already playing the same theme
  if (currentTheme === theme && currentMusicSource) return;

  // Stop current music
  stopMusic();

  initAudioContext();
  if (!audioContext) return;

  try {
    // Generate theme music
    const buffer = generateThemeMusic(theme);

    // Create source and gain nodes
    const source = audioContext.createBufferSource();
    const gain = audioContext.createGain();

    source.buffer = buffer;
    source.loop = true;

    gain.gain.value = settings.musicVolume;

    // Connect: source -> gain -> destination
    source.connect(gain);
    gain.connect(audioContext.destination);

    // Start playback
    source.start(0);

    // Store references
    currentMusicSource = source;
    currentMusicGain = gain;
    currentTheme = theme;
  } catch (error) {
    console.error('Failed to play theme music:', error);
  }
};

/**
 * Stop background music
 */
export const stopMusic = (): void => {
  if (currentMusicSource) {
    try {
      currentMusicSource.stop();
    } catch (e) {
      // Already stopped
    }
    currentMusicSource = null;
    currentMusicGain = null;
    currentTheme = null;
  }
};

/**
 * Update music volume
 */
export const setMusicVolume = (volume: number): void => {
  settings.musicVolume = Math.max(0, Math.min(1, volume));
  saveAudioSettings({ musicVolume: settings.musicVolume });

  if (currentMusicGain) {
    currentMusicGain.gain.value = settings.musicVolume;
  }
};

/**
 * Toggle music on/off
 */
export const toggleMusic = (enabled: boolean): void => {
  settings.musicEnabled = enabled;
  saveAudioSettings({ musicEnabled: enabled });

  if (!enabled) {
    stopMusic();
  } else if (currentTheme) {
    playThemeMusic(currentTheme);
  }
};

// ============================================
// SOUND EFFECTS
// ============================================

/**
 * Play a sound effect using Web Audio API
 */
const playSFX = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  envelope: 'attack' | 'decay' | 'sustain' = 'decay'
): void => {
  if (!settings.sfxEnabled) return;

  initAudioContext();
  if (!audioContext) return;

  try {
    const ctx = audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // Envelope shaping
    const now = ctx.currentTime;
    gainNode.gain.value = 0;

    if (envelope === 'attack') {
      gainNode.gain.linearRampToValueAtTime(settings.sfxVolume * 0.3, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    } else if (envelope === 'decay') {
      gainNode.gain.setValueAtTime(settings.sfxVolume * 0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    } else {
      gainNode.gain.setValueAtTime(settings.sfxVolume * 0.2, now);
      gainNode.gain.setValueAtTime(settings.sfxVolume * 0.2, now + duration * 0.8);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    }

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch (error) {
    console.error('Failed to play SFX:', error);
  }
};

/**
 * Play multi-tone SFX (for more complex sounds)
 */
const playMultiToneSFX = (
  tones: { freq: number; duration: number; delay?: number; type?: OscillatorType }[]
): void => {
  if (!settings.sfxEnabled) return;

  tones.forEach(tone => {
    setTimeout(() => {
      playSFX(tone.freq, tone.duration, tone.type || 'sine', 'decay');
    }, tone.delay || 0);
  });
};

// SFX Presets

export const sfx = {
  /**
   * Drag start - PHYSICAL MODELING tactile click
   * Short plastic/wood click using noise burst + filter
   */
  dragStart: () => {
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;
      const duration = 0.08; // Very short tactile click

      // Create sharp noise burst (plastic/wood contact)
      const clickBuffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
      const clickData = clickBuffer.getChannelData(0);

      for (let i = 0; i < clickData.length; i++) {
        const t = i / clickData.length;
        // Sharp exponential decay for click transient
        const decay = Math.exp(-t * 45);
        clickData[i] = (Math.random() * 2 - 1) * decay;
      }

      // Setup audio chain
      const source = ctx.createBufferSource();
      source.buffer = clickBuffer;

      // Bandpass filter for plastic/wood "click" character
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2200; // Mid-high frequency click
      filter.Q.value = 3; // Narrow band for sharp click

      const gain = ctx.createGain();
      gain.gain.value = settings.sfxVolume * 0.35; // Balanced with other sounds

      // Connect chain
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      // Play
      source.start(now);
      source.stop(now + duration);

    } catch (error) {
      console.error('Failed to play dragStart SFX:', error);
    }
  },

  /**
   * Drop success - PHYSICAL MODELING satisfying wooden clink
   * Short resonant tap with wood body resonance
   */
  dropSuccess: () => {
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;

      // Transient tap - sharp noise burst
      const tapBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const tapData = tapBuffer.getChannelData(0);
      for (let i = 0; i < tapData.length; i++) {
        const t = i / tapData.length;
        tapData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 60);
      }
      const tap = ctx.createBufferSource();
      tap.buffer = tapBuffer;
      const tapFilter = ctx.createBiquadFilter();
      tapFilter.type = 'bandpass';
      tapFilter.frequency.value = 1800;
      tapFilter.Q.value = 2;
      const tapGain = ctx.createGain();
      tapGain.gain.setValueAtTime(settings.sfxVolume * 0.25, now);
      tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      tap.connect(tapFilter);
      tapFilter.connect(tapGain);
      tapGain.connect(ctx.destination);
      tap.start(now);
      tap.stop(now + 0.04);

      // Wood body resonance - two modal frequencies
      [320, 480].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startLevel = settings.sfxVolume * (i === 0 ? 0.18 : 0.1);
        oscGain.gain.setValueAtTime(startLevel, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      });
    } catch (error) {
      console.error('Failed to play dropSuccess SFX:', error);
    }
  },

  /**
   * Drop error - PHYSICAL MODELING organic negative sound
   * Natural error sound using filtered noise + pitch down
   */
  dropError: () => {
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;
      const duration = 0.15; // Brief negative feedback

      // Create filtered noise buffer with pitch-down character
      const errorBuffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
      const errorData = errorBuffer.getChannelData(0);

      for (let i = 0; i < errorData.length; i++) {
        const t = i / errorData.length;
        // Envelope: quick attack, sustained, then decay
        const env = t < 0.1 ? t * 10 : (t < 0.7 ? 1 : (1 - t) / 0.3);
        errorData[i] = (Math.random() * 2 - 1) * env;
      }

      // Setup audio chain
      const source = ctx.createBufferSource();
      source.buffer = errorBuffer;

      // Lowpass filter for organic, non-synthetic "dull thud" character
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 250; // Low frequency = organic/natural
      lowpass.Q.value = 1.5;

      // Add slight resonance for "hollow" negative character
      const resonance = ctx.createBiquadFilter();
      resonance.type = 'peaking';
      resonance.frequency.value = 180;
      resonance.Q.value = 2;
      resonance.gain.value = 4; // Boost low resonance

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(settings.sfxVolume * 0.4, now);
      // Pitch down effect via exponential ramp
      gain.gain.exponentialRampToValueAtTime(settings.sfxVolume * 0.2, now + duration * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      // Connect chain: source -> lowpass -> resonance -> gain -> destination
      source.connect(lowpass);
      lowpass.connect(resonance);
      resonance.connect(gain);
      gain.connect(ctx.destination);

      // Play
      source.start(now);
      source.stop(now + duration);

    } catch (error) {
      console.error('Failed to play dropError SFX:', error);
    }
  },

  /**
   * Combo milestone - MODAL SYNTHESIS ascending resonant chimes
   * Multiple tuned metal resonances with increasing brightness
   */
  comboMilestone: (level: number) => {
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;
      const count = Math.min(level, 5);

      // Ascending tuned chime tones with modal synthesis
      const freqs = [520, 660, 780, 940, 1100];

      for (let i = 0; i < count; i++) {
        const startTime = now + i * 0.07;

        // Primary modal tone
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freqs[i];
        const vol = settings.sfxVolume * (0.12 + i * 0.02);
        oscGain.gain.setValueAtTime(vol, startTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.2);

        // Harmonic overtone (2x frequency, quieter)
        const harm = ctx.createOscillator();
        const harmGain = ctx.createGain();
        harm.type = 'sine';
        harm.frequency.value = freqs[i] * 2.02; // Slight detuning for shimmer
        harmGain.gain.setValueAtTime(vol * 0.3, startTime);
        harmGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
        harm.connect(harmGain);
        harmGain.connect(ctx.destination);
        harm.start(startTime);
        harm.stop(startTime + 0.12);

        // Attack transient - tiny noise click
        const clickBuf = ctx.createBuffer(1, ctx.sampleRate * 0.008, ctx.sampleRate);
        const clickData = clickBuf.getChannelData(0);
        for (let j = 0; j < clickData.length; j++) {
          clickData[j] = (Math.random() * 2 - 1) * Math.exp(-(j / clickData.length) * 20);
        }
        const click = ctx.createBufferSource();
        click.buffer = clickBuf;
        const clickGain = ctx.createGain();
        clickGain.gain.setValueAtTime(settings.sfxVolume * 0.08, startTime);
        click.connect(clickGain);
        clickGain.connect(ctx.destination);
        click.start(startTime);
        click.stop(startTime + 0.008);
      }
    } catch (error) {
      console.error('Failed to play comboMilestone SFX:', error);
    }
  },

  /**
   * Mystery reveal - GRANULAR SYNTHESIS magic sparkle
   * Ascendente, misterioso, ~200-300ms con multiple sine random pitch/delay
   */
  mysteryReveal: () => {
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;
      const duration = 0.25;

      // Granular synthesis: 15 sine grains con pitch ascendente e random delay
      const baseFreq = 600;
      const grainCount = 15;
      const pitchRange = 1400; // Salirà da 600Hz a 2000Hz

      for (let i = 0; i < grainCount; i++) {
        const grain = ctx.createOscillator();
        const grainGain = ctx.createGain();

        // Pitch ascendente con variazione casuale
        const pitchProgress = i / grainCount;
        const randomOffset = (Math.random() - 0.5) * 150;
        grain.frequency.value = baseFreq + (pitchRange * pitchProgress) + randomOffset;

        // Random delay per effetto sparkle (0-200ms)
        const grainDelay = Math.random() * 0.2;
        const grainStart = now + grainDelay;
        const grainDuration = 0.04 + Math.random() * 0.06; // 40-100ms per grain

        // Envelope per grain: attack veloce, decay naturale
        grainGain.gain.setValueAtTime(0, grainStart);
        grainGain.gain.linearRampToValueAtTime(settings.sfxVolume * 0.15, grainStart + 0.005);
        grainGain.gain.exponentialRampToValueAtTime(0.001, grainStart + grainDuration);

        grain.connect(grainGain);
        grainGain.connect(ctx.destination);

        grain.start(grainStart);
        grain.stop(grainStart + grainDuration);
      }

    } catch (error) {
      console.error('Failed to play mysteryReveal SFX:', error);
    }
  },

  /**
   * Achievement unlock - MODAL SYNTHESIS triumphant bell cascade
   * Rich bell tones with shimmering harmonics and reverb-like tail
   */
  achievementUnlock: () => {
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;

      // Bell cascade: 4 ascending tones with rich harmonics
      const notes = [
        { freq: 523, time: 0, dur: 0.4, vol: 0.14 },
        { freq: 659, time: 0.08, dur: 0.35, vol: 0.16 },
        { freq: 784, time: 0.16, dur: 0.35, vol: 0.18 },
        { freq: 1047, time: 0.24, dur: 0.5, vol: 0.2 },
      ];

      notes.forEach(note => {
        const t = now + note.time;
        const v = settings.sfxVolume * note.vol;

        // Fundamental
        const fund = ctx.createOscillator();
        const fundGain = ctx.createGain();
        fund.type = 'sine';
        fund.frequency.value = note.freq;
        fundGain.gain.setValueAtTime(v, t);
        fundGain.gain.exponentialRampToValueAtTime(0.001, t + note.dur);
        fund.connect(fundGain);
        fundGain.connect(ctx.destination);
        fund.start(t);
        fund.stop(t + note.dur);

        // Inharmonic partial (bell-like: freq * 2.76)
        const partial = ctx.createOscillator();
        const partialGain = ctx.createGain();
        partial.type = 'sine';
        partial.frequency.value = note.freq * 2.76;
        partialGain.gain.setValueAtTime(v * 0.2, t);
        partialGain.gain.exponentialRampToValueAtTime(0.001, t + note.dur * 0.6);
        partial.connect(partialGain);
        partialGain.connect(ctx.destination);
        partial.start(t);
        partial.stop(t + note.dur * 0.6);

        // Attack noise transient
        const nBuf = ctx.createBuffer(1, ctx.sampleRate * 0.01, ctx.sampleRate);
        const nData = nBuf.getChannelData(0);
        for (let i = 0; i < nData.length; i++) {
          nData[i] = (Math.random() * 2 - 1) * Math.exp(-(i / nData.length) * 15);
        }
        const nSrc = ctx.createBufferSource();
        nSrc.buffer = nBuf;
        const nFilt = ctx.createBiquadFilter();
        nFilt.type = 'highpass';
        nFilt.frequency.value = 3000;
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(v * 0.4, t);
        nSrc.connect(nFilt);
        nFilt.connect(nGain);
        nGain.connect(ctx.destination);
        nSrc.start(t);
        nSrc.stop(t + 0.01);
      });
    } catch (error) {
      console.error('Failed to play achievementUnlock SFX:', error);
    }
  },

  /**
   * Level complete - PHYSICAL MODELING victory jingle
   * Marimba-like wooden resonances ascending to triumphant final note
   */
  levelComplete: () => {
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;

      // Marimba-like tones: noise transient + tuned resonance
      const notes = [
        { freq: 523, time: 0, dur: 0.25 },
        { freq: 659, time: 0.12, dur: 0.25 },
        { freq: 784, time: 0.24, dur: 0.25 },
        { freq: 1047, time: 0.36, dur: 0.45 },
      ];

      notes.forEach((note, idx) => {
        const t = now + note.time;
        const vol = settings.sfxVolume * (0.12 + idx * 0.025);

        // Mallet strike - filtered noise burst
        const strikeBuf = ctx.createBuffer(1, ctx.sampleRate * 0.015, ctx.sampleRate);
        const strikeData = strikeBuf.getChannelData(0);
        for (let i = 0; i < strikeData.length; i++) {
          strikeData[i] = (Math.random() * 2 - 1) * Math.exp(-(i / strikeData.length) * 12);
        }
        const strike = ctx.createBufferSource();
        strike.buffer = strikeBuf;
        const strikeFilter = ctx.createBiquadFilter();
        strikeFilter.type = 'bandpass';
        strikeFilter.frequency.value = note.freq * 3;
        strikeFilter.Q.value = 1.5;
        const strikeGain = ctx.createGain();
        strikeGain.gain.setValueAtTime(vol * 0.5, t);
        strike.connect(strikeFilter);
        strikeFilter.connect(strikeGain);
        strikeGain.connect(ctx.destination);
        strike.start(t);
        strike.stop(t + 0.015);

        // Tuned resonance (fundamental)
        const fund = ctx.createOscillator();
        const fundGain = ctx.createGain();
        fund.type = 'sine';
        fund.frequency.value = note.freq;
        fundGain.gain.setValueAtTime(vol, t + 0.003);
        fundGain.gain.exponentialRampToValueAtTime(0.001, t + note.dur);
        fund.connect(fundGain);
        fundGain.connect(ctx.destination);
        fund.start(t + 0.003);
        fund.stop(t + note.dur);

        // Second partial (wood character: ~4x fundamental)
        const partial = ctx.createOscillator();
        const partialGain = ctx.createGain();
        partial.type = 'sine';
        partial.frequency.value = note.freq * 3.98;
        partialGain.gain.setValueAtTime(vol * 0.15, t + 0.003);
        partialGain.gain.exponentialRampToValueAtTime(0.001, t + note.dur * 0.4);
        partial.connect(partialGain);
        partialGain.connect(ctx.destination);
        partial.start(t + 0.003);
        partial.stop(t + note.dur * 0.4);
      });
    } catch (error) {
      console.error('Failed to play levelComplete SFX:', error);
    }
  },

  /**
   * Dust clean - PHYSICAL MODELING soft pop
   * Noise burst breve + filter sweep per effetto soffio di polvere (~80ms)
   */
  dustClean: () => {
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;
      const duration = 0.08;

      // Create noise burst buffer (soft white noise)
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);

      for (let i = 0; i < noiseData.length; i++) {
        const t = i / noiseData.length;
        // Soft envelope: quick attack, smooth decay
        const env = t < 0.1 ? t * 10 : Math.exp(-(t - 0.1) * 12);
        noiseData[i] = (Math.random() * 2 - 1) * env;
      }

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;

      // Filter sweep: simula soffio d'aria (high to low frequency)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 2;
      // Sweep da 2000Hz a 500Hz per effetto "poof"
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + duration);

      const gain = ctx.createGain();
      gain.gain.value = settings.sfxVolume * 0.4;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(now);
      source.stop(now + duration);

    } catch (error) {
      console.error('Failed to play dustClean SFX:', error);
    }
  },

  /**
   * Gold vinyl pickup - MODAL SYNTHESIS precious chime
   * Bell-like con risonanze armoniche, brillante, lungo (~500ms) con decay naturale
   */
  goldVinyl: () => {
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;
      const duration = 0.5;

      // Modal synthesis: 6 risonanze armoniche bell-like
      // Rapporti armonici tipici di una campana: 1, 2.4, 3.8, 5.2, 6.5, 8.1
      const fundamental = 880; // A5 (brillante)
      const modalRatios = [1, 2.4, 3.8, 5.2, 6.5, 8.1];
      const decayRates = [2.5, 4, 6, 8, 10, 12]; // Armoniche alte decadono più veloce

      modalRatios.forEach((ratio, index) => {
        // Create modal resonance buffer
        const modalBuffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
        const modalData = modalBuffer.getChannelData(0);
        const freq = fundamental * ratio;
        const decayRate = decayRates[index];

        for (let i = 0; i < modalData.length; i++) {
          const t = i / ctx.sampleRate;
          // Natural exponential decay (bell-like)
          const decay = Math.exp(-t * decayRate);
          // Add slight amplitude modulation for "shimmer"
          const shimmer = 1 + Math.sin(t * 6 + index) * 0.05;
          modalData[i] = Math.sin(2 * Math.PI * freq * t) * decay * shimmer;
        }

        const modalSource = ctx.createBufferSource();
        modalSource.buffer = modalBuffer;

        // Attenuazione in base all'indice armonico
        const modalGain = ctx.createGain();
        const amplitude = index === 0 ? 0.5 : (0.4 / (index + 1)); // Fundamental più forte
        modalGain.gain.value = settings.sfxVolume * amplitude;

        modalSource.connect(modalGain);
        modalGain.connect(ctx.destination);

        // Leggero delay tra armoniche per effetto "strike"
        const strikeDelay = index * 0.003;
        modalSource.start(now + strikeDelay);
      });

    } catch (error) {
      console.error('Failed to play goldVinyl SFX:', error);
    }
  },

  /**
   * Trash bin - PHYSICAL MODELING metallic impact
   * Heavy satisfying trash can impact with metal/plastic resonance
   */
  trash: () => {
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;
      const duration = 0.4;

      // Layer 1: Impact burst (initial transient)
      const burstBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const burstData = burstBuffer.getChannelData(0);
      for (let i = 0; i < burstData.length; i++) {
        const decay = 1 - (i / burstData.length);
        burstData[i] = (Math.random() * 2 - 1) * Math.pow(decay, 0.2);
      }
      const burstSource = ctx.createBufferSource();
      burstSource.buffer = burstBuffer;
      const burstFilter = ctx.createBiquadFilter();
      burstFilter.type = 'bandpass';
      burstFilter.frequency.value = 280;
      burstFilter.Q.value = 1.2;
      const burstGain = ctx.createGain();
      burstGain.gain.setValueAtTime(settings.sfxVolume * 0.5, now);
      burstGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      burstSource.connect(burstFilter);
      burstFilter.connect(burstGain);
      burstGain.connect(ctx.destination);
      burstSource.start(now);

      // Layer 2: Metallic resonance 1 (inharmonic partial - fundamental)
      const metal1Buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
      const metal1Data = metal1Buffer.getChannelData(0);
      const freq1 = 220; // Metal fundamental
      for (let i = 0; i < metal1Data.length; i++) {
        const t = i / ctx.sampleRate;
        const decay = Math.exp(-t * 4.5);
        // Add slight frequency modulation for metallic character
        const mod = 1 + Math.sin(2 * Math.PI * 3 * t) * 0.02;
        metal1Data[i] = Math.sin(2 * Math.PI * freq1 * mod * t) * decay;
      }
      const metal1Source = ctx.createBufferSource();
      metal1Source.buffer = metal1Buffer;
      const metal1Gain = ctx.createGain();
      metal1Gain.gain.value = settings.sfxVolume * 0.4;
      metal1Source.connect(metal1Gain);
      metal1Gain.connect(ctx.destination);
      metal1Source.start(now + 0.01);

      // Layer 3: Metallic resonance 2 (inharmonic partial - higher mode)
      const metal2Buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
      const metal2Data = metal2Buffer.getChannelData(0);
      const freq2 = 340; // Inharmonic ratio (~1.55x)
      for (let i = 0; i < metal2Data.length; i++) {
        const t = i / ctx.sampleRate;
        const decay = Math.exp(-t * 6);
        const mod = 1 + Math.sin(2 * Math.PI * 5 * t) * 0.03;
        metal2Data[i] = Math.sin(2 * Math.PI * freq2 * mod * t) * decay * 0.8;
      }
      const metal2Source = ctx.createBufferSource();
      metal2Source.buffer = metal2Buffer;
      const metal2Gain = ctx.createGain();
      metal2Gain.gain.value = settings.sfxVolume * 0.35;
      metal2Source.connect(metal2Gain);
      metal2Gain.connect(ctx.destination);
      metal2Source.start(now + 0.015);

      // Layer 4: High metallic ring (shimmer)
      const metal3Buffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const metal3Data = metal3Buffer.getChannelData(0);
      const freq3 = 580; // High ring
      for (let i = 0; i < metal3Data.length; i++) {
        const t = i / ctx.sampleRate;
        const decay = Math.exp(-t * 10);
        metal3Data[i] = Math.sin(2 * Math.PI * freq3 * t) * decay * 0.6;
      }
      const metal3Source = ctx.createBufferSource();
      metal3Source.buffer = metal3Buffer;
      const metal3Filter = ctx.createBiquadFilter();
      metal3Filter.type = 'bandpass';
      metal3Filter.frequency.value = 580;
      metal3Filter.Q.value = 4;
      const metal3Gain = ctx.createGain();
      metal3Gain.gain.value = settings.sfxVolume * 0.25;
      metal3Source.connect(metal3Filter);
      metal3Filter.connect(metal3Gain);
      metal3Gain.connect(ctx.destination);
      metal3Source.start(now + 0.008);

      // Layer 5: Body rumble (low frequency impact)
      const rumbleBuffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
      const rumbleData = rumbleBuffer.getChannelData(0);
      let lastRumble = 0;
      for (let i = 0; i < rumbleData.length; i++) {
        const t = i / rumbleData.length;
        const decay = Math.exp(-t * 5);
        const white = Math.random() * 2 - 1;
        rumbleData[i] = ((lastRumble + (0.08 * white)) / 1.08) * decay;
        lastRumble = rumbleData[i];
      }
      const rumbleSource = ctx.createBufferSource();
      rumbleSource.buffer = rumbleBuffer;
      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.value = 80;
      const rumbleGain = ctx.createGain();
      rumbleGain.gain.value = settings.sfxVolume * 0.45;
      rumbleSource.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);
      rumbleSource.start(now + 0.005);

    } catch (error) {
      console.error('Failed to play trash SFX:', error);
    }
  },

  /**
   * Vinyl slide - soft tonal whoosh
   * Short pitch-sweep with gentle filtered noise for air movement feel
   */
  vinylSlide: () => {
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;
      const duration = 0.3;

      // Tonal swoosh - sine wave with pitch sweep down
      const swoosh = ctx.createOscillator();
      const swooshGain = ctx.createGain();
      swoosh.type = 'sine';
      swoosh.frequency.setValueAtTime(600, now);
      swoosh.frequency.exponentialRampToValueAtTime(250, now + duration);
      swooshGain.gain.setValueAtTime(settings.sfxVolume * 0.12, now);
      swooshGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      swoosh.connect(swooshGain);
      swooshGain.connect(ctx.destination);
      swoosh.start(now);
      swoosh.stop(now + duration);

      // Gentle air layer - very short, very quiet filtered noise
      const airBuf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
      const airData = airBuf.getChannelData(0);
      for (let i = 0; i < airData.length; i++) {
        const t = i / airData.length;
        const env = Math.sin(t * Math.PI) * 0.3;
        airData[i] = (Math.random() * 2 - 1) * env;
      }
      const airSrc = ctx.createBufferSource();
      airSrc.buffer = airBuf;
      const airFilter = ctx.createBiquadFilter();
      airFilter.type = 'bandpass';
      airFilter.frequency.value = 1200;
      airFilter.Q.value = 3;
      const airGain = ctx.createGain();
      airGain.gain.setValueAtTime(settings.sfxVolume * 0.06, now);
      airGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      airSrc.connect(airFilter);
      airFilter.connect(airGain);
      airGain.connect(ctx.destination);
      airSrc.start(now);
      airSrc.stop(now + 0.15);

    } catch (error) {
      console.error('Failed to play vinylSlide SFX:', error);
    }
  },

  /**
   * Vinyl thunk - PHYSICAL MODELING wood impact
   * Realistic thump using modal synthesis + noise burst
   */
  vinylThunk: () => {
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;

      // Impact noise burst (realistic attack transient)
      const impactBurst = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
      const impactData = impactBurst.getChannelData(0);
      for (let i = 0; i < impactData.length; i++) {
        const decay = 1 - (i / impactData.length);
        impactData[i] = (Math.random() * 2 - 1) * Math.pow(decay, 0.3);
      }
      const impactSource = ctx.createBufferSource();
      impactSource.buffer = impactBurst;
      const impactFilter = ctx.createBiquadFilter();
      impactFilter.type = 'bandpass';
      impactFilter.frequency.value = 450;
      impactFilter.Q.value = 0.8;
      const impactGain = ctx.createGain();
      impactGain.gain.setValueAtTime(settings.sfxVolume * 0.45, now); // Era 0.9
      impactGain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
      impactSource.connect(impactFilter);
      impactFilter.connect(impactGain);
      impactGain.connect(ctx.destination);
      impactSource.start(now);

      // Modal resonance 1: Fundamental (wood body vibration)
      const modal1Buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const modal1Data = modal1Buffer.getChannelData(0);
      const freq1 = 140; // Fundamental
      for (let i = 0; i < modal1Data.length; i++) {
        const t = i / ctx.sampleRate;
        const decay = Math.exp(-t * 5); // Natural decay
        modal1Data[i] = Math.sin(2 * Math.PI * freq1 * t) * decay;
      }
      const modal1Source = ctx.createBufferSource();
      modal1Source.buffer = modal1Buffer;
      const modal1Gain = ctx.createGain();
      modal1Gain.gain.value = settings.sfxVolume * 0.4; // Era 0.6
      modal1Source.connect(modal1Gain);
      modal1Gain.connect(ctx.destination);
      modal1Source.start(now + 0.005);

      // Modal resonance 2: Second harmonic
      const modal2Buffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
      const modal2Data = modal2Buffer.getChannelData(0);
      const freq2 = 285; // ~2x fundamental
      for (let i = 0; i < modal2Data.length; i++) {
        const t = i / ctx.sampleRate;
        const decay = Math.exp(-t * 7);
        modal2Data[i] = Math.sin(2 * Math.PI * freq2 * t) * decay * 0.7;
      }
      const modal2Source = ctx.createBufferSource();
      modal2Source.buffer = modal2Buffer;
      const modal2Gain = ctx.createGain();
      modal2Gain.gain.value = settings.sfxVolume * 0.25; // Era 0.4
      modal2Source.connect(modal2Gain);
      modal2Gain.connect(ctx.destination);
      modal2Source.start(now + 0.008);

      // Modal resonance 3: High overtone (wood "tap")
      const modal3Buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
      const modal3Data = modal3Buffer.getChannelData(0);
      const freq3 = 920; // High overtone
      for (let i = 0; i < modal3Data.length; i++) {
        const t = i / ctx.sampleRate;
        const decay = Math.exp(-t * 12);
        modal3Data[i] = Math.sin(2 * Math.PI * freq3 * t) * decay * 0.5;
      }
      const modal3Source = ctx.createBufferSource();
      modal3Source.buffer = modal3Buffer;
      const modal3Filter = ctx.createBiquadFilter();
      modal3Filter.type = 'bandpass';
      modal3Filter.frequency.value = 920;
      modal3Filter.Q.value = 3;
      const modal3Gain = ctx.createGain();
      modal3Gain.gain.value = settings.sfxVolume * 0.15; // Era 0.25
      modal3Source.connect(modal3Filter);
      modal3Filter.connect(modal3Gain);
      modal3Gain.connect(ctx.destination);
      modal3Source.start(now + 0.003);

      // Body rumble (low frequency noise)
      const rumbleBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const rumbleData = rumbleBuffer.getChannelData(0);
      let lastRumble = 0;
      for (let i = 0; i < rumbleData.length; i++) {
        const t = i / rumbleData.length;
        const decay = Math.exp(-t * 4);
        const white = Math.random() * 2 - 1;
        rumbleData[i] = ((lastRumble + (0.05 * white)) / 1.05) * decay;
        lastRumble = rumbleData[i];
      }
      const rumbleSource = ctx.createBufferSource();
      rumbleSource.buffer = rumbleBuffer;
      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.value = 200;
      const rumbleGain = ctx.createGain();
      rumbleGain.gain.value = settings.sfxVolume * 0.3; // Era 0.5
      rumbleSource.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);
      rumbleSource.start(now + 0.01);

    } catch (error) {
      console.error('Failed to play vinylThunk SFX:', error);
    }
  },

  /**
   * Generic UI click - PHYSICAL MODELING micro tap
   */
  click: () => {
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.025, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-(i / data.length) * 50);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filt = ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.value = 3500;
      filt.Q.value = 4;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(settings.sfxVolume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      src.connect(filt);
      filt.connect(gain);
      gain.connect(ctx.destination);
      src.start(now);
      src.stop(now + 0.025);
    } catch (error) {
      console.error('Failed to play click SFX:', error);
    }
  },

  /**
   * Achievement/completion fanfare - MODAL SYNTHESIS bell cascade
   */
  achievement: () => {
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;

      const notes = [
        { freq: 523, time: 0, dur: 0.35 },
        { freq: 659, time: 0.08, dur: 0.3 },
        { freq: 784, time: 0.16, dur: 0.3 },
        { freq: 1047, time: 0.24, dur: 0.45 },
      ];

      notes.forEach(note => {
        const t = now + note.time;
        const v = settings.sfxVolume * 0.15;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = note.freq;
        oscGain.gain.setValueAtTime(v, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + note.dur);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + note.dur);

        const p = ctx.createOscillator();
        const pGain = ctx.createGain();
        p.type = 'sine';
        p.frequency.value = note.freq * 2.76;
        pGain.gain.setValueAtTime(v * 0.18, t);
        pGain.gain.exponentialRampToValueAtTime(0.001, t + note.dur * 0.5);
        p.connect(pGain);
        pGain.connect(ctx.destination);
        p.start(t);
        p.stop(t + note.dur * 0.5);
      });
    } catch (error) {
      console.error('Failed to play achievement SFX:', error);
    }
  },
};

/**
 * Set SFX volume
 */
export const setSFXVolume = (volume: number): void => {
  settings.sfxVolume = Math.max(0, Math.min(1, volume));
  saveAudioSettings({ sfxVolume: settings.sfxVolume });
};

/**
 * Toggle SFX on/off
 */
export const toggleSFX = (enabled: boolean): void => {
  settings.sfxEnabled = enabled;
  saveAudioSettings({ sfxEnabled: enabled });
};

// Initialize settings on module load
loadAudioSettings();
