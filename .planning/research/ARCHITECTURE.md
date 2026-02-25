# Architecture Research

**Domain:** Best score persistence + personal record UI in existing React browser game
**Researched:** 2026-02-25
**Confidence:** HIGH — based entirely on direct codebase inspection

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Screen Router (App.tsx)                  │
│   useState: 'levelSelect' | 'playing'                        │
├──────────────────────┬──────────────────────────────────────┤
│   LevelSelect.tsx    │         GameScreen.tsx               │
│   (read-only)        │   useReducer → GameState             │
│   loadAllProgress()  │   saveProgress() on complete         │
│   → bestStars        │   → bestStars + bestScore (NEW)      │
│   → bestScore (NEW)  │                                      │
│   LevelCell renders  │   LevelComplete.tsx                  │
│   score per cell     │   receives isNewRecord prop (NEW)    │
│   (NEW: "1.420 pt")  │   shows "Nuovo Record!" badge (NEW)  │
├──────────────────────┴──────────────────────────────────────┤
│                    src/game/storage.ts                       │
│   LevelProgress: { stars, bestTime?, bestScore? (NEW) }     │
│   saveProgress(id, stars, time?, score?) — best-only write  │
│   loadAllProgress() → Record<string, LevelProgress>         │
│   getLevelProgress(id) → LevelProgress | null               │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Current State |
|-----------|----------------|---------------|
| `src/game/storage.ts` | Persist progress to localStorage; best-only semantics | Saves `stars` + `bestTime`. Must add `bestScore`. |
| `GameScreen.tsx` | Orchestrate game loop; save progress on complete; pass data to LevelComplete | Calls `saveProgress(id, stars, time)`. Must add score arg and `isNewRecord` derivation. |
| `LevelComplete.tsx` | Display end-of-level stats; show record badge | Renders score. Must accept `isNewRecord` prop and render "Nuovo Record!" badge. |
| `LevelSelect.tsx / LevelCell` | Render per-level grid cells with progress data | Reads `bestStars`. Must also read and render `bestScore`. |
| `App.tsx` | Screen routing only; passes `onReturnToSelect` callback | No changes needed. |

---

## Recommended Project Structure

No new files or folders required. All changes are in-place modifications to existing files:

```
src/
├── game/
│   └── storage.ts          MODIFY — add bestScore to LevelProgress, extend saveProgress
├── components/
│   ├── GameScreen.tsx       MODIFY — derive isNewRecord, pass to LevelComplete, save score
│   ├── LevelComplete.tsx    MODIFY — add isNewRecord prop, render "Nuovo Record!" badge
│   └── LevelSelect/
│       └── LevelSelect.tsx  MODIFY — pass bestScore into LevelCell, render score line
```

---

## Architectural Patterns

### Pattern 1: Extend Storage Shape In-Place

**What:** Add `bestScore?: number` to the existing `LevelProgress` interface. Extend `saveProgress` with an optional `score` parameter. Best-only write logic: `score > existing.bestScore`.

**When to use:** Adding a new scalar metric with identical semantics to existing `stars` or `bestTime` fields.

**Trade-offs:** Zero migration cost — old data in localStorage is valid (missing `bestScore` treated as `undefined`/0). No breaking changes to callers that do not pass score.

**Example:**
```typescript
// src/game/storage.ts

export interface LevelProgress {
  stars: number;
  bestTime?: number;
  bestScore?: number;   // NEW
}

export function saveProgress(
  levelId: string,
  stars: number,
  timeSeconds?: number,
  score?: number        // NEW optional param
): void {
  try {
    const data = loadAllProgress();
    const existing = data[levelId];
    const starsImproved = !existing || stars > existing.stars;
    const timeImproved = !starsImproved &&
      stars === existing?.stars &&
      timeSeconds !== undefined &&
      (existing.bestTime === undefined || timeSeconds < existing.bestTime);
    const scoreImproved = score !== undefined &&
      (existing?.bestScore === undefined || score > existing.bestScore);

    if (starsImproved || timeImproved || scoreImproved) {
      data[levelId] = {
        stars: starsImproved ? stars : (existing?.stars ?? stars),
        bestTime: starsImproved || timeImproved ? timeSeconds : existing?.bestTime,
        bestScore: scoreImproved ? score : existing?.bestScore,  // NEW
      };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
    }
  } catch {
    // localStorage might be unavailable
  }
}
```

**Important:** `bestScore` uses independent best-only semantics — it improves whenever the new score exceeds the stored value, regardless of whether stars also improved. A player can earn 3 stars on run 1 and beat their score without beating their star count on run 2.

---

### Pattern 2: Derive isNewRecord in GameScreen Before Saving

**What:** Before calling `saveProgress`, read the current stored `bestScore` via `getLevelProgress`. Compare `state.score > (existing?.bestScore ?? 0)`. Store the result in a local `useState` boolean. Pass the boolean as a prop to `LevelComplete`.

