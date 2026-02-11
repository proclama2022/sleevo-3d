/**
 * Animation Timing Constants
 * Phase 3: Micro-Interactions & Animation
 * 
 * All timing values are in milliseconds
 * Based on Material Design and game feel research
 */

export const TIMING = {
  // Card interactions
  CARD_PICKUP: {
    duration: 225, // 200-250ms range
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring bounce
  },
  CARD_DROP: {
    duration: 175, // 150-200ms range
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Material standard
  },
  CARD_SETTLE: {
    duration: 150,
    easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)', // Material decelerate
  },

  // Shelf hover states
  SHELF_HOVER: {
    in: 150,
    out: 250, // 200-300ms range
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  },

  // Score animations
  SCORE_INCREMENT: {
    duration: 350, // 300-400ms range
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  },
  SCORE_POP: {
    duration: 200,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Pop in
  },

  // Combo popup
  COMBO_POPUP: {
    total: 700, // 600-800ms range
    appear: 200,
    hold: 300,
    disappear: 200,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // General UI
  TRANSITION_FAST: 100,
  TRANSITION_NORMAL: 200,
  TRANSITION_SLOW: 300,
} as const;

/**
 * Easing presets matching Material Design and game feel
 */
export const EASING = {
  // Standard Material easings
  STANDARD: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  DECELERATE: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  ACCELERATE: 'cubic-bezier(0.4, 0.0, 1, 1)',
  
  // Spring/bounce for playful interactions
  SPRING: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // Linear for consistent motion
  LINEAR: 'linear',
} as const;

/**
 * Spring physics presets for framer-motion style animations
 */
export const SPRING = {
  BOUNCY: { tension: 600, friction: 15 },
  GENTLE: { tension: 200, friction: 25 },
  SNAPPY: { tension: 800, friction: 20 },
  SLOW: { tension: 100, friction: 30 },
} as const;
