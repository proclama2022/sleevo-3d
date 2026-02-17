import * as THREE from 'three';
import { Vinyl } from './types';

/**
 * VinylMesh - Realistic 3D Vinyl Record Component
 *
 * Creates realistic vinyl records with:
 * - Black glossy disc (CylinderGeometry)
 * - Genre-colored center label
 * - Procedural groove bump map
 * - Center spindle hole
 */
export class VinylMesh {
  private static grooveTextureCache: THREE.Texture | null = null;

  /**
   * Create a realistic vinyl record disc
   */
  static createVinyl(vinyl: Vinyl): THREE.Group {
    const group = new THREE.Group();
    group.name = `vinyl-${vinyl.id}`;

    const DISC_RADIUS = 0.16;
    const DISC_THICKNESS = 0.004;
    const LABEL_RADIUS = 0.065; // ~40% of disc radius
    const HOLE_RADIUS = 0.004;

    // Mobile optimization: reduce geometry complexity on small screens
    const isMobile = window.innerWidth < 768;
    const discSegments = isMobile ? 32 : 64;
    const labelSegments = isMobile ? 24 : 48;
    const holeSegments = isMobile ? 12 : 16;

    // --- Main black disc ---
    const discGeometry = new THREE.CylinderGeometry(DISC_RADIUS, DISC_RADIUS, DISC_THICKNESS, discSegments, 1);
    discGeometry.rotateX(Math.PI / 2);

    const grooveTexture = this.getGrooveTexture(LABEL_RADIUS / DISC_RADIUS, 0.95);

    const discMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.15,
      metalness: 0.8,
      bumpMap: grooveTexture,
      bumpScale: 0.002,
    });

    const disc = new THREE.Mesh(discGeometry, discMaterial);
    disc.castShadow = true;
    disc.receiveShadow = true;
    disc.name = 'vinyl-disc';
    group.add(disc);

    // --- Genre-colored center label ---
    const labelGeometry = new THREE.CylinderGeometry(LABEL_RADIUS, LABEL_RADIUS, DISC_THICKNESS + 0.001, labelSegments, 1);
    labelGeometry.rotateX(Math.PI / 2);

    const labelColor = new THREE.Color(vinyl.color);
    const labelMaterial = new THREE.MeshStandardMaterial({
      color: labelColor,
      roughness: 0.4,
      metalness: 0.1,
      emissive: labelColor,
      emissiveIntensity: 0.15,
    });

    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.z = 0.0005; // Slightly above disc surface
    label.name = 'vinyl-label';
    group.add(label);

    // --- Center spindle hole ---
    const holeGeometry = new THREE.CylinderGeometry(HOLE_RADIUS, HOLE_RADIUS, DISC_THICKNESS + 0.002, holeSegments, 1);
    holeGeometry.rotateX(Math.PI / 2);

    const holeMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.9,
      metalness: 0.0,
    });

    const hole = new THREE.Mesh(holeGeometry, holeMaterial);
    hole.position.z = 0.001;
    group.add(hole);

    // Store vinyl data
    group.userData.vinyl = vinyl;
    group.userData.isVinyl = true;

    return group;
  }

  /**
   * Create procedural groove bump texture (cached)
   */
  private static getGrooveTexture(labelRadiusRatio: number, maxRadiusRatio: number): THREE.Texture {
    if (this.grooveTextureCache) return this.grooveTextureCache;

    const texture = this.createVinylGrooveTexture(labelRadiusRatio, maxRadiusRatio);
    this.grooveTextureCache = texture;
    return texture;
  }

  /**
   * Generate a procedural groove texture using concentric circles on a canvas
   */
  private static createVinylGrooveTexture(labelRadiusRatio: number, maxRadiusRatio: number): THREE.Texture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Black background (flat areas = no bump)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const labelR = (labelRadiusRatio * size) / 2;
    const maxR = (maxRadiusRatio * size) / 2;

    // Draw concentric groove rings
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    const spacing = 2; // 2px spacing between grooves

    for (let r = labelR; r <= maxR; r += spacing) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    return texture;
  }

  /**
   * Animation helpers
   */
  static animateSpin(vinylGroup: THREE.Group, speed: number = 0.02): void {
    const disc = vinylGroup.getObjectByName('vinyl-disc');
    if (disc) {
      disc.rotation.z += speed;
    }
  }

  static animateHover(vinylGroup: THREE.Group, amplitude: number = 0.02): void {
    const time = Date.now() * 0.001;
    vinylGroup.position.y += Math.sin(time * 2) * amplitude;
    vinylGroup.rotation.z = Math.sin(time) * 0.08;
  }

  static animateBounce(vinylGroup: THREE.Group): void {
    const time = Date.now() * 0.001;
    const bounce = Math.abs(Math.sin(time * 3)) * 0.02;
    vinylGroup.position.y += bounce;
  }
}
