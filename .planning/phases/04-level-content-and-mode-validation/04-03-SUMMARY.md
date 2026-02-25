---
phase: 04-level-content-and-mode-validation
plan: "03"
subsystem: game-engine
tags: [typescript, game-engine, blackout-mode, reducer]

requires:
  - phase: 04-level-content-and-mode-validation
    plan: "01"
    provides: blackoutSecondsLeft in GameState and rushTime in Level type (prerequisites for this plan)

provides:
  - BLACKOUT_TICK action in GameAction union with pure reducer case
  - blackoutSecondsLeft initialized in createGameState (3 for blackout, 0 otherwise)
  - rushTime used (not timeLimit) for rushTimeLeft initialization in createGameState

affects:
  - 04-05 (GameScreen — replaces BLACKOUT_TRIGGER useEffect with BLACKOUT_TICK interval driver)
  - GameScreen.tsx (BLACKOUT_TRIGGER still exists for backward compatibility until Plan 05 cleanup)

tech-stack:
  added: []
  patterns:
    - "BLACKOUT_TICK is a pure reducer action — label-hide logic lives in engine, not useEffect"
    - "blackoutSecondsLeft countdown initialized in createGameState, decremented by BLACKOUT_TICK"
    - "Guard pattern: BLACKOUT_TICK returns state unchanged if status !== playing or countdown <= 0"

key-files:
  created: []
  modified:
    - src/game/engine.ts

key-decisions:
  - "BLACKOUT_TRIGGER action retained for backward compatibility — GameScreen.tsx still dispatches it; cleanup deferred to Plan 05"
  - "blackoutSecondsLeft placed after customerLeft in createGameState for logical mode grouping"
  - "labelsVisible: newCount > 0 is the exact transition — at newCount=0 labels hide, above 0 they remain visible"

patterns-established:
  - "Engine-driven mode behavior: state transitions for timed events belong in reducer cases, not useEffect setTimeout"
  - "Mode-conditional initialization: createGameState uses level.mode checks to set mode-specific fields"

requirements-completed: [MODE-02]

duration: 2min
completed: 2026-02-25
---

# Phase 4 Plan 3: Blackout Engine Fix Summary

**Added BLACKOUT_TICK pure reducer action and blackoutSecondsLeft initialization to engine.ts, eliminating the useEffect-driven label-hide race condition by moving the transition logic into the deterministic reducer**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-25T12:46:54Z
- **Completed:** 2026-02-25T12:48:55Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Renamed `level.timeLimit` to `level.rushTime` in `createGameState` — matches updated Level type from Plan 01
- Added `blackoutSecondsLeft: level.mode === 'blackout' ? 3 : 0` to `createGameState` return object
- Added `| { type: 'BLACKOUT_TICK' }` to the `GameAction` union type
- Added `BLACKOUT_TICK` reducer case: decrements `blackoutSecondsLeft` and sets `labelsVisible = newCount > 0` when countdown reaches zero
- Guard in `BLACKOUT_TICK`: returns state unchanged if `status !== 'playing'` or `blackoutSecondsLeft <= 0`

## Task Commits

1. **Task 1: Add BLACKOUT_TICK to engine and rename timeLimit to rushTime** — `94cc441` (feat)

**Plan metadata:** _(pending final commit)_

## Files Created/Modified

- `src/game/engine.ts` — BLACKOUT_TICK action + reducer case, blackoutSecondsLeft in createGameState, rushTime rename

## Decisions Made

- `BLACKOUT_TRIGGER` action retained: GameScreen.tsx still dispatches this; removing it now would cause a TypeScript error in GameScreen before Plan 05 replaces the useEffect. The old action is harmless (sets labelsVisible=false directly) and will be removed in Plan 05 cleanup.
- `blackoutSecondsLeft` placed after `customerLeft` in createGameState: groups mode-specific initialization near the end of the state object for readability

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. TypeScript compiled with zero errors after changes. The types.ts prerequisites (blackoutSecondsLeft in GameState, rushTime in Level) were already in place from Plan 01.

## User Setup Required

None.

## Next Phase Readiness

- Plan 05 (GameScreen wiring) can proceed immediately: engine has BLACKOUT_TICK, GameScreen needs to replace its BLACKOUT_TRIGGER useEffect with a BLACKOUT_TICK setInterval driver
- engine.ts is clean — zero TypeScript errors

## Self-Check: PASSED

- FOUND: src/game/engine.ts
- FOUND commit: 94cc441 (feat(04-03): add BLACKOUT_TICK to engine and rename timeLimit to rushTime)
- VERIFIED: BLACKOUT_TICK in union type (line 67) and reducer (line 254)
- VERIFIED: blackoutSecondsLeft in createGameState (line 53)
- VERIFIED: no timeLimit references in engine.ts

---
*Phase: 04-level-content-and-mode-validation*
*Completed: 2026-02-25*
