---
phase: 04-level-content-and-mode-validation
plan: "02"
subsystem: ui
tags: [react, css-modules, typescript, overlay, game-ui]

# Dependency graph
requires:
  - phase: 04-level-content-and-mode-validation-01
    provides: Level type with hint field and LevelMode type definition
provides:
  - LevelHintOverlay component — full-screen pre-level hint gate with Inizia dismiss button
  - LevelHintOverlay CSS module — dark overlay (z-index 200), amber card, modeLabel, startButton styles
affects:
  - 04-05 (GameScreen wiring — imports and renders LevelHintOverlay)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS Modules overlay pattern: position fixed, inset 0, z-index 200, click-to-dismiss with stopPropagation on inner card"
    - "getModeLabel switch function mapping all 7 LevelMode values to Italian emoji + label strings"

key-files:
  created:
    - src/components/LevelHintOverlay.tsx
    - src/components/LevelHintOverlay.module.css
  modified: []

key-decisions:
  - "z-index 200 chosen: above shelf (5-8), above HUD (100), below drag ghost (1000) — overlay is dismissed before dragging starts so no conflict"
  - "getModeLabel covers all 7 LevelMode values inline — no external lookup table dependency"
  - "Overlay click dismisses; card uses stopPropagation to prevent unintended backdrop dismiss"
  - "Colors matched to game aesthetic: #2a1a10 card background (warm dark brown from game palette), #f59e0b amber border/modeLabel, #fbbf24 button hover"

patterns-established:
  - "Pattern: Full-screen overlay with backdrop click dismiss and inner card stopPropagation — use this for all modal-style overlays"

requirements-completed: [LVLS-04]

# Metrics
duration: 3min
completed: 2026-02-25
---

# Phase 4 Plan 02: LevelHintOverlay Component Summary

**Standalone pre-level hint gate overlay with Italian mode labels, amber card aesthetic, and dual dismiss (backdrop click + Inizia button)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-25T20:41:10Z
- **Completed:** 2026-02-25T20:44:30Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Created `LevelHintOverlay.tsx` — self-contained component with `hint`, `mode`, `onDismiss` props
- Created `LevelHintOverlay.module.css` — full-screen dark overlay with centered amber-bordered card
- `getModeLabel()` maps all 7 `LevelMode` values to Italian emoji labels (e.g. "🌑 Modalità Blackout")
- TypeScript compilation: zero errors referencing the new component

## Task Commits

Each task was committed atomically:

1. **Task 1: Create LevelHintOverlay component and CSS** - `bc77f42` (feat)

**Plan metadata:** _(to be added in final commit)_

## Files Created/Modified
- `src/components/LevelHintOverlay.tsx` — Pre-level hint overlay component; accepts hint, mode, onDismiss; exports LevelHintOverlay
- `src/components/LevelHintOverlay.module.css` — Overlay styles: fixed inset-0 backdrop z-index 200, warm dark card #2a1a10, amber border #f59e0b, startButton amber CTA

## Decisions Made
- z-index 200 is sufficient: overlay only exists before level play starts, so no conflict with drag ghost (z-index 1000)
- Card background `#2a1a10` chosen to match the warm dark brown of the game scene (from GameScreen.module.css background gradients)
- `getModeLabel` implemented as a plain switch function — not reusing HUD's `getLevelRuleDisplay` because the overlay needs full Italian mode names, not short badge labels
- Button uses `font-family: 'Barlow Condensed'` to match the global UI font from globals.css

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `LevelHintOverlay` is standalone and fully ready for import into `GameScreen.tsx`
- Plan 05 will wire `showHintOverlay` state into GameScreen and render `<LevelHintOverlay>` before the shelf
- No blockers

---
*Phase: 04-level-content-and-mode-validation*
*Completed: 2026-02-25*

## Self-Check: PASSED

- FOUND: src/components/LevelHintOverlay.tsx
- FOUND: src/components/LevelHintOverlay.module.css
- FOUND: .planning/phases/04-level-content-and-mode-validation/04-02-SUMMARY.md
- FOUND: commit bc77f42
