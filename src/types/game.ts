/**
 * Game State Types
 * Phase 4: Architecture Integration
 */

export type GamePhase = 
  | 'idle' 
  | 'playing' 
  | 'paused' 
  | 'completed' 
  | 'failed';

export type VinylState = 'idle' | 'dragging' | 'placed';

export type SlotState = 'empty' | 'highlight' | 'filled' | 'invalid';

export interface Vinyl {
  id: string;
  title: string;
  artist: string;
  genre: string;
  year: number;
  coverImage?: string;
  state: VinylState;
  isValid?: boolean;
}

export interface ShelfSlot {
  id: string;
  expectedGenre: string;
  state: SlotState;
  placedVinylId?: string;
}

export interface Level {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // seconds
  vinylCount: number;
  slotCount: number;
  genres: string[];
}

export interface GameScore {
  points: number;
  combo: number;
  maxCombo: number;
  moves: number;
  correctPlacements: number;
  incorrectPlacements: number;
}

export interface GameState {
  // Game status
  phase: GamePhase;
  currentLevel: Level | null;
  
  // Game entities
  vinyls: Vinyl[];
  slots: ShelfSlot[];
  
  // Score and progress
  score: GameScore;
  progress: number; // 0-100
  
  // Timer
  timeRemaining: number | null;
  
  // Dragging state
  draggedVinylId: string | null;
  hoveredSlotId: string | null;
}

export interface GameActions {
  // Game lifecycle
  startGame: (level: Level) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: (completed: boolean) => void;
  resetGame: () => void;
  
  // Vinyl interactions
  pickupVinyl: (vinylId: string) => void;
  dropVinyl: (vinylId: string, slotId: string) => void;
  cancelDrag: () => void;
  
  // Slot interactions
  hoverSlot: (slotId: string) => void;
  leaveSlot: (slotId: string) => void;
  
  // Score updates
  addPoints: (points: number, isCorrect: boolean) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  
  // Timer
  tick: () => void;
  
  // Internal
  _updateProgress: () => void;
}

export type GameStore = GameState & GameActions;
