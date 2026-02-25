# Phase 6: Level Complete Record Badge — Research

**Researched:** 2026-02-25
**Domain:** React UI — conditional badge rendering with CSS animation in an existing completion screen
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMPLETE-01 | La schermata di fine livello mostra il badge "Nuovo Record!" quando il punteggio corrente supera il record personale precedente (escluso il primo completamento) | `isNewRecord` derivation pattern in GameScreen render; prop forwarded to LevelComplete; strict `!== undefined && >` guard prevents first-play false positive |
| COMPLETE-02 | Il badge "Nuovo Record!" mostra anche il delta rispetto al record precedente (es. "+340 pt") | `scoreDelta = state.score - previousBest.bestScore` computed alongside `isNewRecord`; passed as separate prop; `formatScore` utility already available for delta display |
</phase_requirements>

---

## Summary

Phase 6 adds the "Nuovo Record!" badge to the `LevelComplete` screen. The entire phase touches exactly two files: `GameScreen.tsx` and `LevelComplete.tsx` (plus its CSS module). The storage and formatting foundation laid in Phase 5 is complete and verified — `getLevelProgress` returns the pre-save best, `formatScore` is available from `src/utils/index.ts`, and `saveProgress` already writes `bestScore` on every completion.

The critical architectural constraint is already documented and understood from research: `isNewRecord` must be computed in `GameScreen` at render time (before the save `useEffect` fires), by reading `getLevelProgress` synchronously during the render when `state.status === 'completed'`. This is the only location where both the pre-save `bestScore` and the current `state.score` are simultaneously accessible. `LevelComplete` is a pure display component — it must receive a boolean prop, not read storage itself.

The delta value (`scoreDelta`) is computed at the same moment as `isNewRecord`, from the same `getLevelProgress` call, and passed as a separate optional prop. Both props must be reset to their default/false/undefined state in `handleRestart` and `handleNext` to prevent the badge from persisting across runs.

**Primary recommendation:** Add `isNewRecord: boolean` and `scoreDelta: number | undefined` props to `LevelComplete`; compute both in `GameScreen` render body (not in an effect) using a single `getLevelProgress` call; add CSS keyframe gold pulse with ~0.6s delay to sequence after star pop-in.

---

## Standard Stack

### Core (no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React `useState` | 19.2.4 (project) | Hold `isNewRecord` and `scoreDelta` across renders in `GameScreen` | Already in use throughout project |
| CSS Modules | Vite built-in | Gold pulse animation for the badge | Established project animation standard — every existing animation uses this pattern |
| `getLevelProgress` | project (`storage.ts`) | Read pre-save `bestScore` in `GameScreen` render | Already exported; Phase 5 confirmed it returns `LevelProgress | null` |
| `formatScore` | project (`src/utils/formatScore.ts`) | Format `+340 pt` delta string | Created in Phase 5; re-exported from `src/utils/index.ts` |

### No Alternatives Needed

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS keyframe | framer-motion | framer-motion is not in the project; CSS keyframe is 2 rules, zero dependency |
| `formatScore` utility | Inline `Intl.NumberFormat` | Never inline — creates the exact M4 divergence pitfall that Phase 5 was designed to prevent |
| `useState` for `isNewRecord` | `useRef` | `useState` triggers re-render so `LevelComplete` receives the updated prop; `useRef` would not trigger re-render |

**Installation:** None required. All capabilities exist.

---

## Architecture Patterns

### Recommended File Changes

```
src/
├── components/
│   ├── GameScreen.tsx          MODIFY — add isNewRecord useState; add scoreDelta computation;
│   │                                    compute both in render body; pass as props; reset in
│   │                                    handleRestart and handleNext
│   ├── LevelComplete.tsx       MODIFY — add isNewRecord and scoreDelta props; render badge
│   └── LevelComplete.module.css  MODIFY — add .recordBadge and @keyframes recordPulse
```

No new files. No new dependencies.

---

