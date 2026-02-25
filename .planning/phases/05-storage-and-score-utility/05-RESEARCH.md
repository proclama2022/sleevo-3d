# Phase 5: Storage and Score Utility — Research

**Researched:** 2026-02-25
**Domain:** localStorage extension + score formatting utility in existing React/TypeScript browser game
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PERSIST-01 | Il gioco salva il punteggio migliore (punti interi) per ogni livello in localStorage con semantica best-only (sovrascrive solo se il nuovo score supera il precedente) | Extend `LevelProgress` with `bestScore?: number`; add independent `scoreImproved` condition to `saveProgress`; read `existing?.bestScore` before write |
| PERSIST-02 | Il salvataggio del punteggio migliore usa merge-write per non sovrascrivere i dati esistenti (bestStars, unlocked) | Replace atomic assignment `data[levelId] = { stars, bestTime }` with spread-merge `{ ...existing, bestScore: newBest }` inside `saveProgress` |
</phase_requirements>

---

## Summary

Phase 5 is a narrow, well-bounded storage extension. Two files change: `src/game/storage.ts` gains a `bestScore?: number` field on `LevelProgress` and an updated `saveProgress` function; `src/utils/index.ts` (or a co-located module) gains a `formatScore` utility that Phase 6 and Phase 7 will both import. No new dependencies are required. The entire scope is implementable with the native APIs already in use — `localStorage`, `Intl.NumberFormat`, and TypeScript optional fields.

The current `saveProgress` in `storage.ts` uses an atomic write pattern (`data[levelId] = { stars, bestTime: timeSeconds }`) with a single `improved` guard that gates writes on star or time improvement. Two structural problems must be fixed simultaneously: (1) the guard must be extended with an independent `scoreImproved` condition so a higher-score run is saved even when stars and time do not improve; (2) the write must become a spread-merge so that adding `bestScore` does not silently drop `bestTime` or any future field.

The `formatScore` utility must be created in this phase — before any display work in Phase 6 or 7 — to prevent formatting divergence between `LevelComplete` and `LevelSelect`. The locale `'it-IT'` must be hardcoded, never derived from the browser, so that `1420` always renders as `"1.420 pt"` regardless of system language.

**Primary recommendation:** Fix the write guard and merge pattern in `saveProgress` atomically, add `formatScore` to `src/utils/`, then verify with a manual localStorage inspection before proceeding to Phase 6.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `localStorage` (native) | Browser API | Persist `LevelProgress` under key `sleevo_progress` | Already in active use in `src/game/storage.ts`; zero setup cost |
| `Intl.NumberFormat` (ECMAScript) | ES2015+ | Italian thousand-separator formatting of score integers | Native; `'it-IT'` locale produces `"1.420"` from `1420`; universally supported |
| TypeScript optional fields | 5.9.3 | `bestScore?: number` — backward-compatible schema extension | Already the project pattern for `bestTime?` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `JSON.stringify` / `JSON.parse` | Native | Serialize/deserialize progress record | Already used in `loadAllProgress` and `saveProgress`; note: `undefined` values are silently dropped |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `Intl.NumberFormat('it-IT')` | `numeral.js`, manual string | Both add a dependency; native API is sufficient and already available |
| `localStorage` | IndexedDB, Zustand persist | Overkill for a flat key-value progress record; localStorage already used |

**No installation required.** All APIs are native to the browser and TypeScript version already in use.

---

## Architecture Patterns

### Recommended Project Structure

No new files or folders required for PERSIST-01 and PERSIST-02. One utility function is added to the existing utils module:

```
src/
├── game/
│   └── storage.ts          MODIFY — extend LevelProgress + saveProgress
└── utils/
    └── formatScore.ts      NEW — single shared score formatting utility
        (re-exported from utils/index.ts)
```

### Pattern 1: Extend LevelProgress with Optional bestScore Field

**What:** Add `bestScore?: number` to the `LevelProgress` interface. TypeScript optional fields are backward-compatible — existing localStorage entries without the field deserialize to `undefined`, which is handled by `existing?.bestScore === undefined`.

