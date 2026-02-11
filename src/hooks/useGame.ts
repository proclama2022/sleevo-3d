import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameBridge, GameBridgeConfig, createGameBridge } from '../services/gameBridge';
import type { Level } from '../types/game';

/**
 * Hook to manage GameBridge lifecycle
 */
export const useGameBridge = (config?: Partial<GameBridgeConfig>) => {
  const bridgeRef = useRef<GameBridge | null>(null);
  const store = useGameStore;

  useEffect(() => {
    const fullConfig: GameBridgeConfig = {
      store: useGameStore,
      ...config,
    };

    bridgeRef.current = createGameBridge(fullConfig);

    return () => {
      bridgeRef.current?.disconnect();
      bridgeRef.current = null;
    };
  }, []);

  return bridgeRef.current;
};

/**
 * Hook for game timer display
 */
export const useGameTimer = () => {
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const phase = useGameStore((state) => state.phase);

  const formatTime = useCallback((seconds: number | null): string => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isActive: phase === 'playing',
    isLowTime: timeRemaining !== null && timeRemaining < 30,
  };
};

/**
 * Hook for drag and drop state
 */
export const useDragState = () => {
  const draggedVinylId = useGameStore((state) => state.draggedVinylId);
  const hoveredSlotId = useGameStore((state) => state.hoveredSlotId);
  const pickupVinyl = useGameStore((state) => state.pickupVinyl);
  const dropVinyl = useGameStore((state) => state.dropVinyl);
  const cancelDrag = useGameStore((state) => state.cancelDrag);
  const hoverSlot = useGameStore((state) => state.hoverSlot);
  const leaveSlot = useGameStore((state) => state.leaveSlot);

  return {
    draggedVinylId,
    hoveredSlotId,
    isDragging: draggedVinylId !== null,
    pickupVinyl,
    dropVinyl,
    cancelDrag,
    hoverSlot,
    leaveSlot,
  };
};

/**
 * Hook for game actions
 */
export const useGameActions = () => {
  const startGame = useGameStore((state) => state.startGame);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const endGame = useGameStore((state) => state.endGame);
  const resetGame = useGameStore((state) => state.resetGame);

  return {
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
  };
};

/**
 * Hook for score display with animations
 */
export const useScore = () => {
  const score = useGameStore((state) => state.score);
  const progress = useGameStore((state) => state.progress);

  return {
    points: score.points,
    combo: score.combo,
    maxCombo: score.maxCombo,
    moves: score.moves,
    correctPlacements: score.correctPlacements,
    incorrectPlacements: score.incorrectPlacements,
    progress,
    hasCombo: score.combo > 0,
    comboMultiplier: Math.min(score.combo * 0.1, 0.5), // Max 50% bonus
  };
};

/**
 * Sample levels for testing
 */
export const SAMPLE_LEVELS: Level[] = [
  {
    id: 'level-1',
    name: 'First Steps',
    difficulty: 'easy',
    timeLimit: 120,
    vinylCount: 3,
    slotCount: 3,
    genres: ['Rock', 'Jazz', 'Classical'],
  },
  {
    id: 'level-2',
    name: 'Vinyl Hunter',
    difficulty: 'medium',
    timeLimit: 180,
    vinylCount: 5,
    slotCount: 5,
    genres: ['Rock', 'Jazz', 'Classical', 'Electronic', 'Hip-Hop'],
  },
  {
    id: 'level-3',
    name: 'Record Master',
    difficulty: 'hard',
    timeLimit: 240,
    vinylCount: 8,
    slotCount: 8,
    genres: ['Rock', 'Jazz', 'Classical', 'Electronic', 'Hip-Hop', 'Soul', 'Funk', 'Reggae'],
  },
];