### Pattern 1: Compute isNewRecord and scoreDelta in GameScreen Render Body

**What:** Synchronously read `getLevelProgress` during the render pass when `state.status === 'completed'`. Derive both `isNewRecord` and `scoreDelta` from that single read. Store in `useState` so the values persist stably across re-renders while the completion screen is visible.

**When to use:** Any before/after comparison that must happen before a `useEffect` write.

**Why useState (not inline computed):** The completion `useEffect` runs after paint. If `isNewRecord` were derived inline on every render (not stored in state), the value would flip to `false` on the next render after the effect writes the new best to storage. Using `useState` captures the value at the moment of first completion detection and holds it until explicitly reset.

**Critical guard — COMPLETE-01:** Must use strict existence check, not `?? 0`:

```typescript
// Source: .planning/research/PITFALLS.md — Pitfall M2
// CORRECT — no badge on first play:
const isNewRecord =
  existing?.bestScore !== undefined &&
  state.score > existing.bestScore;

// WRONG — fires on first play because ?? 0 makes any score "beat" zero:
const isNewRecord = state.score > (existing?.bestScore ?? 0);
```

**Delta for COMPLETE-02:**

```typescript
// Source: .planning/research/ARCHITECTURE.md — Pattern 2
// Compute at the same time as isNewRecord, same getLevelProgress call:
const existing = getLevelProgress(state.level.id);
const newRecord =
  existing?.bestScore !== undefined &&
  state.score > existing.bestScore;
const delta = newRecord ? state.score - existing.bestScore : undefined;
```

**Full GameScreen implementation pattern:**

```typescript
// Source: .planning/research/ARCHITECTURE.md — Pattern 2 (adapted for COMPLETE-02)

// In GameScreen — new state declarations:
const [isNewRecord, setIsNewRecord] = useState(false);
const [scoreDelta, setScoreDelta] = useState<number | undefined>(undefined);

// In completion useEffect — read BEFORE save:
useEffect(() => {
  if (state.status === 'completed') {
    const existing = getLevelProgress(state.level.id);
    const newRecord =
      existing?.bestScore !== undefined &&
      state.score > existing.bestScore;
    setIsNewRecord(newRecord);
    setScoreDelta(newRecord && existing?.bestScore !== undefined
      ? state.score - existing.bestScore
      : undefined);
    // score read from closure, not deps — intentional: fires once per completion only
    saveProgress(state.level.id, state.stars, timeElapsed, state.score);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [state.status, state.stars]);

// In handleRestart and handleNext — reset both:
const handleRestart = useCallback(() => {
  setTimeElapsed(0);
  setIsNewRecord(false);
  setScoreDelta(undefined);
  setShowHintOverlay(true);
  dispatch({ type: 'RESTART' });
}, []);

const handleNext = useCallback(() => {
  setTimeElapsed(0);
  setIsNewRecord(false);
  setScoreDelta(undefined);
  const nextIdx = state.levelIndex + 1;
  // ... existing logic unchanged
}, [state.levelIndex]);

// In JSX — pass to LevelComplete:
<LevelComplete
  ...existing props...
  isNewRecord={isNewRecord}
  scoreDelta={scoreDelta}
/>
```

**Important ordering note:** `setIsNewRecord` and `setScoreDelta` are called BEFORE `saveProgress` within the same effect. React batches state updates inside effects, so both setters fire atomically in one re-render — the order within the effect does not affect when the render occurs, but the read of `getLevelProgress` happens before the write, which is what matters.

---

### Pattern 2: LevelComplete Props and Badge Render

**What:** Add two optional props to `LevelComplete`. Render the badge as a single `div` inside `.card`, placed after `.stars` and before `.stats`. Use conditional rendering — badge only appears when `isNewRecord === true`.

**Props interface extension:**

```typescript
// Source: direct inspection of src/components/LevelComplete.tsx
interface Props {
  levelNumber: number;
  stars: number;
  mistakes: number;
  hintsUsed: number;
  timeElapsed: number;
  score?: number;
  parTime?: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  isNewRecord?: boolean;       // NEW — true only on genuine improvement
  scoreDelta?: number;         // NEW — undefined when isNewRecord is false
}
```

