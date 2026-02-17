/**
 * Star Calculation Service
 *
 * Pure functions for calculating star ratings based on gameplay performance.
 * No React dependencies - can be used in any context (game logic, UI, tests).
 *
 * Star rating system:
 * - 0 stars: Level not completed (lost)
 * - 1 star: Level completed
 * - 2 stars: Good performance (mode-specific criteria)
 * - 3 stars: Excellent performance (mode-specific criteria)
 */

import { GameState, LevelMode } from '../types';
import { STAR_THRESHOLDS } from '../constants/starThresholds';

// ============================================================================
// TYPES
// ============================================================================

export interface StarCriteria {
  twoStar: {
    accuracyThreshold: number;
    timeThreshold?: number;
    description: string;
  };
  threeStar: {
    accuracyThreshold: number;
    minCombo?: number;
    maxTimeRatio?: number;
    timeThreshold?: number;
    description: string;
  };
}

// ============================================================================
// CRITERIA RETRIEVAL
// ============================================================================

/**
 * Get star earning criteria for a specific level and mode
 *
 * @param levelNumber - Level number (for future per-level overrides)
 * @param mode - Game mode (Standard, Timed, SuddenDeath, Boss, Endless)
 * @returns Star criteria with thresholds and descriptions
 */
export const getStarCriteria = (levelNumber: number, mode: LevelMode): StarCriteria => {
  switch (mode) {
    case 'Standard': {
      const thresholds = STAR_THRESHOLDS.Standard;
      return {
        twoStar: {
          accuracyThreshold: thresholds.twoStar.accuracyThreshold,
          description: `${thresholds.twoStar.accuracyThreshold * 100}% accuracy`,
        },
        threeStar: {
          accuracyThreshold: thresholds.threeStar.accuracyThreshold,
          minCombo: thresholds.threeStar.minCombo,
          description: `${thresholds.threeStar.accuracyThreshold * 100}% accuracy + ${thresholds.threeStar.minCombo}x combo`,
        },
      };
    }

    case 'Timed': {
      const thresholds = STAR_THRESHOLDS.Timed;
      return {
        twoStar: {
          accuracyThreshold: thresholds.twoStar.accuracyThreshold,
          timeThreshold: thresholds.twoStar.timeThreshold,
          description: `${thresholds.twoStar.accuracyThreshold * 100}% accuracy + ${thresholds.twoStar.timeThreshold * 100}% time left`,
        },
        threeStar: {
          accuracyThreshold: thresholds.threeStar.accuracyThreshold,
          timeThreshold: thresholds.threeStar.timeThreshold,
          description: `${thresholds.threeStar.accuracyThreshold * 100}% accuracy + ${thresholds.threeStar.timeThreshold * 100}% time left`,
        },
      };
    }

    case 'SuddenDeath': {
      const thresholds = STAR_THRESHOLDS.SuddenDeath;
      return {
        twoStar: {
          accuracyThreshold: thresholds.twoStar.accuracyThreshold,
          description: '1 mistake allowed',
        },
        threeStar: {
          accuracyThreshold: thresholds.threeStar.accuracyThreshold,
          description: 'Zero mistakes',
        },
      };
    }

    case 'Boss': {
      const thresholds = STAR_THRESHOLDS.Boss;
      return {
        twoStar: {
          accuracyThreshold: thresholds.twoStar.accuracyThreshold,
          description: `${thresholds.twoStar.accuracyThreshold * 100}% accuracy`,
        },
        threeStar: {
          accuracyThreshold: thresholds.threeStar.accuracyThreshold,
          maxTimeRatio: thresholds.threeStar.maxTimeRatio,
          description: `${thresholds.threeStar.accuracyThreshold * 100}% accuracy + complete in ${thresholds.threeStar.maxTimeRatio * 100}% of time`,
        },
      };
    }

    case 'Endless':
      // Endless mode doesn't award stars
      return {
        twoStar: {
          accuracyThreshold: 1.0,
          description: 'N/A (Endless mode)',
        },
        threeStar: {
          accuracyThreshold: 1.0,
          description: 'N/A (Endless mode)',
        },
      };

    default:
      // Fallback to Standard mode criteria
      return getStarCriteria(levelNumber, 'Standard');
  }
};

// ============================================================================
// STAR CALCULATION
// ============================================================================

/**
 * Calculate accuracy as a ratio of correct moves to total moves
 *
 * @param gameState - Current game state
 * @returns Accuracy ratio (0.0 to 1.0)
 */
const calculateAccuracy = (gameState: GameState): number => {
  if (gameState.totalMoves === 0) {
    return 1.0; // No moves made = perfect accuracy
  }
  return (gameState.totalMoves - gameState.mistakes) / gameState.totalMoves;
};

