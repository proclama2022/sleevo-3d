---
name: sleevo-game-dev
description: Master skill for developing Sleevo 3D - Vinyl Shop Manager game. Provides expertise in Three.js 3D components, game mechanics (drag&drop, grid, scoring), UI/UX (glassmorphism), and level design. Use for creating 3D assets, implementing gameplay features, designing levels, or optimizing performance.
---

# Skill: Sleevo Game Development

Master skill for developing **Sleevo 3D - Vinyl Shop Manager**, a Three.js puzzle game where players organize vinyl records in a record store. This skill coordinates all aspects of game development: 3D components, game mechanics, UI/UX, and level design.

## Project Architecture

### Tech Stack
- **Three.js v0.182** (vanilla, NOT React Three Fiber)
- **TypeScript 5.9**
- **Vite** build system
- **OOP Architecture**: GameManager, SceneRenderer, InputController

### Core Systems

**GameManager.ts** - Game state and logic:
- Level loading and progression
- Grid system (rows x cols)
- Vinyl placement validation
- Score and moves tracking
- Win/lose conditions

**SceneRenderer.ts** - 3D rendering:
- Three.js scene setup
- Camera management
- Lighting system
- Animation loop
- Shader effects

**InputController.ts** - Player input:
- Mouse/touch handling
- Drag & drop mechanics
- Raycasting for 3D interaction
- Gesture recognition

**types.ts** - Core data structures:
```typescript
interface Vinyl {
  id: string;
  width: 1 | 2;  // Vinyls can span 1 or 2 slots
  color: string;
  genre: string;
  year: number;
  coverImage?: string;
}

interface Level {
  id: string;
  shelf: ShelfConfig;
  vinyls: Vinyl[];
  rules: LevelRules;  // fillAllSlots, sortBy, allowGaps
}
```

### Visual Design

