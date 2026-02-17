# Architecture Research

**Domain:** React UI Layer over Three.js Game
**Researched:** 2026-02-11
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         UI Layer (React)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ TopBar   │  │ Controls │  │ Tutorial │  │ Modals   │        │
│  │ (HUD)    │  │ (Buttons)│  │ (Dialog) │  │ (Settings)│       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │            │            │            │                      │
├───────┴────────────┴────────────┴────────────┴──────────────────────┤
│                    Game State Bridge (Zustand)                       │
│  - Shared state between UI and Three.js                              │
│  - Event callbacks for game events → UI updates                      │
├─────────────────────────────────────────────────────────────────────────┤
│                      Three.js Game Layer                            │
│  ┌─────────────────────────────────────────────────────┐            │
│  │              GameManager (1500+ lines)               │            │
│  │  - Level loading, vinyl placement, scoring         │            │
│  └─────────────────────────────────────────────────────┘            │
│  ┌─────────────────────────────────────────────────────┐            │
│  │            InputController (900+ lines)            │            │
│  │  - Raycasting, drag/drop, collision detection    │            │
│  └─────────────────────────────────────────────────────┘            │
│  ┌─────────────────────────────────────────────────────┐            │
│  │             SceneRenderer (Three.js)              │            │
│  │  - WebGL canvas, camera, lighting, animation      │            │
│  └─────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|----------------------|
| **App Root** | Mounts React app, initializes Three.js, provides state context | `App.tsx` with `useEffect` for game initialization |
| **TopBar/HUD** | Displays score, level, progress | React components reading from Zustand store |
| **Controls** | Restart, undo, settings buttons | Styled components with click handlers |
| **Tutorial/Modals** | Onboarding, level complete, settings | Portal-rendered overlays |
| **GameBridge** | Two-way communication between React and Three.js | Custom hook using Zustand for state |
| **Three.js Layer** | Continues as-is (vanilla TypeScript) | Existing `GameManager.ts`, `InputController.ts` |

## Recommended Project Structure

```
src/
├── ui/                    # NEW: React UI layer
│   ├── components/         # React components
│   │   ├── TopBar/       # HUD (score, level, progress)
│   │   │   ├── TopBar.tsx
│   │   │   ├── TopBar.test.tsx
│   │   │   └── index.ts
│   │   ├── Controls/     # Bottom action buttons
│   │   │   ├── Controls.tsx
│   │   │   ├── RestartButton.tsx
│   │   │   └── index.ts
│   │   ├── Tutorial/     # Onboarding modal
│   │   │   ├── Tutorial.tsx
│   │   │   └── index.ts
│   │   ├── Modals/       # Settings, level complete, etc.
│   │   │   ├── LevelComplete.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── index.ts
│   │   └── common/       # Shared UI primitives
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── index.ts
│   ├── hooks/            # Custom React hooks
│   │   ├── useGameState.ts    # Bridge to game state
│   │   ├── useGameControls.ts  # Game control methods
│   │   └── useBreakpoints.ts  # Responsive breakpoints
│   ├── store/            # Zustand state management
│   │   ├── gameStore.ts       # Game state (score, level, etc.)
│   │   └── uiStore.ts        # UI state (modals, settings)
│   ├── styles/           # Theme & design tokens
│   │   ├── theme.ts          # styled-components theme
│   │   ├── breakpoints.ts     # Responsive breakpoints
│   │   └── tokens.ts         # Design tokens (colors, spacing)
│   ├── App.tsx           # React root component
│   └── index.tsx         # React entry point
├── game/                 # EXISTING: Three.js game layer (minimal changes)
│   ├── GameManager.ts    # Game logic (keep as-is)
│   ├── InputController.ts # Input handling (keep as-is)
│   ├── SceneRenderer.ts  # Three.js renderer (keep as-is)
│   ├── gameRules.ts      # Game rules (keep as-is)
│   └── types.ts         # Shared types
├── services/             # NEW: Bridge services
│   └── GameBridge.ts    # Communication layer between React and Three.js
├── main.ts              # MODIFIED: Initialize both React and Three.js
└── style.css            # Global styles (shared)
```

### Structure Rationale

- **`ui/` folder:** Isolates React code from existing Three.js game
- **`game/` folder:** Preserves existing architecture without refactoring
- **`services/` folder:** Clean API for UI ↔ Game communication
- **`hooks/` folder:** Reusable state access patterns for components
- **`store/` folder:** Single source of truth for game state

## Architectural Patterns

### Pattern 1: Hybrid Mounting Strategy

**What:** Mount React root alongside existing Three.js canvas. React manages UI overlay, Three.js manages canvas.

**When to use:** Adding React UI to existing vanilla Three.js game without major refactoring.

**Trade-offs:**
- **Pros:** Minimal changes to existing game code; clean separation; React for complex UI
- **Cons:** Two separate update loops; state synchronization needed

