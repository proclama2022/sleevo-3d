import { SceneRenderer } from './SceneRenderer';
import { GameManager } from './GameManager';
import { InputController } from './InputController';
import { Level } from './types';

// Level data
const level1: Level = {
  id: 'level-1',
  shelf: { rows: 1, cols: 8 },
  vinyls: [
    { id: 'v1', width: 1, color: '#D7263D', genre: 'Rock', year: 1975 },
    { id: 'v2', width: 1, color: '#2563EB', genre: 'Jazz', year: 1959 },
    { id: 'v3', width: 1, color: '#EC4899', genre: 'Pop', year: 1989 },
    { id: 'v4', width: 1, color: '#F97316', genre: 'Hip-Hop', year: 1992 },
    { id: 'v5', width: 1, color: '#A78BFA', genre: 'Classica', year: 1791 },
    { id: 'v6', width: 1, color: '#D7263D', genre: 'Rock', year: 1969 },
    { id: 'v7', width: 1, color: '#2563EB', genre: 'Jazz', year: 1965 },
    { id: 'v8', width: 1, color: '#EC4899', genre: 'Pop', year: 2001 },
  ],
  rules: { fillAllSlots: false, allowGaps: true },
};

const level2: Level = {
  id: 'level-2',
  shelf: { rows: 1, cols: 8 },
  vinyls: [
    { id: 'v6', width: 1, color: '#D7263D', genre: 'Rock', year: 1969 },
    { id: 'v3', width: 1, color: '#EC4899', genre: 'Pop', year: 1989 },
    { id: 'v5', width: 1, color: '#A78BFA', genre: 'Classica', year: 1791 },
    { id: 'v1', width: 1, color: '#D7263D', genre: 'Rock', year: 1975 },
    { id: 'v8', width: 1, color: '#EC4899', genre: 'Pop', year: 2001 },
    { id: 'v4', width: 1, color: '#F97316', genre: 'Hip-Hop', year: 1992 },
    { id: 'v2', width: 1, color: '#2563EB', genre: 'Jazz', year: 1959 },
    { id: 'v7', width: 1, color: '#2563EB', genre: 'Jazz', year: 1965 },
  ],
  rules: { fillAllSlots: false, allowGaps: true },
};

const LEVELS: Level[] = [level1, level2];

class Game {
  private sceneRenderer: SceneRenderer;
  private gameManager: GameManager;
  private inputController: InputController;
  private currentLevelIndex = 0;

  constructor() {
    const container = document.getElementById('canvas-container');
    if (!container) {
      throw new Error('Canvas container not found');
    }

    // Initialize renderer and game manager
    this.sceneRenderer = new SceneRenderer(container);
    this.gameManager = new GameManager(this.sceneRenderer);

    // Initialize input controller
    this.inputController = new InputController(
      this.sceneRenderer,
      (vinyl, row, col) => {
        this.gameManager.placeVinylOnShelf(vinyl, row, col);
        this.updateUI();
      },
      (col, isValid) => {
        this.gameManager.previewDropColumn(col, isValid);
      },
      () => {
        this.gameManager.clearDropPreview();
      },
      (col) => {
        this.gameManager.previewTargetColumn(col);
      },
      () => {
        this.gameManager.clearTargetColumnPreview();
      },
      () => {
        this.gameManager.registerInvalidDrop();
        this.updateUI();
      },
      (col) => this.gameManager.isColumnAvailable(col)
    );

    // Setup UI
    this.setupUI();

    // Load first level
    this.gameManager.loadLevel(LEVELS[this.currentLevelIndex]);
    this.updateUI();

    // Register update callback
    this.sceneRenderer.setUpdateCallback((deltaTime) => {
      this.gameManager.update(deltaTime);
      this.gameManager.updatePanelStates(); // Update genre panel animations and states
      this.updateUI();
    });

    // Start render loop
    this.sceneRenderer.animate();

    console.log('🎮 Sleevo 3D initialized!');
    console.log('👆 Pick a vinyl from the carousel and drop it in its exact target column (empty slot only).');
  }

  private setupUI(): void {
    const btnStart = document.getElementById('btn-start');
    const tutorial = document.getElementById('tutorial');
    const instruction = document.getElementById('instruction');

    btnStart?.addEventListener('click', () => {
      tutorial?.classList.add('hidden');
      if (instruction) instruction.style.display = 'block';
    });
  }

