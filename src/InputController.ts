import * as THREE from 'three';
import { SceneRenderer } from './SceneRenderer';

export class InputController {
  private raycaster: THREE.Raycaster;
  private pointer: THREE.Vector2;
  private selectedVinyl: THREE.Object3D | null = null;
  private isDragging: boolean = false;
  private dragPlane: THREE.Plane;

  constructor(
    private sceneRenderer: SceneRenderer,
    private onVinylDrop: (vinyl: THREE.Object3D, row: number, col: number) => void
  ) {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    // Drag plane pointing to camera (z-axis), so vinyl can move freely in z
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const canvas = this.sceneRenderer.getRenderer().domElement;

    // Touch events (mobile)
    canvas.addEventListener('touchstart', this.onPointerDown.bind(this), { passive: false });
    canvas.addEventListener('touchmove', this.onPointerMove.bind(this), { passive: false });
    canvas.addEventListener('touchend', this.onPointerUp.bind(this), { passive: false });

    // Mouse events (desktop)
    canvas.addEventListener('mousedown', this.onPointerDown.bind(this));
    canvas.addEventListener('mousemove', this.onPointerMove.bind(this));
    canvas.addEventListener('mouseup', this.onPointerUp.bind(this));
  }

  private getPointerPosition(event: MouseEvent | TouchEvent): void {
    const canvas = this.sceneRenderer.getRenderer().domElement;
    const rect = canvas.getBoundingClientRect();

    let clientX: number;
    let clientY: number;

    if (event instanceof TouchEvent) {
      clientX = event.touches[0]?.clientX || event.changedTouches[0].clientX;
      clientY = event.touches[0]?.clientY || event.changedTouches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  private onPointerDown(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.getPointerPosition(event);

    console.log('👆 Touch/click at:', this.pointer.x.toFixed(2), this.pointer.y.toFixed(2));

    this.raycaster.setFromCamera(this.pointer, this.sceneRenderer.getCamera() as THREE.PerspectiveCamera);
    
    const scene = this.sceneRenderer.getScene();
    const vinylsGroup = scene.getObjectByName('vinyls-group') as THREE.Group;
    if (!vinylsGroup) {
      console.log('❌ No vinyls group found!');
      return;
    }

    // Raycast against ALL children (including invisible helpers)
    const intersects = this.raycaster.intersectObjects(vinylsGroup.children, true);
    console.log('🎯 Intersects:', intersects.length);
    
    if (intersects.length > 0) {
      console.log('First hit:', intersects[0].object.name, 'type:', intersects[0].object.type);
      
      // Find the vinyl group (navigate up to find object with 'vinyl-' name)
      let vinyl = intersects[0].object;
      let attempts = 0;
      while (vinyl && !vinyl.name.startsWith('vinyl-') && attempts < 10) {
        vinyl = vinyl.parent as THREE.Object3D;
        attempts++;
      }

      if (vinyl && vinyl.name.startsWith('vinyl-')) {
        this.selectedVinyl = vinyl;
        this.isDragging = true;

        // SETUP DRAG PLANE pointing to camera (allows free z movement)
        const camera = this.sceneRenderer.getCamera() as THREE.PerspectiveCamera;
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        // Create plane at vinyl position, facing camera
        this.dragPlane.setFromNormalAndCoplanarPoint(
          cameraDirection,  // Pointing at camera
          this.selectedVinyl.position
        );

        (this.selectedVinyl as any).userData.originalPosition = this.selectedVinyl.position.clone();
        (this.selectedVinyl as any).userData.originalScale = this.selectedVinyl.scale.clone();
        (this.selectedVinyl as any).userData.isDragging = true; // Stop carousel animation

        // ── DRAG FEEDBACK: aumento leggero rispetto alla scala corrente
        const originalScale = (this.selectedVinyl as any).userData.originalScale as THREE.Vector3;
        const targetScale = originalScale.clone().multiplyScalar(1.08);
        this.animateScale(this.selectedVinyl, targetScale, 140);

        // Lift forward smoothly
        const targetPos = this.selectedVinyl.position.clone();
        targetPos.z += 0.3;
        this.animatePosition(this.selectedVinyl, targetPos, 140);

        // Subtle tilt rotation (2-3 degrees)
        this.animateRotation(this.selectedVinyl, new THREE.Euler(0, 0, 0.04), 140);

        // Add drop shadow plane
        this.addDropShadow(this.selectedVinyl);

        console.log('✅ Vinyl grabbed at z:', this.selectedVinyl.position.z.toFixed(2));

        // Hide hint arrow on first grab
        const arrow = scene.getObjectByName('hint-arrow');
        if (arrow) {
          arrow.visible = false;
        }
      } else {
        console.log('❌ Could not find vinyl group in parents (attempts:', attempts, ')');
      }
    } else {
      console.log('❌ No intersection detected - maybe touch outside canvas?');
    }
  }

  private onPointerMove(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.getPointerPosition(event);

    if (this.isDragging && this.selectedVinyl) {
      // Update drag plane to follow vinyl
      // SETUP DRAG PLANE pointing to camera (allows free z movement)
      const camera = this.sceneRenderer.getCamera() as THREE.PerspectiveCamera;
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      this.dragPlane.setFromNormalAndCoplanarPoint(
        cameraDirection,  // Pointing at camera
        this.selectedVinyl.position
      );

      this.raycaster.setFromCamera(this.pointer, this.sceneRenderer.getCamera() as THREE.PerspectiveCamera);
      
      const intersectPoint = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint)) {
        // Also raycast to shelf to see where we are
        const scene = this.sceneRenderer.getScene();
        const shelfGroup = scene.getObjectByName('shelf-group') as THREE.Group;
        
        this.selectedVinyl.position.copy(intersectPoint);
        
        // Raycast to shelf to check z
        const shelfRaycaster = new THREE.Raycaster();
        shelfRaycaster.setFromCamera(this.pointer, this.sceneRenderer.getCamera() as THREE.PerspectiveCamera);
        const shelfIntersects = shelfRaycaster.intersectObjects(shelfGroup?.children || [], true);
        
        const zOnShelf = shelfIntersects.length > 0 ? shelfIntersects[0].point.z : null;
        console.log('📍 Vinyl z:', intersectPoint.z.toFixed(2), 'Shelf z:', zOnShelf?.toFixed(2) || 'null');
      }
    }
  }

