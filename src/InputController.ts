import * as THREE from 'three';
import { SceneRenderer } from './SceneRenderer';
import { getColumnForGenre, getColumnForVinylId, getColumnLabel } from './gameRules';

// Shelf configuration interface for Single Row mode
export interface ShelfConfig {
  rows: number;
  cols: number;
  slotWidth: number;
  rowHeight: number;
}

export class InputController {
  private raycaster: THREE.Raycaster;
  private pointer: THREE.Vector2;
  private selectedVinyl: THREE.Object3D | null = null;
  private isDragging: boolean = false;
  private dragPlane: THREE.Plane;
  private instructionEl: HTMLElement | null = null;
  private defaultInstructionText: string = '';
  private dragHintEl: HTMLDivElement | null = null;
  private pickupHintEl: HTMLElement | null = null;
  private onboardingEl: HTMLElement | null = null;
  private onboardingStepGrabEl: HTMLElement | null = null;
  private onboardingStepDropEl: HTMLElement | null = null;
  private targetArrowEl: HTMLElement | null = null;
  private targetArrowLabelEl: HTMLElement | null = null;
  private onboardingStarted: boolean = false;
  private onboardingCompleted: boolean = false;
  private targetArrowIntroUsed: boolean = false;
  private showTargetArrowThisDrag: boolean = false;
  private pointerClientX: number = 0;
  private pointerClientY: number = 0;

  // 🎨 NEW: Trail effect for smooth drag visualization
  private dragTrail: THREE.Mesh[] = [];
  private trailMaxLength: number = 6;

  // Shelf configuration - can be updated dynamically
  private shelfConfig: ShelfConfig = {
    rows: 1,      // Single Row: always 1
    cols: 8,      // Default to 8 columns (one per vinyl)
    slotWidth: 0.8,
    rowHeight: 0.8,
  };

  constructor(
    private sceneRenderer: SceneRenderer,
    private onVinylDrop: (vinyl: THREE.Object3D, row: number, col: number) => void,
    private onDropPreview?: (col: number, isValid: boolean) => void,
    private onDropPreviewClear?: () => void,
    private onTargetColumnPreview?: (col: number) => void,
    private onTargetColumnPreviewClear?: () => void,
    private onInvalidDrop?: () => void,
    private canDropInColumn?: (col: number) => boolean
  ) {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    // Drag plane pointing to camera (z-axis), so vinyl can move freely in z
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.instructionEl = document.getElementById('instruction');
    this.defaultInstructionText = this.instructionEl?.textContent?.trim() || '';
    this.pickupHintEl = document.getElementById('pickup-hint');
    this.onboardingEl = document.getElementById('onboarding');
    this.onboardingStepGrabEl = document.getElementById('onboarding-step-grab');
    this.onboardingStepDropEl = document.getElementById('onboarding-step-drop');
    this.targetArrowEl = document.getElementById('target-column-arrow');
    this.targetArrowLabelEl = document.getElementById('target-column-arrow-label');
    this.createDragHintElement();
    this.updateOnboardingVisuals();

    this.setupEventListeners();
  }

  private isColumnAvailableForDrop(col: number): boolean {
    if (!this.canDropInColumn) return true;
    return this.canDropInColumn(col);
  }

  /**
   * Update shelf configuration for Single Row mode
   * @param cols - Number of columns (should match number of vinyls)
   * @param slotWidth - Width of each slot
   * @param rowHeight - Height of each row (usually same as slotWidth for single row)
   */
  public setShelfConfig(cols: number, slotWidth?: number, rowHeight?: number): void {
    this.shelfConfig = {
      rows: 1,  // Single Row: always 1
      cols: cols,
      slotWidth: slotWidth ?? this.shelfConfig.slotWidth,
      rowHeight: rowHeight ?? this.shelfConfig.rowHeight,
    };
  }

