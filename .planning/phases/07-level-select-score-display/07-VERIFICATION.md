---
phase: 07-level-select-score-display
verified: 2026-02-26T12:00:00Z
status: passed
score: 4/4 must-haves verified
re_verification: false
---

# Phase 7: Level Select Score Display — Verification Report

**Phase Goal:** Players can compare their best scores across all levels at a glance from the level select grid
**Verified:** 2026-02-26
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Each completed level cell shows best score as "X.XXX pt" below the stars | VERIFIED | `{unlocked && <span className={styles.score}>{formatScore(bestScore)}</span>}` in LevelSelect.tsx line 45; `formatScore` returns `Intl.NumberFormat('it-IT').format(score) + ' pt'` |
| 2 | A level never completed shows "--" (em dash) in place of a score | VERIFIED | `bestScore` is `undefined` when `p?.bestScore` is absent (level never completed); `formatScore(undefined)` returns `'\u2014'` (U+2014 em dash); span is still rendered for unlocked cells |
| 3 | Locked level cells show no score value | VERIFIED | Score span is gated by `{unlocked && (...)}` (LevelSelect.tsx line 44); locked cells render only `{!unlocked && <span className={styles.lock}>🔒</span>}` |
| 4 | Score format matches Phase 5's formatScore utility (Italian thousand separator) | VERIFIED | `formatScore` imported from `../../utils` barrel (LevelSelect.tsx line 4); barrel exports from `./formatScore` (utils/index.ts line 3); utility uses `'it-IT'` locale unconditionally |

**Score:** 4/4 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/LevelSelect/LevelSelect.tsx` | LevelCell with bestScore prop and score row rendering | VERIFIED | 96 lines; `CellProps.bestScore?: number`; `{unlocked && <span className={styles.score}>{formatScore(bestScore)}</span>}`; `bestScore = p?.bestScore` in map loop |
| `src/components/LevelSelect/LevelSelect.module.css` | `.score` CSS class for score display | VERIFIED | 135 lines; `.score { font-size: 10px; color: rgba(255,200,120,0.6); line-height: 1; letter-spacing: 0.02em; }`; `.cell` gap reduced 4px→2px |
| `src/utils/formatScore.ts` | Italian thousand-separator formatter returning "X.XXX pt" or em dash | VERIFIED | 10 lines; `Intl.NumberFormat('it-IT')` hardcoded locale; returns `'\u2014'` for undefined/null; appends `' pt'` suffix |
| `src/utils/index.ts` | Barrel export of formatScore | VERIFIED | `export * from './formatScore'` present at line 3 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `LevelSelect.tsx` | `formatScore` utility | `import { formatScore } from '../../utils'` | WIRED | Import at line 4; called at line 45 as `formatScore(bestScore)` |
| `LevelSelect.tsx` | `loadAllProgress()` | `import { loadAllProgress, isLevelUnlocked } from '../../game/storage'` | WIRED | Import at line 2; called at line 53; `bestScore` extracted at line 71 from returned record |
| `game/storage.ts` | `LevelProgress.bestScore` | `bestScore?: number` field | WIRED | Field declared in `LevelProgress` interface (storage.ts line 8); written by `saveProgress` with best-only semantics (line 33); read by `loadAllProgress` (line 42) |
| `LevelCell` | rendered score span | `{unlocked && <span className={styles.score}>}` | WIRED | Conditional guard at line 44-46; spans only rendered for unlocked cells; `formatScore(bestScore)` handles both defined and undefined values |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SELECT-01 | 07-01-PLAN.md | Level cell shows best score as "1.420 pt" below stars; shows "--" if never completed | SATISFIED | `formatScore(bestScore)` renders in `.score` span for all unlocked cells; undefined bestScore returns em dash; locked cells excluded by `unlocked &&` guard |

---

### Anti-Patterns Found

No anti-patterns detected.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | None found | — | — |

Checked files:
- `src/components/LevelSelect/LevelSelect.tsx` — No TODOs, no placeholder returns, no empty handlers, no console.log
- `src/components/LevelSelect/LevelSelect.module.css` — Complete, substantive CSS
- `src/utils/formatScore.ts` — Real implementation using Intl.NumberFormat

---

### Commit Verification

| Commit | Status | Details |
|--------|--------|---------|
| `6db4141` | VERIFIED | `feat(07-01): add bestScore prop and score row to LevelCell` — modifies both LevelSelect.tsx (+8 lines) and LevelSelect.module.css (+8 lines) |

---

### Human Verification Required

None required. All four success criteria can be verified statically:

1. The score rendering path is unambiguous — `formatScore(bestScore)` with `bestScore = p?.bestScore` is the only code path for score display.
2. The locked-cell exclusion is a simple boolean guard (`unlocked &&`), not a conditional branch that could silently fail.
3. The `it-IT` locale is hardcoded in the utility, not derived from browser settings.

The human-verify checkpoint in the SUMMARY (Task 2) confirms visual layout was approved during development.

---

### Summary

Phase 7 achieved its goal. All four success criteria are satisfied by the implementation:

- **Completed levels** (`bestScore` is a number): `formatScore(1420)` returns `"1.420 pt"` using `Intl.NumberFormat('it-IT')`, rendered in a `.score` span below the stars row.
- **Never-completed levels** (`bestScore` is `undefined`): `formatScore(undefined)` returns the U+2014 em dash `"—"`, rendered in the same `.score` span (the cell is unlocked, so the guard passes).
- **Locked levels** (`unlocked === false`): the `{unlocked && (...)}` guard prevents any score span from rendering; only the lock emoji appears.
- **Italian format**: `formatScore` is imported from the Phase 5 utility via the `../../utils` barrel and uses `'it-IT'` unconditionally, matching the established formatting contract.

The implementation is minimal, correctly wired, and contains no stubs or placeholders.

---

_Verified: 2026-02-26_
_Verifier: Claude (gsd-verifier)_
