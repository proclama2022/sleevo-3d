import type { GameState, ComboState, Level } from './types';
import { COMBO_TIERS, COMBO_DECAY_MS, getTargetSlot, isValidPlacement } from './rules';

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
    mistakes: 0,
    hintsUsed: 0,
    hintsRemaining: 3,
    timeElapsed: 0,
    shakingVinylId: null,
    rejectedSlot: null,
    invalidReason: null,
    stars: 0,
    labelsVisible: true,
    customerServed: false,
    customerTimeLeft: level.customerTimer ?? 0,
    customerLeft: false,
    rushTimeLeft: level.timeLimit ?? 0,
  };
}

export type GameAction =
  | { type: 'PLACE_VINYL'; vinylId: string; row: number; col: number }
  | { type: 'INVALID_DROP' }
  | { type: 'RESTART' }
  | { type: 'NEXT_LEVEL'; level: Level; levelIndex: number }
  | { type: 'COMBO_DECAY' }
  | { type: 'CLEAR_SHAKE' }
  | { type: 'SHOW_HINT' }
  | { type: 'BLACKOUT_TRIGGER' }
  | { type: 'CUSTOMER_SERVED' }
  | { type: 'CUSTOMER_TICK' }       // decrement customer patience timer
  | { type: 'CUSTOMER_LEFT' }       // customer gave up
  | { type: 'RUSH_TICK' }           // decrement rush/timed level countdown
  | { type: 'CLEAR_INVALID_REASON' }
  | { type: 'MISSED_DROP'; vinylId: string }
  | { type: 'REMOVE_VINYL'; vinylId: string };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLACE_VINYL': {
      const { vinylId, row, col } = action;
      if (state.status !== 'playing') return state;
      if (state.grid[row][col].vinylId !== null) return state;

      // Build the placedVinyls array format that isValidPlacement expects
      const placedArray = Object.entries(state.placedVinyls).map(([id, pos]) => ({
        vinylId: id,
        row: pos.row,
        col: pos.col,
      }));

      const sortRule = state.level.sortRule ?? 'free';
      const mode = state.level.mode ?? 'free';

      // Sleeve-match: il disco deve corrispondere alla copertina dello slot
      let placementResult: { valid: boolean; reason?: string };
      if (mode === 'sleeve-match' && state.level.sleeveTargets) {
        const target = state.level.sleeveTargets.find(
          t => t.row === row && t.col === col
        );
        placementResult = target && target.vinylId === vinylId
          ? { valid: true }
          : { valid: false, reason: 'Copertina non corrisponde' };
      } else {
        placementResult = isValidPlacement(
          vinylId,
          row,
          col,
          state.level.vinyls,
          placedArray,
          sortRule,
          mode,
          state.level.customerRequest,
          state.level.blockedSlots
        );
      }

      if (!placementResult.valid) {
        return {
          ...state,
          shakingVinylId: vinylId,
          rejectedSlot: { row, col },
          invalidReason: placementResult.reason ?? null,
          mistakes: state.mistakes + 1,
        };
      }

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

      const placedVinyl = state.level.vinyls.find(v => v.id === vinylId);
      const rareBonus = placedVinyl?.isRare ? 300 : 0;
      const earnedScore = Math.round(BASE_SCORE * tier.multiplier) + rareBonus;
      const bonusFromCombo = earnedScore - BASE_SCORE - rareBonus;

      const newPlaced = { ...state.placedVinyls, [vinylId]: { row, col } };
      const newUnplaced = state.unplacedVinylIds.filter((id) => id !== vinylId);

      // Check completion
      const isComplete = newUnplaced.length === 0;

      // Calculate stars on completion
      let stars = 1; // Default to 1 star for completion
      if (isComplete) {
        const mistakes = state.mistakes;
        const parTime = state.level.parTime;
        const currentTime = state.timeElapsed; // Time tracked in GameState

        if (parTime !== undefined) {
          // 3 stars: 0 errors + time ≤ par × 1.10 (10% margin)
          if (mistakes === 0 && currentTime <= parTime * 1.10) {
            stars = 3;
          }
          // 2 stars: ≤1 error + time < par (strict, must be UNDER par)
          else if (mistakes <= 1 && currentTime < parTime) {
            stars = 2;
          }
          // 1 star: default for completion
          else {
            stars = 1;
          }
        } else {
          // Fallback for levels without parTime (shouldn't happen after Plan 01)
          // Use mistakes-only calculation: 0 mistakes = 3 stars, ≤2 mistakes = 2 stars
          stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
        }
      }

      // Controlla se il cliente è stato servito in customer mode
      const cr = state.level.customerRequest;
      const justServedCustomer =
        !state.customerServed &&
        mode === 'customer' &&
        cr != null &&
        row === cr.targetRow &&
        col === cr.targetCol;
      const customerBonus = justServedCustomer ? 500 : 0;

      return {
        ...state,
        grid: newGrid,
        placedVinyls: newPlaced,
        unplacedVinylIds: newUnplaced,
        score: state.score + earnedScore + customerBonus,
        moves: state.moves + 1,
        combo: newCombo,
        comboBonusScore: state.comboBonusScore + bonusFromCombo,
        status: isComplete ? 'completed' : 'playing',
        shakingVinylId: null,
        rejectedSlot: null,
        stars,
        customerServed: state.customerServed || justServedCustomer,
      };
    }

    case 'INVALID_DROP': {
      const newStreak = Math.max(0, state.combo.streak - 1);
      const tier = getComboTier(newStreak);
      return {
        ...state,
        invalidDrops: state.invalidDrops + 1,
        moves: state.moves + 1,
        combo: {
          streak: newStreak,
          multiplier: tier.multiplier,
          label: tier.label,
          lastPlacementTime: state.combo.lastPlacementTime,
        },
      };
    }

    case 'RESTART':
      return createGameState(state.level, state.levelIndex);

    case 'NEXT_LEVEL':
      return createGameState(action.level, action.levelIndex);

    case 'COMBO_DECAY':
      if (state.combo.streak === 0) return state;
      return { ...state, combo: freshCombo() };

    case 'CLEAR_SHAKE':
      return {
        ...state,
        shakingVinylId: null,
        rejectedSlot: null,
        invalidReason: null,
      };

    case 'SHOW_HINT': {
      if (state.hintsRemaining <= 0) return state;
      return {
        ...state,
        hintsRemaining: state.hintsRemaining - 1,
        hintsUsed: state.hintsUsed + 1,
      };
    }

    case 'BLACKOUT_TRIGGER':
      return { ...state, labelsVisible: false };

    case 'CUSTOMER_SERVED':
      return { ...state, customerServed: true, score: state.score + 500 };

    case 'CUSTOMER_TICK': {
      if (state.customerServed || state.customerLeft || state.status !== 'playing') return state;
      const newTime = state.customerTimeLeft - 1;
      if (newTime <= 0) {
        // Customer leaves — penalty
        return {
          ...state,
          customerTimeLeft: 0,
          customerLeft: true,
          score: Math.max(0, state.score - 200),
          mistakes: state.mistakes + 1,
        };
      }
      return { ...state, customerTimeLeft: newTime };
    }

    case 'CUSTOMER_LEFT':
      return { ...state, customerLeft: true };

    case 'RUSH_TICK': {
      if (state.status !== 'playing') return state;
      const newRush = state.rushTimeLeft - 1;
      if (newRush <= 0) {
        // Time's up — level failed, show completion with 1 star
        return { ...state, rushTimeLeft: 0, status: 'completed', stars: 1 };
      }
      return { ...state, rushTimeLeft: newRush };
    }

    case 'CLEAR_INVALID_REASON':
      return { ...state, invalidReason: null };

    case 'MISSED_DROP':
      // Il disco è stato rilasciato fuori dallo scaffale — shake visivo, nessuna penalità
      return { ...state, shakingVinylId: action.vinylId };

    case 'REMOVE_VINYL': {
      // Rimuovi il vinile dallo scaffale e rimettilo nel counter — azzera il combo
      const { vinylId } = action;
      const pos = state.placedVinyls[vinylId];
      if (!pos) return state; // già non piazzato, ignora

      // Rimuovi dalla griglia
      const newGrid = state.grid.map((r) => r.map((c) => ({ ...c })));
      newGrid[pos.row][pos.col].vinylId = null;

      // Rimuovi da placedVinyls e rimetti in unplacedVinylIds
      const newPlaced = { ...state.placedVinyls };
      delete newPlaced[vinylId];
      const newUnplaced = [...state.unplacedVinylIds, vinylId];

      return {
        ...state,
        grid: newGrid,
        placedVinyls: newPlaced,
        unplacedVinylIds: newUnplaced,
        combo: freshCombo(), // il combo si azzera quando si sposta un disco già piazzato
        status: 'playing',   // se era 'completed' per qualche motivo, torna in playing
      };
    }

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
