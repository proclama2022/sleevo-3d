import { SceneRenderer } from './SceneRenderer';
import { GameManager } from './GameManager';
import { InputController } from './InputController';
import { Level } from './types';

// Sample level data
const level1: Level = {
  id: 'level-1',
  shelf: {
    rows: 3,
    cols: 5,
  },
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
  rules: {
    fillAllSlots: false,
    allowGaps: true,
  },
};

class Game {
  private sceneRenderer: SceneRenderer;
  private gameManager: GameManager;
  private inputController: InputController;

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
      }
    );

    // Setup UI
    this.setupUI();

    // Load first level
    this.gameManager.loadLevel(level1);

    // Register update callback
    this.sceneRenderer.setUpdateCallback((deltaTime) => {
      this.gameManager.update(deltaTime);
    });

    // Start render loop
    this.sceneRenderer.animate();

    console.log('🎮 Sleevo 3D initialized!');
    console.log('👆 Try dragging a vinyl from the carousel!');
  }

  private setupUI(): void {
    const btnUndo = document.getElementById('btn-undo');
    const btnRestart = document.getElementById('btn-restart');
    const btnStart = document.getElementById('btn-start');
    const tutorial = document.getElementById('tutorial');
    const instruction = document.getElementById('instruction');

    btnStart?.addEventListener('click', () => {
      tutorial?.classList.add('hidden');
      if (instruction) instruction.style.display = 'block';
    });

    btnUndo?.addEventListener('click', () => {
      this.gameManager.undo();
    });

    btnRestart?.addEventListener('click', () => {
      this.gameManager.restart();
    });
  }

  private updateUI(): void {
    const levelEl = document.getElementById('level');
    const scoreEl = document.getElementById('score');

    if (levelEl) levelEl.textContent = '1';
    if (scoreEl) scoreEl.textContent = this.gameManager.getScore().toString();
  }
}

// Start the game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
