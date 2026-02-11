import * as THREE from 'three';
import { Level, Vinyl, GridCell, GameStatus, ShelfConfig } from './types';
import { SceneRenderer } from './SceneRenderer';

export class GameManager {
  private level: Level | null = null;
  private grid: GridCell[][] = [];
  private status: GameStatus = 'idle';
  private score: number = 0;
  private moves: number = 0;
  private sceneRenderer: SceneRenderer;
  private shelfGroup: THREE.Group;
  private vinylsGroup: THREE.Group;

  constructor(sceneRenderer: SceneRenderer) {
    this.sceneRenderer = sceneRenderer;
    this.shelfGroup = new THREE.Group();
    this.shelfGroup.name = 'shelf-group';
    this.vinylsGroup = new THREE.Group();
    this.vinylsGroup.name = 'vinyls-group';
    
    const scene = this.sceneRenderer.getScene();
    scene.add(this.shelfGroup);
    scene.add(this.vinylsGroup);
  }

  public loadLevel(level: Level): void {
    this.level = level;
    this.status = 'playing';
    this.score = 0;
    this.moves = 0;
    
    // Initialize grid
    this.initializeGrid(level.shelf);
    
    // Build shelf in 3D
    this.buildShelf(level.shelf);
    
    // Create vinyls
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
    // Clear existing shelf
    this.shelfGroup.clear();

    // Record store bins layout (wide and shallow)
    const slotWidth = 0.8;
    const shelfWidth = config.cols * slotWidth;
    const shelfHeight = config.rows * 0.8;
    const shelfDepth = 0.45;

    // Background wall (soft pastel)
    const wallGeometry = new THREE.PlaneGeometry(shelfWidth + 4, shelfHeight + 4);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd4a3,
      roughness: 0.9,
      metalness: 0.0,
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, 0, -shelfDepth / 2 - 0.2);
    wall.receiveShadow = true;
    this.shelfGroup.add(wall);

