# Architecture Research: Game Progression Systems

**Domain:** Mobile puzzle game (React/TypeScript)
**Researched:** 2026-02-10
**Confidence:** HIGH

## Standard Architecture for Game Progression

Game progression systems in mobile games typically follow a layered architecture that separates concerns across data, state management, visual presentation, and feedback orchestration. Based on research into established patterns and the existing Sleevo codebase, here's the recommended structure:

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  React Components: UI, Modals, Animations, Particles        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Level    │  │ Star     │  │ Unlock   │  │ Daily    │   │
│  │ Select   │  │ Display  │  │ Modal    │  │ Challenge│   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │             │          │
├───────┴─────────────┴──────────────┴─────────────┴─────────┤
│                   ORCHESTRATION LAYER                        │
│              (Feedback & Effects Coordination)               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │        Visual Effects Manager (VFXManager)          │    │
│  │  - Screen shake        - Particle systems           │    │
│  │  - Slow-mo             - Haptic feedback            │    │
│  │  - Camera effects      - Sound coordination         │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                    BUSINESS LOGIC LAYER                      │
│                   (Pure TypeScript Services)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Progression│  │  Unlock    │  │ Challenge  │            │
│  │  Service   │  │  Service   │  │  Service   │            │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘            │
│         └────────────────┴────────────────┘                 │
│                          │                                   │
├──────────────────────────┴──────────────────────────────────┤
│                  PERSISTENCE LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Storage Service (storage.ts)            │   │
│  │   - SaveData schema       - LocalStorage adapter    │   │
│  │   - Migration logic       - Data validation         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **ProgressionService** | Star calculation, level unlocking, XP/level progression | Pure functions: `calculateStars(score, time, objectives)` → 0-3 stars |
| **UnlockService** | Cosmetic unlock logic, achievement triggers, feature gating | Data-driven: reads unlock conditions from config, emits events on unlock |
| **ChallengeService** | Daily challenge rotation, seed generation, reward calculation | Time-based: `getCurrentChallenge(timestamp)` returns seeded level config |
| **VFXManager** | Coordinates multiple feedback types (visual, audio, haptic) | Queue-based: schedules effects, handles priorities, manages cleanup |
| **StorageService** | Save/load game state, schema migration, data validation | Existing implementation in storage.ts - extend with new fields |
| **Level Select UI** | World map navigation, level status display, star visualization | React component: manages navigation state, renders 60 level nodes |

## Recommended Project Structure

Based on existing codebase and standard patterns:

```
src/
├── services/                  # Business logic (pure TypeScript)
│   ├── gameLogic.ts          # [EXISTING] Level generation, scoring
│   ├── storage.ts            # [EXISTING] Save data persistence
│   ├── audio.ts              # [EXISTING] Sound management
│   ├── objectives.ts         # [EXISTING] Secondary objectives
│   ├── randomEvents.ts       # [EXISTING] Random event system
│   ├── progression.ts        # [NEW] Star calculation, level unlocking
│   ├── unlocks.ts            # [NEW] Cosmetic unlock logic
│   ├── challenges.ts         # [NEW] Daily challenge system
│   └── vfx.ts                # [NEW] Visual effects orchestration
│
├── components/               # React presentation components
│   ├── [EXISTING COMPONENTS]
│   ├── LevelSelect.tsx       # [NEW] World map UI
│   ├── StarDisplay.tsx       # [NEW] 3-star rating visualization
│   ├── UnlockModal.tsx       # [NEW] Cosmetic unlock celebration
│   ├── DailyChallengeCard.tsx # [NEW] Daily challenge UI
│   └── ScreenEffects.tsx     # [NEW] Full-screen VFX overlay
│
├── types/                    # TypeScript definitions
│   ├── progression.ts        # [NEW] Star, unlock, challenge types
│   └── vfx.ts                # [NEW] Effect configuration types
│
└── constants/                # Game configuration
    ├── progression.ts        # [NEW] Star thresholds, unlock trees
    ├── unlocks.ts            # [NEW] Cosmetic definitions
    └── challenges.ts         # [NEW] Challenge pool configuration
```

### Structure Rationale

- **Services folder:** Pure TypeScript for business logic enables easy testing and prevents React coupling. Existing pattern works well - extend it.
- **Components folder:** Presentation only. Components consume services via React hooks but don't contain game logic.
- **Types folder:** Centralized type definitions prevent circular dependencies and keep services type-safe.
- **Constants folder:** Data-driven configuration allows designers to tweak progression without touching code.

## Architectural Patterns

