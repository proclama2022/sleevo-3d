# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-20)

**Core value:** Il giocatore deve sempre sapere esattamente cosa deve fare, perché ha guadagnato punti, e quanto manca alla fine del livello.
**Current focus:** Phase 3 — Progression and Navigation

## Current Position

Phase: 3 of 4 (Progression and Navigation)
Plan: 2 of 3 in current phase
Status: In Progress
Last activity: 2026-02-25 — Completed Plan 03-02: App.tsx screen router and GameScreen initialLevelIndex prop

Progress: [████████████████████] 67% (Phase 3)

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 6 min
- Total execution time: 37 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01    | 3     | 29 min | 10 min   |
| 02    | 3     | 8 min  | 3 min    |
| 03    | 1     | 4 min  | 4 min    |

**Recent Trend:**
- Last 5 plans: 03-01 (4 min), 02-03 (2 min), 02-02 (2 min), 02-01 (4 min), 01-03 (15 min)
- Trend: Phase 3 in progress; LevelSelect component with 3-column grid and locked/focused state built

*Updated after each plan completion*
| Phase 01-foundation-fixes P01-01 | 8 min | 2 tasks | 2 files |
| Phase 01-foundation-fixes P01-02 | 4 min | 1 task | 8 files |
| Phase 01-foundation-fixes P01-03 | 15 min | 4 tasks | 3 files |
| Phase 02-star-system-and-level-complete P02-01 | 4 min | 2 tasks | 2 files |
| Phase 02-star-system-and-level-complete P02-02 | 2 min | 1 task | 1 file |
| Phase 02-star-system-and-level-complete P02-03 | 2 min | 2 tasks | 2 files |
| Phase 03-progression-and-navigation P03-01 | 4 min | 2 tasks | 2 files |
| Phase 03-progression-and-navigation P03-02 | 1 min | 2 tasks | 2 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Plan 01-01]: Stub getTargetSlot to return null — maintains API contract while disabling hint feature (hint button not in UI)
- [Plan 01-01]: Accept new levels parameter in isLevelUnlocked signature — future-proof for Phase 3 level select wiring
- [Plan 01-02]: Verified no external imports from Zustand cluster before deletion — prevented runtime errors
- [Plan 01-02]: Eliminated parallel Zustand type system — useReducer in GameScreen.tsx is now single source of truth
- [Plan 01-03]: Use fallback coordinates `{ x: 56, y: 52 }` for ScorePopup positioning instead of threading scoreRef through HUD — simpler implementation acceptable per research
- [Plan 01-03]: Changed HUD LeftSection to vertical stack to accommodate rule badge below score while maintaining visual hierarchy
- [Plan 02-01]: parTime calculated as (vinyls × 3s) × mode_multiplier for consistent baseline across all levels
- [Plan 02-01]: Mode multipliers established: free=1.0, genre=1.2, chronological=1.3, customer=1.1, blackout=1.5, rush=0.8, sleeve-match=1.4
- [Plan 02-01]: parTime made optional property for backward compatibility with existing level definitions
- [Roadmap]: useReducer in GameScreen is canonical; dormant Zustand gameStore must be removed/quarantined in Phase 1 ✓ DONE
- [Roadmap]: Unlock threshold fix (>= 1 → >= 2 stars) landed in Plan 01-01 to avoid corrupting progression data
- [Roadmap]: Time-in-stars decision (parTime per level) implemented in Plan 02-01 ✓ DONE
- [Phase 01-foundation-fixes]: Verified no external imports from Zustand cluster before deletion — prevented runtime errors
- [Phase 01-foundation-fixes]: Eliminated parallel Zustand type system — useReducer in GameScreen.tsx is now single source of truth
- [Phase 01-foundation-fixes]: Use fallback coordinates for ScorePopup positioning instead of threading scoreRef through HUD — simpler implementation acceptable per research
- [Phase 01-foundation-fixes]: Changed HUD LeftSection to vertical stack to accommodate rule badge below score while maintaining visual hierarchy
- [Phase 02-star-system-and-level-complete]: parTime calculated as (vinyls × 3s) × mode_multiplier for consistent baseline across all levels
- [Phase 02-star-system-and-level-complete]: Mode multipliers established: free=1.0, genre=1.2, chronological=1.3, customer=1.1, blackout=1.5, rush=0.8, sleeve-match=1.4
- [Phase 02-star-system-and-level-complete]: parTime made optional property for backward compatibility with existing level definitions
- [Plan 02-02]: Star formula uses mistakes + time (not hints) per CONTEXT.md D1 decision
- [Plan 02-02]: 3★ allows 10% margin over par (par × 1.10) for player flexibility
- [Plan 02-02]: 2★ requires strict under par time (< parTime, not <=) for meaningful challenge
- [Plan 02-02]: Fallback for levels without parTime prevents crashes during transition
- [Plan 02-03]: Score and parTime props are optional for backward compatibility with existing level definitions
- [Plan 02-03]: formatTimeWithPar helper returns 'X:XX / Y:YY par' when parTime exists, or 'X:XX' when undefined
- [Plan 02-03]: Score stat appears as first item in stats display for visual hierarchy
- [Plan 03-01]: LevelCell is an inline function component in the same file — not exported, not split to a separate file
- [Plan 03-01]: loadAllProgress() called directly in render — synchronous localStorage read requires no async pattern
- [Plan 03-01]: data-unlocked=false uses both opacity: 0.38 and pointer-events: none — double-layer silent block for accessibility and UX
- [Plan 03-01]: Locked cells still show level number and empty stars under the padlock — consistent cell shape across all states
- [Plan 03-02]: findFirstIncompleteLevel defined at module level (not inside App component) to keep useState lazy initializer readable
- [Plan 03-02]: handleReturnToSelect recomputes focus index via findFirstIncompleteLevel() so newly earned stars update the highlight
- [Plan 03-02]: handleNext kept in GameScreen — still used by Controls.onNext; only LevelComplete wiring changed to onReturnToSelect
- [Plan 03-02]: LevelComplete 'Continue' now always returns to level select — players see full progress before re-entering a level

### Pending Todos

None yet.

### Blockers/Concerns

- [Pre-Phase 4]: sleeve-match mode requires album cover art data; may need to scope-check before level authoring begins.

## Session Continuity

Last session: 2026-02-25
Stopped at: Completed 03-progression-and-navigation-02-PLAN.md (App.tsx screen router, GameScreen initialLevelIndex prop, LevelComplete return-to-select wiring)
Resume file: None
