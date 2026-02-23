# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-20)

**Core value:** Il giocatore deve sempre sapere esattamente cosa deve fare, perché ha guadagnato punti, e quanto manca alla fine del livello.
**Current focus:** Phase 2 — Star System and Level Complete

## Current Position

Phase: 2 of 4 (Star System and Level Complete)
Plan: 2 of 3 in current phase
Status: In Progress
Last activity: 2026-02-23 — Completed Plan 02-02: Implemented D1 star calculation formula with parTime thresholds

Progress: [█████░░░░] 66%

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 7 min
- Total execution time: 35 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01    | 3     | 29 min | 10 min   |
| 02    | 2     | 6 min  | 3 min    |

**Recent Trend:**
- Last 5 plans: 02-02 (2 min), 02-01 (4 min), 01-03 (15 min), 01-02 (4 min), 01-01 (8 min)
- Trend: Phase 2 progressing; star calculation formula implemented

*Updated after each plan completion*
| Phase 01-foundation-fixes P01-01 | 8 min | 2 tasks | 2 files |
| Phase 01-foundation-fixes P01-02 | 4 min | 1 task | 8 files |
| Phase 01-foundation-fixes P01-03 | 15 min | 4 tasks | 3 files |
| Phase 02-star-system-and-level-complete P02-01 | 4 min | 2 tasks | 2 files |
| Phase 02-star-system-and-level-complete P02-02 | 2 min | 1 task | 1 file |

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

### Pending Todos

None yet.

### Blockers/Concerns

- [Pre-Phase 4]: sleeve-match mode requires album cover art data; may need to scope-check before level authoring begins.

## Session Continuity

Last session: 2026-02-23
Stopped at: Completed 02-star-system-and-level-complete-02-PLAN.md (Star Formula with parTime Thresholds)
Resume file: None