    // Shelf backboard (light wood - beige)
    const backGeometry = new THREE.BoxGeometry(shelfWidth, shelfHeight, 0.08);
    const backMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8d5b7,
      roughness: 0.6,
      metalness: 0.05,
    });
    const backBoard = new THREE.Mesh(backGeometry, backMaterial);
    backBoard.position.set(0, 0, -shelfDepth / 2);
    backBoard.receiveShadow = true;
    backBoard.castShadow = true;
    this.shelfGroup.add(backBoard);

    // Record bins (horizontal shelves + vertical dividers) - MODERN SOFT
    for (let row = 0; row <= config.rows; row++) {
      const y = (row - config.rows / 2) * 0.8;
      // Bottom board of each bin (light glossy wood)
      const bottomGeometry = new THREE.BoxGeometry(shelfWidth, 0.04, shelfDepth);
      const bottomMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4b896,
        roughness: 0.3,
        metalness: 0.1,
      });
      const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
      bottom.position.set(0, y, 0);
      bottom.castShadow = true;
      bottom.receiveShadow = true;
      this.shelfGroup.add(bottom);
    }

    // Vertical dividers between bins (soft subtle dividers)
    for (let row = 0; row < config.rows; row++) {
      const y = (row - config.rows / 2) * 0.8 + 0.4;
      for (let col = 0; col <= config.cols; col++) {
        const x = (col - config.cols / 2) * slotWidth;
        const dividerGeometry = new THREE.BoxGeometry(0.02, 0.75, shelfDepth * 0.9);
        const dividerMaterial = new THREE.MeshStandardMaterial({
          color: 0xc4a882,
          roughness: 0.4,
          metalness: 0.05,
        });
        const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
        divider.position.set(x, y, 0);
        divider.castShadow = true;
        divider.receiveShadow = true;
        this.shelfGroup.add(divider);
      }
    }

    // Side walls (soft glossy finish)
    const sideGeometry = new THREE.BoxGeometry(0.08, shelfHeight, shelfDepth);
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4b896,
      roughness: 0.3,
      metalness: 0.1,
    });
    
    const leftWall = new THREE.Mesh(sideGeometry, sideMaterial);
    leftWall.position.set(-shelfWidth / 2, 0, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    this.shelfGroup.add(leftWall);

    const rightWall = new THREE.Mesh(sideGeometry, sideMaterial);
    rightWall.position.set(shelfWidth / 2, 0, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    this.shelfGroup.add(rightWall);

    // Ground (clean light floor)
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xe5ddd5,
      roughness: 0.8,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -(shelfHeight / 2) - 0.8;
    ground.receiveShadow = true;
    this.shelfGroup.add(ground);
    
    // Position shelf at proper height
    this.shelfGroup.position.y = 1;

    // Add genre signs above bins
    const genres = ['ROCK', 'JAZZ', 'FOLK', 'BLUES', 'FUNK'];
    for (let col = 0; col < Math.min(config.cols, genres.length); col++) {
      const x = (col - config.cols / 2) * slotWidth + slotWidth / 2;
      const y = shelfHeight / 2 + 0.4;
      
      // Sign background (soft pastel)
      const signGeometry = new THREE.PlaneGeometry(0.5, 0.12);
      const signMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.05,
      });
      const sign = new THREE.Mesh(signGeometry, signMaterial);
      sign.position.set(x, y, -shelfDepth / 2 + 0.01);
      this.shelfGroup.add(sign);

      // Sign border (soft accent)
      const borderGeometry = new THREE.PlaneGeometry(0.52, 0.14);
      const borderMaterial = new THREE.MeshStandardMaterial({
        color: 0xffc880,
        roughness: 0.3,
        metalness: 0.1,
      });
      const border = new THREE.Mesh(borderGeometry, borderMaterial);
      border.position.set(x, y, -shelfDepth / 2 + 0.005);
      this.shelfGroup.add(border);
    }

    // Add "VINYL RECORDS" sign above everything (MODERN SOFT)
    const titleGeometry = new THREE.PlaneGeometry(shelfWidth * 0.6, 0.3);
    const titleMaterial = new THREE.MeshStandardMaterial({
      color: 0xffa366,
      roughness: 0.2,
      metalness: 0.15,
    });
    const titleSign = new THREE.Mesh(titleGeometry, titleMaterial);
    titleSign.position.set(0, shelfHeight / 2 + 0.8, -shelfDepth / 2 + 0.02);
    this.shelfGroup.add(titleSign);

    // Title border (soft shadow effect)
    const titleBorderGeometry = new THREE.PlaneGeometry(shelfWidth * 0.62, 0.32);
    const titleBorderMaterial = new THREE.MeshStandardMaterial({
      color: 0xffcc99,
      roughness: 0.4,
      metalness: 0.05,
    });
    const titleBorder = new THREE.Mesh(titleBorderGeometry, titleBorderMaterial);
    titleBorder.position.set(0, shelfHeight / 2 + 0.8, -shelfDepth / 2 + 0.01);
    this.shelfGroup.add(titleBorder);
  }

  private createVinyls(vinyls: Vinyl[]): void {
    // Clear existing vinyls
    this.vinylsGroup.clear();

    // Create scrolling carousel bar at bottom (MODERN SOFT)
    const barWidth = 15;
    const barHeight = 0.8;
    const barDepth = 0.08;
    
    const barGeometry = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
    const barMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4d4d4,
      roughness: 0.3,
      metalness: 0.2,
    });
    const carouselBar = new THREE.Mesh(barGeometry, barMaterial);
    carouselBar.position.set(0, -1.3, 1.5);
    carouselBar.name = 'carousel-bar';
    this.vinylsGroup.add(carouselBar);

    // Add soft pastel accent stripe on top edge
    const accentGeometry = new THREE.BoxGeometry(barWidth, 0.05, barDepth + 0.02);
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0xffcc99,
      roughness: 0.2,
      metalness: 0.15,
    });
    const accent = new THREE.Mesh(accentGeometry, accentMaterial);
    accent.position.set(0, -1.3 + barHeight / 2 + 0.025, 1.5);
    this.vinylsGroup.add(accent);

    // Position vinyls in horizontal scrolling line (IN FRONT)
    const spacing = 1.2;
    vinyls.forEach((vinyl, index) => {
      const vinylMesh = this.createVinylMesh(vinyl);
      vinylMesh.userData = { 
        vinyl,
        carouselIndex: index,
        originalX: (index - vinyls.length / 2) * spacing,
      };
      vinylMesh.name = `vinyl-${vinyl.id}`;
      
      // Position standing on carousel (FRONT and BOTTOM)
      vinylMesh.position.set(
        (index - vinyls.length / 2) * spacing,
        -0.5,
        1.5
      );
      
      // Nice size for visibility
      vinylMesh.scale.set(1.5, 1.5, 1.5);
      
      this.vinylsGroup.add(vinylMesh);
    });

    // Add visual hint: arrow pointing to first vinyl
    const arrowGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.8,
    });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.set(0, 0.3, 1.5); // Above first vinyl
    arrow.rotation.x = Math.PI; // Point down
    arrow.name = 'hint-arrow';
    this.vinylsGroup.add(arrow);

    // Animate arrow (bobbing motion)
    let time = 0;
    const animateArrow = () => {
      time += 0.05;
      arrow.position.y = 0.3 + Math.sin(time) * 0.1;
      if (arrow.parent) {
        requestAnimationFrame(animateArrow);
      }
    };
    animateArrow();

    console.log('🎮 GAME READY!');
    console.log('📀 Touch and drag vinyl records from bottom');
    console.log('📦 Place them in the correct genre bins');
    console.log('Total vinyls created:', vinyls.length);
  }

  private createVinylMesh(vinyl: Vinyl): THREE.Group {
    const group = new THREE.Group();

    // Vinyl standing upright (MODERN GLOSSY STYLE - Fill the Fridge)
    const vinylWidth = 0.32;
    const vinylHeight = 0.32;
    const vinylThickness = 0.008;

    // Desaturate color to pastel (60-70% saturation)
    const vinylColorObj = new THREE.Color(vinyl.color);
    const hsl = { h: 0, s: 0, l: 0 };
    vinylColorObj.getHSL(hsl);
    vinylColorObj.setHSL(hsl.h, hsl.s * 0.65, Math.min(hsl.l + 0.1, 0.75)); // Pastel

    // Main vinyl sleeve (glossy modern material)
    const sleeveGeometry = new THREE.BoxGeometry(vinylWidth, vinylHeight, vinylThickness);
    const sleeveMaterial = new THREE.MeshStandardMaterial({
      color: vinylColorObj,
      roughness: 0.25,
      metalness: 0.15,
    });
    const sleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
    sleeve.castShadow = true;
    sleeve.receiveShadow = true;
    group.add(sleeve);

    // Cover art frame (front - subtle darker shade)
    const frameSize = vinylWidth * 0.85;
    const frameGeometry = new THREE.PlaneGeometry(frameSize, frameSize);
    const frameColor = vinylColorObj.clone().multiplyScalar(0.85);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: frameColor,
      roughness: 0.3,
      metalness: 0.1,
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.z = vinylThickness / 2 + 0.002;
    group.add(frame);

    // Spine (lateral side - visible color)
    const spineGeometry = new THREE.PlaneGeometry(vinylThickness + 0.002, vinylHeight);
    const spineMaterial = new THREE.MeshStandardMaterial({
      color: vinylColorObj,
      roughness: 0.35,
      metalness: 0.1,
    });
    const spine = new THREE.Mesh(spineGeometry, spineMaterial);
    spine.rotation.y = Math.PI / 2;
    spine.position.x = vinylWidth / 2;
    group.add(spine);

    // Genre label on top edge (soft white)
    const labelHeight = 0.06;
    const labelGeometry = new THREE.PlaneGeometry(vinylWidth * 0.7, labelHeight);
    const labelMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.05,
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(0, vinylHeight / 2 - labelHeight / 2 - 0.02, vinylThickness / 2 + 0.003);
    group.add(label);

    // Subtle shadow under label (instead of black border)
    const shadowGeometry = new THREE.PlaneGeometry(vinylWidth * 0.72, labelHeight + 0.005);
    const shadowMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      roughness: 0.5,
      metalness: 0.0,
    });
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.position.set(0, vinylHeight / 2 - labelHeight / 2 - 0.025, vinylThickness / 2 + 0.002);
    group.add(shadow);

    // INVISIBLE TOUCH HELPER (bigger hitbox for mobile)
    const touchHelperGeometry = new THREE.BoxGeometry(
      vinylWidth * 1.5,
      vinylHeight * 1.5,
      vinylThickness * 2
    );
    const touchHelperMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.0,
      visible: false, // Invisible but still raycasts
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
    // Animate carousel scrolling
    this.vinylsGroup.children.forEach((child) => {
      if (child.name.startsWith('vinyl-')) {
        const userData = (child.userData as any);
        
        // Skip if being dragged
        if (userData.isDragging) return;
        
        // Smooth horizontal scroll
        child.position.x -= 1.5 * deltaTime;
        
        // Loop when goes too far left
        const originalX = userData.originalX;
        if (child.position.x < -8) {
          child.position.x = originalX + 8;
        }
      }
    });
  }
}
