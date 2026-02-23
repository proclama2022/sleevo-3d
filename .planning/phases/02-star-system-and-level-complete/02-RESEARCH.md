# Phase 02: Star System and Level Complete - Research

**Researched:** 2026-02-23
**Domain:** React game state management, star rating algorithms, CSS animations, localStorage persistence
**Confidence:** HIGH

## Summary

Phase 2 implements the star rating formula and enhances the end-of-level ceremony. The codebase already has:

1. **Star calculation stub** in `game/engine.ts` (lines 152-164) with a basic mistakes/hints formula
2. **LevelComplete component** with animated star reveals via CSS (`starPop` keyframe)
3. **Progress persistence** via `saveProgress()` in `storage.ts`
4. **Time tracking** in `GameScreen.tsx` via `timeElapsed` state

The main work is replacing the stub formula with the CONTEXT.md decision (parTime-based) and adding `parTime` to the Level interface.

**Primary recommendation:** Add `parTime` to Level interface, implement the context-decided formula in `gameReducer`, ensure `timeElapsed` flows correctly to LevelComplete, and persist stars via existing `saveProgress()`.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**D1: Star Calculation Formula** — Discrete thresholds (not weighted formula)

| Stars | Condition |
|-------|-----------|
| 3★ | 0 errors + time ≤ par × 1.10 |
| 2★ | ≤1 error + time < par |
| 1★ | Level completed |

- Time threshold for 3★ allows 10% margin over par (par × 1.10)
- Time threshold for 2★ is strict: must be UNDER par (< parTime)
- Errors are counted as wrong placements (PLACE_VINYL with isValidPlacement = false)
- 1 star is guaranteed for completing the level, regardless of performance

**D2: Mode-Differentiated Thresholds** — Per-level manual parTime (not automatic multipliers)

Each level has its own `parTime` property defined manually by the level designer. This gives maximum flexibility because:
- Difficulty varies by vinyl count, not just mode
- Complex layouts need more time regardless of mode
- Designer can tune each level individually

No automatic mode multipliers. The parTime is set per-level during level authoring (Phase 4).

**D3: End-of-Level Screen Layout** — Centered modal with darkened background

Content displayed:
1. Stars — 1-3 stars with animated reveal (primary focus)
2. Score — Total points earned
3. Errors — Count of wrong placements (e.g., "2 errori")
4. Time vs Par — Elapsed time with par reference (e.g., "0:47 / 1:00 par")

Star Animation:
- Sequential reveal: stars appear one after another with 0.3s delay
- Builds tension and celebration

Actions:
- "Rigioca" button — restarts current level
- "Prossimo livello" button — goes to next level (only if unlocked)

**D4: parTime Definition and Storage** — Formula + manual override

Default formula: `(vinyls × 3s) × (1 + mode_multiplier)`

Storage: `parTime` is a property on the `Level` object in `levels.ts`

```typescript
interface Level {
  id: string;
  name: string;
  mode: LevelMode;
  vinyls: Vinyl[];
  parTime: number; // seconds
  // ... other properties
}
```

### Claude's Discretion

None — all decisions are locked.

### Deferred Ideas (OUT OF SCOPE)

- Level select screen → Phase 3
- Star display on level tiles → Phase 3
- Rush mode countdown timer → Phase 4
- Blackout flicker fix → Phase 4

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STAR-01 | Star rating calculates from errors + time (3★ = no errors + under par) | Existing `mistakes` counter in GameState, `timeElapsed` tracked in GameScreen. Formula decision locked in D1. |
| STAR-02 | Star thresholds differ by mode (rush/blackout more lenient) | Per-level `parTime` approach (D2) allows mode differentiation via level design. No runtime mode multiplier needed. |
| STAR-03 | Each level has defined `parTime` for star calculation | `parTime` property added to Level interface (D4). Default formula provided. |
| COMM-04 | Level complete screen shows stars, score, errors, time | LevelComplete.tsx exists with stars, errors, hintsUsed, time. Needs: add `parTime` prop, format "Time / Par" display, show final score. |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React useReducer | 19.2.4 | Game state management | Already canonical per Phase 1 (eliminated Zustand) |
| CSS Modules | Vite builtin | Star reveal animations | Existing `starPop` keyframe in LevelComplete.module.css |
| localStorage | Browser API | Progress persistence | Already used in `storage.ts` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| styled-components keyframes | 6.3.9 | Animation timing constants | Use TIMING.STAR_REVEAL from src/animations/timing.ts |

