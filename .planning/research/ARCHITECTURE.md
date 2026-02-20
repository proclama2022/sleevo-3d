# Architecture Patterns

**Domain:** Level progression system for React + Three.js vinyl sorting game
**Researched:** 2026-02-20
**Confidence:** HIGH — Based on direct codebase analysis

---

## Existing Architecture (Baseline)

The codebase has two partially-overlapping state management systems that must be reconciled before adding progression features:

### System A: `useReducer` in GameScreen (ACTIVE)

`src/components/GameScreen.tsx` drives all live gameplay via `useReducer(gameReducer, ...)` from `src/game/engine.ts`. This is the authoritative runtime system.

```
GameScreen
  └── useReducer(gameReducer, createGameState(LEVELS[0], 0))
        ├── game/engine.ts      — pure reducer, all game logic
        ├── game/rules.ts       — isValidPlacement, COMBO_TIERS
        ├── game/levels.ts      — 20+ Level definitions (LEVELS array)
        ├── game/storage.ts     — localStorage read/write (saveProgress, isLevelUnlocked)
        └── game/types.ts       — GameState, ComboState, Level, LevelMode
```

### System B: `useGameStore` Zustand (DORMANT)

`src/store/gameStore.ts` is a Zustand store (`useGameStore`) with a different `GameState` shape (`phase`, `slots`, `vinyls`). It exists but is NOT wired to GameScreen. It is effectively dead code that pre-dates the current reducer architecture.

**Decision required before Phase 4 work:** Delete System B or replace System A with it. Based on codebase state, System A (reducer) should be kept as the canonical approach. The Zustand store (`src/store/gameStore.ts` + `src/types/game.ts`) can be removed or kept only as a typed facade if needed for devtools.

---

## Recommended Architecture

### Diagram

```
                         ┌─────────────────────────────────────┐
                         │           GameScreen.tsx             │
                         │   useReducer(gameReducer, initial)   │
                         └───────────────┬─────────────────────┘
                                         │ state + dispatch
              ┌──────────────────────────┼──────────────────────────┐
              ▼                          ▼                           ▼
   ┌────────────────────┐   ┌───────────────────────┐   ┌──────────────────────┐
   │  HUD Layer         │   │   Play Surface         │   │  Overlay Layer        │
   │                    │   │                        │   │                       │
   │  HUD.tsx           │   │  Shelf.tsx             │   │  LevelComplete.tsx    │
   │  ProgressBar.tsx   │   │  ShelfSlot.tsx         │   │  Tutorial.tsx         │
   │  ComboFloat.tsx    │   │  VinylCrate (carousel) │   │  LevelSelectScreen*   │
   │  InstructionPill   │   │  Shelf3DCanvas.tsx     │   │  ★ StarRating display │
   │  ComboPopup.tsx    │   │                        │   │                       │
   │  ScorePopup.tsx    │   │  (Three.js handles     │   │                       │
   │  ★ RulePill*       │   │   own render loop)     │   │                       │
   └────────────────────┘   └───────────────────────┘   └──────────────────────┘

* = New components to add

                         ┌─────────────────────────────────────┐
                         │          Game Logic Layer            │
                         │                                      │
                         │  engine.ts     — gameReducer         │
                         │  rules.ts      — isValidPlacement    │
                         │  levels.ts     — LEVELS array        │
                         │  storage.ts    — localStorage        │
                         │  ★ progression.ts*                   │
                         └─────────────────────────────────────┘
```

`★` = new files/components to add in this milestone.

---

## Component Boundaries

