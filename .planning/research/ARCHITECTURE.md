# Architecture Research

**Domain:** Visual Polish in React + Three.js Game
**Researched:** 2026-03-02
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer (React)                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐            │
│  │ VinylDisc   │  │ ShelfSlot   │  │ ParticleBurst│            │
│  │ (CSS anims) │  │ (Sparkle)   │  │ (CSS/Canvas) │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘            │
│         │                │                 │                     │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴───────┐            │
│  │  Counter    │  │   Shelf     │  │   GameScreen │            │
│  │ (Wobble)    │  │ (Glow)      │  │ (Orchestrator)│           │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘            │
├─────────┴────────────────┴─────────────────┴────────────────────┤
│                   Animation Coordination Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ TIMING.ts    │  │ keyframes.ts │  │ Animations   │          │
│  │ (Constants)  │  │ (Keyframes)  │  │ (Mixins)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                      Three.js Layer (3D)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │Shelf3DCanvas │  │ Scene        │  │Particles     │          │
│  │ (Static)     │  │ Backdrop     │  │ (NEW)        │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                    State Management Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ GameScreen   │  │  gameReducer │  │   Engine     │          │
│  │ (useState)   │  │ (Logic)      │  │ (Rules)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **VinylDisc** | Vinyl rendering, drag wobble animation | CSS transforms + styled-components |
| **ShelfSlot** | Slot rendering, placement sparkles, glow effects | CSS keyframes + data-attributes |
| **Counter** | Unplaced vinyls display, carousel rotation | CSS transforms for 3D carousel |
| **Shelf** | Grid layout, 3D canvas integration, column hints | Grid + Shelf3DCanvas (Three.js) |
| **GameScreen** | Animation orchestration, popup coordination | useState for ephemeral UI |
| **ParticleBurst** | One-shot particle explosions | CSS transforms on individual particles |
| **SceneBackdrop** | Themed background, ambient effects | CSS animations on layered divs |

## Recommended Project Structure

```
src/
├── animations/              # Centralized animation system
│   ├── index.ts            # Public API exports
│   ├── timing.ts           # Duration/easing constants
│   ├── keyframes.ts        # CSS keyframe definitions
│   └── transitions.ts      # NEW: Screen transition utilities
├── components/
│   ├── VinylDisc.tsx       # Vinyl rendering (MODIFY for wobble)
│   ├── VinylDisc.module.css # Vinyl-specific animations
│   ├── ShelfSlot.tsx       # Slot rendering (MODIFY for glow)
│   ├── ShelfSlot.module.css # Slot-specific animations
│   ├── Shelf.tsx           # Grid + 3D integration
│   ├── Shelf3DCanvas.tsx   # Three.js shelf rendering
│   ├── Counter.tsx         # Carousel display
│   ├── ParticleBurst/      # Burst effects
│   │   ├── ParticleBurst.tsx
│   │   ├── Particle.tsx
│   │   └── index.ts
│   ├── AmbientParticles/   # NEW: Dust/light ray system
│   │   ├── AmbientParticles.tsx
│   │   ├── DustMote.tsx
│   │   ├── LightRay.tsx
│   │   └── index.ts
│   ├── ScreenTransition/   # NEW: Route transition wrapper
│   │   ├── ScreenTransition.tsx
│   │   └── index.ts
│   └── GameScreen.tsx      # Main orchestrator
├── game/
│   ├── engine.ts           # Game logic (MODIFY for animation hooks)
│   └── types.ts            # Shared types
└── App.tsx                 # Route screen switching (MODIFY)
```

### Structure Rationale

- **animations/:** Centralized constants prevent magic numbers, ensure consistency
- **components/AmbientParticles/:** Isolated particle system for reuse across scenes
- **components/ScreenTransition/:** Declarative transition wrapper for clean App.tsx
- **VinylDisc/ShelfSlot modules:** CSS Modules co-located with components for specificity
- **GameScreen:** Remains orchestrator, not implementing animations directly

## Architectural Patterns

### Pattern 1: CSS-First Animations for UI Feedback

**What:** Use CSS keyframes and transforms for all UI feedback (wobble, sparkles, glow pulses)

**When to use:**
- Drag feedback (wobble, scale)
- Placement feedback (sparkles, glow)
- Score popups, combo indicators
- Anything affecting DOM elements

**Trade-offs:**
- ✅ Pros: Hardware acceleration, declarative, reduced motion support
- ✅ Easy to debug, predictable performance
- ❌ Limited to transform/opacity/filter properties
- ❌ Cannot animate 3D scene objects

