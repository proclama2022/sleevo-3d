# Phase 7: Level Select Score Display - Research

**Researched:** 2026-02-25
**Domain:** React component extension — inline LevelCell prop addition + CSS Module score row
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SELECT-01 | La cella di ogni livello mostra il punteggio migliore come "1.420 pt" sotto le stelle; mostra "--" se il livello non è mai stato completato | `loadAllProgress()` already called in LevelSelect render; `formatScore` utility already exists in `src/utils/index.ts`; `LevelProgress.bestScore?: number` already in storage interface |
</phase_requirements>

---

## Summary

Phase 7 adds best-score display to each `LevelCell` in `LevelSelect`. The entire change is additive: two files touched (`LevelSelect.tsx` and `LevelSelect.module.css`), no new dependencies, no new files.

The storage layer (Phase 5) already provides `bestScore?: number` on `LevelProgress`, and `loadAllProgress()` is already called synchronously at the top of the `LevelSelect` render function. The `formatScore` utility (Phase 5) is already exported from `src/utils/index.ts` and returns `'—'` for `undefined`, making the "never completed" state automatic. The planner need only add one optional `bestScore` prop to `CellProps`, pass it from `LevelSelect`, render it conditionally in `LevelCell` (hidden for locked cells), and add one CSS class for the score row.

**Primary recommendation:** Add `bestScore?: number` to `CellProps`, pass `p?.bestScore` from the `LevelSelect` map loop, render a `<span className={styles.score}>{formatScore(bestScore)}</span>` inside `LevelCell` only when `unlocked` is true, and add a `.score` CSS class matching the existing small-text style conventions.

---

## Standard Stack

### Core (already in project — no additions needed)

| Library / API | Version | Purpose | Why Standard |
|---------------|---------|---------|--------------|
| React (inline component extension) | 19.2.4 | Add prop to existing `LevelCell` inline component | Project standard; `LevelCell` is not a separate file |
| `loadAllProgress()` | existing | Synchronous progress read already called in `LevelSelect` render | Established pattern — one call covers all cells |
| `formatScore` | src/utils/formatScore.ts | Italian-locale score formatting, em dash for undefined | Created in Phase 5 exactly for this use case |
| CSS Modules | Vite built-in | `.score` style class for score row | Project-wide styling standard |

### No New Dependencies

No packages to install. The feature is entirely covered by existing project infrastructure.

---

## Architecture Patterns

### Recommended File Structure (no new files)

```
src/components/LevelSelect/
├── LevelSelect.tsx         <- MODIFY: add bestScore prop, pass it, render it
└── LevelSelect.module.css  <- MODIFY: add .score class
```

### Pattern 1: Extend CellProps with optional bestScore

**What:** Add `bestScore?: number` to the existing `CellProps` interface in `LevelSelect.tsx`.
**When to use:** Whenever an inline component needs new optional data from the parent's data fetch.

```typescript
// Current CellProps (lines 11-18, LevelSelect.tsx)
interface CellProps {
  levelNumber: number;
  bestStars: number;
  unlocked: boolean;
  focused: boolean;
  onClick: () => void;
  cellRef?: React.Ref<HTMLButtonElement>;
}

// After change
interface CellProps {
  levelNumber: number;
  bestStars: number;
  bestScore?: number;        // ADD: undefined means never completed
  unlocked: boolean;
  focused: boolean;
  onClick: () => void;
  cellRef?: React.Ref<HTMLButtonElement>;
}
```

### Pattern 2: Pass bestScore from loadAllProgress (already in render)

**What:** The `progress` object from `loadAllProgress()` is already available in the map loop as `p = progress[level.id]`. Destructure `bestScore` from `p`.
**When to use:** No additional storage reads — reuse the single synchronous call.

```typescript
// Current map loop (lines 63-79, LevelSelect.tsx)
{LEVELS.map((level, index) => {
  const p = progress[level.id];
  const bestStars = p?.stars ?? 0;
  const unlocked = isLevelUnlocked(index, LEVELS);
  const isFocused = index === currentFocusIndex;

  return (
    <LevelCell
      key={level.id}
      levelNumber={index + 1}
      bestStars={bestStars}
      unlocked={unlocked}
      focused={isFocused}
      onClick={() => onSelectLevel(index)}
      cellRef={isFocused ? focusedCellRef : undefined}
    />
  );
})}

// After change — add bestScore extraction and prop
{LEVELS.map((level, index) => {
  const p = progress[level.id];
  const bestStars = p?.stars ?? 0;
  const bestScore = p?.bestScore;              // ADD: undefined if never completed
  const unlocked = isLevelUnlocked(index, LEVELS);
  const isFocused = index === currentFocusIndex;

  return (
    <LevelCell
      key={level.id}
      levelNumber={index + 1}
      bestStars={bestStars}
      bestScore={bestScore}                    // ADD
      unlocked={unlocked}
      focused={isFocused}
      onClick={() => onSelectLevel(index)}
      cellRef={isFocused ? focusedCellRef : undefined}
    />
  );
})}
```