| Component | Responsibility | Reads From | Writes To |
|-----------|---------------|------------|-----------|
| `GameScreen.tsx` | Orchestrator. Owns `useReducer`. Mounts child components. Handles drag lifecycle. | `LEVELS`, `storage.ts` | `dispatch(action)`, `saveProgress()` |
| `engine.ts` (gameReducer) | Pure state machine. All game logic. | `GameAction`, `Level` | Returns new `GameState` |
| `rules.ts` | Validation. `isValidPlacement()` per mode. Combo tiers. | `Level`, placement args | `PlacementResult` |
| `levels.ts` | Static level data. `LEVELS` export. | Nothing | Consumed by GameScreen |
| `storage.ts` | Persistence layer. `saveProgress()`, `loadAllProgress()`, `isLevelUnlocked()`. | `localStorage` | `localStorage` |
| `★ progression.ts` | Pure functions: `calculateStars()`, `getUnlockedLevels()`, `canAdvanceToLevel()`. Wraps/extends storage.ts logic. | `storage.ts` output | Consumed by GameScreen, LevelSelectScreen |
| `HUD.tsx` | Live game stats display. Score, moves, time. | `state.score`, `state.rushTimeLeft`, `state.moves` | Nothing (display only) |
| `ProgressBar.tsx` | Vinyl placement counter dots. | `state.unplacedVinylIds.length`, `state.level.vinyls.length` | Nothing |
| `ComboFloat.tsx` | Active combo multiplier + decay bar. | `state.combo` | Nothing |
| `ComboPopup.tsx` | Milestone burst (5x, 8x, 10x). | `state.combo.streak`, screen position | Nothing |
| `ScorePopup.tsx` | Floating "+N" score delta after placement. | Points delta, screen coords | Nothing |
| `LevelComplete.tsx` | End-of-level overlay. Stars, stats, next/replay. | `state.stars`, `state.mistakes`, `timeElapsed` | `onNextLevel()`, `onReplay()` callbacks |
| `★ LevelSelectScreen.tsx` | Level map/grid. Shows locked/unlocked state + best stars. | `progression.ts`, `LEVELS` | Navigates to selected level |
| `★ RulePill.tsx` | Current level mode rule banner in HUD. | `state.level.mode`, `state.level.hint` | Nothing |
| `Tutorial.tsx` | Onboarding overlay. | `state.levelIndex`, `localStorage` | `localStorage` (marks seen) |
| `CustomerPanel.tsx` | Customer timer + request display. | `state.customerTimeLeft`, `state.level.customerRequest` | Nothing |

---

## Data Flow

### Score Feedback (per placement)

```
1. User drops vinyl onto slot
   │
   ▼
2. GameScreen handleDrop()
   → dispatch({ type: 'PLACE_VINYL', vinylId, row, col })
   │
   ▼
3. gameReducer (engine.ts)
   → isValidPlacement() returns { valid: true/false }
   → If valid: compute earnedScore = BASE_SCORE * combo.multiplier + rareBonus
   → Update state.score, state.combo, state.placedVinyls
   → If complete: calculate state.stars (0 mistakes = 3, ≤2 = 2, else 1)
   │
   ▼
4. GameScreen receives new state
   → lastSlotPosition ref updated (DOM rect of slot)
   → Sets lastSlotPosition state → triggers ScorePopup render
   → New score flows to HUD via props
   → New combo flows to ComboFloat via props
   → PlacedCount change flows to ProgressBar via props
```

### Level Completion + Persistence

```
1. gameReducer returns state.status = 'completed'
   │
   ▼
2. GameScreen useEffect [state.status]
   → saveProgress(state.level.id, state.stars, timeElapsed)
      → reads existing best from localStorage
      → writes only if improved (more stars, or same stars + faster time)
   │
   ▼
3. LevelComplete overlay mounts (conditional render on status === 'completed')
   → displays state.stars, state.mistakes, state.hintsUsed, timeElapsed
   │
   ▼
4. User clicks "Livello successivo"
   → GameScreen onNextLevel()
   → Checks isLevelUnlocked(nextIndex) via progression.ts
   → dispatch({ type: 'NEXT_LEVEL', level: LEVELS[nextIndex], levelIndex: nextIndex })
   → LevelComplete unmounts, gameplay resumes
```

### Level Unlock Check

```
progression.ts::canAdvanceToLevel(targetIndex)
  → loadAllProgress() from localStorage
  → Check: LEVELS[targetIndex - 1] has stars >= 2 (per PROJECT.md requirement)
  → Returns boolean

Called from:
  - LevelSelectScreen: marks slots as locked/unlocked
  - GameScreen onNextLevel: prevents advancing if not enough stars
    (though completing a level always grants ≥1 star, so unlock threshold is 2)
```

### Stars Calculation (engine.ts, in PLACE_VINYL when isComplete)

```
Current logic (in engine.ts):
  mistakes === 0 && hintsUsed === 0  → 3 stars
  mistakes <= 2  || hintsUsed <= 1   → 2 stars
  else                               → 1 star

Note: PROJECT.md says "2 stelle = sblocca il prossimo livello"
Note: Star logic is already in engine.ts PLACE_VINYL case.
      The `progression.ts` wrapper does not recalculate stars — it reads
      the stars value already computed and persisted.
```

---

## Where to Add the Level Unlock / Persistence Layer

### What Already Exists

`src/game/storage.ts` is already implemented and correct:
- `saveProgress(levelId, stars, timeSeconds)` — idempotent, only saves if improved
- `loadAllProgress()` — returns `Record<string, LevelProgress>` from localStorage
- `getLevelProgress(levelId)` — single-level lookup
- `isLevelUnlocked(levelIndex)` — checks prev level has `stars >= 1`

**The unlock threshold in storage.ts is currently `>= 1` but PROJECT.md requires `>= 2`.** This is a one-line fix.

