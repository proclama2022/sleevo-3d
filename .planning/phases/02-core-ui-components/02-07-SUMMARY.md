---
phase: 02-core-ui-components
plan: "02-07"
subsystem: ui

tags: [react, styled-components, hud, gamescren, theme-provider]

# Dependency graph
requires:
  - phase: 02-core-ui-components
    provides: HUD/HUD.tsx component (score, moves, circular progress gauge, optional timer)
  - phase: 02-core-ui-components
    provides: ThemeProvider from src/ui/ThemeProvider.tsx

provides:
  - GameScreen.tsx wired to render <HUD> as fixed top bar replacing infoRow InfoPanel blocks
  - App.tsx wrapped with ThemeProvider so all styled-components receive theme context
  - Transparent backdrop-blur HUD visible over game content with score (left), circular gauge (center), moves (right)

affects: [phase-03-micro-interactions, any future feature adding to GameScreen JSX]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Fixed HUD pattern: position:fixed top-0 component renders outside normal flex flow; parent needs padding-top offset"
    - "ThemeProvider must be root ancestor for all styled-components to receive theme props"

key-files:
  created: []
  modified:
    - src/App.tsx
    - src/components/GameScreen.tsx
    - src/components/GameScreen.module.css

key-decisions:
  - "Wrap App root with ThemeProvider so HUD styled-components receive theme without undefined errors"
  - "Set .screen padding-top to 72px (desktop) and max(72px, calc(env(safe-area-inset-top) + 60px)) (mobile) to prevent HUD from covering game content"
  - "Keep flat ProgressBar at bottom of screen alongside new circular HUD gauge — they serve different visual roles"
  - "Remove InfoPanel import entirely since it is no longer referenced in GameScreen.tsx"

patterns-established:
  - "HUD wiring pattern: compute progress from placedVinyls/total, compute hudTimeRemaining from rushTimeLeft, pass all as props"

requirements-completed: [COMP-03, COMP-04, A11Y-01]

# Metrics
duration: 5min
completed: 2026-02-20
---

# Phase 02 Plan 07: HUD Wiring Summary

**Transparent backdrop-blur HUD bar (score left, circular SVG progress gauge center, moves right) wired into GameScreen replacing orphaned InfoPanel infoRow — ThemeProvider added at App root**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-20T00:08:16Z
- **Completed:** 2026-02-20T00:13:00Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments

- `src/App.tsx` now wraps `<GameScreen>` in `<ThemeProvider>` — HUD styled-components receive theme tokens correctly
- `GameScreen.tsx` imports and renders `<HUD score moves progress timeRemaining>` as first element inside `.screen` div (before `<SceneBackdrop>`)
- Old `<div className={styles.infoRow}>` block (two InfoPanel components + hint button) removed; `InfoPanel` import removed
- `progress` computed from `Object.keys(state.placedVinyls).length / state.level.vinyls.length * 100`
- `hudTimeRemaining` set to `state.rushTimeLeft` only in rush mode; undefined otherwise
- `.screen` padding-top adjusted from 18px to 72px to prevent HUD from covering game content; mobile uses `max(72px, calc(env(safe-area-inset-top) + 60px))`

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace InfoPanel infoRow with HUD component in GameScreen** - `3592743` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified

- `src/App.tsx` — Added ThemeProvider import and wrapper around GameScreen
- `src/components/GameScreen.tsx` — Replaced InfoPanel infoRow with HUD component; added progress/hudTimeRemaining computed values
- `src/components/GameScreen.module.css` — Updated .screen padding-top from 18px to 72px; updated mobile safe-area padding

## Decisions Made

- ThemeProvider must sit at the App root, not inside GameScreen, to serve both current and any future styled-components in the tree
- Kept existing flat dot-style `<ProgressBar>` at bottom of screen — it shows placed count visually in a different location from the HUD circular gauge; removing it would reduce visual feedback
- Hint button (previously inside infoRow) removed along with the infoRow block; it can be re-added elsewhere in a future plan if needed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — TypeScript compiled clean on first attempt, build succeeded.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- HUD is fully wired and visible in the running app
- ThemeProvider is now properly wrapping the component tree
- Game content is not covered by the fixed HUD bar (padding adjusted)
- Ready to proceed to Phase 3: Micro-Interactions & Animation

---
*Phase: 02-core-ui-components*
*Completed: 2026-02-20*
