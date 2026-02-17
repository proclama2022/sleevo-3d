import React from 'react';

interface StarCelebrationProps {
  starsEarned: number; // 1-3
  isNewBest: boolean; // True if this is a new record for this level
  onComplete: () => void; // Called when animation finishes
  onSkip: () => void; // Called when player taps to skip
}

// Self-contained star icon (no external dependencies)
const StarIcon: React.FC<{ filled: boolean; delay: number; className?: string }> = ({
  filled,
  delay,
  className = ''
}) => {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 24 24"
      fill={filled ? '#FFD700' : 'none'}
      stroke={filled ? '#FFD700' : '#6b7280'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{
        animationDelay: `${delay}ms`
      }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
};

export const StarCelebration: React.FC<StarCelebrationProps> = ({
  starsEarned,
  isNewBest,
  onComplete,
  onSkip
}) => {
  const [revealedStars, setRevealedStars] = React.useState(0);
  const [showNewBest, setShowNewBest] = React.useState(false);
  const [showContinue, setShowContinue] = React.useState(false);

  React.useEffect(() => {
    // Sequential star reveal with 400ms delays
    const timers: NodeJS.Timeout[] = [];

    // Reveal each earned star sequentially
    for (let i = 1; i <= starsEarned; i++) {
      const timer = setTimeout(() => {
        setRevealedStars(i);
      }, i * 400);
      timers.push(timer);
    }

    // Show "New Best!" after earned stars revealed
    if (isNewBest) {
      const newBestTimer = setTimeout(() => {
        setShowNewBest(true);
      }, starsEarned * 400 + 200);
      timers.push(newBestTimer);
    }

    // Show "Tap to continue" after animation completes
    const continueTimer = setTimeout(() => {
      setShowContinue(true);
    }, starsEarned * 400 + 800);
    timers.push(continueTimer);

    // Call onComplete after all earned stars revealed + 500ms pause
    const completeTimer = setTimeout(() => {
      onComplete();
    }, starsEarned * 400 + 500);
    timers.push(completeTimer);

    // Cleanup
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [starsEarned, isNewBest, onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-500"
      onClick={onSkip}
    >
      {/* Star Display */}
      <div className="flex gap-6 mb-8">
        {[1, 2, 3].map((star) => {
          const isEarned = star <= starsEarned;
          const isRevealed = star <= revealedStars;
          const delay = star * 400;

          return (
            <div
              key={star}
              data-sfx="star-reveal"
              className={`relative ${isEarned && isRevealed ? 'star-pop' : ''} ${
                !isEarned && revealedStars >= starsEarned ? 'animate-in fade-in duration-500' : ''
              }`}
              style={{
                opacity: isRevealed || (!isEarned && revealedStars >= starsEarned) ? 1 : 0
              }}
            >
              <StarIcon
                filled={isEarned}
                delay={delay}
                className={isEarned && isRevealed ? 'filter drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]' : ''}
              />
            </div>
          );
        })}
      </div>

      {/* New Best Badge */}
      {showNewBest && (
        <div className="animate-in zoom-in duration-300 mb-6">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-display font-bold text-2xl px-6 py-3 rounded-full shadow-lg star-glow">
            New Best!
          </div>
        </div>
      )}

      {/* Continue Prompt */}
      {showContinue && (
        <div className="animate-in fade-in duration-500">
          <p className="text-white/60 font-marker text-sm animate-pulse">
            Tap to continue
          </p>
        </div>
      )}
    </div>
  );
};