**Aesthetic**: Modern glassmorphism with soft pastels
- Background: Dark (#0a0a0a)
- UI: Glass panels with backdrop-filter blur
- Fonts: Space Grotesk (headers), DM Sans (body)
- Colors: Warm beiges (#e8d5b7, #d4b896) for wood shelves
- Lighting: Soft ambient + directional for depth

**UI Components**:
- HUD: Glass cards (level, score)
- Tutorial modal: Centered, blurred backdrop
- Control buttons: Glassmorphic, hover animations
- Carousel hint: Pulsing text

---

## Development Guidelines

### 1. Creating 3D Components

**Principles:**
- Use Three.js primitives (BoxGeometry, CylinderGeometry, etc.)
- Apply realistic materials (MeshStandardMaterial with roughness/metalness)
- Enable shadows (castShadow, receiveShadow)
- Group related meshes with THREE.Group
- Name objects for debugging

**Vinyl Record Example Pattern:**
```typescript
createVinyl(vinyl: Vinyl): THREE.Group {
  const group = new THREE.Group();
  group.name = `vinyl-${vinyl.id}`;

  // Disc
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.02, 32),
    new THREE.MeshStandardMaterial({
      color: vinyl.color,
      roughness: 0.2,
      metalness: 0.6
    })
  );
  disc.castShadow = true;
  disc.receiveShadow = true;

  // Label
  const label = new THREE.Mesh(
    new THREE.CircleGeometry(0.1, 32),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8
    })
  );
  label.position.y = 0.011;
  label.rotation.x = -Math.PI / 2;

  group.add(disc, label);
  return group;
}
```

**Available Advanced Components:**
- `VinylMesh.ts` - Realistic vinyl records with grooves, labels, and wear effects
- Use `VinylMesh.createVinyl(vinyl)` for photorealistic vinyl records

**Performance Tips:**
- Reuse geometries and materials (shared instances)
- Use InstancedMesh for repeated objects (>10 similar items)
- Keep total meshes under 1000 for 60fps
- Dispose unused geometries/materials

### 2. Game Mechanics

**Drag & Drop System:**
- Use raycaster to detect 3D object under cursor
- Store dragged object in state
- Update position in animation loop
- Snap to grid on release
- Validate placement against rules

**Grid Validation:**
```typescript
canPlaceVinyl(vinyl: Vinyl, row: number, col: number): boolean {
  // Check bounds
  if (col + vinyl.width > this.level.shelf.cols) return false;

  // Check occupied slots
  for (let i = 0; i < vinyl.width; i++) {
    if (this.grid[row][col + i].vinylId !== null) return false;
  }

  // Check level rules
  if (this.level.rules.sortBy === 'genre') {
    // Validate genre grouping
  }

  return true;
}
```

**Combo System Ideas:**
- Sequential placements without error (+10% bonus)
- Speed bonuses (time between moves)
- Perfect organization (+50% score)
- Genre matching chains

### 3. UI/UX Development

**Follow Existing Patterns:**
- Glass cards: `rgba(255, 255, 255, 0.05)` background
- Blur: `backdrop-filter: blur(20px)`
- Borders: `1.5px solid rgba(255, 255, 255, 0.15)`
- Border radius: `12px`
- Transitions: `cubic-bezier(0.4, 0, 0.2, 1)`

**Adding New UI Elements:**
1. Add HTML structure in index.html
2. Style with inline CSS (project uses embedded styles)
3. Add event listeners in main.ts or relevant controller
4. Update state and re-render as needed

**Responsive Considerations:**
- Use viewport units (vw, vh)
- Test on mobile (touch events, smaller screens)
- Adjust font sizes for readability
- Consider portrait vs landscape

### 4. Level Design

**Level Structure:**
```typescript
const level: Level = {
  id: 'level-01',
  shelf: { rows: 3, cols: 5 },
  vinyls: [
    { id: 'v1', width: 1, color: '#ff6b6b', genre: 'Rock', year: 1975 },
    { id: 'v2', width: 2, color: '#4ecdc4', genre: 'Jazz', year: 1959 },
    // ...
  ],
  rules: {
    fillAllSlots: true,
    sortBy: 'genre',
    allowGaps: false
  }
};
```

**Difficulty Progression:**
- **Easy (1-5)**: Small grids (3x4), single-width vinyls, no sorting
- **Medium (6-15)**: Mixed widths, basic sorting (color/genre)
- **Hard (16-30)**: Large grids, complex sorting, no gaps allowed
- **Expert (31+)**: Multi-criteria sorting, time limits

**Engagement Tips:**
- Introduce 1 new mechanic every 3-5 levels
- Vary visual themes (basement, main store, expo room)
- Add story snippets between levels
- Unlock cosmetics/shelves as rewards

### 5. Animation & Polish

**Smooth Animations:**
```typescript
// GSAP-style easing with native approach
animateVinylDrop(vinyl: THREE.Group, targetPos: THREE.Vector3) {
  const startPos = vinyl.position.clone();
  const duration = 500; // ms
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = this.easeOutCubic(t);

    vinyl.position.lerpVectors(startPos, targetPos, eased);

    if (t < 1) requestAnimationFrame(animate);
  };
  animate();
}

easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
```

**Juice Features:**
- Vinyl spin on hover
- Bounce on placement
- Particle effects on combo
- Screen shake on error
- Sound effects (if audio system added)

### 6. Testing & Debugging

**Manual Testing Checklist:**
- [ ] All vinyls can be picked up and dropped
- [ ] Grid validation works correctly
- [ ] Score updates accurately
- [ ] Win/lose conditions trigger
- [ ] UI responsive on mobile
- [ ] No console errors
- [ ] Smooth 60fps performance

**Common Issues:**
- **Z-fighting**: Offset overlapping surfaces by 0.001
- **Shadow artifacts**: Adjust shadow bias/normalBias
- **Performance drops**: Check mesh count, reduce draw calls
- **Touch not working**: Verify touch event listeners

---

## Advanced Features (Future)

### Multiplayer
- Real-time co-op organizing
- Competitive speed mode
- Leaderboards with Firebase

### Progression System
- XP and levels
- Unlockable shelves/themes
- Daily challenges
- Achievement system

### Audio System
- Background music (lo-fi, ambient)
- SFX (vinyl scratch, shelf slide)
- Dynamic audio based on genre placed

### Power-ups
- **Hint**: Highlight correct placement
- **Undo**: Revert last N moves
- **Shuffle**: Randomize vinyl order
- **Time Freeze**: Pause timer (timed levels)

### Mobile Optimization
- Capacitor for native apps
- App Store/Play Store deployment
- Push notifications
- In-app purchases

---

## Code Style Conventions

**TypeScript:**
- Use interfaces for data structures
- Prefer `const` over `let`
- Type all function parameters and returns
- Use descriptive variable names

**Three.js:**
- Name all objects: `object.name = 'shelf-main'`
- Group related meshes
- Dispose resources in cleanup methods
- Use `userData` for custom properties

**Organization:**
- One class per file
- Separate concerns (rendering, logic, input)
- Use private methods for internal logic
- Export public API only

---

## Integration with Existing Code

**Always:**
1. Read relevant files before modifying (GameManager, SceneRenderer, types)
2. Follow existing naming conventions
3. Maintain type safety
4. Test changes in browser
5. Update types.ts if adding new data structures

**Never:**
- Switch to React (project uses vanilla Three.js)
- Break existing game loop
- Modify core architecture without discussion
- Add heavy dependencies (keep bundle small)

---

## Quick Reference

**File Structure:**
```
src/
├── main.ts              # Entry point, initialization
├── GameManager.ts       # Game state and logic
├── SceneRenderer.ts     # Three.js rendering
├── InputController.ts   # Input handling
├── types.ts             # TypeScript interfaces
├── VinylMesh.ts         # Advanced vinyl 3D component
└── vinyl-demo.ts        # Demo showcase
```

**Color Palette:**
- Background: `#0a0a0a`
- Wood: `#e8d5b7`, `#d4b896`, `#c4a882`
- Wall: `#ffd4a3`
- Floor: `#e5ddd5`
- Glass: `rgba(255, 255, 255, 0.05)`

**Common Tasks:**
- Add vinyl: Update `createVinyls()` in GameManager
- Add UI: Edit `index.html` and add event listeners
- Modify shelf: Edit `buildShelf()` in GameManager
- Change lighting: Edit `SceneRenderer.setupLights()`

---

*When invoked, this skill provides context-aware assistance for all aspects of Sleevo game development, maintaining consistency with the existing codebase and design language.*