### What Needs to Be Added

**`src/game/progression.ts`** — a thin module that adds:

```typescript
// Returns list of {level, stars, unlocked, bestTime} for the level select screen
export function getLevelSelectData(): LevelSelectEntry[]

// True if player has >= 2 stars on previous level
export function canAdvanceToLevel(index: number): boolean

// Best completion stats for display
export function getBestStats(levelId: string): { stars: number; bestTime?: number } | null
```

This keeps `storage.ts` as the raw I/O layer and `progression.ts` as the domain logic layer.

### Integration Points in GameScreen.tsx

```typescript
// 1. On mount: determine starting level index
const startingIndex = getLastUnlockedLevelIndex(); // from progression.ts

// 2. On NEXT_LEVEL button press:
const nextIndex = state.levelIndex + 1;
if (nextIndex < LEVELS.length && canAdvanceToLevel(nextIndex)) {
  dispatch({ type: 'NEXT_LEVEL', level: LEVELS[nextIndex], levelIndex: nextIndex });
}

// 3. On level complete (useEffect):
saveProgress(state.level.id, state.stars, timeElapsed); // already exists
```

---

## Patterns to Follow

### Pattern 1: Pure Reducer Actions (existing, extend this)

**What:** All game state mutations go through `dispatch(action)` into `gameReducer`. No direct state mutation outside the reducer.

**When:** Every new gameplay feature (rush timer tick, customer patience, star calculation) should be a new `GameAction` type handled in the `switch`.

**Example:**
```typescript
// Adding a "LEVEL_UNLOCKED" side-effect notification
case 'PLACE_VINYL': {
  // ... existing logic ...
  // Stars already calculated here — no additional action needed
  // GameScreen useEffect handles the saveProgress side-effect
}
```

### Pattern 2: useEffect for Side Effects (existing, extend this)

**What:** GameScreen has `useEffect` watchers on state slices to trigger side effects (save progress, trigger timers, show tutorial). All new persistence and navigation side effects belong here.

**When:** Any time reducer-state change must trigger an external action (save, navigate, animate).

**Example (already exists):**
```typescript
useEffect(() => {
  if (state.status === 'completed') {
    saveProgress(state.level.id, state.stars, timeElapsed);
  }
}, [state.status, state.stars]);
```

### Pattern 3: Props-Down for Display Components

**What:** HUD, ProgressBar, ComboFloat, ScorePopup, LevelComplete receive data as props. They do NOT read from the reducer directly — GameScreen passes down what they need.

**When:** Every new display component. This keeps components reusable and testable.

**Example:**
```typescript
// RulePill gets only what it needs
<RulePill mode={state.level.mode} hint={state.level.hint} />
```

### Pattern 4: Position from DOM Ref for Score Popups (existing)

**What:** ScorePopup and ComboPopup need screen coordinates. These are obtained by calling `element.getBoundingClientRect()` on the slot element ref, not from the Three.js scene.

**When:** Any floating animation that originates at a UI element position.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Bypass the Reducer

**What:** Directly mutating state or using `useState` for game logic state inside GameScreen.

**Why bad:** Breaks the single source of truth. `timeElapsed` is currently tracked as a local `useState` in GameScreen — this is acceptable (it is display-only, not game-logic). Stars, mistakes, score must stay in the reducer.

**Instead:** Add any new game-logic state as fields in `GameState` and handle transitions in `gameReducer`.

### Anti-Pattern 2: Mixing the Two State Systems

**What:** Calling `useGameStore()` (Zustand) alongside `useReducer` in the same component.

**Why bad:** Two sources of truth for game state. The Zustand store (`src/store/gameStore.ts`) uses a completely different `GameState` shape and has no connection to the live reducer.

**Instead:** Keep `useGameStore` dormant or delete it. If Zustand devtools are needed, wrap the reducer with a Zustand store adapter in the future — but not during this milestone.

### Anti-Pattern 3: Level Data Inside the Reducer

**What:** Putting `LEVELS` array access or level loading logic inside `gameReducer`.

**Why bad:** The reducer is a pure function — it receives `action.level` as a payload. Level selection logic (which index to load, unlock checks) belongs in GameScreen, not the reducer.

**Instead:** GameScreen resolves which `Level` object to use, then passes it to `dispatch({ type: 'NEXT_LEVEL', level, levelIndex })`.

### Anti-Pattern 4: localStorage Access in the Reducer

**What:** Calling `saveProgress()` or `loadAllProgress()` inside `gameReducer`.

**Why bad:** Reducers must be pure functions (no side effects). localStorage is a side effect.

**Instead:** GameScreen useEffect calls `saveProgress()` after observing `state.status === 'completed'`.