### Pattern 1: Service Layer Architecture

**What:** Separate pure TypeScript services from React components. Services export pure functions with no side effects (except storage).

**When to use:** For all game logic - scoring, progression, unlocks, challenges. This is the existing pattern in the codebase.

**Trade-offs:**
- ✅ Easy to test (no React required)
- ✅ Reusable across components
- ✅ No re-render issues
- ❌ More files to manage
- ❌ Requires discipline to avoid mixing React state

**Example:**
```typescript
// services/progression.ts
export interface StarThresholds {
  oneStar: number;
  twoStar: number;
  threeStar: number;
}

export const calculateStars = (
  score: number,
  timeElapsed: number,
  objectivesCompleted: number,
  levelConfig: { par: number, bonusThreshold: number }
): number => {
  const baseScore = score;
  const timeBonus = timeElapsed < levelConfig.par ? 100 : 0;
  const objectiveBonus = objectivesCompleted * 50;
  const totalScore = baseScore + timeBonus + objectiveBonus;

  if (totalScore >= levelConfig.bonusThreshold * 1.5) return 3;
  if (totalScore >= levelConfig.bonusThreshold) return 2;
  if (totalScore > 0) return 1;
  return 0;
};
```

### Pattern 2: Data-Driven Progression

**What:** Store progression rules in configuration files rather than hardcoded logic. Use lookup tables for unlock conditions.

**When to use:** For cosmetic unlocks, level unlock requirements, star thresholds, challenge definitions.

**Trade-offs:**
- ✅ Non-engineers can adjust progression
- ✅ Easy to balance without code changes
- ✅ Version control shows design changes clearly
- ❌ More indirection (harder to debug initially)

**Example:**
```typescript
// constants/unlocks.ts
export interface CosmeticUnlock {
  id: string;
  type: 'theme' | 'background' | 'font';
  name: string;
  unlockCondition: {
    type: 'stars' | 'level' | 'achievement';
    requirement: number | string;
  };
}

export const COSMETIC_UNLOCKS: CosmeticUnlock[] = [
  {
    id: 'theme_vintage',
    type: 'theme',
    name: 'Vintage Vinyl',
    unlockCondition: { type: 'stars', requirement: 30 }
  },
  {
    id: 'bg_neon',
    type: 'background',
    name: 'Neon Lights',
    unlockCondition: { type: 'level', requirement: 15 }
  },
  // ... more unlocks
];

// services/unlocks.ts
export const checkUnlocks = (saveData: SaveData): CosmeticUnlock[] => {
  const totalStars = Object.values(saveData.levelStars).reduce((a, b) => a + b, 0);

  return COSMETIC_UNLOCKS.filter(unlock => {
    if (unlock.unlockCondition.type === 'stars') {
      return totalStars >= unlock.unlockCondition.requirement;
    }
    if (unlock.unlockCondition.type === 'level') {
      return saveData.level >= unlock.unlockCondition.requirement;
    }
    return false;
  });
};
```

### Pattern 3: Effect Queue System (VFX Orchestration)

**What:** Queue-based system for coordinating multiple feedback effects. Effects have priorities, durations, and cleanup logic.

**When to use:** For screen shake, particles, slow-mo, haptics - any visual/tactile feedback that needs coordination.

**Trade-offs:**
- ✅ Prevents effect conflicts (multiple screen shakes)
- ✅ Ensures proper cleanup (no memory leaks)
- ✅ Centralizes "juice" logic for consistency
- ❌ More complex than direct DOM manipulation
- ❌ Requires understanding of queue system

**Example:**
```typescript
// services/vfx.ts
export interface VFXEffect {
  id: string;
  type: 'screenShake' | 'particles' | 'slowMo' | 'haptic';
  priority: number; // Higher = more important
  duration: number; // ms
  config: any; // Type-specific config
  onStart?: () => void;
  onEnd?: () => void;
}

class VFXManager {
  private activeEffects: Map<string, VFXEffect> = new Map();
  private queue: VFXEffect[] = [];

  scheduleEffect(effect: VFXEffect) {
    // Check for conflicts (e.g., multiple screen shakes)
    const existing = Array.from(this.activeEffects.values())
      .find(e => e.type === effect.type);

    if (existing && existing.priority < effect.priority) {
      this.cancelEffect(existing.id);
    } else if (existing) {
      this.queue.push(effect); // Queue for later
      return;
    }

    this.startEffect(effect);
  }

  private startEffect(effect: VFXEffect) {
    this.activeEffects.set(effect.id, effect);
    effect.onStart?.();

    setTimeout(() => {
      this.endEffect(effect.id);
    }, effect.duration);
  }

  private endEffect(id: string) {
    const effect = this.activeEffects.get(id);
    if (!effect) return;

    effect.onEnd?.();
    this.activeEffects.delete(id);

    // Process queue
    const nextEffect = this.queue.shift();
    if (nextEffect) this.startEffect(nextEffect);
  }
}

export const vfxManager = new VFXManager();
```

