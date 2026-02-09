/**
 * Random Events System
 *
 * Adds unpredictable gameplay events to break monotony and create variety.
 * Events can be positive (bonuses) or negative (challenges).
 */

export enum RandomEventType {
  EARTHQUAKE = 'earthquake',      // Shake crates for 3s
  DUST_STORM = 'dust_storm',      // Add dust to all vinyls
  BLACKOUT = 'blackout',          // Dark screen for 5s
  SLOW_MOTION = 'slow_motion',    // Slow everything 0.5x for 10s (BONUS)
  MAGNETIC_SURGE = 'magnetic_surge', // Double magnet radius for 15s (BONUS)
}

export interface RandomEvent {
  type: RandomEventType;
  startTime: number;
  endTime: number;
}

export interface RandomEventConfig {
  probability: number;      // 0-1, chance per level
  duration: number;        // seconds
  isBonus: boolean;        // true = positive effect, false = challenge
  title: string;          // Display name
  description: string;     // Short description
}

export const RANDOM_EVENT_CONFIG: Record<RandomEventType, RandomEventConfig> = {
  [RandomEventType.EARTHQUAKE]: {
    probability: 0.08,     // 8%
    duration: 3,
    isBonus: false,
    title: '🌋 EARTHQUAKE!',
    description: 'Crate trembling!'
  },
  [RandomEventType.DUST_STORM]: {
    probability: 0.10,     // 10%
    duration: 0,           // Instant effect
    isBonus: false,
    title: '🌪️ DUST STORM!',
    description: 'Clean your vinyls!'
  },
  [RandomEventType.BLACKOUT]: {
    probability: 0.07,     // 7%
    duration: 5,
    isBonus: false,
    title: '💡 BLACKOUT!',
    description: 'Lights out!'
  },
  [RandomEventType.SLOW_MOTION]: {
    probability: 0.05,     // 5%
    duration: 10,
    isBonus: true,
    title: '⏳ SLOW-MO!',
    description: 'Time slowed!'
  },
  [RandomEventType.MAGNETIC_SURGE]: {
    probability: 0.08,     // 8%
    duration: 15,
    isBonus: true,
    title: '🧲 MAGNETIC SURGE!',
    description: 'Boosted range!'
  },
};

// Minimum level before random events can trigger
export const RANDOM_EVENT_MIN_LEVEL = 3;

// Seconds after level start before events can trigger
export const RANDOM_EVENT_COOLDOWN = 10;

// Maximum events per level
export const RANDOM_EVENT_MAX_PER_LEVEL = 1;