**Badge JSX — position after stars, before stats:**

```tsx
// Source: direct inspection of src/components/LevelComplete.tsx — card structure
{isNewRecord && (
  <div className={styles.recordBadge}>
    <span className={styles.recordBadgeTitle}>Nuovo Record!</span>
    {scoreDelta !== undefined && (
      <span className={styles.recordBadgeDelta}>
        +{formatScore(scoreDelta)}
      </span>
    )}
  </div>
)}
```

**Note on `formatScore` for delta:** `formatScore(340)` returns `"340 pt"`. The `+` prefix is prepended inline as a literal string. The `scoreDelta` value is always positive when `isNewRecord` is true (enforced by the strict `>` guard), so no sign-checking is needed.

---

### Pattern 3: CSS Gold Pulse Animation

**What:** Two keyframe rules in `LevelComplete.module.css`. The badge enters with a scale-up and fades in, then pulses with a gold glow. A 0.6s delay sequences the badge after the third star's pop-in animation (which completes at 0.4s + ~0.5s animation = ~0.9s total, so 0.6s delay from render means the badge arrives while the last star is still popping).

**Timing reference from existing CSS:**
- `.card` entrance: `cardIn 0.4s` — card fully visible by ~0.4s
- `.starEarned:nth-child(3)` animation starts at `animation-delay: 0.4s` and runs for `0.5s` → last star fully visible at ~0.9s
- Badge delay: `0.6s` — appears while third star is animating; badge is a secondary signal, not a competing one

```css
/* Source: src/components/LevelComplete.module.css — established keyframe pattern */

.recordBadge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-bottom: 16px;
  animation: recordPulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s both;
}

.recordBadgeTitle {
  font-family: system-ui, sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ffd700;
  text-shadow: 0 0 12px rgba(255, 215, 0, 0.7), 0 0 24px rgba(255, 180, 0, 0.4);
}

.recordBadgeDelta {
  font-family: system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 220, 100, 0.85);
  letter-spacing: 0.04em;
}

@keyframes recordPulse {
  0% {
    opacity: 0;
    transform: scale(0.7);
  }
  60% {
    opacity: 1;
    transform: scale(1.08);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```

**Animation choice rationale:** A single entrance animation (not a looping pulse) — looping animations are confirmed as annoying in competitive analysis (Crossy Road, 2048). One attention-getting pop is sufficient; the badge stays visible as static styled text.

---

### Anti-Patterns to Avoid

- **Do not compute `isNewRecord` inside `LevelComplete`:** By the time `LevelComplete` renders after the completion effect fires, the best score has already been overwritten. The comparison would always return false. `LevelComplete` must be a pure display component — it receives the boolean, it does not derive it.
- **Do not use `?? 0` as fallback in the guard:** This causes the badge to appear on every first play of a level. Guard strictly: `existing?.bestScore !== undefined && state.score > existing.bestScore`.
- **Do not add `score` to the `useEffect` dependency array:** The existing lint suppression and comment are intentional. Adding `state.score` fires the effect on every vinyl placement, writing mid-game scores as personal bests.
- **Do not prepend `+` inside `formatScore`:** The utility does not accept a sign parameter. Prepend `+` as a string literal in JSX: `` +{formatScore(scoreDelta)} ``.
- **Do not loop the badge animation:** One entrance animation only. No `animation-iteration-count: infinite`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Score formatting with Italian separator | Custom thousand-insertion function | `formatScore` from `src/utils/index.ts` | Already exists; hardcodes `it-IT`; handles undefined; any hand-rolled version creates M4 divergence |
| Storage read | Direct `localStorage.getItem` + `JSON.parse` | `getLevelProgress(levelId)` | Existing wrapper handles parse errors; consistent with project pattern |
| CSS pulse animation | JS-based animation (setTimeout, requestAnimationFrame) | CSS `@keyframes` in `LevelComplete.module.css` | Project standard; zero runtime cost; already used for stars, confetti, card entrance |

