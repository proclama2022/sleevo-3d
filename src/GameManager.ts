import * as THREE from 'three';
import { Level, Vinyl, GridCell, GameStatus, ShelfConfig, ComboState, COMBO_TIERS } from './types';
import { SceneRenderer } from './SceneRenderer';
import { COLUMN_GENRE_LABELS, getColorForGenre, getColumnForVinylId } from './gameRules';
import { createEnhancedGenrePanel, updatePanelState, type GenrePanelConfig } from './GenrePanelBuilder';

const AI_REF_SCENE_URL = 'https://im.runware.ai/image/ws/4/ii/455156ce-83b2-442d-94b0-efe9970676ac.png';
const AI_REF_SHELF_URL = 'https://im.runware.ai/image/ws/4/ii/eb730e15-e1f0-4d46-82b4-671b9467961a.png';
const AI_REF_COUNTER_URL = 'https://im.runware.ai/image/ws/4/ii/73151626-dc54-4f08-93e9-254954acf8ea.png';
const AI_LOCAL_POSTER_JAZZ_URL = '/ai/poster-jazz-ai.png';
const AI_LOCAL_POSTER_ROCK_URL = '/ai/poster-rock-ai.png';
const AI_LOCAL_COUNTER_TEXTURE_URL = '/ai/counter-texture-ai.png';

export class GameManager {
  private level: Level | null = null;
  private grid: GridCell[][] = [];
  private status: GameStatus = 'idle';
  private score: number = 0;
  private moves: number = 0;
  private invalidDrops: number = 0;
  private totalVinyls: number = 0;
  private sceneRenderer: SceneRenderer;
  private shelfGroup: THREE.Group;
  private vinylsGroup: THREE.Group;
  private idleTime: number = 0;
  private textureLoader: THREE.TextureLoader;
  private aiPhotoDecalsEnabled: boolean = false;
  private dropColumnGuide: THREE.Mesh | null = null;
  private targetColumnGuide: THREE.Mesh | null = null;
  // SINGLE ROW MODE: shelfRows is always 1, shelfCols calculated from level.vinyls.length
  // shelfRows is intentionally not stored as it's always 1 in Single Row mode
  private shelfCols = 8;  // Calculated dynamically in loadLevel
  private readonly slotWidth = 0.8;
  private readonly rowHeight = 0.8;
  private readonly singleSlotPerColumn = true;
  private readonly simplifiedDecorMode = false;
  private comboBonusScore = 0;
  
  // Combo System
  private combo: ComboState = {
    streak: 0,
    multiplier: 1,
    lastPlacementTime: 0,
    maxStreak: 0,
    comboDecayMs: 4000,
  };

  constructor(sceneRenderer: SceneRenderer) {
    this.sceneRenderer = sceneRenderer;
    this.shelfGroup = new THREE.Group();
    this.shelfGroup.name = 'shelf-group';
    this.vinylsGroup = new THREE.Group();
    this.vinylsGroup.name = 'vinyls-group';
    this.textureLoader = new THREE.TextureLoader();

    const scene = this.sceneRenderer.getScene();
    scene.add(this.shelfGroup);
    scene.add(this.vinylsGroup);
  }

  public loadLevel(level: Level): void {
    this.level = level;
    this.status = 'playing';
    this.score = 0;
    this.moves = 0;
    this.invalidDrops = 0;
    this.comboBonusScore = 0;
    this.resetCombo();
    this.totalVinyls = level.vinyls.length;

    // SINGLE ROW: Calculate shelfCols from number of vinyls
    this.shelfCols = level.vinyls.length;

    // Override shelf config for Single Row mode
    const singleRowConfig: ShelfConfig = {
      rows: 1,
      cols: this.shelfCols,
    };

    this.initializeGrid(singleRowConfig);
    this.buildShelf(singleRowConfig);
    this.createVinyls(level.vinyls);

    console.log('Level loaded:', level.id, 'with', this.shelfCols, 'columns (Single Row mode)');
  }

  private initializeGrid(config: ShelfConfig): void {
    this.grid = [];
    // SINGLE ROW MODE: Only one row (index 0)
    this.grid[0] = [];
    for (let col = 0; col < config.cols; col++) {
      this.grid[0][col] = { row: 0, col, vinylId: null };
    }
  }