  /**
   * Get current shelf configuration
   */
  public getShelfConfig(): ShelfConfig {
    return { ...this.shelfConfig };
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
    this.pointerClientX = clientX;
    this.pointerClientY = clientY;

    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  private onPointerDown(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.getPointerPosition(event);


    this.raycaster.setFromCamera(this.pointer, this.sceneRenderer.getCamera() as THREE.PerspectiveCamera);
    
    const scene = this.sceneRenderer.getScene();
    const vinylsGroup = scene.getObjectByName('vinyls-group') as THREE.Group;
    if (!vinylsGroup) {
      return;
    }

    // Raycast against ALL children (including invisible helpers)
    const intersects = this.raycaster.intersectObjects(vinylsGroup.children, true);
    
    if (intersects.length > 0) {
      
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
        this.hidePickupHint();
        this.startOnboardingIfNeeded();
        if (!this.targetArrowIntroUsed && !this.onboardingCompleted) {
          this.targetArrowIntroUsed = true;
          this.showTargetArrowThisDrag = true;
        }

        (this.selectedVinyl as any).userData.originalPosition = this.selectedVinyl.position.clone();
        (this.selectedVinyl as any).userData.originalScale = this.selectedVinyl.scale.clone();
        (this.selectedVinyl as any).userData.isDragging = true; // Stop carousel animation

        // 🎨 NEW: Haptic feedback on grab (mobile devices)
        this.triggerHaptic('light');

        // 🎨 NEW: Particle burst on grab
        this.playGrabParticles(this.selectedVinyl);

        // ── DRAG FEEDBACK: aumento leggero rispetto alla scala corrente
        const originalScale = (this.selectedVinyl as any).userData.originalScale as THREE.Vector3;
        const targetScale = originalScale.clone().multiplyScalar(1.08);
        this.animateScale(this.selectedVinyl, targetScale, 140);

        // Lift forward smoothly
        const targetPos = this.selectedVinyl.position.clone();
        targetPos.z += 0.3;
        this.animatePosition(this.selectedVinyl, targetPos, 140);

        // SETUP DRAG PLANE - at the TARGET position (after lift) for accurate dragging
        // Plane parallel to screen - this ensures the vinyl follows the finger/mouse directly
        this.dragPlane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 0, 1),  // Normal pointing towards camera
          new THREE.Vector3(0, 0, targetPos.z)
        );

        // Subtle tilt rotation (2-3 degrees)
        this.animateRotation(this.selectedVinyl, new THREE.Euler(0, 0, 0.04), 140);

        // Add drop shadow plane
        this.addDropShadow(this.selectedVinyl);


        // Hide hint arrow on first grab
        const arrow = scene.getObjectByName('hint-arrow');
        if (arrow) {
          arrow.visible = false;
        }

        const vinylId = (this.selectedVinyl as any)?.userData?.vinyl?.id as string | undefined;
        if (!this.onboardingCompleted && vinylId) {
          const expectedCol = getColumnForVinylId(vinylId);
          if (expectedCol !== null) {
            this.onTargetColumnPreview?.(expectedCol);
            if (this.showTargetArrowThisDrag) {
              this.showTargetArrowForCol(expectedCol);
            }
          }
        }
      } else {
      }
    } else {
    }
  }

  private onPointerMove(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.getPointerPosition(event);

    if (this.isDragging && this.selectedVinyl) {
      this.raycaster.setFromCamera(this.pointer, this.sceneRenderer.getCamera() as THREE.PerspectiveCamera);

      // Use the pre-configured drag plane (parallel to screen) for direct mouse following
      // This ensures the vinyl follows the finger/mouse directly without diagonal movement
      const intersectPoint = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint)) {
        this.selectedVinyl.position.x = intersectPoint.x;
        this.selectedVinyl.position.y = intersectPoint.y;
        // Z stays on the drag plane (parallel to screen)

        // 🎨 NEW: Update drag trail for smooth visual feedback
        this.updateDragTrail(this.selectedVinyl);
      }

      // Use the current vinyl position for hover detection
      const hovered = this.getHoveredCell(this.selectedVinyl.position);
      const vinylId = (this.selectedVinyl as any)?.userData?.vinyl?.id as string | undefined;
      const vinylGenre = (this.selectedVinyl as any)?.userData?.vinyl?.genre as string | undefined;
      if (!this.onboardingCompleted && vinylId) {
        const expectedCol = getColumnForVinylId(vinylId);
        if (expectedCol !== null) {
          this.onTargetColumnPreview?.(expectedCol);
          if (this.showTargetArrowThisDrag) {
            this.showTargetArrowForCol(expectedCol);
          }
        }
      }
      if (hovered.inside && hovered.col !== null && vinylId) {
        const expectedCol = getColumnForVinylId(vinylId);
        const isGenreMatch = this.isGenreCompatibleWithColumn(vinylGenre, hovered.col);
        const isExactColumn = expectedCol !== null && expectedCol === hovered.col;
        const isSlotFree = this.isColumnAvailableForDrop(hovered.col);
        const isValid = isGenreMatch && isExactColumn && isSlotFree;
        this.onDropPreview?.(hovered.col, isValid);
        this.updateInstructionDrag(vinylGenre || '', isValid, vinylId, hovered.col, isSlotFree);
        this.updateDragHint(vinylGenre || '', hovered.col, isValid, vinylId, isSlotFree);
      } else {
        this.onDropPreviewClear?.();
        this.resetInstruction();
        this.hideDragHint();
      }
    }
  }

  private onPointerUp(event: MouseEvent | TouchEvent): void {
    event.preventDefault();


    if (this.isDragging && this.selectedVinyl) {
      const userData = (this.selectedVinyl as any).userData;
      const pos = this.selectedVinyl.position;

      // Snap to shelf grid logic
      const { row, col, snapped } = this.snapToShelfGrid(pos);

      const vinylId = userData.vinyl?.id as string | undefined;
      const vinylGenre = userData.vinyl?.genre as string | undefined;
      const expectedCol = vinylId ? getColumnForVinylId(vinylId) : getColumnForGenre(vinylGenre);
      const isGenreMatch = this.isGenreCompatibleWithColumn(vinylGenre, col);
      const isExactColumn = expectedCol !== null && col === expectedCol;
      const isSlotFree = this.isColumnAvailableForDrop(col);
      const canPlace = snapped && isGenreMatch && isExactColumn && isSlotFree;

      if (canPlace) {
        // ✅ Valid drop - green glow + micro bounce

        // 🎨 NEW: Haptic feedback on successful drop (medium strength)
        this.triggerHaptic('medium');

        // Remove drop shadow.
        // Non resettiamo la rotazione qui: dopo il drop il GameManager orienta il vinile di lato.
        this.removeDropShadow(this.selectedVinyl);

        // Register drop first so bounce starts from final shelf pose/style.
        this.onVinylDrop(this.selectedVinyl, row, col);
        this.completeOnboardingIfNeeded();

        // 🎨 ENHANCED: Multi-layer success feedback
        this.playSlotGlow(this.selectedVinyl, 0xDAA520, 180);           // Warm glow
        this.playRadialPulse(this.selectedVinyl, 0xDAA520, 500);        // Radial waves
        this.playDropSparkles(this.selectedVinyl, 0xFFD700);            // Golden sparkles

        // Gentle shelf settle (less arcade, more natural)
        this.playShelfSettleAnimation(this.selectedVinyl, () => {
          userData.isDragging = false;
        });
      } else {
        // ❌ Invalid drop - shake horizontal + red flash
        if (snapped && !isGenreMatch) {
          // Wrong genre column
        } else if (snapped && isGenreMatch && !isExactColumn) {
          // Wrong slot in correct genre
        } else if (snapped && !isSlotFree) {
          // Slot occupied
        } else {
          // Outside shelf
        }

        // 🎨 NEW: Haptic feedback on error (heavy strength for clear negative feedback)
        this.triggerHaptic('heavy');

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
        this.onInvalidDrop?.();
      }

      this.onDropPreviewClear?.();
      this.onTargetColumnPreviewClear?.();
      this.hideTargetArrow();
      this.showTargetArrowThisDrag = false;
      this.resetInstruction();
      this.hideDragHint();

      // 🎨 NEW: Clear drag trail on drop
      this.clearDragTrail();

      this.selectedVinyl = null;
      this.isDragging = false;
    } else {
    }
  }

  private getShelfWorldOffset(): { x: number; y: number } {
    const scene = this.sceneRenderer.getScene();
    const shelfGroup = scene.getObjectByName('shelf-group') as THREE.Group | null;
    if (!shelfGroup) {
      return { x: 0, y: 0 };
    }
    return {
      x: shelfGroup.position.x,
      y: shelfGroup.position.y,
    };
  }

  /**
   * Project a world position from the drag plane Z to the shelf Z along the camera ray.
   * This corrects for perspective distortion when the drag plane Z differs from the shelf Z.
   */
  private projectPositionToShelfZ(vinylPos: THREE.Vector3, targetZ: number): THREE.Vector3 {
    const cam = this.sceneRenderer.getCamera().position;
    // Parametric line from camera through vinyl position: P = cam + t*(vinylPos - cam)
    // Solve for t when P.z = targetZ
    const dz = vinylPos.z - cam.z;
    if (Math.abs(dz) < 0.0001) return vinylPos.clone(); // Avoid division by zero
    const t = (targetZ - cam.z) / dz;
    return new THREE.Vector3(
      cam.x + t * (vinylPos.x - cam.x),
      cam.y + t * (vinylPos.y - cam.y),
      targetZ
    );
  }

  private snapToShelfGrid(position: THREE.Vector3): { row: number, col: number, snapped: boolean } {
    // Single Row: rows is always 1, cols is dynamic
    const { rows, cols, slotWidth, rowHeight } = this.shelfConfig;
    const shelfWidth = cols * slotWidth;
    const shelfHeight = rows * rowHeight;
    const shelfOffset = this.getShelfWorldOffset();

    // Project vinyl position from drag plane Z to shelf surface Z to fix perspective offset.
    // shelfGroup is at world Z=0, shelf surface is at local Z≈0.12
    const shelfWorldZ = 0.12;
    const projected = this.projectPositionToShelfZ(position, shelfWorldZ);
    const refX = projected.x;
    const refY = projected.y;

    // Local coordinates relative to shelf center
    const x = refX - shelfOffset.x;
    const y = refY - shelfOffset.y;


    // Shelf bounds: centered at origin
    const minX = -shelfWidth / 2;
    const maxX = shelfWidth / 2;
    const minY = -shelfHeight / 2;
    const maxY = shelfHeight / 2;

    // Check X bounds (horizontal position within shelf)
    if (x < minX || x > maxX) {
      return { row: 0, col: 0, snapped: false };
    }

    // Single Row: simplified Y check - more lenient vertical bounds
    if (y < minY - 0.2 || y > maxY + 0.2) {
      return { row: 0, col: 0, snapped: false };
    }


    // Single Row: row is always 0
    const row = 0;

    // Find column: which cell is x in?
    const colFloat = (x / slotWidth) + (cols / 2);
    const col = Math.max(0, Math.min(cols - 1, Math.floor(colFloat)));

    // Calculate snap position (center of cell)
    const snapX = (col - cols / 2 + 0.5) * slotWidth;
    const snapY = 0;  // Single row: Y is always centered (0)
    const snapZ = 0.02; // Slightly in front of shelf surface

    // Snap the vinyl to this position
    position.x = snapX + shelfOffset.x;
    position.y = snapY + shelfOffset.y;
    position.z = snapZ;


    return { row, col, snapped: true };
  }

  private getHoveredCell(position: THREE.Vector3): { inside: boolean; row: number | null; col: number | null } {
    // Single Row: rows is always 1, cols is dynamic
    const { rows, cols, slotWidth, rowHeight } = this.shelfConfig;
    const shelfWidth = cols * slotWidth;
    const shelfHeight = rows * rowHeight;
    const shelfOffset = this.getShelfWorldOffset();

    // Project vinyl position from drag plane Z to shelf surface Z to fix perspective offset
    const shelfWorldZ = 0.12;
    const projected = this.projectPositionToShelfZ(position, shelfWorldZ);
    const refX = projected.x;
    const refY = projected.y;

    const localX = refX - shelfOffset.x;
    const localY = refY - shelfOffset.y;

    const minX = -shelfWidth / 2;
    const maxX = shelfWidth / 2;
    const minY = -shelfHeight / 2;
    const maxY = shelfHeight / 2;

    // Check X bounds
    if (localX < minX || localX > maxX) {
      return { inside: false, row: null, col: null };
    }

    // Single Row: more lenient Y check
    if (localY < minY - 0.2 || localY > maxY + 0.2) {
      return { inside: false, row: null, col: null };
    }

    // Calculate column from X position only
    const colFloat = (localX / slotWidth) + (cols / 2);
    const col = Math.max(0, Math.min(cols - 1, Math.floor(colFloat)));

    // Single Row: row is always 0
    const row = 0;

    return { inside: true, row, col };
  }

  private normalizeGenre(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');
  }

  private isGenreCompatibleWithColumn(vinylGenre: string | undefined, col: number | null): boolean {
    if (!vinylGenre || col === null) return false;
    const vinylGenreNormalized = this.normalizeGenre(vinylGenre);
    const columnLabelNormalized = this.normalizeGenre(getColumnLabel(col));
    return vinylGenreNormalized === columnLabelNormalized;
  }

  private updateInstructionDrag(
    vinylGenre: string,
    isValid: boolean,
    vinylId?: string,
    hoveredCol?: number,
    isSlotFree: boolean = true
  ): void {
    if (!this.instructionEl) return;
    const targetCol = vinylId ? getColumnForVinylId(vinylId) : getColumnForGenre(vinylGenre);
    const targetLabel = targetCol !== null ? getColumnLabel(targetCol) : vinylGenre.toUpperCase();
    const hoverLabel = typeof hoveredCol === 'number' ? getColumnLabel(hoveredCol) : '';
    if (isValid) {
      this.instructionEl.textContent = `Perfetto: ${vinylGenre.toUpperCase()} -> ${targetLabel}`;
    } else if (!isSlotFree && hoverLabel) {
      this.instructionEl.textContent = `Slot occupato: ${hoverLabel}. Cerca una colonna vuota.`;
    } else {
      this.instructionEl.textContent = `${vinylGenre.toUpperCase()} -> ${targetLabel}`;
    }
    this.instructionEl.style.color = isValid ? '#14532d' : '#7f1d1d';
  }

  private createDragHintElement(): void {
    const existing = document.getElementById('drag-genre-hint') as HTMLDivElement | null;
    if (existing) {
      this.dragHintEl = existing;
      return;
    }
    // Soft modern helper chip
    const el = document.createElement('div');
    el.id = 'drag-genre-hint';
    el.setAttribute('aria-hidden', 'true');
    el.style.position = 'fixed';
    el.style.zIndex = '60';
    el.style.pointerEvents = 'none';
    el.style.padding = '10px 16px';
    el.style.borderRadius = '999px';
    el.style.fontSize = '12px';
    el.style.fontWeight = '700';
    el.style.fontFamily = '"Manrope", "Arial", sans-serif';
    el.style.letterSpacing = '0.02em';
    el.style.textTransform = 'uppercase';
    el.style.color = '#0f172a';
    el.style.background = 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)';
    el.style.border = '1.5px solid #cbd5e1';
    el.style.boxShadow = '0 6px 14px rgba(148, 163, 184, 0.2)';
    el.style.display = 'none';
    document.body.appendChild(el);
    this.dragHintEl = el;
  }

  private updateDragHint(
    vinylGenre: string,
    hoverCol: number,
    isValid: boolean,
    vinylId?: string,
    isSlotFree: boolean = true
  ): void {
    if (!this.dragHintEl) return;
    const targetCol = vinylId ? getColumnForVinylId(vinylId) : getColumnForGenre(vinylGenre);
    const targetLabel = targetCol !== null ? getColumnLabel(targetCol) : vinylGenre.toUpperCase();
    const hoverLabel = getColumnLabel(hoverCol);
    if (isValid) {
      this.dragHintEl.textContent = `✓ ${targetLabel}`;
    } else if (!isSlotFree) {
      this.dragHintEl.textContent = `${hoverLabel} occupata`;
    } else {
      this.dragHintEl.textContent = `→ ${targetLabel} (ora: ${hoverLabel})`;
    }
    if (isValid) {
      this.dragHintEl.style.background = 'linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%)';
      this.dragHintEl.style.borderColor = '#10b981';
      this.dragHintEl.style.color = '#065f46';
    } else {
      this.dragHintEl.style.background = 'linear-gradient(145deg, #fef2f2 0%, #fee2e2 100%)';
      this.dragHintEl.style.borderColor = '#ef4444';
      this.dragHintEl.style.color = '#991b1b';
    }
    this.dragHintEl.style.display = 'block';
    this.positionDragHint();
  }

  private positionDragHint(): void {
    if (!this.dragHintEl) return;
    const x = Math.min(window.innerWidth - 240, Math.max(8, this.pointerClientX + 14));
    const y = Math.max(8, this.pointerClientY - 56);
    this.dragHintEl.style.left = `${x}px`;
    this.dragHintEl.style.top = `${y}px`;
  }

  private hideDragHint(): void {
    if (!this.dragHintEl) return;
    this.dragHintEl.style.display = 'none';
  }

  private resetInstruction(): void {
    if (!this.instructionEl) return;
    this.instructionEl.textContent = this.defaultInstructionText || 'Ogni vinile ha una colonna precisa e deve essere libera.';
    this.instructionEl.style.color = '';
  }

  public setIdleInstructionText(text: string): void {
    this.defaultInstructionText = text;
    if (this.isDragging || !this.instructionEl) return;
    this.instructionEl.textContent = text;
    this.instructionEl.style.color = '';
  }

  private hidePickupHint(): void {
    if (!this.pickupHintEl) return;
    this.pickupHintEl.classList.add('hidden');
  }

  private startOnboardingIfNeeded(): void {
    if (this.onboardingCompleted || this.onboardingStarted) return;
    this.onboardingStarted = true;
    this.updateOnboardingVisuals();
  }

  private completeOnboardingIfNeeded(): void {
    if (this.onboardingCompleted) return;
    this.onboardingCompleted = true;
    this.updateOnboardingVisuals();
  }

  private updateOnboardingVisuals(): void {
    if (this.onboardingStepGrabEl) {
      this.onboardingStepGrabEl.classList.remove('active', 'done');
      if (this.onboardingStarted || this.onboardingCompleted) {
        this.onboardingStepGrabEl.classList.add('done');
      } else {
        this.onboardingStepGrabEl.classList.add('active');
      }
    }

    if (this.onboardingStepDropEl) {
      this.onboardingStepDropEl.classList.remove('active', 'done');
      if (this.onboardingCompleted) {
        this.onboardingStepDropEl.classList.add('done');
      } else if (this.onboardingStarted) {
        this.onboardingStepDropEl.classList.add('active');
      }
    }

    if (this.onboardingEl) {
      if (this.onboardingCompleted) {
        this.onboardingEl.classList.add('hidden');
        this.hideTargetArrow();
        this.showTargetArrowThisDrag = false;
      } else {
        this.onboardingEl.classList.remove('hidden');
      }
    }
  }

  private showTargetArrowForCol(col: number): void {
    if (!this.targetArrowEl) return;

    const renderer = this.sceneRenderer.getRenderer();
    const camera = this.sceneRenderer.getCamera() as THREE.PerspectiveCamera;
    const rect = renderer.domElement.getBoundingClientRect();

    // Use dynamic cols from shelfConfig
    const { cols, slotWidth } = this.shelfConfig;
    const worldX = (col - cols / 2 + 0.5) * slotWidth;
    const worldY = 2.1;
    const worldZ = 0.25;
    const screenPos = new THREE.Vector3(worldX, worldY, worldZ).project(camera);

    const screenX = rect.left + (screenPos.x * 0.5 + 0.5) * rect.width;
    const screenY = rect.top + (-screenPos.y * 0.5 + 0.5) * rect.height;

    const clampedX = Math.max(24, Math.min(window.innerWidth - 24, screenX));
    const clampedY = Math.max(86, Math.min(window.innerHeight - 140, screenY));

    this.targetArrowEl.style.left = `${clampedX}px`;
    this.targetArrowEl.style.top = `${clampedY - 10}px`;
    this.targetArrowEl.classList.add('visible');

    if (this.targetArrowLabelEl) {
      this.targetArrowLabelEl.textContent = getColumnLabel(col);
    }
  }

  private hideTargetArrow(): void {
    if (!this.targetArrowEl) return;
    this.targetArrowEl.classList.remove('visible');
  }

  // ═══════════════════════════════════════════════════════════
  // ANIMATION HELPERS (Smooth Feedback)
  // ═══════════════════════════════════════════════════════════

  /**
   * 🎨 NEW: Trigger haptic feedback on mobile devices
   * Provides tactile feedback for grab, drop, and error events
   */
  private triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light'): void {
    if ('vibrate' in navigator) {
      const duration = style === 'light' ? 10 : style === 'medium' ? 20 : 30;
      navigator.vibrate(duration);
    }
  }

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

    // VINTAGE: Softer, larger shadow with warm brown tint (not harsh black)
    const shadowGeometry = new THREE.CircleGeometry(0.35, 32);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x3D2817,  // Warm brown shadow
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.name = 'drop-shadow';
    shadow.position.set(0, -0.25, -0.2);
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

  private playShelfSettleAnimation(object: THREE.Object3D, onComplete?: () => void): void {
    const basePos = object.position.clone();
    const baseScale = object.scale.clone();
    const baseRot = object.rotation.clone();

    const upPos = basePos.clone();
    upPos.y += 0.03;

    const upScale = baseScale.clone().multiplyScalar(1.015);
    const upRot = new THREE.Euler(baseRot.x, baseRot.y, baseRot.z + 0.015);
    const endRot = new THREE.Euler(baseRot.x, baseRot.y, baseRot.z);

    this.animatePosition(object, upPos, 85);
    this.animateScale(object, upScale, 85);
    this.animateRotation(object, upRot, 85);

    setTimeout(() => {
      this.animatePosition(object, basePos, 170);
      this.animateScale(object, baseScale, 170);
      this.animateRotation(object, endRot, 170);
      setTimeout(() => onComplete?.(), 175);
    }, 90);
  }

  private playSlotGlow(vinyl: THREE.Object3D, color: number, duration: number): void {
    // ── PRIMARY GLOW: Warm pulse expanding from vinyl center
    const glowGeometry = new THREE.PlaneGeometry(0.42, 0.42);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.name = 'slot-glow';
    glow.position.set(0, 0, -0.01);
    vinyl.add(glow);

    // ── SECONDARY RING: Expanding ring effect for more visual impact
    const ringGeometry = new THREE.RingGeometry(0.2, 0.24, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.name = 'slot-ring';
    ring.position.set(0, 0, -0.005);
    vinyl.add(ring);

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = elapsed / duration;

      if (t < 1) {
        // Glow fades and expands
        glowMaterial.opacity = 0.32 * (1 - t);
        const glowScale = 1 + t * 0.2;
        glow.scale.set(glowScale, glowScale, 1);

        // Ring expands faster and fades
        ringMaterial.opacity = 0.4 * (1 - t * t);
        const ringScale = 1 + t * 1.8;
        ring.scale.set(ringScale, ringScale, 1);

        requestAnimationFrame(animate);
      } else {
        vinyl.remove(glow);
        vinyl.remove(ring);
        glow.geometry.dispose();
        glowMaterial.dispose();
        ring.geometry.dispose();
        ringMaterial.dispose();
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

  /**
   * 🎨 NEW: Create motion trail during drag
   */
  private updateDragTrail(vinyl: THREE.Object3D): void {
    if (!vinyl) return;

    // Create new trail segment
    const trailGeo = new THREE.PlaneGeometry(0.3, 0.3);
    const trailMat = new THREE.MeshBasicMaterial({
      color: 0xDAA520,  // Golden
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
    });
    const trail = new THREE.Mesh(trailGeo, trailMat);
    trail.position.copy(vinyl.position);
    trail.position.z -= 0.05;  // Behind vinyl
    trail.rotation.copy(vinyl.rotation);

    vinyl.parent?.add(trail);
    this.dragTrail.push(trail);

    // Limit trail length
    if (this.dragTrail.length > this.trailMaxLength) {
      const oldest = this.dragTrail.shift();
      if (oldest) {
        oldest.parent?.remove(oldest);
        oldest.geometry.dispose();
        (oldest.material as THREE.Material).dispose();
      }
    }

    // Fade existing trail segments
    this.dragTrail.forEach((segment, index) => {
      const mat = segment.material as THREE.MeshBasicMaterial;
      const age = this.dragTrail.length - index;
      mat.opacity = 0.25 * (age / this.trailMaxLength);
      const scale = 0.8 + (age / this.trailMaxLength) * 0.2;
      segment.scale.setScalar(scale);
    });
  }

  /**
   * 🎨 NEW: Clear drag trail
   */
  private clearDragTrail(): void {
    this.dragTrail.forEach((trail) => {
      trail.parent?.remove(trail);
      trail.geometry.dispose();
      (trail.material as THREE.Material).dispose();
    });
    this.dragTrail = [];
  }

  // ═══════════════════════════════════════════════════════════
  // 🎨 ADVANCED EFFECTS (Particles, Trails, Enhanced Feedback)
  // ═══════════════════════════════════════════════════════════

  /**
   * 🎨 NEW: Create particle burst effect on vinyl grab
   */
  private playGrabParticles(vinyl: THREE.Object3D): void {
    const particleCount = 8;
    const particles: THREE.Mesh[] = [];
    const startPos = vinyl.position.clone();

    for (let i = 0; i < particleCount; i++) {
      const particleGeo = new THREE.CircleGeometry(0.02, 8);
      const particleMat = new THREE.MeshBasicMaterial({
        color: 0xDAA520,  // Golden
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      });
      const particle = new THREE.Mesh(particleGeo, particleMat);

      const angle = (i / particleCount) * Math.PI * 2;
      particle.position.copy(startPos);
      particle.userData.velocity = {
        x: Math.cos(angle) * 0.8,
        y: Math.sin(angle) * 0.8,
        z: Math.random() * 0.2 + 0.1,
      };

      vinyl.parent?.add(particle);
      particles.push(particle);
    }

    const startTime = Date.now();
    const duration = 400;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = elapsed / duration;

      if (t < 1) {
        particles.forEach((particle) => {
          const vel = particle.userData.velocity;
          particle.position.x += vel.x * 0.016;
          particle.position.y += vel.y * 0.016;
          particle.position.z += vel.z * 0.016;

          // Fade out and shrink
          const mat = particle.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.8 * (1 - t);
          particle.scale.setScalar(1 - t * 0.5);
        });
        requestAnimationFrame(animate);
      } else {
        // Cleanup
        particles.forEach((particle) => {
          particle.parent?.remove(particle);
          particle.geometry.dispose();
          (particle.material as THREE.Material).dispose();
        });
      }
    };
    animate();
  }

  /**
   * 🎨 NEW: Create sparkle particles on successful drop
   */
  private playDropSparkles(vinyl: THREE.Object3D, color: number): void {
    const particleCount = 12;
    const particles: THREE.Mesh[] = [];
    const startPos = vinyl.position.clone();

    for (let i = 0; i < particleCount; i++) {
      const particleGeo = new THREE.SphereGeometry(0.015, 6, 6);
      const particleMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
      });
      const particle = new THREE.Mesh(particleGeo, particleMat);

      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 0.2;
      particle.position.set(
        startPos.x + Math.cos(angle) * radius,
        startPos.y + Math.sin(angle) * radius,
        startPos.z + 0.05
      );
      particle.userData.velocity = {
        x: Math.cos(angle) * 1.2,
        y: Math.sin(angle) * 1.2 + 0.5,
        z: Math.random() * 0.3,
      };
      particle.userData.gravity = -2.5;

      vinyl.parent?.add(particle);
      particles.push(particle);
    }

    const startTime = Date.now();
    const duration = 600;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = elapsed / duration;

      if (t < 1) {
        particles.forEach((particle) => {
          const vel = particle.userData.velocity;
          const gravity = particle.userData.gravity;

          particle.position.x += vel.x * 0.016;
          particle.position.y += vel.y * 0.016;
          particle.position.z += vel.z * 0.016;

          // Apply gravity
          vel.y += gravity * 0.016;

          // Fade out
          const mat = particle.material as THREE.MeshBasicMaterial;
          mat.opacity = 1.0 * (1 - t);
        });
        requestAnimationFrame(animate);
      } else {
        // Cleanup
        particles.forEach((particle) => {
          particle.parent?.remove(particle);
          particle.geometry.dispose();
          (particle.material as THREE.Material).dispose();
        });
      }
    };
    animate();
  }

  /**
   * 🎨 NEW: Enhanced pulse effect with radial waves
   */
  private playRadialPulse(vinyl: THREE.Object3D, color: number, duration: number): void {
    const waveCount = 3;
    const waves: THREE.Mesh[] = [];

    for (let i = 0; i < waveCount; i++) {
      const ringGeometry = new THREE.RingGeometry(0.35, 0.38, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(vinyl.position);
      ring.position.z = -0.01;
      ring.rotation.x = -Math.PI / 2;
      ring.userData.delay = i * 80;  // Stagger waves

      vinyl.parent?.add(ring);
      waves.push(ring);
    }

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;

      let allComplete = true;
      waves.forEach((ring) => {
        const delay = ring.userData.delay;
        const ringElapsed = elapsed - delay;
        const t = ringElapsed / duration;

        if (t >= 0 && t < 1) {
          allComplete = false;
          const scale = 1 + t * 2;
          ring.scale.set(scale, scale, 1);
          const mat = ring.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.6 * (1 - t);
        }
      });

      if (!allComplete) {
        requestAnimationFrame(animate);
      } else {
        // Cleanup
        waves.forEach((ring) => {
          ring.parent?.remove(ring);
          ring.geometry.dispose();
          (ring.material as THREE.Material).dispose();
        });
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
    if (this.dragHintEl?.parentElement) {
      this.dragHintEl.parentElement.removeChild(this.dragHintEl);
    }
    this.hideTargetArrow();
    this.onTargetColumnPreviewClear?.();
    this.dragHintEl = null;
  }
}
