import * as THREE from 'three';
import { Level, Vinyl, GridCell, GameStatus, ShelfConfig } from './types';
import { SceneRenderer } from './SceneRenderer';

const AI_REF_SCENE_URL = 'https://im.runware.ai/image/ws/4/ii/455156ce-83b2-442d-94b0-efe9970676ac.png';
const AI_REF_SHELF_URL = 'https://im.runware.ai/image/ws/4/ii/eb730e15-e1f0-4d46-82b4-671b9467961a.png';
const AI_REF_COUNTER_URL = 'https://im.runware.ai/image/ws/4/ii/73151626-dc54-4f08-93e9-254954acf8ea.png';

export class GameManager {
  private level: Level | null = null;
  private grid: GridCell[][] = [];
  private status: GameStatus = 'idle';
  private score: number = 0;
  private moves: number = 0;
  private sceneRenderer: SceneRenderer;
  private shelfGroup: THREE.Group;
  private vinylsGroup: THREE.Group;
  private idleTime: number = 0;
  private textureLoader: THREE.TextureLoader;
  private aiPhotoDecalsEnabled: boolean = false;
  private readonly shelfRows = 3;
  private readonly shelfCols = 5;
  private readonly slotWidth = 0.8;
  private readonly rowHeight = 0.8;

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

    this.initializeGrid(level.shelf);
    this.buildShelf(level.shelf);
    this.createVinyls(level.vinyls);