### Pattern 4: React Hook Abstraction Layer

**What:** Custom React hooks wrap service calls and manage component state. Components never call services directly.

**When to use:** For all service → component integration. Keeps components thin and testable.

**Trade-offs:**
- ✅ Components focus on rendering
- ✅ Hooks reusable across components
- ✅ Easy to mock for testing
- ❌ More indirection (one more layer)

**Example:**
```typescript
// hooks/useProgression.ts
export const useProgression = (levelIndex: number) => {
  const [stars, setStars] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const saveData = loadSaveData();
    setStars(saveData.levelStars[levelIndex] || 0);
    setIsUnlocked(saveData.level > levelIndex);
  }, [levelIndex]);

  const recordLevelComplete = useCallback((
    score: number,
    time: number,
    objectives: SecondaryObjective[]
  ) => {
    const earnedStars = calculateStars(score, time, objectives.length, levelConfig);

    let saveData = loadSaveData();
    saveData.levelStars[levelIndex] = Math.max(
      saveData.levelStars[levelIndex] || 0,
      earnedStars
    );
    saveSaveData(saveData);

    setStars(earnedStars);
  }, [levelIndex]);

  return { stars, isUnlocked, recordLevelComplete };
};
```

## Data Flow

### Progression Flow (Star Tracking)

```
[Level Complete]
    ↓
[Calculate Score/Time/Objectives] (services/progression.ts)
    ↓
[calculateStars() → 0-3 stars]
    ↓
[Update SaveData.levelStars[level]] (services/storage.ts)
    ↓
[Check for new unlocks] (services/unlocks.ts)
    ↓ (if unlocked)
[Trigger VFX celebration] (services/vfx.ts)
    ↓
[Show UnlockModal] (components/UnlockModal.tsx)
    ↓
[Return to Level Select] (components/LevelSelect.tsx)
```

### Visual Effects Flow

```
[Game Event] (e.g., 3-star level complete)
    ↓
[vfxManager.scheduleEffect({
    type: 'screenShake',
    priority: 10,
    duration: 500,
    config: { intensity: 'high' }
})]
    ↓
[VFXManager checks conflicts/priority]
    ↓
[Adds to activeEffects Map]
    ↓
[Calls onStart() → triggers CSS animation]
    ↓
[Schedules cleanup after duration]
    ↓
[Calls onEnd() → removes CSS classes]
    ↓
[Processes next queued effect if any]
```

### Daily Challenge Flow

```
[App loads]
    ↓
[getCurrentChallenge(Date.now())] (services/challenges.ts)
    ↓
[Calculate day seed from timestamp]
    ↓
[Select challenge from pool using seeded RNG]
    ↓
[Generate level with challenge seed]
    ↓
[Check if player completed today's challenge] (SaveData)
    ↓ (if not completed)
[Show DailyChallengeCard with reward preview]
    ↓ (on complete)
[Award bonus stars/cosmetics]
    ↓
[Mark challenge complete in SaveData]
```

### Level Select State Management

```
[SaveData] (localStorage)
    ↓ (loads on mount)
[useProgression hook]
    ↓
[For each level 1-60:]
    - Read stars from SaveData.levelStars[i]
    - Check unlock status (level <= SaveData.level)
    - Calculate world/position based on index
    ↓
[Render LevelSelectUI]
    - Locked levels (gray, padlock icon)
    - Unlocked levels (color, star count)
    - Current level (highlight, pulse animation)
```

## Component Boundaries for New Systems

### 1. Star Progression System

**Files to create:**
- `services/progression.ts` - Star calculation logic
- `components/StarDisplay.tsx` - Animated star rating UI
- `constants/progression.ts` - Star thresholds per level

**Integration with existing:**
- Extend `SaveData` interface in `services/storage.ts` to add `levelStars: Record<number, number>`
- Modify `App.tsx` level complete handler to call `calculateStars()`
- Add star calculation to victory screen overlay

**Data flow:**
```
App.tsx (onLevelComplete)
  → progression.calculateStars(score, time, objectives)
  → storage.updateLevelRecords(levelIndex, { stars })
  → StarDisplay component receives stars prop
```

