# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.1 — Social & Retention

**Shipped:** 2026-02-26
**Phases:** 3 | **Plans:** 4 | **Sessions:** 2

### What Was Built
- Best score persistence in localStorage with merge-write and independent scoreImproved condition
- "Nuovo Record! +X pt" badge on LevelComplete with read-before-save guard and CSS pulse animation
- Best score display ("1.420 pt") per level cell in LevelSelect with formatScore utility (it-IT hardcoded)

### What Worked
- Research phase caught 5 specific pitfalls (M1-M5) before any code was written — all 5 were addressed in plans
- Single-plan phases (06, 07) executed very fast with minimal overhead
- formatScore utility created in Phase 5 was cleanly reused by both Phase 6 and Phase 7 — dependency ordering paid off
- Human checkpoints caught visual issues early (cell layout, animation timing)

### What Was Inefficient
- Research spawned 4 agents but only PITFALLS.md was available at synthesis time — the other 3 (STACK, FEATURES, ARCHITECTURE) may have been from v1.0 research not v1.1 specific
- Context exhaustion during first `/gsd:new-milestone` attempt required a `/clear` and restart

### Patterns Established
- Read-before-save pattern: compute derived values (isNewRecord, delta) from storage BEFORE calling saveProgress in the same useEffect
- Strict undefined guard (`!== undefined`) for "first time" vs "zero" disambiguation
- formatScore utility with hardcoded locale — no inline Intl.NumberFormat calls
- merge-write with spread `{ ...existing }` as default storage pattern

### Key Lessons
1. Small milestones (3 phases) ship in a single session — context stays fresh
2. Storage schema extensions need merge-write from day one — retrofitting is harder than building it right
3. Guard conditions for "new record" are subtle — `?? 0` vs `!== undefined` is the difference between correct and broken

### Cost Observations
- Model mix: ~20% opus (orchestrator), ~80% sonnet (researchers, planners, executors, verifiers)
- Sessions: 2 (one hit context limit, second completed everything)
- Notable: Phase 7 (1 file change) still went through full research→plan→verify pipeline — might be overkill for trivial phases

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~6 | 4 | Established GSD workflow, useReducer canonical |
| v1.1 | 2 | 3 | Smooth execution, research caught all pitfalls upfront |

### Top Lessons (Verified Across Milestones)

1. Research before planning prevents mid-execution surprises — verified in both v1.0 (blackout flicker) and v1.1 (stale read, first-play guard)
2. Human checkpoints for visual/interactive features catch things automated tests cannot — verified in both milestones