**When to use:** Adding any new scalar metric to stored progress. The `bestTime?` field is already the established precedent.

**Example:**
```typescript
// src/game/storage.ts
export interface LevelProgress {
  stars: number;
  bestTime?: number;
  bestScore?: number;   // NEW — undefined means level never scored
}
```

### Pattern 2: Extend saveProgress with Independent scoreImproved Condition and Merge-Write

**What:** Add an optional `score` parameter. Replace the single `improved` condition with three independent conditions. Replace the atomic write with a spread-merge.

**When to use:** Any time a new field with independent best-only semantics is added to `LevelProgress`.

**Example:**
```typescript
// Source: direct codebase inspection of src/game/storage.ts
export function saveProgress(
  levelId: string,
  stars: number,
  timeSeconds?: number,
  score?: number          // NEW optional param
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
        ...existing,                                           // MERGE — preserve all existing fields
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

**Critical:** `scoreImproved` is an **independent** condition — it fires when score improves regardless of whether stars or time also improved. A player can earn 3 stars on run 1 and beat their score on run 2 without changing their star count.

### Pattern 3: formatScore Utility with Hardcoded it-IT Locale

**What:** A single function, created before any display surface is implemented, that all score-rendering code imports. Hardcodes `'it-IT'` locale. Returns `'—'` for `undefined` (unplayed levels), not `'0 pt'`.

**When to use:** Every call site that renders a score value — `LevelSelect`, `LevelComplete`, any future surface.

**Example:**
```typescript
// Source: Intl.NumberFormat MDN documentation; Pitfall M4 specification
// src/utils/formatScore.ts
export function formatScore(score: number | undefined): string {
  if (score === undefined || score === null) return '—';
  return new Intl.NumberFormat('it-IT').format(score) + ' pt';
}
```

Re-export from `src/utils/index.ts`:
```typescript
export * from './formatScore';
```

**Verification:** `formatScore(1420)` must return `'1.420 pt'`. `formatScore(undefined)` must return `'—'`. Test in a browser with system locale set to `en-US` — result must still use `.` as the thousands separator, not `,`.

### Pattern 4: GameScreen save call — extend with score, keep dependency array unchanged

**What:** The existing completion `useEffect` in `GameScreen.tsx` (lines 186–192) calls `saveProgress(state.level.id, state.stars, timeElapsed)`. Phase 5 extends this call to include `state.score`. The dependency array `[state.status, state.stars]` must NOT gain `score` as a dependency.

**When to use:** Any time a new argument is added to `saveProgress`.

**Example:**
```typescript
// Source: src/components/GameScreen.tsx lines 186–192
useEffect(() => {
  if (state.status === 'completed') {
    // score read from closure, not deps — intentional: fires once per completion only
    saveProgress(state.level.id, state.stars, timeElapsed, state.score);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [state.status, state.stars]);
```

**Why score stays out of deps:** If `state.score` enters the dependency array, the effect fires on every vinyl placement (because score increments on every correct drop), writing in-progress scores as personal bests.

### Anti-Patterns to Avoid

- **Atomic write without spread-merge:** `data[levelId] = { stars, bestTime, bestScore }` — drops any field not explicitly listed. When a future field is added, this silently erases it. Always spread existing: `{ ...existing, stars: ..., bestTime: ..., bestScore: ... }`.
- **Adding `score` to `useEffect` deps:** Causes `saveProgress` to fire on every vinyl placement, not just on level completion.
- **`?? 0` fallback for bestScore comparison:** `score > (existing?.bestScore ?? 0)` fires "new record" on every first play. Phase 5 does not implement the badge, but `scoreImproved` in `saveProgress` uses `existing?.bestScore === undefined` — this correct guard must also be used in Phase 6 when deriving `isNewRecord`.
- **Inline locale in display components:** Never call `score.toLocaleString()` without the `'it-IT'` argument in display components. Always import `formatScore`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Italian thousand-separator formatting | Manual string manipulation or regex | `Intl.NumberFormat('it-IT')` | Handles edge cases, zero, large numbers; locale-correct; one line |
| localStorage merge | Deep clone utilities or `Object.assign` chains | Spread syntax `{ ...existing, field: newVal }` | Sufficient for a flat object; no library needed |
| Score persistence | Custom IndexedDB wrapper | Extend existing `saveProgress` in `storage.ts` | The abstraction already exists and is the project standard |

**Key insight:** The entire scope of Phase 5 is a textbook TypeScript optional-field extension plus one 4-line utility function. Any solution that introduces a library, a new abstraction layer, or a migration script is over-engineering.

---

## Common Pitfalls

### Pitfall 1: Atomic Write Drops Existing Fields (M1)

**What goes wrong:** `data[levelId] = { stars, bestTime: timeSeconds }` — when `bestScore` is added as a third property without spread, any field not listed is lost. `JSON.stringify` also silently drops `undefined` values, so a `bestScore: undefined` write erases the key from storage.

**Why it happens:** The current write pattern is atomic; developers add a third argument without auditing the pattern.

**How to avoid:** Use `{ ...existing, stars: ..., bestTime: ..., bestScore: ... }` in every write. Never assign a new object literal without spreading.

**Warning signs:** LocalStorage entry shows `{ "stars": 2, "bestTime": 45 }` with no `bestScore` after a completed run. Replaying with a higher score does not update the stored value.

### Pitfall 2: scoreImproved Condition Not Independent of starsImproved (M1, extended)

**What goes wrong:** Nesting `scoreImproved` inside the existing `if (starsImproved)` block means a run that earns more score without earning more stars is silently discarded.

**Why it happens:** The existing guard was designed for stars-or-time, not score. Extending it by wrapping is the naive approach.

**How to avoid:** `scoreImproved` is a separate variable at the same level as `starsImproved` and `timeImproved`. It is ORed into the write gate: `if (starsImproved || timeImproved || scoreImproved)`.

**Warning signs:** Complete a level twice with the same stars but a higher score on the second run. Inspect localStorage — if `bestScore` did not update, the condition is wrong.

### Pitfall 3: Adding score to useEffect Dependency Array (M5)

**What goes wrong:** ESLint's `react-hooks/exhaustive-deps` rule flags `state.score` as missing from the `useEffect` dependency array. "Fixing" this causes `saveProgress` to fire on every score increment during gameplay.

**Why it happens:** The lint suppression comment is already present; a developer removes it or adds the dependency to "clean up."

**How to avoid:** Keep the dependency array as `[state.status, state.stars]`. Add a comment explaining the intent. `state.score` is safely read from the closure when `state.status === 'completed'` fires.

**Warning signs:** Console log inside `saveProgress` appears more than once per level completion.

### Pitfall 4: Score Formatting Diverges Between Phase 6 and Phase 7 (M4)

**What goes wrong:** Phase 6 (LevelComplete badge) and Phase 7 (LevelSelect display) each implement score rendering independently. Different separators, different zero-states, different undefined handling result.

**Why it happens:** Formatting looks trivial; developers implement it inline at each call site.

**How to avoid:** Create `formatScore` in Phase 5, before either display surface. Both Phase 6 and Phase 7 import it. This is the primary deliverable of Phase 5 alongside the storage change.

**Warning signs:** `formatScore(1420)` in LevelSelect returns `'1,420 pt'` (English locale leaking through); LevelComplete shows `'1420 pt'` (no separator).

---

## Code Examples

Verified patterns from direct codebase inspection:

### Current saveProgress (to be extended)

```typescript
// Source: src/game/storage.ts — current implementation (lines 10–28)
export function saveProgress(levelId: string, stars: number, timeSeconds?: number): void {
  try {
    const data = loadAllProgress();
    const existing = data[levelId];
    const improved = !existing || stars > existing.stars ||
      (stars === existing.stars && timeSeconds !== undefined &&
       (existing.bestTime === undefined || timeSeconds < existing.bestTime));

    if (improved) {
      data[levelId] = {
        stars,
        bestTime: timeSeconds,
      };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
    }
  } catch {
    // localStorage might be unavailable
  }
}
```

### Current completion useEffect in GameScreen (to be extended)

```typescript
// Source: src/components/GameScreen.tsx lines 186–192
useEffect(() => {
  if (state.status === 'completed') {
    saveProgress(state.level.id, state.stars, timeElapsed);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [state.status, state.stars]);
```

### Intl.NumberFormat Italian locale

```typescript
// Source: MDN — Intl.NumberFormat ECMAScript standard API
new Intl.NumberFormat('it-IT').format(1420)  // → "1.420"
new Intl.NumberFormat('it-IT').format(420)   // → "420"
new Intl.NumberFormat('it-IT').format(0)     // → "0"
```

### getLevelProgress and loadAllProgress (existing, no change needed)

```typescript
// Source: src/game/storage.ts lines 30–42
export function loadAllProgress(): Record<string, LevelProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getLevelProgress(levelId: string): LevelProgress | null {
  const data = loadAllProgress();
  return data[levelId] ?? null;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Atomic write `data[levelId] = { stars, bestTime }` | Spread-merge `{ ...existing, ... }` | This phase | Prevents silent field loss when schema grows |
| Single `improved` guard (stars OR time) | Three independent guards: `starsImproved`, `timeImproved`, `scoreImproved` | This phase | Score can now improve independently of stars |
| No score formatting utility | `formatScore('it-IT')` shared utility | This phase | Single source of truth prevents locale divergence |

---

## Open Questions

1. **Where to place `formatScore.ts`**
   - What we know: `src/utils/index.ts` re-exports `a11y` and `performance`; it is the established utility entry point
   - What's unclear: Whether to add `formatScore` directly to an existing file or create `src/utils/formatScore.ts`
   - Recommendation: Create `src/utils/formatScore.ts` (one concern per file) and add `export * from './formatScore'` to `src/utils/index.ts`. Consistent with the existing per-file pattern.

2. **Whether `state.score` in GameScreen's completion useEffect is safe to read from closure**
   - What we know: React guarantees effect closure captures current state values at the time the effect fires; `state.status === 'completed'` fires once per completion event; `state.score` is the final score
   - What's unclear: Nothing — this is a documented React behavior
   - Recommendation: Read `state.score` from closure inside the effect body; do not add to deps.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)

- `/Users/martha2022/Documents/Sleevo/src/game/storage.ts` — `LevelProgress` interface (lines 5–8), `saveProgress` function (lines 10–28), `loadAllProgress` (lines 30–37), `getLevelProgress` (lines 39–42), `isLevelUnlocked` (lines 44–50)
- `/Users/martha2022/Documents/Sleevo/src/components/GameScreen.tsx` — completion `useEffect` (lines 186–192); `handleRestart` (lines 545–549); `handleNext` (lines 550–559); `LevelComplete` call site (lines 895–908)
- `/Users/martha2022/Documents/Sleevo/src/game/types.ts` — `GameState.score: number` (line 66); `LevelProgress` shape confirmed as `stars + bestTime?` only
- `/Users/martha2022/Documents/Sleevo/src/utils/index.ts` — existing re-exports; `formatScore` will be added here

### Primary (HIGH confidence — project research documents)

- `.planning/research/SUMMARY.md` — confirmed no new dependencies needed; `formatScore` utility design; `scoreImproved` independent condition; hardcode `'it-IT'`
- `.planning/research/ARCHITECTURE.md` — extended `saveProgress` code example with all three conditions; merge-write pattern; `formatScore` implementation
- `.planning/research/PITFALLS.md` — M1 (clobber), M4 (formatting divergence), M5 (double-write) pitfall specifications with code evidence

### Primary (HIGH confidence — ECMAScript standard)

- `Intl.NumberFormat('it-IT')` — MDN: `1420` → `"1.420"`; locale hardcoded, not browser-derived
- `JSON.stringify` drops `undefined` values — MDN: confirmed serialisation behaviour; source of M1 pitfall

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — confirmed by direct file inspection; no ambiguity about storage.ts location or API
- Architecture: HIGH — all integration points verified from source; patterns are textbook TypeScript extensions
- Pitfalls: HIGH — M1, M4, M5 grounded in actual code evidence from storage.ts and GameScreen.tsx

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (stable domain; localStorage and Intl.NumberFormat APIs have no near-term changes)