---

## Suggested Build Order

This order minimizes integration risk by building on what already works:

### Step 1: Fix unlock threshold in storage.ts (5 min)
Change `isLevelUnlocked` threshold from `>= 1` to `>= 2` to match PROJECT.md requirement. No other code changes needed — it is the single source of truth for unlock logic.

### Step 2: Add `progression.ts` (30 min)
Pure functions wrapping `storage.ts`. Provides `canAdvanceToLevel()` and `getLevelSelectData()`. No UI changes. Testable in isolation.

### Step 3: Expand `LEVELS` array to 20+ levels (bulk of time)
Add level definitions to `src/game/levels.ts` covering all 6 modes (`free`, `genre`, `chronological`, `customer`, `blackout`, `rush`, `sleeve-match`). The engine already handles all modes — this is data, not code. Each level definition should include `id`, `mode`, `sortRule`, `hint`, `rows`, `cols`, `vinyls`.

### Step 4: Wire HUD to show level rule (RulePill)
New `RulePill` component receives `state.level.mode` and `state.level.hint`. Mount it in GameScreen next to the HUD. No reducer changes needed.

### Step 5: Ensure ScorePopup fires on every valid placement
GameScreen already tracks `lastSlotPosition` and renders `ScorePopup`. Verify it shows the correct `earnedScore` delta (currently `BASE_SCORE * multiplier + rareBonus` from the reducer). Wire the delta value through — currently `ScorePopup` receives only `points` prop.

### Step 6: LevelComplete screen — verify stars display
`LevelComplete.tsx` already renders stars. Verify it receives `state.stars` from GameScreen. Stars are already calculated in `gameReducer` PLACE_VINYL case. No reducer changes needed.

### Step 7: LevelSelectScreen (new component)
Renders a grid of levels using data from `progression.ts::getLevelSelectData()`. Shows lock/unlock state and best star count per level. Navigates to GameScreen with a specific `levelIndex` prop.

### Step 8: Persist + restore last unlocked level on app start
GameScreen currently always starts at `LEVELS[0]`. Add: on mount, read `getLastPlayableIndex()` from `progression.ts` to start at the last unlocked level (or let LevelSelectScreen handle this by passing `initialLevelIndex` prop).

---

## Scalability Considerations

| Concern | Current (2 levels) | 20+ levels | 50+ levels |
|---------|-------------------|------------|------------|
| Level data size | Inline in `levels.ts` | Still fine in single file | Consider splitting by mode or chapter |
| localStorage schema | `Record<levelId, {stars, bestTime}>` | Same schema, more keys | Add version field, migration utility |
| Star calculation logic | Hardcoded thresholds in reducer | Extract to `rules.ts::calculateStars(mistakes, hints, time, level)` | Per-level star thresholds in `Level` type |
| Level select rendering | N/A | Simple grid, all levels in DOM | Virtual list (react-window) if 50+ |

**Immediate recommendation:** Move star calculation out of the `PLACE_VINYL` case in `engine.ts` into a pure function `calculateStars(mistakes: number, hintsUsed: number): number` in `rules.ts`. This makes per-level star tuning possible without touching the reducer.

---

## Key Existing Files (reference for implementation)

| File | Role | Relevant to Progression |
|------|------|------------------------|
| `src/game/engine.ts` | gameReducer + createGameState | Star calculation in PLACE_VINYL case |
| `src/game/rules.ts` | isValidPlacement, COMBO_TIERS | Extract calculateStars here |
| `src/game/levels.ts` | LEVELS array (needs expansion to 20+) | Central data source |
| `src/game/storage.ts` | localStorage persistence | Fix unlock threshold >=1 → >=2 |
| `src/game/types.ts` | GameState, Level, LevelMode | Add fields for future modes |
| `src/components/GameScreen.tsx` | Orchestrator + drag system | All integration wiring |
| `src/components/LevelComplete.tsx` | End-of-level overlay | Already correct shape |
| `src/components/HUD/HUD.tsx` | Score/timer/moves | Add level rule display |
| `src/components/ScorePopup/ScorePopup.tsx` | Floating score delta | Already implemented |
| `src/components/ProgressBar.tsx` | Placement dots counter | Already implemented |

---

## Sources

- Direct analysis of `src/game/engine.ts`, `rules.ts`, `storage.ts`, `types.ts` (HIGH confidence)
- Direct analysis of `src/components/GameScreen.tsx`, `LevelComplete.tsx`, `HUD/HUD.tsx` (HIGH confidence)
- Project requirements from `.planning/PROJECT.md` (HIGH confidence)
- Game mechanics documentation from `GAME-LOGIC.md` (HIGH confidence)
