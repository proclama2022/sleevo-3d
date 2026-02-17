# Structure

## Directory Layout

```
Sleevo Vinyl Shop Manager/
├── src/                    # Source code
│   ├── main.ts            # Entry point, initialization
│   ├── GameManager.ts     # Core game logic (~1500 lines)
│   ├── InputController.ts # User input handling (~900 lines)
│   ├── SceneRenderer.ts   # Three.js rendering
│   ├── VinylMesh.ts       # Vinyl 3D objects
│   ├── types.ts           # TypeScript interfaces
│   ├── gameRules.ts       # Genre-to-column mappings
│   └── style.css          # UI styling
│
├── public/                 # Static assets
├── ios/                    # Capacitor iOS app
├── dist/                   # Build output
├── node_modules/           # Dependencies
│
├── index.html              # HTML entry point
├── package.json            # NPM configuration
├── vite.config.ts          # Vite bundler config
├── tsconfig.json           # TypeScript config
└── .env.local              # Environment variables
```

## Key Files

### Core Systems
| File | Purpose | Size |
|------|---------|------|
| `src/GameManager.ts` | Game state, vinyl creation, shelf rendering | ~1500 lines |
| `src/InputController.ts` | Drag-drop, raycasting, touch handling | ~900 lines |
| `src/SceneRenderer.ts` | Three.js scene, camera, lights | ~200 lines |
| `src/main.ts` | App initialization, game loop | ~100 lines |

### Data & Types
| File | Purpose |
|------|---------|
| `src/types.ts` | Vinyl, Level, Cell, ShelfConfig interfaces |
| `src/gameRules.ts` | getColumnForGenre(), genre mappings |

### Configuration
| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite bundler settings |
| `package.json` | Dependencies, scripts |
| `tsconfig.json` | TypeScript compiler options |

## Naming Conventions

### Files
- **Components:** PascalCase.ts (GameManager.ts)
- **Utilities:** camelCase.ts (gameRules.ts)
- **Types:** lowercase.ts (types.ts)

### TypeScript
- **Classes:** PascalCase (GameManager, InputController)
- **Methods:** camelCase (placeVinylOnShelf, snapToShelfGrid)
- **Private methods:** prefixed with underscore or private keyword
- **Interfaces:** PascalCase (Vinyl, Level, Cell)

### Three.js Objects
- **Groups:** `shelfGroup`, `vinylsGroup`, `carouselGroup`
- **Meshes:** Named with `.name` property for lookup
- **Materials:** Descriptive names (coverMaterial, sleeveMaterial)

## Key Locations

### Adding New Genres
1. `src/gameRules.ts` - Add to COLUMN_GENRE_LABELS array
2. `src/GameManager.ts` - Add case in drawAlbumArt() switch

### Modifying Vinyl Appearance
- `src/GameManager.ts:createVinylMesh()` - Vinyl geometry
- `src/GameManager.ts:drawAlbumArt()` - Cover art generation

### Changing Shelf Layout
- `src/GameManager.ts:buildShelf()` - Shelf geometry
- `src/GameManager.ts:placeVinylOnShelf()` - Placement logic

### UI Modifications
- `index.html` - DOM structure
- `src/style.css` - Styling
- `src/InputController.ts` - UI element references

## Asset Locations

| Asset Type | Location |
|------------|----------|
| Procedural textures | Generated in GameManager.ts via Canvas |
| 3D models | None (all procedural geometry) |
| Fonts | System fonts via CSS |
| Icons | None (text-based UI) |