**Example:**
```typescript
// VinylDisc.tsx - Drag wobble
const Disc = styled.div<{ $dragging: boolean }>`
  transform: rotate(-15deg);

  ${(props) => props.$dragging && `
    animation: ${wobble} 0.4s ease-in-out infinite;
    will-change: transform;
  `}

  ${reducedMotion} /* Respects prefers-reduced-motion */
`;
```

### Pattern 2: Three.js for Static 3D, CSS for Dynamic Polish

**What:** Three.js renders static shelf (meshes, lighting, shadows), CSS handles dynamic feedback

**When to use:**
- 3D environment that doesn't change during gameplay
- Need realistic shadows, lighting, materials
- Performance is critical (static = no per-frame updates)

**Trade-offs:**
- ✅ Pros: Best performance (no render loop), realistic rendering
- ✅ Clean separation: 3D vs 2D UI
- ❌ Cannot animate shelf geometry (wobble, bounce)
- ❌ Lighting is baked, not dynamic

**Current implementation:**
```typescript
// Shelf3DCanvas.tsx - Static shelf, rendered once
useEffect(() => {
  const shelf = buildShelf(scene, rows, cols);
  // No animation loop - renders once on mount/resize
  const resize = () => {
    renderer.render(scene, camera);
  };
  // Only re-renders on resize
}, [rows, cols]);
```

### Pattern 3: Ephemeral State Management for Animations

**What:** Use local useState in GameScreen for transient animation state

**When to use:**
- One-shot animations (particle bursts, popups)
- Short-lived UI (score popups, combo indicators)
- Effects that self-cleanup after N ms

**Trade-offs:**
- ✅ Pros: Simple, no cleanup complexity, predictable lifecycle
- ✅ Works well with React's rendering model
- ❌ Not suitable for persistent state
- ❌ Cannot coordinate complex animations across components

**Example:**
```typescript
// GameScreen.tsx - Particle burst coordination
const [comboBurst, setComboBurst] = useState<{x: number; y: number} | null>(null);

useEffect(() => {
  if (currentCombo >= 5 && prevCombo < 5 && lastSlotPosition) {
    setComboBurst(lastSlotPosition); // Trigger burst
  }
}, [currentCombo]);

// Cleanup handled by ParticleBurst's internal timer
{comboBurst && (
  <ParticleBurst
    x={comboBurst.x}
    y={comboBurst.y}
    onComplete={() => setComboBurst(null)}
  />
)}
```

### Pattern 4: Data-Attribute Driven Visual States

**What:** Use data-attributes for performance-critical hover/active states

**When to use:**
- High-frequency updates (60fps drag hover)
- Avoiding React re-renders during interactions
- Simple binary/toggle states

**Trade-offs:**
- ✅ Pros: Zero re-renders, CSS handles all transitions
- ✅ Bypasses React's virtual DOM for hot paths
- ❌ Harder to debug (no React DevTools visibility)
- ❌ Limited to simple state (no complex objects)

**Example:**
```typescript
// GameScreen.tsx - Direct DOM manipulation during drag
const handlePointerMove = (e: React.PointerEvent) => {
  const foundElement = candidate.element;

  // Direct DOM update - no setState, no re-render
  if (foundElement) {
    foundElement.setAttribute('data-hover', valid ? 'valid' : 'invalid');
    foundElement.setAttribute('data-hover-magnetic', 'true');
  }
};

// ShelfSlot.module.css - CSS responds to data-attributes
.slot[data-hover='valid'] {
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.6);
  transform: scale(1.05);
}
```

## Data Flow

### Animation Trigger Flow

```
[User Action: Drag Start]
    ↓
GameScreen.handleDragStart()
    ↓
setDrag({ vinylId, color, x, y }) → Triggers VinylDisc wobble
    ↓
[User Action: Drag Move]
    ↓
GameScreen.handlePointerMove()
    ↓
Direct DOM: setAttribute('data-hover', 'valid') → Triggers slot glow
    ↓
[User Action: Release]
    ↓
GameScreen.handlePointerUp()
    ↓
dispatch({ type: 'PLACE_VINYL' }) → Updates game state
    ↓
ShelfSlot detects new vinyl.id → Triggers sparkle animation
    ↓
GameScreen captures slot position → setLastSlotPosition()
    ↓
Render ParticleBurst at position → Self-cleanup after 650ms
```

