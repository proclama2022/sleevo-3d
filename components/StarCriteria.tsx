import React from 'react';
import { LevelMode } from '../types';
import { StarCriteria as StarCriteriaType } from '../services/starCalculation';

interface StarCriteriaProps {
  levelNumber: number;
  levelName: string;
  mode: LevelMode;
  criteria: StarCriteriaType;
  bestStars: number; // 0-3, previous best for this level
  onStart: () => void;
}

// Self-contained star icon (no external dependencies)
const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className = '' }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={filled ? '#FFD700' : 'none'}
      stroke={filled ? '#FFD700' : '#9ca3af'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
};

// Mode badge styling
const getModeBadgeStyle = (mode: LevelMode) => {
  switch (mode) {
    case 'Timed':
      return { bg: 'bg-orange-500', text: 'TIMED' };
    case 'Boss':
      return { bg: 'bg-red-600', text: 'BOSS' };
    case 'SuddenDeath':
      return { bg: 'bg-purple-600', text: 'SUDDEN DEATH' };
    case 'Endless':
      return { bg: 'bg-blue-500', text: 'ENDLESS' };
    default:
      return null;
  }
};

export const StarCriteria: React.FC<StarCriteriaProps> = ({
  levelNumber,
  levelName,
  mode,
  criteria,
  bestStars,
  onStart,
}) => {
  const modeBadge = getModeBadgeStyle(mode);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onStart();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onStart();
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border-4 border-yellow-500/30 p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-4xl font-display font-bold text-white">
              Level {levelNumber}
            </h2>
            {modeBadge && (
              <span className={`${modeBadge.bg} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}>
                {modeBadge.text}
              </span>
            )}
          </div>
          <p className="text-gray-300 text-lg font-marker">{levelName}</p>
        </div>

        {/* Previous Best (if applicable) */}
        {bestStars > 0 && (
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mb-6 flex items-center justify-center gap-2">
            <span className="text-blue-300 font-marker text-sm">Your best:</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((star) => (
                <StarIcon key={star} filled={star <= bestStars} className="w-5 h-5" />
              ))}
            </div>
            <span className="text-blue-300 font-marker text-sm font-bold">
              {bestStars} {bestStars === 1 ? 'star' : 'stars'}
            </span>
          </div>
        )}

        {/* Star Criteria Rows */}
        <div className="space-y-4 mb-8">
          {/* 1 Star - Always same */}
          <div className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex-shrink-0">
              <StarIcon filled={true} className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-white font-marker text-sm">Complete the level</p>
            </div>
          </div>

          {/* 2 Stars */}
          <div className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex-shrink-0 flex gap-1">
              <StarIcon filled={true} className="w-6 h-6" />
              <StarIcon filled={true} className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-white font-marker text-sm">{criteria.twoStar.description}</p>
            </div>
          </div>

          {/* 3 Stars */}
          <div className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-4 border border-yellow-500/30">
            <div className="flex-shrink-0 flex gap-1">
              <StarIcon filled={true} className="w-6 h-6" />
              <StarIcon filled={true} className="w-6 h-6" />
              <StarIcon filled={true} className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-white font-marker text-sm">{criteria.threeStar.description}</p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-display font-bold text-xl py-4 px-6 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-yellow-500/50"
          style={{ minHeight: '48px' }}
        >
          Start Level
        </button>

        {/* Hint Text */}
        <p className="text-gray-500 text-xs text-center mt-4 font-marker">
          Press ESC or tap outside to start
        </p>
      </div>
    </div>
  );
};
