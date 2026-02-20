# Technology Stack

**Project:** Sleevo — Level Progression & Score Feedback Milestone
**Researched:** 2026-02-20
**Scope:** Additive features on top of existing React + Three.js + TypeScript + Vite + Zustand + styled-components stack. No base stack changes.

---

## What Already Exists (Do Not Re-implement)

Before recommending additions, the audit found these systems already built and functional:

| Feature | Status | Location |
|---------|--------|----------|
| Star rating calculation | EXISTS — `stars` in `GameState`, computed in `engine.ts` | `src/game/types.ts`, `src/game/engine.ts` |
| Star display in level complete | EXISTS — 3-star UI with confetti | `src/components/LevelComplete.tsx` |
| Progress save/load (localStorage) | EXISTS — `saveProgress`, `loadAllProgress`, `isLevelUnlocked` | `src/game/storage.ts` |
| Floating score popup (`ScorePopup`) | EXISTS — styled-component, `scoreFloat` keyframe, positioned at drop coords | `src/components/ScorePopup/ScorePopup.tsx` |
| HUD score animation (`scorePop`) | EXISTS — scale + green flash on score change | `src/components/HUD/HUD.tsx` |
| Progress bar (dot-style) | EXISTS — dots + "5/8" label | `src/components/ProgressBar.tsx` |
| Vinyl counter / progress | EXISTS — `ProgressBar` in `GameScreen` | `src/components/GameScreen.tsx` |
| Combo float label | EXISTS — label + multiplier + decay bar | `src/components/ComboFloat.tsx` |
| Combo popup (near slot) | EXISTS — appears at streak >= 4 | `src/components/ComboPopup/ComboPopup.tsx` |
| Particle burst on combo milestones | EXISTS — 5x, 8x, 10x | `src/components/ParticleBurst/ParticleBurst.tsx` |
| 21 levels across all modes | EXISTS — levels 1–21 defined | `src/game/levels.ts` |
| All 7 `LevelMode` types defined | EXISTS in TypeScript types | `src/game/types.ts` |
| Animation keyframes library | EXISTS — `cardPickup`, `scoreFloat`, `glowPulse`, `shake` etc. | `src/animations/keyframes.ts` |

**The core gap is integration, not invention.** `ScorePopup` exists but is likely not wired into the drop handler in `GameScreen.tsx`. `storage.ts` exists but the level selection screen and unlock gate are not built. The HUD lacks a "current level rule" display.

---

## Recommended Stack for Remaining Work

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zustand (existing) | ^4 | All game state including progression | Already in use via `useGameStore`. Adding a `progressionStore` as a separate slice is the right pattern — keeps game state and cross-level persistence concerns separate. |
| React `useReducer` (existing) | React 19 | Per-level game session state | Already in `GameScreen` via `gameReducer`. Do not migrate this to Zustand — the reducer pattern fits the discrete event model of gameplay. |

**Do not add:** Redux, MobX, Jotai, or any other state library. The app already uses both Zustand and `useReducer` correctly. Adding a third state primitive creates confusion.

### Persistence

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `localStorage` (existing) | Browser API | Star ratings, unlocked levels, best times | Already implemented in `src/game/storage.ts`. The schema is sound: `Record<levelId, { stars, bestTime }>`. No migration needed. |

**Do not add:** IndexedDB, a cloud sync API, or a third-party storage library (e.g. `idb`, `localforage`). The data is small (21 levels × ~20 bytes each). `localStorage` is synchronous, reliable for this scale, and already working.

**Confidence:** HIGH — code is present and functional.

### Score Feedback (Floating Points)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| CSS keyframe animation (existing) | — | `scoreFloat` — translateY up, fade to 0 | Already defined in `src/animations/keyframes.ts`. The `ScorePopup` component uses it correctly. |
| `position: fixed` + DOM coordinates | — | Position popup over the drop slot | `GameScreen` already tracks `lastSlotPosition` from `getBoundingClientRect()`. Same pattern needed for score popup. |
| React `key` prop to re-trigger | — | New popup instance per placement | Same pattern used by `ComboFloat`: `key={state.combo.lastPlacementTime}`. Use placement timestamp as key for `ScorePopup`. |

