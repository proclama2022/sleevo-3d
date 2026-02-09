# Codebase Structure

**Analysis Date:** 2026-02-07

## Directory Layout

```
Sleevo Vinyl Shop Manager/
├── components/             # React UI components
│   ├── VinylCover.tsx     # Vinyl record sleeve/cover component
│   ├── VinylDisc.tsx      # Spinning vinyl disc visualization
│   └── CrateBox.tsx       # Genre-themed crate container component
├── services/              # Game logic and utilities
│   └── gameLogic.ts       # Level generation, scoring, difficulty settings
├── App.tsx                # Main game component and state management
├── index.tsx              # React app entry point
├── types.ts               # TypeScript type definitions
├── vite.config.ts         # Build configuration
├── tsconfig.json          # TypeScript compiler options
├── index.html             # HTML template
├── manifest.json          # PWA manifest
├── metadata.json          # App metadata
├── package.json           # Dependencies and scripts
├── README.md              # Project documentation
└── .env.local             # Environment variables (local only)
```

## Directory Purposes

**components/:**
- Purpose: Reusable React presentational components for game UI
- Contains: Functional components with styling, animations, and visual rendering logic
- Key files:
  - `VinylCover.tsx`: Renders record sleeve art (solo or as icon)
  - `VinylDisc.tsx`: Renders vinyl disc visual (currently unused in main gameplay)
  - `CrateBox.tsx`: Renders genre-themed storage crate with wood textures and capacity indicators

**services/:**
- Purpose: Pure game logic functions independent of React
- Contains: Game rule implementations, level generation algorithms, progression systems
- Key files:
  - `gameLogic.ts`: Contains `generateLevel()`, `calculateScore()`, `getXPToNextLevel()`

**Root Level:**
- `App.tsx`: Main game component (655 lines) - orchestrates game state, handles all pointer events, manages animations
- `index.tsx`: React DOM mount point - initializes app into `#root` element
- `types.ts`: Shared TypeScript definitions used across entire codebase

## Key File Locations

**Entry Points:**
- `index.tsx`: Mounts React app to DOM
- `App.tsx` (default export): Main game component with complete game loop

**Configuration:**
- `tsconfig.json`: TypeScript target ES2022, path aliases (@/*), JSX react-jsx mode
- `vite.config.ts`: Dev server on port 3000, React plugin, API key injection
- `package.json`: React 19.2.4, Vite 6.2.0, TypeScript 5.8.2, Capacitor 8.0.2

**Core Logic:**
- `App.tsx`: Game state, event handlers, rendering logic (single 655-line file)
- `services/gameLogic.ts`: Level generation with difficulty modifiers, genre unlock progression, score calculations

**UI Components:**
- `components/VinylCover.tsx`: Record sleeve design with genre colors, dust overlay, mystery/gold states
- `components/CrateBox.tsx`: Wood texture crate with stacked sleeve visualization, capacity dots
- `components/VinylDisc.tsx`: Rotating vinyl disc (decorative, not primary gameplay)

**Testing:**
- No test files detected in codebase

## Naming Conventions

**Files:**
- Components: PascalCase (.tsx) - `VinylCover.tsx`, `CrateBox.tsx`
- Services: camelCase (.ts) - `gameLogic.ts`
- Config: lowercase or kebab-case - `vite.config.ts`, `tsconfig.json`

**Directories:**
- Feature directories: lowercase - `components/`, `services/`

**Functions and Variables:**
- Constants in App.tsx: UPPER_SNAKE_CASE - `MAGNET_RADIUS`, `TRASH_RADIUS`
- State setters: camelCase - `setGameState()`, `setActiveVinyl()`
- Event handlers: `handle` + EventName - `handlePointerDown()`, `handlePointerUp()`, `handlePointerMove()`
- Refs: camelCase + `Ref` suffix - `dragElRef`, `crateRefs`, `trashRef`
- Callback functions: `register` + Name - `registerCrateRef()`

**Types and Enums:**
- Enums: PascalCase - `Genre`, `Difficulty`, `LevelMode`, `ShopTheme`
- Interfaces: PascalCase - `Vinyl`, `Crate`, `GameState`, `FlyingVinyl`
- Type aliases: PascalCase - `ItemType`

## Where to Add New Code

**New Feature (Gameplay Mechanic):**
- Primary code: `App.tsx` (state management and event handlers)
- Game rules: `services/gameLogic.ts` (if it involves level generation or progression)
- Types: Add to `types.ts`

**New Component/Module:**
- Implementation: `components/[ComponentName].tsx` (if visual/UI)
- Logic: `services/[serviceName].ts` (if pure logic)
- Export: From `App.tsx` or component file

**New Visual Variant:**
- Record styling: `components/VinylCover.tsx` - add to art generation logic
- Crate theming: `components/CrateBox.tsx` - extend `CRATE_THEMES` record
- Particle effects: `App.tsx:ParticleExplosion` component

**Utilities:**
- Shared helpers: Currently inline in `App.tsx` or `services/gameLogic.ts`
- Consider extracting to `services/utils.ts` if reused across multiple files

**State Logic:**
- Game progression: `App.tsx:startGame()`, `startLevel()`
- Move/time constraints: `services/gameLogic.ts:generateLevel()`
- Difficulty modifiers: `DIFFICULTY_SETTINGS` record in `services/gameLogic.ts`

## Special Directories

**node_modules/:**
- Purpose: External dependencies
- Generated: Yes (via npm install)
- Committed: No (in .gitignore)

**.planning/:**
- Purpose: Planning and codebase documentation
- Generated: Yes (created by GSD tools)
- Committed: Yes (stores analysis documents)

## File Statistics

- **Largest file**: `App.tsx` (655 lines) - contains main game component
- **Component files**: 3 total (`VinylCover.tsx`, `CrateBox.tsx`, `VinylDisc.tsx`)
- **Service files**: 1 total (`gameLogic.ts`)
- **Type definitions**: `types.ts` (62 lines)

## Architecture Patterns

**Component Props Pattern:**
- Components receive data via props and callbacks
- Example: `CrateBox` receives `crate: Crate`, `highlightState: string`, `onRegisterRef: function`
- No prop drilling - props are passed directly from App to each component

**Ref-Based Integration:**
- React refs used to store DOM element references for drag target detection
- `crateRefs` map stores all crate box elements by ID
- Refs accessed in `handlePointerMove()` to calculate distances

**Inline Styling:**
- CSS classes via Tailwind (inferred from classNames)
- Inline styles for dynamic values: transforms, positions, custom colors
- CSS-in-JS for animations: keyframes defined inside components

**Game State Separation:**
- Single source of truth in `gameState` object
- Separate state for UI concerns: `activeVinyl`, `magnetTargetId`, `flyingVinyls`
- Level data in `crates` and `shelfVinyls` arrays

---

*Structure analysis: 2026-02-07*