### State Management for Animations

```
┌─────────────────────────────────────────────────────────────┐
│                    GameScreen State                         │
├─────────────────────────────────────────────────────────────┤
│  Persistent Game State (useReducer):                        │
│  - score, combo, placedVinyls, level status                 │
│  → Managed by gameReducer, drives core game logic           │
│                                                             │
│  Ephemeral Animation State (useState):                      │
│  - comboBurst, scorePopups, lastSlotPosition                │
│  → Local to GameScreen, self-cleanup via onComplete         │
│  → Example: setComboBurst(pos) → ParticleBurst → onComplete │
│                                                             │
│  Derived State (computed):                                  │
│  - progress, hudTimeRemaining, unplacedVinyls               │
│  → Computed from reducer state, no setter needed            │
└─────────────────────────────────────────────────────────────┘
```

### Key Data Flows

1. **Drag Wobble:** `drag state` → `VinylDisc` CSS class → `@keyframes wobble`
2. **Slot Glow:** `handlePointerMove` → `data-hover attribute` → `CSS selector`
3. **Placement Sparkle:** `vinyl.id change` → `useEffect` → `showSparkle state`
4. **Particle Burst:** `lastSlotPosition` → `ParticleBurst prop` → `self-cleanup timer`
5. **Screen Transition:** `screen state` → `ScreenTransition` wrapper → `CSSTransition`

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **Current (21 levels)** | CSS animations are sufficient, no optimization needed |
| **50+ levels** | Consider lazy-loading heavy themes, memoize particle components |
| **Complex effects** | Move particle rendering to Canvas/WebGL if DOM count > 100 particles |
| **Mobile expansion** | Test `will-change` usage, ensure reduced motion works well |

### Scaling Priorities

1. **First bottleneck:** Particle count. DOM nodes are expensive.
   - **Fix:** Use Canvas-based particles for effects > 50 particles
   - **Threshold:** Start with DOM, migrate when needed

2. **Second bottleneck:** CSS animation complexity during drag.
   - **Fix:** Use `will-change` sparingly, prefer transforms
   - **Threshold:** Profile 60fps during drag, reduce wobble complexity if needed

## Anti-Patterns

### Anti-Pattern 1: Animating Three.js Objects for UI Feedback

**What people do:** Try to animate shelf meshes, vinyl 3D models for wobble/glow

**Why it's wrong:**
- Requires render loop (kills battery)
- Breaks static rendering optimization
- Complex coordination between React state and Three.js scene graph

**Do this instead:** Use CSS transforms on DOM overlays for all UI feedback
- Three.js = static shelf, realistic lighting
- CSS = wobble, glow, particles, transitions

### Anti-Pattern 2: Global Animation State

**What people do:** Create single global `animationState` object for all effects

**Why it's wrong:**
- Unnecessary complexity for short-lived effects
- Harder to track cleanup, memory leaks
- Violates "ephemeral state" principle

**Do this instead:** Use local useState in orchestrating component
- `const [burst, setBurst] = useState(null)`
- Component self-cleans via `onComplete`
- Simple, predictable, React-idiomatic

### Anti-Pattern 3: Mixing Animation Logic with Game Rules

**What people do:** Put animation triggers in `gameReducer` or `isValidPlacement`

**Why it's wrong:**
- Game logic should be pure, testable
- Animations are presentation concern
- Creates coupling between rules and visuals

**Do this instead:** Separate concerns
- `gameReducer` updates state (pure)
- `GameScreen` detects state changes, triggers animations (effectful)
- Example: `combo.streak` changes → `useEffect` → `setComboBurst`

### Anti-Pattern 4: Ignoring prefers-reduced-motion

**What people do:** Add animations without accessibility fallbacks

**Why it's wrong:**
- Causes motion sickness/nausea for some users
- Legal accessibility requirement in many jurisdictions
- Against WCAG guidelines

**Do this instead:** Always include reduced motion mixin
```typescript
const wobble = keyframes`...`;

const WobbleDiv = styled.div`
  animation: ${wobble} 0.4s infinite;

  ${reducedMotion} /* Wraps in @media (prefers-reduced-motion: reduce) */
`;
```

## Integration Points

### New Components Required

