export interface Vinyl {
  id: string;
  color: string;
  genre: string;
  year: number;
  artist?: string;   // e.g. "Led Zeppelin"
  album?: string;    // e.g. "Led Zeppelin IV"
  isRare?: boolean;  // rare vinyls give bonus points
  cover?: string;    // e.g. '/covers/led-zeppelin-iv.jpg' — AI-generated cover art
}

export interface GridCell {
  row: number;
  col: number;
  vinylId: string | null;
}

export type SortRule = 'genre' | 'chronological' | 'free';

export type LevelMode = 'free' | 'genre' | 'chronological' | 'customer' | 'blackout' | 'rush' | 'sleeve-match';

export type LevelTheme = 'classic' | 'jazz-club' | 'punk-basement' | 'disco-70s';

export interface CustomerRequest {
  genre: string;
  era: string;  // '50s' | '60s' | '70s' | '80s' | '90s' | '00s' | '10s'
  targetRow: number;
  targetCol: number;
}

export interface Level {
  id: string;
  rows: number;
  cols: number;
  vinyls: Vinyl[];
  sortRule: SortRule;
  mode: LevelMode;
  rushTime?: number;  // rush mode countdown seconds
  parTime?: number;  // seconds for star calculation
  hint?: string;
  customerName?: string;  // Italian name displayed in CustomerPanel (customer mode)
  theme?: LevelTheme;
  customerRequest?: CustomerRequest;
  blockedSlots?: { row: number; col: number }[];  // slots under repair
  customerTimer?: number;  // seconds before customer leaves (impatience)
  // Sleeve-match mode: ogni slot mostra una copertina e il giocatore deve abbinare il disco giusto
  sleeveTargets?: { row: number; col: number; vinylId: string }[];
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
  mistakes: number;
  hintsUsed: number;
  hintsRemaining: number;
  timeElapsed: number;
  shakingVinylId: string | null;
  rejectedSlot: { row: number; col: number } | null;
  invalidReason: string | null;
  stars: number;
  // Blackout mode
  labelsVisible: boolean;
  blackoutSecondsLeft: number;  // countdown before labels hide; 0 = already hidden or not blackout mode
  // Customer mode
  customerServed: boolean;
  customerTimeLeft: number;  // seconds remaining for customer patience
  customerLeft: boolean;     // customer gave up
  // Rush mode
  rushTimeLeft: number;      // countdown for rush/timed levels
}