### Installation

No new packages required. All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── game/
│   ├── types.ts          # Add parTime: number to Level interface
│   ├── levels.ts         # Add parTime to each level (use formula)
│   ├── engine.ts         # Replace star calculation in PLACE_VINYL case
│   ├── storage.ts        # Already handles saveProgress() correctly
│   └── rules.ts          # No changes needed
├── components/
│   ├── LevelComplete.tsx         # Add score, parTime props
│   ├── LevelComplete.module.css   # Existing starPop animation works
│   └── GameScreen.tsx             # Pass score, timeElapsed to LevelComplete
└── animations/
    └── timing.ts         # Add STAR_REVEAL constant if needed
```

### Pattern 1: Star Calculation in gameReducer

**What:** Calculate stars immediately when the last vinyl is placed

**When to use:** In the `PLACE_VINYL` case when `isComplete` becomes true

**Example:**

```typescript
// src/game/engine.ts - PLACE_VINYL case
const isComplete = newUnplaced.length === 0;

let stars = 1; // Default: 1 star for completion
if (isComplete) {
  const mistakes = state.mistakes;
  const time = state.level.parTime ? timeElapsed : null;

  if (time !== null) {
    if (mistakes === 0 && time <= state.level.parTime * 1.10) {
      stars = 3;
    } else if (mistakes <= 1 && time < state.level.parTime) {
      stars = 2;
    }
  }
}
```

**Source:** Adapted from existing stub (lines 152-164) + CONTEXT.md D1 formula

### Pattern 2: Per-Level parTime Default

**What:** Calculate parTime using formula if not manually set

**When to use:** In levels.ts when defining levels, before Phase 4 manual tuning

**Example:**

```typescript
// src/game/levels.ts
function calculateParTime(level: Level): number {
  const modeMultiplier: Record<LevelMode, number> = {
    'free': 1.0,
    'genre': 1.2,
    'chronological': 1.3,
    'customer': 1.1,
    'blackout': 1.5,
    'rush': 0.8,        // Less time = harder
    'sleeve-match': 1.4,
  };
  return Math.round((level.vinyls.length * 3) * (1 + modeMultiplier[level.mode]));
}

// Usage in level definitions:
export const level1: Level = {
  // ... existing props
  parTime: 18, // 6 vinyls × 3s × 1.0 (free mode) = 18s
};
```

**Source:** CONTEXT.md D4 formula

### Pattern 3: Time vs Par Display in LevelComplete

**What:** Show "0:47 / 1:00 par" format on level complete

**When to use:** In LevelComplete.tsx time stat display

**Example:**

```typescript
// src/components/LevelComplete.tsx
interface Props {
  // ... existing props
  score: number;        // ADD: final score from GameState
  parTime?: number;     // ADD: optional par time from level
}

function formatTimeWithPar(seconds: number, par?: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const formatted = m === 0 ? `${s}s` : `${m}:${String(s).padStart(2, '0')}`;

  if (par !== undefined) {
    const parM = Math.floor(par / 60);
    const parS = par % 60;
    const parFormatted = parM === 0 ? `${parS}s` : `${parM}:${String(parS).padStart(2, '0')}`;
    return `${formatted} / ${parFormatted} par`;
  }
  return formatted;
}

