---
phase: 04-level-content-and-mode-validation
plan: "05"
subsystem: ui
tags: [react, typescript, gamescreen, overlay, blackout-mode, customer-panel]

# Dependency graph
requires:
  - phase: 04-level-content-and-mode-validation
    plan: "02"
    provides: LevelHintOverlay component with hint, mode, onDismiss props
  - phase: 04-level-content-and-mode-validation
    plan: "03"
    provides: BLACKOUT_TICK action in engine.ts and blackoutSecondsLeft in GameState
  - phase: 04-level-content-and-mode-validation
    plan: "04"
    provides: CustomerPanel customerName prop with null-coalescing fallback

provides:
  - LevelHintOverlay wired into GameScreen — shown on every level load and restart
  - showHintOverlay state with dual reset (level.id useEffect + handleRestart callback)
  - BLACKOUT_TICK setInterval useEffect replacing old BLACKOUT_TRIGGER setTimeout (flicker bug eliminated)
  - CustomerPanel receives customerName from state.level.customerName

affects:
  - Phase 4 complete — all mode behavior fixes integrated into GameScreen

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "showHintOverlay boolean gate: resets on state.level.id change (NEXT_LEVEL) AND in handleRestart callback (RESTART same level.id)"
    - "BLACKOUT_TICK interval driver: early return guards replace conditional body — cleaner separation of concerns"
    - "customerName passed from game state level into UI component via JSX prop"

key-files:
  created: []
  modified:
    - src/components/GameScreen.tsx

key-decisions:
  - "LevelHintOverlay rendered after HUD, before SceneBackdrop — covers gameplay area at z-index 200 without competing with drag ghost (z-index 1000)"
  - "showHintOverlay reset in BOTH useEffect([state.level.id]) AND handleRestart — useEffect alone misses same-level restarts"
  - "BLACKOUT_TRIGGER action retained in engine.ts as dead code — removal not in scope; causes no TypeScript errors"
  - "BLACKOUT_TICK useEffect dependency array includes blackoutSecondsLeft: interval stops naturally when count reaches 0"

patterns-established:
  - "Pattern: Pre-level overlay gate resets on BOTH level change (useEffect) and restart (callback) — use both reset paths for any 'show on level start' feature"
  - "Pattern: Engine-driven timer intervals — useEffect only drives clock tick, engine reducer handles state transitions"

requirements-completed: [LVLS-04, MODE-01, MODE-02, MODE-03, MODE-04]

# Metrics
duration: 3min
completed: 2026-02-25
---

# Phase 4 Plan 05: GameScreen Integration Summary

**LevelHintOverlay, BLACKOUT_TICK interval driver, and customerName wired into GameScreen — Phase 4 mode behaviors fully integrated with flicker bug eliminated**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-25T15:52:21Z
- **Completed:** 2026-02-25T15:55:23Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Imported and rendered `LevelHintOverlay` in GameScreen JSX conditioned on `showHintOverlay && state.status === 'playing'`
- `showHintOverlay` useState initialized to `true`, reset on `state.level.id` change (NEXT_LEVEL) and in `handleRestart` (RESTART)
- Removed old blackout `useEffect` that dispatched `BLACKOUT_TRIGGER` via `setTimeout` after 3000ms — source of the flicker race condition
- Added `BLACKOUT_TICK` `setInterval` useEffect with correct guard conditions — label-hide logic now fully in the pure engine reducer
- Added `customerName={state.level.customerName}` prop to CustomerPanel JSX

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire LevelHintOverlay into GameScreen** - `fa9189a` (feat)
2. **Task 2: Replace BLACKOUT_TRIGGER useEffect with BLACKOUT_TICK interval and wire customerName** - `3e87f2a` (feat)

**Plan metadata:** _(pending final commit)_

## Files Created/Modified
- `src/components/GameScreen.tsx` — Added LevelHintOverlay import + showHintOverlay state + dual reset logic + JSX render; replaced old blackout setTimeout useEffect with BLACKOUT_TICK setInterval; added customerName prop to CustomerPanel JSX

## Decisions Made
- `LevelHintOverlay` placed immediately after the HUD section in JSX so it appears above the gameplay area. Position fixed in the overlay CSS (z-index 200) ensures it covers the screen regardless of JSX insertion point.
- The BLACKOUT_TICK useEffect uses an early-return guard pattern (`if (... conditions not met) return;`) rather than a conditional body — matches the existing RUSH_TICK pattern in GameScreen and avoids nested conditional depth.
- `state.level.customerName` used directly (not `level.customerName`) for consistency with the `state.level.hint` pattern used in the LevelHintOverlay render just above.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. TypeScript compiled with zero errors. Full production build succeeded.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All Phase 4 mode behavior changes are integrated into GameScreen
- LevelHintOverlay is live: shown on every level start and restart, dismissed by player action
- Blackout mode: labels now hide deterministically via engine reducer — flicker bug eliminated
- Customer mode: customer name displayed in CustomerPanel for all levels that have customerName defined
- Full build passes: `npm run build` succeeds with zero errors
- No blockers for Phase 4 completion

---
*Phase: 04-level-content-and-mode-validation*
*Completed: 2026-02-25*

## Self-Check: PASSED

- FOUND: src/components/GameScreen.tsx
- FOUND: .planning/phases/04-level-content-and-mode-validation/04-05-SUMMARY.md
- FOUND commit: fa9189a (feat(04-05): wire LevelHintOverlay into GameScreen)
- FOUND commit: 3e87f2a (feat(04-05): replace BLACKOUT_TRIGGER useEffect with BLACKOUT_TICK interval and wire customerName)
- VERIFIED: LevelHintOverlay import + showHintOverlay state + JSX render (4 lines in GameScreen)
- VERIFIED: BLACKOUT_TICK setInterval at line 204 — no BLACKOUT_TRIGGER or blackout setTimeout remains
- VERIFIED: customerName={state.level.customerName} in CustomerPanel JSX at line 666
- VERIFIED: TypeScript zero errors, npm run build succeeds