  private onPointerUp(event: MouseEvent | TouchEvent): void {
    event.preventDefault();

    console.log('👋 Touch/click released');

    if (this.isDragging && this.selectedVinyl) {
      const userData = (this.selectedVinyl as any).userData;
      const pos = this.selectedVinyl.position;

      // Snap to shelf grid logic
      const { row, col, snapped } = this.snapToShelfGrid(pos);

      if (snapped) {
        // ✅ Valid drop - green glow + micro bounce
        console.log('✅ Vinyl dropped on shelf:', `row=${row}, col=${col}`);

        // Remove drop shadow and tilt
        this.removeDropShadow(this.selectedVinyl);
        this.animateRotation(this.selectedVinyl, new THREE.Euler(0, 0, 0), 180);

        // Add green glow to slot
        this.playSlotGlow(this.selectedVinyl, 0x22C55E, 280);

        // Micro bounce animation
        this.playBounceAnimation(this.selectedVinyl, () => {
          // Se il vinile è stato posato nello scaffale, mantiene la scala/style deciso dal GameManager.
          if (!(this.selectedVinyl as any)?.userData?.isPlaced) {
            const originalScale = userData.originalScale || new THREE.Vector3(1.32, 1.32, 1.32);
            this.selectedVinyl!.scale.copy(originalScale);
          }
          userData.isDragging = false;
        });

        // Call callback to register the drop
        this.onVinylDrop(this.selectedVinyl, row, col);
      } else {
        // ❌ Invalid drop - shake horizontal + red flash
        console.log('❌ Dropped outside shelf - returning to carousel');

        // Remove drop shadow and tilt
        this.removeDropShadow(this.selectedVinyl);
        this.animateRotation(this.selectedVinyl, new THREE.Euler(0, 0, 0), 180);

        // Red flash
        this.playErrorFlash(this.selectedVinyl, 180);

        // Shake animation
        this.playShakeAnimation(this.selectedVinyl, () => {
          // Return to carousel after shake
          const originalPos = userData.originalPosition;
          const originalScale = userData.originalScale || new THREE.Vector3(1.32, 1.32, 1.32);

          if (originalPos) {
            this.animatePosition(this.selectedVinyl!, originalPos, 300);
          }
          this.animateScale(this.selectedVinyl!, originalScale, 300);

          userData.isDragging = false;
        });
      }

      console.log('Drop position:', pos.x.toFixed(2), pos.y.toFixed(2), pos.z.toFixed(2));

      this.selectedVinyl = null;
      this.isDragging = false;
    } else {
      console.log('❌ No vinyl was being dragged');
    }
  }

