import * as THREE from 'three';
import { Vinyl } from './types';

/**
 * VinylMesh - Advanced 3D Vinyl Record Component
 *
 * Creates realistic vinyl record meshes with:
 * - Procedural grooves and textures
 * - Album cover art
 * - Realistic materials and lighting
 * - Support for colored vinyl variants
 * - Inner sleeve and protective outer sleeve
 */
export class VinylMesh {
  /**
   * Create a complete vinyl record group with sleeve, cover art, and disc
   */
  static createVinyl(vinyl: Vinyl): THREE.Group {
    const group = new THREE.Group();
    group.name = `vinyl-${vinyl.id}`;

    // Realistic LP dimensions (12" = 30.48cm)
    const VINYL_DIAMETER = 0.305;
    const VINYL_THICKNESS = 0.003;
    const SLEEVE_SIZE = 0.315;
    const SLEEVE_THICKNESS = 0.005;

    // Create album sleeve (cardboard)
    const sleeve = this.createSleeve(SLEEVE_SIZE, SLEEVE_THICKNESS);
    group.add(sleeve);

    // Create album cover art
    const coverArt = this.createCoverArt(vinyl, SLEEVE_SIZE, SLEEVE_THICKNESS);
    group.add(coverArt);

    // Create vinyl disc (partially visible from sleeve)
    const disc = this.createVinylDisc(vinyl, VINYL_DIAMETER, VINYL_THICKNESS);
    disc.position.z = SLEEVE_THICKNESS / 2 + VINYL_THICKNESS;
    disc.position.y = SLEEVE_SIZE * 0.15; // Peek out from top
    group.add(disc);

    // Add protective outer sleeve (glossy plastic)
    const outerSleeve = this.createOuterSleeve(SLEEVE_SIZE, SLEEVE_THICKNESS);
    group.add(outerSleeve);

    // Add spine details
    const spine = this.createSpine(vinyl, SLEEVE_SIZE, SLEEVE_THICKNESS);
    group.add(spine);

    // Store vinyl data
    group.userData.vinyl = vinyl;
    group.userData.isVinyl = true;

    return group;
  }

  /**
   * Create the cardboard album sleeve
   */
  private static createSleeve(size: number, thickness: number): THREE.Group {
    const sleeveGroup = new THREE.Group();
    sleeveGroup.name = 'sleeve';

    // Main cardboard box
    const geometry = new THREE.BoxGeometry(size, size, thickness);
    const material = new THREE.MeshStandardMaterial({
      color: 0xf5f0e8, // Off-white cardboard
      roughness: 0.85,
      metalness: 0.0,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    sleeveGroup.add(mesh);

    // Add subtle cardboard texture
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 256;
    textureCanvas.height = 256;
    const ctx = textureCanvas.getContext('2d')!;
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(0, 0, 256, 256);

    // Cardboard fibers
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 500; i++) {
      ctx.strokeStyle = Math.random() > 0.5 ? '#ccc' : '#888';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 256, Math.random() * 256);
      ctx.lineTo(Math.random() * 256, Math.random() * 256);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(textureCanvas);
    material.map = texture;
    material.needsUpdate = true;

    return sleeveGroup;
  }

  /**
   * Create album cover art with procedural generation
   */
  private static createCoverArt(vinyl: Vinyl, size: number, thickness: number): THREE.Mesh {
    const coverSize = size * 0.95;
    const geometry = new THREE.PlaneGeometry(coverSize, coverSize);

    // Generate procedural cover art
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Base color from vinyl
    ctx.fillStyle = vinyl.color;
    ctx.fillRect(0, 0, 1024, 1024);

    // Draw genre-specific art
    this.drawAlbumArt(ctx, vinyl);

    // Add vintage wear
    this.addVintageEffects(ctx);

    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.6,
      metalness: 0.05,
    });

