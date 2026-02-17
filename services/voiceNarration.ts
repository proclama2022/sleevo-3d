/**
 * Voice Narration Service
 * Provides spoken tutorial narration using Web Speech API
 * Can be extended to use pre-recorded audio files from Runware TTS
 */

import { TutorialStep } from '../types';

// Voice narration settings
interface VoiceSettings {
  enabled: boolean;
  rate: number;      // Speed (0.1 to 10, default 1)
  pitch: number;     // Pitch (0 to 2, default 1)
  volume: number;    // Volume (0 to 1, default 1)
  lang: string;      // Language code
}

const SETTINGS_KEY = 'sleevo_voice_narration_settings';

// Default settings
const DEFAULT_SETTINGS: VoiceSettings = {
  enabled: false,    // Disabled by default
  rate: 1.0,
  pitch: 1.0,
  volume: 0.8,
  lang: 'it-IT',     // Italian
};

let settings: VoiceSettings = DEFAULT_SETTINGS;

// Tutorial narration texts
const NARRATION_TEXTS: Record<TutorialStep, string> = {
  drag: "Trascina i Dischi. Prendi un disco e trascinalo nel crate del genere giusto!",
  genre: "Controlla il Genere. Ogni crate ha un'etichetta con il genere musicale. Fai match!",
  mystery: "Dischi Misteriosi. I dischi con punto interrogativo devono essere scoperti prima. Toccali per rivelare il genere!",
  moves: "Attenzione alle Mosse. Hai un numero limitato di mosse. Completa il livello prima che finiscano!",
  trash: "Dischi Rovinati. Alcuni dischi sono troppo danneggiati! Trascinali nel cestino invece che nei crate.",
  special: "Dischi Speciali. I dischi dorati e speciali danno bonus punteggio e effetti unici. Cercali!",
  combo: "Combo e Moltiplicatori. Ordina dischi dello stesso genere di seguito per creare combo e moltiplicare il punteggio!",
  capacity: "Capacità dei Crate. Ogni crate ha una capacità massima. Pianifica bene lo spazio disponibile!",
  complete: "Sei Pronto! Ordina tutti i dischi prima che finiscano le mosse. Buona fortuna!",
};

// Current speech instance
let currentSpeech: SpeechSynthesisUtterance | null = null;

/**
 * Load voice narration settings from localStorage
 */
export const loadVoiceSettings = (): VoiceSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load voice narration settings:', error);
    settings = DEFAULT_SETTINGS;
  }
  return settings;
};

/**
 * Save voice narration settings to localStorage
 */
export const saveVoiceSettings = (newSettings: Partial<VoiceSettings>): void => {
  settings = { ...settings, ...newSettings };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save voice narration settings:', error);
  }
};

/**
 * Get current voice narration settings
 */
export const getVoiceSettings = (): VoiceSettings => {
  return { ...settings };
};

/**
 * Enable or disable voice narration
 */
export const toggleVoiceNarration = (enabled: boolean): void => {
  saveVoiceSettings({ enabled });
  if (!enabled) {
    stopNarration();
  }
};

/**
 * Check if Web Speech API is supported
 */
export const isVoiceNarrationSupported = (): boolean => {
  return 'speechSynthesis' in window;
};

/**
 * Play narration for a tutorial step
 */
export const playTutorialNarration = (step: TutorialStep): void => {
  if (!settings.enabled) return;
  if (!isVoiceNarrationSupported()) {
    console.warn('Voice narration not supported in this browser');
    return;
  }

  const text = NARRATION_TEXTS[step];
  if (!text) return;

  // Stop any current narration
  stopNarration();

  try {
    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = settings.lang;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    // Try to use Italian voice if available
    const voices = speechSynthesis.getVoices();
    const italianVoice = voices.find(voice => voice.lang.startsWith('it'));
    if (italianVoice) {
      utterance.voice = italianVoice;
    }

    // Error handling
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      currentSpeech = null;
    };

    utterance.onend = () => {
      currentSpeech = null;
    };

    // Speak
    currentSpeech = utterance;
    speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Failed to play narration:', error);
    currentSpeech = null;
  }
};

/**
 * Stop current narration
 */
export const stopNarration = (): void => {
  if (!isVoiceNarrationSupported()) return;

  try {
    speechSynthesis.cancel();
    currentSpeech = null;
  } catch (error) {
    console.error('Failed to stop narration:', error);
  }
};

/**
 * Test narration with a sample text
 */
export const testNarration = (text: string = "Benvenuto su Sleevo!"): void => {
  if (!isVoiceNarrationSupported()) {
    console.warn('Voice narration not supported in this browser');
    return;
  }

  const wasEnabled = settings.enabled;
  settings.enabled = true;

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = settings.lang;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    const voices = speechSynthesis.getVoices();
    const italianVoice = voices.find(voice => voice.lang.startsWith('it'));
    if (italianVoice) {
      utterance.voice = italianVoice;
    }

    utterance.onend = () => {
      settings.enabled = wasEnabled;
    };

    speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Failed to test narration:', error);
    settings.enabled = wasEnabled;
  }
};

// Load settings on module initialization
loadVoiceSettings();

// Ensure voices are loaded (some browsers require this)
if (isVoiceNarrationSupported()) {
  speechSynthesis.getVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
      speechSynthesis.getVoices();
    };
  }
}
