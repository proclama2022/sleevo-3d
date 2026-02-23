# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-20)

**Core value:** Il giocatore deve sempre sapere esattamente cosa deve fare, perché ha guadagnato punti, e quanto manca alla fine del livello.
**Current focus:** Phase 1 — Foundation Fixes

## Current Position

Phase: 1 of 4 (Foundation Fixes)
Plan: 3 of 3 in current phase
Status: Complete
Last activity: 2026-02-23 — Completed Plan 01-03: Wired player communication elements (score popups, HUD counter, rule badge)

Progress: [████████░░] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: 10 min
- Total execution time: 29 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01    | 3     | 29 min | 10 min   |

**Recent Trend:**
- Last 5 plans: 01-03 (15 min), 01-02 (4 min), 01-01 (8 min)
- Trend: Phase 1 complete; ready for Phase 2

*Updated after each plan completion*
| Phase 01-foundation-fixes P01-01 | 8 min | 2 tasks | 2 files |
| Phase 01-foundation-fixes P01-02 | 4 min | 1 task | 8 files |
| Phase 01-foundation-fixes P01-03 | 15 min | 4 tasks | 3 files |
| Phase 01-foundation-fixes P03 | 881 | 4 tasks | 3 files |

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
- [Roadmap]: useReducer in GameScreen is canonical; dormant Zustand gameStore must be removed/quarantined in Phase 1 ✓ DONE
- [Roadmap]: Unlock threshold fix (>= 1 → >= 2 stars) landed in Plan 01-01 to avoid corrupting progression data
- [Roadmap]: Time-in-stars decision (parTime per level) must be made before Phase 2 coding starts
- [Phase 01-foundation-fixes]: Verified no external imports from Zustand cluster before deletion — prevented runtime errors
- [Phase 01-foundation-fixes]: Eliminated parallel Zustand type system — useReducer in GameScreen.tsx is now single source of truth
- [Phase 01-foundation-fixes]: Use fallback coordinates for ScorePopup positioning instead of threading scoreRef through HUD — simpler implementation acceptable per research
- [Phase 01-foundation-fixes]: Changed HUD LeftSection to vertical stack to accommodate rule badge below score while maintaining visual hierarchy

### Pending Todos

None yet.

### Blockers/Concerns

- [Pre-Phase 2]: Decision required — does timeElapsed factor into star calculation? Recommendation: yes, using per-level parTime. Must be resolved before Phase 2 plans are written.
- [Pre-Phase 4]: sleeve-match mode requires album cover art data; may need to scope-check before level authoring begins.

## Session Continuity

Last session: 2026-02-23
Stopped at: Completed Plan 01-03 (Foundation Fixes — Player Communication Elements)
Resume file: None
