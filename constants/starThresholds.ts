/**
 * Star Rating Thresholds
 *
 * Tunable constants for the 3-star rating system across different game modes.
 * These values determine when players earn 2 or 3 stars for completing a level.
 *
 * Star rules:
 * - 1 star: Complete the level (win condition met)
 * - 2 stars: Meet accuracy/time thresholds (mode-specific)
 * - 3 stars: Perfect or near-perfect performance (mode-specific)
 */

// ============================================================================
// DEFAULT THRESHOLDS (for easy tuning)
// ============================================================================

/**
 * Default accuracy threshold for earning 2 stars (80%)
 */
export const DEFAULT_TWO_STAR_ACCURACY = 0.8;

/**
 * Default accuracy threshold for earning 3 stars (100%)
 */
export const DEFAULT_THREE_STAR_ACCURACY = 1.0;

/**
 * Minimum combo multiplier required for 3 stars in Standard mode
 */
export const DEFAULT_THREE_STAR_MIN_COMBO = 3;

// ============================================================================
// MODE-SPECIFIC THRESHOLDS
// ============================================================================

export const STAR_THRESHOLDS = {
  /**
   * Standard Mode: Focus on accuracy and combo building
   * - 2 stars: 80% accuracy
   * - 3 stars: 100% accuracy + 3x combo minimum
   */
  Standard: {
    twoStar: {
      accuracyThreshold: DEFAULT_TWO_STAR_ACCURACY,
    },
    threeStar: {
      accuracyThreshold: DEFAULT_THREE_STAR_ACCURACY,
      minCombo: DEFAULT_THREE_STAR_MIN_COMBO,
    },
  },

  /**
   * Timed Mode: Balance accuracy with time pressure
   * - 2 stars: 75% accuracy + 25% time remaining
   * - 3 stars: 85% accuracy + 50% time remaining
   */
  Timed: {
    twoStar: {
      accuracyThreshold: 0.75,
      timeThreshold: 0.25, // 25% of max time remaining
    },
    threeStar: {
      accuracyThreshold: 0.85,
      timeThreshold: 0.5, // 50% of max time remaining
    },
  },

  /**
   * SuddenDeath Mode: Mistakes are heavily penalized
   * - 2 stars: Complete with 1 mistake allowed
   * - 3 stars: Zero mistakes (perfect)
   */
  SuddenDeath: {
    twoStar: {
      accuracyThreshold: 0.95, // allows 1 mistake in typical level
    },
    threeStar: {
      accuracyThreshold: 1.0, // zero mistakes
    },
  },

  /**
   * Boss Mode: Extended challenge with time pressure
   * - 2 stars: 70% accuracy
   * - 3 stars: 90% accuracy + complete in 60% of max time
   */
  Boss: {
    twoStar: {
      accuracyThreshold: 0.7,
    },
    threeStar: {
      accuracyThreshold: 0.9,
      maxTimeRatio: 0.6, // complete in 60% or less of max time
    },
  },

  /**
   * Endless Mode: No stars awarded (continuous play)
   */
  Endless: {
    twoStar: {
      accuracyThreshold: 1.0, // not used
    },
    threeStar: {
      accuracyThreshold: 1.0, // not used
    },
  },
} as const;
