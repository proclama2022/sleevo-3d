import React from 'react';
import { X, Trophy, Lock } from 'lucide-react';
import { ACHIEVEMENTS, getAchievementProgress, getRarityColor, getRarityBgColor } from '../constants/achievements';
import { SaveData } from '../services/storage';

interface AchievementScreenProps {
  saveData: SaveData;
  onClose: () => void;
}

export const AchievementScreen: React.FC<AchievementScreenProps> = ({ saveData, onClose }) => {
  const { unlocked, total, percentage } = getAchievementProgress(saveData);
  const unlockedAchievements = saveData.achievements || [];

  // Sort achievements: unlocked first, then by rarity
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
  const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
    const aUnlocked = unlockedAchievements.includes(a.id);
    const bUnlocked = unlockedAchievements.includes(b.id);

    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;

    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border-2 border-purple-500/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <h2 className="text-3xl font-bold text-white">Achievements</h2>
                <p className="text-purple-300 mt-1">
                  {unlocked} / {total} unlocked ({percentage}%)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-yellow-500 h-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Achievement grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedAchievements.map((achievement) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              const isHidden = achievement.hidden && !isUnlocked;

              return (
                <div
                  key={achievement.id}
                  className={`
                    rounded-xl p-4 border-2 transition-all
                    ${isUnlocked
                      ? `${getRarityBgColor(achievement.rarity)} border-${achievement.rarity === 'legendary' ? 'yellow' : achievement.rarity === 'epic' ? 'purple' : achievement.rarity === 'rare' ? 'blue' : 'gray'}-500/50 shadow-lg`
                      : 'bg-gray-800/50 border-gray-700 opacity-60'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`
                      text-4xl flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-lg
                      ${isUnlocked ? 'bg-white/10' : 'bg-gray-700/50'}
                    `}>
                      {isHidden ? <Lock className="w-8 h-8 text-gray-500" /> : achievement.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`
                          font-bold text-lg
                          ${isUnlocked ? 'text-white' : 'text-gray-400'}
                        `}>
                          {isHidden ? '???' : achievement.title}
                        </h3>
                        {isUnlocked && (
                          <span className={`
                            text-xs px-2 py-1 rounded-full capitalize whitespace-nowrap
                            ${getRarityColor(achievement.rarity)}
                            ${getRarityBgColor(achievement.rarity)}
                          `}>
                            {achievement.rarity}
                          </span>
                        )}
                      </div>
                      <p className={`
                        mt-1 text-sm
                        ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}
                      `}>
                        {isHidden ? 'Hidden achievement - unlock to reveal' : achievement.description}
                      </p>
                      {isUnlocked && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                          <Trophy className="w-3 h-3" />
                          <span>Unlocked!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rarity legend */}
          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h4 className="text-white font-semibold mb-2">Rarity Legend</h4>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-gray-300">Common</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-gray-300">Rare</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-gray-300">Epic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-gray-300">Legendary</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
