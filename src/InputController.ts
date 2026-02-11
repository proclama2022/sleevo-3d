import * as THREE from 'three';
import { SceneRenderer } from './SceneRenderer';

export class InputController {
  private raycaster: THREE.Raycaster;
  private pointer: THREE.Vector2;
  private selectedVinyl: THREE.Object3D | null = null;
  private isDragging: boolean = false;
  private dragPlane: THREE.Plane;
  private dragOffset: THREE.Vector3;
  private hoveredVinyl: THREE.Object3D | null = null;

  constructor(
    private sceneRenderer: SceneRenderer,
    private onVinylDrop: (vinyl: THREE.Object3D, row: number, col: number) => void
  ) {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    // Drag plane pointing to camera (z-axis), so vinyl can move freely in z
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.dragOffset = new THREE.Vector3();

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
    
    // Update debug indicator
    const debug = document.getElementById('touch-debug');
    if (debug) {
      debug.textContent = `👆 Touch (${this.pointer.x.toFixed(2)}, ${this.pointer.y.toFixed(2)})`;
      debug.style.background = 'rgba(76, 175, 80, 0.9)';
    }

    this.raycaster.setFromCamera(this.pointer, this.sceneRenderer.getCamera() as THREE.PerspectiveCamera);
    
    const scene = this.sceneRenderer.getScene();
    const vinylsGroup = scene.getObjectByName('vinyls-group') as THREE.Group;
    if (!vinylsGroup) {
      console.log('❌ No vinyls group found!');
      if (debug) debug.textContent = '❌ No vinyls group';
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

        // Visual feedback - scale up
        this.selectedVinyl.scale.set(2.0, 2.0, 2.0);
        
        (this.selectedVinyl as any).userData.originalPosition = this.selectedVinyl.position.clone();
        (this.selectedVinyl as any).userData.isDragging = true; // Stop carousel animation

        // Visual feedback - scale up (smaller) + move forward a bit
        this.selectedVinyl.scale.set(1.8, 1.8, 1.8);
        this.selectedVinyl.position.z += 0.3; // Smaller offset - ends at 1.8

        console.log('✅ Vinyl grabbed at z:', this.selectedVinyl.position.z.toFixed(2));
        if (debug) {
          debug.textContent = `✅ Grabbed ${this.selectedVinyl.name}`;
          debug.style.background = 'rgba(33, 150, 243, 0.9)';
        }
        
        // Remove hint arrow when first vinyl is grabbed
        const arrow = scene.getObjectByName('hint-arrow');
        if (arrow) {
          arrow.visible = false;
        }
      } else {
        console.log('❌ Could not find vinyl group in parents (attempts:', attempts, ')');
        if (debug) debug.textContent = '❌ Hit but not vinyl';
      }
    } else {
      console.log('❌ No intersection detected - maybe touch outside canvas?');
      if (debug) debug.textContent = '❌ No hit';
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
        
        const debug = document.getElementById('touch-debug');
        if (debug) {
          debug.textContent = `🎯 ${intersectPoint.x.toFixed(1)}, ${intersectPoint.y.toFixed(1)} z=${intersectPoint.z.toFixed(1)}`;
        }
      }
    }
  }

  private onPointerUp(event: MouseEvent | TouchEvent): void {
    event.preventDefault();

    console.log('👋 Touch/click released');
    
    const debug = document.getElementById('touch-debug');

    if (this.isDragging && this.selectedVinyl) {
      const userData = (this.selectedVinyl as any).userData;
      
      // Reset scale to carousel size
      this.selectedVinyl.scale.set(1.5, 1.5, 1.5);

      const pos = this.selectedVinyl.position;
      
      // Snap to shelf grid logic
      const { row, col, snapped } = this.snapToShelfGrid(pos);
      
      if (snapped) {
        // Valid drop on shelf!
        console.log('✅ Vinyl dropped on shelf:', `row=${row}, col=${col}`);
        
        // Call callback to register the drop
        this.onVinylDrop(this.selectedVinyl, row, col);
        
        // Keep vinyl on shelf (don't return to carousel)
        userData.isDragging = false;
        
        if (debug) {
          debug.textContent = `✅ Placed at R${row}C${col}`;
          debug.style.background = 'rgba(76, 175, 80, 0.9)';
        }
      } else {
        // Invalid drop - return to carousel
        console.log('❌ Dropped outside shelf - returning to carousel');
        
        const originalPos = userData.originalPosition;
        if (originalPos) {
          this.selectedVinyl.position.copy(originalPos);
        }
        
        userData.isDragging = false;
        
        if (debug) {
          debug.textContent = '❌ Missed shelf!';
          debug.style.background = 'rgba(239, 68, 68, 0.9)';
        }
      }

      console.log('Drop position:', pos.x.toFixed(2), pos.y.toFixed(2), pos.z.toFixed(2));

      this.selectedVinyl = null;
      this.isDragging = false;
    } else {
      console.log('❌ No vinyl was being dragged');
      if (debug) {
        debug.textContent = '👆 Touch & drag vinyl';
        debug.style.background = 'rgba(255, 170, 0, 0.9)';
      }
    }
  }

  private snapToShelfGrid(position: THREE.Vector3): { row: number, col: number, snapped: boolean } {
    // Shelf dimensions (from GameManager buildShelf)
    const rows = 3;
    const cols = 5;
    const slotWidth = 1.2;
    const shelfWidth = cols * slotWidth;
    const shelfHeight = rows * 0.8;
    const shelfYStart = -(rows - 1) * 0.8 / 2;
    
    // Check if drop is within shelf bounds
    const x = position.x;
    const y = position.y;
    const z = position.z;
    
    console.log('Snap check:', `x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)}`);
    console.log('Shelf bounds:', `x=[${-(shelfWidth/2).toFixed(2)}, ${(shelfWidth/2).toFixed(2)}], y=[${(shelfYStart - shelfHeight/2).toFixed(2)}, ${(shelfYStart + shelfHeight/2).toFixed(2)}]`);
    
    // Shelf is at z=0, so if z is positive, it's not on shelf
    if (z > 0.5) {
      console.log('❌ Too far forward (z > 0.5)');
      return { row: 0, col: 0, snapped: false };
    }
    
    // Check X bounds
    if (x < -shelfWidth / 2 || x > shelfWidth / 2) {
      console.log('❌ X out of bounds');
      return { row: 0, col: 0, snapped: false };
    }
    
    // Check Y bounds
    if (y < shelfYStart - shelfHeight / 2 || y > shelfYStart + shelfHeight / 2) {
      console.log('❌ Y out of bounds');
      return { row: 0, col: 0, snapped: false };
    }
    
    // Calculate nearest grid cell
    // Grid Y starts at top and goes down (negative Y)
    const relativeY = y - shelfYStart + shelfHeight / 2;
    const rowFromY = Math.floor((shelfHeight / 2 - relativeY) / 0.8);
    const row = Math.max(0, Math.min(rows - 1, rowFromY));
    
    // Grid X goes from left to right (negative to positive)
    const relativeX = x + shelfWidth / 2;
    const colFromX = Math.floor(relativeX / slotWidth);
    const col = Math.max(0, Math.min(cols - 1, colFromX));
    
    // Calculate snap position (center of cell)
    const snapX = (col - cols / 2) * slotWidth;
    const snapY = shelfYStart + (row - rows / 2) * 0.8;
    const snapZ = 0; // Shelf surface
    
    // Snap the vinyl to this position
    position.x = snapX;
    position.y = snapY;
    position.z = snapZ;
    
    console.log('✅ Snapped to:', `row=${row}, col=${col}, pos=(${snapX.toFixed(2)}, ${snapY.toFixed(2)}, ${snapZ.toFixed(2)})`);
    
    return { row, col, snapped: true };
  }

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