**Example:**
```typescript
// main.ts - Modified entry point
import { SceneRenderer } from './game/SceneRenderer';
import { GameManager } from './game/GameManager';
import { InputController } from './game/InputController';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import { GameBridge } from './services/GameBridge';
import './style.css';

// 1. Initialize Three.js game as before
const container = document.getElementById('canvas-container');
const sceneRenderer = new SceneRenderer(container);
const gameManager = new GameManager(sceneRenderer);
// ... InputController setup

// 2. Initialize React app for UI overlay
const uiContainer = document.getElementById('ui-overlay');
const bridge = new GameBridge(gameManager); // State bridge
const root = createRoot(uiContainer!);
root.render(<App bridge={bridge} />);

// 3. Connect game events to React via bridge
bridge.initialize();
```

### Pattern 2: GameBridge with Zustand

**What:** State management layer using Zustand for game state, bridging vanilla TypeScript game and React UI.

**When to use:** Need two-way data flow between Three.js and React without prop drilling.

**Trade-offs:**
- **Pros:** Single source of truth; minimal re-renders; TypeScript support
- **Cons:** Additional dependency; learning curve for Zustand

**Example:**
```typescript
// store/gameStore.ts - Zustand store
import { create } from 'zustand';

interface GameState {
  score: number;
  level: number;
  progress: number;
  total: number;
  status: 'playing' | 'completed' | 'idle';
  updateScore: (score: number) => void;
  updateProgress: (placed: number, total: number) => void;
  updateStatus: (status: GameState['status']) => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  level: 1,
  progress: 0,
  total: 0,
  status: 'idle',
  updateScore: (score) => set({ score }),
  updateProgress: (placed, total) => set({ progress: placed, total }),
  updateStatus: (status) => set({ status }),
}));

// services/GameBridge.ts - Connects game to store
import { useGameStore } from '../ui/store/gameStore';

export class GameBridge {
  constructor(private gameManager: GameManager) {}

  initialize() {
    // Subscribe to game state changes
    this.gameManager.onStateChange((state) => {
      useGameStore.getState().updateScore(state.score);
      useGameStore.getState().updateProgress(state.placed, state.total);
      useGameStore.getState().updateStatus(state.status);
    });
  }

  restart() {
    this.gameManager.restart();
  }
}

// ui/components/TopBar/TopBar.tsx - UI component
import { useGameStore } from '../../store/gameStore';
import styled from 'styled-components';

const StatCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.68) 0%, rgba(253, 241, 228, 0.82) 100%);
  border-radius: 16px;
  /* ...existing styles from index.html... */
`;

export const TopBar = () => {
  const { score, level, progress, total } = useGameStore();

  return (
    <TopBarContainer>
      <Brand>
        <Title>SLEEVO</Title>
        <Subtitle>Analog Puzzle Mode</Subtitle>
      </Brand>
      <HUD>
        <StatCard>
          <Label>Level</Label>
          <Value>{level}</Value>
        </StatCard>
        <StatCard>
          <Label>Score</Label>
          <Value>{score}</Value>
        </StatCard>
        <StatCard>
          <Label>Progress</Label>
          <Value>{progress}/{total}</Value>
        </StatCard>
      </HUD>
    </TopBarContainer>
  );
};
```

### Pattern 3: Theme Provider with styled-components

**What:** Centralized design system using styled-components ThemeProvider.

**When to use:** Building UI layer with consistent styling across components.

**Trade-offs:**
- **Pros:** Type-safe theme; dynamic theming; collocated styles
- **Cons:** Bundle size increase; CSS-in-JS runtime overhead

**Example:**
```typescript
// ui/styles/theme.ts
import { DefaultTheme } from 'styled-components';

export const theme: DefaultTheme = {
  colors: {
    ink: {
      main: '#24180f',
      soft: '#6f5947',
    },
    accent: {
      main: '#ff6c3f',
      ice: '#2db2d7',
    },
    glass: {
      border: 'rgba(255, 255, 255, 0.38)',
      fill: 'rgba(255, 250, 244, 0.72)',
    },
  },
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
  },
  fonts: {
    display: "'Bebas Neue', sans-serif",
    ui: "'Manrope', sans-serif",
  },
  breakpoints: {
    compact: '430px',
    medium: '768px',
    large: '1024px',
  },
};

// ui/App.tsx
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { TopBar } from './components/TopBar';
import { Controls } from './components/Controls';
import { Tutorial } from './components/Tutorial';

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Tutorial />
      <TopBar />
      <Controls />
    </ThemeProvider>
  );
};
```

## Data Flow

### Request Flow (UI → Game)

```
[User clicks Restart in React]
    ↓
[Controls.tsx → onClick handler]
    ↓
[useGameControls hook → restart()]
    ↓
[GameBridge.restart() → gameManager.restart()]
    ↓
[GameManager resets level]
    ↓
[GameBridge emits state change]
    ↓