/**
 * Calculate time remaining ratio for timed modes
 *
 * @param gameState - Current game state
 * @returns Time remaining ratio (0.0 to 1.0)
 */
const calculateTimeRatio = (gameState: GameState): number => {
  if (gameState.maxTime === 0) {
    return 1.0; // No time limit = max score
  }
  return gameState.timeLeft / gameState.maxTime;
};

/**
 * Calculate time used ratio for boss modes
 *
 * @param gameState - Current game state
 * @returns Time used ratio (0.0 to 1.0)
 */
const calculateTimeUsedRatio = (gameState: GameState): number => {
  if (gameState.maxTime === 0) {
    return 0; // No time limit = no time used
  }
  const timeUsed = gameState.maxTime - gameState.timeLeft;
  return timeUsed / gameState.maxTime;
};

/**
 * Calculate final star rating at level completion
 *
 * @param gameState - Final game state
 * @param criteria - Star criteria for this level/mode
 * @returns Stars earned (0-3)
 */
export const calculateStarsEarned = (
  gameState: GameState,
  criteria: StarCriteria
): number => {
  // 0 stars if level not won
  if (gameState.status !== 'won') {
    return 0;
  }

  // 1 star for completion (baseline)
  let stars = 1;

  const accuracy = calculateAccuracy(gameState);
  const timeRatio = calculateTimeRatio(gameState);
  const timeUsedRatio = calculateTimeUsedRatio(gameState);

  // Check for 3 stars first (higher threshold)
  let qualifiesForThreeStars = accuracy >= criteria.threeStar.accuracyThreshold;

  // Mode-specific 3-star checks
  if (criteria.threeStar.minCombo !== undefined) {
    qualifiesForThreeStars =
      qualifiesForThreeStars && gameState.maxComboThisLevel >= criteria.threeStar.minCombo;
  }

  if (criteria.threeStar.timeThreshold !== undefined) {
    qualifiesForThreeStars =
      qualifiesForThreeStars && timeRatio >= criteria.threeStar.timeThreshold;
  }

  if (criteria.threeStar.maxTimeRatio !== undefined) {
    qualifiesForThreeStars =
      qualifiesForThreeStars && timeUsedRatio <= criteria.threeStar.maxTimeRatio;
  }

  if (qualifiesForThreeStars) {
    return 3;
  }

  // Check for 2 stars
  let qualifiesForTwoStars = accuracy >= criteria.twoStar.accuracyThreshold;

  // Mode-specific 2-star checks
  if (criteria.twoStar.timeThreshold !== undefined) {
    qualifiesForTwoStars =
      qualifiesForTwoStars && timeRatio >= criteria.twoStar.timeThreshold;
  }

  if (qualifiesForTwoStars) {
    stars = 2;
  }

  return stars;
};

/**
 * Calculate current star projection during gameplay
 *
 * Used for real-time UI feedback showing potential star rating.
 * Assumes the player will complete the level successfully.
 *
 * @param gameState - Current game state (during play)
 * @param criteria - Star criteria for this level/mode
 * @returns Projected stars (1-3)
 */
export const calculateCurrentStars = (
  gameState: GameState,
  criteria: StarCriteria
): number => {
  // During gameplay, always assume at least 1 star (completion)
  // This is a projection, not final rating
  let stars = 1;

  const accuracy = calculateAccuracy(gameState);
  const timeRatio = calculateTimeRatio(gameState);
  const timeUsedRatio = calculateTimeUsedRatio(gameState);

  // Check for 3-star projection
  let qualifiesForThreeStars = accuracy >= criteria.threeStar.accuracyThreshold;

  if (criteria.threeStar.minCombo !== undefined) {
    qualifiesForThreeStars =
      qualifiesForThreeStars && gameState.maxComboThisLevel >= criteria.threeStar.minCombo;
  }

  if (criteria.threeStar.timeThreshold !== undefined) {
    qualifiesForThreeStars =
      qualifiesForThreeStars && timeRatio >= criteria.threeStar.timeThreshold;
  }

  if (criteria.threeStar.maxTimeRatio !== undefined) {
    qualifiesForThreeStars =
      qualifiesForThreeStars && timeUsedRatio <= criteria.threeStar.maxTimeRatio;
  }

  if (qualifiesForThreeStars) {
    return 3;
  }

  // Check for 2-star projection
  let qualifiesForTwoStars = accuracy >= criteria.twoStar.accuracyThreshold;

  if (criteria.twoStar.timeThreshold !== undefined) {
    qualifiesForTwoStars =
      qualifiesForTwoStars && timeRatio >= criteria.twoStar.timeThreshold;
  }

  if (qualifiesForTwoStars) {
    stars = 2;
  }

  return stars;
};