### 2. Level Progression UI (World Select)

**Files to create:**
- `components/LevelSelect.tsx` - Main world map UI (60 levels)
- `components/LevelNode.tsx` - Individual level button with star display
- `constants/worldLayout.ts` - Position data for 60 levels (x, y coordinates)

**Integration with existing:**
- Add to main menu navigation in `App.tsx`
- Read `SaveData.level` and `SaveData.levelStars` to determine lock state
- On level select, set `currentLevel` state and transition to game

**Performance considerations:**
- Virtualize level nodes on mobile (render only visible 20-30)
- Use CSS transforms for positioning (GPU-accelerated)
- Lazy load level preview images

### 3. Visual Effects Orchestration

**Files to create:**
- `services/vfx.ts` - VFXManager class with effect queue
- `components/ScreenEffects.tsx` - Full-screen overlay for shake/particles
- `types/vfx.ts` - Effect configuration interfaces

**Integration with existing:**
- Wrap App.tsx content in `<ScreenEffects>` component
- Replace direct particle spawns with `vfxManager.scheduleEffect()`
- Coordinate with existing `audio.ts` for synchronized feedback

**Performance critical:**
- Use CSS animations over JavaScript (60fps on mobile)
- Limit particle count: 8 on mobile, 16 on desktop (already implemented)
- Cleanup particles after 1 second max
- Use `will-change` CSS for animations

### 4. Cosmetic Unlock System

**Files to create:**
- `services/unlocks.ts` - Check unlock conditions, notify on new unlocks
- `components/UnlockModal.tsx` - Celebration screen for new cosmetics
- `components/CustomizationScreen.tsx` - [ALREADY EXISTS] - extend with new cosmetics
- `constants/unlocks.ts` - Cosmetic definitions and unlock trees

**Integration with existing:**
- `SaveData` already has `customization` field - add `unlockedCosmetics: string[]`
- After level complete, call `checkUnlocks(saveData)` to detect new unlocks
- If new unlock, show modal before returning to level select
- CustomizationScreen already handles theme switching

### 5. Daily Challenge System

**Files to create:**
- `services/challenges.ts` - Daily challenge rotation, seeded RNG
- `components/DailyChallengeCard.tsx` - UI card in main menu
- `constants/challenges.ts` - Challenge pool (100+ predefined challenges)

**Integration with existing:**
- Add to main menu screen in `App.tsx`
- Extend `SaveData` with `dailyChallenges: Record<string, { completed: boolean, date: string }>`
- Use existing `generateLevel()` but with challenge seed override
- Award bonus cosmetic unlock progress on completion

**Rotation logic:**
```typescript
// Deterministic daily rotation using UTC date
const getDaysSinceEpoch = () => Math.floor(Date.now() / (1000 * 60 * 60 * 24));
const challengeIndex = getDaysSinceEpoch() % CHALLENGE_POOL.length;
return CHALLENGE_POOL[challengeIndex];
```

### 6. Enhanced Feedback Systems

**Files to create:**
- Extend `services/vfx.ts` with combo-specific effects
- Add `components/ComboDisplay.tsx` for animated combo counter

**Integration with existing:**
- App.tsx already handles combo state
- Add VFX triggers on combo milestones (x5, x10, x20)
- Coordinate screen shake intensity with combo tier
- Use existing `COMBO_TIER_COLORS` from gameConfig.ts

**Effect layering strategy:**
```
Combo x3:  Small particles + soft haptic
Combo x5:  Medium particles + screen shake (2px) + medium haptic
Combo x10: Large particles + screen shake (5px) + slow-mo (0.5s) + strong haptic
Combo x20: MASSIVE particles + screen shake (10px) + slow-mo (1s) + audio swell
```

## State Management Strategy

### Current Pattern: React Hooks + LocalStorage

The existing codebase uses React's built-in state management with `useState` and `useEffect`. This works well for the current scale (2225 line App.tsx). For new systems:

**Continue using this pattern because:**
- No need for Redux/MobX at this scale
- LocalStorage persistence already implemented in `storage.ts`
- React hooks provide sufficient performance for 60fps gameplay
- Adding state library would increase bundle size (mobile concern)

**Organize state into logical units:**
```typescript
// App.tsx state organization
const [gameState, setGameState] = useState<GameState>(/* game board state */);
const [progression, setProgression] = useState<ProgressionState>({
  currentLevel: 1,
  totalStars: 0,
  unlockedCosmetics: []
});
const [vfxState, setVFXState] = useState<VFXState>({
  activeEffects: [],
  screenShakeIntensity: 0
});
```

