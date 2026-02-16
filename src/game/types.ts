export interface Vinyl {
  id: string;
  color: string;
  genre: string;
  year: number;
}

export interface GridCell {
  row: number;
  col: number;
  vinylId: string | null;
}

export interface Level {
  id: string;
  rows: number;
  cols: number;
  vinyls: Vinyl[];
}

export type GameStatus = 'playing' | 'completed';

export interface ComboState {
  streak: number;
  multiplier: number;
  label: string;
  lastPlacementTime: number;
}

export interface GameState {
  status: GameStatus;
  level: Level;
  levelIndex: number;
  grid: GridCell[][];
  placedVinyls: Record<string, { row: number; col: number }>;
  unplacedVinylIds: string[];
  score: number;
  moves: number;
  invalidDrops: number;
  combo: ComboState;
  comboBonusScore: number;
}
