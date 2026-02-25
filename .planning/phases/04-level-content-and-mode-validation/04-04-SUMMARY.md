---
phase: 04-level-content-and-mode-validation
plan: "04"
subsystem: ui
tags: [react, typescript, customer-panel, hud, rush-mode]

requires:
  - phase: 04-level-content-and-mode-validation
    provides: Level interface with customerName field and GameState with blackoutSecondsLeft (from 04-01)

provides:
  - CustomerPanel component with customerName prop using null-coalescing fallback
  - HUD rush urgency threshold corrected to 10 seconds

affects:
  - 04-05 (GameScreen wiring — CustomerPanel will receive customerName from level definition)

tech-stack:
  added: []
  patterns:
    - "customerName ?? 'Il cliente' null-coalescing fallback for optional customer name display"
    - "Rush urgency fires at <= 10s (not < 30s) — matches CONTEXT decision"

key-files:
  created: []
  modified:
    - src/components/CustomerPanel.tsx
    - src/components/HUD/HUD.tsx

key-decisions:
  - "Speech text changed from 'Cerco qualcosa di...' to '{name} vuole:...' to match customer mode design spec"
  - "isLowTime uses <= 10 (inclusive) so urgency fires exactly when 10 seconds show on clock"

patterns-established:
  - "CustomerPanel's customerName is optional — all existing callers without the prop continue to show 'Il cliente vuole:' without modification"

requirements-completed: [MODE-01, MODE-03]

duration: 2min
completed: 2026-02-25
---

# Phase 4 Plan 4: CustomerPanel Name and HUD Urgency Threshold Summary

**CustomerPanel now renders "{name} vuole: Jazz degli anni '70" using customerName prop with fallback, and HUD urgency pulse fires at <= 10 seconds (corrected from < 30)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-25T12:46:56Z
- **Completed:** 2026-02-25T15:38:19Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `customerName?: string` to CustomerPanel Props interface and component signature
- Speech render updated from generic "Cerco qualcosa di..." to `{customerName ?? 'Il cliente'} vuole: ...`
- HUD `isLowTime` threshold corrected from `< 30` to `<= 10` (one-line fix)
- Both files compile with zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Add customerName prop to CustomerPanel** - `cfe9ad9` (feat)
2. **Task 2: Fix rush urgency threshold in HUD.tsx** - `95f7857` (fix)

**Plan metadata:** _(pending final commit)_

## Files Created/Modified

- `src/components/CustomerPanel.tsx` - Added `customerName?: string` to Props, updated speech text with null-coalescing fallback
- `src/components/HUD/HUD.tsx` - Changed `isLowTime` threshold from `< 30` to `<= 10`

## Decisions Made

- Speech text updated from `"Cerco qualcosa di {genre} degli {eraLabel}..."` to `"{customerName ?? 'Il cliente'} vuole: {genre} degli {eraLabel}"` to align with the CONTEXT design spec ("Marco vuole: Jazz degli anni '70" format)
- Used `<= 10` (inclusive) for the urgency threshold so it fires precisely when the clock reads "10" — matches user-visible behavior expectation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- CustomerPanel is ready to receive `customerName` from `state.level.customerName` when GameScreen passes it through (Plan 05 wiring)
- HUD urgency behavior is now correct for all rush levels — no further threshold changes needed
- Both files have zero TypeScript errors

## Self-Check: PASSED

- FOUND: src/components/CustomerPanel.tsx
- FOUND: src/components/HUD/HUD.tsx
- FOUND: .planning/phases/04-level-content-and-mode-validation/04-04-SUMMARY.md

---
*Phase: 04-level-content-and-mode-validation*
*Completed: 2026-02-25*