**Key insight:** All three hand-roll temptations already have project-standard solutions. Phase 6 is purely about wiring them together correctly.

---

## Common Pitfalls

### Pitfall 1: isNewRecord Always False (Stale Read — M3)
**What goes wrong:** Deriving `isNewRecord` inside a `useEffect` that also calls `saveProgress`, or anywhere after the save effect runs. The comparison reads the already-overwritten value.
**Why it happens:** React effects run after paint. When status becomes `completed`, render happens first, then the effect fires. If the read happens inside the effect after `saveProgress`, storage holds the new score and the comparison `state.score > existing.bestScore` is always false (equal at best).
**How to avoid:** The read AND the comparison happen at the top of the same `useEffect`, before `saveProgress` is called. `setIsNewRecord` is called before `saveProgress` in the effect body.
**Warning signs:** `isNewRecord` is always `false` in React DevTools even after a confirmed personal best.

### Pitfall 2: Badge on Every First Play (Wrong Guard — M2)
**What goes wrong:** Using `?? 0` fallback — any positive score on a fresh level triggers the badge.
**Why it happens:** `?? 0` is the natural fallback for arithmetic but conflates "no prior record" with "prior record was zero."
**How to avoid:** `existing?.bestScore !== undefined && state.score > existing.bestScore` — when `bestScore` is absent (first play), the left side of `&&` is `false` and the expression short-circuits.
**Warning signs:** Clear localStorage, complete any level → badge appears. It must not appear.

### Pitfall 3: Badge Persists Into Next Run
**What goes wrong:** `isNewRecord` is not reset in `handleRestart` or `handleNext`. Player replays a level, scores lower, but the badge from the previous run is still in state.
**Why it happens:** `useState` persists until explicitly reset.
**How to avoid:** Both `handleRestart` and `handleNext` must call `setIsNewRecord(false)` and `setScoreDelta(undefined)`.
**Warning signs:** Replay a level scoring lower → badge still appears from previous run.

### Pitfall 4: Delta Displays on First-Time Record
**What goes wrong:** `scoreDelta` is set to `state.score` (not the difference) because there was no `previousBest` to subtract from — or `scoreDelta` is set to `state.score - 0` using the `?? 0` fallback.
**Why it happens:** Developers compute delta independently of `isNewRecord`, forgetting the delta is only meaningful when a prior record exists.
**How to avoid:** `scoreDelta` is only set when `isNewRecord` is true. The delta computation reuses the same `existing` object: `state.score - existing.bestScore`. Since `isNewRecord` already guards that `existing.bestScore !== undefined`, the subtraction is always valid within the `newRecord === true` branch.
**Warning signs:** Playing a level for the first time shows a delta equal to the full score.

---

## Code Examples

### Complete isNewRecord + scoreDelta derivation

```typescript
// Source: .planning/research/ARCHITECTURE.md Pattern 2 + COMPLETE-02 extension

useEffect(() => {
  if (state.status === 'completed') {
    const existing = getLevelProgress(state.level.id);
    const newRecord =
      existing?.bestScore !== undefined &&
      state.score > existing.bestScore;
    setIsNewRecord(newRecord);
    setScoreDelta(newRecord && existing?.bestScore !== undefined
      ? state.score - existing.bestScore
      : undefined);
    // score read from closure, not deps — intentional: fires once per completion only
    saveProgress(state.level.id, state.stars, timeElapsed, state.score);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [state.status, state.stars]);
```

### Delta display in LevelComplete JSX

```tsx
// formatScore import:
import { formatScore } from '../utils';

// Badge render (inside card, after stars, before stats):
{isNewRecord && (
  <div className={styles.recordBadge}>
    <span className={styles.recordBadgeTitle}>Nuovo Record!</span>
    {scoreDelta !== undefined && (
      <span className={styles.recordBadgeDelta}>
        +{formatScore(scoreDelta)}
      </span>
    )}
  </div>
)}
```

