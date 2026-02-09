# Coding Conventions

**Analysis Date:** 2026-02-07

## Naming Patterns

**Files:**
- PascalCase for React components: `VinylDisc.tsx`, `CrateBox.tsx`, `VinylCover.tsx`
- camelCase for utilities and services: `gameLogic.ts`
- lowercase for type definition files: `types.ts`
- lowercase for entry point: `index.tsx`

**Functions:**
- camelCase for all functions: `generateLevel()`, `calculateScore()`, `randomPick()`
- camelCase for React component functions, PascalCase for exported component names
- Helper/internal functions prefixed with descriptive action verbs: `getAvailableGenres()`, `getShopTheme()`, `triggerHaptic()`

**Variables:**
- camelCase for all variables: `levelIndex`, `gameState`, `crateRefs`, `dustLevel`
- const for immutable declarations: `const ARTIST_NAMES = [...]`
- UPPERCASE_SNAKE_CASE for constants and configuration objects: `DIFFICULTY_SETTINGS`, `GENRE_UNLOCK_ORDER`, `MAGNET_RADIUS`
- Descriptive names: `magnetTargetId` not `target`, `activeVinyl` not `vinyl`

**Types:**
- PascalCase for interface names: `Vinyl`, `Crate`, `GameState`, `VinylCoverProps`, `DifficultyConfig`
- camelCase for type properties: `id`, `genre`, `dustLevel`, `isRevealed`
- Union types use single quotes: `'vinyl' | 'trash'`, `'Easy' | 'Normal' | 'Hard'`

## Code Style

**Formatting:**
- No explicit formatter configured (no ESLint, Prettier, or Biome config detected)
- Spacing: 2-space indentation observed throughout
- Line length: No hard limit observed, but code tends to stay under 100 chars where practical
- Semicolons used consistently at end of statements

**Linting:**
- No linting configuration detected (no .eslintrc, eslint.config.js, biome.json)
- Type safety enforced via TypeScript compiler with `isolatedModules: true`, `noEmit: true`

## Import Organization

**Order:**
1. React and external libraries: `import React from 'react'`
2. Type imports and custom types: `import { Genre, Vinyl, Crate } from './types'`
3. Service/utility imports: `import { generateLevel, calculateScore } from './services/gameLogic'`
4. Component imports: `import { VinylCover } from './components/VinylCover'`
5. Icon/UI library imports: `import { Trophy, Music, Disc3 } from 'lucide-react'`
6. Capacitor/platform imports: `import { Capacitor } from '@capacitor/core'`

**Path Aliases:**
- `@/*` resolves to project root (configured in tsconfig.json)
- Example: `import { VinylCover } from '@/components/VinylCover'` would work but codebase uses relative imports (`./components/VinylCover`)
- Relative imports (../) used consistently instead of aliases

## Error Handling

**Patterns:**
- Try-catch with empty catch blocks for non-critical operations (haptic feedback):
  ```typescript
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (e) {}
  ```
- Null checks before operations: `if (!rootElement) { throw new Error(...) }`
- Optional chaining for safe property access
- Fallback behavior on platform checks: `if (Capacitor.isNativePlatform()) { ... } else if (navigator.vibrate) { ... }`

## Logging

**Framework:** Native `console` object

**Patterns:**
- No explicit logging calls found in codebase
- Developers should use `console.log()`, `console.error()`, `console.warn()` where needed
- Suggested: Use console methods for debug information rather than creating a custom logger

## Comments

**When to Comment:**
- Comments used sparingly; code is mostly self-documenting
- Comments appear mainly for section headers: `// --- CSS BASED PARTICLE SYSTEM (Optimized) ---`
- Comments explain non-obvious game logic: `// Start with 2 genres, unlock a new one every 2 levels`
- Comments clarify visual/styling decisions: `// Painted black wood`, `// Bleached wood`

**JSDoc/TSDoc:**
- No JSDoc comments found in codebase
- All functions rely on TypeScript parameter and return types for documentation
- Suggested: Add JSDoc for public exported functions to improve IDE hints

## Function Design

**Size:**
- Range from 15 lines (simple utility) to 50+ lines (component render logic)
- App.tsx main component is 655 lines total (monolithic, could be refactored)
- Most helper functions kept to 20-35 lines for readability

**Parameters:**
- Props destructured in function signature: `({ crate, highlightState, onRegisterRef })`
- Type annotations required for all parameters (TypeScript strict mode)
- Default parameters used when sensible: `size = 140`, `className = ''`

**Return Values:**
- Explicit type annotations on all exported functions: `(): Genre[]`, `(): ShopTheme`, `(): DifficultyConfig`
- React components always return JSX with proper typing
- Helper functions return typed values (numbers, objects, React.CSSProperties)

## Module Design

**Exports:**
- Named exports for all components: `export const VinylDisc: React.FC<...>`
- Named exports for service functions: `export const generateLevel(...)`
- Constants exported for reuse: `export const GENRE_COLORS`, `export const GENRE_LABELS`
- All enums exported: `export enum Genre { ... }`

**Barrel Files:**
- No barrel files (index.ts re-exports) exist
- Direct imports from specific files used throughout: `from './components/VinylCover'`
- types.ts acts as central type definition file, imported by all modules

## Component Patterns

**Functional Components:**
- All components are functional, not class-based
- React.FC type annotation used for all component declarations
- Props interfaces defined immediately before component: `interface VinylCoverProps { ... }`

**Memoization:**
- React.memo used selectively for expensive components:
  - `VinylCover` memoized (expensive SVG/canvas rendering)
  - `CrateBox` memoized (complex 3D CSS rendering)
  - `VinylDisc` not memoized (lightweight)
- Improves performance on re-renders without dependency arrays

**Inline Components:**
- Small utility components defined inline: `ParticleExplosion`, `CrateDeco`, `DustOverlay`, `GeometricArt`
- These functions return JSX elements, not wrapped as React.FC

## Styling

**Approach:**
- Tailwind CSS utility classes for all styling
- Inline `style` prop for dynamic/computed CSS properties
- CSS-in-JS for animations (keyframe definitions inside components)
- No CSS modules, no CSS-in-JS libraries (styled-components, emotion)

**Patterns:**
```typescript
// Tailwind classes
className={`relative w-[130px] md:w-[160px] h-[170px] md:h-[190px]`}

// Inline styles for computed values
style={{ left: x, top: y, backgroundColor: color }}

// Dynamic class selection
className={getBgClass()}

// Animation definitions
<style>{`
  @keyframes particle-burst { ... }
  .animate-particle-burst { animation: particle-burst 0.6s ease-out forwards; }
`}</style>
```

---

*Convention analysis: 2026-02-07*
