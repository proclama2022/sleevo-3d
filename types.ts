
export enum Genre {
  Rock = 'Rock',
  Jazz = 'Jazz',
  Soul = 'Soul',
  Funk = 'Funk',
  Disco = 'Disco',
  Punk = 'Punk',
  Electronic = 'Electronic',
}

export type ItemType = 'vinyl' | 'trash';
export type Difficulty = 'Easy' | 'Normal' | 'Hard';
export type LevelMode = 'Standard' | 'Timed' | 'SuddenDeath' | 'Boss' | 'Endless';
export type ShopTheme = 'Basement' | 'Store' | 'Expo';
export type SpecialDiscType = 'diamond' | 'wildcard' | 'bomb' | 'chain' | 'time' | null;

export interface Vinyl {
  id: string;
  type: ItemType; // Disc or Trash
  genre: Genre;   // Still needed for cover art generation even if hidden
  title: string;
  artist: string;
  coverColor: string;

  // Gameplay Flags
  isMystery?: boolean;
  isGold?: boolean;
  isRevealed?: boolean;

  // New Mechanics
  dustLevel: number; // 0 = Clean, 1-3 = Dusty layers. Must clean to interact.
  isTrash?: boolean; // If true, must go to bin, not crate.
  specialType?: SpecialDiscType; // Special disc effects
}

export interface Crate {
  id: string;
  genre: Genre;
  capacity: number;
  filled: number;
  vinyls: Vinyl[];
  label: string;
  position?: { x: number; y: number; width: number; height: number };
}

// Secondary Objectives
export type ObjectiveType =
  | 'zero_errors'       // Don't make any mistakes
  | 'combo_streak'      // Achieve combo of X
  | 'time_limit'        // Complete in under X seconds
  | 'clean_all_dusty'   // Clean all dusty vinyls
  | 'no_hints'          // Don't use hints
  | 'perfect_accuracy'; // 100% accuracy

export interface SecondaryObjective {
  id: string;
  type: ObjectiveType;
  title: string;
  description: string;
  targetValue?: number;  // e.g., combo of 5, time under 120s
  currentValue?: number;
  completed: boolean;
  bonusXP: number;       // XP reward for completion
}

export interface GameState {
  currentLevel: number;
  score: number;
  movesLeft: number;
  timeLeft: number; // For Timed mode
  maxTime: number;  // For progress bar
  combo: number;
  comboMultiplier: number; // 1x, 2x, 3x, 5x, 10x
  xp: number;
  level: number;
  status: 'menu' | 'playing' | 'won' | 'lost';
  difficulty: Difficulty;
  mode: LevelMode;
  theme: ShopTheme;

  // Session stats for end-level summary
  vinylsSorted: number;
  maxComboThisLevel: number;
  startTime: number; // timestamp
  totalMoves: number; // for accuracy calculation
  mistakes: number;
  lastSortedGenre: Genre | null; // For chain disc tracking
  starsEarned: number; // 0-3 stars for current level

  // Endless mode specific
  isEndlessMode?: boolean;
  endlessVinylsSorted?: number; // Track progress in endless mode

  // Memory Challenge mode
  hideLabels?: boolean; // Labels hidden after timer
  memoryTimer?: number; // Seconds until labels hide (5 = hide after 5s)

  // Secondary Objectives
  secondaryObjectives?: SecondaryObjective[];
}

export const GENRE_COLORS: Record<Genre, string> = {
  [Genre.Rock]: 'bg-red-500',
  [Genre.Jazz]: 'bg-blue-500',
  [Genre.Soul]: 'bg-yellow-500',
  [Genre.Funk]: 'bg-orange-500',
  [Genre.Disco]: 'bg-purple-500',
  [Genre.Punk]: 'bg-pink-600',
  [Genre.Electronic]: 'bg-cyan-500',
};

export const GENRE_LABELS: Record<Genre, string[]> = {
  [Genre.Rock]: ["The Garage", "Hard Rock Café", "Rolling Stones"],
  [Genre.Jazz]: ["Blue Note", "Birdland", "Smooth Jazz"],
  [Genre.Soul]: ["Motown", "Apollo", "Soul Train"],
  [Genre.Funk]: ["Mothership", "Groove Central", "Funky Town"],
  [Genre.Disco]: ["Studio 54", "Saturday Night", "Disco Inferno"],
  [Genre.Punk]: ["CBGB", "The Pit", "Anarchy"],
  [Genre.Electronic]: ["The Grid", "Cyberzone", "Techno Bunker"],
};

// Collection item type for vinyl collection tracking
export interface CollectionItem {
  artist: string;
  title: string;
  genre: Genre;
  coverColor: string;
  specialType?: SpecialDiscType;
  isGold: boolean;
  discoveredAt: string; // ISO timestamp
}

// Tutorial progress tracking
export type TutorialStep =
  | 'drag' | 'genre' | 'mystery' | 'moves'  // existing
  | 'trash' | 'special' | 'combo' | 'capacity'  // new
  | 'complete';

export interface TutorialProgress {
  completedSteps: TutorialStep[];
  skippedSteps: TutorialStep[];
  hintsEnabled: boolean;
}

// Accessibility settings
export type ColorBlindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';

export interface AccessibilitySettings {
  reduceMotion: boolean;  // override system preference
  colorBlindMode: ColorBlindMode;
  increasedContrast: boolean;
  relaxedMode?: boolean;  // slower pace, longer combo window, gentler feedback
}

// Customization settings
export type VisualTheme = 'default' | 'neon' | 'minimal' | 'cartoon';
export type BackgroundStyle = 'bricks' | 'wood' | 'concrete' | 'space';
export type FontStyle = 'marker' | 'display' | 'mono';

export interface CustomizationSettings {
  visualTheme: VisualTheme;
  background: BackgroundStyle;
  fontStyle: FontStyle;
  unlockedThemes: VisualTheme[];
}

// Campaign & Level Configuration
// (for star system and future level progression)

/**
 * Star criteria for a level (optional per-level override)
 */
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

/**
 * Level configuration for campaign levels
 */
export interface LevelConfig {
  crates: number;
  genres: Genre[];
  mode: LevelMode;
  theme: ShopTheme;
  time: number;
  moves: number;
  starCriteria?: StarCriteria; // Optional per-level override
}

/**
 * Campaign level definition
 */
export interface CampaignLevel {
  levelNumber: number;
  worldNumber: number;
  handCrafted: boolean;
  config: LevelConfig;
}