### Verification: first-play must not show badge

```
Test procedure:
1. Open DevTools → Application → Local Storage → delete sleevo_progress key
2. Reload page, complete any level
3. Confirm: "Nuovo Record!" badge does NOT appear
4. Complete same level with any score
5. If score is higher than first run: badge MUST appear with correct delta
6. If score is lower: badge must NOT appear
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No personal best tracking | `bestScore` in localStorage with merge-write semantics | Phase 5 (2026-02-25) | Foundation for this phase; `getLevelProgress` returns pre-save best |
| `saveProgress(id, stars, time)` | `saveProgress(id, stars, time, score)` | Phase 5 Plan 01 | Score now persisted with best-only semantics |
| `state.score ?? 0` inline in stats | `formatScore(score)` utility | Phase 5 Plan 01 | Consistent `it-IT` locale; em dash for undefined |

**Nothing deprecated for this phase.** Phase 6 is purely additive.

---

## Open Questions

1. **Badge position within card**
   - What we know: Current card layout top-to-bottom is: title → subtitle → stars → stats → buttons
   - What's unclear: Should badge appear between stars and stats (most prominent) or between stats and buttons (less competing with stars)?
   - Recommendation: Between stars and stats — the badge celebrates the score, which appears in stats directly below it; visual grouping is strong. This is the pattern used by Alto's Adventure and Threes!.

2. **"Nuovo Record!" text vs. alternative Italian phrasing**
   - What we know: "Nuovo Record!" is specified in REQUIREMENTS.md and confirmed in research; no alternatives considered
   - What's unclear: Nothing — this is specified
   - Recommendation: Use exactly "Nuovo Record!" as specified.

3. **Delta format: "+340 pt" vs. "+1.420 pt" for large deltas**
   - What we know: `formatScore(scoreDelta)` produces "1.420 pt" for 1420 — the Italian separator is preserved
   - What's unclear: Nothing — `formatScore` already handles this correctly
   - Recommendation: Use `+{formatScore(scoreDelta)}` — `+` prefix literal, `formatScore` for the rest.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection, 2026-02-25)

- `src/components/LevelComplete.tsx` — current Props interface, card layout, star timing, existing animation patterns
- `src/components/LevelComplete.module.css` — existing keyframe names, timing values, z-index, card structure
- `src/components/GameScreen.tsx` — completion `useEffect` (lines 186–193), `handleRestart`, `handleNext`, `LevelComplete` call site (lines 895–908)
- `src/game/storage.ts` — `getLevelProgress` signature, `LevelProgress` interface with `bestScore?: number`
- `src/utils/formatScore.ts` — `formatScore` function signature, return behavior for undefined and integers

### Primary (HIGH confidence — project research documents)

- `.planning/research/ARCHITECTURE.md` — Pattern 2 (derive isNewRecord in GameScreen), with verified code examples
- `.planning/research/PITFALLS.md` — M2 (first-play false positive), M3 (stale read), M4 (formatting divergence), M5 (double-write)
- `.planning/research/SUMMARY.md` — Phase 3 rationale, build order, confirmed research flags as "none"
- `.planning/phases/05-storage-and-score-utility/05-01-SUMMARY.md` — confirms `formatScore` created, re-exported from `src/utils/index.ts`
- `.planning/phases/05-storage-and-score-utility/05-02-SUMMARY.md` — confirms storage pipeline end-to-end human-verified; `bestScore` writes correctly

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; all APIs are in the live, verified codebase
- Architecture: HIGH — `isNewRecord` pattern fully specified in ARCHITECTURE.md; `LevelComplete` props and card structure confirmed by direct source read
- Pitfalls: HIGH — all pitfalls cite specific code paths in the current codebase; M2/M3 are documented with exact wrong patterns and correct alternatives

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (stable project; no external dependencies changing)