**When to use:** Any "you beat your record" UI that requires a before/after comparison. The comparison must happen before the write, because after the write the stored value equals the current run and the comparison would always return false.

**Where the comparison lives: `GameScreen.tsx` — inside the completion `useEffect`.**

This is the correct location because:
- GameScreen already owns the `saveProgress` call (line 189 in the existing file)
- GameScreen has access to both `state.score` (current run) and can call `getLevelProgress(state.level.id)` (stored best)
- LevelComplete is a pure display component — it must not read storage directly
- App.tsx has no score awareness and must not gain it

**Example:**
```typescript
// In GameScreen.tsx — replace existing completion useEffect

const [isNewRecord, setIsNewRecord] = useState(false);

useEffect(() => {
  if (state.status === 'completed') {
    const existing = getLevelProgress(state.level.id);
    const newRecord = state.score > (existing?.bestScore ?? 0);
    setIsNewRecord(newRecord);                                    // set BEFORE save
    saveProgress(state.level.id, state.stars, timeElapsed, state.score);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [state.status, state.stars]);
```

Then pass to LevelComplete:
```tsx
<LevelComplete
  ...
  isNewRecord={isNewRecord}   // NEW prop
/>
```

Reset `isNewRecord` to `false` in both `handleRestart` and `handleNext` callbacks to prevent the badge from persisting into the next run.

---

### Pattern 3: Read bestScore in LevelSelect at Render Time

**What:** `loadAllProgress()` is already called synchronously in `LevelSelect` at render time. Extract `bestScore` from the progress record alongside `bestStars`. Pass it to `LevelCell` as a new optional prop.

**When to use:** LevelSelect already uses the synchronous read pattern — extend it to include the new field. No additional reads are needed.

**Trade-offs:** Zero additional localStorage reads — same `loadAllProgress()` call already returns the extended shape once `storage.ts` is updated. `LevelCell` gets one new optional prop.

**Example:**
```typescript
// LevelSelect.tsx

interface CellProps {
  levelNumber: number;
  bestStars: number;
  bestScore?: number;   // NEW
  unlocked: boolean;
  focused: boolean;
  onClick: () => void;
  cellRef?: React.Ref<HTMLButtonElement>;
}

function LevelCell({ levelNumber, bestStars, bestScore, unlocked, focused, onClick, cellRef }: CellProps) {
  return (
    <button ...>
      <span className={styles.number}>{levelNumber}</span>
      <div className={styles.stars}>...</div>
      {bestScore !== undefined && bestScore > 0 && (
        <span className={styles.bestScore}>
          {bestScore.toLocaleString('it-IT')} pt
        </span>
      )}
      {!unlocked && <span className={styles.lock}>🔒</span>}
    </button>
  );
}

// In LevelSelect render:
const bestScore = p?.bestScore;
return (
  <LevelCell
    ...
    bestScore={bestScore}
  />
);
```

The Italian locale `it-IT` formats `1420` as `"1.420"` — matching the "1.420 pt" spec.

---

## Data Flow

### bestScore Write Flow (new)

```
User completes level
    |
    v
GameScreen — state.status === 'completed' fires useEffect
    |
    v
getLevelProgress(state.level.id)  <-- read BEFORE write
    |
    v
Compare: state.score > (existing?.bestScore ?? 0)
    |
    v
setIsNewRecord(true/false)  <-- local useState, triggers re-render
    |
    v
saveProgress(id, stars, timeElapsed, state.score)  <-- write
    |
    v
LevelComplete receives isNewRecord=true  -->  renders "Nuovo Record!" badge
```

### bestScore Read Flow (LevelSelect)

```
User returns to level select (or first load)
    |
    v
LevelSelect re-mounts, render executes synchronously
    |
    v
loadAllProgress()  <-- single synchronous localStorage read
    |
    v
progress[level.id].bestScore extracted per cell
    |
    v
LevelCell receives bestScore prop  -->  renders "1.420 pt" below stars
```

### Key Data Flows

1. **Write path:** `GameScreen completion useEffect` reads existing via `getLevelProgress` (before write) → derives `isNewRecord` → calls `saveProgress` (write)
2. **Record badge path:** `isNewRecord` boolean in `GameScreen` local state → prop to `LevelComplete` → conditional render of badge
3. **LevelSelect display path:** `loadAllProgress()` at render → `LevelCell.bestScore` prop → `toLocaleString('it-IT')` formatted output

---

## Integration Points

### Modified Files

| File | Change Type | What Changes |
|------|-------------|--------------|
| `src/game/storage.ts` | Modify | Add `bestScore?: number` to `LevelProgress`; add optional `score` param to `saveProgress`; independent best-only write logic for score |
| `src/components/GameScreen.tsx` | Modify | Add `isNewRecord` useState; read existing bestScore before save; pass `isNewRecord` to LevelComplete; reset in `handleRestart` and `handleNext` |
| `src/components/LevelComplete.tsx` | Modify | Add `isNewRecord?: boolean` prop to `Props` interface; render "Nuovo Record!" badge when true |
| `src/components/LevelSelect/LevelSelect.tsx` | Modify | Add `bestScore?: number` to `CellProps`; extract from progress record; render with `it-IT` locale formatting |

