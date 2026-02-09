/**
 * Game Configuration Constants
 *
 * All magic numbers and game tuning parameters are centralized here.
 * This makes it easier to balance gameplay, maintain consistency,
 * and understand design decisions.
 */

// ============================================================================
// GAMEPLAY MECHANICS
// ============================================================================

/**
 * Distance (in pixels) from crate center where magnetic attraction activates.
 * Larger values make the game easier by giving more forgiving drop zones.
 */
export const MAGNET_RADIUS = 150;

/**
 * Distance (in pixels) from trash bin where items can be dropped.
 * Smaller than magnet radius to make trash disposal slightly harder.
 */
export const TRASH_RADIUS = 100;

/**
 * Time window (in milliseconds) to maintain combo multiplier.
 * Reset to 1x if no correct placement within this time.
 */
export const COMBO_TIMEOUT = 3000;

/**
 * Maximum dust level a vinyl can have (0 = clean, 3 = very dusty).
 */
export const MAX_DUST_LEVEL = 3;

/**
 * Points awarded for cleaning one dust level off a vinyl.
 */
export const DUST_CLEAN_BONUS = 10;

/**
 * Points awarded for revealing a mystery vinyl.
 */
export const MYSTERY_REVEAL_BONUS = 50;

/**
 * Points awarded for placing a gold vinyl correctly.
 */
export const GOLD_VINYL_BONUS = 200;

// ============================================================================
// ANIMATIONS & TIMING
// ============================================================================

/**
 * Duration (in milliseconds) for vinyl flying animation from shelf to crate.
 */
export const FLYING_VINYL_DURATION = 600;

/**
 * Duration (in milliseconds) for particle explosion animations.
 */
export const PARTICLE_ANIMATION_DURATION = 600;

/**
 * Delay (in milliseconds) before removing explosion particles from DOM.
 * Should match or slightly exceed PARTICLE_ANIMATION_DURATION.
 */
export const PARTICLE_CLEANUP_DELAY = 600;

/**
 * CSS cubic-bezier easing for flying vinyl animation.
 * Creates a bouncy, satisfying motion.
 */
export const FLYING_VINYL_EASING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

/**
 * Duration (in seconds) for opacity fade transitions.
 */
export const FADE_DURATION = 0.5;

/**
 * Duration (in milliseconds) for haptic feedback vibrations.
 */
export const HAPTIC_DURATION = {
  light: 10,
  heavy: 50,
  success: [10, 30] as [number, number],
};

// ============================================================================
// VISUAL EFFECTS
// ============================================================================

/**
 * Combo tier color classes for visual feedback.
 */
export const COMBO_TIER_COLORS = {
  low: 'text-yellow-400',
  mid: 'text-orange-500 animate-pulse',
  high: 'text-red-500 animate-bounce drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]'
} as const;

/**
 * Genre-specific texture patterns for colorblind accessibility mode.
 * Applied as CSS background-image overlays on vinyl covers.
 */
export const GENRE_PATTERNS: Record<string, string> = {
  Rock: 'repeating-linear-gradient(45deg, #000 0px, #000 2px, transparent 2px, transparent 10px)',
  Jazz: 'radial-gradient(circle, #000 2px, transparent 2px)',
  Soul: 'repeating-radial-gradient(circle at center, transparent 0px, transparent 8px, #000 8px, #000 9px)',
  Funk: 'repeating-linear-gradient(0deg, transparent 0px, transparent 8px, #000 8px, #000 10px)',
  Disco: 'repeating-conic-gradient(#000 0deg 90deg, transparent 90deg 180deg)',
  Punk: 'repeating-linear-gradient(45deg, #000 0px, #000 2px, transparent 2px, transparent 10px), repeating-linear-gradient(-45deg, #000 0px, #000 2px, transparent 2px, transparent 10px)',
  Electronic: 'repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 10px), repeating-linear-gradient(90deg, #000 0px, #000 1px, transparent 1px, transparent 10px)'
} as const;

/**
 * Number of particles generated per explosion.
 * Reduced on mobile for better performance.
 */
export const PARTICLES_PER_EXPLOSION = 8;
export const PARTICLES_PER_EXPLOSION_MOBILE = 4;

/**
 * Distance (in pixels) particles travel from explosion center.
 */
export const PARTICLE_SPREAD_RADIUS = 80;

/**
 * Size (in pixels) of each particle.
 */
export const PARTICLE_SIZE = 8; // w-2 h-2 in Tailwind = 8px

/**
 * Z-index for particle explosions (must be above drag elements).
 */
export const PARTICLE_Z_INDEX = 150;

/**
 * Z-index for flying vinyl items (must be above everything).
 */
export const FLYING_VINYL_Z_INDEX = 200;

/**
 * Z-index for dragged vinyl (must be above shelf but below flying).
 */
export const DRAG_Z_INDEX = 100;

/**
 * Scale factor for vinyl during flight (0.4 = 40% of original size).
 */
export const FLYING_VINYL_SCALE = 0.4;

/**
 * Rotation (in degrees) applied to vinyl during flight animation.
 */
export const FLYING_VINYL_ROTATION = 360;

// ============================================================================
// UI & LAYOUT
// ============================================================================