**Implementation pattern** (HIGH confidence — already used by ComboFloat/ComboPopup):
```tsx
// In GameScreen.tsx — wire after PLACE_VINYL dispatch resolves
{lastPlacementScore && lastSlotPosition && (
  <ScorePopup
    key={lastPlacementTime}
    points={lastPlacementScore}
    x={lastSlotPosition.x}
    y={lastSlotPosition.y}
    onComplete={() => setLastPlacementScore(null)}
  />
)}
```

**Do not add:** react-spring, framer-motion, or any animation library for this feature. The existing CSS keyframe approach is already defined, performant, and consistent with the codebase.

### Star Rating Calculation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Pure TypeScript function (existing) | — | Compute 1–3 stars from `mistakes` + `timeElapsed` | `stars: number` already lives in `GameState` (see `types.ts`). The formula should be in `engine.ts` alongside `recalculateScoreAndStatus`. |

**Recommended formula** (MEDIUM confidence — matches stated design decision in PROJECT.md):
```ts
function calculateStars(mistakes: number, timeElapsed: number, totalVinyls: number): number {
  // 3 stars: 0 mistakes AND fast (under 1.5× par time)
  // 2 stars: ≤1 mistake OR fast enough
  // 1 star:  level completed (always awarded on completion)
  const parTime = totalVinyls * 8; // 8 seconds per vinyl as baseline
  if (mistakes === 0 && timeElapsed <= parTime * 1.5) return 3;
  if (mistakes <= 1 || timeElapsed <= parTime * 2) return 2;
  return 1;
}
```
Par time is adjustable per level via a `parTime?: number` field on the `Level` type, defaulting to `totalVinyls * 8`.

**Do not add:** any external library for this. It is a pure arithmetic function.

### Level Progression Screen

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React + CSS Modules (existing) | — | Level select grid showing star ratings and lock state | Consistent with existing component patterns (`ShelfSlot.module.css`, `LevelComplete.module.css`). |
| `loadAllProgress()` from `storage.ts` | — | Read saved star ratings for display | Already returns `Record<string, LevelProgress>`. Map over `LEVELS` array, read stars per `level.id`. |
| `isLevelUnlocked(index)` from `storage.ts` | — | Gate locked levels | Already implemented. Requires 1 star on previous level. PROJECT.md specifies 2 stars minimum — update the threshold in `storage.ts` to `stars >= 2`. |

**Component structure:**
```
LevelSelectScreen
  LevelGrid
    LevelCard (unlocked) — shows level number, mode icon, best star count, best time
    LevelCard (locked)   — shows lock icon, "2 stelle per sbloccare"
```

**Do not add:** a routing library (React Router, TanStack Router). The app is a single-screen game. Add `screen: 'game' | 'level-select'` to the top-level `App.tsx` state and conditionally render. Two screens do not justify a router.

### HUD: Current Level Rule Display

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React component (new, small) | — | Show active rule in HUD: "Genere", "Anno", "Cliente" | The HUD already accepts props and renders stats. Add a `levelMode` prop and render a `RulePill` sub-component. |

**Do not add:** a tooltip library. The rule is always visible, not on-hover. One line of text in the HUD is sufficient.

### Vinyl Progress Counter in HUD

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `ProgressBar` component (existing) | — | "5/8 vinili piazzati" | The component exists and is rendered in `GameScreen.tsx`. It already shows `placed/total`. The gap is that it uses the dot-based `ProgressBar.tsx` but not the circular gauge `ProgressBar/ProgressBar.tsx` from the HUD. Decide on one and remove the other. |

**Decision:** Keep the dot-style `ProgressBar.tsx` as the primary progress indicator. It matches the game's tactile, record-like aesthetic better than a circular gauge. The circular gauge in `HUD/HUD.tsx` is a leftover from a prior design pass — it can be replaced with the dot-style component or a simple fraction display.

**Confidence:** HIGH — both components exist; this is a curation decision, not new work.

### Level Complete Screen Enhancements

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| CSS animation (existing) | — | Star reveal animation — stagger each star by 200ms | Use the existing `checkPop` keyframe (`src/animations/keyframes.ts`). Apply with `animation-delay: 0ms, 200ms, 400ms` per star. |
| React `useMemo` (existing) | — | Confetti generation | Already used correctly in `LevelComplete.tsx`. |

**Do not add:** a confetti library (e.g. `canvas-confetti`, `react-confetti`). The existing CSS confetti in `LevelComplete.tsx` is sufficient and adds no dependency.

