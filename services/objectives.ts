// Secondary Objectives generation and tracking

import { SecondaryObjective, ObjectiveType, LevelMode } from '../types';

/**
 * Generate 1-2 random secondary objectives for a level
 * Objectives scale in difficulty based on level number
 */
export const generateSecondaryObjectives = (
  levelIndex: number,
  mode: LevelMode
): SecondaryObjective[] => {
  const level = levelIndex + 1; // Convert 0-based to 1-based
  const availableObjectives: Array<{
    type: ObjectiveType;
    weight: number; // Higher weight = more likely to appear
    minLevel: number; // Minimum level required
  }> = [];

  // Zero errors - available from level 1
  availableObjectives.push({
    type: 'zero_errors',
    weight: 10,
    minLevel: 1
  });

  // Combo streak - available from level 3, scales with level
  if (level >= 3) {
    availableObjectives.push({
      type: 'combo_streak',
      weight: 8,
      minLevel: 3
    });
  }

  // Time limit - only for non-timed modes, available from level 5
  if (mode !== 'Timed' && level >= 5) {
    availableObjectives.push({
      type: 'time_limit',
      weight: 7,
      minLevel: 5
    });
  }

  // Clean all dusty - available from level 7
  if (level >= 7) {
    availableObjectives.push({
      type: 'clean_all_dusty',
      weight: 6,
      minLevel: 7
    });
  }

  // No hints - available from level 10 (when hints unlock)
  if (level >= 10) {
    availableObjectives.push({
      type: 'no_hints',
      weight: 5,
      minLevel: 10
    });
  }

  // Perfect accuracy - available from level 8
  if (level >= 8) {
    availableObjectives.push({
      type: 'perfect_accuracy',
      weight: 9,
      minLevel: 8
    });
  }

  // Filter by minimum level and shuffle with weighted random
  const eligible = availableObjectives.filter(obj => level >= obj.minLevel);

  // Select 1-2 objectives (2 objectives from level 5+)
  const count = level >= 5 ? 2 : 1;
  const selected: ObjectiveType[] = [];

  for (let i = 0; i < count && eligible.length > 0; i++) {
    // Weighted random selection
    const totalWeight = eligible.reduce((sum, obj) => sum + obj.weight, 0);
    let random = Math.random() * totalWeight;

    let selectedIndex = 0;
    for (let j = 0; j < eligible.length; j++) {
      random -= eligible[j].weight;
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }

    selected.push(eligible[selectedIndex].type);
    // Remove selected to avoid duplicates
    eligible.splice(selectedIndex, 1);
  }

  // Build objective objects
  return selected.map((type, index) => createObjective(type, level, index));
};

/**
 * Create a SecondaryObjective with appropriate values based on type and level
 */
const createObjective = (
  type: ObjectiveType,
  level: number,
  index: number
): SecondaryObjective => {
  const id = `obj_${type}_${index}`;

  switch (type) {
    case 'zero_errors':
      return {
        id,
        type,
        title: 'Perfezionista',
        description: 'Completa senza errori',
        completed: false,
        bonusXP: 50 + (level * 5)
      };

    case 'combo_streak': {
      // Scale combo target: level 3-5 = x3, 6-9 = x5, 10+ = x7
      const targetCombo = level < 6 ? 3 : level < 10 ? 5 : 7;
      return {
        id,
        type,
        title: 'Combo Master',
        description: `Raggiungi combo x${targetCombo}`,
        targetValue: targetCombo,
        currentValue: 0,
        completed: false,
        bonusXP: 40 + (targetCombo * 10)
      };
    }

    case 'time_limit': {
      // Scale time limit: level 5-7 = 180s, 8-10 = 150s, 11+ = 120s
      const timeLimit = level < 8 ? 180 : level < 11 ? 150 : 120;
      return {
        id,
        type,
        title: 'Velocità',
        description: `Completa in meno di ${timeLimit}s`,
        targetValue: timeLimit,
        currentValue: 0,
        completed: false,
        bonusXP: 60 + (level * 3)
      };
    }

    case 'clean_all_dusty':
      return {
        id,
        type,
        title: 'Pulizia Totale',
        description: 'Pulisci tutti i vinili sporchi',
        completed: false,
        bonusXP: 30 + (level * 4)
      };

    case 'no_hints':
      return {
        id,
        type,
        title: 'Senza Aiuti',
        description: 'Non usare suggerimenti',
        completed: false,
        bonusXP: 70 + (level * 5)
      };

    case 'perfect_accuracy':
      return {
        id,
        type,
        title: 'Precisione',
        description: 'Mantieni 100% di accuratezza',
        completed: false,
        bonusXP: 80 + (level * 6)
      };

    default:
      return {
        id,
        type,
        title: 'Obiettivo',
        description: 'Completa obiettivo',
        completed: false,
        bonusXP: 25
      };
  }
};

/**
 * Check if objectives are completed based on current game state
 */
export const updateObjectiveProgress = (
  objectives: SecondaryObjective[],
  gameState: {
    mistakes: number;
    maxComboThisLevel: number;
    timeElapsed: number;
    hintsUsed: number;
    dustyVinylsCleaned: number;
    totalDustyVinyls: number;
    totalMoves: number;
  }
): SecondaryObjective[] => {
  return objectives.map(obj => {
    if (obj.completed) return obj; // Already completed

    switch (obj.type) {
      case 'zero_errors':
        return {
          ...obj,
          completed: gameState.mistakes === 0
        };

      case 'combo_streak':
        return {
          ...obj,
          currentValue: gameState.maxComboThisLevel,
          completed: gameState.maxComboThisLevel >= (obj.targetValue || 0)
        };

      case 'time_limit':
        return {
          ...obj,
          currentValue: gameState.timeElapsed,
          completed: gameState.timeElapsed <= (obj.targetValue || 0)
        };

      case 'clean_all_dusty':
        return {
          ...obj,
          completed: gameState.totalDustyVinyls > 0 &&
                    gameState.dustyVinylsCleaned === gameState.totalDustyVinyls
        };

      case 'no_hints':
        return {
          ...obj,
          completed: gameState.hintsUsed === 0
        };

      case 'perfect_accuracy':
        return {
          ...obj,
          completed: gameState.totalMoves > 0 && gameState.mistakes === 0
        };

      default:
        return obj;
    }
  });
};

/**
 * Calculate total bonus XP from completed objectives
 */
export const calculateObjectiveBonus = (objectives: SecondaryObjective[]): number => {
  return objectives.reduce((total, obj) => {
    return total + (obj.completed ? obj.bonusXP : 0);
  }, 0);
};
