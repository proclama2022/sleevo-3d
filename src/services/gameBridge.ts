/**
 * Game Bridge Service
 * Phase 4: Architecture Integration
 * 
 * Coordinates communication between React UI and Three.js game
 */

import { useGameStore } from '../store/gameStore';
import type { Vinyl, ShelfSlot, Level, GameState, GamePhase } from '../types/game';

export interface GameBridgeConfig {
  store: typeof useGameStore;
  onVinylPickup?: (vinylId: string) => void;
  onVinylDrop?: (vinylId: string, slotId: string, isValid: boolean) => void;
  onGameStart?: (level: Level) => void;
  onGameEnd?: (completed: boolean, score: number) => void;
  onScoreUpdate?: (points: number, combo: number) => void;
}

/**
 * GameBridge - Mediator between React UI and Three.js
 * 
 * Responsibilities:
 * - Subscribe to Zustand store changes
 * - Notify Three.js of state changes
 * - Receive Three.js events and update store
 * - Manage game loop (timer)
 */
export class GameBridge {
  private store: typeof useGameStore;
  private unsubscribe: (() => void) | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private config: GameBridgeConfig;

  constructor(config: GameBridgeConfig) {
    this.config = config;
    this.store = config.store;
  }

  /**
   * Initialize bridge and subscribe to store changes
   */
  connect(): void {
    // Subscribe to phase changes
    this.unsubscribe = this.store.subscribe(
      (state: GameState) => state.phase,
      (phase: GamePhase, previousPhase: GamePhase) => {
        this.handlePhaseChange(phase, previousPhase);
      }
    );

    // Subscribe to score changes
    this.store.subscribe(
      (state: GameState) => state.score.points,
      (points: number) => {
        const combo = this.store.getState().score.combo;
        this.config.onScoreUpdate?.(points, combo);
      }
    );
  }

  /**
   * Disconnect bridge and cleanup
   */
  disconnect(): void {
    this.unsubscribe?.();
    this.stopTimer();
  }

  /**
   * Handle game phase transitions
   */
  private handlePhaseChange(
    phase: GamePhase, 
    previousPhase: GamePhase
  ): void {
    const state = this.store.getState();

    switch (phase) {
      case 'playing':
        if (previousPhase !== 'paused') {
          this.startTimer();
          this.config.onGameStart?.(state.currentLevel!);
        }
        break;

      case 'paused':
        this.stopTimer();
        break;

      case 'completed':
      case 'failed':
        this.stopTimer();
        this.config.onGameEnd?.(phase === 'completed', state.score.points);
        break;
    }
  }

  /**
   * Start game timer
   */
  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.store.getState().tick();
    }, 1000);
  }

  /**
   * Stop game timer
   */
  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ==================== Three.js -> Store Methods ====================

  /**
   * Called from Three.js when vinyl pickup starts
   */
  handleVinylPickup(vinylId: string): void {
    this.store.getState().pickupVinyl(vinylId);
    this.config.onVinylPickup?.(vinylId);
  }

  /**
   * Called from Three.js when vinyl is dropped
   */
  handleVinylDrop(vinylId: string, slotId: string): void {
    const state = this.store.getState();
    const vinyl = state.vinyls.find((v: Vinyl) => v.id === vinylId);
    const slot = state.slots.find((s: ShelfSlot) => s.id === slotId);
    
    if (vinyl && slot) {
      const isValid = vinyl.genre.toLowerCase() === slot.expectedGenre.toLowerCase();
      this.store.getState().dropVinyl(vinylId, slotId);
      this.config.onVinylDrop?.(vinylId, slotId, isValid);
      
      if (isValid) {
        this.store.getState().incrementCombo();
      } else {
        this.store.getState().resetCombo();
      }
    }
  }

  /**
   * Called from Three.js when drag is cancelled
   */
  handleDragCancel(): void {
    this.store.getState().cancelDrag();
  }

  /**
   * Called from Three.js when hovering over slot
   */
  handleSlotHover(slotId: string): void {
    this.store.getState().hoverSlot(slotId);
  }

  /**
   * Called from Three.js when leaving slot
   */
  handleSlotLeave(slotId: string): void {
    this.store.getState().leaveSlot(slotId);
  }

  // ==================== Store -> Three.js Methods ====================

  /**
   * Get current vinyls for Three.js rendering
   */
  getVinyls(): Vinyl[] {
    return this.store.getState().vinyls;
  }

  /**
   * Get current slots for Three.js rendering
   */
  getSlots(): ShelfSlot[] {
    return this.store.getState().slots;
  }

  /**
   * Get current game phase
   */
  getPhase(): GamePhase {
    return this.store.getState().phase;
  }

  /**
   * Get dragged vinyl ID
   */
  getDraggedVinylId(): string | null {
    return this.store.getState().draggedVinylId;
  }

  /**
   * Check if game is active
   */
  isGameActive(): boolean {
    const phase = this.store.getState().phase;
    return phase === 'playing' || phase === 'paused';
  }
}

/**
 * Create game bridge instance
 */
export const createGameBridge = (config: GameBridgeConfig): GameBridge => {
  const bridge = new GameBridge(config);
  bridge.connect();
  return bridge;
};
