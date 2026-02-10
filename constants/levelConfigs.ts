/**
 * Campaign Level Configurations
 *
 * Hand-crafted level definitions for the first 10 campaign levels.
 * These levels provide a curated difficulty progression and teach core mechanics.
 *
 * Design Philosophy:
 * - Levels 1-3: Tutorial/Easy - Introduce basic mechanics gently
 * - Levels 4-7: Skill Building - Layer in mystery, dusty, and special discs
 * - Levels 8-9: Challenge - Test mastery with complex scenarios
 * - Level 10: Boss - Climactic speed round with all mechanics
 */

import { Genre, LevelMode, ShopTheme, SpecialDiscType } from '../types';

export interface CampaignLevelConfig {
  levelNumber: number;        // 1-10
  worldNumber: number;        // Always 1 for these first 10
  name: string;               // Display name (e.g., "First Sort", "Dusty Finds")
  description: string;        // Brief flavor text
  mode: LevelMode;            // Standard, Timed, or Boss for level 10
  theme: ShopTheme;           // Basement for 1-4, Store for 5-9, Expo for 10
  genres: Genre[];             // Which genres appear in crates
  crateCapacities: number[];   // Capacity per crate (matches genres array length)
  trashCount: number;         // Number of trash items
  mysteryCount: number;       // Number of mystery vinyls
  dustyCount: number;         // Number of dusty vinyls
  specialDiscs: SpecialDiscType[]; // Specific specials to include
  moves: number;              // Move limit (999 for timed/boss)
  time: number;               // Time limit in seconds (0 for standard mode)
  starCriteria: {
    twoStar: {
      description: string;
      accuracyThreshold: number;
      timeThreshold?: number;
    };
    threeStar: {
      description: string;
      accuracyThreshold: number;
      minCombo?: number;
      maxTimeRatio?: number;
    };
  };
}

/**
 * 10 hand-crafted campaign levels with curated difficulty progression.
 * Each level introduces or reinforces specific mechanics.
 */