  private levelCompleteShown = false;

  private updateUI(): void {
    const levelEl = document.getElementById('level');
    const scoreEl = document.getElementById('score');
    const progressEl = document.getElementById('progress');

    const placed = this.gameManager.getPlacedVinylCount();
    const total = this.gameManager.getTotalVinylCount();
    const invalidDrops = this.gameManager.getInvalidDrops();
    const isCompleted = this.gameManager.getStatus() === 'completed';

    const instructionText = isCompleted
      ? `Completato: ${placed}/${total}. Errori: ${invalidDrops}.`
      : `Ogni vinile ha la sua colonna. Progress: ${placed}/${total} · Combo x${this.gameManager.getComboMultiplier().toFixed(1)}`;

    if (levelEl) levelEl.textContent = String(this.currentLevelIndex + 1);
    if (scoreEl) scoreEl.textContent = this.gameManager.getScore().toString();
    if (progressEl) progressEl.textContent = `${placed}/${total}`;
    this.inputController.setIdleInstructionText(instructionText);

    // Show level complete overlay (trigger once, show after short delay)
    if (isCompleted && !this.levelCompleteShown) {
      this.levelCompleteShown = true;
      const delay = 600;
      setTimeout(() => {
        this.showLevelComplete();
        // Fallback: if overlay still hidden (e.g. CSS), force show again next frame
        requestAnimationFrame(() => {
          const el = document.getElementById('level-complete');
          if (el?.classList.contains('hidden')) {
            el.classList.remove('hidden');
            (el as HTMLElement).style.display = '';
            (el as HTMLElement).style.visibility = 'visible';
          }
        });
      }, delay);
    }
  }

  private showLevelComplete(): void {
    const overlay = document.getElementById('level-complete');
    const scoreEl = document.getElementById('complete-score');
    const errorsEl = document.getElementById('complete-errors');
    const btnRestart = document.getElementById('btn-restart');

    if (!overlay) return;

    if (scoreEl) scoreEl.textContent = this.gameManager.getScore().toString();
    if (errorsEl) errorsEl.textContent = this.gameManager.getInvalidDrops().toString();

    const hasNext = this.currentLevelIndex < LEVELS.length - 1;
    if (btnRestart) {
      btnRestart.textContent = hasNext ? 'Prossimo livello' : 'Gioca di nuovo';
      btnRestart.setAttribute('aria-label', hasNext ? 'Vai al livello successivo' : 'Ricomincia dal livello 1');
    }

    overlay.classList.remove('hidden');
    (overlay as HTMLElement).style.display = '';
    (overlay as HTMLElement).style.visibility = 'visible';

    // ── Spawn sparkles/particles on level complete
    this.spawnLevelCompleteParticles();

    btnRestart?.addEventListener('click', () => {
      overlay.classList.add('hidden');
      this.levelCompleteShown = false;
      if (hasNext) {
        this.currentLevelIndex += 1;
        this.gameManager.loadLevel(LEVELS[this.currentLevelIndex]);
      } else {
        this.currentLevelIndex = 0;
        this.gameManager.loadLevel(LEVELS[0]);
      }
      this.updateUI();
    }, { once: true });
  }

  private spawnLevelCompleteParticles(): void {
    const particleCount = 24;
    const container = document.body;

    for (let i = 0; i < particleCount; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';

      // Random position near center of screen
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = 60 + Math.random() * 120;

      sparkle.style.left = `${centerX}px`;
      sparkle.style.top = `${centerY}px`;
      sparkle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
      sparkle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
      sparkle.style.animationDelay = `${i * 0.05}s`;

      // Random golden hue
      const hue = 35 + Math.random() * 20;
      const lightness = 50 + Math.random() * 20;
      sparkle.style.background = `radial-gradient(circle, hsl(${hue}, 100%, ${lightness}%) 0%, hsl(${hue}, 90%, ${lightness - 10}%) 50%, transparent 100%)`;

      container.appendChild(sparkle);

      // Remove after animation
      setTimeout(() => {
        sparkle.remove();
      }, 1400);
    }
  }
}

// Start the game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
