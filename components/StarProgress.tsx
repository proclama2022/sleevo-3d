import React from 'react';
import { StarCriteria } from '../services/starCalculation';

interface StarProgressProps {
  currentStars: number; // 0-3, calculated by calculateCurrentStars
  criteria: StarCriteria;
  accuracy: number; // 0-1, current accuracy ratio
  showDetails: boolean; // Whether to show threshold text (true on desktop, false on mobile for space)
}

// Self-contained star icon (no external dependencies)
const StarIcon: React.FC<{ filled: boolean; pulse?: boolean; className?: string }> = ({
  filled,
  pulse = false,
  className = ''
}) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? '#FFD700' : 'none'}
      stroke={filled ? '#FFD700' : '#6b7280'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} ${pulse ? 'star-pulse' : ''}`}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
};

export const StarProgress: React.FC<StarProgressProps> = React.memo(({
  currentStars,
  criteria,
  accuracy,
  showDetails
}) => {
  const [previousStars, setPreviousStars] = React.useState(currentStars);
  const [pulseStar, setPulseStar] = React.useState<number | null>(null);

  // Detect star transition and trigger pulse animation
  React.useEffect(() => {
    if (currentStars > previousStars) {
      setPulseStar(currentStars);
      const timer = setTimeout(() => setPulseStar(null), 400);
      setPreviousStars(currentStars);
      return () => clearTimeout(timer);
    }
    setPreviousStars(currentStars);
  }, [currentStars, previousStars]);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Star Icons */}
      <div className="flex gap-2">
        {[1, 2, 3].map((star) => (
          <StarIcon
            key={star}
            filled={star <= currentStars}
            pulse={star === pulseStar}
            className="transition-all duration-200"
          />
        ))}
      </div>

      {/* Details (optional - desktop only) */}
      {showDetails && (
        <div className="text-center">
          <p className="text-white text-xs font-marker opacity-75">
            {Math.round(accuracy * 100)}% accuracy
          </p>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if currentStars or accuracy changes
  return prevProps.currentStars === nextProps.currentStars &&
         prevProps.accuracy === nextProps.accuracy;
});

StarProgress.displayName = 'StarProgress';
