import React, { useState } from 'react';
import { X, Eye } from 'lucide-react';
import { AccessibilitySettings as AccessibilitySettingsType, ColorBlindMode } from '../types';
import { SaveData, saveSaveData } from '../services/storage';

interface AccessibilitySettingsProps {
  saveData: SaveData;
  onClose: () => void;
  onUpdate: (newSaveData: SaveData) => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ saveData, onClose, onUpdate }) => {
  const [settings, setSettings] = useState<AccessibilitySettingsType>(
    saveData.accessibilitySettings || {
      reduceMotion: false,
      colorBlindMode: 'none',
      increasedContrast: false
    }
  );

  const handleSave = () => {
    const updatedSave = {
      ...saveData,
      accessibilitySettings: settings
    };
    saveSaveData(updatedSave);
    onUpdate(updatedSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 overflow-y-auto">
      <div className="max-w-md mx-auto mt-20 mb-10 bg-[#2a1d18] rounded-xl p-6 border-2 border-white/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Eye size={24} className="text-cyan-400" />
            <h2 className="font-display text-2xl text-white">Accessibility</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Reduce Motion */}
        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.reduceMotion}
              onChange={(e) => setSettings(s => ({ ...s, reduceMotion: e.target.checked }))}
              className="mt-1 w-5 h-5 rounded border-2 border-gray-600 bg-black/50 checked:bg-cyan-500 checked:border-cyan-500 cursor-pointer"
            />
            <div>
              <span className="text-white font-marker text-lg block">Reduce Motion</span>
              <span className="text-gray-400 text-sm">Disable animations and particle effects</span>
            </div>
          </label>
        </div>

        {/* Color Blind Mode */}
        <div className="mb-6">
          <label className="block text-white font-marker text-lg mb-2">Color Blind Mode</label>
          <p className="text-gray-400 text-sm mb-3">Adds texture patterns to vinyl covers for better differentiation</p>
          <select
            value={settings.colorBlindMode}
            onChange={(e) => setSettings(s => ({ ...s, colorBlindMode: e.target.value as ColorBlindMode }))}
            className="w-full bg-black/50 text-white rounded-lg p-3 border-2 border-gray-600 focus:border-cyan-500 outline-none cursor-pointer"
          >
            <option value="none">None</option>
            <option value="deuteranopia">Deuteranopia (Red-Green)</option>
            <option value="protanopia">Protanopia (Red)</option>
            <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
          </select>
        </div>

        {/* High Contrast */}
        <div className="mb-8">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.increasedContrast}
              onChange={(e) => setSettings(s => ({ ...s, increasedContrast: e.target.checked }))}
              className="mt-1 w-5 h-5 rounded border-2 border-gray-600 bg-black/50 checked:bg-cyan-500 checked:border-cyan-500 cursor-pointer"
            />
            <div>
              <span className="text-white font-marker text-lg block">High Contrast</span>
              <span className="text-gray-400 text-sm">Increase contrast for better visibility</span>
            </div>
          </label>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-lg transition-all shadow-lg"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};