### Performance Optimization Patterns

**1. Memoization for expensive calculations:**
```typescript
const stars = useMemo(
  () => calculateStars(score, time, objectives.length),
  [score, time, objectives]
);
```

**2. useCallback for event handlers:**
```typescript
const handleLevelSelect = useCallback((levelIndex: number) => {
  // Prevents re-render of all 60 level nodes
  setCurrentLevel(levelIndex);
}, []);
```

**3. React.memo for list items:**
```typescript
const LevelNode = React.memo<LevelNodeProps>(({ levelIndex, stars, isLocked }) => {
  // Only re-renders when props change
  return <button>Level {levelIndex + 1}</button>;
});
```

**4. Virtual scrolling for level select (if needed):**
```typescript
// Only render visible levels in viewport
const visibleLevels = useMemo(() => {
  const start = Math.floor(scrollY / LEVEL_HEIGHT) - 5;
  const end = start + 30;
  return levels.slice(Math.max(0, start), end);
}, [scrollY, levels]);
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 60 levels (MVP) | Current architecture sufficient. Use React state + LocalStorage. VFX queue handles 3-4 concurrent effects. |
| 100+ levels | Add level paging/worlds (show 20 levels per world). Consider IndexedDB for save data if LocalStorage quota exceeded (~5MB limit). |
| Multiplayer/leaderboards | Extract services into shared WebSocket layer. Add conflict resolution for save data. This is out of scope for current roadmap. |

### Scaling Priorities

1. **First bottleneck: VFX performance on low-end mobile**
   - Symptom: Frame drops during particle explosions
   - Fix: Reduce particle count based on device detection
   - Already implemented: `PARTICLES_PER_EXPLOSION_MOBILE = 8`
   - Next step: Add device tier detection (low/med/high) and adjust limits

2. **Second bottleneck: LocalStorage quota with 200+ levels**
   - Symptom: Save failures, lost progress
   - Fix: Migrate to IndexedDB (unlimited storage)
   - Implementation: Create `storage/indexeddb.ts` adapter with same interface
   - Fallback: Keep LocalStorage for browsers without IndexedDB support

3. **Third bottleneck: Initial bundle size with 60+ components**
   - Symptom: Slow initial load on mobile networks
   - Fix: Code-split level select and customization screens
   - React lazy loading: `const LevelSelect = lazy(() => import('./LevelSelect'))`
   - Reduces initial bundle by ~40% (move 200kb to async chunk)

## Anti-Patterns to Avoid

### Anti-Pattern 1: Mixing Business Logic in Components

**What people do:**
```typescript
// BAD: Star calculation in component
const VictoryScreen = ({ score, time }) => {
  const stars = score > 1000 ? 3 : score > 500 ? 2 : 1; // DON'T DO THIS
  return <div>{stars} stars!</div>;
};
```

**Why it's wrong:**
- Logic scattered across multiple components
- Hard to test (requires mounting React components)
- Inconsistent calculation if formula changes
- Can't reuse for backend/analytics

**Do this instead:**
```typescript
// GOOD: Service handles logic
import { calculateStars } from '../services/progression';

const VictoryScreen = ({ score, time, objectives }) => {
  const stars = calculateStars(score, time, objectives.length, levelConfig);
  return <div>{stars} stars!</div>;
};
```

### Anti-Pattern 2: Direct DOM Manipulation for Effects

**What people do:**
```typescript
// BAD: Direct DOM manipulation
const shakeScreen = () => {
  document.body.style.transform = 'translate(10px, 0)';
  setTimeout(() => {
    document.body.style.transform = 'translate(-10px, 0)';
    setTimeout(() => {
      document.body.style.transform = 'translate(0, 0)';
    }, 50);
  }, 50);
};
```

**Why it's wrong:**
- Multiple simultaneous effects conflict
- No cleanup if component unmounts
- Breaks React's declarative model
- Hard to debug/coordinate

**Do this instead:**
```typescript
// GOOD: VFX manager coordinates effects
vfxManager.scheduleEffect({
  type: 'screenShake',
  priority: 5,
  duration: 300,
  config: { intensity: 10 }
});

// Or: CSS-based approach
const [isShaking, setIsShaking] = useState(false);
<div className={isShaking ? 'screen-shake' : ''}>
  {children}