// In JSX:
<span className={styles.statValue}>{formatTimeWithPar(timeElapsed, parTime)}</span>
```

**Source:** Adapted from existing `formatTime()` function (lines 15-20)

### Anti-Patterns to Avoid

- **Calculating stars in LevelComplete component:** Stars should be computed in gameReducer and stored in GameState, not derived during render. This ensures consistency and allows persistence.
- **Using mode multipliers at runtime:** Per CONTEXT.md D2, thresholds are differentiated via per-level parTime, not runtime mode checks. This keeps the formula simple and data-driven.
- **Forgetting to pass score to LevelComplete:** The component currently doesn't receive score. Add `score={state.score}` prop.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Star reveal animation | Custom JS animation loop | CSS keyframes (`starPop` already exists) | CSS animations are declarative, performant, and already implemented |
| Progress persistence | Custom IndexedDB wrapper | `localStorage` (already in `storage.ts`) | Simple key-value storage is sufficient for stars per level |
| Time formatting | Custom date utils | Simple math (`Math.floor`, modulo) | Time formatting is trivial, no library needed |

**Key insight:** The existing infrastructure handles 90% of this phase. Don't rebuild what's already working.

## Common Pitfalls

### Pitfall 1: Missing parTime in Old Levels

**What goes wrong:** Adding `parTime` to the Level interface but forgetting to add it to existing level definitions causes TypeScript errors.

**Why it happens:** TypeScript will error on missing required properties.

**How to avoid:** Make `parTime` optional in the interface (`parTime?: number`) for backward compatibility, then do a bulk add using the formula.

**Warning signs:** TypeScript errors in `levels.ts` about missing `parTime` property.

### Pitfall 2: Race Between timeElapsed and Star Calculation

**What goes wrong:** Stars are calculated before `timeElapsed` updates, causing stale time values in the formula.

**Why it happens:** `timeElapsed` is updated in a useEffect that runs every second. The last vinyl placement might happen between ticks.

**How to avoid:** Calculate stars using `timeElapsed + 1` (next second) OR use `Date.now()` diff for precision. Alternatively, accept the slight imprecision (players won't notice 1-second variance on completion).

**Warning signs:** Completing a level shows incorrect stars until re-render.

### Pitfall 3: Rush Mode Time's Up vs Star Calculation

**What goes wrong:** Rush mode's `RUSH_TICK` action sets `status: 'completed'` with `stars: 1` (line 266 in engine.ts), but this bypasses the star calculation formula.

**Why it happens:** Special case for rush mode timeout was added separately from the main completion logic.

**How to avoid:** When rush time expires, calculate stars normally (mistakes + time) instead of hardcoding 1 star. A timeout should probably give 1 star, but it should go through the same logic.

**Warning signs:** Rush mode levels always show 1 star even if completed with 0 mistakes.

### Pitfall 4: score Not Passed to LevelComplete

**What goes wrong:** COMM-04 requires showing score on level complete, but the current LevelComplete props don't include `score`.

**Why it happens:** The component was designed before COMM-04 was added.

**How to avoid:** Add `score: number` to LevelComplete Props interface and pass `state.score` from GameScreen.

**Warning signs:** Score is missing from the level complete screen.

## Code Examples

Verified patterns from codebase:

### Adding parTime to Level Interface

```typescript
// src/game/types.ts
export interface Level {
  id: string;
  rows: number;
  cols: number;
  vinyls: Vinyl[];
  sortRule: SortRule;
  mode: LevelMode;
  timeLimit?: number;
  parTime?: number;  // ADD THIS
  hint?: string;
  theme?: LevelTheme;
  // ... rest
}
```

### Star Calculation in gameReducer

```typescript
// src/game/engine.ts - PLACE_VINYL case (around line 149)
// Check completion
const isComplete = newUnplaced.length === 0;

