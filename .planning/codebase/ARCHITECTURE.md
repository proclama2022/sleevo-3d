# Architecture

**Analysis Date:** 2026-02-10

## Pattern Overview

**Overall:** Single-Page Application with Event-Driven Game Architecture

**Key Characteristics:**
- React 19 with TypeScript using functional components and hooks
- Vite build tool with Capacitor for cross-platform mobile deployment
- Event-driven gameplay with real-time state management
- Service-oriented architecture for game logic separation
- Web Audio API for procedural audio generation
- CSS-based particle system for visual effects

## Layers

**Presentation Layer (components/):**
- Purpose: UI components and game visual elements
- Location: `components/`
- Contains: React components for game screens, UI controls, and visual elements
- Depends on: React hooks, CSS styling, and TypeScript types
- Used by: `App.tsx` for rendering all game UI

**Service Layer (services/):**
- Purpose: Business logic and game mechanics
- Location: `services/`
- Contains: Game logic, storage, audio, objectives, and random events
- Depends on: TypeScript types and Web APIs
- Used by: `App.tsx` and components for game functionality

**Data Layer (types.ts, constants/):**
- Purpose: Type definitions and game constants
- Location: `types.ts` and `constants/`
- Contains: TypeScript interfaces, enums, and configuration constants
- Depends on: No external dependencies
- Used by: All layers for type safety and configuration

**Hook Layer (hooks/):**
- Purpose: Custom React hooks for reusable logic
- Location: `hooks/`
- Contains: Custom hooks like `useWindowSize`
- Depends on: React and browser APIs
- Used by: Components for custom functionality

## Data Flow

**Game Initialization:**
1. `index.tsx` renders the React app with ErrorBoundary
2. `App.tsx` initializes game state and services
3. Services load saved data and configure audio context
4. Game state initializes with level generation and crate placement

**Gameplay Loop:**
1. Player drags vinyl (mousedown/touchstart)
2. Vinyl moves with cursor (mousemove/touchmove)
3. Drop logic determines valid crate or trash bin
4. Events trigger: particle effects, SFX, score updates
5. State updates propagate through game services
6. UI re-renders with new game state

**State Management:**
- React useState hooks in `App.tsx` for primary game state
- Services manage persistent data and game logic
- LocalStorage for data persistence
- Capacitor for device-specific features (haptics, status bar)

## Key Abstractions

**GameState:**
- Purpose: Central game state interface
- Examples: `types.ts` (lines 50-90)
- Pattern: Single source of truth with immutable updates

**Crate Management:**
- Purpose: Genre-based vinyl sorting system
- Examples: `types.ts` (lines 37-44), `services/gameLogic.ts`
- Pattern: Container pattern with position and capacity tracking

**Audio System:**
- Purpose: Procedural audio generation
- Examples: `services/audio.ts`
- Pattern: Service pattern with Web Audio API integration

**Event System:**
- Purpose: Random gameplay events
- Examples: `services/randomEvents.ts`, `types/events.ts`
- Pattern: Publisher-subscriber with event state management

## Entry Points

**Main Application:**
- Location: `index.tsx`
- Triggers: React DOM mounting
- Responsibilities: App initialization and root rendering

**Game Controller:**
- Location: `App.tsx`
- Triggers: User interactions and game lifecycle events
- Responsibilities: State management, service coordination, and UI rendering

**Build System:**
- Location: `vite.config.ts`
- Triggers: Development and build commands
- Responsibilities: Bundle optimization and development server setup

## Error Handling

**Strategy:** Component-based error boundaries with graceful degradation

**Patterns:**
- ErrorBoundary.tsx catches component rendering errors
- Graceful fallback for audio context initialization
- Validation of saved data on load

## Cross-Cutting Concerns

**Logging:** Console logging with contextual information
**Validation:** Type-based validation with runtime checks
**Authentication:** Not applicable (single-player game)
**Internationalization:** Not detected (English-only interface)

---

*Architecture analysis: 2026-02-10*