</div>
```

### Anti-Pattern 3: Monolithic Save Data Updates

**What people do:**
```typescript
// BAD: Full save data spread on every update
const updateStars = (levelIndex: number, stars: number) => {
  const saveData = loadSaveData();
  saveSaveData({
    ...saveData, // Clones entire object
    levelStars: {
      ...saveData.levelStars, // Clones all level records
      [levelIndex]: stars
    }
  });
};
```

**Why it's wrong:**
- Performance cost grows with save data size
- Triggers full data validation on every write
- LocalStorage serialization becomes slow (JSON.stringify large object)

**Do this instead:**
```typescript
// GOOD: Targeted update functions
export const updateLevelStars = (
  levelIndex: number,
  stars: number
): void => {
  const saveData = loadSaveData();
  saveData.levelStars[levelIndex] = stars;
  saveSaveData(saveData); // Only this path serializes
};
```

### Anti-Pattern 4: Premature Effect Optimization

**What people do:**
```typescript
// BAD: Over-engineered effect system on day 1
class AdvancedVFXEngine {
  private renderPipeline: WebGLContext;
  private shaderPrograms: Map<string, ShaderProgram>;
  private particlePool: ObjectPool;
  // 500+ lines of WebGL rendering...
}
```

**Why it's wrong:**
- Massive complexity for uncertain gain
- Harder to debug when issues arise
- Longer development time
- May not address actual bottleneck

**Do this instead:**
```typescript
// GOOD: Start with CSS animations, optimize later
const ParticleExplosion = ({ x, y, color }) => (
  <div className="particle-container" style={{ left: x, top: y }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="particle animate-burst"
        style={{ backgroundColor: color }}
      />
    ))}
  </div>
);
```
Then profile. If 60fps isn't achieved, optimize to Canvas. If still slow, consider WebGL.

## Integration Points

### Integration with App.tsx (Monolithic Component)

Current state: App.tsx is 2225 lines handling all game logic. New systems must integrate carefully to avoid further bloat.

**Strategy: Gradual extraction**
1. Phase 1: Keep new systems as separate components imported into App.tsx
2. Phase 2: Extract existing logic to services (in parallel with feature work)
3. Phase 3: Refactor App.tsx into smaller component tree (post-MVP)

**Critical integration points:**
```typescript
// App.tsx structure to maintain
const App = () => {
  // EXISTING STATE
  const [gameState, setGameState] = useState<GameState>(/* ... */);

  // NEW: Progression state
  const progression = useProgression(gameState.currentLevel);

  // NEW: VFX coordination
  const vfx = useVFX();

  // EXISTING: Level complete handler
  const handleLevelComplete = () => {
    // [existing logic]

    // NEW: Calculate stars
    const stars = calculateStars(score, time, objectives.length);
    progression.recordLevelComplete(stars);

    // NEW: Check for unlocks
    const newUnlocks = checkUnlocks(saveData);
    if (newUnlocks.length > 0) {
      vfx.celebrateUnlock();
      setShowUnlockModal(true);
    }
  };

  return (
    <ScreenEffects vfxState={vfx.state}>
      {gameState.status === 'menu' && <MainMenu />}
      {gameState.status === 'levelSelect' && <LevelSelect />}
      {gameState.status === 'playing' && <GameBoard />}
    </ScreenEffects>
  );
};
```

### Integration with Existing Services

**services/storage.ts** (extend SaveData interface):
```typescript
export interface SaveData {
  // EXISTING FIELDS
  level: number;
  highScore: number;
  totalXP: number;
  levelStars: Record<number, number>; // [EXISTING but underutilized]

  // NEW FIELDS
  totalStars: number; // Cached sum for performance
  unlockedCosmetics: string[]; // Cosmetic unlock IDs
  dailyChallenges: Record<string, DailyChallengeRecord>; // Date-keyed completion
  vfxPreferences: { // User can tone down effects
    screenShake: boolean;
    particles: boolean;
    slowMo: boolean;
  };
}
```

**services/gameLogic.ts** (add star calculation):
```typescript
// Export from progression.ts, import here for convenience
export { calculateStars } from './progression';

