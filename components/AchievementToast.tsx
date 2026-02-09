import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { getAchievementById, getRarityColor } from '../constants/achievements';

interface AchievementToastProps {
  achievementId: string;
  onComplete: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievementId, onComplete }) => {
  const [visible, setVisible] = useState(false);
  const achievement = getAchievementById(achievementId);

  useEffect(() => {
    // Fade in
    setTimeout(() => setVisible(true), 50);

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300); // Wait for fade out animation
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!achievement) return null;

  return (
    <div
      className={`
        fixed top-20 right-4 md:right-8 z-[250]
        transform transition-all duration-300
        ${visible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}
      `}
    >
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-xl p-4 shadow-2xl border-2 border-yellow-400/50 max-w-sm">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center text-3xl">
            {achievement.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">
                Achievement Unlocked!
              </span>
            </div>
            <h3 className="text-white font-bold text-lg leading-tight mb-1">
              {achievement.title}
            </h3>
            <p className="text-purple-200 text-sm">
              {achievement.description}
            </p>
            <div className="mt-2">
              <span className={`
                text-xs px-2 py-0.5 rounded-full capitalize
                ${getRarityColor(achievement.rarity)}
                bg-black/30
              `}>
                {achievement.rarity}
              </span>
            </div>
          </div>
        </div>

        {/* Animated shine effect */}
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
        </div>
      </div>

      <style>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }
        .animate-shine {
          animation: shine 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
