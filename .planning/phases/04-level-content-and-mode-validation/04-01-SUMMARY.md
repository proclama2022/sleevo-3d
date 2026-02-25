---
phase: 04-level-content-and-mode-validation
plan: "01"
subsystem: ui
tags: [typescript, game-types, levels, content]

requires:
  - phase: 03-progression-and-navigation
    provides: GameState and Level types used as the foundation for all type changes

provides:
  - Level interface with rushTime (renamed from timeLimit) and customerName fields
  - GameState with blackoutSecondsLeft for engine-driven blackout countdown
  - 21 validated level definitions with customerName on all 5 customer-mode levels
  - Level 1 reduced to 4 vinyls with beginner-friendly parTime of 15s

affects:
  - 04-02 (engine fix plan — needs rushTime and blackoutSecondsLeft from types)
  - 04-03 (UI components — CustomerPanel needs customerName from Level)
  - All plans referencing Level or GameState interfaces

tech-stack:
  added: []
  patterns:
    - "rushTime field on Level (not timeLimit) is canonical name for rush mode countdown"
    - "customerName on Level is the source of truth for customer display name"
    - "blackoutSecondsLeft in GameState enables engine-driven blackout (not useEffect-driven)"

key-files:
  created: []
  modified:
    - src/game/types.ts
    - src/game/levels.ts

key-decisions:
  - "Remove timeLimit from blackout levels 5 and 13 — these were unused artifacts; blackout timing handled by engine blackoutSecondsLeft countdown"
  - "Level 1 parTime set to 15s (not formula 4×3=12) for more comfortable beginner experience"
  - "customerName added after mode field in Level interface for logical grouping with customer-mode fields"

patterns-established:
  - "Level type changes must be mirrored in all 21 level definitions in levels.ts before plan completes"
  - "Engine-level fields (blackoutSecondsLeft) defined in types.ts before engine.ts implements them — type-first approach"

requirements-completed: [LVLS-01, LVLS-02, LVLS-03, LVLS-04]

duration: 4min
completed: 2026-02-25
---

# Phase 4 Plan 1: Level Types and Content Foundation Summary

**Renamed timeLimit to rushTime in Level type, added customerName and blackoutSecondsLeft, fixed level 1 to 4 vinyls, and added Italian customer names to all 5 customer-mode levels across 21 level definitions**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-25T12:36:52Z
- **Completed:** 2026-02-25T12:41:11Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Updated Level interface: `timeLimit` renamed to `rushTime`, `customerName?: string` added after `hint`
- Updated GameState interface: `blackoutSecondsLeft: number` added to blackout mode section
- Updated all 5 rush levels (8, 14, 17) to use `rushTime` field
- Removed stale `timeLimit` field from blackout levels 5 and 13
- Added Italian customer names to all 5 customer-mode levels: Marco (4), Sofia (7), Luca (12), Elena (16), Giovanni (20)
- Reduced level 1 from 6 vinyls to 4, updated parTime from 18 to 15 seconds

## Task Commits

Each task was committed atomically:

1. **Task 1: Update Level interface and GameState in types.ts** - `4864e1a` (feat)
2. **Task 2: Update levels.ts — rename timeLimit, add customerName, fix level 1 count** - `7f08cc9` (feat)

**Plan metadata:** _(pending final commit)_

## Files Created/Modified

- `src/game/types.ts` - Level interface (rushTime, customerName), GameState (blackoutSecondsLeft)
- `src/game/levels.ts` - All 21 levels updated: rushTime on rush levels, customerName on customer levels, level 1 at 4 vinyls

## Decisions Made

- `timeLimit` removed from blackout levels 5 and 13: these were unused artifacts from an unimplemented feature; the blackout countdown will be driven by `blackoutSecondsLeft` in the engine (Plan 03), not a level-defined field
- Level 1 parTime set to 15s: formula gives 12s (4×3×1.0) but 15s provides a more comfortable beginner par without being too generous
- `customerName` positioned after `hint` in the Level interface to keep customer-related fields logically grouped near `customerRequest`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. TypeScript errors remaining after Task 2 are in engine.ts only (referencing the old `timeLimit` field and missing `blackoutSecondsLeft` initialization) — these are expected and documented in the plan's success criteria as "fixed in Plan 03."

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `src/game/types.ts` type layer is clean and consistent — Plan 02 (engine fix) can proceed immediately
- engine.ts will have 2 TypeScript errors until Plan 03 updates it (`timeLimit` reference and missing `blackoutSecondsLeft`)
- All 21 level definitions valid against the new type; no TypeScript errors in levels.ts

## Self-Check: PASSED

- FOUND: src/game/types.ts
- FOUND: src/game/levels.ts
- FOUND: .planning/phases/04-level-content-and-mode-validation/04-01-SUMMARY.md
- FOUND commit: 4864e1a (feat(04-01): update Level interface and GameState in types.ts)
- FOUND commit: 7f08cc9 (feat(04-01): update levels.ts — rushTime, customerName, fix level 1 count)

---
*Phase: 04-level-content-and-mode-validation*
*Completed: 2026-02-25*
