/**
 * Conveyor Belt Logic Service
 *
 * Handles spawning, movement, and speed calculations for the conveyor belt system.
 * This service manages the flow of vinyls across the belt and ensures proper
 * game progression based on difficulty and level.
 */

import { Genre, ConveyorVinyl, Vinyl, Difficulty, GENRE_COLORS } from '../types';
import { CONVEYOR_BELT_CONFIG, DIFFICULTY_CONFIG, GOLD_VINYL_CHANCE } from '../constants/gameConfig';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BeltState {
  vinyls: ConveyorVinyl[];
  lastSpawnTime: number;
  currentSpeed: number;
}

export interface SpawnConfig {
  genres: Genre[];
  difficulty: Difficulty;
  level: number;
  lanes: number;
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

const ARTIST_NAMES = [
  "The Beagles", "Miles Down", "Aretha F.", "James Braun", "Daft P.",
  "The Ramones", "Led Zep", "David Bowtie", "Queen B", "Fleetwood Mac"
];

const ALBUM_TITLES = [
  "Greatest Hits", "Live at Tokyo", "Midnight Sessions", "Gold Edition",
  "Unplugged", "Volume 1", "Rare Cuts", "B-Sides", "Anthology"
];

const TRASH_NAMES = [
  "Old Receipt", "Soda Can", "Broken Stylus", "Banana Peel", "Concert Flyer"
];

/**
 * Generate a unique ID for game objects.
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get random item from array.
 */
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a single vinyl with appropriate properties based on difficulty and level.
 */
function createVinyl(genres: Genre[], difficulty: Difficulty, level: number): Vinyl {
  const config = DIFFICULTY_CONFIG[difficulty];
  const genre = randomPick(genres);
  const rand = Math.random();

  // Determine special properties
  const isTrash = rand < config.trashMultiplier * 0.15; // 15% base trash rate
  const isGold = !isTrash && rand > (1 - GOLD_VINYL_CHANCE);
  const isMystery = !isTrash && !isGold && rand > (1 - config.mysteryChance);
  const isDusty = !isTrash && !isGold && !isMystery && Math.random() < config.dustChance;

  if (isTrash) {
    return {
      id: generateId(),
      type: 'trash',
      genre,
      title: randomPick(TRASH_NAMES),
      artist: '',
      coverColor: 'bg-gray-500',
      isTrash: true,
      dustLevel: 0,
    };
  }

  return {
    id: generateId(),
    type: 'vinyl',
    genre,
    title: isGold ? "Limited Edition" : randomPick(ALBUM_TITLES),
    artist: randomPick(ARTIST_NAMES),
    coverColor: GENRE_COLORS[genre],
    isGold,
    isMystery,
    isRevealed: false,
    dustLevel: isDusty ? 3 : 0,
    isTrash: false,
  };
}

// ============================================================================
// SPEED CALCULATIONS
// ============================================================================

/**
 * Calculate current belt speed based on difficulty and level progression.
 *
 * Speed formula:
 * speed = baseSpeed * difficultyMultiplier + (level * speedIncreasePerLevel)
 * capped at maxSpeed
 *
 * @param difficulty - Current game difficulty
 * @param level - Current level number
 * @returns Speed in pixels per second
 */
export function getBeltSpeed(difficulty: Difficulty, level: number): number {
  const { baseSpeed, speedMultipliers, speedIncreasePerLevel, maxSpeed } = CONVEYOR_BELT_CONFIG;

  const difficultyMultiplier = speedMultipliers[difficulty];
  const levelBonus = level * speedIncreasePerLevel;

  const calculatedSpeed = baseSpeed * difficultyMultiplier + levelBonus;

  return Math.min(calculatedSpeed, maxSpeed);
}

/**
 * Calculate spawn interval based on level progression.
 *
 * Interval formula:
 * interval = defaultSpawnInterval - (level * decreasePerLevel)
 * capped at minSpawnInterval
 *
 * @param level - Current level number
 * @returns Spawn interval in seconds
 */
export function getSpawnInterval(level: number): number {
  const { defaultSpawnInterval, minSpawnInterval, spawnIntervalDecreasePerLevel } = CONVEYOR_BELT_CONFIG;

  const calculatedInterval = defaultSpawnInterval - (level * spawnIntervalDecreasePerLevel);

  return Math.max(calculatedInterval, minSpawnInterval);
}

// ============================================================================
// VINYL SPAWNING
// ============================================================================

/**
 * Spawn a new vinyl on the conveyor belt.
 *
 * Creates a new vinyl item and places it at the RIGHT edge of a random lane.
 * The vinyl will then scroll LEFT across the belt over time.
 *
 * @param config - Spawn configuration (genres, difficulty, level, lanes)
 * @param currentTime - Current timestamp (for spawn tracking)
 * @returns New ConveyorVinyl object
 */
export function spawnConveyorVinyl(
  config: SpawnConfig,
  currentTime: number
): ConveyorVinyl {
  const { genres, difficulty, level, lanes } = config;
  const { beltWidth } = CONVEYOR_BELT_CONFIG;

  // Generate base vinyl using internal helper
  const baseVinyl: Vinyl = createVinyl(genres, difficulty, level);

  // Select random lane
  const lane = Math.floor(Math.random() * lanes);

  // Create conveyor vinyl with position data
  const conveyorVinyl: ConveyorVinyl = {
    ...baseVinyl,
    x: beltWidth, // Start at RIGHT edge (800px)
    y: lane,
    lane,
    spawnedAt: currentTime,
  };

  return conveyorVinyl;
}

/**
 * Check if enough time has passed to spawn another vinyl.
 *
 * @param lastSpawnTime - Timestamp of last spawn
 * @param currentTime - Current timestamp
 * @param level - Current level number
 * @returns True if ready to spawn
 */
export function shouldSpawnVinyl(
  lastSpawnTime: number,
  currentTime: number,
  level: number
): boolean {
  const spawnInterval = getSpawnInterval(level);
  const timeSinceLastSpawn = (currentTime - lastSpawnTime) / 1000; // Convert to seconds

  return timeSinceLastSpawn >= spawnInterval;
}

// ============================================================================
// POSITION UPDATES
// ============================================================================

/**
 * Update positions of all vinyls on the conveyor belt.
 *
 * Moves each vinyl LEFT based on speed and deltaTime.
 * Removes vinyls that have fallen off the LEFT edge of the belt.
 *
 * @param vinyls - Current array of conveyor vinyls
 * @param speed - Current belt speed (pixels per second)
 * @param deltaTime - Time elapsed since last update (seconds)
 * @returns Updated array of vinyls (with off-screen vinyls removed)
 */
export function updateConveyorPositions(
  vinyls: ConveyorVinyl[],
  speed: number,
  deltaTime: number
): ConveyorVinyl[] {
  // Update positions - move LEFT (subtract speed)
  const updatedVinyls = vinyls.map(vinyl => ({
    ...vinyl,
    x: vinyl.x - speed * deltaTime,
  }));

  // Filter out vinyls that have fallen off the LEFT edge
  const visibleVinyls = updatedVinyls.filter(vinyl => vinyl.x >= -120); // -120 allows for vinyl size

  return visibleVinyls;
}

/**
 * Get vinyls that fell off the belt (missed by player).
 *
 * Compares previous and current vinyl arrays to find which vinyls
 * were removed due to reaching the belt edge.
 *
 * @param previousVinyls - Vinyl array before update
 * @param currentVinyls - Vinyl array after update
 * @returns Array of vinyls that fell off the belt
 */
export function getMissedVinyls(
  previousVinyls: ConveyorVinyl[],
  currentVinyls: ConveyorVinyl[]
): ConveyorVinyl[] {
  const currentIds = new Set(currentVinyls.map(v => v.id));
  const missedVinyls = previousVinyls.filter(v => !currentIds.has(v.id));

  return missedVinyls;
}

// ============================================================================
// BELT STATE MANAGEMENT
// ============================================================================

/**
 * Initialize a new belt state.
 *
 * @param difficulty - Current difficulty level
 * @param level - Current level number
 * @returns Fresh belt state object
 */
export function initializeBeltState(
  difficulty: Difficulty,
  level: number
): BeltState {
  return {
    vinyls: [],
    lastSpawnTime: Date.now(),
    currentSpeed: getBeltSpeed(difficulty, level),
  };
}

/**
 * Update belt state for a game tick.
 *
 * Handles spawning, movement, and cleanup in a single operation.
 *
 * @param state - Current belt state
 * @param config - Spawn configuration
 * @param deltaTime - Time elapsed since last tick (seconds)
 * @returns Updated belt state and array of missed vinyls
 */
export function updateBeltState(
  state: BeltState,
  config: SpawnConfig,
  deltaTime: number
): { state: BeltState; missedVinyls: ConveyorVinyl[] } {
  const currentTime = Date.now();
  const { vinyls, lastSpawnTime, currentSpeed } = state;

  // Check if we should spawn a new vinyl
  let newVinyls = [...vinyls];
  let newLastSpawnTime = lastSpawnTime;

  if (shouldSpawnVinyl(lastSpawnTime, currentTime, config.level)) {
    const newVinyl = spawnConveyorVinyl(config, currentTime);
    newVinyls.push(newVinyl);
    newLastSpawnTime = currentTime;
  }

  // Update positions
  const previousVinyls = newVinyls;
  const updatedVinyls = updateConveyorPositions(newVinyls, currentSpeed, deltaTime);

  // Detect missed vinyls
  const missedVinyls = getMissedVinyls(previousVinyls, updatedVinyls);

  return {
    state: {
      vinyls: updatedVinyls,
      lastSpawnTime: newLastSpawnTime,
      currentSpeed,
    },
    missedVinyls,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get vinyl at a specific position (for collision detection).
 *
 * @param vinyls - Array of conveyor vinyls
 * @param x - X coordinate
 * @param y - Y coordinate (lane)
 * @param tolerance - Pixel tolerance for hit detection
 * @returns Vinyl at position or null
 */
export function getVinylAtPosition(
  vinyls: ConveyorVinyl[],
  x: number,
  y: number,
  tolerance: number = 50
): ConveyorVinyl | null {
  return vinyls.find(vinyl => {
    const withinX = Math.abs(vinyl.x - x) <= tolerance;
    const withinY = vinyl.lane === Math.floor(y);
    return withinX && withinY;
  }) || null;
}

/**
 * Remove a vinyl from the belt (when picked up by player).
 *
 * @param vinyls - Current vinyl array
 * @param vinylId - ID of vinyl to remove
 * @returns Updated vinyl array
 */
export function removeVinylFromBelt(
  vinyls: ConveyorVinyl[],
  vinylId: string
): ConveyorVinyl[] {
  return vinyls.filter(vinyl => vinyl.id !== vinylId);
}

/**
 * Get the progress percentage of a vinyl across the belt.
 *
 * Useful for visual indicators or urgency warnings.
 *
 * @param vinyl - Conveyor vinyl
 * @returns Progress from 0 to 1 (0 = just spawned, 1 = about to fall off)
 */
export function getVinylProgress(vinyl: ConveyorVinyl): number {
  const { beltWidth } = CONVEYOR_BELT_CONFIG;
  return Math.min(vinyl.x / beltWidth, 1);
}