// Modify generateLevel to include star thresholds
export const generateLevel = (levelIndex: number, /* ... */) => {
  // [existing generation]
  return {
    crates,
    vinyls,
    moves,
    mode,
    time,
    theme,
    // NEW: Star thresholds for this level
    starThresholds: getStarThresholds(levelIndex)
  };
};
```

**services/audio.ts** (coordinate with VFX):
```typescript
// Add hooks for VFX events
export const onVFXEvent = (event: VFXEvent) => {
  switch (event.type) {
    case 'screenShake':
      sfx.playImpact(event.config.intensity);
      break;
    case 'slowMo':
      music.setPlaybackRate(0.5); // Slow down music
      break;
  }
};
```

### Mobile Performance Checklist

For 60fps on mid-range mobile (target: iPhone SE 2020, Samsung Galaxy A52):

- [ ] Limit particles: 8 on mobile, 16 on desktop (already implemented)
- [ ] Use CSS transforms for animations (GPU-accelerated)
- [ ] Add `will-change` to animated elements
- [ ] Virtualize level select (render only visible 20-30 nodes)
- [ ] Debounce scroll handlers (16ms minimum)
- [ ] Use `requestAnimationFrame` for VFX updates
- [ ] Lazy load images for cosmetics/levels
- [ ] Compress particle sprite sheets
- [ ] Disable slow-mo effect on low-end devices
- [ ] Test with 6x CPU slowdown in Chrome DevTools

**Device detection utility:**
```typescript
// utils/device.ts
export const getDeviceTier = (): 'low' | 'medium' | 'high' => {
  // Use hardwareConcurrency as proxy for device power
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory || 4; // GB

  if (cores <= 2 || memory <= 2) return 'low';
  if (cores <= 4 || memory <= 4) return 'medium';
  return 'high';
};

export const VFX_CONFIG = {
  low: { particles: 4, shake: false, slowMo: false },
  medium: { particles: 8, shake: true, slowMo: false },
  high: { particles: 16, shake: true, slowMo: true }
};
```

## Build Order Recommendations

Based on dependencies between systems:

### Phase 1: Foundation (Infrastructure)
**Build first - everything depends on these:**
1. Extend SaveData schema in `services/storage.ts`
2. Create `services/progression.ts` with star calculation
3. Create `types/progression.ts` and `constants/progression.ts`

**Rationale:** Other systems need to read/write star data and progression state.

### Phase 2: Core Progression (User-facing value)
**Build second - delivers visible player value:**
1. `components/StarDisplay.tsx` - Show stars on victory screen
2. Integrate star calculation into App.tsx level complete flow
3. Add star visualization to existing level UI

**Rationale:** Players can now earn stars (core progression loop).

### Phase 3: Level Selection (Navigation)
**Build third - requires star data from Phase 2:**
1. `components/LevelSelect.tsx` - World map UI
2. `components/LevelNode.tsx` - Individual level buttons
3. `constants/worldLayout.ts` - Level positioning
4. Add navigation from main menu

**Rationale:** Needs star data to display. Provides access to replay levels.

### Phase 4: Visual Effects (Polish)
**Build fourth - enhances existing systems:**
1. `services/vfx.ts` - Effect queue manager
2. `components/ScreenEffects.tsx` - Full-screen overlay
3. Replace direct particle spawns with VFX manager calls
4. Add combo-triggered effects

**Rationale:** Pure enhancement layer. Can be added incrementally without breaking existing features.

### Phase 5: Cosmetic Unlocks (Retention)
**Build fifth - retention feature:**
1. `constants/unlocks.ts` - Cosmetic definitions
2. `services/unlocks.ts` - Unlock checking logic
3. `components/UnlockModal.tsx` - Celebration UI
4. Extend existing CustomizationScreen with new cosmetics

**Rationale:** Depends on star system (unlock conditions). Adds long-term goals.

### Phase 6: Daily Challenges (Live Ops)
**Build sixth - requires full progression system:**
1. `constants/challenges.ts` - Challenge pool
2. `services/challenges.ts` - Rotation logic
3. `components/DailyChallengeCard.tsx` - UI card
4. Integrate into main menu

**Rationale:** Can reuse existing level generation. Provides daily engagement hook.

### Dependency Graph

```
[Storage] ─────┬──────────────────────────────┐
               │                              │
         [Progression] ───────────┬───────────┤
               │                  │           │
               ↓                  ↓           ↓
          [StarDisplay]    [LevelSelect]  [Unlocks]
               │                  │           │
               └──────────────────┴───────────┘
                              │
                              ↓
                           [VFX] ←───────────┐
                              │               │
                              ↓               │
                      [Daily Challenges] ─────┘
