// Local storage management for game progress persistence
import { CollectionItem, TutorialProgress, AccessibilitySettings, CustomizationSettings } from '../types';

export interface LevelRecord {
  bestScore: number;
  bestCombo: number;
  bestTime: number;
  stars: number;
  attempts: number;
  wins: number;
}

export interface SaveData {
  level: number;
  highScore: number;
  totalXP: number;
  tutorialCompleted: boolean;
  tutorialProgress?: TutorialProgress; // optional for backward compatibility
  accessibilitySettings?: AccessibilitySettings; // optional for backward compatibility
  customization?: CustomizationSettings; // optional for backward compatibility
  levelStars: Record<number, number>; // level index -> stars earned (0-3)
  collection: CollectionItem[]; // Rare vinyls collected
  achievements: string[]; // Array of unlocked achievement IDs
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    perfectLevels: number;
    totalVinylsSorted: number;
    maxCombo: number;
  };
  levelRecords: Record<number, LevelRecord>; // per-level statistics
  lastPlayed: string;
  endlessHighScore: number; // High score for endless mode
}

const STORAGE_KEY = 'sleevo_save_data';
const STORAGE_VERSION = 1;

// Default save data for new players
const getDefaultSaveData = (): SaveData => ({
  level: 1,
  highScore: 0,
  totalXP: 0,
  tutorialCompleted: false,
  levelStars: {},
  collection: [],
  achievements: [],
  stats: {
    totalGames: 0,
    wins: 0,
    losses: 0,
    perfectLevels: 0,
    totalVinylsSorted: 0,
    maxCombo: 0,
  },
  levelRecords: {},
  lastPlayed: new Date().toISOString(),
  endlessHighScore: 0,
});

/**
 * Load saved game data from localStorage
 * Returns default data if no save exists or if save is corrupted
 */
export const loadSaveData = (): SaveData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultSaveData();
    }

    const parsed = JSON.parse(stored);

    // Version check for future migration logic
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Save data version mismatch, using defaults');
      return getDefaultSaveData();
    }

    // Migrate old saves: ensure new fields exist
    const migratedData: SaveData = {
      ...parsed.data,
      tutorialCompleted: parsed.data.tutorialCompleted ?? false,
      tutorialProgress: parsed.data.tutorialProgress ?? {
        completedSteps: parsed.data.tutorialCompleted ? ['drag', 'genre', 'mystery', 'moves'] : [],
        skippedSteps: [],
        hintsEnabled: false
      },
      accessibilitySettings: parsed.data.accessibilitySettings ?? {
        reduceMotion: false,
        colorBlindMode: 'none',
        increasedContrast: false
      },
      customization: parsed.data.customization ?? {
        visualTheme: 'default',
        background: 'bricks',
        fontStyle: 'marker',
        unlockedThemes: ['default']
      },
      levelStars: parsed.data.levelStars ?? {},
      collection: parsed.data.collection ?? [],
      achievements: parsed.data.achievements ?? [],
      levelRecords: parsed.data.levelRecords ?? {},
      endlessHighScore: parsed.data.endlessHighScore ?? 0,
    };

    return migratedData;
  } catch (error) {
    console.error('Failed to load save data:', error);
    return getDefaultSaveData();
  }
};

/**
 * Save game data to localStorage
 */
export const saveSaveData = (data: SaveData): void => {
  try {
    const toStore = {
      version: STORAGE_VERSION,
      data: {
        ...data,
        lastPlayed: new Date().toISOString(),
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (error) {
    console.error('Failed to save game data:', error);
  }
};

/**
 * Update specific stats after a game ends
 */
export const updateStats = (
  currentSave: SaveData,
  updates: {
    won: boolean;
    score: number;
    vinylsSorted: number;
    maxCombo: number;
    isPerfect: boolean;
  }
): SaveData => {
  const newStats = {
    totalGames: currentSave.stats.totalGames + 1,
    wins: currentSave.stats.wins + (updates.won ? 1 : 0),
    losses: currentSave.stats.losses + (updates.won ? 0 : 1),
    perfectLevels: currentSave.stats.perfectLevels + (updates.isPerfect ? 1 : 0),
    totalVinylsSorted: currentSave.stats.totalVinylsSorted + updates.vinylsSorted,
    maxCombo: Math.max(currentSave.stats.maxCombo, updates.maxCombo),
  };

  return {
    ...currentSave,
    highScore: Math.max(currentSave.highScore, updates.score),
    stats: newStats,
  };
};

/**
 * Add a rare vinyl to the collection (deduplicated by artist + title)
 */
export const addToCollection = (
  currentSave: SaveData,
  item: Omit<CollectionItem, 'discoveredAt'>
): SaveData => {
  // Check if already in collection
  const exists = currentSave.collection.some(
    (c) => c.artist === item.artist && c.title === item.title
  );

  if (exists) {
    return currentSave;
  }

  // Add new item with timestamp
  const newItem: CollectionItem = {
    ...item,
    discoveredAt: new Date().toISOString(),
  };

  return {
    ...currentSave,
    collection: [...currentSave.collection, newItem],
  };
};

/**
 * Unlock an achievement (if not already unlocked)
 */
export const unlockAchievement = (
  currentSave: SaveData,
  achievementId: string
): SaveData => {
  if (currentSave.achievements.includes(achievementId)) {
    return currentSave;
  }

  return {
    ...currentSave,
    achievements: [...currentSave.achievements, achievementId],
  };
};

/**
 * Update level records after a game
 */
export const updateLevelRecords = (
  currentSave: SaveData,
  levelIndex: number,
  stats: {
    score: number;
    combo: number;
    time: number;
    stars: number;
    won: boolean;
  }
): SaveData => {
  const currentRecord = currentSave.levelRecords[levelIndex];

  const updatedRecord: LevelRecord = {
    bestScore: currentRecord
      ? Math.max(currentRecord.bestScore, stats.score)
      : stats.score,
    bestCombo: currentRecord
      ? Math.max(currentRecord.bestCombo, stats.combo)
      : stats.combo,
    bestTime: currentRecord
      ? Math.min(currentRecord.bestTime, stats.time)
      : stats.time,
    stars: currentRecord
      ? Math.max(currentRecord.stars, stats.stars)
      : stats.stars,
    attempts: (currentRecord?.attempts || 0) + 1,
    wins: (currentRecord?.wins || 0) + (stats.won ? 1 : 0),
  };

  return {
    ...currentSave,
    levelRecords: {
      ...currentSave.levelRecords,
      [levelIndex]: updatedRecord,
    },
  };
};

/**
 * Check if a new record was set for a level
 */
export const checkNewRecords = (
  currentSave: SaveData,
  levelIndex: number,
  score: number
): { newBestScore: boolean } => {
  const currentRecord = currentSave.levelRecords[levelIndex];
  return {
    newBestScore: !currentRecord || score > currentRecord.bestScore,
  };
};

/**
 * Clear all saved data (reset progress)
 */
export const clearSaveData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear save data:', error);
  }
};