/**
 * Breakpoint (in pixels) for mobile vs desktop layout.
 * Below this width, mobile-optimized UI is shown.
 */
export const MOBILE_BREAKPOINT = 768;

/**
 * Default vinyl cover size (in pixels) for desktop view.
 */
export const VINYL_SIZE_DESKTOP = 100;

/**
 * Default vinyl cover size (in pixels) for mobile view.
 */
export const VINYL_SIZE_MOBILE = 80;

/**
 * Crate box size (in pixels) for desktop view.
 */
export const CRATE_SIZE_DESKTOP = 160;

/**
 * Crate box size (in pixels) for mobile view.
 */
export const CRATE_SIZE_MOBILE = 130;

// ============================================================================
// PROGRESSION & DIFFICULTY
// ============================================================================

/**
 * Level interval for unlocking new genres (every N levels).
 */
export const GENRE_UNLOCK_INTERVAL = 2;

/**
 * Initial number of genres available at game start.
 */
export const INITIAL_GENRE_COUNT = 2;

/**
 * Level threshold for "Store" shop theme upgrade.
 */
export const STORE_THEME_LEVEL = 5;

/**
 * Level threshold for "Expo" shop theme upgrade.
 */
export const EXPO_THEME_LEVEL = 10;

/**
 * Probability (0-1) of generating a gold vinyl.
 */
export const GOLD_VINYL_CHANCE = 0.04; // 4%

/**
 * Base XP multiplier per level for progression.
 * XP to next level = LEVEL_XP_BASE * current_level
 */
export const LEVEL_XP_BASE = 100;

/**
 * Score multiplier increment per combo level.
 * Score = base_score * (1 + combo * COMBO_MULTIPLIER_INCREMENT)
 */
export const COMBO_MULTIPLIER_INCREMENT = 0.2; // 20% per combo

/**
 * Base score awarded for correct vinyl placement.
 */
export const BASE_PLACEMENT_SCORE = 100;

/**
 * Maximum number of crates that can appear in a single level.
 * Limited by UI layout constraints.
 */
export const MAX_CRATES_PER_LEVEL = 4;

/**
 * Minimum number of crates in any level.
 */
export const MIN_CRATES_PER_LEVEL = 2;

/**
 * Level interval for increasing crate count (every N levels).
 */
export const CRATE_INCREASE_INTERVAL = 4;

/**
 * Level interval for increasing crate capacity (every N levels).
 */
export const CAPACITY_INCREASE_INTERVAL = 5;

// ============================================================================
// GAME MODES
// ============================================================================

/**
 * Minimum level before "Timed" mode can appear.
 */
export const TIMED_MODE_MIN_LEVEL = 3;

/**
 * Interval for timed mode appearance (every Nth level after minimum).
 */
export const TIMED_MODE_INTERVAL = 3;

/**
 * Minimum level before "Sudden Death" mode can appear.
 */
export const SUDDEN_DEATH_MIN_LEVEL = 5;

/**
 * Interval for sudden death mode appearance.
 */
export const SUDDEN_DEATH_INTERVAL = 4;

/**
 * Move count for infinite moves (used in timed mode).
 */
export const INFINITE_MOVES = 999;

/**
 * Time multiplier per vinyl in timed mode (easy/normal difficulty).
 */
export const TIME_PER_VINYL_NORMAL = 4; // seconds

/**
 * Time multiplier per vinyl in timed mode (hard difficulty).
 */
export const TIME_PER_VINYL_HARD = 2.5; // seconds

/**
 * Minimum time allowed in timed mode (prevents too-short levels).
 */
export const MIN_TIMED_SECONDS = 15;

// ============================================================================
// DIFFICULTY SETTINGS
// ============================================================================

export const DIFFICULTY_CONFIG = {
  Easy: {
    trashMultiplier: 0.5,
    dustChance: 0.1,
    mysteryChance: 0.05,
    moveBuffer: 5,
    minCrateSize: 2,
  },
  Normal: {
    trashMultiplier: 0.8,
    dustChance: 0.3,
    mysteryChance: 0.2,
    moveBuffer: 3,
    minCrateSize: 3,
  },
  Hard: {
    trashMultiplier: 1.5,
    dustChance: 0.5,
    mysteryChance: 0.4,
    moveBuffer: 1,
    minCrateSize: 3,
  },
} as const;

// ============================================================================
// PERFORMANCE LIMITS
// ============================================================================

/**
 * Maximum number of simultaneous explosion effects.
 * Limits DOM element count for performance.
 */
export const MAX_SIMULTANEOUS_EXPLOSIONS = 10;

/**
 * Maximum number of flying vinyls shown at once.
 */
export const MAX_FLYING_VINYLS = 5;

/**
 * Debounce delay (in ms) for window resize events.
 */
export const RESIZE_DEBOUNCE_DELAY = 150;

// ============================================================================
// DEV/DEBUG
// ============================================================================

/**
 * Enable console logging for game events (set false in production).
 */
export const DEBUG_MODE = process.env.NODE_ENV === 'development';

/**
 * Show detailed error information in UI (dev only).
 */
export const SHOW_ERROR_DETAILS = process.env.NODE_ENV === 'development';