[React components re-render with new state]
```

### State Update Flow (Game → UI)

```
[GameManager updates score/moves]
    ↓
[GameBridge callback triggered]
    ↓
[Zustand store updated]
    ↓
[React components subscribed to store re-render]
    ↓
[UI displays new values]
```

### Key Data Flows

1. **Vinyl Placement:** Three.js InputController → GameManager.placeVinylOnShelf() → GameBridge → Zustand store → React TopBar update
2. **Restart:** React Controls button → GameBridge.restart() → GameManager.loadLevel() → Zustand reset → React re-render
3. **Responsive Breakpoints:** Window resize → useBreakpoints hook → theme breakpoint → styled-components media queries

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 10-20 UI components | Single Zustand store sufficient; styled-components theme works as-is |
| 20-50 UI components | Split stores: `gameStore`, `uiStore`; consider CSS modules for performance |
| 50+ UI components | Multiple feature-based stores; evaluate React Query for server state; consider CSS extraction |

### Scaling Priorities

1. **First bottleneck:** Too many Zustand subscribers → use `useShallow` selector for partial updates
2. **Second bottleneck:** styled-components runtime → extract static CSS for production builds

## Anti-Patterns

### Anti-Pattern 1: Direct DOM Manipulation from React

**What people do:** Using `useRef` to manipulate existing HTML UI elements created by vanilla JS.

**Why it's wrong:** Breaks React's declarative model; causes sync issues; hard to maintain.

**Instead:** Migrate all DOM UI to React components. Let React control the entire UI overlay.

### Anti-Pattern 2: Tight Coupling Between UI and Game

**What people do:** Importing React components directly into GameManager.ts.

**Why it's wrong:** Breaks separation of concerns; makes game layer depend on UI framework.

**Instead:** Use GameBridge with callback interfaces. Game layer shouldn't know about React.

### Anti-Pattern 3: Inline Styling Over styled-components

**What people do:** Using `style={{}}` prop instead of styled components for theming.

**Why it's wrong:** Loses design token benefits; inconsistent styling; harder to maintain.

**Instead:** Use styled-components with theme tokens for all visual elements.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| None (client-side game) | N/A | Game runs entirely in browser |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **UI Layer ↔ Game Layer** | GameBridge callbacks + Zustand store | Game emits events, UI consumes via store |
| **React Components ↔ GameBridge** | Custom hooks (`useGameState`, `useGameControls`) | Hooks abstract bridge complexity |
| **Three.js ↔ React** | Read-only canvas reference | React doesn't manipulate Three.js objects directly |

## Responsive Breakpoint Handling

### Three Breakpoints (from requirements)

```typescript
// ui/styles/breakpoints.ts
export const breakpoints = {
  compact: '430px',   // Mobile optimization
  medium: '768px',    // Tablet/small desktop
  large: '1024px',    // Full desktop experience
};

// ui/hooks/useBreakpoints.ts
import { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive'; // or use window.matchMedia

export const useBreakpoints = () => {
  const isCompact = useMediaQuery({ maxWidth: 430 });
  const isMedium = useMediaQuery({ minWidth: 431, maxWidth: 767 });
  const isLarge = useMediaQuery({ minWidth: 768 });

  return { isCompact, isMedium, isLarge };
};
```

### Theme-Based Breakpoints in styled-components

```typescript
import styled from 'styled-components';

const TopBar = styled.div`
  padding: 12px 14px;

  @media (max-width: ${({ theme }) => theme.breakpoints.compact}) {
    flex-direction: column;
    min-height: 106px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    min-height: 86px;
  }
`;
```

## Migration Strategy

### Phase 1: Setup (Don't break existing game)
1. Install React dependencies (`react`, `react-dom`, `styled-components`, `zustand`)
2. Create `src/ui/` structure with basic components
3. Modify `main.ts` to mount React alongside Three.js
4. Migrate static UI elements (top bar, controls) to React

### Phase 2: State Bridge
1. Create `GameBridge` service for communication
2. Set up Zustand store for game state
3. Connect GameManager events to store updates
4. Replace manual DOM updates with React state

### Phase 3: Interactive UI
1. Migrate tutorial modal to React
2. Add settings modal with audio controls
3. Implement level complete screen with animations
4. Add responsive breakpoints for mobile/tablet

## Sources

- **React + Three.js Integration:** React Three Fiber documentation (pmnd.rs/react-three-fiber) - HIGH confidence
- **Zustand Patterns:** Zustand official docs (github.com/pmndrs/zustand) - HIGH confidence
- **styled-components Theme:** styled-components documentation (styled-components.com/docs) - HIGH confidence
- **Existing Codebase Analysis:** GameManager.ts (1763 lines), InputController.ts (873 lines), main.ts - HIGH confidence
- **HTML Structure:** index.html - existing UI overlay pattern - HIGH confidence

---
*Architecture research for: React UI Layer over Three.js Game*
*Researched: 2026-02-11*