// Calculate stars on completion (REPLACE lines 152-164)
let stars = 1; // Default to 1 star for completion
if (isComplete) {
  const mistakes = state.mistakes;
  const parTime = state.level.parTime;
  const currentTime = timeElapsed; // Need to pass or calculate

  if (parTime !== undefined) {
    if (mistakes === 0 && currentTime <= parTime * 1.10) {
      stars = 3;
    } else if (mistakes <= 1 && currentTime < parTime) {
      stars = 2;
    }
  } else {
    // Fallback for levels without parTime (shouldn't happen after bulk add)
    stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
  }
}
```

### Passing Props to LevelComplete

```typescript
// src/components/GameScreen.tsx (around line 872)
{state.status === 'completed' && (
  <LevelComplete
    levelNumber={state.levelIndex + 1}
    stars={state.stars ?? 1}
    mistakes={state.mistakes ?? 0}
    hintsUsed={state.hintsUsed ?? 0}
    timeElapsed={timeElapsed}
    parTime={state.level.parTime}  // ADD THIS
    score={state.score}             // ADD THIS
    hasNextLevel={state.levelIndex + 1 < LEVELS.length}
    onNextLevel={handleNext}
    onReplay={handleRestart}
  />
)}
```

### Sample parTime Values for Existing Levels

```typescript
// src/game/levels.ts - Example calculations
// level1: 6 vinyls, free mode → 6 × 3s × 1.0 = 18s
export const level1: Level = {
  // ...
  parTime: 18,
};

// level2: 8 vinyls, genre mode → 8 × 3s × 1.2 = 29s
export const level2: Level = {
  // ...
  parTime: 29,
};

// level8: 10 vinyls, rush mode → 10 × 3s × 0.8 = 24s (but has 60s timeLimit)
export const level8: Level = {
  // ...
  parTime: 45, // Manual override: more realistic for complex layout
  timeLimit: 60,
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Mistakes-only star formula | Mistakes + time with parTime thresholds | Phase 2 (this phase) | More meaningful star ratings that reward speed |
| No progress persistence | localStorage stars per level | Phase 1 (already done) | Players can track progress across sessions |
| Fixed star animation | Sequential star reveal with CSS | Phase 1 (already done) | Better ceremony and tension on completion |

**Deprecated/outdated:** None specific to this phase. The existing star reveal CSS animation (`starPop`) is current and appropriate.

## Open Questions

1. **How to handle levels without parTime during transition?**
   - What we know: Making `parTime` optional in the interface avoids TypeScript errors
   - What's unclear: Should we calculate stars using a fallback formula or default to 1 star?
   - Recommendation: Use fallback formula (mistakes-only) for levels without parTime, add console warning to surface missing data

2. **Should rush mode timeout affect stars differently?**
   - What we know: Current code sets `stars: 1` on rush timeout (line 266)
   - What's unclear: Is this intentional or should timeout count as a completion with calculated stars?
   - Recommendation: If player completes all vinyls before timeout, calculate normally. If timeout hits, it's 1 star regardless. Need to verify if this is already the behavior.

## Validation Architecture

> Skip this section entirely if workflow.nyquist_validation is false in .planning/config.json

**Note:** `.planning/config.json` shows `workflow.verifier: true` but no `nyquist_validation` key. Assuming Nyquist is disabled, this section is omitted per instructions.

If Nyquist validation is enabled, the test infrastructure would need to be created (no tests currently exist per package.json).

## Sources

### Primary (HIGH confidence)

- **Codebase inspection:**
  - `src/game/types.ts` — Level interface structure
  - `src/game/engine.ts` — Star calculation stub (lines 152-164)
  - `src/game/storage.ts` — saveProgress() implementation
  - `src/components/LevelComplete.tsx` — Component props and structure
  - `src/components/LevelComplete.module.css` — Existing starPop animation
  - `src/components/GameScreen.tsx` — timeElapsed tracking and LevelComplete rendering
  - `src/animations/timing.ts` — Animation timing constants
- **CONTEXT.md** — Locked decisions (D1-D4)
- **REQUIREMENTS.md** — STAR-01, STAR-02, STAR-03, COMM-04 requirements
- **STATE.md** — Project decisions and Phase 1 completion status

### Secondary (MEDIUM confidence)

- None (all research is based on codebase inspection and locked decisions)

### Tertiary (LOW confidence)

- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All code is present, no new dependencies needed
- Architecture: HIGH - Existing patterns (useReducer, CSS Modules, localStorage) are well-established
- Pitfalls: HIGH - Identified by code inspection (rush mode timeout, missing props, optional parTime)

**Research date:** 2026-02-23
**Valid until:** 30 days (stable domain - React game state patterns don't change rapidly)