    console.log('Level loaded:', level.id);
  }

  private initializeGrid(config: ShelfConfig): void {
    this.grid = [];
    for (let row = 0; row < config.rows; row++) {
      this.grid[row] = [];
      for (let col = 0; col < config.cols; col++) {
        this.grid[row][col] = { row, col, vinylId: null };
      }
    }
  }

  private buildShelf(config: ShelfConfig): void {
    this.shelfGroup.clear();

    const slotWidth = this.slotWidth;
    const shelfWidth = config.cols * slotWidth;
    const shelfHeight = config.rows * this.rowHeight;
    const shelfDepth = 0.45;

    // ── Background wall (charcoal caldo, più moderno e meno "flat")
    const wallGeometry = new THREE.PlaneGeometry(shelfWidth + 6, shelfHeight + 6);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d2925,
      roughness: 0.92,
      metalness: 0.0,
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, 0, -shelfDepth / 2 - 0.3);
    wall.receiveShadow = true;
    this.shelfGroup.add(wall);

    // ── Shelf backboard (noce profondo con texture leggera)
    const backGeometry = new THREE.BoxGeometry(shelfWidth + 0.2, shelfHeight + 0.2, 0.08);
    const woodCanvas = document.createElement('canvas');
    woodCanvas.width = 512;
    woodCanvas.height = 512;
    const woodCtx = woodCanvas.getContext('2d')!;
    const woodGradient = woodCtx.createLinearGradient(0, 0, 0, 512);
    woodGradient.addColorStop(0, '#5c3d2f');
    woodGradient.addColorStop(0.5, '#4b3328');
    woodGradient.addColorStop(1, '#3f2b22');
    woodCtx.fillStyle = woodGradient;
    woodCtx.fillRect(0, 0, 512, 512);
    woodCtx.globalAlpha = 0.06;
    for (let i = 0; i < 220; i++) {
      woodCtx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000';
      const y = Math.random() * 512;
      const h = Math.random() * 2 + 0.8;
      woodCtx.fillRect(0, y, 512, h);
    }
    woodCtx.globalAlpha = 1;
    const woodTexture = new THREE.CanvasTexture(woodCanvas);
    woodTexture.colorSpace = THREE.SRGBColorSpace;

    const backMaterial = new THREE.MeshStandardMaterial({
      color: 0x4b3328,
      map: woodTexture,
      roughness: 0.58,
      metalness: 0.05,
    });
    const backBoard = new THREE.Mesh(backGeometry, backMaterial);
    backBoard.position.set(0, 0, -shelfDepth / 2);
    backBoard.receiveShadow = true;
    backBoard.castShadow = true;
    this.shelfGroup.add(backBoard);

    // ── Horizontal shelf boards (rovere tostato, meno giallo)
    const shelfBoardColor = 0x8f694d;
    for (let row = 0; row <= config.rows; row++) {
      const y = (row - config.rows / 2) * this.rowHeight;
      const bottomGeometry = new THREE.BoxGeometry(shelfWidth + 0.16, 0.07, shelfDepth);
      const bottomMaterial = new THREE.MeshStandardMaterial({
        color: shelfBoardColor,
        roughness: 0.5,
        metalness: 0.08,
      });
      const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
      bottom.position.set(0, y, 0);
      bottom.castShadow = true;
      bottom.receiveShadow = true;
      this.shelfGroup.add(bottom);
    }

    // ── Vertical dividers (tono medio coordinato)
    const dividerColor = 0x73533f;
    for (let row = 0; row < config.rows; row++) {
      const y = (row - config.rows / 2) * this.rowHeight + this.rowHeight / 2;
      for (let col = 0; col <= config.cols; col++) {
        const x = (col - config.cols / 2) * slotWidth;
        const dividerGeometry = new THREE.BoxGeometry(0.035, this.rowHeight, shelfDepth * 0.85);
        const dividerMaterial = new THREE.MeshStandardMaterial({
          color: dividerColor,
          roughness: 0.55,
          metalness: 0.05,
        });
        const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
        divider.position.set(x, y, 0);
        divider.castShadow = true;
        divider.receiveShadow = true;
        this.shelfGroup.add(divider);
      }
    }

    // ── Side walls (match shelf boards, chunky)
    const sideGeometry = new THREE.BoxGeometry(0.1, shelfHeight + 0.1, shelfDepth);
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: shelfBoardColor,
      roughness: 0.7,
      metalness: 0.0,
    });

    const leftWall = new THREE.Mesh(sideGeometry, sideMaterial);
    leftWall.position.set(-shelfWidth / 2 - 0.05, 0, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    this.shelfGroup.add(leftWall);

    const rightWall = new THREE.Mesh(sideGeometry, sideMaterial);
    rightWall.position.set(shelfWidth / 2 + 0.05, 0, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    this.shelfGroup.add(rightWall);

    // ── Floor (quasi nero satinato, look premium)
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x151312,
      roughness: 0.34,
      metalness: 0.08,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -(shelfHeight / 2) - 0.8;
    ground.receiveShadow = true;
    this.shelfGroup.add(ground);

    // Position shelf at proper height
    this.shelfGroup.position.y = 1;

    // ── AI references opzionali: utili per test art direction, disattivate di default per evitare effetto collage
    if (this.aiPhotoDecalsEnabled) {
      this.addAiReferenceLayers(shelfWidth, shelfHeight, shelfDepth);
    }

    // ── Environment details (atmospheric enrichment)
    this.createEnvironmentDetails(shelfWidth, shelfHeight);

    // ── Genre label tabs (large, high contrast, readable)
    const genreColors = [0xc66a4b, 0x4f74b5, 0xb95f95, 0xcf7d3b, 0x8c76bf];
    const genres = ['ROCK', 'JAZZ', 'POP', 'HIP-HOP', 'CLASSICA'];

    for (let col = 0; col < Math.min(config.cols, genres.length); col++) {
      const x = (col - config.cols / 2) * slotWidth + slotWidth / 2;
      const y = shelfHeight / 2 + 0.25;

      // Create high-contrast label with icon
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 512;
      labelCanvas.height = 256;
      const lctx = labelCanvas.getContext('2d')!;

      // Base dark tab
      lctx.fillStyle = '#241d1a';
      lctx.fillRect(0, 0, 512, 256);

      // Top accent strip from genre color
      lctx.fillStyle = `#${genreColors[col].toString(16).padStart(6, '0')}`;
      lctx.fillRect(0, 0, 512, 78);

      // Gentle glossy overlay
      const grad = lctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, 'rgba(255,255,255,0.18)');
      grad.addColorStop(1, 'rgba(0,0,0,0.22)');
      lctx.fillStyle = grad;
      lctx.fillRect(0, 0, 512, 256);

      // Genre text: clean e leggibile, niente emoji
      lctx.shadowColor = 'rgba(0,0,0,0.45)';
      lctx.shadowBlur = 6;
      lctx.shadowOffsetY = 2;
      lctx.fillStyle = '#ffffff';
      lctx.font = 'bold 64px Arial, sans-serif';
      lctx.textAlign = 'center';
      lctx.textBaseline = 'middle';
      lctx.fillText(genres[col], 256, 160);

      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      const labelGeo = new THREE.PlaneGeometry(slotWidth * 0.85, 0.32);
      const labelMat = new THREE.MeshBasicMaterial({
        map: labelTexture,
        transparent: false,
      });
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.position.set(x, y, 0.01);
      this.shelfGroup.add(labelMesh);
    }

    // No store sign - using top UI bar instead for cleaner look
  }

  private createEnvironmentDetails(shelfWidth: number, shelfHeight: number): void {
    // ── Poster 1: Left side (Jazz themed - abstract saxophone)
    const posterCanvas1 = document.createElement('canvas');
    posterCanvas1.width = 256;
    posterCanvas1.height = 384;
    const pctx1 = posterCanvas1.getContext('2d')!;

    // Poster background - deep blue
    pctx1.fillStyle = '#1e3a5f';
    pctx1.fillRect(0, 0, 256, 384);

    // Abstract curves (saxophone suggestion)
    pctx1.strokeStyle = '#f5f1ed';
    pctx1.lineWidth = 12;
    pctx1.globalAlpha = 0.4;
    pctx1.beginPath();
    pctx1.moveTo(80, 100);
    pctx1.bezierCurveTo(120, 150, 140, 200, 160, 280);
    pctx1.stroke();
    pctx1.globalAlpha = 1.0;

    const posterTexture1 = new THREE.CanvasTexture(posterCanvas1);
    const poster1Geo = new THREE.PlaneGeometry(0.45, 0.68);
    const poster1Mat = new THREE.MeshStandardMaterial({
      map: posterTexture1,
      transparent: true,
      opacity: 0.15,  // Light watercolor style
      roughness: 0.9,
      metalness: 0.0,
    });
    const poster1 = new THREE.Mesh(poster1Geo, poster1Mat);
    poster1.position.set(-shelfWidth / 2 - 1.2, shelfHeight / 2 - 0.4, -0.35);
    poster1.name = 'poster-jazz';
    this.shelfGroup.add(poster1);

    // ── Poster 2: Right side (Rock themed - lightning bolt)
    const posterCanvas2 = document.createElement('canvas');
    posterCanvas2.width = 256;
    posterCanvas2.height = 384;
    const pctx2 = posterCanvas2.getContext('2d')!;

    pctx2.fillStyle = '#8b1e3f';
    pctx2.fillRect(0, 0, 256, 384);

    // Lightning bolt symbol
    pctx2.fillStyle = '#f5f1ed';
    pctx2.globalAlpha = 0.5;
    pctx2.beginPath();
    pctx2.moveTo(140, 80);
    pctx2.lineTo(110, 190);
    pctx2.lineTo(145, 190);
    pctx2.lineTo(115, 300);
    pctx2.lineTo(160, 160);
    pctx2.lineTo(125, 160);
    pctx2.closePath();
    pctx2.fill();
    pctx2.globalAlpha = 1.0;

    const posterTexture2 = new THREE.CanvasTexture(posterCanvas2);
    const poster2Geo = new THREE.PlaneGeometry(0.45, 0.68);
    const poster2Mat = new THREE.MeshStandardMaterial({
      map: posterTexture2,
      transparent: true,
      opacity: 0.12,
      roughness: 0.9,
      metalness: 0.0,
    });
    const poster2 = new THREE.Mesh(poster2Geo, poster2Mat);
    poster2.position.set(shelfWidth / 2 + 1.1, shelfHeight / 2 - 0.6, -0.35);
    poster2.name = 'poster-rock';
    this.shelfGroup.add(poster2);

    // ── Speaker 1: Left corner (charcoal moderno)
    const speaker1Geo = new THREE.BoxGeometry(0.35, 0.5, 0.3);
    const speaker1Mat = new THREE.MeshStandardMaterial({
      color: 0x2b2725,
      roughness: 0.45,
      metalness: 0.34,
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
      color: 0x0f0d0c,
      roughness: 0.35,
      metalness: 0.25,
      transparent: true,
      opacity: 0.85,
    });
    const grille1 = new THREE.Mesh(grille1Geo, grille1Mat);
    grille1.position.set(-shelfWidth / 2 - 0.5, -shelfHeight / 2 + 0.25, 0.31);
    grille1.name = 'grille-left';
    this.shelfGroup.add(grille1);

    // Accent ring per look hi-fi contemporaneo
    const ringGeo = new THREE.TorusGeometry(0.11, 0.01, 12, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xc98a4f,
      roughness: 0.25,
      metalness: 0.8,
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

    // ── "OPEN" neon sign (soft teal glow)
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sctx = signCanvas.getContext('2d')!;

    // Glow effect
    sctx.shadowColor = '#1abc9c';
    sctx.shadowBlur = 20;
    sctx.fillStyle = '#1abc9c';
    sctx.font = 'bold 80px Arial';
    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    sctx.fillText('OPEN', 256, 64);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signGeo = new THREE.PlaneGeometry(1.2, 0.3);
    const signMat = new THREE.MeshBasicMaterial({
      map: signTexture,
      transparent: true,
      opacity: 0.3,  // Very soft, ambient
      depthWrite: false,
    });
    const openSign = new THREE.Mesh(signGeo, signMat);
    openSign.position.set(0, shelfHeight / 2 + 0.9, -0.25);
    openSign.name = 'open-sign';
    this.shelfGroup.add(openSign);

    // Subtle pulsing animation for neon sign
    let signTime = 0;
    const animateSign = () => {
      signTime += 0.02;
      openSign.material.opacity = 0.25 + Math.sin(signTime) * 0.05;
      if (openSign.parent) {
        requestAnimationFrame(animateSign);
      }
    };
    animateSign();

    // ── Vinyl stack (left side, 5-6 boxes stacked)
    const stackColors = [0xec4899, 0xa78bfa, 0x2563eb, 0xf97316, 0xd7263d, 0x22c55e];
    const stackSize = 0.28;
    const stackCount = 6;

    for (let i = 0; i < stackCount; i++) {
      const stackBoxGeo = new THREE.BoxGeometry(stackSize, stackSize * 0.05, stackSize);
      const stackBoxMat = new THREE.MeshStandardMaterial({
        color: stackColors[i % stackColors.length],
        roughness: 0.7,
        metalness: 0.0,
        transparent: true,
        opacity: 0.5,  // Pastel effect
      });
      const stackBox = new THREE.Mesh(stackBoxGeo, stackBoxMat);
      stackBox.position.set(
        -shelfWidth / 2 - 0.8,
        -shelfHeight / 2 + 0.1 + i * stackSize * 0.05,
        -0.1
      );
      stackBox.rotation.y = (Math.random() - 0.5) * 0.15;  // Slight random rotation
      stackBox.castShadow = true;
      stackBox.receiveShadow = true;
      stackBox.name = `vinyl-stack-${i}`;
      this.shelfGroup.add(stackBox);
    }

    console.log('Environment details added: 2 posters, 2 speakers, 1 neon sign, 6 vinyl stack boxes');
  }

  private createVinyls(vinyls: Vinyl[]): void {
    this.vinylsGroup.clear();

    // ── Carousel platform (dark counter, stile retail moderno)
    const barWidth = 15;
    const barHeight = 0.6;
    const barDepth = 0.5;

    const barGeometry = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
    const barMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2523,
      roughness: 0.42,
      metalness: 0.3,
    });
    const carouselBar = new THREE.Mesh(barGeometry, barMaterial);
    carouselBar.position.set(0, -1.3, 1.5);
    carouselBar.name = 'carousel-bar';
    carouselBar.castShadow = true;
    carouselBar.receiveShadow = true;
    this.vinylsGroup.add(carouselBar);

    // Top edge accent (warm metal strip)
    const accentGeometry = new THREE.BoxGeometry(barWidth, 0.03, barDepth + 0.02);
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0xd28752,
      roughness: 0.22,
      metalness: 0.78,
    });
    const accent = new THREE.Mesh(accentGeometry, accentMaterial);
    accent.position.set(0, -1.3 + barHeight / 2 + 0.015, 1.5);
    accent.castShadow = true;
    this.vinylsGroup.add(accent);

    // Slim front glow line per accento "app store game"
    const glowLineGeo = new THREE.BoxGeometry(barWidth - 0.1, 0.02, 0.02);
    const glowLineMat = new THREE.MeshBasicMaterial({
      color: 0xff8357,
      transparent: true,
      opacity: 0.9,
    });
    const glowLine = new THREE.Mesh(glowLineGeo, glowLineMat);
    glowLine.position.set(0, -1.3 + barHeight / 2 - 0.02, 1.5 + barDepth / 2 + 0.012);
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
      counterDecal.position.set(0, -1.3, 1.5 + barDepth / 2 + 0.011);
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
      };
      vinylMesh.name = `vinyl-${vinyl.id}`;

      vinylMesh.position.set(
        (index - vinyls.length / 2) * spacing,
        -0.56,
        1.48
      );

      vinylMesh.scale.set(1.32, 1.32, 1.32);
      vinylMesh.rotation.set(0, 0, 0);

      this.vinylsGroup.add(vinylMesh);
    });

    // Subtle hint arrow (matches UI orange)
    const arrowGeometry = new THREE.ConeGeometry(0.08, 0.25, 8);
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6b35, // Match UI accent color
      transparent: true,
      opacity: 0.7,
    });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.set(0, 0.3, 1.5);
    arrow.rotation.x = Math.PI;
    arrow.name = 'hint-arrow';
    this.vinylsGroup.add(arrow);

    let time = 0;
    const animateArrow = () => {
      time += 0.04;
      arrow.position.y = 0.25 + Math.sin(time) * 0.08;
      arrow.material.opacity = 0.5 + Math.sin(time * 0.5) * 0.2;
      if (arrow.parent) {
        requestAnimationFrame(animateArrow);
      }
    };
    animateArrow();

    console.log('Total vinyls created:', vinyls.length);
  }

  private drawAlbumArt(ctx: CanvasRenderingContext2D, genre: string, baseColor: THREE.Color): void {
    const size = 512;
    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);
    const lightColor = `hsl(${hsl.h * 360}, ${Math.min(hsl.s * 100 + 10, 100)}%, ${Math.min(hsl.l * 100 + 25, 85)}%)`;
    const darkColor = `hsl(${hsl.h * 360}, ${hsl.s * 100}%, ${Math.max(hsl.l * 100 - 25, 8)}%)`;

    switch (genre) {
      case 'Rock': {
        // Bold diagonal split + circle
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        ctx.arc(size * 0.6, size * 0.4, size / 4, 0, Math.PI * 2);
        ctx.fill();
        // Lightning bolt
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(size * 0.55, size * 0.2);
        ctx.lineTo(size * 0.45, size * 0.45);
        ctx.lineTo(size * 0.6, size * 0.45);
        ctx.lineTo(size * 0.5, size * 0.7);
        ctx.stroke();
        break;
      }
      case 'Jazz': {
        // Smoky curves
        for (let i = 0; i < 6; i++) {
          ctx.strokeStyle = i % 2 === 0 ? lightColor : darkColor;
          ctx.lineWidth = 12 + i * 4;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.moveTo(-20, size * 0.15 * i + 40);
          ctx.bezierCurveTo(size * 0.3, size * 0.15 * i - 60, size * 0.7, size * 0.15 * i + 80, size + 20, size * 0.15 * i);
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
        break;
      }
      case 'Folk': {
        // Concentric rings (tree rings / organic)
        for (let i = 8; i >= 0; i--) {
          ctx.globalAlpha = 0.4 + (i / 8) * 0.6;
          ctx.fillStyle = i % 2 === 0 ? lightColor : darkColor;
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, (size / 2.2) * (i / 8), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        break;
      }
      case 'Blues': {
        // Gradient + horizontal bars
        const grad = ctx.createLinearGradient(0, 0, 0, size);
        grad.addColorStop(0, darkColor);
        grad.addColorStop(1, lightColor);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        for (let i = 0; i < 8; i++) {
          ctx.fillRect(0, i * size / 8, size, size / 16);
        }
        break;
      }
      case 'Funk': {
        // Starburst
        ctx.fillStyle = darkColor;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = lightColor;
        for (let i = 0; i < 12; i++) {
          ctx.save();
          ctx.translate(size / 2, size / 2);
          ctx.rotate((Math.PI * 2 * i) / 12);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-40, -size / 2);
          ctx.lineTo(40, -size / 2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        break;
      }
      case 'Soul': {
        // Warm radial gradient with heart
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 30, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, lightColor);
        gradient.addColorStop(0.6, baseColor.getStyle());
        gradient.addColorStop(1, darkColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        break;
      }
      default: {
        ctx.fillStyle = lightColor;
        ctx.fillRect(0, 0, size / 2, size);
        ctx.fillStyle = darkColor;
        ctx.fillRect(size / 2, 0, size / 2, size);
      }
    }

    // Genre text with shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(genre.toUpperCase(), size / 2, size / 2);
    ctx.restore();

    // Subtle "LP" at bottom
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '28px Arial, sans-serif';
    ctx.fillText('LP', size / 2, size - 35);
  }

  private createVinylMesh(vinyl: Vinyl): THREE.Group {
    const group = new THREE.Group();

    const vinylWidth = 0.35;
    const vinylHeight = 0.35;
    const vinylThickness = 0.01;
    const vinylColorObj = new THREE.Color(vinyl.color);

    // ── Cardboard sleeve (cartone opaco avorio)
    const sleeveGeometry = new THREE.BoxGeometry(vinylWidth, vinylHeight, vinylThickness);
    const sleeveMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0e8d8,  // Avorio carta
      roughness: 0.85,  // Molto opaco (cartone)
      metalness: 0.0,
    });
    const sleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
    sleeve.castShadow = true;
    sleeve.receiveShadow = true;
    group.add(sleeve);

    // ── Album cover art (front face)
    const coverSize = vinylWidth * 0.94;
    const coverGeometry = new THREE.PlaneGeometry(coverSize, coverSize);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base color fill
    ctx.fillStyle = vinyl.color;
    ctx.fillRect(0, 0, 512, 512);

    // Genre-specific artwork
    this.drawAlbumArt(ctx, vinyl.genre, vinylColorObj);

    // Subtle wear/grain effect
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, Math.random() * 80);
    }
    ctx.globalAlpha = 1.0;

    const texture = new THREE.CanvasTexture(canvas);
    const coverMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.6,   // Carta stampata con texture
      metalness: 0.0,   // NO metallico (è carta)
    });
    const cover = new THREE.Mesh(coverGeometry, coverMaterial);
    cover.position.z = vinylThickness / 2 + 0.001;
    group.add(cover);

    // ── Protective plastic sheen (simula protezione plastica lucida)
    const sheenGeometry = new THREE.PlaneGeometry(coverSize + 0.005, coverSize + 0.005);
    const sheenMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.05,  // Quasi specchio (plastica lucida)
      metalness: 0.0,
      transparent: true,
      opacity: 0.08,
    });
    const sheen = new THREE.Mesh(sheenGeometry, sheenMaterial);
    sheen.position.z = vinylThickness / 2 + 0.003;
    sheen.name = 'sheen';
    group.add(sheen);

    // ── Colored spine (dorso colorato visibile negli scaffali)
    const spineGeometry = new THREE.PlaneGeometry(vinylThickness + 0.003, vinylHeight);
    const spineMaterial = new THREE.MeshStandardMaterial({
      color: vinylColorObj,  // Colore genere
      roughness: 0.7,        // Carta opaca
      metalness: 0.0,
    });
    const spine = new THREE.Mesh(spineGeometry, spineMaterial);
    spine.rotation.y = Math.PI / 2;
    spine.position.x = vinylWidth / 2;
    group.add(spine);

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

  public undo(): void {
    console.log('Undo not yet implemented');
  }

  public restart(): void {
    if (this.level) {
      this.loadLevel(this.level);
    }
  }

  public update(deltaTime: number): void {
    this.idleTime += deltaTime;

    this.vinylsGroup.children.forEach((child) => {
      if (child.name.startsWith('vinyl-')) {
        const userData = (child.userData as any);
        if (userData.isDragging) return;

        child.position.x -= 1.0 * deltaTime;

        const originalX = userData.originalX;
        if (child.position.x < -9) {
          child.position.x = originalX + 9;
        }

        // ── Carousel readability:
        // Focus al centro (più grande/leggibile), lati più piccoli e leggermente angolati.
        const centerFocus = Math.max(0, 1 - Math.min(Math.abs(child.position.x) / 3.4, 1));
        const targetScale = 1.22 + centerFocus * 0.35;
        child.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);

        const sideAngle = (1 - centerFocus) * 0.22 * Math.sign(child.position.x);
        child.rotation.y = sideAngle;

        const targetZ = 1.40 + centerFocus * 0.22;
        child.position.z += (targetZ - child.position.z) * 0.12;

        // ── IDLE ANIMATION: Micro-oscillazione verticale + sheen opacity
        const carouselIndex = userData.carouselIndex || 0;
        const offset = carouselIndex * 0.7;
        const oscillation = Math.sin(this.idleTime * 2.0 + offset) * 0.012;
        child.position.y = -0.56 + oscillation;

        // Animate sheen opacity
        const sheen = child.children.find((c) => c.name === 'sheen');
        if (sheen && (sheen as THREE.Mesh).material) {
          const mat = (sheen as THREE.Mesh).material as THREE.MeshStandardMaterial;
          mat.opacity = 0.08 + Math.sin(this.idleTime * 1.5 + offset) * 0.03;
        }
      }
    });
  }

  public placeVinylOnShelf(vinyl: THREE.Object3D, row: number, col: number): void {
    this.vinylsGroup.remove(vinyl);
    this.shelfGroup.add(vinyl);

    const stackIndex = this.getStackIndexForCell(row, col);
    const cellCenter = this.getShelfCellCenter(row, col);
    const stackOffsetX = stackIndex * 0.028;
    const stackOffsetZ = stackIndex * 0.008;

    // Durante drag il vinile resta frontale; dopo drop lo disponiamo "da scaffale" (vista dorso/spine).
    vinyl.position.set(cellCenter.x + stackOffsetX, cellCenter.y, -0.06 + stackOffsetZ);
    vinyl.rotation.set(0, Math.PI / 2 + (Math.random() - 0.5) * 0.05, 0);
    vinyl.scale.set(1.22, 1.22, 1.22);

    const vinylId = vinyl.name.replace('vinyl-', '');
    this.grid[row][col].vinylId = vinylId;

    (vinyl.userData as any).shelfRow = row;
    (vinyl.userData as any).shelfCol = col;
    (vinyl.userData as any).stackIndex = stackIndex;
    (vinyl.userData as any).isPlaced = true;
    (vinyl.userData as any).isDragging = false;

    console.log(`Vinyl ${vinylId} placed at row=${row}, col=${col}`);
  }

  private getShelfCellCenter(row: number, col: number): THREE.Vector3 {
    const x = (col - this.shelfCols / 2 + 0.5) * this.slotWidth;
    const y = (row - this.shelfRows / 2 + 0.5) * this.rowHeight;
    return new THREE.Vector3(x, y, 0.02);
  }

  private getStackIndexForCell(row: number, col: number): number {
    let count = 0;
    this.shelfGroup.children.forEach((child) => {
      if (!child.name.startsWith('vinyl-')) return;
      const u = (child as any).userData;
      if (u?.isPlaced && u?.shelfRow === row && u?.shelfCol === col) {
        count += 1;
      }
    });
    return count;
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
    material: THREE.MeshBasicMaterial,
    url: string,
    transform?: { repeat?: THREE.Vector2; offset?: THREE.Vector2 }
  ): void {
    this.textureLoader.load(
      url,
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
        console.warn(`AI texture non caricata: ${url}`);
      }
    );
  }
}