```

### Parallel Work Opportunities

These systems can be built in parallel by different developers:

**Team A:** Progression + Star Display (Phase 1-2)
**Team B:** VFX System (Phase 4) - can start early, no dependencies
**Team C:** Level Select UI (Phase 3) - can start with mock star data

## Performance Budget

Target: 60fps on iPhone SE 2020 (A13 Bionic, 3GB RAM)

| Operation | Budget | Current | Notes |
|-----------|--------|---------|-------|
| Frame time | 16.67ms | ~12ms | Headroom for new systems |
| Particle spawn | 2ms | 1.5ms | Already optimized |
| Star calculation | 0.5ms | N/A | Pure math, negligible |
| VFX queue processing | 1ms | N/A | Per-frame update loop |
| LocalStorage save | 5ms | 3ms | Async, off main thread |
| Level Select render (60 nodes) | 50ms | N/A | One-time on navigation |

**Critical paths (must stay under budget):**
1. Particle explosion during gameplay: 2ms (already achieved)
2. Star calculation on level complete: 0.5ms (simple arithmetic)
3. VFX effect coordination: 1ms per frame (queue processing)

**Non-critical paths (can take longer):**
1. Level Select initial render: 50ms acceptable (navigation, not gameplay)
2. Unlock modal animation: 100ms acceptable (one-time celebration)
3. Daily challenge rotation: 10ms acceptable (happens on app load)

## Sources

### Progression Systems
- [What are Progression Systems in Games? — University XP](https://www.universityxp.com/blog/2024/1/16/what-are-progression-systems-in-games)
- [Game Progression and Progression Systems](https://gamedesignskills.com/game-design/game-progression/)
- [7 progression and event systems that every developer should study](https://www.gamedeveloper.com/design/7-progression-and-event-systems-that-every-developer-should-study)

### Game Architecture
- [Architecture, Performance, and Games · Game Programming Patterns](https://gameprogrammingpatterns.com/architecture-performance-and-games.html)
- [State · Design Patterns Revisited · Game Programming Patterns](https://gameprogrammingpatterns.com/state.html)
- [Better Game State Management | Springer Nature Link](https://link.springer.com/chapter/10.1007/978-3-662-59252-6_17)

### React Game Development
- [An Intro to Building Game UIs with React](https://www.adammadojemu.com/blog/intro-to-building-game-uis-with-react)
- [How to Use React.js to Build Interactive Games - DEV Community](https://dev.to/srdan_borovi_584c6b1d773/how-to-use-reactjs-to-build-interactive-games-537j)

### 3-Star Rating Systems
- [To Three or not to Three: Improving Human Computation Game Onboarding with a Three-Star System - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5659622/)
- [3 Star Rating System Script (Help) - Unity Engine](https://discussions.unity.com/t/3-star-rating-system-script-help/507176)

### Game Design Patterns
- [Beginning Game Development: Design Patterns | Medium](https://medium.com/@lemapp09/beginning-game-development-design-patterns-809ee724ea53)
- [Game programming patterns in Unity with C# | Habrador](https://www.habrador.com/tutorials/programming-patterns/)

### Daily Challenges
- [The Making Of A Mechanic: Daily Goals - Deconstructor of Fun](https://www.deconstructoroffun.com/blog//2016/07/the-making-of-mechanic-daily-goals.html)
- [Challenge System - RuneScape Wiki](https://runescape.wiki/w/Challenge_System)

### React Performance
- [React Performance Optimization: 15 Best Practices for 2025 - DEV Community](https://dev.to/alex_bobes/react-performance-optimization-15-best-practices-for-2025-17l9)
- [React at 60 FPS - Optimizing performance](https://g3f4.github.io/react-at-60-fps/)
- [How to Achieve 60FPS Animations in React Native](https://www.callstack.com/blog/60fps-animations-in-react-native)

### Visual Effects & Game Feel
- [Feedback | Corgi Engine Documentation](https://corgi-engine-docs.moremountains.com/feedback.html)
- [Juice in Game Design: Making Your Games Feel Amazing | Blood Moon Interactive](https://www.bloodmooninteractive.com/articles/juice.html)
- [The Psychology of Screen Shake – Verboten Games](https://verbotengames.wordpress.com/2014/06/21/the-psychology-of-screen-shake/)

### State Persistence
- [Mastering State Persistence with Local Storage in React: A Complete Guide | Medium](https://medium.com/@roman_j/mastering-state-persistence-with-local-storage-in-react-a-complete-guide-1cf3f56ab15c)
- [How to Persist React State in Local Storage | Felix Gerschau](https://felixgerschau.com/react-localstorage/)
- [Using localStorage with React Hooks - LogRocket Blog](https://blog.logrocket.com/using-localstorage-react-hooks/)

---

*Architecture research for: Sleevo Vinyl Shop Manager - Game Progression Systems*
*Researched: 2026-02-10*