| Component | Purpose | Integration Point |
|-----------|---------|-------------------|
| **AmbientParticles** | Dust motes, light rays in background | SceneBackdrop or GameScreen |
| **ScreenTransition** | Fade/slide between LevelSelect ↔ Game | Wrap App.tsx screen renders |
| **WobbleWrapper** | Apply wobble to VinylDisc during drag | VinylDisc internal, triggered by `drag` prop |
| **GlowOverlay** | Subtle slot glow when vinyl near | ShelfSlot internal, triggered by `isGlowing` prop |

### Data Flow Changes

| Current Flow | New Flow | Impact |
|--------------|----------|--------|
| Screen switch: instant | Screen switch: transition wrapper | Minor App.tsx change |
| No ambient effects | Ambient particles in background | Add to GameScreen JSX |
| Static drag feedback | Wobble animation during drag | VinylDisc CSS change |
| No slot proximity glow | Glow when vinyl near slot | ShelfSlot props + CSS |

### Three.js Scene Graph Considerations

**Current architecture:** Shelf3DCanvas is purely static
- Builds scene once on mount
- No animation loop
- Re-renders only on resize

**For v1.2 polish:** Keep static, add CSS overlays
- ✅ Dust particles: DOM nodes with CSS animations
- ✅ Light rays: CSS gradients with animation
- ✅ Vinyl wobble: CSS transform on DOM element
- ❌ Don't add animated meshes to Three.js scene

**Future expansion (if needed):**
- Move to react-three-fiber if 3D animation becomes core requirement
- Consider render loop only if animating shelf geometry (not in scope)

### Component Tree Placement

```
App
└── ScreenTransition (NEW)
    ├── LevelSelect
    └── GameScreen
        ├── SceneBackdrop
        │   └── AmbientParticles (NEW)
        ├── HUD
        ├── Shelf
        │   ├── Shelf3DCanvas (Three.js, static)
        │   └── ShelfSlot (glow effects)
        ├── Counter
        │   └── VinylDisc (wobble animation)
        ├── ParticleBurst (existing)
        └── [various popup overlays]
```

## Build Order (Respecting Dependencies)

1. **Animation infrastructure** (no dependencies)
   - Extend `src/animations/timing.ts` with new constants
   - Extend `src/animations/keyframes.ts` with wobble/glow keyframes
   - Add `src/animations/transitions.ts` for screen transitions

2. **VinylDisc wobble** (self-contained)
   - Modify `VinylDisc.tsx` to accept `dragging` prop
   - Add wobble keyframe to `VinylDisc.module.css`
   - Test in isolation

3. **ShelfSlot glow** (self-contained)
   - Modify `ShelfSlot.tsx` to accept `isGlowing` prop
   - Add glow pulse to `ShelfSlot.module.css`
   - Test in isolation

4. **AmbientParticles** (independent, reusable)
   - Create `AmbientParticles` component
   - Integrate into `SceneBackdrop`
   - Test with different themes

5. **ScreenTransition** (wraps App routing)
   - Create `ScreenTransition` component
   - Modify `App.tsx` to use wrapper
   - Test LevelSelect ↔ GameScreen transitions

6. **Integration & coordination**
   - Wire up `GameScreen` to pass `dragging` to VinylDisc
   - Wire up `GameScreen` to pass `isGlowing` to ShelfSlot
   - Coordinate animation timing with game events
   - Performance test (60fps drag, particle count)

## Sources

**Confidence Level:** HIGH
- Analysis based on existing codebase patterns
- CSS-first animation approach verified in current implementation
- Three.js static rendering pattern confirmed in Shelf3DCanvas.tsx
- Ephemeral state pattern observed in GameScreen.tsx (comboBurst, scorePopups)

**Key Code References:**
- `/src/components/GameScreen.tsx` - Lines 36-44 (particle system), 122-124 (comboBurst state)
- `/src/components/ShelfSlot.tsx` - Lines 23-40 (sparkle animation), 90-101 (sparkle trigger)
- `/src/components/HUD/HUD.tsx` - Lines 93-116 (AnimatedScore pattern)
- `/src/animations/timing.ts` - Animation timing constants
- `/src/animations/keyframes.ts` - Keyframe definitions, reducedMotion mixin
- `/src/components/Shelf3DCanvas.tsx` - Static Three.js rendering pattern
- `/src/App.tsx` - Current routing (no transitions)

**Pattern Sources:**
- CSS Modules + styled-components: Current codebase standard
- Data-attribute driven hover: GameScreen.tsx lines 462-505
- Ephemeral state: GameScreen.tsx lines 122-124, 132-140
- Separation of concerns: game/engine.ts (logic) vs components (presentation)
