# Coding Conventions

**Analysis Date:** 2026-02-10

## Naming Patterns

**Files:**
- PascalCase for components: `VinylDisc.tsx`, `CollectionScreen.tsx`, `ErrorBoundary.tsx`
- camelCase for services and hooks: `gameLogic.ts`, `useWindowSize.ts`
- kebab-case for assets: `constants/gameConfig.ts`

**Functions:**
- PascalCase for React components and class constructors
- camelCase for utility functions and methods: `calculateScore`, `generateLevel`, `saveAudioSettings`
- Private functions start with underscore: `_handleInternalLogic`

**Variables:**
- camelCase for all variables: `currentMusicSource`, `windowSize`, `filterGenre`
- Constants are UPPER_SNAKE_CASE: `MAX_DUST_LEVEL`, `COMBO_TIMEOUT`, `FLYING_VINYL_DURATION`
- Type parameters use T, U, V: `debounce<T extends (...args: any[]) => void>`

**Types:**
- PascalCase for interfaces and type aliases: `Vinyl`, `GameState`, `AudioSettings`
- enum names are PascalCase with members UPPER_SNAKE_CASE: `Genre.ROCK`, `RandomEventType.EARTHQUAKE`
- Generic types use T, U, V: `<T>`, `<T, U>`

## Code Style

**Formatting:**
- 2 spaces for indentation (consistent with Tailwind)
- Semicolons at end of statements
- Single quotes for strings (except JSX attributes)
- Trailing commas in multiline objects and arrays
- Line length: 100-120 characters (wrapped where appropriate)

**Linting:**
- No formal ESLint configuration detected
- Consistent formatting across files
- TypeScript compiler strict mode enabled

**Import Organization:**
```typescript
// 1. React and third-party imports
import React, { useState, useEffect, useRef } from 'react';
import { Crate, Vinyl, GameState } from '../types';
import { generateLevel, calculateScore } from '../services/gameLogic';

// 2. Internal module imports
import { useWindowSize } from '../hooks/useWindowSize';
import { VinylDisc } from './VinylDisc';
```

## Error Handling

**Patterns:**
```typescript
// Error boundaries with fallback UI
class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error);
  }
}

// Try-catch for async operations
try {
  const result = await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
  // Fallback or error state
}

// Null checks with optional chaining
const user = data?.user?.profile?.name;
```

## Logging

**Framework:** Console logging for debugging

**Patterns:**
- Console.error for errors: `console.error('Failed to save audio settings:', error);`
- Console.warn for warnings: `console.warn('Save data version mismatch, using defaults');`
- Console.log for development info (limited usage)
- No production logging service configured

## Comments

**When to Comment:**
- Complex algorithms or game mechanics
- External dependencies and their usage
- Configuration constants and their purpose
- TODO items marked with `// TODO: description`

**JSDoc/TSDoc:**
- Used extensively for functions and components
- Describes purpose, parameters, and return values
- Example from gameLogic.ts:
```typescript
/**
 * Generate theme-specific background music using Web Audio API
 * Each theme has a different tempo, chord progression, and feel
 */
const generateThemeMusic = (theme: ShopTheme): AudioBuffer => {
```

## Function Design

**Size:**
- Small, focused functions (10-50 lines)
- Maximum 1 level of nesting where possible
- Early returns for error cases

**Parameters:**
- 3-5 parameters maximum
- Use objects for complex parameter sets
- Optional parameters with default values

**Return Values:**
- Consistent return types
- Union types for multiple possibilities
- Void for side-effect-only functions

## Module Design

**Exports:**
- Named exports preferred over default
- Interface exports for types
- Utility functions exported from service modules

**Barrel Files:** Not used - direct imports from specific files

## React Patterns

**Components:**
- Functional components with hooks
- TypeScript interfaces for props
- Inline styles only for dynamic values
- Tailwind classes for styling

**State Management:**
- useState for local state
- useRef for DOM references and persistent values
- useEffect for side effects with proper cleanup

**Event Handlers:**
- Arrow functions for inline handlers
- useCallback for event handlers passed to child components
- Proper typing for event parameters

## TypeScript Patterns

**Types:**
- Strong typing throughout
- Interfaces for object shapes
- Enums for fixed sets of values
- Generics for reusable components

**Strict Mode:**
- Enabled in tsconfig.json
- No implicit any types
- Strict null checks
- No unused variables

---

*Convention analysis: 2026-02-10*
```