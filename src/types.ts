export type VinylWidth = 1 | 2;

/**
 * Represents a vinyl record in the game.
 * Each vinyl has a unique id and properties used for sorting rules.
 */
export interface Vinyl {
  id: string;
  width: VinylWidth;
  color: string;
  genre: string;
  year: number;
  title?: string;
  artist?: string;
  coverImage?: string;
}

/**
 * Configuration for the shelf grid.
 *
 * SINGLE ROW MODE (Soluzione A):
 * - rows = 1 (single horizontal row)
 * - cols = N (where N = number of vinyls to place)
 * - Each vinyl occupies exactly one cell (no stacking)
 * - Simple 1:1 mapping: vinyl index -> column position
 *
 * Future modes may use rows > 1 for multi-row layouts.
 */
export interface ShelfConfig {
  rows: number;  // Use 1 for Single Row mode
  cols: number;  // Number of columns = number of vinyls
}

/**
 * Rules that define how vinyls should be arranged to complete a level.
 */
export interface LevelRules {
  fillAllSlots: boolean;
  sortBy?: 'color' | 'genre' | 'year';
  allowGaps: boolean;
}

/**
 * A game level with shelf configuration, vinyls to place, and completion rules.
 */
export interface Level {
  id: string;
  shelf: ShelfConfig;
  vinyls: Vinyl[];
  rules: LevelRules;
}

/**
 * Represents a single cell in the shelf grid.
 * In Single Row mode, row is always 0.
 */
export interface GridCell {
  row: number;     // Always 0 in Single Row mode
  col: number;     // Column index (0 to cols-1)
  vinylId: string | null;  // null = empty, string = occupied by vinyl
}

/**
 * Helper type for Single Row mode cell position.
 * Simplifies working with single-row grids where row is always 0.
 */
export interface SingleRowCell {
  col: number;
  vinylId: string | null;
}

/**
 * Helper function type to create a Single Row shelf config.
 */
export type SingleRowShelfConfig = Omit<ShelfConfig, 'rows'> & { rows: 1 };

export type GameStatus = 'idle' | 'playing' | 'completed' | 'failed';

// Combo System Types
export interface ComboState {
  streak: number;           // posizionamenti corretti consecutivi
  multiplier: number;       // 1x, 1.5x, 2x, 3x, 5x
  lastPlacementTime: number; // timestamp ms
  maxStreak: number;        // record della sessione
  comboDecayMs: number;     // tempo prima che la combo decada (default 4000)
}

export const COMBO_TIERS: { minStreak: number; multiplier: number; label: string; color: string }[] = [
  { minStreak: 0,  multiplier: 1,   label: '',          color: '#ffffff' },
  { minStreak: 2,  multiplier: 1.5, label: 'NICE!',     color: '#22c55e' },
  { minStreak: 4,  multiplier: 2,   label: 'GREAT!',    color: '#3b82f6' },
  { minStreak: 6,  multiplier: 3,   label: 'AMAZING!',  color: '#a855f7' },
  { minStreak: 8,  multiplier: 5,   label: 'LEGENDARY!', color: '#f59e0b' },
];
