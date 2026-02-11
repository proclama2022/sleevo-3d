import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { 
  GameState, 
  GameActions, 
  GameStore, 
  Level, 
  Vinyl, 
  ShelfSlot 
} from '../types/game';

/**
 * Initial game state
 */
const initialState: GameState = {
  phase: 'idle',
  currentLevel: null,
  vinyls: [],
  slots: [],
  score: {
    points: 0,
    combo: 0,
    maxCombo: 0,
    moves: 0,
    correctPlacements: 0,
    incorrectPlacements: 0,
  },
  progress: 0,
  timeRemaining: null,
  draggedVinylId: null,
  hoveredSlotId: null,
};

/**
 * Calculate progress percentage
 */
const calculateProgress = (slots: ShelfSlot[]): number => {
  if (slots.length === 0) return 0;
  const filledCount = slots.filter(s => s.state === 'filled').length;
  return Math.round((filledCount / slots.length) * 100);
};

/**
 * Check if vinyl genre matches slot expected genre
 */
const isValidPlacement = (vinyl: Vinyl, slot: ShelfSlot): boolean => {
  return vinyl.genre.toLowerCase() === slot.expectedGenre.toLowerCase();
};

/**
 * Game Store - Zustand
 * Manages all game state with actions
 */
export const useGameStore = create<GameStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // ==================== Game Lifecycle ====================
      
      startGame: (level: Level) => {
        set({
          phase: 'playing',
          currentLevel: level,
          timeRemaining: level.timeLimit ?? null,
          score: {
            points: 0,
            combo: 0,
            maxCombo: 0,
            moves: 0,
            correctPlacements: 0,
            incorrectPlacements: 0,
          },
          progress: 0,
          vinyls: [],
          slots: [],
          draggedVinylId: null,
          hoveredSlotId: null,
        });
      },

      pauseGame: () => {
        set({ phase: 'paused' });
      },

      resumeGame: () => {
        const { currentLevel } = get();
        if (currentLevel) {
          set({ phase: 'playing' });
        }
      },

      endGame: (completed: boolean) => {
        set({ 
          phase: completed ? 'completed' : 'failed',
          draggedVinylId: null,
          hoveredSlotId: null,
        });
      },

      resetGame: () => {
        set(initialState);
      },

      // ==================== Vinyl Interactions ====================

      pickupVinyl: (vinylId: string) => {
        const { vinyls, phase } = get();
        if (phase !== 'playing') return;

        set({
          draggedVinylId: vinylId,
          vinyls: vinyls.map(v => 
            v.id === vinylId 
              ? { ...v, state: 'dragging' as const }
              : v
          ),
        });
      },

      dropVinyl: (vinylId: string, slotId: string) => {
        const { vinyls, slots, score, phase } = get();
        if (phase !== 'playing') return;

        const vinyl = vinyls.find(v => v.id === vinylId);
        const slot = slots.find(s => s.id === slotId);
        
        if (!vinyl || !slot) {
          // Cancel drag if invalid
          set({
            draggedVinylId: null,
            vinyls: vinyls.map(v => 
              v.state === 'dragging' 
                ? { ...v, state: 'idle' as const }
                : v
            ),
          });
          return;
        }

        const isValid = isValidPlacement(vinyl, slot);
        
        // Update vinyl state
        const updatedVinyls = vinyls.map(v => 
          v.id === vinylId 
            ? { 
                ...v, 
                state: 'placed' as const,
                isValid 
              }
            : v
        );

        // Update slot state
        const updatedSlots = slots.map(s => 
          s.id === slotId 
            ? { 
                ...s, 
                state: 'filled' as const,
                placedVinylId: vinylId 
              }
            : s
        );

        // Update score
        const newScore = {
          ...score,
          moves: score.moves + 1,
          correctPlacements: isValid ? score.correctPlacements + 1 : score.correctPlacements,
          incorrectPlacements: isValid ? score.incorrectPlacements : score.incorrectPlacements + 1,
          points: isValid ? score.points + (100 * (1 + score.combo * 0.1)) : Math.max(0, score.points - 25),
        };

        set({
          vinyls: updatedVinyls,
          slots: updatedSlots,
          score: newScore,
          progress: calculateProgress(updatedSlots),
          draggedVinylId: null,
          hoveredSlotId: null,
        });

        // Check for game completion
        const allFilled = updatedSlots.every(s => s.state === 'filled');
        if (allFilled) {
          get().endGame(true);
        }
      },

      cancelDrag: () => {
        const { vinyls } = get();
        set({
          draggedVinylId: null,
          vinyls: vinyls.map(v => 
            v.state === 'dragging' 
              ? { ...v, state: 'idle' as const }
              : v
          ),
          hoveredSlotId: null,
        });
      },

      // ==================== Slot Interactions ====================

      hoverSlot: (slotId: string) => {
        const { slots, draggedVinylId, phase } = get();
        if (phase !== 'playing' || !draggedVinylId) return;

        const slot = slots.find(s => s.id === slotId);
        if (!slot || slot.state === 'filled') return;

        set({
          hoveredSlotId: slotId,
          slots: slots.map(s => 
            s.id === slotId 
              ? { ...s, state: 'highlight' as const }
              : s.state === 'highlight' 
                ? { ...s, state: 'empty' as const }
                : s
          ),
        });
      },

      leaveSlot: (slotId: string) => {
        const { slots, hoveredSlotId } = get();
        if (hoveredSlotId !== slotId) return;

        set({
          hoveredSlotId: null,
          slots: slots.map(s => 
            s.id === slotId && s.state === 'highlight'
              ? { ...s, state: 'empty' as const }
              : s
          ),
        });
      },

      // ==================== Score Updates ====================

      addPoints: (points: number, isCorrect: boolean) => {
        const { score } = get();
        set({
          score: {
            ...score,
            points: score.points + points,
            correctPlacements: isCorrect ? score.correctPlacements + 1 : score.correctPlacements,
            incorrectPlacements: isCorrect ? score.incorrectPlacements : score.incorrectPlacements + 1,
          },
        });
      },

      incrementCombo: () => {
        const { score } = get();
        set({
          score: {
            ...score,
            combo: score.combo + 1,
            maxCombo: Math.max(score.maxCombo, score.combo + 1),
          },
        });
      },

      resetCombo: () => {
        const { score } = get();
        set({
          score: {
            ...score,
            combo: 0,
          },
        });
      },

      // ==================== Timer ====================

      tick: () => {
        const { timeRemaining, phase } = get();
        if (phase !== 'playing' || timeRemaining === null) return;

        const newTime = timeRemaining - 1;
        
        if (newTime <= 0) {
          get().endGame(false);
        } else {
          set({ timeRemaining: newTime });
        }
      },

      // ==================== Internal ====================

      _updateProgress: () => {
        const { slots } = get();
        set({ progress: calculateProgress(slots) });
      },
    })),
    { name: 'sleevo-game-store' }
  )
);

// ==================== Selectors ====================

export const selectPhase = (state: GameState) => state.phase;
export const selectScore = (state: GameState) => state.score;
export const selectProgress = (state: GameState) => state.progress;
export const selectTimeRemaining = (state: GameState) => state.timeRemaining;
export const selectVinyls = (state: GameState) => state.vinyls;
export const selectSlots = (state: GameState) => state.slots;
export const selectDraggedVinyl = (state: GameState) => state.draggedVinylId;
export const selectHoveredSlot = (state: GameState) => state.hoveredSlotId;

export const selectIsPlaying = (state: GameState) => state.phase === 'playing';
export const selectIsPaused = (state: GameState) => state.phase === 'paused';
export const selectIsGameOver = (state: GameState) => 
  state.phase === 'completed' || state.phase === 'failed';