### Zustand Progression Store (New Slice)

For the level select screen, a thin Zustand store over `storage.ts` is the right pattern:

```ts
// src/store/progressionStore.ts
interface ProgressionStore {
  progress: Record<string, LevelProgress>;
  refresh: () => void;           // re-reads from localStorage
  currentLevelIndex: number;
  setCurrentLevel: (index: number) => void;
}
```

This keeps `GameScreen` decoupled from `localStorage` reads on every render, and gives the level select screen a reactive data source.

**Confidence:** HIGH — matches existing Zustand usage patterns in the codebase.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Progression persistence | `localStorage` (existing) | `idb` / IndexedDB | Overkill — data is tiny, no binary blobs, no offline-first requirements |
| Animation | CSS keyframes (existing) | framer-motion | Adds 40KB+ to bundle; existing keyframes handle all needed effects |
| Animation | CSS keyframes (existing) | react-spring | Same problem; spring physics already implemented as CSS beziers in `TIMING.ts` |
| Screen routing | Local state `screen` var | React Router | Two screens don't justify a router; game is single-URL by design |
| Score floating text | `ScorePopup` (existing) | Three.js `TextGeometry` in canvas | Canvas text is harder to style, requires font loading; HTML overlay is already the established pattern for all game UI |
| Confetti on level complete | CSS animation (existing) | `canvas-confetti` | Works fine, already implemented, no extra dependency needed |
| State for level progression | Zustand slice (new) | Extend `gameReducer` | Level selection state is cross-session, not per-game — it belongs in a persistent store, not a session reducer |

---

## What Not to Install

These libraries would be considered natural choices but are wrong for this project:

| Library | Why Not |
|---------|---------|
| `framer-motion` | Entire animation system already built with CSS keyframes. Adding framer-motion creates two competing animation primitives. |
| `react-spring` | Same reason. `TIMING.ts` already encodes spring physics as bezier curves. |
| `react-router-dom` | Single URL game. Screen switching is a boolean flag, not URL routing. |
| `zustand/middleware` `persist` | `storage.ts` already handles the persistence contract with explicit save/load functions. Auto-persist middleware creates hidden write behavior and conflicts with the explicit "best score only" merge logic in `saveProgress`. |
| `react-query` / `tanstack-query` | No async data fetching. Everything is synchronous (localStorage, in-memory levels array). |
| `canvas-confetti` | Already have confetti in `LevelComplete.tsx`. |

---

## Installation

No new packages are required for this milestone. All needed capabilities are already present in the installed dependencies:

```bash
# Nothing to install — all work is integration and new components
# using existing: react, styled-components, zustand, typescript
```

The `@react-three/fiber` and `@react-three/drei` packages (already installed) are not needed for any of these features — level progression, stars, and score feedback are all React/HTML/CSS, not Three.js canvas work.

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| What already exists | HIGH | Direct code inspection of all relevant files |
| Star formula | MEDIUM | Matches PROJECT.md stated design decision; exact thresholds need playtesting |
| Progression store pattern | HIGH | Matches existing Zustand usage in `gameStore.ts` |
| No new dependencies needed | HIGH | All animation, state, and persistence primitives confirmed present |
| Screen routing approach (no router) | HIGH | Consistent with single-page game architecture; verified no router currently installed |
| `localStorage` scale adequacy | HIGH | 21 levels × ~20 bytes = ~420 bytes total; well within limits |

---

## Sources

- Direct code audit: `/Users/martha2022/Documents/Sleevo/src/` (all relevant files read)
- `package.json` — confirmed installed dependencies
- `src/game/storage.ts` — confirmed localStorage implementation
- `src/game/types.ts` — confirmed `stars` field in `GameState`, all `LevelMode` variants
- `src/game/levels.ts` — confirmed 21 levels fully defined
- `src/components/GameScreen.tsx` — confirmed existing integration points (`lastSlotPosition`, `saveProgress` call, `LevelComplete` render)
- `src/components/ScorePopup/ScorePopup.tsx` — confirmed floating score exists but needs wiring
- `src/animations/keyframes.ts` + `timing.ts` — confirmed animation system is complete
- `src/components/LevelComplete.tsx` — confirmed star display and confetti exist
- Confidence in "no new packages": MEDIUM for framer-motion/react-spring recommendation (training knowledge of bundle sizes, verified no current usage in codebase)
