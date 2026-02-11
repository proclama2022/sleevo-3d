# Architecture

## Pattern
**3D Game Engine Pattern** - Custom lightweight game engine built on Three.js

The application follows a classic game loop architecture with separate concerns for rendering, input handling, and game state management.

## Layers

```
┌─────────────────────────────────────┐
│           UI Layer (HTML/CSS)        │
│   index.html, style.css             │
├─────────────────────────────────────┤
│         Game Orchestration           │
│   main.ts - Entry point, init        │
├─────────────────────────────────────┤
│         Core Game Systems            │
│   GameManager.ts - State, rules      │
│   InputController.ts - User input    │
│   SceneRenderer.ts - 3D rendering    │
├─────────────────────────────────────┤
│           3D Rendering               │
│   Three.js, VinylMesh.ts             │
├─────────────────────────────────────┤
│         Data & Rules                 │
│   types.ts, gameRules.ts             │
└─────────────────────────────────────┘
```

## Data Flow

```
User Input → InputController → GameManager → SceneRenderer → Canvas
                    ↓
              Vinyl dragged
                    ↓
            GameManager.placeVinylOnShelf()
                    ↓
            Update grid state
                    ↓
            SceneRenderer renders new position
```

## Key Abstractions

### GameManager
- **Purpose:** Central game state controller
- **Responsibilities:** Level loading, score tracking, vinyl placement, shelf management
- **Location:** `src/GameManager.ts`

### InputController
- **Purpose:** Handle all user interactions
- **Responsibilities:** Raycasting, drag-and-drop, touch/mouse events
- **Location:** `src/InputController.ts`

### SceneRenderer
- **Purpose:** Three.js scene management
- **Responsibilities:** Camera, lighting, scene setup, render loop
- **Location:** `src/SceneRenderer.ts`

### VinylMesh
- **Purpose:** Vinyl record 3D object factory
- **Responsibilities:** Create vinyl geometry, textures, materials
- **Location:** `src/VinylMesh.ts`

## Entry Points

1. **`src/main.ts`** - Application bootstrap
   - Initializes Three.js scene
   - Creates GameManager, InputController, SceneRenderer
   - Starts render loop

2. **`index.html`** - DOM entry point
   - Canvas container
   - UI overlay elements

## State Management

```
GameManager
├── level: Level (current puzzle)
├── score: number
├── moves: number
├── status: 'playing' | 'completed'
├── grid: Cell[][] (shelf grid state)
└── vinyls: Vinyl[] (all vinyl records)
```

## Key Design Decisions

1. **Single Row Mode** - Simplified puzzle with 1 row × N columns
2. **Procedural Art** - Album covers generated via Canvas API, not images
3. **Spine-out Display** - Vinyls show cover when dragging, placed front-facing
4. **No Physics** - Direct position manipulation, no physics engine
