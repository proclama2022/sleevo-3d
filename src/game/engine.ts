import type { GameState, ComboState, Level } from './types';
import { COMBO_TIERS, COMBO_DECAY_MS, isValidPlacement, getTargetSlot } from './rules';

const BASE_SCORE = 100;

function createInitialGrid(rows: number, cols: number) {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      vinylId: null as string | null,
    }))
  );
}

function freshCombo(): ComboState {
  return { streak: 0, multiplier: 1.0, label: '', lastPlacementTime: 0 };
}

function getComboTier(streak: number) {
  let tier: (typeof COMBO_TIERS)[number] = COMBO_TIERS[0];
  for (const t of COMBO_TIERS) {
    if (streak >= t.minStreak) tier = t;
  }
  return tier;
}

export function createGameState(level: Level, levelIndex: number): GameState {
  return {
    status: 'playing',
    level,
    levelIndex,
    grid: createInitialGrid(level.rows, level.cols),
    placedVinyls: {},
    unplacedVinylIds: level.vinyls.map((v) => v.id),
    score: 0,
    moves: 0,
    invalidDrops: 0,
    combo: freshCombo(),
    comboBonusScore: 0,
  };
}

export type GameAction =
  | { type: 'PLACE_VINYL'; vinylId: string; row: number; col: number }
  | { type: 'INVALID_DROP' }
  | { type: 'RESTART' }
  | { type: 'NEXT_LEVEL'; level: Level; levelIndex: number }
  | { type: 'COMBO_DECAY' };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLACE_VINYL': {
      const { vinylId, row, col } = action;
      if (state.status !== 'playing') return state;
      if (!isValidPlacement(vinylId, row, col)) return state;
      if (state.grid[row][col].vinylId !== null) return state;

      const now = Date.now();
      const newGrid = state.grid.map((r) => r.map((c) => ({ ...c })));
      newGrid[row][col].vinylId = vinylId;

      // Combo logic
      const timeSinceLast = now - state.combo.lastPlacementTime;
      const comboReset = state.combo.lastPlacementTime > 0 && timeSinceLast > COMBO_DECAY_MS;
      const newStreak = comboReset ? 1 : state.combo.streak + 1;
      const tier = getComboTier(newStreak);

      const newCombo: ComboState = {
        streak: newStreak,
        multiplier: tier.multiplier,
        label: tier.label,
        lastPlacementTime: now,
      };

      const earnedScore = Math.round(BASE_SCORE * tier.multiplier);
      const bonusFromCombo = earnedScore - BASE_SCORE;

      const newPlaced = { ...state.placedVinyls, [vinylId]: { row, col } };
      const newUnplaced = state.unplacedVinylIds.filter((id) => id !== vinylId);

      // Check completion
      const isComplete = newUnplaced.length === 0;

      return {
        ...state,
        grid: newGrid,
        placedVinyls: newPlaced,
        unplacedVinylIds: newUnplaced,
        score: state.score + earnedScore,
        moves: state.moves + 1,
        combo: newCombo,
        comboBonusScore: state.comboBonusScore + bonusFromCombo,
        status: isComplete ? 'completed' : 'playing',
      };
    }

    case 'INVALID_DROP':
      return {
        ...state,
        invalidDrops: state.invalidDrops + 1,
        moves: state.moves + 1,
        combo: freshCombo(),
      };

    case 'RESTART':
      return createGameState(state.level, state.levelIndex);

    case 'NEXT_LEVEL':
      return createGameState(action.level, action.levelIndex);

    case 'COMBO_DECAY':
      if (state.combo.streak === 0) return state;
      return { ...state, combo: freshCombo() };

    default:
      return state;
  }
}

/** Find the next empty glowing target slot for unplaced vinyls */
export function getNextGlowingSlot(state: GameState): { row: number; col: number } | null {
  for (const vinylId of state.unplacedVinylIds) {
    const target = getTargetSlot(vinylId);
    if (target && state.grid[target.row][target.col].vinylId === null) {
      return target;
    }
  }
  return null;
}