    const cover = new THREE.Mesh(geometry, material);
    cover.position.z = thickness / 2 + 0.001;
    cover.castShadow = true;
    cover.receiveShadow = true;

    return cover;
  }

  /**
   * Create the actual vinyl disc with grooves
   */
  private static createVinylDisc(vinyl: Vinyl, diameter: number, thickness: number): THREE.Group {
    const discGroup = new THREE.Group();
    discGroup.name = 'vinyl-disc';

    const radius = diameter / 2;

    // Main vinyl disc
    const discGeometry = new THREE.CylinderGeometry(radius, radius, thickness, 64);

    // Vinyl color (default black, but support colored variants)
    const vinylColor = this.getVinylDiscColor(vinyl);

    const discMaterial = new THREE.MeshStandardMaterial({
      color: vinylColor,
      roughness: 0.3,
      metalness: 0.6,
      side: THREE.DoubleSide,
    });

    const disc = new THREE.Mesh(discGeometry, discMaterial);
    disc.rotation.x = Math.PI / 2; // Lay flat
    disc.castShadow = true;
    disc.receiveShadow = true;
    discGroup.add(disc);

    // Add grooves texture
    const groovesTexture = this.createGroovesTexture();
    discMaterial.normalMap = groovesTexture;
    discMaterial.normalScale = new THREE.Vector2(0.3, 0.3);

    // Center label (both sides)
    const labelRadius = radius * 0.3;
    const labelGeometry = new THREE.CircleGeometry(labelRadius, 32);
    const labelMaterial = new THREE.MeshStandardMaterial({
      color: this.getLabelColor(vinyl),
      roughness: 0.8,
      metalness: 0.0,
    });

    // Top label
    const topLabel = new THREE.Mesh(labelGeometry, labelMaterial);
    topLabel.rotation.x = -Math.PI / 2;
    topLabel.position.y = thickness / 2 + 0.001;
    discGroup.add(topLabel);

    // Bottom label
    const bottomLabel = new THREE.Mesh(labelGeometry, labelMaterial.clone());
    bottomLabel.rotation.x = Math.PI / 2;
    bottomLabel.position.y = -thickness / 2 - 0.001;
    discGroup.add(bottomLabel);

    // Add label text
    this.addLabelText(topLabel, vinyl);

    // Center hole
    const holeGeometry = new THREE.CylinderGeometry(0.0037, 0.0037, thickness * 1.1, 32);
    const holeMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.9,
    });
    const hole = new THREE.Mesh(holeGeometry, holeMaterial);
    hole.rotation.x = Math.PI / 2;
    discGroup.add(hole);

    return discGroup;
  }

  /**
   * Create procedural grooves normal map
   */
  private static createGroovesTexture(): THREE.Texture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Create radial grooves
    const centerX = size / 2;
    const centerY = size / 2;

    ctx.fillStyle = '#808080'; // Neutral gray for normal map
    ctx.fillRect(0, 0, size, size);

    // Draw concentric circles (grooves)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.5;

    for (let r = 80; r < centerX - 60; r += 1.5) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();

      // Add micro-variations
      if (Math.random() > 0.7) {
        ctx.strokeStyle = '#666666';
        ctx.beginPath();
        ctx.arc(centerX, centerY, r + 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#000000';
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    return texture;
  }

  /**
   * Create protective outer sleeve (plastic)
   */
  private static createOuterSleeve(size: number, thickness: number): THREE.Mesh {
    const sleeveSize = size * 1.02;
    const geometry = new THREE.PlaneGeometry(sleeveSize, sleeveSize);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    });

    const sleeve = new THREE.Mesh(geometry, material);
    sleeve.position.z = thickness / 2 + 0.004;
    sleeve.name = 'outer-sleeve';

    return sleeve;
  }

  /**
   * Create spine with genre label
   */
  private static createSpine(vinyl: Vinyl, size: number, thickness: number): THREE.Group {
    const spineGroup = new THREE.Group();
    spineGroup.name = 'spine';

    // Spine surface
    const spineGeometry = new THREE.PlaneGeometry(thickness + 0.002, size);
    const spineMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(vinyl.color).multiplyScalar(0.8),
      roughness: 0.7,
      metalness: 0.0,
    });
    const spine = new THREE.Mesh(spineGeometry, spineMaterial);
    spine.rotation.y = Math.PI / 2;
    spine.position.x = size / 2;
    spineGroup.add(spine);

    // Genre label on spine
    const labelHeight = 0.06;
    const labelWidth = thickness + 0.003;
    const labelGeometry = new THREE.PlaneGeometry(labelWidth, labelHeight);
    const labelMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.rotation.y = Math.PI / 2;
    label.position.set(size / 2 + 0.001, size / 2 - labelHeight / 2 - 0.02, 0);
    spineGroup.add(label);

    return spineGroup;
  }

  /**
   * Get seeded random function for consistent generation
   */
  private static seededRandom(seed: number): () => number {
    return () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
  }

  /**
   * Generate album title and artist from genre if not provided
   */
  private static getAlbumData(vinyl: Vinyl): { title: string; artist: string } {
    if (vinyl.title && vinyl.artist) {
      return { title: vinyl.title, artist: vinyl.artist };
    }

    const albumNames: Record<string, string[]> = {
      'rock': ['THUNDER ROAD', 'MIDNIGHT ECHO', 'STEEL & STONE', 'WILD HORSES', 'BLACK DIAMOND'],
      'jazz': ['BLUE MOOD', 'NIGHT FLIGHT', 'SMOKE & MIRRORS', 'CROSSWINDS', 'LATE SET'],
      'folk': ['WOODEN HEARTS', 'RIVER SONG', 'MOUNTAIN AIR', 'AUTUMN LEAVES', 'HOMECOMING'],
      'blues': ['CROSSROADS', 'MIDNIGHT TRAIN', 'DIRTY WATER', 'STEEL GUITAR', 'DELTA DUST'],
      'funk': ['GROOVE MACHINE', 'FUNKY TOWN', 'DANCE FLOOR', 'SUPER BAD', 'GIVE IT UP'],
      'soul': ['SWEET DREAMS', 'HEART OF GOLD', 'MIDNIGHT LOVE', 'SOUL POWER', 'HEAVEN SENT'],
      'pop': ['SUNSHINE', 'RADIO HITS', 'NEON LIGHTS', 'DANCE ALL NIGHT', 'SUMMER VIBES'],
      'electronic': ['DIGITAL DREAMS', 'CIRCUIT BREAKER', 'NEON PULSE', 'FREQUENCY', 'SYNTHWAVE'],
      'classical': ['MOONLIGHT', 'SYMPHONY', 'REVERIE', 'NOCTURNE', 'SERENADE'],
      'hiphop': ['STREET DREAMS', 'URBAN LEGEND', 'MIC CHECK', 'DROP THE BEAT', 'FRESH PRINCE'],
    };
    const artistNames: Record<string, string[]> = {
      'rock': ['THE STORM', 'IRON HORSE', 'BLACK WOLF', 'THUNDERHEAD', 'STEEL DRIVERS'],
      'jazz': ['BLUE NOTE', 'MIDNIGHT QUINTET', 'SMOKE DETECTIVE', 'THE COOL SCHOOL', 'NIGHT OWL'],
      'folk': ['THE WANDERERS', 'WOODSY', 'RIVER BAND', 'MOUNTAIN MEN', 'PINE TREE'],
      'blues': ['BIG JOE', 'SLIDE GUITAR BOB', 'THE DEVIL', 'MISSISSIPPI JOHN', 'BLIND LEMON'],
      'funk': ['THE FUNK BROTHERS', 'GROOVE MASTERS', 'JAMES & THE BAND', 'PARLIAMENT', 'SLY STONE'],
      'soul': ['THE SOUL CHILDREN', 'DREAM GIRLS', 'MOTOWN MAGIC', 'THE TEMPTATIONS', 'SUPREMES'],
      'pop': ['THE STARS', 'SUNSHINE BAND', 'RADIO KINGS', 'CHART TOPPERS', 'HIT MAKERS'],
      'electronic': ['KRAFTWERK', 'DIGITAL PIONEERS', 'SYNTH LORDS', 'CIRCUIT MASTERS', 'NEON RIDERS'],
      'classical': ['VIENNA ENSEMBLE', 'LONDON SYMPHONY', 'ROYAL PHILHARMONIC', 'BERLIN ORCHESTRA', 'MOSCOW CHAMBER'],
      'hiphop': ['THE BEAT MAKERS', 'STREET POETS', 'URBAN SOUNDS', 'BLOCK PARTY', 'MIC MASTERS'],
    };

    const genre = vinyl.genre.toLowerCase();
    const titles = albumNames[genre] || albumNames['rock'];
    const artists = artistNames[genre] || artistNames['rock'];
    const seed = vinyl.id.charCodeAt(0) + vinyl.year;
    const idx = seed % titles.length;

    return {
      title: vinyl.title || titles[idx],
      artist: vinyl.artist || artists[idx]
    };
  }

  /**
   * Draw genre-specific album art with enhanced design
   */
  private static drawAlbumArt(ctx: CanvasRenderingContext2D, vinyl: Vinyl): void {
    const size = ctx.canvas.width;
    const baseColor = new THREE.Color(vinyl.color);
    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);

    const lightColor = `hsl(${hsl.h * 360}, ${Math.min(hsl.s * 100 + 10, 100)}%, ${Math.min(hsl.l * 100 + 30, 95)}%)`;
    const darkColor = `hsl(${hsl.h * 360}, ${hsl.s * 100}%, ${Math.max(hsl.l * 100 - 30, 5)}%)`;
    const accentColor = `hsl(${(hsl.h * 360 + 30) % 360}, ${hsl.s * 100}%, ${hsl.l * 100}%)`;

    // Get seeded random for consistency
    const seed = vinyl.id.charCodeAt(0) * 1000 + vinyl.year;
    const rng = this.seededRandom(seed);

    ctx.globalAlpha = 0.85;

    switch (vinyl.genre.toLowerCase()) {
      case 'rock':
        this.drawRockArt(ctx, size, lightColor, darkColor, accentColor, rng);
        break;
      case 'jazz':
        this.drawJazzArt(ctx, size, lightColor, darkColor, rng);
        break;
      case 'folk':
        this.drawFolkArt(ctx, size, lightColor, darkColor, rng);
        break;
      case 'blues':
        this.drawBluesArt(ctx, size, lightColor, darkColor, rng);
        break;
      case 'funk':
        this.drawFunkArt(ctx, size, lightColor, darkColor, accentColor, rng);
        break;
      case 'soul':
        this.drawSoulArt(ctx, size, lightColor, darkColor, baseColor);
        break;
      case 'pop':
        this.drawPopArt(ctx, size, lightColor, darkColor, accentColor, baseColor, rng);
        break;
      case 'electronic':
        this.drawElectronicArt(ctx, size, lightColor, darkColor, baseColor, rng);
        break;
      case 'classical':
        this.drawClassicalArt(ctx, size, lightColor, darkColor, baseColor, rng);
        break;
      case 'hiphop':
        this.drawHipHopArt(ctx, size, lightColor, darkColor, accentColor, baseColor, rng);
        break;
      default:
        this.drawDefaultArt(ctx, size, lightColor, darkColor);
    }

    ctx.globalAlpha = 1.0;

    // Get album data for typography
    const album = this.getAlbumData(vinyl);

    // Professional typography with shadow
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Title shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    // Album title (large, bold)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size / 14}px Georgia, serif`;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.strokeText(album.title, size / 2, size / 2 - 40);
    ctx.fillText(album.title, size / 2, size / 2 - 40);

    // Artist name (smaller, italic)
    ctx.font = `italic ${size / 22}px Georgia, serif`;
    ctx.shadowBlur = 6;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(album.artist, size / 2, size / 2 + 20);

    ctx.restore();

    // Year at bottom with decorative elements
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = `${size / 28}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`- ${vinyl.year} -`, size / 2, size - 50);

    // Record label logo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = `italic ${size / 40}px Georgia, serif`;
    ctx.fillText('SLEEVO RECORDS', size / 2, size - 25);
  }

  // Genre-specific art methods with enhanced designs
  private static drawRockArt(ctx: CanvasRenderingContext2D, size: number, light: string, dark: string, accent: string, _rng: () => number): void {
    // Bold angular design - classic rock poster style
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.lineTo(size * 0.6, 0);
    ctx.lineTo(size, 0);
    ctx.lineTo(size, size * 0.7);
    ctx.lineTo(size * 0.4, size);
    ctx.closePath();
    ctx.fill();

    // Lightning bolt
    ctx.fillStyle = light;
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
    ctx.fillStyle = accent;
    this.drawStar(ctx, size * 0.8, size * 0.2, size / 25, 5);
  }

  private static drawJazzArt(ctx: CanvasRenderingContext2D, size: number, light: string, dark: string, _rng: () => number): void {
    // Elegant gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, dark);
    gradient.addColorStop(1, light);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Smoky curves - Blue Note style
    for (let i = 0; i < 8; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)';
      ctx.lineWidth = size / 40 + i * 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-30, size * 0.1 * i + 60);
      ctx.bezierCurveTo(size * 0.25, size * 0.1 * i - 80, size * 0.75, size * 0.1 * i + 120, size + 30, size * 0.1 * i + 40);
      ctx.stroke();
    }

    // Center vinyl record circles
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    for (let r = 40; r < 180; r += 8) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private static drawFolkArt(ctx: CanvasRenderingContext2D, size: number, light: string, dark: string, _rng: () => number): void {
    // Organic tree rings pattern
    for (let i = 12; i >= 0; i--) {
      ctx.globalAlpha = 0.25 + (i / 12) * 0.6;
      ctx.fillStyle = i % 2 === 0 ? light : dark;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, (size / 2.1) * (i / 12), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 0.85;

    // Leaf accent
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(size * 0.75, size * 0.25, 40, 70, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawBluesArt(ctx: CanvasRenderingContext2D, size: number, light: string, dark: string, _rng: () => number): void {
    // Moody gradient
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, dark);
    grad.addColorStop(0.5, ctx.fillStyle as string);
    grad.addColorStop(1, light);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Guitar strings effect
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(80 + i * 35, 0);
      ctx.lineTo(80 + i * 35 + 40, size);
      ctx.stroke();
    }

    // Crossroads symbol
    ctx.strokeStyle = light;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(size * 0.3, size * 0.5);
    ctx.lineTo(size * 0.7, size * 0.5);
    ctx.moveTo(size * 0.5, size * 0.3);
    ctx.lineTo(size * 0.5, size * 0.7);
    ctx.stroke();
  }

  private static drawFunkArt(ctx: CanvasRenderingContext2D, size: number, light: string, dark: string, accent: string, _rng: () => number): void {
    // Groovy starburst
    ctx.fillStyle = dark;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = i % 2 === 0 ? light : accent;
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((Math.PI * 2 * i) / 16);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-50, -size / 2);
      ctx.lineTo(50, -size / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Center circle
    ctx.fillStyle = ctx.fillStyle as string;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawSoulArt(ctx: CanvasRenderingContext2D, size: number, light: string, dark: string, base: THREE.Color): void {
    // Warm radial gradient
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 40, size / 2, size / 2, size / 1.5);
    gradient.addColorStop(0, light);
    gradient.addColorStop(0.5, base.getStyle());
    gradient.addColorStop(1, dark);
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
    ctx.shadowBlur = 25;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  private static drawPopArt(ctx: CanvasRenderingContext2D, size: number, light: string, _dark: string, accent: string, base: THREE.Color, _rng: () => number): void {
    // Bright diagonal split
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, size / 2, size);
    ctx.fillStyle = accent;
    ctx.fillRect(size / 2, 0, size / 2, size);

    // Circles pattern
    ctx.fillStyle = base.getStyle();
    ctx.globalAlpha = 0.75;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(size * 0.3, size * (0.2 + i * 0.15), 30 + i * 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(size * 0.7, size * (0.8 - i * 0.15), 30 + i * 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 0.85;
  }

  private static drawElectronicArt(ctx: CanvasRenderingContext2D, size: number, light: string, _dark: string, base: THREE.Color, _rng: () => number): void {
    // Dark background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, size, size);

    // Grid lines
    ctx.strokeStyle = base.getStyle();
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
    ctx.shadowColor = light;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = light;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(size * 0.2, size * 0.8);
    ctx.lineTo(size * 0.4, size * 0.2);
    ctx.lineTo(size * 0.8, size * 0.4);
    ctx.lineTo(size * 0.6, size * 0.8);
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  private static drawClassicalArt(ctx: CanvasRenderingContext2D, size: number, _light: string, dark: string, base: THREE.Color, _rng: () => number): void {
    // Elegant parchment
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(0, 0, size, size);

    // Ornate border
    ctx.strokeStyle = dark;
    ctx.lineWidth = 6;
    ctx.strokeRect(35, 35, size - 70, size - 70);
    ctx.lineWidth = 2;
    ctx.strokeRect(55, 55, size - 110, size - 110);

    // Decorative corners
    ctx.fillStyle = base.getStyle();
    this.drawOrnateCorner(ctx, 70, 70, 1);
    this.drawOrnateCorner(ctx, size - 70, 70, 2);
    this.drawOrnateCorner(ctx, 70, size - 70, 3);
    this.drawOrnateCorner(ctx, size - 70, size - 70, 4);
  }

  private static drawHipHopArt(ctx: CanvasRenderingContext2D, size: number, _light: string, _dark: string, accent: string, base: THREE.Color, rng: () => number): void {
    // Urban dark background
    ctx.fillStyle = '#2D2D2D';
    ctx.fillRect(0, 0, size, size);

    // Graffiti-style splatter
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = i % 2 === 0 ? base.getStyle() : accent;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(rng() * size, rng() * size, rng() * 50 + 15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 0.85;

    // Chain/urban element
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(size * 0.7, size * 0.3, 50, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Helper: Draw star shape
  private static drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, points: number): void {
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
  private static drawOrnateCorner(ctx: CanvasRenderingContext2D, x: number, y: number, corner: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((corner - 1) * Math.PI / 2);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-25, -25, -50, 0);
    ctx.quadraticCurveTo(-25, 25, 0, 0);
    ctx.fill();

    ctx.restore();
  }

  private static drawDefaultArt(ctx: CanvasRenderingContext2D, size: number, light: string, dark: string): void {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, light);
    gradient.addColorStop(1, dark);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  /**
   * Add enhanced vintage wear effects
   */
  private static addVintageEffects(ctx: CanvasRenderingContext2D): void {
    const size = ctx.canvas.width;

    // Paper grain/noise texture
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 600; i++) {
      const brightness = 100 + Math.random() * 80;
      ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
    }

    // Coffee/age stains
    ctx.globalAlpha = 0.035;
    ctx.fillStyle = '#8B7355';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * size,
        Math.random() * size,
        Math.random() * 70 + 35,
        0, Math.PI * 2
      );
      ctx.fill();
    }

    // Scratches
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * size, Math.random() * size);
      ctx.lineTo(Math.random() * size, Math.random() * size);
      ctx.stroke();
    }

    // Dust specks (white)
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 80; i++) {
      ctx.globalAlpha = Math.random() * 0.25;
      ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
    }

    // Edge wear gradient
    ctx.globalAlpha = 0.18;
    const edgeWidth = size / 12;

    // Top edge
    const topGrad = ctx.createLinearGradient(0, 0, 0, edgeWidth);
    topGrad.addColorStop(0, 'rgba(80, 60, 40, 0.5)');
    topGrad.addColorStop(1, 'rgba(80, 60, 40, 0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, size, edgeWidth);

    // Bottom edge
    const bottomGrad = ctx.createLinearGradient(0, size, 0, size - edgeWidth);
    bottomGrad.addColorStop(0, 'rgba(60, 40, 20, 0.6)');
    bottomGrad.addColorStop(1, 'rgba(60, 40, 20, 0)');
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, size - edgeWidth, size, edgeWidth);

    // Corner wear/damage
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000';
    const cornerSize = size / 12;
    ctx.fillRect(0, 0, cornerSize, cornerSize);
    ctx.fillRect(size - cornerSize, 0, cornerSize, cornerSize);
    ctx.fillRect(0, size - cornerSize, cornerSize, cornerSize);
    ctx.fillRect(size - cornerSize, size - cornerSize, cornerSize, cornerSize);

    // Subtle crease lines
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const startX = Math.random() * size * 0.3;
      const startY = Math.random() * size;
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + Math.random() * 60, startY + Math.random() * 30 - 15);
      ctx.stroke();
    }

    // Yellowing/fading overlay
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#f5e6c8';
    ctx.fillRect(0, 0, size, size);

    ctx.globalAlpha = 1.0;
  }

  /**
   * Add text to label
   */
  private static addLabelText(label: THREE.Mesh, vinyl: Vinyl): void {
    // Could use THREE.TextGeometry here, but keeping it simple
    // Canvas texture approach for text
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Label background
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(128, 128, 128, 0, Math.PI * 2);
    ctx.fill();

    // Label text
    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(vinyl.genre.toUpperCase(), 128, 100);

    ctx.font = '18px Arial';
    ctx.fillText(`${vinyl.year}`, 128, 140);

    const texture = new THREE.CanvasTexture(canvas);
    (label.material as THREE.MeshStandardMaterial).map = texture;
    (label.material as THREE.MeshStandardMaterial).needsUpdate = true;
  }

  /**
   * Get vinyl disc color (support colored variants)
   */
  private static getVinylDiscColor(_vinyl: Vinyl): number {
    // Could extend Vinyl interface to support colored vinyl
    // For now, default to black with slight color tint
    return 0x1a1a1a;
  }

  /**
   * Get label color based on genre
   */
  private static getLabelColor(vinyl: Vinyl): number {
    const colorMap: Record<string, number> = {
      rock: 0xff6b6b,
      jazz: 0x4ecdc4,
      folk: 0xffe66d,
      blues: 0x4a69bd,
      funk: 0xff8c42,
    };
    return colorMap[vinyl.genre.toLowerCase()] || 0xffffff;
  }

  /**
   * Create a spinning vinyl animation (for idle state)
   */
  static animateSpin(vinylGroup: THREE.Group, speed: number = 0.02): void {
    const disc = vinylGroup.getObjectByName('vinyl-disc');
    if (disc) {
      disc.rotation.y += speed;
    }
  }

  /**
   * Create a hover effect (lift and rotate)
   */
  static animateHover(vinylGroup: THREE.Group, amplitude: number = 0.02): void {
    const time = Date.now() * 0.001;
    vinylGroup.position.y += Math.sin(time * 2) * amplitude;
    vinylGroup.rotation.z = Math.sin(time) * 0.1;
  }
}
