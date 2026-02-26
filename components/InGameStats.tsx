import React from 'react';
import { Star } from 'lucide-react';

interface InGameStatsProps {
  currentAccuracy: number;
  predictedStars: number;
  personalBest: number;
  isVisible: boolean;
  onToggle: () => void;
}

export const InGameStats: React.FC<InGameStatsProps> = ({
  currentAccuracy,
  predictedStars,
  personalBest,
  isVisible,
  onToggle
}) => {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 z-20 ${
        isVisible ? 'translate-y-0' : 'translate-y-[calc(100%-40px)]'
      }`}
    >
      {/* Tab handle */}
      <button
        onClick={onToggle}
        className="w-full bg-black/80 backdrop-blur py-2 border-t border-white/20 text-white text-sm hover:bg-black/90 transition-colors"
      >
        {isVisible ? '▼' : '▲'} Stats
      </button>

      {/* Stats content */}
      <div className="bg-black/90 backdrop-blur p-4 grid grid-cols-3 gap-4 border-t border-white/10">
        {/* Accuracy */}
        <div className="text-center">
          <div className="text-2xl font-display text-green-400">
            {currentAccuracy.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-400">Accuracy</div>
        </div>

        {/* Predicted Stars */}
        <div className="text-center">
          <div className="flex justify-center gap-1 mb-1">
            {[1, 2, 3].map((n) => (
              <Star
                key={n}
                size={20}
                className={
                  n <= predictedStars
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-600'
                }
              />
            ))}
          </div>
          <div className="text-xs text-gray-400">Predicted</div>
        </div>

        {/* Personal Best */}
        <div className="text-center">
          <div className="text-2xl font-display text-cyan-400">
            {personalBest}
          </div>
          <div className="text-xs text-gray-400">Record</div>
        </div>
      </div>
    </div>
  );
};
