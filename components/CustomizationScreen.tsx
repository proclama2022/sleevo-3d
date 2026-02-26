import React, { useState } from 'react';
import { X, Palette, Lock } from 'lucide-react';
import { CustomizationSettings, VisualTheme, BackgroundStyle, FontStyle } from '../types';
import { SaveData, saveSaveData } from '../services/storage';

interface CustomizationScreenProps {
  saveData: SaveData;
  onClose: () => void;
  onUpdate: (newSaveData: SaveData) => void;
}

export const CustomizationScreen: React.FC<CustomizationScreenProps> = ({ saveData, onClose, onUpdate }) => {
  // Calculate unlocked themes
  const unlockedThemes: VisualTheme[] = ['default'];
  if (saveData.level >= 15) unlockedThemes.push('neon');
  if (saveData.stats.perfectLevels >= 10) unlockedThemes.push('minimal');
  if (saveData.collection.length >= 30) unlockedThemes.push('cartoon');

  const [settings, setSettings] = useState<CustomizationSettings>(
    saveData.customization || {
      visualTheme: 'default',
      background: 'bricks',
      fontStyle: 'marker',
      unlockedThemes: ['default']
    }
  );

  const handleSave = () => {
    const updatedSave = {
      ...saveData,
      customization: {
        ...settings,
        unlockedThemes
      }
    };
    saveSaveData(updatedSave);
    onUpdate(updatedSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 overflow-y-auto">
      <div className="max-w-2xl mx-auto mt-10 mb-10 bg-[#2a1d18] rounded-xl p-6 border-2 border-white/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Palette size={24} className="text-cyan-400" />
            <h2 className="font-display text-3xl text-white">Customization</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Theme Selection */}
        <section className="mb-8">
          <h3 className="text-xl text-white font-marker mb-3">Visual Theme</h3>
          <div className="grid grid-cols-2 gap-3">
            {(['default', 'neon', 'minimal', 'cartoon'] as VisualTheme[]).map((theme) => {
              const isUnlocked = unlockedThemes.includes(theme);
              const isActive = settings.visualTheme === theme;

              return (
                <button
                  key={theme}
                  onClick={() => isUnlocked && setSettings(s => ({ ...s, visualTheme: theme }))}
                  disabled={!isUnlocked}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all
                    ${isActive ? 'border-cyan-400 bg-cyan-400/20' : 'border-white/20'}
                    ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-cyan-400/50 cursor-pointer'}
                  `}
                >
                  {/* Theme preview */}
                  <div className={`w-full h-24 rounded mb-2 overflow-hidden ${
                    theme === 'default' ? 'bg-gradient-to-br from-blue-900 to-purple-900' :
                    theme === 'neon' ? 'bg-[#000033] border-2 border-cyan-400' :
                    theme === 'minimal' ? 'bg-white border border-gray-300' :
                    'bg-gradient-to-br from-red-200 to-blue-200 border-4 border-black'
                  }`}>
                    {theme === 'neon' && (
                      <div className="text-cyan-400 text-center mt-8 font-bold" style={{ textShadow: '0 0 10px cyan' }}>
                        NEON
                      </div>
                    )}
                    {theme === 'minimal' && (
                      <div className="text-gray-800 text-center mt-8 font-bold">
                        MINIMAL
                      </div>
                    )}
                    {theme === 'cartoon' && (
                      <div className="text-black text-center mt-8 font-black text-2xl">
                        FUN!
                      </div>
                    )}
                  </div>

                  <p className="text-white capitalize font-marker">{theme}</p>

                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                      <Lock size={32} className="text-gray-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Unlock: Neon (Level 15), Minimal (10 Perfect), Cartoon (30 Vinyls)
          </p>
        </section>

        {/* Background Selection */}
        <section className="mb-8">
          <h3 className="text-xl text-white font-marker mb-3">Background</h3>
          <div className="grid grid-cols-4 gap-2">
            {(['bricks', 'wood', 'concrete', 'space'] as BackgroundStyle[]).map((bg) => (
              <button
                key={bg}
                onClick={() => setSettings(s => ({ ...s, background: bg }))}
                className={`
                  p-3 rounded-lg border-2 transition-all
                  ${settings.background === bg ? 'border-cyan-400 bg-cyan-400/20' : 'border-white/20 hover:border-cyan-400/50'}
                `}
              >
                <div className={`w-full h-16 rounded ${
                  bg === 'bricks' ? 'bg-[#8b4513] bg-bricks' :
                  bg === 'wood' ? 'bg-[#4a2511] bg-wood-dark' :
                  bg === 'concrete' ? 'bg-[#6b7280]' :
                  'bg-gradient-to-b from-[#000033] to-[#000011]'
                } bg-cover`} />
                <p className="text-white text-sm mt-1 capitalize">{bg}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Font Selection */}
        <section className="mb-6">
          <h3 className="text-xl text-white font-marker mb-3">Font Style</h3>
          <div className="flex gap-3">
            {(['marker', 'display', 'mono'] as FontStyle[]).map((font) => (
              <button
                key={font}
                onClick={() => setSettings(s => ({ ...s, fontStyle: font }))}
                className={`
                  flex-1 p-4 rounded-lg border-2 transition-all
                  ${settings.fontStyle === font ? 'border-cyan-400 bg-cyan-400/20' : 'border-white/20 hover:border-cyan-400/50'}
                `}
              >
                <span className={`text-white text-2xl block ${
                  font === 'marker' ? 'font-marker' :
                  font === 'display' ? 'font-display' :
                  'font-mono'
                }`}>Abc</span>
                <p className="text-gray-400 text-sm mt-1 capitalize">{font}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Apply Button */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-lg transition-all shadow-lg"
        >
          Apply Customization
        </button>
      </div>
    </div>
  );
};
