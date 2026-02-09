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
  musicVolume: 0.3,
  sfxVolume: 0.5,
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
   * Drag start - soft whoosh
   */
  dragStart: () => {
    playSFX(200, 0.1, 'sine', 'attack');
  },

  /**
   * Drop success - satisfying clink/thunk
   */
  dropSuccess: () => {
    playMultiToneSFX([
      { freq: 400, duration: 0.1, delay: 0, type: 'triangle' },
      { freq: 300, duration: 0.15, delay: 50, type: 'sine' },
    ]);
  },

  /**
   * Drop error - negative buzz
   */
  dropError: () => {
    playSFX(100, 0.2, 'square', 'sustain');
  },

  /**
   * Combo milestone - ascending chime
   */
  comboMilestone: (level: number) => {
    const baseFreq = 400;
    const tones = [];
    for (let i = 0; i < Math.min(level, 5); i++) {
      tones.push({
        freq: baseFreq + i * 100,
        duration: 0.15,
        delay: i * 80,
        type: 'sine' as OscillatorType,
      });
    }
    playMultiToneSFX(tones);
  },

  /**
   * Mystery reveal - magic sparkle
   */
  mysteryReveal: () => {
    playMultiToneSFX([
      { freq: 800, duration: 0.1, delay: 0, type: 'sine' },
      { freq: 1000, duration: 0.1, delay: 50, type: 'sine' },
      { freq: 1200, duration: 0.15, delay: 100, type: 'triangle' },
    ]);
  },

  /**
   * Achievement unlock - triumphant fanfare
   */
  achievementUnlock: () => {
    playMultiToneSFX([
      { freq: 523, duration: 0.15, delay: 0, type: 'triangle' },
      { freq: 659, duration: 0.15, delay: 100, type: 'triangle' },
      { freq: 784, duration: 0.2, delay: 200, type: 'sine' },
      { freq: 1047, duration: 0.3, delay: 300, type: 'sine' },
    ]);
  },

  /**
   * Level complete - victory jingle
   */
  levelComplete: () => {
    playMultiToneSFX([
      { freq: 523, duration: 0.2, delay: 0, type: 'triangle' },
      { freq: 659, duration: 0.2, delay: 150, type: 'triangle' },
      { freq: 784, duration: 0.2, delay: 300, type: 'triangle' },
      { freq: 1047, duration: 0.4, delay: 450, type: 'sine' },
    ]);
  },

  /**
   * Dust clean - soft pop
   */
  dustClean: () => {
    playSFX(600, 0.08, 'triangle', 'decay');
  },

  /**
   * Gold vinyl pickup - special chime
   */
  goldVinyl: () => {
    playMultiToneSFX([
      { freq: 800, duration: 0.1, delay: 0, type: 'sine' },
      { freq: 1000, duration: 0.15, delay: 50, type: 'triangle' },
    ]);
  },

  /**
   * Trash bin - thud
   */
  trash: () => {
    playSFX(150, 0.15, 'square', 'decay');
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