### Pattern 3: Conditional score row in LevelCell — hidden for locked cells

**What:** Render the score row only when `unlocked` is true. Use `formatScore(bestScore)` which returns `'—'` for undefined.
**When to use:** Locked cells must show nothing — not "—", not "0 pt".

```typescript
// Import at top of file
import { formatScore } from '../../utils';

// Inside LevelCell function — after the stars div, before lock span
function LevelCell({ levelNumber, bestStars, bestScore, unlocked, focused, onClick, cellRef }: CellProps) {
  return (
    <button ...>
      <span className={styles.number}>{levelNumber}</span>
      <div className={styles.stars}>
        {[1, 2, 3].map(n => (
          <span key={n} className={`${styles.star} ${n <= bestStars ? styles.starFilled : styles.starEmpty}`}>
            ★
          </span>
        ))}
      </div>
      {unlocked && (                           // ADD: only render for unlocked cells
        <span className={styles.score}>{formatScore(bestScore)}</span>
      )}
      {!unlocked && <span className={styles.lock}>🔒</span>}
    </button>
  );
}
```

### Pattern 4: .score CSS class

**What:** A small, muted text style for the score row. Matches the existing small-text conventions in the file (`font-size: 11px`, muted amber color).

```css
/* Add to LevelSelect.module.css */
.score {
  font-size: 10px;
  color: rgba(255, 200, 120, 0.6);
  line-height: 1;
  letter-spacing: 0.02em;
}
```

**Sizing note:** The cell currently uses `aspect-ratio: 1` with `flex-direction: column` and `justify-content: center`. The score row adds height — verify the cell doesn't overflow on small devices. Use `font-size: 10px` (smaller than the `.hint` at 11px) to minimize height impact. If needed, reduce the `gap` on `.cell` from `4px` to `2px` when all four rows are present.

### Anti-Patterns to Avoid

- **Inline `toLocaleString()` in LevelCell:** Always import `formatScore` from `src/utils`. Never call `toLocaleString('it-IT')` at the call site — formatting divergence is the documented M4 pitfall.
- **Rendering score on locked cells:** Do not render the score span when `unlocked === false`. The lock icon and 0.38 opacity already communicate the locked state; a "—" score row would be visual noise and is explicitly listed as an anti-feature in project research.
- **Additional `loadAllProgress()` call inside LevelCell:** Never read storage inside the cell. The parent already has the full progress map; pass the scalar value as a prop.
- **Hardcoding "—" in JSX:** Do not write `bestScore !== undefined ? formatScore(bestScore) : '—'` — `formatScore(undefined)` already returns `'—'`. Use the utility directly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Score formatting | Inline `toLocaleString`, template literals | `formatScore` from `src/utils` | Single source of truth; returns correct em dash for undefined; hardcodes `it-IT` locale; already tested in Phase 5 |
| Progress data read | Extra `getLevelProgress(level.id)` call inside cell | `p?.bestScore` from the existing `loadAllProgress()` result | One synchronous read per render already covers all cells; N extra reads per render is wasteful |

---

## Common Pitfalls

### Pitfall 1: Rendering score on locked cells

**What goes wrong:** A locked cell shows "—" (em dash) from `formatScore(undefined)`, making it look like an unplayed unlocked level rather than a locked level.
**Why it happens:** Forgetting the `unlocked` guard and rendering the score span unconditionally.
**How to avoid:** Wrap the score span in `{unlocked && (...)}`.
**Warning signs:** During manual testing, locked cells show the "—" character below the lock emoji.

### Pitfall 2: Score row causes cell height overflow

