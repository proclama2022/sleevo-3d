import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music as MusicIcon, Zap, MessageSquare } from 'lucide-react';
import {
  getAudioSettings,
  setMusicVolume,
  setSFXVolume,
  toggleMusic,
  toggleSFX,
  AudioSettings as AudioSettingsType,
  sfx,
} from '../services/audio';
import {
  getVoiceSettings,
  toggleVoiceNarration,
  testNarration,
  isVoiceNarrationSupported,
} from '../services/voiceNarration';

interface AudioSettingsProps {
  onClose: () => void;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<AudioSettingsType>(getAudioSettings());
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const voiceSupported = isVoiceNarrationSupported();

  // Sync settings state when component mounts
  useEffect(() => {
    setSettings(getAudioSettings());
    setVoiceEnabled(getVoiceSettings().enabled);
  }, []);

  const handleMusicVolumeChange = (value: number) => {
    setMusicVolume(value);
    setSettings(getAudioSettings());
  };

  const handleSFXVolumeChange = (value: number) => {
    setSFXVolume(value);
    setSettings(getAudioSettings());
    // Play test sound
    sfx.dropSuccess();
  };

  const handleMusicToggle = () => {
    toggleMusic(!settings.musicEnabled);
    setSettings(getAudioSettings());
  };

  const handleSFXToggle = () => {
    const newEnabled = !settings.sfxEnabled;
    toggleSFX(newEnabled);
    setSettings(getAudioSettings());
    if (newEnabled) {
      sfx.dropSuccess();
    }
  };

  const handleVoiceToggle = () => {
    const newEnabled = !voiceEnabled;
    toggleVoiceNarration(newEnabled);
    setVoiceEnabled(newEnabled);
    if (newEnabled) {
      testNarration();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a1110] border-2 border-[#5c4033] p-1 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-[#2a1d18] border border-[#3e2723] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-wood opacity-30 pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-marker text-white mb-6 text-center rotate-[-1deg]">
              Audio Settings
            </h2>

            {/* Music Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MusicIcon size={20} className="text-blue-400" />
                  <span className="text-white font-display text-lg">Music</span>
                </div>
                <button
                  onClick={handleMusicToggle}
                  className={`p-2 rounded-lg transition-colors ${
                    settings.musicEnabled
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-gray-700 text-gray-500'
                  }`}
                >
                  {settings.musicEnabled ? (
                    <Volume2 size={20} />
                  ) : (
                    <VolumeX size={20} />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.musicVolume * 100}
                  onChange={(e) => handleMusicVolumeChange(Number(e.target.value) / 100)}
                  disabled={!settings.musicEnabled}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: settings.musicEnabled
                      ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                          settings.musicVolume * 100
                        }%, #374151 ${settings.musicVolume * 100}%, #374151 100%)`
                      : '#374151',
                  }}
                />
                <span className="text-white font-mono text-sm w-10 text-right">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>
            </div>

            {/* SFX Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={20} className="text-yellow-400" />
                  <span className="text-white font-display text-lg">Sound Effects</span>
                </div>
                <button
                  onClick={handleSFXToggle}
                  className={`p-2 rounded-lg transition-colors ${
                    settings.sfxEnabled
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-700 text-gray-500'
                  }`}
                >
                  {settings.sfxEnabled ? (
                    <Volume2 size={20} />
                  ) : (
                    <VolumeX size={20} />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sfxVolume * 100}
                  onChange={(e) => handleSFXVolumeChange(Number(e.target.value) / 100)}
                  disabled={!settings.sfxEnabled}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: settings.sfxEnabled
                      ? `linear-gradient(to right, #eab308 0%, #eab308 ${
                          settings.sfxVolume * 100
                        }%, #374151 ${settings.sfxVolume * 100}%, #374151 100%)`
                      : '#374151',
                  }}
                />
                <span className="text-white font-mono text-sm w-10 text-right">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </div>
            </div>

            {/* Voice Narration Section */}
            {voiceSupported && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={20} className="text-purple-400" />
                    <span className="text-white font-display text-lg">Tutorial Voice</span>
                  </div>
                  <button
                    onClick={handleVoiceToggle}
                    className={`p-2 rounded-lg transition-colors ${
                      voiceEnabled
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-gray-700 text-gray-500'
                    }`}
                  >
                    {voiceEnabled ? (
                      <Volume2 size={20} />
                    ) : (
                      <VolumeX size={20} />
                    )}
                  </button>
                </div>

                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-purple-200 text-xs mb-2">
                    {voiceEnabled
                      ? '✅ La voce guida è attiva durante il tutorial'
                      : 'Attiva la narrazione vocale per il tutorial'}
                  </p>
                  <button
                    onClick={() => testNarration("Tutorial vocale attivato. Benvenuto su Sleevo!")}
                    disabled={!voiceEnabled}
                    className="w-full py-2 px-3 bg-purple-600/30 hover:bg-purple-600/50 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors border border-purple-500/30"
                  >
                    🎙️ Testa la Voce
                  </button>
                </div>
              </div>
            )}

            {/* Sound Previews */}
            <div className="mb-6">
              <div className="text-white/60 text-sm mb-2 font-display">Preview Sounds:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => sfx.vinylSlide()}
                  disabled={!settings.sfxEnabled}
                  className="py-2 px-3 bg-cyan-600/30 hover:bg-cyan-600/50 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors border border-cyan-500/30"
                >
                  🎵 Vinyl Slide
                </button>
                <button
                  onClick={() => sfx.vinylThunk()}
                  disabled={!settings.sfxEnabled}
                  className="py-2 px-3 bg-green-600/30 hover:bg-green-600/50 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors border border-green-500/30"
                >
                  🎯 Vinyl Thunk
                </button>
                <button
                  onClick={() => sfx.comboMilestone()}
                  disabled={!settings.sfxEnabled}
                  className="py-2 px-3 bg-purple-600/30 hover:bg-purple-600/50 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors border border-purple-500/30"
                >
                  🔥 Combo
                </button>
                <button
                  onClick={() => sfx.levelUp()}
                  disabled={!settings.sfxEnabled}
                  className="py-2 px-3 bg-yellow-600/30 hover:bg-yellow-600/50 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors border border-yellow-500/30"
                >
                  ⭐ Level Up
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-black/40 rounded-lg p-3 mb-4">
              <p className="text-gray-400 text-xs text-center">
                Music changes with each shop theme. Sound effects add satisfying feedback to
                your actions.
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-black uppercase rounded-lg text-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
