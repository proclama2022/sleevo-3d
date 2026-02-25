---
phase: 03-progression-and-navigation
plan: "02"
subsystem: ui
tags: [react, screen-router, navigation, level-select, localstorage]

requires:
  - phase: 03-progression-and-navigation
    plan: "01"
    provides: LevelSelect component with onSelectLevel and currentFocusIndex props

provides:
  - App.tsx screen router ('levelSelect' | 'playing' state)
  - findFirstIncompleteLevel() reading loadAllProgress synchronously
  - handleSelectLevel and handleReturnToSelect navigation handlers
  - GameScreen Props interface with initialLevelIndex and onReturnToSelect
  - LevelComplete 'Continue' wired to return to level select

affects:
  - 03-03 (LevelComplete button label change — 'Livello successivo' → 'Continua')

tech-stack:
  added: []
  patterns:
    - "Screen routing via useState<'levelSelect' | 'playing'> in App.tsx — no router library"
    - "findFirstIncompleteLevel() at module level (not inside component) for clean useState lazy initializer"
    - "Screen swap via conditional render — natural unmount/remount so useReducer lazy initializer re-runs on each level select"
    - "onReturnToSelect passed to GameScreen → forwarded to LevelComplete.onNextLevel replacing handleNext"

key-files:
  created: []
  modified:
    - src/App.tsx
    - src/components/GameScreen.tsx

key-decisions:
  - "findFirstIncompleteLevel defined at module level (not inside App component) to keep useState lazy initializer readable"
  - "handleReturnToSelect recomputes focus index via findFirstIncompleteLevel() so newly earned stars update the highlight"
  - "handleNext kept in GameScreen — still used by Controls.onNext prop; only LevelComplete wiring changed"
  - "LevelComplete onNextLevel replaced with onReturnToSelect — 'Continue' now always returns to level select, not auto-advance"

patterns-established:
  - "Pattern: lightweight screen router with useState string union in App.tsx"
  - "Pattern: level index computed from localStorage on App init and on return from gameplay"

requirements-completed: [PROG-01, PROG-02]

duration: 1min
completed: 2026-02-25
---

# Phase 3 Plan 02: App Router and GameScreen Props Summary

**Lightweight screen router in App.tsx with findFirstIncompleteLevel() and GameScreen initialLevelIndex prop wiring**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-25T10:32:11Z
- **Completed:** 2026-02-25T10:33:08Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- App.tsx rewritten as a 2-screen router: 'levelSelect' opens LevelSelect, 'playing' opens GameScreen at chosen level
- findFirstIncompleteLevel() reads loadAllProgress() synchronously, finds first level with < 3 stars (encourages 3-star perfection)
- handleReturnToSelect recomputes focus index on return so newly unlocked levels are highlighted
- GameScreen now accepts initialLevelIndex: number and onReturnToSelect: () => void props
- useReducer lazy initializer changed from hardcoded LEVELS[0] to LEVELS[initialLevelIndex]
- LevelComplete 'Continue' button now calls onReturnToSelect (returns to level select) instead of handleNext (auto-advance)

## Task Commits

Each task was committed atomically:

1. **Task 1: App.tsx screen router with findFirstIncompleteLevel** - `aa16941` (feat)
2. **Task 2: GameScreen initialLevelIndex and onReturnToSelect props** - `c93ae6c` (feat)

## Files Created/Modified
- `src/App.tsx` - Screen router, findFirstIncompleteLevel(), handleSelectLevel, handleReturnToSelect
- `src/components/GameScreen.tsx` - Props interface, initialLevelIndex prop, onReturnToSelect prop, LevelComplete wiring

## Decisions Made
- findFirstIncompleteLevel() defined at module level (not inside App component) to keep the useState lazy initializer clean and readable.
- handleReturnToSelect calls setCurrentLevelIndex(findFirstIncompleteLevel()) — re-reads localStorage on every return so stars earned during gameplay update the focused cell immediately.
- handleNext kept in GameScreen.tsx — it is still used by the Controls component's onNext prop. Only the LevelComplete wiring was changed (onNextLevel now calls onReturnToSelect instead of handleNext).
- LevelComplete 'Continue' button now always returns to level select — players see their full progress before re-entering a level.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- App opens at level select on every load
- Selecting a level transitions to gameplay at that specific level
- Returning from a level (via LevelComplete 'Continue') returns to level select with recomputed focus
- Plan 03-03 only needs to update the LevelComplete button label ('Livello successivo' → 'Continua' or similar) — the wiring is already complete

---
*Phase: 03-progression-and-navigation*
*Completed: 2026-02-25*

## Self-Check: PASSED

- FOUND: src/App.tsx
- FOUND: src/components/GameScreen.tsx
- FOUND: .planning/phases/03-progression-and-navigation/03-02-SUMMARY.md
- FOUND commit: aa16941 feat(03-02): add App.tsx screen router with findFirstIncompleteLevel
- FOUND commit: c93ae6c feat(03-02): add initialLevelIndex and onReturnToSelect props to GameScreen