  private snapToShelfGrid(position: THREE.Vector3): { row: number, col: number, snapped: boolean } {
    // Shelf dimensions (from GameManager buildShelf)
    const rows = 3;
    const cols = 5;
    const slotWidth = 0.8;  // MUST match GameManager buildShelf!
    const rowHeight = 0.8;
    const shelfWidth = cols * slotWidth;
    const shelfHeight = rows * rowHeight;
    
    // Check if drop is within shelf bounds
    const x = position.x;
    const y = position.y;
    const z = position.z;
    
    console.log('Snap check:', `x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)}`);

    // Shelf bounds: centered at origin (0,0,0)
    // X: from -(shelfWidth/2) to +(shelfWidth/2)
    // Y: from -(shelfHeight/2) to +(shelfHeight/2)
    // Z: shelf surface is at z=0

    const minX = -shelfWidth / 2;
    const maxX = shelfWidth / 2;
    const minY = -shelfHeight / 2;
    const maxY = shelfHeight / 2;

    console.log('Shelf bounds:', `x=[${minX.toFixed(2)}, ${maxX.toFixed(2)}], y=[${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);

    // Check if position is within shelf bounds (only X and Y matter, Z will be snapped)
    if (x < minX || x > maxX) {
      console.log('❌ X out of bounds');
      return { row: 0, col: 0, snapped: false };
    }

    if (y < minY || y > maxY) {
      console.log('❌ Y out of bounds');
      return { row: 0, col: 0, snapped: false };
    }

    // Don't check Z - we'll snap it to the shelf surface regardless
    console.log('✅ Within XY bounds, will snap to shelf');

    // Calculate which grid cell the vinyl is in
    // Grid cells are centered. GameManager uses: x = (col - cols/2) * slotWidth for LEFT edge
    // Cell center is at: (col - cols/2 + 0.5) * slotWidth

    // Find column: which cell is x in?
    const colFloat = (x / slotWidth) + (cols / 2);
    const col = Math.max(0, Math.min(cols - 1, Math.floor(colFloat)));

    // Find row: which cell is y in?
    // GameManager: bottom of bin row is at y = (row - rows/2) * rowHeight
    // Center of bin is at: y = (row - rows/2 + 0.5) * rowHeight
    const rowFloat = (y / rowHeight) + (rows / 2);
    const row = Math.max(0, Math.min(rows - 1, Math.floor(rowFloat)));

    // Calculate snap position (center of cell)
    const snapX = (col - cols / 2 + 0.5) * slotWidth;
    const snapY = (row - rows / 2 + 0.5) * rowHeight;
    const snapZ = 0.02; // Slightly in front of shelf surface to avoid z-fighting
    
    // Snap the vinyl to this position
    position.x = snapX;
    position.y = snapY;
    position.z = snapZ;
    
    console.log('✅ Snapped to:', `row=${row}, col=${col}, pos=(${snapX.toFixed(2)}, ${snapY.toFixed(2)}, ${snapZ.toFixed(2)})`);
    
    return { row, col, snapped: true };
  }

  // ═══════════════════════════════════════════════════════════
  // ANIMATION HELPERS (Smooth Feedback)
  // ═══════════════════════════════════════════════════════════

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  private easeOutQuad(t: number): number {
    return 1 - (1 - t) * (1 - t);
  }

  private animateScale(object: THREE.Object3D, targetScale: THREE.Vector3, duration: number): void {
    const startScale = object.scale.clone();
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = this.easeOutCubic(t);

      object.scale.lerpVectors(startScale, targetScale, eased);

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  private animatePosition(object: THREE.Object3D, targetPos: THREE.Vector3, duration: number): void {
    const startPos = object.position.clone();
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = this.easeOutQuad(t);

      object.position.lerpVectors(startPos, targetPos, eased);

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  private animateRotation(object: THREE.Object3D, targetRotation: THREE.Euler, duration: number): void {
    const startRotation = object.rotation.clone();
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = this.easeOutQuad(t);

      object.rotation.x = startRotation.x + (targetRotation.x - startRotation.x) * eased;
      object.rotation.y = startRotation.y + (targetRotation.y - startRotation.y) * eased;
      object.rotation.z = startRotation.z + (targetRotation.z - startRotation.z) * eased;

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  private addDropShadow(vinyl: THREE.Object3D): void {
    const existingShadow = vinyl.getObjectByName('drop-shadow');
    if (existingShadow) {
      vinyl.remove(existingShadow);
    }

    const shadowGeometry = new THREE.PlaneGeometry(0.5, 0.5);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.name = 'drop-shadow';
    shadow.position.set(0, -0.2, -0.15);
    shadow.rotation.x = -Math.PI / 2;
    vinyl.add(shadow);
  }

  private removeDropShadow(vinyl: THREE.Object3D): void {
    const shadow = vinyl.getObjectByName('drop-shadow');
    if (shadow) {
      vinyl.remove(shadow);
    }
  }

  private playShakeAnimation(object: THREE.Object3D, onComplete?: () => void): void {
    const startPos = object.position.clone();
    const startTime = Date.now();
    const shakeOffsets = [0.06, -0.06, 0.04, -0.04, 0.02, -0.02, 0];
    const shakeDuration = 30;

    let shakeIndex = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const totalDuration = shakeOffsets.length * shakeDuration;

      if (elapsed < totalDuration) {
        shakeIndex = Math.floor(elapsed / shakeDuration);
        const offset = shakeOffsets[shakeIndex] || 0;
        object.position.x = startPos.x + offset;
        requestAnimationFrame(animate);
      } else {
        object.position.x = startPos.x;
        if (onComplete) onComplete();
      }
    };
    animate();
  }

  private playBounceAnimation(object: THREE.Object3D, onComplete?: () => void): void {
    const startTime = Date.now();
    const baseScale = object.scale.clone();
    const bounceHeight = 0.08;
    const startY = object.position.y;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const duration = 260;

      if (elapsed < duration) {
        const t = elapsed / duration;
        const bounce = Math.sin(t * Math.PI * 2.5) * (1 - t) * bounceHeight;
        object.position.y = startY + bounce;

        const squash = 1 + Math.abs(bounce) * 0.15;
        object.scale.set(baseScale.x / squash, baseScale.y * squash, baseScale.z);

        requestAnimationFrame(animate);
      } else {
        object.position.y = startY;
        object.scale.copy(baseScale);
        if (onComplete) onComplete();
      }
    };
    animate();
  }

  private playSlotGlow(vinyl: THREE.Object3D, color: number, duration: number): void {
    const glowGeometry = new THREE.PlaneGeometry(0.5, 0.5);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.name = 'slot-glow';
    glow.position.set(0, 0, -0.01);
    vinyl.add(glow);

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = elapsed / duration;

      if (t < 1) {
        glowMaterial.opacity = 0.6 * (1 - t);
        const scale = 1 + t * 0.3;
        glow.scale.set(scale, scale, 1);
        requestAnimationFrame(animate);
      } else {
        vinyl.remove(glow);
        glow.geometry.dispose();
        glowMaterial.dispose();
      }
    };
    animate();
  }

  private playErrorFlash(vinyl: THREE.Object3D, duration: number): void {
    const cover = vinyl.children.find((c) => (c as any).material?.map !== undefined);
    if (!cover) return;

    const mesh = cover as THREE.Mesh;
    const originalMaterial = mesh.material;
    const flashMaterial = new THREE.MeshStandardMaterial({
      color: 0xEF4444,
      roughness: 0.6,
      metalness: 0.0,
      transparent: true,
      opacity: 0.6,
    });

    mesh.material = flashMaterial;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = elapsed / duration;

      if (t < 1) {
        flashMaterial.opacity = 0.6 * (1 - t);
        requestAnimationFrame(animate);
      } else {
        mesh.material = originalMaterial;
        flashMaterial.dispose();
      }
    };
    animate();
  }

  // ═══════════════════════════════════════════════════════════

  public dispose(): void {
    const canvas = this.sceneRenderer.getRenderer().domElement;
    canvas.removeEventListener('touchstart', this.onPointerDown.bind(this));
    canvas.removeEventListener('touchmove', this.onPointerMove.bind(this));
    canvas.removeEventListener('touchend', this.onPointerUp.bind(this));
    canvas.removeEventListener('mousedown', this.onPointerDown.bind(this));
    canvas.removeEventListener('mousemove', this.onPointerMove.bind(this));
    canvas.removeEventListener('mouseup', this.onPointerUp.bind(this));
  }
}
