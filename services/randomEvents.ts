/**
 * Random Events Service
 *
 * Handles random event triggering, application, and checking.
 */

import { RandomEventType, RandomEvent, RANDOM_EVENT_CONFIG, RANDOM_EVENT_MIN_LEVEL, RANDOM_EVENT_COOLDOWN, RANDOM_EVENT_MAX_PER_LEVEL } from '../types/events';
import { GameState, Vinyl } from '../types';

/**
 * Check if a random event should trigger
 */
export const shouldTriggerEvent = (
  levelIndex: number,
  timeElapsed: number,
  eventsTriggeredThisLevel: number
): boolean => {
  // Must meet minimum level requirement
  if (levelIndex < RANDOM_EVENT_MIN_LEVEL - 1) {
    return false;
  }

  // Must wait cooldown period
  if (timeElapsed < RANDOM_EVENT_COOLDOWN) {
    return false;
  }

  // Max events per level
  if (eventsTriggeredThisLevel >= RANDOM_EVENT_MAX_PER_LEVEL) {
    return false;
  }

  // Check random probability (30% overall chance if conditions met)
  return Math.random() < 0.30;
};

/**
 * Select a random event type
 */
export const selectRandomEvent = (): RandomEventType => {
  const eventTypes = Object.values(RandomEventType);
  const weightedEvents: RandomEventType[] = [];

  // Weight events by probability
  eventTypes.forEach((type) => {
    const config = RANDOM_EVENT_CONFIG[type];
    const weight = config.probability * 100; // Scale to count
    for (let i = 0; i < weight; i++) {
      weightedEvents.push(type);
    }
  });

  return weightedEvents[Math.floor(Math.random() * weightedEvents.length)];
};

/**
 * Check if a random event is currently active
 */
export const isEventActive = (event: RandomEvent | null): boolean => {
  if (!event) return false;
  return Date.now() < event.endTime;
};

/**
 * Apply random event effects to game state
 */
export const applyEventEffects = (
  eventType: RandomEventType,
  gameState: GameState,
  shelfVinyls: Vinyl[]
): {
  modifiedState: Partial<GameState>;
  modifiedVinyls: Vinyl[];
  message: string;
} => {
  const config = RANDOM_EVENT_CONFIG[eventType];
  let message = config.title;
  let modifiedState: Partial<GameState> = {};
  let modifiedVinyls = [...shelfVinyls];

  switch (eventType) {
    case RandomEventType.EARTHQUAKE:
      // No state change, just visual effect
      message = config.title;
      break;

    case RandomEventType.DUST_STORM:
      // Add +1 dust to all vinyls
      modifiedVinyls = shelfVinyls.map(v => ({
        ...v,
        dustLevel: Math.min(3, v.dustLevel + 1),
      }));
      message = '🌪️ Dust Storm! Clean your vinyls!';
      break;

    case RandomEventType.BLACKOUT:
      // No state change, just visual effect
      message = config.title;
      break;

    case RandomEventType.SLOW_MOTION:
      // Add +10 seconds if in timed mode
      if (gameState.mode === 'Timed') {
        modifiedState.timeLeft = (gameState.timeLeft || 0) + 10;
        message = '⏳ Slow-Mo! +10 seconds bonus!';
      } else {
        message = config.title;
      }
      break;

    case RandomEventType.MAGNETIC_SURGE:
      // No state change, handled in App.tsx by modifying MAGNET_RADIUS
      message = config.title;
      break;

    default:
      break;
  }

  return {
    modifiedState,
    modifiedVinyls,
    message,
  };
};

/**
 * Get the current magnet radius multiplier
 */
export const getMagnetRadiusMultiplier = (
  activeEvent: RandomEvent | null
): number => {
  if (!activeEvent) return 1;

  if (activeEvent.type === RandomEventType.MAGNETIC_SURGE) {
    return 2; // Double radius
  }

  return 1;
};

/**
 * Get the current slow motion multiplier
 */
export const getSlowMotionMultiplier = (
  activeEvent: RandomEvent | null
): number => {
  if (!activeEvent) return 1;

  if (activeEvent.type === RandomEventType.SLOW_MOTION) {
    return 0.5; // Half speed
  }

  return 1;
};

/**
 * Check if blackout is active
 */
export const isBlackoutActive = (activeEvent: RandomEvent | null): boolean => {
  if (!activeEvent) return false;
  return activeEvent.type === RandomEventType.BLACKOUT;
};

/**
 * Check if earthquake is active
 */
export const isEarthquakeActive = (activeEvent: RandomEvent | null): boolean => {
  if (!activeEvent) return false;
  return activeEvent.type === RandomEventType.EARTHQUAKE;
};

/**
 * Get event progress (0-100) for countdown display
 */
export const getEventProgress = (event: RandomEvent | null): number => {
  if (!event) return 0;
  const elapsed = Date.now() - event.startTime;
  const total = event.endTime - event.startTime;
  return Math.max(0, Math.min(100, ((total - elapsed) / total) * 100));
};
