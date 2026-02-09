# Architecture

**Analysis Date:** 2026-02-07

## Pattern Overview

**Overall:** Client-side React game with component-based UI and functional game logic separation

**Key Characteristics:**
- Single-page React application with no backend dependencies
- Separation between game state management (App.tsx) and presentational components
- Interactive drag-and-drop game mechanics with real-time touch/pointer handling
- Progressive difficulty with level-based progression system
- Mobile-first with Capacitor integration for native app features

## Layers

**Presentation Layer:**
- Purpose: Render game UI, handle user interactions, display visual feedback
- Location: `App.tsx` (main component), `components/` directory
- Contains: React components (VinylCover, CrateBox, VinylDisc), UI state, drag handlers, animations
- Depends on: React, Lucide icons, Capacitor for haptics
- Used by: Browser/Mobile viewport

**Game Logic Layer:**
- Purpose: Generate levels, calculate scoring, manage progression rules
- Location: `services/gameLogic.ts`
- Contains: Level generation, difficulty settings, genre progression, score calculations
- Depends on: Game type definitions from `types.ts`
- Used by: `App.tsx` during level initialization and gameplay

**Data Model Layer:**
- Purpose: Define game state structures and type safety
- Location: `types.ts`
- Contains: Enum definitions (Genre, Difficulty, LevelMode, ShopTheme), interface definitions (Vinyl, Crate, GameState)
- Depends on: TypeScript
- Used by: All other layers

## Data Flow

**Level Initialization:**

1. User selects difficulty in menu
2. `App.tsx:startGame()` sets difficulty and resets scores
3. `App.tsx:startLevel()` calls `generateLevel()` from `services/gameLogic.ts`
4. `generateLevel()` returns crates array, vinyls array, moves count, mode, time, theme
5. `App.tsx` updates state: `setCrates()`, `setShelfVinyls()`, updates `gameState`
6. UI renders crate boxes (`CrateBox.tsx`) and shelf with vinyl cards (`VinylCover.tsx`)

**Drag & Drop Gameplay:**

1. User initiates pointer down on vinyl in shelf → `handlePointerDown()` captures position
2. `handlePointerMove()` executes continuously, calculating distance to crates/trash
3. Sets `magnetTargetId` when vinyl enters magnet radius (120px) of crate or trash (100px)
4. Visual feedback: `CrateBox` receives `highlightState` prop (valid/invalid/neutral)
5. On pointer up, `handlePointerUp()` determines drop target
6. If valid drop: `handleSuccess()` removes vinyl, adds to crate, triggers flying animation
7. Flying animation via `FlyingVinylItem` component animates vinyl to crate
8. On animation complete: score updated, combo tracked, win condition checked

**State Management:**

- `gameState`: Game-level data (score, moves, XP, status, difficulty, mode)
- `levelIndex`: Current level number for progression
- `crates`: Array of active crate objects with fill counts
- `shelfVinyls`: Array of unplaced vinyl records
- `activeVinyl`: Currently dragged vinyl record
- `magnetTargetId`: ID of nearest valid drop target
- `flyingVinyls`: Array of vinyls animating to crates
- `feedback`: Transient messages shown to player

## Key Abstractions

**Vinyl:**
- Purpose: Represents a record or trash item with properties that affect gameplay
- Examples: `services/gameLogic.ts` creates instances; `components/VinylCover.tsx` renders
- Pattern: Used as data model throughout. Properties include genre, artist, title, dust level, gold/mystery/trash flags

**Crate:**
- Purpose: Genre-specific container that accepts matching vinyl records
- Examples: Created in `services/gameLogic.ts:generateLevel()`, rendered by `components/CrateBox.tsx`
- Pattern: Has capacity limit, fill count, visual theme. Crates are keyed by ID for ref management

**ParticleExplosion:**
- Purpose: Visual feedback system using CSS keyframe animations
- Examples: Triggered in `App.tsx` on successful placements and bonus actions
- Pattern: Creates explosion particles at (x, y) with color, animates via CSS with 0.6s duration

**FlyingVinylItem:**
- Purpose: Animate vinyl record from drag position to crate destination
- Examples: Queued in `handlePointerUp()`, rendered as portal overlays in UI tree
- Pattern: Uses `requestAnimationFrame` for initial position setup, transitions via CSS transform

**Genre-Based Theming:**
- Purpose: Encapsulates visual styling per music genre
- Examples: `CrateBox.tsx:CRATE_THEMES`, `VinylCover.tsx:getBgClass()`
- Pattern: Maps Genre enum to color, icon, texture, theme properties

## Entry Points

**App Root:**
- Location: `index.tsx`
- Triggers: Browser loads HTML, executes React mount sequence
- Responsibilities: Mounts React app to DOM root element

**Main Game Component:**
- Location: `App.tsx` - export default function App()
- Triggers: React initialization after index.tsx mount
- Responsibilities: Game state orchestration, event handling (pointer events, timer), level progression, win/loss detection, UI rendering

**Level Generation:**
- Location: `services/gameLogic.ts:generateLevel(levelIndex, difficulty)`
- Triggers: Called from `App.tsx:startLevel()` at level start
- Responsibilities: Creates crates array, generates vinyl records with difficulty modifiers, determines game mode and time limits

## Error Handling

**Strategy:** Graceful degradation with feature detection

**Patterns:**
- Capacitor platform detection: `if (Capacitor.isNativePlatform())` checks before calling native APIs
- Haptics fallback: Uses `navigator.vibrate()` if Capacitor unavailable
- StatusBar errors silently caught: `.catch(() => {})` allows app to continue without status bar features
- Missing root element throws error: `index.tsx` throws if DOM root not found (hard requirement)
- Ref management safe: Crate refs use null checks before measuring positions

## Cross-Cutting Concerns

**Haptic Feedback:**
- Implementation: `triggerHaptic(type: 'light' | 'heavy' | 'success')` in `App.tsx`
- Applied: On invalid drops (light), errors (heavy), successful placements (success)
- Fallback: Uses Capacitor for native, `navigator.vibrate()` for web

**Animations:**
- CSS-based particle explosions: Keyframe-driven via inline styles
- DOM transition properties: Used for flying vinyl items and crate highlights
- Inline transform animations: Immediate position updates during drag via ref manipulation

**Mobile Considerations:**
- Touch-based pointer events work via React's pointer event system
- Capacitor integration for native features (haptics, status bar)
- Full-screen viewport handled by index.html and CSS

**Timer Management:**
- Timed mode uses `setInterval` with cleanup on unmount
- Time decrements each second, triggers loss condition at 0
- Cleared when game state changes or component unmounts

**Combo System:**
- Successive correct placements increment combo counter
- Combo timer resets via `clearTimeout` on miss
- Score multiplier applied: `baseScore * (1 + combo * 0.2)`

---

*Architecture analysis: 2026-02-07*