export const CAMPAIGN_LEVELS: CampaignLevelConfig[] = [
  // ============================================================================
  // LEVELS 1-3: TUTORIAL/EASY
  // ============================================================================

  {
    levelNumber: 1,
    worldNumber: 1,
    name: "First Sort",
    description: "Welcome to your new vinyl shop! Let's learn the basics by sorting just a few records.",
    mode: 'Standard',
    theme: 'Basement',
    genres: [Genre.Rock, Genre.Jazz],
    crateCapacities: [2, 2],
    trashCount: 0,
    mysteryCount: 0,
    dustyCount: 0,
    specialDiscs: [],
    moves: 12,
    time: 0,
    starCriteria: {
      twoStar: {
        description: "Sort with 80% accuracy",
        accuracyThreshold: 0.80,
      },
      threeStar: {
        description: "Perfect accuracy - no mistakes!",
        accuracyThreshold: 1.00,
      },
    },
  },

  {
    levelNumber: 2,
    worldNumber: 1,
    name: "Getting Sorted",
    description: "More vinyls, plus your first trash item. Remember: trash goes in the bin!",
    mode: 'Standard',
    theme: 'Basement',
    genres: [Genre.Rock, Genre.Soul],
    crateCapacities: [3, 3],
    trashCount: 1,
    mysteryCount: 0,
    dustyCount: 0,
    specialDiscs: [],
    moves: 14,
    time: 0,
    starCriteria: {
      twoStar: {
        description: "Sort with 80% accuracy",
        accuracyThreshold: 0.80,
      },
      threeStar: {
        description: "Perfect accuracy + build a 2x combo",
        accuracyThreshold: 1.00,
        minCombo: 2,
      },
    },
  },

  {
    levelNumber: 3,
    worldNumber: 1,
    name: "Triple Threat",
    description: "Three crates now! Plus a mystery vinyl - click to reveal its genre.",
    mode: 'Standard',
    theme: 'Basement',
    genres: [Genre.Rock, Genre.Jazz, Genre.Funk],
    crateCapacities: [2, 2, 2],
    trashCount: 1,
    mysteryCount: 1,
    dustyCount: 0,
    specialDiscs: [],
    moves: 16,
    time: 0,
    starCriteria: {
      twoStar: {
        description: "Sort with 75% accuracy",
        accuracyThreshold: 0.75,
      },
      threeStar: {
        description: "95% accuracy + build a 3x combo",
        accuracyThreshold: 0.95,
        minCombo: 3,
      },
    },
  },

  // ============================================================================
  // LEVELS 4-7: SKILL BUILDING
  // ============================================================================

  {
    levelNumber: 4,
    worldNumber: 1,
    name: "Mystery Box",
    description: "Multiple mystery vinyls to uncover. Click them to reveal their true genre!",
    mode: 'Standard',
    theme: 'Basement',
    genres: [Genre.Jazz, Genre.Soul, Genre.Disco],
    crateCapacities: [3, 3, 3],
    trashCount: 2,
    mysteryCount: 3,
    dustyCount: 0,
    specialDiscs: [],
    moves: 18,
    time: 0,
    starCriteria: {
      twoStar: {
        description: "Sort with 80% accuracy",
        accuracyThreshold: 0.80,
      },
      threeStar: {
        description: "95% accuracy + build a 3x combo",
        accuracyThreshold: 0.95,
        minCombo: 3,
      },
    },
  },

  {
    levelNumber: 5,
    worldNumber: 1,
    name: "Dust Off",
    description: "Welcome to the main store! These dusty vinyls need cleaning - click to remove dust layers.",
    mode: 'Standard',
    theme: 'Store',
    genres: [Genre.Rock, Genre.Funk, Genre.Electronic],
    crateCapacities: [3, 3, 3],
    trashCount: 2,
    mysteryCount: 1,
    dustyCount: 3,
    specialDiscs: [],
    moves: 20,
    time: 0,
    starCriteria: {
      twoStar: {
        description: "Sort with 75% accuracy",
        accuracyThreshold: 0.75,
      },
      threeStar: {
        description: "90% accuracy + build a 3x combo",
        accuracyThreshold: 0.90,
        minCombo: 3,
      },
    },
  },

  {
    levelNumber: 6,
    worldNumber: 1,
    name: "Beat the Clock",
    description: "Your first timed challenge! Sort quickly while maintaining accuracy.",
    mode: 'Timed',
    theme: 'Store',
    genres: [Genre.Jazz, Genre.Disco, Genre.Punk],
    crateCapacities: [3, 3, 3],
    trashCount: 2,
    mysteryCount: 2,
    dustyCount: 2,
    specialDiscs: [],
    moves: 999,
    time: 45,
    starCriteria: {
      twoStar: {
        description: "70% accuracy with 25% time remaining",
        accuracyThreshold: 0.70,
        timeThreshold: 0.25,
      },
      threeStar: {
        description: "85% accuracy with 50% time remaining",
        accuracyThreshold: 0.85,
        maxTimeRatio: 0.50,
      },
    },
  },

  {
    levelNumber: 7,
    worldNumber: 1,
    name: "Special Delivery",
    description: "Special discs have arrived! Diamond boosts score, wildcard fits anywhere.",
    mode: 'Standard',
    theme: 'Store',
    genres: [Genre.Soul, Genre.Funk, Genre.Rock],
    crateCapacities: [4, 4, 4],
    trashCount: 3,
    mysteryCount: 2,
    dustyCount: 2,
    specialDiscs: ['diamond', 'wildcard'],
    moves: 22,
    time: 0,
    starCriteria: {
      twoStar: {
        description: "Sort with 75% accuracy",
        accuracyThreshold: 0.75,
      },
      threeStar: {
        description: "90% accuracy + build a 4x combo",
        accuracyThreshold: 0.90,
        minCombo: 4,
      },
    },
  },

  // ============================================================================
  // LEVELS 8-9: CHALLENGE
  // ============================================================================

  {
    levelNumber: 8,
    worldNumber: 1,
    name: "Vinyl Rush",
    description: "Four crates, tough timer, bombs and chains! Stay focused under pressure.",
    mode: 'Timed',
    theme: 'Store',
    genres: [Genre.Rock, Genre.Jazz, Genre.Funk, Genre.Electronic],
    crateCapacities: [3, 3, 3, 3],
    trashCount: 3,
    mysteryCount: 3,
    dustyCount: 3,
    specialDiscs: ['bomb', 'chain'],
    moves: 999,
    time: 50,
    starCriteria: {
      twoStar: {
        description: "70% accuracy - survive the rush!",
        accuracyThreshold: 0.70,
      },
      threeStar: {
        description: "85% accuracy with 40% time remaining",
        accuracyThreshold: 0.85,
        maxTimeRatio: 0.40,
      },
    },
  },

  {
    levelNumber: 9,
    worldNumber: 1,
    name: "The Gauntlet",
    description: "The ultimate test before the boss. Master all mechanics in this gauntlet!",
    mode: 'Standard',
    theme: 'Store',
    genres: [Genre.Disco, Genre.Punk, Genre.Soul, Genre.Jazz],
    crateCapacities: [4, 4, 4, 4],
    trashCount: 4,
    mysteryCount: 4,
    dustyCount: 4,
    specialDiscs: ['diamond', 'time', 'chain'],
    moves: 28,
    time: 0,
    starCriteria: {
      twoStar: {
        description: "Sort with 75% accuracy",
        accuracyThreshold: 0.75,
      },
      threeStar: {
        description: "90% accuracy + build a 5x combo",
        accuracyThreshold: 0.90,
        minCombo: 5,
      },
    },
  },

  // ============================================================================
  // LEVEL 10: BOSS
  // ============================================================================

  {
    levelNumber: 10,
    worldNumber: 1,
    name: "The Big Sort",
    description: "The vinyl expo awaits! Sort a massive collection in record time to prove you're a true vinyl master!",
    mode: 'Boss',
    theme: 'Expo',
    genres: [Genre.Rock, Genre.Jazz, Genre.Soul, Genre.Funk],
    crateCapacities: [5, 5, 5, 5],
    trashCount: 4,
    mysteryCount: 4,
    dustyCount: 4,
    specialDiscs: ['diamond', 'wildcard', 'bomb'],
    moves: 999,
    time: 40,
    starCriteria: {
      twoStar: {
        description: "70% accuracy - complete the expo challenge!",
        accuracyThreshold: 0.70,
      },
      threeStar: {
        description: "90% accuracy with 60% time remaining - become a legend!",
        accuracyThreshold: 0.90,
        maxTimeRatio: 0.60,
      },
    },
  },
];

/**
 * Get campaign level configuration by level number.
 *
 * @param levelNumber - Level number (1-10 for current campaign)
 * @returns Level config object, or null if level doesn't exist
 *
 * @example
 * const level1 = getCampaignLevel(1); // Returns first level config
 * const level11 = getCampaignLevel(11); // Returns null (future levels not yet defined)
 */
export const getCampaignLevel = (levelNumber: number): CampaignLevelConfig | null => {
  if (levelNumber < 1 || levelNumber > 10) {
    return null;
  }
  return CAMPAIGN_LEVELS[levelNumber - 1] || null;
};
