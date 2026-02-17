# Coding Conventions

**Analysis Date:** 2026-02-11

## Naming Patterns

**Files:**
- Lower case with hyphens: `gameRules.ts`, `sceneRenderer.ts`, `vinylMesh.ts`
- Index files not used (no `index.ts`)
- Feature files follow component naming: `main.ts`, `inputController.ts`

**Functions & Methods:**
- PascalCase for class methods: `loadLevel()`, `createVinyls()`, `update()`
- PascalCase for functions: `setupVinylDemo()`, `getColumnForGenre()`
- Private methods prefixed with `private`: `initializeGrid()`, `buildShelf()`

**Variables:**
- camelCase for local variables: `shelfWidth`, `vinylCount`, `deltaTime`
- PascalCase for class properties: `this.sceneRenderer`, this.shelfGroup`
- Constants using UPPER_SNAKE_CASE: `AI_REF_SCENE_URL`, `COLUMN_GENRE_LABELS`

**Types & Interfaces:**
- PascalCase for interfaces: `Vinyl`, `Level`, `ShelfConfig`
- Types follow same pattern: `VinylWidth`, `GameStatus`

## Code Style

**Formatting:**
- No explicit formatter configured (using defaults)
- 2-space indentation (observed in code)
- Semicolons consistently used
- Trailing commas in multi-line objects and arrays

**Linting:**
- TypeScript strict mode enabled in `tsconfig.json`
- ESLint not configured (no `.eslintrc` found)
- Rules enforced by TypeScript compiler:
  - `strict: true`
  - `noUnusedLocals: true`
  - `noUnusedParameters: true`
  - `noFallthroughCasesInSwitch: true`

## Import Organization

**Order:**
1. External imports (THREE.js, libraries)
2. Relative imports from local modules
3. Type imports (when needed)

**Pattern:**
```typescript
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SceneRenderer } from './SceneRenderer';
import { GameManager } from './GameManager';
import { Level, Vinyl } from './types';
```

**Path Aliases:**
- Not configured - using relative imports only

## Error Handling

**Patterns:**
- Constructor validation: Throw errors for missing dependencies
- Console logging for debugging (extensive use)
- No try-catch blocks found in production code
- Graceful fallbacks for texture loading

**Examples:**
```typescript
constructor(container: HTMLElement) {
  if (!container) {
    throw new Error('Canvas container not found');
  }
}
```

```typescript
// Fallback texture loading
() => {
  const hasFallback = index + 1 < candidates.length;
  if (hasFallback) {
    tryLoad(index + 1);
    return;
  }
  console.warn(`AI texture non caricata: ${candidate}`);
}
```

## Logging

**Framework:**
- `console.log` for debugging (extensive throughout codebase)
- Descriptive messages with emojis for visual grouping
- No structured logging library

**Patterns:**
```typescript
console.log('🎮 Sleevo 3D initialized!');
console.log('👆 Pick a vinyl from the carousel and drop it in its matching genre column.');
console.log(`Level loaded: ${level.id} with ${this.shelfCols} columns (Single Row mode)`);
```

## Comments

**When to Comment:**
- Complex Three.js geometry creation
- Vintage/retro design decisions
- Genre-specific artwork logic
- Animation timing and effects

**JSDoc/TSDoc:**
- Interface definitions have detailed comments
- Complex functions documented with purpose
- No consistent function-level documentation

**Examples:**
```typescript
/**
 * Represents a vinyl record in the game.
 * Each vinyl has a unique id and properties used for sorting rules.
 */
export interface Vinyl {
  id: string;
  width: VinylWidth;
  color: string;
  genre: string;
  year: number;
  title?: string;
  artist?: string;
  coverImage?: string;
}
```

## Function Design

**Size:**
- Large functions acceptable for complex operations (e.g., `buildShelf()` - 300+ lines)
- Smaller functions for specific operations
- No strict line limit enforcement

**Parameters:**
- 3-5 parameters typical
- Optional parameters with defaults where appropriate
- Object parameters for complex configurations

**Return Values:**
- Consistent return types
- Void for operations that modify state
- Values for calculations and queries

## Module Design

**Exports:**
- Default exports only for entry points
- Named exports for utilities and types
- No re-exports (no barrel files)

**File Structure:**
- One class per file
- Types centralized in `types.ts`
- Game logic separated by responsibility

---

*Convention analysis: 2026-02-11*