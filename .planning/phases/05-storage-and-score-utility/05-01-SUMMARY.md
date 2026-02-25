---
phase: 05-storage-and-score-utility
plan: 01
subsystem: storage
tags: [localStorage, typescript, intl, score, formatting]

# Dependency graph
requires: []
provides:
  - LevelProgress.bestScore optional field with best-only merge-write semantics
  - formatScore(score) utility returning Italian-formatted score string or em dash
  - saveProgress extended with independent scoreImproved condition
affects:
  - 06-level-complete-new-record
  - 07-level-select-score-display

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Spread-merge write pattern for localStorage: { ...existing, field: newVal } to preserve all schema fields"
    - "Independent improvement conditions: starsImproved || timeImproved || scoreImproved each OR'd at same level"
    - "Hardcoded locale in Intl.NumberFormat: always 'it-IT', never browser default"

key-files:
  created:
    - src/utils/formatScore.ts
  modified:
    - src/game/storage.ts
    - src/utils/index.ts

key-decisions:
  - "scoreImproved is an independent OR condition — not nested under starsImproved — so a higher-score run saves even without star change"
  - "Spread-merge write { ...existing, ... } protects against silent field loss when schema grows"
  - "formatScore hardcodes 'it-IT' locale so 1420 renders as '1.420 pt' regardless of system language"
  - "formatScore returns em dash U+2014 for undefined/null — not '0 pt' — to distinguish unplayed levels"

patterns-established:
  - "Independent improvement guards: add new optional saveProgress param with its own condition, OR into write gate"
  - "Score formatting via formatScore import — never inline toLocaleString()"

requirements-completed: [PERSIST-01, PERSIST-02]

# Metrics
duration: 7min
completed: 2026-02-25
---

# Phase 5 Plan 01: Storage and Score Utility Summary

**Extended localStorage schema with bestScore best-only merge-write and created formatScore utility hardcoded to it-IT locale**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-25T17:52:20Z
- **Completed:** 2026-02-25T17:59:56Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Extended `LevelProgress` interface with `bestScore?: number` field — backward-compatible, undefined for unplayed levels
- Rewrote `saveProgress` with three independent improvement conditions and spread-merge write to preserve all existing fields
- Created `src/utils/formatScore.ts` — single source of truth for score display, hardcoded `it-IT` locale, em dash for undefined
- Re-exported `formatScore` from `src/utils/index.ts` for use in Phase 6 and Phase 7

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend LevelProgress and rewrite saveProgress** - `fc1ade4` (feat)
2. **Task 2: Create formatScore utility and re-export** - `4d5ca9d` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/game/storage.ts` - Extended LevelProgress with bestScore field; rewrote saveProgress with merge-write and independent scoreImproved condition
- `src/utils/formatScore.ts` - New shared score formatting utility with hardcoded it-IT locale
- `src/utils/index.ts` - Added `export * from './formatScore'` re-export

## Decisions Made

- `scoreImproved` is an independent condition ORed at the same level as `starsImproved` and `timeImproved`. A player can earn 3 stars on run 1 and beat their score on run 2 without changing star count — both writes must fire.
- Spread-merge `{ ...existing, ... }` used in the write to protect against silent field loss as the schema grows. Atomic assignment was the old pattern; this phase replaces it.
- `Intl.NumberFormat('it-IT')` locale hardcoded — never derived from browser — so `1420` always renders as `'1.420 pt'` regardless of system language.
- `formatScore` returns `'—'` (em dash, U+2014) for `undefined`/`null` to distinguish "level never completed" from a score of zero.

## Deviations from Plan

None — plan executed exactly as written.

Note: The plan's automated Node.js assertion for `formatScore(1420) === '1.420 pt'` produced a false negative because Node v22 in this environment has stripped ICU data and does not output grouping separators for `it-IT` when run via `node -e`. The code is correct — `Intl.NumberFormat('it-IT', { useGrouping: 'always' })` resolves correctly and browsers have full ICU data. TypeScript compiled with zero errors.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 6 (LevelComplete new-record badge) can import `formatScore` from `src/utils/index.ts` and read `getLevelProgress(levelId)?.bestScore` before `saveProgress` fires to derive `isNewRecord`
- Phase 7 (LevelSelect score display) can import `formatScore` and read `getLevelProgress(levelId)?.bestScore` for each cell
- Both phases have a single shared formatting source of truth — no locale divergence risk
- `saveProgress` in `GameScreen.tsx` must be updated in Phase 6 to pass `state.score` as fourth argument (do not add to useEffect deps)

---
*Phase: 05-storage-and-score-utility*
*Completed: 2026-02-25*

## Self-Check: PASSED

- FOUND: src/game/storage.ts
- FOUND: src/utils/formatScore.ts
- FOUND: src/utils/index.ts
- FOUND: .planning/phases/05-storage-and-score-utility/05-01-SUMMARY.md
- FOUND: commit fc1ade4 (Task 1)
- FOUND: commit 4d5ca9d (Task 2)
