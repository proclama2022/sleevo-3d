# Roadmap: Sleevo

## Overview

This milestone transforms Sleevo's working gameplay foundation into a complete, communicative game experience. The codebase already has drag-drop, combo mechanics, and 3D rendering; what's missing is the layer that tells players what happened, how well they did, and where they stand. Four phases deliver this: first fix the structural bugs that would corrupt everything else, then build the star rating system, then wire up level select and progression navigation, then author the full 20+ level catalog with all game modes validated.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation Fixes** - Fix structural bugs and wire existing score feedback components
- [ ] **Phase 2: Star System and Level Complete** - Implement star rating formula and complete the end-of-level ceremony
- [ ] **Phase 3: Progression and Navigation** - Level select screen, unlock gating, and HUD rule display
- [ ] **Phase 4: Level Content and Mode Validation** - Author 20+ levels and validate all game modes end-to-end

## Phase Details

### Phase 1: Foundation Fixes
**Goal**: The game engine is structurally sound and players see floating score feedback on every correct placement
**Depends on**: Nothing (first phase)
**Requirements**: FIX-01, FIX-02, FIX-03, FIX-04, COMM-01, COMM-02, COMM-03
**Success Criteria** (what must be TRUE):
  1. A floating "+N" label appears near the shelf slot within 200ms of every correct vinyl placement
  2. The HUD shows a live "X / Y piazzati" counter that increments with each valid drop
  3. The HUD shows the active level rule persistently (e.g., "Ordina per: Genere") for the entire level
  4. Completing level N with 2 stars unlocks level N+1 (not level N with 1 star)
  5. The codebase has one canonical state system: `useReducer` in `GameScreen`; the dormant Zustand `gameStore` is removed or explicitly quarantined
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Fix isLevelUnlocked and stub SLOT_TARGETS (FIX-01, FIX-02, FIX-03)
- [ ] 01-02-PLAN.md — Delete dead Zustand cluster (FIX-04)
- [ ] 01-03-PLAN.md — Wire ScorePopup, HUD counter, and level rule badge (COMM-01, COMM-02, COMM-03)

### Phase 2: Star System and Level Complete
**Goal**: Players receive a clear, meaningful performance rating at the end of every level
**Depends on**: Phase 1
**Requirements**: STAR-01, STAR-02, STAR-03, COMM-04
**Success Criteria** (what must be TRUE):
  1. The end-of-level screen shows 1, 2, or 3 stars with an animated reveal
  2. The end-of-level screen shows the final score, error count, and time elapsed
  3. A rush/blackout level with 2 mistakes and under par time yields a different star count than a genre level with the same stats (mode-differentiated thresholds)
  4. Star ratings and level completion state persist across browser sessions (reload does not reset progress)
**Plans**: TBD

### Phase 3: Progression and Navigation
**Goal**: Players can navigate between levels, see their history, and the game resumes at the right level on load
**Depends on**: Phase 2
**Requirements**: PROG-01, PROG-02, PROG-03
**Success Criteria** (what must be TRUE):
  1. A level select screen shows all levels as a grid with locked/unlocked state and best star count visible
  2. Locked levels cannot be started; the player must earn 2 stars on the previous level to unlock the next
  3. On app load, the game opens at the player's most recently unlocked level (not always level 1)
  4. Best star count for a completed level is preserved and displayed after the player replays and does worse
**Plans**: TBD

### Phase 4: Level Content and Mode Validation
**Goal**: The game has 20+ levels covering all modes with a smooth difficulty curve and reliable mode behavior
**Depends on**: Phase 3
**Requirements**: LVLS-01, LVLS-02, LVLS-03, LVLS-04, MODE-01, MODE-02, MODE-03, MODE-04
**Success Criteria** (what must be TRUE):
  1. There are at least 21 playable levels, each with a visible hint explaining the rule before play starts
  2. All 7 level modes (free, genre, chronological, customer, blackout, rush, sleeve-match) appear in at least one level
  3. Rush mode shows a countdown timer in the HUD and shows a defined "time's up" result when it expires
  4. Blackout mode reliably hides column labels without flicker; the hide logic lives in the engine, not a useEffect
  5. Customer mode shows the active customer request clearly during play; the request resets correctly on LOAD_LEVEL
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation Fixes | 0/3 | Not started | - |
| 2. Star System and Level Complete | 0/? | Not started | - |
| 3. Progression and Navigation | 0/? | Not started | - |
| 4. Level Content and Mode Validation | 0/? | Not started | - |
