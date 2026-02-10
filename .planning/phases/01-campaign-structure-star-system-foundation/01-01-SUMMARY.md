---
phase: 01-campaign-structure-star-system-foundation
plan: 01
subsystem: game-logic
tags: [star-rating, game-progression, save-system, typescript]

# Dependency graph
requires:
  - phase: none (foundation layer)
    provides: existing GameState and SaveData types
provides:
  - Star calculation service with mode-specific criteria (Standard, Timed, SuddenDeath, Boss)
  - Tunable threshold constants for star ratings
  - Extended SaveData with totalStars and highestLevelUnlocked tracking
  - Pure functions for real-time and final star calculations
affects: [01-02, 01-03, 01-04, level-ui, campaign-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pure calculation functions (no React dependencies)
    - Mode-specific criteria with switch-based type narrowing
    - Denormalized totalStars for quick access

key-files:
  created:
    - constants/starThresholds.ts
    - services/starCalculation.ts
  modified:
    - types.ts
    - services/storage.ts

key-decisions:
  - "Use denormalized totalStars field for quick access without iterating levelStars"
  - "levelIndex 0-based, levelNumber 1-based convention established"
  - "StarCriteria allows per-level overrides via optional LevelConfig.starCriteria"

patterns-established:
  - "Star calculation: 0=loss, 1=completion, 2=good, 3=perfect"
  - "Mode-specific criteria in constants/starThresholds.ts for easy tuning"
  - "Separate calculateStarsEarned (final) vs calculateCurrentStars (real-time projection)"

# Metrics
duration: 3min
completed: 2026-02-10
---

# Phase 01 Plan 01: Star Calculation & Storage Summary

**Pure star calculation service with mode-specific criteria and extended SaveData tracking totalStars and highestLevelUnlocked**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-10T10:18:13Z
- **Completed:** 2026-02-10T10:21:26Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created star calculation service with pure functions (no React dependencies)
- Established mode-specific star criteria for Standard, Timed, SuddenDeath, Boss, and Endless modes
- Extended SaveData with totalStars (denormalized) and highestLevelUnlocked fields
- Implemented backward-compatible migration for existing save data

## Task Commits

Each task was committed atomically:

1. **Task 1: Create star threshold constants and calculation service** - `4188ae0` (feat)
2. **Task 2: Extend SaveData for campaign star tracking** - `e6bfdd5` (feat)

## Files Created/Modified
- `constants/starThresholds.ts` - Tunable threshold constants for all game modes (DEFAULT_TWO_STAR_ACCURACY, DEFAULT_THREE_STAR_ACCURACY, DEFAULT_THREE_STAR_MIN_COMBO, STAR_THRESHOLDS object)
- `services/starCalculation.ts` - Pure calculation functions: getStarCriteria, calculateStarsEarned (final), calculateCurrentStars (real-time projection)
- `types.ts` - Added CampaignLevel, LevelConfig, StarCriteria interfaces for campaign system
- `services/storage.ts` - Extended SaveData with totalStars and highestLevelUnlocked, added updateStarProgress helper function

## Decisions Made
- **Denormalized totalStars:** Store computed total for quick access without iterating levelStars dictionary. Calculated in updateStarProgress.
- **levelIndex vs levelNumber convention:** levelIndex is 0-based (storage keys), levelNumber is 1-based (UI display). Established pattern: unlock levelIndex+2 to unlock next level number.
- **Optional per-level override:** LevelConfig.starCriteria allows hand-crafted levels to override default mode criteria if needed in future.
- **Separate final vs real-time calculations:** calculateStarsEarned for game-won state, calculateCurrentStars for in-progress projection (assumes completion for UI feedback).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**TypeScript type narrowing in getStarCriteria:** Initial implementation accessed mode-specific threshold properties without proper type narrowing, causing compilation errors. Fixed by using switch statement with block scoping to narrow STAR_THRESHOLDS[mode] to specific mode type within each case.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Star calculation foundation complete and ready for UI integration
- Storage layer extended and backward-compatible
- Ready for plan 01-02 (level configuration) to use StarCriteria and CampaignLevel types
- Ready for plan 01-03 (star display UI) to call calculateCurrentStars and calculateStarsEarned

## Self-Check: PASSED

All claimed files and commits verified to exist.

---
*Phase: 01-campaign-structure-star-system-foundation*
*Completed: 2026-02-10*
