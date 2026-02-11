export type VinylWidth = 1 | 2;

export interface Vinyl {
  id: string;
  width: VinylWidth;
  color: string;
  genre: string;
  year: number;
  coverImage?: string;
}

export interface ShelfConfig {
  rows: number;
  cols: number;
}

export interface LevelRules {
  fillAllSlots: boolean;
  sortBy?: 'color' | 'genre' | 'year';
  allowGaps: boolean;
}

export interface Level {
  id: string;
  shelf: ShelfConfig;
  vinyls: Vinyl[];
  rules: LevelRules;
}

export interface GridCell {
  row: number;
  col: number;
  vinylId: string | null;
}

export type GameStatus = 'idle' | 'playing' | 'completed' | 'failed';
