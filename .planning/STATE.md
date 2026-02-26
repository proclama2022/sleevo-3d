---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Social & Retention
status: unknown
last_updated: "2026-02-25T18:47:31.514Z"
progress:
  total_phases: 7
  completed_phases: 7
  total_plans: 19
  completed_plans: 19
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** Il giocatore deve sempre sapere esattamente cosa deve fare, perché ha guadagnato punti, e quanto manca alla fine del livello.
**Current focus:** v1.1 — Phase 5: Storage and Score Utility

## Current Position

Phase: 7 of 7 (Level Select Score Display)
Plan: 1 of 1 (07-01 complete)
Status: Complete — v1.1 milestone fully shipped
Last activity: 2026-02-26 — 07-01 complete: bestScore prop and score row added to LevelCell; human-verified layout square, correct score/em dash/locked display

Progress: [##########] 100% (5 of 5 plans — v1.1 only)

## Performance Metrics

**Velocity (v1.0 reference):**
- Total plans completed: 15
- Average duration: ~16 min
- Total execution time: ~4 hours

**By Phase (v1.0):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01    | 3     | 27 min | 9 min   |
| 02    | 3     | 8 min  | 3 min   |
| 03    | 3     | 7 min  | 2 min   |
| 04    | 6     | 195 min | 33 min  |

**v1.1 metrics:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 05    | 2/2   | ~22 min | ~11 min |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Plan 03-03]: storage.ts saveProgress already had best-only semantics for stars — confirms the merge-write pattern is established; extend it for scores
- [v1.1 Research]: isNewRecord must be computed in GameScreen at render time (before saveProgress effect fires) — reading after the write always returns false
- [v1.1 Research]: Use `existingProgress?.bestScore !== undefined && score > existingProgress.bestScore` guard — `?? 0` fallback causes false badge on every first play
- [v1.1 Research]: Hardcode `Intl.NumberFormat('it-IT')` — never rely on browser locale default
- [Plan 05-01]: scoreImproved is an independent OR condition — not nested under starsImproved — so higher-score runs save even without star change
- [Plan 05-01]: Spread-merge write { ...existing, ... } in saveProgress prevents silent field loss when schema grows
- [Plan 05-01]: formatScore returns em dash U+2014 for undefined/null to distinguish unplayed levels from score zero
- [Plan 05-02]: state.score intentionally excluded from saveProgress useEffect deps — fires once per completion, not on each mid-game score increment; closure capture is the correct pattern here
- [Phase 06-level-complete-record-badge]: Read getLevelProgress before saveProgress (read-before-save) to compute isNewRecord and scoreDelta without stale data
- [Phase 06-level-complete-record-badge]: Strict undefined guard prevents false Nuovo Record badge on first play; 0.6s animation delay sequences after star pop-ins; entrance-only animation avoids looping
- [Plan 07-01]: Score span gated on unlocked && — locked cells show nothing (not an em dash); formatScore(bestScore) called directly since utility already returns em dash for undefined; gap reduced 4px→2px on .cell to preserve aspect-ratio: 1

### Pending Todos

None.

### Blockers/Concerns

- [v1.1 Research]: `isLevelUnlocked` uses index-based key construction; only correct for sequential IDs. Low-risk for now but should be fixed before level count exceeds ~10.

## Session Continuity

Last session: 2026-02-26
Stopped at: Completed 07-01-PLAN.md
Resume file: None