  private buildShelf(config: ShelfConfig): void {
    this.shelfGroup.clear();

    const slotWidth = this.slotWidth;
    const shelfWidth = config.cols * slotWidth;
    const shelfHeight = this.rowHeight;  // SINGLE ROW: Always single rowHeight
    const shelfDepth = 0.45;
    const fillFridgeLook = this.simplifiedDecorMode;

    // ── PREMIUM LOUNGE: Dark walnut/ebony wood texture with rich grain
    const createVintageWoodTexture = (): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Base gradient - dark walnut/ebony tones
      const gradient = ctx.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, '#2d1f14');   // Dark walnut
      gradient.addColorStop(0.3, '#3d2817'); // Rich ebony
      gradient.addColorStop(0.6, '#2d1f14');
      gradient.addColorStop(1, '#1a120a');   // Deep espresso
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1024, 512);

      // Wood grain lines - fine premium grain
      ctx.globalAlpha = 0.12;
      for (let i = 0; i < 100; i++) {
        ctx.strokeStyle = i % 3 === 0 ? '#4a2c1a' : '#1a0f08';
        ctx.lineWidth = Math.random() * 1.5 + 0.3;
        ctx.beginPath();
        const y = Math.random() * 512;
        ctx.moveTo(0, y);
        // Fine wavy grain
        for (let x = 0; x < 1024; x += 15) {
          ctx.lineTo(x, y + Math.sin(x * 0.025) * 2 + Math.random() * 1.5);
        }
        ctx.stroke();
      }

      // Subtle velvet/fabric overlay for luxury feel
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < 3000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#4a2c1a' : '#2a1a10';
        ctx.fillRect(Math.random() * 1024, Math.random() * 512, 1, 1);
      }

      // Wood knots - subtle and refined
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 3; i++) {
        const kx = Math.random() * 900 + 62;
        const ky = Math.random() * 400 + 56;
        const kr = Math.random() * 12 + 6;
        ctx.fillStyle = '#1a0f08';
        ctx.beginPath();
        ctx.ellipse(kx, ky, kr, kr * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
        // Knot rings
        ctx.strokeStyle = '#3d2314';
        ctx.lineWidth = 0.4;
        for (let r = kr * 0.3; r < kr; r += 2) {
          ctx.beginPath();
          ctx.ellipse(kx, ky, r, r * 0.6, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    const woodTexture = createVintageWoodTexture();

    // ── PREMIUM LOUNGE: Background wall - dark wood paneling with velvet texture
    const wallGeometry = new THREE.PlaneGeometry(shelfWidth + 6, shelfHeight + 6);
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 512;
    wallCanvas.height = 512;
    const wallCtx = wallCanvas.getContext('2d')!;
    // Dark walnut base
    wallCtx.fillStyle = '#2d1f14';
    wallCtx.fillRect(0, 0, 512, 512);
    // Wood paneling grain
    wallCtx.globalAlpha = 0.1;
    for (let i = 0; i < 60; i++) {
      wallCtx.strokeStyle = '#4a2c1a';
      wallCtx.lineWidth = Math.random() * 2 + 0.5;
      wallCtx.beginPath();
      const y = Math.random() * 512;
      wallCtx.moveTo(0, y);
      for (let x = 0; x < 512; x += 20) {
        wallCtx.lineTo(x, y + Math.sin(x * 0.03) * 3 + Math.random() * 2);
      }
      wallCtx.stroke();
    }
    // Velvet fabric overlay
    wallCtx.globalAlpha = 0.06;
    for (let i = 0; i < 2000; i++) {
      wallCtx.fillStyle = Math.random() > 0.5 ? '#4a2c1a' : '#1a0f08';
      wallCtx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
    }
    // Subtle panel lines
    wallCtx.globalAlpha = 0.15;
    wallCtx.strokeStyle = '#1a0f08';
    wallCtx.lineWidth = 2;
    wallCtx.beginPath();
    wallCtx.moveTo(256, 0);
    wallCtx.lineTo(256, 512);
    wallCtx.stroke();
    wallCtx.beginPath();
    wallCtx.moveTo(0, 256);
    wallCtx.lineTo(512, 256);
    wallCtx.stroke();

    const wallTexture = new THREE.CanvasTexture(wallCanvas);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(4, 4);

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: fillFridgeLook ? 0xf2f9ff : 0x2d1f14,
      map: fillFridgeLook ? null : wallTexture,
      roughness: fillFridgeLook ? 1.0 : 0.85,
      metalness: 0.0,
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, 0, -shelfDepth / 2 - 0.3);
    wall.receiveShadow = true;
    this.shelfGroup.add(wall);

    // ── PREMIUM LOUNGE: Shelf backboard - premium dark wood with gloss
    const backGeometry = new THREE.BoxGeometry(shelfWidth + 0.2, shelfHeight + 0.2, 0.08);
    const backMaterial = new THREE.MeshStandardMaterial({
      color: fillFridgeLook ? 0xd9ebff : 0x2d1f14,
      map: fillFridgeLook ? null : woodTexture,
      roughness: fillFridgeLook ? 0.95 : 0.4,
      metalness: fillFridgeLook ? 0.0 : 0.05,
    });
    const backBoard = new THREE.Mesh(backGeometry, backMaterial);
    backBoard.position.set(0, 0, -shelfDepth / 2);
    backBoard.receiveShadow = true;
    backBoard.castShadow = true;
    this.shelfGroup.add(backBoard);

    // ── PREMIUM LOUNGE: Horizontal shelf boards with brushed gold edge strips
    const shelfBoardColor = fillFridgeLook ? 0xe6f3ff : 0x3d2817;
    const goldColor = fillFridgeLook ? 0xffffff : 0xc9a227;
    const boardPositions = [-shelfHeight / 2, shelfHeight / 2];  // bottom and top

    for (const y of boardPositions) {
      // Wood board - dark mahogany
      const boardGeometry = new THREE.BoxGeometry(shelfWidth + 0.16, 0.09, shelfDepth);
      const boardMaterial = new THREE.MeshStandardMaterial({
        color: shelfBoardColor,
        map: fillFridgeLook ? null : woodTexture,
        roughness: fillFridgeLook ? 0.95 : 0.45,
        metalness: fillFridgeLook ? 0.0 : 0.03,
      });
      const board = new THREE.Mesh(boardGeometry, boardMaterial);
      board.position.set(0, y, 0);
      board.castShadow = true;
      board.receiveShadow = true;
      this.shelfGroup.add(board);

      // Brushed gold edge strip on front
      const goldStripGeometry = new THREE.BoxGeometry(shelfWidth + 0.18, 0.02, 0.04);
      const goldMaterial = new THREE.MeshStandardMaterial({
        color: goldColor,
        roughness: fillFridgeLook ? 0.2 : 0.28,
        metalness: fillFridgeLook ? 0.0 : 0.85,
      });
      const goldStrip = new THREE.Mesh(goldStripGeometry, goldMaterial);
      goldStrip.position.set(0, y + (y > 0 ? 0.045 : -0.045), shelfDepth / 2 - 0.02);
      goldStrip.castShadow = true;
      this.shelfGroup.add(goldStrip);
    }

    // ── PREMIUM LOUNGE: Vertical dividers - dark walnut with brushed gold caps
    const dividerColor = fillFridgeLook ? 0xc6def8 : 0x2d1f14;
    for (let col = 0; col <= config.cols; col++) {
      const x = (col - config.cols / 2) * slotWidth;
      // Wood divider - dark walnut
      const dividerGeometry = new THREE.BoxGeometry(0.05, shelfHeight, shelfDepth * 0.9);
      const dividerMaterial = new THREE.MeshStandardMaterial({
        color: dividerColor,
        map: fillFridgeLook ? null : woodTexture,
        roughness: fillFridgeLook ? 0.96 : 0.45,
        metalness: 0.0,
      });
      const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
      divider.position.set(x, 0, 0);
      divider.castShadow = true;
      divider.receiveShadow = true;
      this.shelfGroup.add(divider);

      // Brushed gold cap on top of divider
      const capGeometry = new THREE.BoxGeometry(0.06, 0.02, shelfDepth * 0.92);
      const capMaterial = new THREE.MeshStandardMaterial({
        color: goldColor,
        roughness: fillFridgeLook ? 0.18 : 0.25,
        metalness: fillFridgeLook ? 0.0 : 0.85,
      });
      const cap = new THREE.Mesh(capGeometry, capMaterial);
      cap.position.set(x, shelfHeight / 2 + 0.01, 0);
      this.shelfGroup.add(cap);
    }

    // ── PREMIUM LOUNGE: Side walls - substantial dark wood with gold trim
    const sideGeometry = new THREE.BoxGeometry(0.15, shelfHeight + 0.15, shelfDepth);
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: shelfBoardColor,
      map: fillFridgeLook ? null : woodTexture,
      roughness: fillFridgeLook ? 0.95 : 0.4,
      metalness: fillFridgeLook ? 0.0 : 0.03,
    });

    const leftWall = new THREE.Mesh(sideGeometry, sideMaterial);
    leftWall.position.set(-shelfWidth / 2 - 0.075, 0, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    this.shelfGroup.add(leftWall);

    const rightWall = new THREE.Mesh(sideGeometry, sideMaterial);
    rightWall.position.set(shelfWidth / 2 + 0.075, 0, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    this.shelfGroup.add(rightWall);

    // Brushed gold trim on side walls
    const sideGoldGeometry = new THREE.BoxGeometry(0.025, shelfHeight + 0.17, 0.06);
    const sideGoldMaterial = new THREE.MeshStandardMaterial({
      color: goldColor,
      roughness: fillFridgeLook ? 0.15 : 0.25,
      metalness: fillFridgeLook ? 0.0 : 0.85,
    });

    const leftGold = new THREE.Mesh(sideGoldGeometry, sideGoldMaterial);
    leftGold.position.set(-shelfWidth / 2 - 0.075, 0, shelfDepth / 2 - 0.02);
    this.shelfGroup.add(leftGold);

    const rightGold = new THREE.Mesh(sideGoldGeometry, sideGoldMaterial);
    rightGold.position.set(shelfWidth / 2 + 0.075, 0, shelfDepth / 2 - 0.02);
    this.shelfGroup.add(rightGold);

    // ── Floor (premium polished parquet with herringbone pattern)
    const createWoodFloorTexture = (): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 2048;
      const ctx = canvas.getContext('2d')!;

      // Dark polished base - mahogany tone
      ctx.fillStyle = '#4a2c1a';
      ctx.fillRect(0, 0, 2048, 2048);

      // Parquet colors - darker wood palette
      const parquetColors = [
        { base: '#4a2c1a', grain: '#3d2817', highlight: '#5a3c2a' }, // mahogany
        { base: '#3d2817', grain: '#2a1a0f', highlight: '#4a2c1a' }, // walnut
        { base: '#5a3c2a', grain: '#4a2c1a', highlight: '#6a4c3a' }, // lighter accent
        { base: '#482a18', grain: '#3a2212', highlight: '#563826' }, // dark walnut
      ];

      // Herringbone parquet - smaller planks at 45 degrees
      // Each parquet piece: 100px long, 25px wide
      const pieceLength = 100;
      const pieceWidth = 25;

      // Draw herringbone pattern by iterating in diagonal rows
      const diagonalStep = pieceWidth * 1.5; // spacing between diagonal rows

      for (let row = -2048; row < 4096; row += diagonalStep) {
        for (let col = -2048; col < 4096; col += pieceLength + 4) {
          // Pick a random color variant for each piece
          const colorSet = parquetColors[Math.floor(Math.random() * parquetColors.length)];

          // Slight color variation per piece
          const shade = Math.random() * 0.1 - 0.05;
          const baseColor = colorSet.base;

          // Draw parquet piece going up-right (/)
          const x1 = col;
          const y1 = row;
          drawParquetPiece(ctx, x1, y1, pieceLength, pieceWidth, Math.PI / 4, baseColor, colorSet, shade);

          // Draw parquet piece going down-right (\) - offset
          const x2 = col + pieceLength / 2;
          const y2 = row + pieceWidth * 0.7;
          drawParquetPiece(ctx, x2, y2, pieceLength, pieceWidth, -Math.PI / 4, baseColor, colorSet, shade);
        }
      }

      // Polished gloss highlights - subtle light reflections along edges
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#6a4c3a';
      ctx.lineWidth = 1;
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 2048;
        const y = Math.random() * 2048;
        const len = Math.random() * 30 + 10;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + len * 0.7, y - len * 0.7);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Subtle worn spots - very minimal for polished look
      ctx.globalAlpha = 0.04;
      for (let i = 0; i < 300; i++) {
        const x = Math.random() * 2048;
        const y = Math.random() * 2048;
        ctx.fillStyle = Math.random() > 0.5 ? '#2a1a0f' : '#5a3c2a';
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 8 + 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(3, 3);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    // Helper function to draw a single parquet piece
    const drawParquetPiece = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      length: number,
      width: number,
      angle: number,
      baseColor: string,
      colorSet: { base: string; grain: string; highlight: string },
      _shade: number // Shade variation (reserved for future use)
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Main plank body
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, -width / 2, length, width);

      // Wood grain along the piece
      ctx.globalAlpha = 0.2;
      for (let g = 0; g < 5; g++) {
        const grainY = -width / 2 + Math.random() * width;
        ctx.strokeStyle = colorSet.grain;
        ctx.lineWidth = Math.random() * 0.8 + 0.3;
        ctx.beginPath();
        ctx.moveTo(0, grainY);
        for (let px = 0; px < length; px += 8) {
          ctx.lineTo(px, grainY + Math.sin(px * 0.05) * 0.8 + Math.random() * 0.5);
        }
        ctx.stroke();
      }

      // Gloss highlight edge (top edge of piece)
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = colorSet.highlight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -width / 2);
      ctx.lineTo(length, -width / 2);
      ctx.stroke();

      // Dark seam at bottom
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#2a1a0f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, width / 2);
      ctx.lineTo(length, width / 2);
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const floorTexture = createWoodFloorTexture();
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      map: fillFridgeLook ? null : floorTexture,
      color: fillFridgeLook ? 0xf7f2ea : 0x4a2c1a, // darker mahogany tone
      roughness: fillFridgeLook ? 1.0 : 0.45, // polished finish (lower roughness)
      metalness: fillFridgeLook ? 0.0 : 0.05, // subtle reflections for gloss
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    // Keep floor below the carousel lane so vinyls are not visually cut by the ground plane.
    ground.position.y = -(shelfHeight / 2) - 1.15;
    ground.receiveShadow = true;
    this.shelfGroup.add(ground);

    // Position shelf at proper height
    this.shelfGroup.position.y = 0.5;

    // ── AI references opzionali: utili per test art direction, disattivate di default per evitare effetto collage
    if (this.aiPhotoDecalsEnabled) {
      this.addAiReferenceLayers(shelfWidth, shelfHeight, shelfDepth);
    }

    // Keep puzzle readability high in normal gameplay.
    if (this.simplifiedDecorMode) {
      this.createMinimalEnvironmentDetails(shelfWidth, shelfHeight);
    } else {
      this.createEnvironmentDetails(shelfWidth, shelfHeight);
    }

    // ── VINTAGE: Genre labels (fixed order so level 2+ use same column targets as gameRules)
    const genres = [...COLUMN_GENRE_LABELS];

    for (let col = 0; col < config.cols; col++) {
      const x = (col - config.cols / 2) * slotWidth + slotWidth / 2;
      const y = shelfHeight / 2 + 0.18;  // Position above shelf
      const genreColor = getColorForGenre(genres[col] ?? '');
      const genreLabel = genres[col] ?? `COL ${col + 1}`;

      // ── ENHANCED 3D Genre Panel with BoxGeometry borders and realistic depth
      const panelConfig: GenrePanelConfig = {
        slotWidth: this.slotWidth,
        shelfHeight,
        genreColor,
        col,
        x,
      };
      const enhancedPanel = createEnhancedGenrePanel(panelConfig);
      this.shelfGroup.add(enhancedPanel);

      // ── VINTAGE LABEL: Aged paper with typewriter style
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 384;
      labelCanvas.height = 192;
      const lctx = labelCanvas.getContext('2d')!;

      // Aged paper background with genre tint so the label reads as that color
      lctx.fillStyle = fillFridgeLook ? '#ffffff' : '#F4E4BC';
      lctx.fillRect(0, 0, 384, 192);
      const colorHex = `#${genreColor.toString(16).padStart(6, '0')}`;
      lctx.fillStyle = colorHex;
      lctx.globalAlpha = fillFridgeLook ? 0.18 : 0.42;
      lctx.fillRect(0, 0, 384, 192);
      lctx.globalAlpha = 1;

      if (!fillFridgeLook) {
        // Paper texture - noise and stains
        lctx.globalAlpha = 0.15;
        for (let i = 0; i < 200; i++) {
          lctx.fillStyle = Math.random() > 0.5 ? '#D4C4A0' : '#C4B080';
          lctx.fillRect(Math.random() * 384, Math.random() * 192, Math.random() * 8 + 2, Math.random() * 4 + 1);
        }
        // Coffee stains
        lctx.globalAlpha = 0.08;
        for (let i = 0; i < 3; i++) {
          lctx.fillStyle = '#A08060';
          lctx.beginPath();
          lctx.arc(Math.random() * 300 + 40, Math.random() * 120 + 30, Math.random() * 25 + 15, 0, Math.PI * 2);
          lctx.fill();
        }
        lctx.globalAlpha = 1;
      }

      if (!fillFridgeLook) {
        // Aged edges - darker border
        const edgeGrad = lctx.createLinearGradient(0, 0, 0, 192);
        edgeGrad.addColorStop(0, 'rgba(139, 107, 80, 0.4)');
        edgeGrad.addColorStop(0.1, 'rgba(139, 107, 80, 0)');
        edgeGrad.addColorStop(0.9, 'rgba(139, 107, 80, 0)');
        edgeGrad.addColorStop(1, 'rgba(100, 70, 40, 0.5)');
        lctx.fillStyle = edgeGrad;
        lctx.fillRect(0, 0, 384, 192);
      }

      // Genre color bar at top: clear and readable so "same color" is obvious
      lctx.fillStyle = colorHex;
      lctx.fillRect(8, 8, 368, 38);
      // Stronger border for better contrast
      lctx.strokeStyle = fillFridgeLook ? 'rgba(29, 78, 216, 0.35)' : 'rgba(0,0,0,0.35)';
      lctx.lineWidth = 2;
      lctx.strokeRect(8, 8, 368, 38);

      // Add pattern indicators for colorblind accessibility
      // Different pattern for each genre
      lctx.globalAlpha = 0.25;
      lctx.strokeStyle = '#ffffff';
      lctx.lineWidth = 3;
      // Pattern based on column index (different for each genre)
      if (col === 0 || col === 5) {
        // ROCK: Horizontal lines
        for (let py = 12; py < 42; py += 8) {
          lctx.beginPath();
          lctx.moveTo(20, py);
          lctx.lineTo(50, py);
          lctx.stroke();
        }
      } else if (col === 1 || col === 6) {
        // JAZZ: Diagonal lines
        for (let px = 20; px < 50; px += 8) {
          lctx.beginPath();
          lctx.moveTo(px, 12);
          lctx.lineTo(px + 20, 42);
          lctx.stroke();
        }
      } else if (col === 2 || col === 7) {
        // POP: Dots
        for (let px = 20; px < 50; px += 10) {
          for (let py = 15; py < 40; py += 10) {
            lctx.beginPath();
            lctx.arc(px, py, 2, 0, Math.PI * 2);
            lctx.fill();
          }
        }
      } else if (col === 3) {
        // HIP-HOP: Grid pattern
        lctx.beginPath();
        lctx.rect(20, 15, 30, 25);
        lctx.stroke();
        lctx.beginPath();
        lctx.moveTo(35, 15);
        lctx.lineTo(35, 40);
        lctx.moveTo(20, 27);
        lctx.lineTo(50, 27);
        lctx.stroke();
      } else if (col === 4) {
        // CLASSICA: Wave pattern
        lctx.beginPath();
        lctx.moveTo(20, 27);
        lctx.quadraticCurveTo(30, 15, 40, 27);
        lctx.quadraticCurveTo(50, 39, 60, 27);
        lctx.stroke();
      }
      lctx.globalAlpha = 1;

      // Genre text - typewriter/letterpress style with enhanced contrast
      // Strong white outline for maximum readability (WCAG AAA)
      lctx.font = fillFridgeLook
        ? '800 52px "Manrope", "Arial", sans-serif'
        : 'bold 52px "Courier New", Courier, monospace';
      lctx.textAlign = 'center';
      lctx.textBaseline = 'middle';
      lctx.lineWidth = 6;
      lctx.strokeStyle = '#ffffff';
      lctx.strokeText(genreLabel, 192, 110);

      // Dark shadow for depth
      lctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      lctx.shadowBlur = 3;
      lctx.shadowOffsetX = 2;
      lctx.shadowOffsetY = 2;
      lctx.fillStyle = fillFridgeLook ? '#0f172a' : '#1A0F08';
      lctx.fillText(genreLabel, 192, 110);

      if (!fillFridgeLook) {
        // Letterpress effect - slightly offset highlight
        lctx.shadowColor = 'transparent';
        lctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        lctx.fillText(genreLabel, 191, 109);

        // Corner wear/tears
        lctx.fillStyle = '#E8D8B8';
        lctx.beginPath();
        lctx.moveTo(0, 0);
        lctx.lineTo(20, 0);
        lctx.lineTo(0, 15);
        lctx.fill();
        lctx.beginPath();
        lctx.moveTo(384, 192);
        lctx.lineTo(364, 192);
        lctx.lineTo(384, 177);
        lctx.fill();

        // Pin hole effect at top
        lctx.fillStyle = '#8B7355';
        lctx.beginPath();
        lctx.arc(192, 8, 3, 0, Math.PI * 2);
        lctx.fill();
      }

      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      const labelGeo = new THREE.PlaneGeometry(slotWidth * 0.9, 0.36);
      const labelMat = new THREE.MeshBasicMaterial({
        map: labelTexture,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      });
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.position.set(x, y, 0.15);
      labelMesh.name = `genre-label-${col}`;
      this.shelfGroup.add(labelMesh);

      // Small brass bracket holding the label
      const bracketGeo = new THREE.BoxGeometry(slotWidth * 0.12, 0.02, 0.03);
      const bracketMat = new THREE.MeshStandardMaterial({
        color: 0xB8860B,
        roughness: 0.3,
        metalness: 0.7,
      });
      const leftBracket = new THREE.Mesh(bracketGeo, bracketMat);
      leftBracket.position.set(x - slotWidth * 0.35, y - 0.16, 0.16);
      this.shelfGroup.add(leftBracket);
      const rightBracket = new THREE.Mesh(bracketGeo, bracketMat);
      rightBracket.position.set(x + slotWidth * 0.35, y - 0.16, 0.16);
      this.shelfGroup.add(rightBracket);
    }

    // No store sign - using top UI bar instead for cleaner look
    this.createDropColumnGuide(shelfHeight);
    this.createTargetColumnGuide(shelfHeight);
  }

  private createMinimalEnvironmentDetails(shelfWidth: number, shelfHeight: number): void {
    const leftPoster = new THREE.Mesh(
      new THREE.PlaneGeometry(0.52, 0.76),
      new THREE.MeshStandardMaterial({
        color: 0xdff3ff,
        transparent: true,
        opacity: 0.58,
        roughness: 0.9,
        metalness: 0.0,
      })
    );
    leftPoster.position.set(-shelfWidth / 2 - 1.1, shelfHeight / 2 - 0.25, -0.34);
    leftPoster.name = 'minimal-poster-left';
    this.shelfGroup.add(leftPoster);

    const rightPoster = new THREE.Mesh(
      new THREE.PlaneGeometry(0.52, 0.76),
      new THREE.MeshStandardMaterial({
        color: 0xffe8da,
        transparent: true,
        opacity: 0.58,
        roughness: 0.9,
        metalness: 0.0,
      })
    );
    rightPoster.position.set(shelfWidth / 2 + 1.1, shelfHeight / 2 - 0.25, -0.34);
    rightPoster.name = 'minimal-poster-right';
    this.shelfGroup.add(rightPoster);

    const floorShadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.9, 48),
      new THREE.MeshBasicMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.05,
        depthWrite: false,
      })
    );
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.set(0, -shelfHeight / 2 - 1.12, 0.95);
    floorShadow.name = 'minimal-floor-shadow';
    this.shelfGroup.add(floorShadow);
  }

  private createEnvironmentDetails(shelfWidth: number, shelfHeight: number): void {
    // ── Poster 1: left side, editorial pastel card
    const posterCanvas1 = document.createElement('canvas');
    posterCanvas1.width = 256;
    posterCanvas1.height = 384;
    const pctx1 = posterCanvas1.getContext('2d')!;

    pctx1.fillStyle = '#e3f3fb';
    pctx1.fillRect(0, 0, 256, 384);

    pctx1.strokeStyle = '#2f9dc9';
    pctx1.lineWidth = 12;
    pctx1.globalAlpha = 0.46;
    pctx1.beginPath();
    pctx1.moveTo(62, 98);
    pctx1.bezierCurveTo(130, 145, 108, 215, 178, 282);
    pctx1.stroke();
    pctx1.globalAlpha = 1.0;

    const posterTexture1 = new THREE.CanvasTexture(posterCanvas1);
    const poster1Geo = new THREE.PlaneGeometry(0.45, 0.68);
    const poster1Mat = new THREE.MeshStandardMaterial({
      map: posterTexture1,
      transparent: true,
      opacity: 0.28,
      roughness: 0.9,
      metalness: 0.0,
    });
    const poster1 = new THREE.Mesh(poster1Geo, poster1Mat);
    poster1.position.set(-shelfWidth / 2 - 1.2, shelfHeight / 2 - 0.4, -0.35);
    poster1.name = 'poster-jazz';
    this.shelfGroup.add(poster1);
    this.loadTextureIntoMaterial(poster1Mat, [AI_LOCAL_POSTER_JAZZ_URL, AI_REF_SCENE_URL]);

    // ── Poster 2: right side, geometric pop
    const posterCanvas2 = document.createElement('canvas');
    posterCanvas2.width = 256;
    posterCanvas2.height = 384;
    const pctx2 = posterCanvas2.getContext('2d')!;

    pctx2.fillStyle = '#ffe7d8';
    pctx2.fillRect(0, 0, 256, 384);

    pctx2.fillStyle = '#e16d45';
    pctx2.globalAlpha = 0.58;
    pctx2.beginPath();
    pctx2.moveTo(66, 252);
    pctx2.lineTo(128, 106);
    pctx2.lineTo(168, 172);
    pctx2.lineTo(196, 124);
    pctx2.lineTo(206, 292);
    pctx2.lineTo(148, 224);
    pctx2.lineTo(126, 288);
    pctx2.closePath();
    pctx2.fill();
    pctx2.globalAlpha = 1.0;

    const posterTexture2 = new THREE.CanvasTexture(posterCanvas2);
    const poster2Geo = new THREE.PlaneGeometry(0.45, 0.68);
    const poster2Mat = new THREE.MeshStandardMaterial({
      map: posterTexture2,
      transparent: true,
      opacity: 0.26,
      roughness: 0.9,
      metalness: 0.0,
    });
    const poster2 = new THREE.Mesh(poster2Geo, poster2Mat);
    poster2.position.set(shelfWidth / 2 + 1.1, shelfHeight / 2 - 0.6, -0.35);
    poster2.name = 'poster-rock';
    this.shelfGroup.add(poster2);
    this.loadTextureIntoMaterial(poster2Mat, [AI_LOCAL_POSTER_ROCK_URL, AI_REF_SHELF_URL]);

    // ── Speaker 1: matte light enclosure
    const speaker1Geo = new THREE.BoxGeometry(0.35, 0.5, 0.3);
    const speaker1Mat = new THREE.MeshStandardMaterial({
      color: 0xd5d9df,
      roughness: 0.66,
      metalness: 0.14,
    });
    const speaker1 = new THREE.Mesh(speaker1Geo, speaker1Mat);
    speaker1.position.set(-shelfWidth / 2 - 0.5, -shelfHeight / 2 + 0.25, 0.15);
    speaker1.castShadow = true;
    speaker1.receiveShadow = true;
    speaker1.name = 'speaker-left';
    this.shelfGroup.add(speaker1);

    // Speaker detail (mesh grille)
    const grille1Geo = new THREE.PlaneGeometry(0.25, 0.35);
    const grille1Mat = new THREE.MeshStandardMaterial({
      color: 0x8c929b,
      roughness: 0.45,
      metalness: 0.2,
      transparent: true,
      opacity: 0.82,
    });
    const grille1 = new THREE.Mesh(grille1Geo, grille1Mat);
    grille1.position.set(-shelfWidth / 2 - 0.5, -shelfHeight / 2 + 0.25, 0.31);
    grille1.name = 'grille-left';
    this.shelfGroup.add(grille1);

    // Accent ring per look hi-fi contemporaneo
    const ringGeo = new THREE.TorusGeometry(0.11, 0.01, 12, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd48a54,
      roughness: 0.34,
      metalness: 0.72,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.position.set(-shelfWidth / 2 - 0.5, -shelfHeight / 2 + 0.25, 0.318);
    ring1.name = 'speaker-ring-left';
    this.shelfGroup.add(ring1);

    // ── Speaker 2: Right corner
    const speaker2 = speaker1.clone();
    speaker2.position.set(shelfWidth / 2 + 0.5, -shelfHeight / 2 + 0.25, 0.15);
    speaker2.name = 'speaker-right';
    this.shelfGroup.add(speaker2);

    const grille2 = grille1.clone();
    grille2.position.set(shelfWidth / 2 + 0.5, -shelfHeight / 2 + 0.25, 0.31);
    grille2.name = 'grille-right';
    this.shelfGroup.add(grille2);

    const ring2 = ring1.clone();
    ring2.position.set(shelfWidth / 2 + 0.5, -shelfHeight / 2 + 0.25, 0.318);
    ring2.name = 'speaker-ring-right';
    this.shelfGroup.add(ring2);

    // ── Ambient sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sctx = signCanvas.getContext('2d')!;

    sctx.shadowColor = '#ff7d4c';
    sctx.shadowBlur = 16;
    sctx.fillStyle = '#ff7d4c';
    sctx.font = 'bold 80px Arial';
    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    sctx.fillText('SLEEVO FM', 256, 64);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signGeo = new THREE.PlaneGeometry(1.2, 0.3);
    const signMat = new THREE.MeshBasicMaterial({
      map: signTexture,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });
    const openSign = new THREE.Mesh(signGeo, signMat);
    openSign.position.set(0, shelfHeight / 2 + 0.9, -0.25);
    openSign.name = 'open-sign';
    this.shelfGroup.add(openSign);

    // Subtle pulsing animation for sign
    let signTime = 0;
    const animateSign = () => {
      signTime += 0.018;
      openSign.material.opacity = 0.2 + Math.sin(signTime) * 0.04;
      if (openSign.parent) {
        requestAnimationFrame(animateSign);
      }
    };
    animateSign();

    // ── Vinyl stack (left side)
    const stackColors = [0xec4899, 0xa78bfa, 0x2563eb, 0xf97316, 0xd7263d, 0x22c55e];
    const stackSize = 0.28;
    const stackCount = 6;

    for (let i = 0; i < stackCount; i++) {
      const stackBoxGeo = new THREE.BoxGeometry(stackSize, stackSize * 0.05, stackSize);
      const stackBoxMat = new THREE.MeshStandardMaterial({
        color: stackColors[i % stackColors.length],
        roughness: 0.62,
        metalness: 0.0,
        transparent: true,
        opacity: 0.64,
      });
      const stackBox = new THREE.Mesh(stackBoxGeo, stackBoxMat);
      stackBox.position.set(
        -shelfWidth / 2 - 0.8,
        -shelfHeight / 2 + 0.1 + i * stackSize * 0.05,
        -0.1
      );
      stackBox.rotation.y = (Math.random() - 0.5) * 0.15;
      stackBox.castShadow = true;
      stackBox.receiveShadow = true;
      stackBox.name = `vinyl-stack-${i}`;
      this.shelfGroup.add(stackBox);
    }

    // ── Decorative Plant (simple version - right side, near carousel area)
    const plantX = shelfWidth / 2 + 1.8;  // Right side
    const plantY = -1.0;                   // Ground level (hardcoded to match carousel)
    const plantZ = 1.2;                    // Near carousel, visible

    // Terracotta pot (cylinder)
    const potGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.22, 16);
    const potMat = new THREE.MeshStandardMaterial({
      color: 0xC4713F,  // Terracotta
      roughness: 0.8,
      metalness: 0.0,
    });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.set(plantX, plantY, plantZ);
    pot.castShadow = true;
    pot.receiveShadow = true;
    pot.name = 'plant-pot';
    this.shelfGroup.add(pot);

    // Leaves using cones (simple and always visible)
    const leafColors = [0x228B22, 0x2E8B57, 0x3CB371, 0x2E7D32];
    for (let i = 0; i < 7; i++) {
      const leafGeo = new THREE.ConeGeometry(0.04, 0.35 + Math.random() * 0.15, 6);
      const leafMat = new THREE.MeshStandardMaterial({
        color: leafColors[i % leafColors.length],
        roughness: 0.7,
        metalness: 0.0,
      });
      const leaf = new THREE.Mesh(leafGeo, leafMat);

      // Cluster leaves in center of pot
      const angle = (i / 7) * Math.PI * 2;
      const radius = 0.03 + Math.random() * 0.02;
      leaf.position.set(
        plantX + Math.cos(angle) * radius,
        plantY + 0.22 + 0.15,
        plantZ + Math.sin(angle) * radius
      );
      // Tilt leaves outward slightly
      leaf.rotation.x = 0.15 + Math.random() * 0.1;
      leaf.rotation.z = Math.cos(angle) * 0.2;
      leaf.castShadow = true;
      leaf.name = `plant-leaf-${i}`;
      this.shelfGroup.add(leaf);
    }

    // ── Additional Vintage Decor ──

    // Vintage lamp (left side, near shelf)
    const lampStandGeo = new THREE.CylinderGeometry(0.03, 0.04, 1.2, 12);
    const lampStandMat = new THREE.MeshStandardMaterial({
      color: 0x4A4A4A,
      roughness: 0.4,
      metalness: 0.6,
    });
    const lampStand = new THREE.Mesh(lampStandGeo, lampStandMat);
    lampStand.position.set(-shelfWidth / 2 - 1.8, -shelfHeight / 2 + 0.6, 0.3);
    lampStand.castShadow = true;
    lampStand.name = 'lamp-stand';
    this.shelfGroup.add(lampStand);

    // Lamp shade (cone)
    const lampShadeGeo = new THREE.ConeGeometry(0.25, 0.35, 16, 1, true);
    const lampShadeMat = new THREE.MeshStandardMaterial({
      color: 0xF5E6D3,
      roughness: 0.8,
      metalness: 0.0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const lampShade = new THREE.Mesh(lampShadeGeo, lampShadeMat);
    lampShade.position.set(-shelfWidth / 2 - 1.8, -shelfHeight / 2 + 1.3, 0.3);
    lampShade.castShadow = true;
    lampShade.name = 'lamp-shade';
    this.shelfGroup.add(lampShade);

    // Warm glow from lamp
    const lampLight = new THREE.PointLight(0xFFB366, 0.45, 3.5, 1.5);
    lampLight.position.set(-shelfWidth / 2 - 1.8, -shelfHeight / 2 + 1.25, 0.3);
    lampLight.castShadow = true;
    lampLight.shadow.mapSize.width = 512;
    lampLight.shadow.mapSize.height = 512;
    lampLight.name = 'lamp-light';
    this.shelfGroup.add(lampLight);

    // Vintage record player (right side, near carousel)
    const playerBaseGeo = new THREE.BoxGeometry(0.55, 0.08, 0.45);
    const playerBaseMat = new THREE.MeshStandardMaterial({
      color: 0x654321,
      roughness: 0.65,
      metalness: 0.1,
    });
    const playerBase = new THREE.Mesh(playerBaseGeo, playerBaseMat);
    playerBase.position.set(shelfWidth / 2 + 1.5, -shelfHeight / 2 + 0.04, -0.3);
    playerBase.castShadow = true;
    playerBase.receiveShadow = true;
    playerBase.name = 'player-base';
    this.shelfGroup.add(playerBase);

    // Turntable platter
    const platterGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.03, 32);
    const platterMat = new THREE.MeshStandardMaterial({
      color: 0x2A2A2A,
      roughness: 0.3,
      metalness: 0.5,
    });
    const platter = new THREE.Mesh(platterGeo, platterMat);
    platter.position.set(shelfWidth / 2 + 1.5, -shelfHeight / 2 + 0.095, -0.3);
    platter.castShadow = true;
    platter.name = 'turntable-platter';
    this.shelfGroup.add(platter);

    // Tonearm (simple bar)
    const tonearmGeo = new THREE.BoxGeometry(0.25, 0.02, 0.02);
    const tonearmMat = new THREE.MeshStandardMaterial({
      color: 0xC0C0C0,
      roughness: 0.25,
      metalness: 0.8,
    });
    const tonearm = new THREE.Mesh(tonearmGeo, tonearmMat);
    tonearm.position.set(shelfWidth / 2 + 1.65, -shelfHeight / 2 + 0.12, -0.15);
    tonearm.rotation.z = -0.3;
    tonearm.castShadow = true;
    tonearm.name = 'tonearm';
    this.shelfGroup.add(tonearm);

    // Crate of vintage records (bottom left, floor level)
    const crateGeo = new THREE.BoxGeometry(0.45, 0.35, 0.35);
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0x8B7355,
      roughness: 0.85,
      metalness: 0.0,
    });
    const crate = new THREE.Mesh(crateGeo, crateMat);
    crate.position.set(-shelfWidth / 2 - 1.2, -shelfHeight / 2 - 0.82, 0.6);
    crate.rotation.y = 0.2;
    crate.castShadow = true;
    crate.receiveShadow = true;
    crate.name = 'crate';
    this.shelfGroup.add(crate);

    // Records peeking out of crate
    for (let i = 0; i < 5; i++) {
      const recordGeo = new THREE.BoxGeometry(0.32, 0.32, 0.008);
      const recordColors = [0xec4899, 0xa78bfa, 0x2563eb, 0xf97316, 0xd7263d];
      const recordMat = new THREE.MeshStandardMaterial({
        color: recordColors[i],
        roughness: 0.6,
        metalness: 0.0,
      });
      const record = new THREE.Mesh(recordGeo, recordMat);
      record.position.set(
        -shelfWidth / 2 - 1.2 + (Math.random() - 0.5) * 0.15,
        -shelfHeight / 2 - 0.82 + 0.18 + i * 0.04,
        0.6 + (Math.random() - 0.5) * 0.05
      );
      record.rotation.set(-0.15, 0.2 + (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.08);
      record.castShadow = true;
      record.name = `crate-record-${i}`;
      this.shelfGroup.add(record);
    }

    // Wall clock (vintage style, centered above shelf)
    const clockFaceGeo = new THREE.CircleGeometry(0.22, 32);
    const clockFaceMat = new THREE.MeshStandardMaterial({
      color: 0xF5E6D3,
      roughness: 0.7,
      metalness: 0.0,
    });
    const clockFace = new THREE.Mesh(clockFaceGeo, clockFaceMat);
    clockFace.position.set(0, shelfHeight / 2 + 1.5, -0.35);
    clockFace.name = 'clock-face';
    this.shelfGroup.add(clockFace);

    // Clock rim (brass)
    const clockRimGeo = new THREE.TorusGeometry(0.22, 0.015, 16, 32);
    const clockRimMat = new THREE.MeshStandardMaterial({
      color: 0xB8860B,
      roughness: 0.3,
      metalness: 0.75,
    });
    const clockRim = new THREE.Mesh(clockRimGeo, clockRimMat);
    clockRim.position.set(0, shelfHeight / 2 + 1.5, -0.34);
    clockRim.name = 'clock-rim';
    this.shelfGroup.add(clockRim);

    // Clock hands (simple black bars)
    const hourHandGeo = new THREE.BoxGeometry(0.12, 0.015, 0.01);
    const handMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
    const hourHand = new THREE.Mesh(hourHandGeo, handMat);
    hourHand.position.set(0, shelfHeight / 2 + 1.5, -0.33);
    hourHand.rotation.z = Math.PI / 4;
    hourHand.name = 'hour-hand';
    this.shelfGroup.add(hourHand);

    const minuteHandGeo = new THREE.BoxGeometry(0.16, 0.012, 0.01);
    const minuteHand = new THREE.Mesh(minuteHandGeo, handMat);
    minuteHand.position.set(0, shelfHeight / 2 + 1.5, -0.325);
    minuteHand.rotation.z = -Math.PI / 6;
    minuteHand.name = 'minute-hand';
    this.shelfGroup.add(minuteHand);

    // Decorative rug beneath carousel area
    const rugGeo = new THREE.PlaneGeometry(4.5, 2.8);
    const rugCanvas = document.createElement('canvas');
    rugCanvas.width = 512;
    rugCanvas.height = 512;
    const rugCtx = rugCanvas.getContext('2d')!;

    // Persian-style rug pattern
    rugCtx.fillStyle = '#8B3E2F';  // Deep rust red base
    rugCtx.fillRect(0, 0, 512, 512);

    // Border pattern
    rugCtx.strokeStyle = '#D4AF37';  // Gold
    rugCtx.lineWidth = 8;
    rugCtx.strokeRect(20, 20, 472, 472);
    rugCtx.lineWidth = 4;
    rugCtx.strokeRect(35, 35, 442, 442);

    // Central medallion
    rugCtx.fillStyle = '#654321';
    rugCtx.beginPath();
    rugCtx.ellipse(256, 256, 100, 80, 0, 0, Math.PI * 2);
    rugCtx.fill();

    rugCtx.strokeStyle = '#D4AF37';
    rugCtx.lineWidth = 3;
    rugCtx.beginPath();
    rugCtx.ellipse(256, 256, 100, 80, 0, 0, Math.PI * 2);
    rugCtx.stroke();

    // Decorative corners
    for (let i = 0; i < 4; i++) {
      rugCtx.save();
      rugCtx.translate(256, 256);
      rugCtx.rotate((i * Math.PI) / 2);
      rugCtx.fillStyle = '#D4AF37';
      rugCtx.beginPath();
      rugCtx.moveTo(120, -120);
      rugCtx.lineTo(150, -150);
      rugCtx.lineTo(140, -110);
      rugCtx.closePath();
      rugCtx.fill();
      rugCtx.restore();
    }

    const rugTexture = new THREE.CanvasTexture(rugCanvas);
    rugTexture.colorSpace = THREE.SRGBColorSpace;
    const rugMat = new THREE.MeshStandardMaterial({
      map: rugTexture,
      roughness: 0.95,
      metalness: 0.0,
    });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, -shelfHeight / 2 - 1.14, 1.5);
    rug.receiveShadow = true;
    rug.name = 'vintage-rug';
    this.shelfGroup.add(rug);

    console.log('Environment details added: 2 posters, 2 speakers, 1 sign, 6 vinyl stack boxes, 1 plant, 1 lamp, 1 turntable, 1 crate with records, 1 clock, 1 rug');
  }

  private createVinyls(vinyls: Vinyl[]): void {
    this.vinylsGroup.clear();

    // ── Carousel platform
    const barWidth = 15;
    const barHeight = 0.6;
    const barDepth = 0.5;
    const carouselBaseY = -1.42;
    const vinylBaseY = -0.86;

    const barGeometry = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
    const barMaterial = new THREE.MeshStandardMaterial({
      color: 0xeadbc8,
      roughness: 0.72,
      metalness: 0.04,
    });
    const carouselBar = new THREE.Mesh(barGeometry, barMaterial);
    carouselBar.position.set(0, carouselBaseY, 1.5);
    carouselBar.name = 'carousel-bar';
    carouselBar.castShadow = true;
    carouselBar.receiveShadow = true;
    this.vinylsGroup.add(carouselBar);
    if (!this.simplifiedDecorMode) {
      this.loadTextureIntoMaterial(barMaterial, [AI_LOCAL_COUNTER_TEXTURE_URL, AI_REF_COUNTER_URL], {
        repeat: new THREE.Vector2(1.0, 1.0),
        offset: new THREE.Vector2(0.0, 0.0),
      });
    }

    // Top edge accent
    const accentGeometry = new THREE.BoxGeometry(barWidth, 0.03, barDepth + 0.02);
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0xffb07f,
      roughness: 0.4,
      metalness: 0.0,
    });
    const accent = new THREE.Mesh(accentGeometry, accentMaterial);
    accent.position.set(0, carouselBaseY + barHeight / 2 + 0.015, 1.5);
    accent.castShadow = true;
    this.vinylsGroup.add(accent);

    // Slim front glow line
    const glowLineGeo = new THREE.BoxGeometry(barWidth - 0.1, 0.02, 0.02);
    const glowLineMat = new THREE.MeshBasicMaterial({
      color: 0xff8357,
      transparent: true,
      opacity: 0.7,
    });
    const glowLine = new THREE.Mesh(glowLineGeo, glowLineMat);
    glowLine.position.set(0, carouselBaseY + barHeight / 2 - 0.02, 1.5 + barDepth / 2 + 0.012);
    glowLine.name = 'carousel-glow-line';
    this.vinylsGroup.add(glowLine);

    if (this.aiPhotoDecalsEnabled) {
      // AI decal opzionale sul fronte bancone
      const counterDecalGeo = new THREE.PlaneGeometry(barWidth - 0.25, barHeight - 0.08);
      const counterDecalMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      });
      const counterDecal = new THREE.Mesh(counterDecalGeo, counterDecalMat);
      counterDecal.position.set(0, carouselBaseY, 1.5 + barDepth / 2 + 0.011);
      counterDecal.name = 'ai-counter-decal';
      this.vinylsGroup.add(counterDecal);
      this.loadTextureIntoMaterial(counterDecalMat, AI_REF_COUNTER_URL, {
        repeat: new THREE.Vector2(1.25, 1.0),
        offset: new THREE.Vector2(-0.08, 0.0),
      });
    }

    // ── Vinyl records in carousel
    const spacing = 1.45;
    vinyls.forEach((vinyl, index) => {
      const vinylMesh = this.createVinylMesh(vinyl);
      vinylMesh.userData = {
        vinyl,
        carouselIndex: index,
        originalX: (index - vinyls.length / 2) * spacing,
        vinylBaseY,
      };
      vinylMesh.name = `vinyl-${vinyl.id}`;

      vinylMesh.position.set(
        (index - vinyls.length / 2) * spacing,
        vinylBaseY,
        1.48
      );

      vinylMesh.scale.set(1.32, 1.32, 1.32);
      vinylMesh.rotation.set(0, 0, 0);

      this.vinylsGroup.add(vinylMesh);
    });

    // Subtle hint arrow
    const arrowGeometry = new THREE.ConeGeometry(0.08, 0.25, 8);
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6c3f,
      transparent: true,
      opacity: 0.62,
    });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.set(0, 0.3, 1.5);
    arrow.rotation.x = Math.PI;
    arrow.name = 'hint-arrow';
    this.vinylsGroup.add(arrow);

    let time = 0;
    const animateArrow = () => {
      time += 0.04;
      arrow.position.y = 0.24 + Math.sin(time) * 0.07;
      arrow.material.opacity = 0.45 + Math.sin(time * 0.5) * 0.14;
      if (arrow.parent) {
        requestAnimationFrame(animateArrow);
      }
    };
    animateArrow();

    console.log('Total vinyls created:', vinyls.length);
  }

  // Fake album/artist names for procedural generation
  private getAlbumData(genre: string): { title: string; artist: string } {
    const albumNames: Record<string, string[]> = {
      'Rock': ['THUNDER ROAD', 'MIDNIGHT ECHO', 'STEEL & STONE', 'WILD HORSES', 'BLACK DIAMOND'],
      'Jazz': ['BLUE MOOD', 'NIGHT FLIGHT', 'SMOKE & MIRRORS', 'CROSSWINDS', 'LATE SET'],
      'Folk': ['WOODEN HEARTS', 'RIVER SONG', 'MOUNTAIN AIR', 'AUTUMN LEAVES', 'HOMECOMING'],
      'Blues': ['CROSSROADS', 'MIDNIGHT TRAIN', 'DIRTY WATER', 'STEEL GUITAR', 'DELTA DUST'],
      'Funk': ['GROOVE MACHINE', 'FUNKY TOWN', 'DANCE FLOOR', 'SUPER BAD', 'GIVE IT UP'],
      'Soul': ['SWEET DREAMS', 'HEART OF GOLD', 'MIDNIGHT LOVE', 'SOUL POWER', 'HEAVEN SENT'],
      'Pop': ['SUNSHINE', 'RADIO HITS', 'NEON LIGHTS', 'DANCE ALL NIGHT', 'SUMMER VIBES'],
      'Electronic': ['DIGITAL DREAMS', 'CIRCUIT BREAKER', 'NEON PULSE', 'FREQUENCY', 'SYNTHWAVE'],
      'Classical': ['MOONLIGHT', 'SYMPHONY', 'REVERIE', 'NOCTURNE', 'SERENADE'],
      'HipHop': ['STREET DREAMS', 'URBAN LEGEND', 'MIC CHECK', 'DROP THE BEAT', 'FRESH PRINCE'],
    };
    const artistNames: Record<string, string[]> = {
      'Rock': ['THE STORM', 'IRON HORSE', 'BLACK WOLF', 'THUNDERHEAD', 'STEEL DRIVERS'],
      'Jazz': ['BLUE NOTE', 'MIDNIGHT QUINTET', 'SMOKE DETECTIVE', 'THE COOL SCHOOL', 'NIGHT OWL'],
      'Folk': ['THE WANDERERS', 'WOODSY', 'RIVER BAND', 'MOUNTAIN MEN', 'PINE TREE'],
      'Blues': ['BIG JOE', 'SLIDE GUITAR BOB', 'THE DEVIL', 'MISSISSIPPI JOHN', 'BLIND LEMON'],
      'Funk': ['THE FUNK BROTHERS', 'GROOVE MASTERS', 'JAMES & THE BAND', 'PARLIAMENT', 'SLY STONE'],
      'Soul': ['THE SOUL CHILDREN', 'DREAM GIRLS', 'MOTOWN MAGIC', 'THE TEMPTATIONS', 'SUPREMES'],
      'Pop': ['THE STARS', 'SUNSHINE BAND', 'RADIO KINGS', 'CHART TOPPERS', 'HIT MAKERS'],
      'Electronic': ['KRAFTWERK', 'DIGITAL PIONEERS', 'SYNTH LORDS', 'CIRCUIT MASTERS', 'NEON RIDERS'],
      'Classical': ['VIENNA ENSEMBLE', 'LONDON SYMPHONY', 'ROYAL PHILHARMONIC', 'BERLIN ORCHESTRA', 'MOSCOW CHAMBER'],
      'HipHop': ['THE BEAT MAKERS', 'STREET POETS', 'URBAN SOUNDS', 'BLOCK PARTY', 'MIC MASTERS'],
    };

    const titles = albumNames[genre] || albumNames['Rock'];
    const artists = artistNames[genre] || artistNames['Rock'];
    const idx = Math.floor(Math.random() * titles.length);
    return { title: titles[idx], artist: artists[idx] };
  }

  // Apply vintage paper texture effect
  private applyVintageTexture(ctx: CanvasRenderingContext2D, size: number): void {
    // Paper grain
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const brightness = Math.random() * 50 + 100;
      ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // Coffee/age stains
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#8B7355';
      ctx.beginPath();
      ctx.arc(
        Math.random() * size,
        Math.random() * size,
        Math.random() * 80 + 40,
        0, Math.PI * 2
      );
      ctx.fill();
    }

    // Edge wear
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, size - 20, size - 20);

    // Corner creases
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(60, 0);
    ctx.lineTo(0, 60);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(size, size);
    ctx.lineTo(size - 60, size);
    ctx.lineTo(size, size - 60);
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  private drawAlbumArt(
    ctx: CanvasRenderingContext2D,
    genre: string,
    baseColor: THREE.Color,
    useVintageEffects: boolean = true
  ): void {
    const size = 1024;  // Higher resolution
    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);
    const lightColor = `hsl(${hsl.h * 360}, ${Math.min(hsl.s * 100 + 15, 100)}%, ${Math.min(hsl.l * 100 + 30, 90)}%)`;
    const darkColor = `hsl(${hsl.h * 360}, ${hsl.s * 100}%, ${Math.max(hsl.l * 100 - 30, 10)}%)`;
    const accentColor = `hsl(${(hsl.h * 360 + 30) % 360}, ${hsl.s * 100}%, ${hsl.l * 100}%)`;

    // Get album data
    const album = this.getAlbumData(genre);

    // Background fill
    ctx.fillStyle = baseColor.getStyle();
    ctx.fillRect(0, 0, size, size);

    switch (genre) {
      case 'Rock': {
        // Bold angular design - think classic rock posters
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.moveTo(0, size);
        ctx.lineTo(size * 0.6, 0);
        ctx.lineTo(size, 0);
        ctx.lineTo(size, size * 0.7);
        ctx.lineTo(size * 0.4, size);
        ctx.closePath();
        ctx.fill();

        // Lightning bolt
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        ctx.moveTo(size * 0.55, size * 0.1);
        ctx.lineTo(size * 0.4, size * 0.45);
        ctx.lineTo(size * 0.55, size * 0.45);
        ctx.lineTo(size * 0.45, size * 0.9);
        ctx.lineTo(size * 0.7, size * 0.5);
        ctx.lineTo(size * 0.55, size * 0.5);
        ctx.closePath();
        ctx.fill();

        // Star accent
        ctx.fillStyle = '#FFD700';
        this.drawStar(ctx, size * 0.8, size * 0.2, 30, 5);
        break;
      }

      case 'Jazz': {
        // Elegant curved lines - Blue Note style
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, darkColor);
        gradient.addColorStop(1, lightColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Smoky curves
        for (let i = 0; i < 8; i++) {
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
          ctx.lineWidth = 20 + i * 8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-50, size * 0.1 * i + 80);
          ctx.bezierCurveTo(size * 0.25, size * 0.1 * i - 100, size * 0.75, size * 0.1 * i + 150, size + 50, size * 0.1 * i + 40);
          ctx.stroke();
        }

        // Center circle (like a record)
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        for (let r = 50; r < 200; r += 10) {
          ctx.beginPath();
          ctx.arc(size * 0.5, size * 0.5, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }

      case 'Folk': {
        // Organic, nature-inspired - concentric rings like tree rings
        for (let i = 12; i >= 0; i--) {
          ctx.globalAlpha = 0.3 + (i / 12) * 0.7;
          ctx.fillStyle = i % 2 === 0 ? lightColor : darkColor;
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, (size / 2.1) * (i / 12), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Leaf/nature accent
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.ellipse(size * 0.75, size * 0.25, 50, 80, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'Blues': {
        // Moody gradient with guitar strings
        const grad = ctx.createLinearGradient(0, 0, 0, size);
        grad.addColorStop(0, darkColor);
        grad.addColorStop(0.5, baseColor.getStyle());
        grad.addColorStop(1, lightColor);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        // Guitar strings effect
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.moveTo(100 + i * 40, 0);
          ctx.lineTo(100 + i * 40 + 50, size);
          ctx.stroke();
        }

        // Crossroads symbol
        ctx.strokeStyle = lightColor;
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.moveTo(size * 0.3, size * 0.5);
        ctx.lineTo(size * 0.7, size * 0.5);
        ctx.moveTo(size * 0.5, size * 0.3);
        ctx.lineTo(size * 0.5, size * 0.7);
        ctx.stroke();
        break;
      }

      case 'Funk': {
        // Groovy starburst pattern
        ctx.fillStyle = darkColor;
        ctx.fillRect(0, 0, size, size);

        for (let i = 0; i < 16; i++) {
          ctx.fillStyle = i % 2 === 0 ? lightColor : accentColor;
          ctx.save();
          ctx.translate(size / 2, size / 2);
          ctx.rotate((Math.PI * 2 * i) / 16);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-60, -size / 2);
          ctx.lineTo(60, -size / 2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Center circle
        ctx.fillStyle = baseColor.getStyle();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 100, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 40, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'Soul': {
        // Warm, heart-inspired design
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 50, size / 2, size / 2, size / 1.5);
        gradient.addColorStop(0, lightColor);
        gradient.addColorStop(0.5, baseColor.getStyle());
        gradient.addColorStop(1, darkColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Heart shape
        ctx.fillStyle = '#DC143C';
        ctx.beginPath();
        ctx.moveTo(size / 2, size * 0.35);
        ctx.bezierCurveTo(size * 0.35, size * 0.2, size * 0.2, size * 0.4, size / 2, size * 0.65);
        ctx.bezierCurveTo(size * 0.8, size * 0.4, size * 0.65, size * 0.2, size / 2, size * 0.35);
        ctx.fill();

        // Glow effect
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      }

      case 'Pop': {
        // Bright, clean, modern
        // Diagonal split with bright colors
        ctx.fillStyle = lightColor;
        ctx.fillRect(0, 0, size / 2, size);
        ctx.fillStyle = accentColor;
        ctx.fillRect(size / 2, 0, size / 2, size);

        // Circles pattern
        ctx.fillStyle = baseColor.getStyle();
        ctx.globalAlpha = 0.8;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(size * 0.3, size * (0.2 + i * 0.15), 40 + i * 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(size * 0.7, size * (0.8 - i * 0.15), 40 + i * 10, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        break;
      }

      case 'Electronic': {
        // Geometric, futuristic
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, size, size);

        // Grid lines
        ctx.strokeStyle = baseColor.getStyle();
        ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
          ctx.beginPath();
          ctx.moveTo(0, i * size / 10);
          ctx.lineTo(size, i * size / 10);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(i * size / 10, 0);
          ctx.lineTo(i * size / 10, size);
          ctx.stroke();
        }

        // Neon shapes
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = lightColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(size * 0.2, size * 0.8);
        ctx.lineTo(size * 0.4, size * 0.2);
        ctx.lineTo(size * 0.8, size * 0.4);
        ctx.lineTo(size * 0.6, size * 0.8);
        ctx.closePath();
        ctx.stroke();
        ctx.shadowBlur = 0;
        break;
      }

      case 'Classical': {
        // Elegant, minimal
        ctx.fillStyle = '#F5F5DC';  // Beige parchment
        ctx.fillRect(0, 0, size, size);

        // Ornate border
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 8;
        ctx.strokeRect(40, 40, size - 80, size - 80);
        ctx.lineWidth = 2;
        ctx.strokeRect(60, 60, size - 120, size - 120);

        // Decorative corners
        ctx.fillStyle = baseColor.getStyle();
        this.drawOrnateCorner(ctx, 80, 80, 1);
        this.drawOrnateCorner(ctx, size - 80, 80, 2);
        this.drawOrnateCorner(ctx, 80, size - 80, 3);
        this.drawOrnateCorner(ctx, size - 80, size - 80, 4);
        break;
      }

      case 'HipHop': {
        // Urban, bold typography
        ctx.fillStyle = '#2D2D2D';
        ctx.fillRect(0, 0, size, size);

        // Graffiti-style splatter
        for (let i = 0; i < 20; i++) {
          ctx.fillStyle = i % 2 === 0 ? baseColor.getStyle() : accentColor;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 60 + 20, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Chain/urban element
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(size * 0.7, size * 0.3, 60, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      default: {
        // Default abstract design
        ctx.fillStyle = lightColor;
        ctx.fillRect(0, 0, size / 2, size);
        ctx.fillStyle = darkColor;
        ctx.fillRect(size / 2, 0, size / 2, size);
      }
    }

    if (useVintageEffects) {
      this.applyVintageTexture(ctx, size);
    }

    // Typography - Album title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (useVintageEffects) {
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 80px Georgia, serif';
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 74px "Manrope", "Arial", sans-serif';
    }

    ctx.fillText(album.title, size / 2, size / 2 - 60);

    // Artist name (smaller)
    ctx.font = useVintageEffects
      ? 'italic 48px Georgia, serif'
      : '700 40px "Manrope", "Arial", sans-serif';
    ctx.fillStyle = useVintageEffects ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.85)';
    ctx.fillText(album.artist, size / 2, size / 2 + 40);

    ctx.restore();

    // Year at bottom
    ctx.fillStyle = useVintageEffects ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.78)';
    ctx.font = useVintageEffects ? '32px Arial, sans-serif' : '700 28px "Manrope", "Arial", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('— ' + (1970 + Math.floor(Math.random() * 30)) + ' —', size / 2, size - 60);

    // Small record label logo
    ctx.fillStyle = useVintageEffects ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.65)';
    ctx.font = useVintageEffects ? 'italic 24px Georgia, serif' : '600 22px "Manrope", "Arial", sans-serif';
    ctx.fillText('SLEEVO RECORDS', size / 2, size - 25);
  }

  // Helper: Draw star shape
  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, points: number): void {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : radius * 0.5;
      const angle = (Math.PI * i) / points - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Helper: Draw ornate corner for Classical
  private drawOrnateCorner(ctx: CanvasRenderingContext2D, x: number, y: number, corner: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((corner - 1) * Math.PI / 2);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-30, -30, -60, 0);
    ctx.quadraticCurveTo(-30, 30, 0, 0);
    ctx.fill();

    ctx.restore();
  }

  private createVinylMesh(vinyl: Vinyl): THREE.Group {
    const group = new THREE.Group();

    const vinylWidth = 0.35;
    const vinylHeight = 0.35;
    const vinylThickness = 0.01;
    const vinylColorObj = new THREE.Color(vinyl.color);

    // ── Cardboard sleeve
    const sleeveGeometry = new THREE.BoxGeometry(vinylWidth, vinylHeight, vinylThickness);
    const sleeveMaterial = new THREE.MeshStandardMaterial({
      color: 0xf7ecda,
      roughness: 0.78,
      metalness: 0.0,
    });
    const sleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
    sleeve.castShadow = true;
    sleeve.receiveShadow = true;
    group.add(sleeve);

    // ── Album cover art (front face)
    const coverSize = vinylWidth * 0.94;
    const coverGeometry = new THREE.PlaneGeometry(coverSize, coverSize);

    // Higher resolution for better quality
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Genre-specific artwork with professional design.
    // In modern mode we skip vintage aging/noise for cleaner output.
    this.drawAlbumArt(ctx, vinyl.genre, vinylColorObj, !this.simplifiedDecorMode);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const coverMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.62,
      metalness: 0.0,
    });
    const cover = new THREE.Mesh(coverGeometry, coverMaterial);
    cover.position.z = vinylThickness / 2 + 0.001;
    group.add(cover);

    // ── VINYL DISC (visible peeking out from sleeve)
    const discRadius = vinylWidth * 0.45;
    const discGeometry = new THREE.CircleGeometry(discRadius, 64);

    // Create vinyl disc texture with grooves and label
    const discCanvas = document.createElement('canvas');
    discCanvas.width = 512;
    discCanvas.height = 512;
    const discCtx = discCanvas.getContext('2d')!;

    // Black vinyl base
    discCtx.fillStyle = '#1a1a1a';
    discCtx.beginPath();
    discCtx.arc(256, 256, 256, 0, Math.PI * 2);
    discCtx.fill();

    // Cartoon grooves (fewer rings for cleaner 2.5D look)
    discCtx.strokeStyle = 'rgba(52,52,52,0.45)';
    for (let r = 66; r < 242; r += 14) {
      discCtx.beginPath();
      discCtx.arc(256, 256, r, 0, Math.PI * 2);
      discCtx.stroke();
    }

    // Soft highlight arc
    discCtx.strokeStyle = 'rgba(255,255,255,0.18)';
    discCtx.lineWidth = 10;
    discCtx.beginPath();
    discCtx.arc(256, 256, 176, -Math.PI * 0.36, Math.PI * 0.08);
    discCtx.stroke();

    // Center label with genre color
    discCtx.fillStyle = vinyl.color;
    discCtx.beginPath();
    discCtx.arc(256, 256, 60, 0, Math.PI * 2);
    discCtx.fill();

    // Label inner ring
    discCtx.strokeStyle = 'rgba(0,0,0,0.3)';
    discCtx.lineWidth = 2;
    discCtx.beginPath();
    discCtx.arc(256, 256, 55, 0, Math.PI * 2);
    discCtx.stroke();
    discCtx.beginPath();
    discCtx.arc(256, 256, 45, 0, Math.PI * 2);
    discCtx.stroke();

    // Center hole
    discCtx.fillStyle = '#000';
    discCtx.beginPath();
    discCtx.arc(256, 256, 8, 0, Math.PI * 2);
    discCtx.fill();

    // Label text
    discCtx.fillStyle = '#fff';
    discCtx.font = 'bold 18px Arial';
    discCtx.textAlign = 'center';
    discCtx.fillText(vinyl.genre.toUpperCase(), 256, 250);
    discCtx.font = '12px Arial';
    discCtx.fillText('SLEEVO', 256, 270);

    const discTexture = new THREE.CanvasTexture(discCanvas);
    discTexture.colorSpace = THREE.SRGBColorSpace;

    const discMaterial = new THREE.MeshStandardMaterial({
      map: discTexture,
      color: 0x161616,
      roughness: 0.34,
      metalness: 0.08,
    });
    const disc = new THREE.Mesh(discGeometry, discMaterial);
    // Position disc behind cover, peeking out from right side
    disc.position.set(vinylWidth * 0.35, 0, -vinylThickness / 2 - 0.005);
    disc.name = 'vinyl-disc';
    disc.castShadow = true;       // 🎨 ENHANCED: Enable shadow casting
    disc.receiveShadow = true;    // 🎨 ENHANCED: Receive shadows
    group.add(disc);

    // ── Protective plastic sheen
    const sheenGeometry = new THREE.PlaneGeometry(coverSize + 0.005, coverSize + 0.005);
    const sheenMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    });
    const sheen = new THREE.Mesh(sheenGeometry, sheenMaterial);
    sheen.position.z = vinylThickness / 2 + 0.003;
    sheen.name = 'sheen';
    group.add(sheen);

    // ── Touch hitbox (invisible, larger)
    const touchHelperGeometry = new THREE.BoxGeometry(
      vinylWidth * 1.5,
      vinylHeight * 1.5,
      vinylThickness * 3
    );
    const touchHelperMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.0,
      visible: false,
    });
    const touchHelper = new THREE.Mesh(touchHelperGeometry, touchHelperMaterial);
    touchHelper.name = 'touch-helper';
    group.add(touchHelper);

    return group;
  }

  public getStatus(): GameStatus {
    return this.status;
  }

  public getScore(): number {
    return this.score;
  }

  public getMoves(): number {
    return this.moves;
  }

  public getInvalidDrops(): number {
    return this.invalidDrops;
  }

  public getPlacedVinylCount(): number {
    return this.countPlacedVinyls();
  }

  public getTotalVinylCount(): number {
    return this.totalVinyls;
  }

  public getComboStreak(): number {
    return this.combo.streak;
  }

  public getComboMultiplier(): number {
    return this.combo.multiplier;
  }

  public isColumnAvailable(col: number): boolean {
    if (col < 0 || col >= this.shelfCols) return false;
    return this.grid[0]?.[col]?.vinylId === null;
  }

  public registerInvalidDrop(): void {
    if (this.status !== 'playing') return;
    this.moves += 1;
    this.invalidDrops += 1;
    this.resetCombo();
    this.recalculateScoreAndStatus();
  }

  public undo(): void {
    console.log('Undo not yet implemented');
  }

  public restart(): void {
    if (this.level) {
      this.loadLevel(this.level);
    }
  }

  private getComboTier(streak: number): { minStreak: number; multiplier: number; label: string; color: string } {
    let tier = COMBO_TIERS[0];
    for (const t of COMBO_TIERS) {
      if (streak >= t.minStreak) {
        tier = t;
      }
    }
    return tier;
  }

  private resetCombo(): void {
    this.combo.streak = 0;
    this.combo.multiplier = 1;
    this.combo.lastPlacementTime = 0;
  }

  private handleComboOnPlace(vinylId: string, col: number): number {
    const expectedCol = getColumnForVinylId(vinylId);
    const isPreciseDrop = expectedCol !== null && expectedCol === col;
    if (!isPreciseDrop) {
      this.resetCombo();
      return 0;
    }

    const now = performance.now();
    const withinWindow = (now - this.combo.lastPlacementTime) <= this.combo.comboDecayMs;
    this.combo.streak = withinWindow ? this.combo.streak + 1 : 1;
    this.combo.lastPlacementTime = now;
    this.combo.maxStreak = Math.max(this.combo.maxStreak, this.combo.streak);

    const tier = this.getComboTier(this.combo.streak);
    this.combo.multiplier = tier.multiplier;

    const basePoints = 6;
    const streakBonus = Math.min(10, this.combo.streak);
    return Math.round((basePoints + streakBonus) * this.combo.multiplier);
  }

  public update(deltaTime: number): void {
    this.idleTime += deltaTime;

    const carouselVinylCount = this.vinylsGroup.children.filter((c) => c.name.startsWith('vinyl-')).length;
    const speedMultiplier = carouselVinylCount <= 2 ? 2.6 : carouselVinylCount <= 4 ? 1.45 : 1.0;
    const scrollSpeed = 0.78 * speedMultiplier;

    const visibleXMax = 5.5;
    this.vinylsGroup.children.forEach((child) => {
      if (child.name.startsWith('vinyl-')) {
        const userData = (child.userData as any);
        if (userData.isDragging) return;

        child.position.x -= scrollSpeed * deltaTime;

        const originalX = userData.originalX;
        if (child.position.x < -9) {
          child.position.x = carouselVinylCount <= 2 ? 3.5 : originalX + 9;
        }
        if (carouselVinylCount <= 2 && child.position.x > visibleXMax) {
          child.position.x = 3.5;
        }

        // ── Carousel readability:
        // Tutti i vinili restano frontali per evitare confusione sulla regola del puzzle.
        const centerFocus = Math.max(0, 1 - Math.min(Math.abs(child.position.x) / 3.4, 1));
        const targetScale = 1.18 + centerFocus * 0.24;
        child.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);

        child.rotation.y = 0;

        const targetZ = 1.42 + centerFocus * 0.16;
        child.position.z += (targetZ - child.position.z) * 0.12;

        // ── IDLE ANIMATION: Micro-oscillazione verticale + sheen opacity
        const carouselIndex = userData.carouselIndex || 0;
        const offset = carouselIndex * 0.7;
        const oscillation = Math.sin(this.idleTime * 2.0 + offset) * 0.012;
        const baseY = typeof userData.vinylBaseY === 'number' ? userData.vinylBaseY : -0.86;
        child.position.y = baseY + oscillation;

        // Animate sheen opacity
        const sheen = child.children.find((c) => c.name === 'sheen');
        if (sheen && (sheen as THREE.Mesh).material) {
          const mat = (sheen as THREE.Mesh).material as THREE.Material & { opacity?: number };
          if (typeof mat.opacity === 'number') {
            mat.opacity = 0.08 + Math.sin(this.idleTime * 1.5 + offset) * 0.03;
          }
        }
      }
    });

    if (this.targetColumnGuide?.visible) {
      const material = this.targetColumnGuide.material as THREE.MeshBasicMaterial;
      // VINTAGE: Slower, warmer pulsing like a lantern glow
      material.opacity = 0.28 + (Math.sin(this.idleTime * 3.2) * 0.12);
    }

    // Update genre panel visual states with breathing animations
    this.updatePanelStates();
  }

  public placeVinylOnShelf(vinyl: THREE.Object3D, _row: number, col: number): void {
    const actualRow = 0;
    if (this.singleSlotPerColumn && !this.isColumnAvailable(col)) {
      console.warn(`Attempted to place into occupied column ${col}.`);
      return;
    }

    this.vinylsGroup.remove(vinyl);
    this.shelfGroup.add(vinyl);

    const cellCenter = this.getShelfCellCenter(actualRow, col);
    const colCenter = (this.shelfCols - 1) / 2;
    const baseRoll = col <= colCenter ? -0.015 : 0.015;
    const rollVariation = ((col % 3) === 0 ? 0.01 : (col % 3) === 1 ? -0.009 : 0.004);
    const roll = baseRoll + rollVariation;

    vinyl.position.set(
      cellCenter.x,
      cellCenter.y,
      0.19
    );
    vinyl.rotation.set(-0.055, -0.5, roll);
    vinyl.scale.set(1.02, 1.02, 1.02);

    this.enhanceVinylMaterialsOnShelf(vinyl);

    const vinylId = vinyl.name.replace('vinyl-', '');
    this.grid[actualRow][col].vinylId = vinylId;
    this.moves += 1;

    // Handle combo system
    const pointsEarned = this.handleComboOnPlace(vinylId, col);
    this.comboBonusScore += pointsEarned;

    (vinyl.userData as any).shelfRow = actualRow;
    (vinyl.userData as any).shelfCol = col;
    (vinyl.userData as any).isPlaced = true;
    (vinyl.userData as any).isDragging = false;

    // Recalculate after marking the vinyl as placed, otherwise completion can lag by one move.
    this.recalculateScoreAndStatus();

    console.log(`Vinyl ${vinylId} placed at col=${col} (display-front mode)`);
  }

  /** Slight material tweak so vinyls on shelf read better (cover and sheen). */
  private enhanceVinylMaterialsOnShelf(vinyl: THREE.Object3D): void {
    vinyl.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = (child as THREE.Mesh).material as THREE.Material & { opacity?: number; color?: THREE.Color };
      if (!mat) return;
      if (child.name === 'sheen' && typeof mat.opacity === 'number') {
        mat.opacity = 0.12;
      }
      if (child.name === 'vinyl-disc' && mat.color) {
        mat.color.offsetHSL(0, 0, -0.01);
      }
    });
  }

  public ensureSpineVisible(vinyl: THREE.Object3D): void {
    // Check if spine already exists
    const existingSpine = vinyl.getObjectByName('shelf-spine');
    if (existingSpine) return;

    const vinylData = (vinyl.userData as any)?.vinyl;
    if (!vinylData) return;

    const vinylWidth = 0.35;
    const vinylHeight = 0.35;
    const vinylColor = new THREE.Color(vinylData.color || '#666666');

    // Enhanced spine: taller canvas with mini cover art + genre text
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 768;
    const ctx = canvas.getContext('2d')!;

    // Background gradient (richer, deeper)
    const hsl = { h: 0, s: 0, l: 0 };
    vinylColor.getHSL(hsl);
    const gradient = ctx.createLinearGradient(0, 0, 0, 768);
    gradient.addColorStop(0, `hsl(${hsl.h * 360}, ${Math.min(hsl.s * 100 + 15, 100)}%, ${Math.min(hsl.l * 100 + 20, 80)}%)`);
    gradient.addColorStop(0.5, `hsl(${hsl.h * 360}, ${hsl.s * 100}%, ${hsl.l * 100}%)`);
    gradient.addColorStop(1, `hsl(${hsl.h * 360}, ${Math.min(hsl.s * 100 + 5, 100)}%, ${Math.max(hsl.l * 100 - 20, 12)}%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 768);

    // Subtle edge highlight (left and right borders)
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(0, 0, 3, 768);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(253, 0, 3, 768);

    // ── Mini cover art (top portion of spine)
    // Clone the cover art from the vinyl's existing cover texture
    const coverChild = vinyl.children.find(c => {
      const mat = (c as THREE.Mesh).material as THREE.Material & { map?: THREE.Texture | null };
      return mat?.map && c !== vinyl.children[0]; // Skip the sleeve, get the cover
    }) as THREE.Mesh | undefined;

    if (coverChild) {
      const coverMat = coverChild.material as THREE.Material & { map?: THREE.Texture | null };
      if (coverMat.map?.image) {
        // Draw mini cover art centered at top of spine
        const miniSize = 200;
        const miniX = (256 - miniSize) / 2;
        const miniY = 40;
        // White border for the mini cover
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(miniX - 4, miniY - 4, miniSize + 8, miniSize + 8);
        try {
          ctx.drawImage(coverMat.map.image as CanvasImageSource, miniX, miniY, miniSize, miniSize);
        } catch (_e) {
          // Fallback: colored square
          ctx.fillStyle = `hsl(${hsl.h * 360}, ${hsl.s * 100}%, ${Math.min(hsl.l * 100 + 25, 75)}%)`;
          ctx.fillRect(miniX, miniY, miniSize, miniSize);
        }
      }
    }

    // ── Genre text (below mini cover, horizontal - reads when spine faces you)
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.font = 'bold 42px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(vinylData.genre?.toUpperCase() || 'VINYL', 128, 280);

    // Artist / Title
    ctx.shadowBlur = 3;
    ctx.font = '24px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const title = vinylData.title || vinylData.name || '';
    if (title) {
      // Truncate long titles
      const displayTitle = title.length > 18 ? title.substring(0, 16) + '…' : title;
      ctx.fillText(displayTitle, 128, 340);
    }

    // Year
    ctx.font = '20px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(String(vinylData.year || ''), 128, 380);

    ctx.restore();

    // ── Decorative line separator
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 270);
    ctx.lineTo(216, 270);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    // Create spine mesh - fill the slot height nicely
    const spineW = vinylWidth * 1.6;  // Wider to fill more of the slot
    const spineH = vinylHeight * 1.8;  // Taller
    const spineGeometry = new THREE.PlaneGeometry(spineW, spineH);

    const spineMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.56,
      metalness: 0.0,
    });

    const spine = new THREE.Mesh(spineGeometry, spineMaterial);
    spine.name = 'shelf-spine';
    spine.rotation.y = Math.PI / 2;  // Face forward (camera-facing when vinyl is rotated)
    spine.position.set(vinylWidth / 2 + 0.003, 0, 0);
    spine.castShadow = true;       // 🎨 ENHANCED: Cast shadows
    spine.receiveShadow = true;    // 🎨 ENHANCED: Receive shadows
    vinyl.add(spine);

    // 🎨 NEW: Add subtle edge highlight to spine
    const edgeHighlight = new THREE.Mesh(
      new THREE.PlaneGeometry(spineW * 0.08, spineH),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      })
    );
    edgeHighlight.rotation.y = Math.PI / 2;
    edgeHighlight.position.set(vinylWidth / 2 + 0.004, 0, spineW * 0.45);
    edgeHighlight.name = 'spine-edge-highlight';
    vinyl.add(edgeHighlight);
  }

  private countPlacedVinyls(): number {
    let count = 0;
    this.shelfGroup.children.forEach((child) => {
      if (!child.name.startsWith('vinyl-')) return;
      const u = (child as any).userData;
      if (u?.isPlaced) count += 1;
    });
    return count;
  }

  private countVinylsInColumn(col: number): number {
    let count = 0;
    this.shelfGroup.children.forEach((child) => {
      if (!child.name.startsWith('vinyl-')) return;
      const u = (child as any).userData;
      if (u?.isPlaced && u?.shelfCol === col) count += 1;
    });
    return count;
  }

  private recalculateScoreAndStatus(): void {
    const placed = this.countPlacedVinyls();
    this.score = Math.max(0, (placed * 10) - (this.invalidDrops * 2) + this.comboBonusScore);
    this.status = (placed >= this.totalVinyls && this.totalVinyls > 0) ? 'completed' : 'playing';
  }

  private getShelfCellCenter(_row: number, col: number): THREE.Vector3 {
    // SINGLE ROW MODE: y is always 0 (centered vertically in single row)
    const x = (col - this.shelfCols / 2 + 0.5) * this.slotWidth;
    const y = 0;  // Always 0 for single row
    return new THREE.Vector3(x, y, 0.02);
  }


  private createDropColumnGuide(shelfHeight: number): void {
    // Modern soft indicator for current drop target
    const guideGeometry = new THREE.PlaneGeometry(this.slotWidth * 0.88, shelfHeight * 0.85);
    const guideMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const guide = new THREE.Mesh(guideGeometry, guideMaterial);
    guide.name = 'drop-column-guide';
    guide.position.set(0, 0, 0.16);
    guide.visible = false;
    this.shelfGroup.add(guide);
    this.dropColumnGuide = guide;
  }

  private createTargetColumnGuide(shelfHeight: number): void {
    // Gentle cyan helper guide for the expected column
    const guideGeometry = new THREE.PlaneGeometry(this.slotWidth * 0.94, shelfHeight * 0.90);
    const guideMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.20,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const guide = new THREE.Mesh(guideGeometry, guideMaterial);
    guide.name = 'target-column-guide';
    guide.position.set(0, 0, 0.12);
    guide.visible = false;
    this.shelfGroup.add(guide);
    this.targetColumnGuide = guide;
  }

  public previewDropColumn(col: number, isValid: boolean): void {
    if (!this.dropColumnGuide) return;
    const x = (col - this.shelfCols / 2 + 0.5) * this.slotWidth;
    this.dropColumnGuide.position.x = x;
    this.dropColumnGuide.visible = true;
    this.dropColumnGuide.scale.set(1.0, 1.0, 1.0);
    const material = this.dropColumnGuide.material as THREE.MeshBasicMaterial;

    if (isValid) {
      material.color.setHex(0x10b981);
      material.opacity = 0.30;
    } else {
      material.color.setHex(0xef4444);
      material.opacity = 0.26;
    }
  }

  public clearDropPreview(): void {
    if (!this.dropColumnGuide) return;
    this.dropColumnGuide.visible = false;
  }

  public updatePanelStates(): void {
    // Update visual state of all enhanced genre panels with animations
    const time = Date.now();
    this.shelfGroup.children.forEach((child) => {
      if (child.name.startsWith('genre-panel-')) {
        const col = child.userData.col;
        const vinylsInCol = this.countVinylsInColumn(col);
        const isEmpty = vinylsInCol === 0;
        const isFull = vinylsInCol >= Math.ceil(this.totalVinyls / this.shelfCols);
        const isActive = false; // Set to true when targeting/hovering

        updatePanelState(child as THREE.Group, isEmpty, isFull, isActive, time);
      }
    });
  }

  public previewTargetColumn(col: number): void {
    if (!this.targetColumnGuide) return;
    const x = (col - this.shelfCols / 2 + 0.5) * this.slotWidth;
    this.targetColumnGuide.position.x = x;
    this.targetColumnGuide.visible = true;
    // Subtle scale effect
    this.targetColumnGuide.scale.set(1.02, 1.01, 1.0);
  }

  public clearTargetColumnPreview(): void {
    if (!this.targetColumnGuide) return;
    this.targetColumnGuide.visible = false;
    this.targetColumnGuide.scale.set(1.0, 1.0, 1.0);  // Reset scale
  }

  private addAiReferenceLayers(shelfWidth: number, shelfHeight: number, shelfDepth: number): void {
    // Mood backdrop: reference completa scena, quasi come "grade" artistico sul fondo.
    const moodBackdropGeo = new THREE.PlaneGeometry(shelfWidth + 5.0, shelfHeight + 5.4);
    const moodBackdropMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    });
    const moodBackdrop = new THREE.Mesh(moodBackdropGeo, moodBackdropMat);
    moodBackdrop.position.set(0, 0.05, -shelfDepth / 2 - 0.28);
    moodBackdrop.name = 'ai-mood-backdrop';
    this.shelfGroup.add(moodBackdrop);
    this.loadTextureIntoMaterial(moodBackdropMat, AI_REF_SCENE_URL, {
      repeat: new THREE.Vector2(1.0, 1.05),
      offset: new THREE.Vector2(0.0, -0.01),
    });

    // Shelf decal: pattern/chunky feeling preso dal concept scaffale toy-like.
    const shelfDecalGeo = new THREE.PlaneGeometry(shelfWidth + 0.04, shelfHeight + 0.08);
    const shelfDecalMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    });
    const shelfDecal = new THREE.Mesh(shelfDecalGeo, shelfDecalMat);
    shelfDecal.position.set(0, 0.02, -shelfDepth / 2 + 0.043);
    shelfDecal.name = 'ai-shelf-decal';
    this.shelfGroup.add(shelfDecal);
    this.loadTextureIntoMaterial(shelfDecalMat, AI_REF_SHELF_URL, {
      repeat: new THREE.Vector2(1.1, 1.0),
      offset: new THREE.Vector2(-0.03, 0.0),
    });
  }

  private loadTextureIntoMaterial(
    material: THREE.MeshBasicMaterial | THREE.MeshStandardMaterial,
    url: string | string[],
    transform?: { repeat?: THREE.Vector2; offset?: THREE.Vector2 }
  ): void {
    const candidates = Array.isArray(url) ? url : [url];

    const tryLoad = (index: number): void => {
      const candidate = candidates[index];
      this.textureLoader.load(
        candidate,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          if (transform?.repeat) {
            texture.repeat.copy(transform.repeat);
          }
          if (transform?.offset) {
            texture.offset.copy(transform.offset);
          }
          const maxAnisotropy = this.sceneRenderer.getRenderer().capabilities.getMaxAnisotropy();
          texture.anisotropy = Math.max(1, Math.min(8, maxAnisotropy));
          material.map = texture;
          material.needsUpdate = true;
        },
        undefined,
        () => {
          const hasFallback = index + 1 < candidates.length;
          if (hasFallback) {
            tryLoad(index + 1);
            return;
          }
          console.warn(`AI texture non caricata: ${candidate}`);
        }
      );
    };

    tryLoad(0);
  }
}