### New Files

None. All changes are additive modifications to existing files.

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `GameScreen` → `LevelComplete` | Props (`isNewRecord: boolean`) | One-way, synchronous. LevelComplete is a stateless display component. |
| `GameScreen` → `storage.ts` | Direct function calls (`saveProgress`, `getLevelProgress`) | Synchronous. No async. `getLevelProgress` is a convenience wrapper over `loadAllProgress`. |
| `LevelSelect` → `storage.ts` | Direct function call (`loadAllProgress`) | Already synchronous at render time. Pattern is unchanged. |
| `LevelProgress` in localStorage | JSON shape extension with optional field | `bestScore?: number` — old stored data without the field degrades gracefully to `undefined`, treated as 0. |

---

## Scaling Considerations

This is a single-player browser game using localStorage. Scaling is not a concern. The only relevant consideration is backwards compatibility with existing localStorage data:

| Concern | Approach |
|---------|----------|
| Existing localStorage data without `bestScore` | `bestScore?: number` is optional. `existing?.bestScore ?? 0` handles missing field on all existing saves. No migration needed. |
| First run after update | `isNewRecord` will correctly be `true` on any completed level where `state.score > 0` and no prior `bestScore` is stored. This is correct — the first score for a level is always a record. |

---

## Anti-Patterns

### Anti-Pattern 1: Deriving isNewRecord Inside LevelComplete

**What people do:** Pass `score` and `levelId` to LevelComplete; let it call `getLevelProgress` itself to do the comparison.

**Why it is wrong:** LevelComplete is a pure display component. More critically, it renders after GameScreen's `useEffect` has already called `saveProgress`. The comparison inside LevelComplete would compare the new score against the newly-written stored value — the result would always be false (or equal, never greater).

**Do this instead:** Derive `isNewRecord` in GameScreen's completion `useEffect`, reading storage before writing, then pass the boolean as a prop.

---

### Anti-Pattern 2: Deriving isNewRecord in App.tsx

**What people do:** Surface the record logic in the router layer so it can be passed as a callback or returned through `onReturnToSelect`.

**Why it is wrong:** App.tsx has no access to `state.score` or `state.level.id`. Forcing App.tsx to own score logic would require threading game state up through `onReturnToSelect`, breaking the clean separation between the router and the game orchestrator.

**Do this instead:** Keep all game state derivation inside GameScreen, which already owns the reducer and all side effects.

---

### Anti-Pattern 3: Saving bestScore Only When Stars Also Improve

**What people do:** Wrap the score write inside the existing `starsImproved` condition, so score is only stored alongside a star improvement.

**Why it is wrong:** A player can replay a level and score more points without earning more stars (e.g., faster combo execution on a run with the same error count). Score must improve independently of stars.

**Do this instead:** Use `scoreImproved` as an independent condition with its own best-only write. Stars and score have logically separate "personal best" semantics.

---

### Anti-Pattern 4: Formatting Score in LevelSelect Without Locale

**What people do:** `bestScore.toString()` or a manual comma-insertion function for the "1.420 pt" display.

**Why it is wrong:** The spec calls for Italian thousand-separator notation ("1.420"). `(1420).toString()` returns `"1420"`. Manual implementations are fragile.

**Do this instead:** `bestScore.toLocaleString('it-IT')` returns `"1.420"` on all modern platforms. Append `" pt"` as a string literal.

---

## Build Order

Build in this order to respect dependency edges:

1. **`src/game/storage.ts`** — Foundation. All other changes depend on `bestScore` existing in the `LevelProgress` shape and the extended `saveProgress` signature. Do this first.

2. **`src/components/GameScreen.tsx`** — Reads from storage (requires step 1), derives `isNewRecord`, extends the `saveProgress` call, passes new prop to `LevelComplete`. Do this second.

3. **`src/components/LevelComplete.tsx`** — Receives `isNewRecord` prop (interface contract known after step 2), adds the "Nuovo Record!" badge. Do this third.

4. **`src/components/LevelSelect/LevelSelect.tsx`** — Reads `bestScore` from storage (requires step 1 only). Does not depend on steps 2 or 3. Can be done in parallel with steps 2–3 once step 1 is complete.

---

## Sources

- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/game/storage.ts`
- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/components/GameScreen.tsx`
- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/components/LevelComplete.tsx`
- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/components/LevelSelect/LevelSelect.tsx`
- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/App.tsx`
- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/game/types.ts`
- Direct inspection of `/Users/martha2022/Documents/Sleevo/.planning/PROJECT.md`

---
*Architecture research for: bestScore persistence + personal record UI in Sleevo*
*Researched: 2026-02-25*