**What goes wrong:** The cell's `aspect-ratio: 1` constraint clips the score row, or the cell becomes visibly taller than square on small viewports.
**Why it happens:** Adding a fourth row (number + stars + score + lock) to a cell that was sized for three.
**How to avoid:** Use `font-size: 10px` for the score row. If the cell feels cramped, reduce `.cell` gap from `4px` to `2px`. Do not remove `aspect-ratio: 1` — it is the grid's layout contract.
**Warning signs:** Score text is visually clipped or cells appear rectangular instead of square.

### Pitfall 3: Import path error

**What goes wrong:** `formatScore` is imported directly from `../../utils/formatScore` instead of `../../utils`.
**Why it happens:** Forgetting that `src/utils/index.ts` re-exports it.
**How to avoid:** Always import from `../../utils` (the barrel). This is consistent with how other utilities are consumed throughout the project.

---

## Code Examples

### Complete LevelCell after change

```typescript
// Source: direct codebase inspection — LevelSelect.tsx + formatScore.ts
import { formatScore } from '../../utils';

interface CellProps {
  levelNumber: number;
  bestStars: number;
  bestScore?: number;
  unlocked: boolean;
  focused: boolean;
  onClick: () => void;
  cellRef?: React.Ref<HTMLButtonElement>;
}

function LevelCell({ levelNumber, bestStars, bestScore, unlocked, focused, onClick, cellRef }: CellProps) {
  return (
    <button
      ref={cellRef}
      className={styles.cell}
      data-unlocked={String(unlocked)}
      data-focused={String(focused)}
      disabled={!unlocked}
      aria-label={`Livello ${levelNumber}${!unlocked ? ', bloccato' : ''}`}
      onClick={onClick}
    >
      <span className={styles.number}>{levelNumber}</span>
      <div className={styles.stars}>
        {[1, 2, 3].map(n => (
          <span
            key={n}
            className={`${styles.star} ${n <= bestStars ? styles.starFilled : styles.starEmpty}`}
          >
            ★
          </span>
        ))}
      </div>
      {unlocked && (
        <span className={styles.score}>{formatScore(bestScore)}</span>
      )}
      {!unlocked && <span className={styles.lock}>🔒</span>}
    </button>
  );
}
```

### formatScore behavior (Phase 5 utility — confirmed)

```typescript
// Source: src/utils/formatScore.ts (Phase 5)
formatScore(1420)     // → "1.420 pt"
formatScore(0)        // → "0 pt"   (valid score of zero)
formatScore(undefined)// → "—"      (level never completed)
formatScore(null)     // → "—"      (defensive)
```

### CSS score class

```css
/* Source: LevelSelect.module.css — convention match for small muted text */
.score {
  font-size: 10px;
  color: rgba(255, 200, 120, 0.6);
  line-height: 1;
  letter-spacing: 0.02em;
}
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| No score on LevelCell | "X.XXX pt" below stars (unlocked + completed) or "—" (unlocked + never completed) | Phase 7 introduces this |
| `LevelProgress` had `stars` and `bestTime?` only | Now has `bestScore?: number` (Phase 5) | Already implemented |
| No `formatScore` utility | Shared utility in `src/utils/formatScore.ts` (Phase 5) | Already implemented |

---

## Open Questions

None — all integration points are confirmed by direct codebase inspection. The dependency (Phase 5) is complete. No ambiguities remain.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)

- `src/components/LevelSelect/LevelSelect.tsx` — exact current `CellProps` interface, `LevelCell` function body, map loop, `loadAllProgress()` call pattern
- `src/components/LevelSelect/LevelSelect.module.css` — exact current style classes and values, cell layout constraints
- `src/game/storage.ts` — `LevelProgress` interface with `bestScore?: number`, `loadAllProgress()` signature
- `src/utils/formatScore.ts` — function signature, return values for `undefined`, `null`, and numeric inputs
- `src/utils/index.ts` — confirms `export * from './formatScore'` re-export is in place
- `.planning/phases/05-storage-and-score-utility/05-01-SUMMARY.md` — confirms Phase 5 complete, all artifacts verified
- `.planning/research/SUMMARY.md` — locked architectural decisions, confirmed anti-features

### Secondary (HIGH confidence — locked project decisions)

- `.planning/STATE.md` decisions log — formatScore returns em dash for undefined; locked cells show no score; `loadAllProgress()` is one-read-all pattern

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies exist in codebase; confirmed by reading actual source files
- Architecture: HIGH — `LevelSelect.tsx` read in full; change scope is exactly two files, two additions each
- Pitfalls: HIGH — grounded in actual cell layout constraints and project research decisions

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (stable — no external dependencies)
