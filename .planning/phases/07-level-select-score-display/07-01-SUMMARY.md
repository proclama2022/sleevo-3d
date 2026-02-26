---
phase: 07-level-select-score-display
plan: 01
subsystem: ui
tags: [react, css-modules, localstorage, formatScore, level-select]

# Dependency graph
requires:
  - phase: 05-storage-and-score-utility
    provides: formatScore utility and bestScore field in LevelProgress localStorage schema
provides:
  - LevelCell bestScore prop with conditional score row rendering
  - .score CSS class (10px, amber 0.6 opacity) for score display in level cells
affects: [any future UI consuming LevelCell or the level select grid]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "unlocked && guard: score row rendered only for unlocked cells — locked cells show nothing"
    - "formatScore barrel import from ../../utils (not direct path)"
    - "Parent-owned data: LevelSelect reads loadAllProgress() once and passes bestScore down; LevelCell does not fetch"

key-files:
  created: []
  modified:
    - src/components/LevelSelect/LevelSelect.tsx
    - src/components/LevelSelect/LevelSelect.module.css

key-decisions:
  - "Score span gated on unlocked && — locked cells must show nothing, not an em dash"
  - "formatScore(bestScore) called directly — it already returns em dash for undefined, no ternary needed"
  - "gap reduced 4px→2px on .cell to prevent score row overflowing aspect-ratio: 1 constraint"
  - "font-size: 10px for .score — smaller than .hint (11px) to minimise height impact inside the square cell"

patterns-established:
  - "LevelCell: optional prop pattern — bestScore?: number passed from parent, never fetched internally"

requirements-completed: [SELECT-01]

# Metrics
duration: ~20min
completed: 2026-02-26
---

# Phase 7 Plan 01: Level Select Score Display Summary

**bestScore prop added to LevelCell with conditional score row: unlocked-completed cells show "X.XXX pt", unlocked-never-completed show "—", locked cells show nothing**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-02-26
- **Completed:** 2026-02-26
- **Tasks:** 2 (1 auto + 1 human-verify checkpoint)
- **Files modified:** 2

## Accomplishments

- Extended `CellProps` interface with `bestScore?: number` and destructured it into `LevelCell`
- Added `{unlocked && <span className={styles.score}>{formatScore(bestScore)}</span>}` — correctly absent on locked cells
- Added `.score` CSS class (10px, amber 0.6 opacity, letter-spacing 0.02em) and reduced `.cell` gap from 4px to 2px to preserve square aspect-ratio
- Human verification passed: completed cells show "X.XXX pt" with Italian dot separator, unlocked-never-completed show "—", locked show lock emoji only, layout remains square

## Task Commits

Each task was committed atomically:

1. **Task 1: Add bestScore prop and score row to LevelCell** - `6db4141` (feat)
2. **Task 2: Human verify score display in level select grid** - checkpoint approved, no additional commit

**Plan metadata:** _(committed below as docs commit)_

## Files Created/Modified

- `src/components/LevelSelect/LevelSelect.tsx` — Added `formatScore` import from `../../utils` barrel, `bestScore?: number` to `CellProps`, destructured prop in `LevelCell`, `{unlocked && ...}` score span, `bestScore = p?.bestScore` in map loop
- `src/components/LevelSelect/LevelSelect.module.css` — `.cell` gap reduced 4px→2px; `.score` class added at end of file

## Decisions Made

- Used `{unlocked && (...)}` guard rather than a separate locked-state check — a single truthy condition is cleaner and matches existing `{!unlocked && <span>🔒</span>}` sibling pattern.
- Called `formatScore(bestScore)` directly without a ternary — the utility already returns U+2014 em dash for `undefined`, so duplicating that logic in the render would be redundant and fragile.
- Gap reduced to 2px (not removed entirely) to preserve visual breathing room between number, stars, and score rows.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- v1.1 milestone goal is complete: best score is visible in the level select grid and celebrated at level complete
- Phase 7 (Level Select Score Display) is the final v1.1 plan — milestone "Social & Retention" is now fully shipped
- No blockers for future work

## Self-Check: PASSED

- `src/components/LevelSelect/LevelSelect.tsx` — FOUND
- `src/components/LevelSelect/LevelSelect.module.css` — FOUND
- Commit `6db4141` — FOUND

---
*Phase: 07-level-select-score-display*
*Completed: 2026-02-26*
