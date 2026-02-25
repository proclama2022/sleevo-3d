# Roadmap: Sleevo

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-02-25)
- 🚧 **v1.1 Social & Retention** — Phases 5-7 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-02-25</summary>

- [x] Phase 1: Foundation Fixes (3/3 plans) — completed 2026-02-23
- [x] Phase 2: Star System and Level Complete (3/3 plans) — completed 2026-02-23
- [x] Phase 3: Progression and Navigation (3/3 plans) — completed 2026-02-25
- [x] Phase 4: Level Content and Mode Validation (6/6 plans) — completed 2026-02-25

See: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### 🚧 v1.1 Social & Retention (In Progress)

**Milestone Goal:** Il giocatore può confrontare le proprie performance passate — best score visibile nel level select e celebrazione del nuovo record alla fine del livello.

- [x] **Phase 5: Storage and Score Utility** — Extend localStorage schema with bestScore and create the shared formatScore utility (2/2 plans complete — 2026-02-25)
- [x] **Phase 6: Level Complete Record Badge** — Show "Nuovo Record! +340 pt" badge when the player beats their personal best (completed 2026-02-25)
- [ ] **Phase 7: Level Select Score Display** — Display best score per level cell as "1.420 pt" (or "--" if never completed)

## Phase Details

### Phase 5: Storage and Score Utility
**Goal**: Best scores are persisted safely across sessions and a shared formatting utility exists for all score display surfaces
**Depends on**: Phase 4 (v1.0 complete)
**Requirements**: PERSIST-01, PERSIST-02
**Success Criteria** (what must be TRUE):
  1. Completing a level saves its score to localStorage; returning later still shows that score
  2. Replaying a level and scoring lower does not overwrite the stored best score
  3. Completing a level does not erase previously stored bestStars or unlocked state
  4. The number 1420 formats to "1.420 pt" consistently across every surface that displays a score
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md — Extend LevelProgress + saveProgress (merge-write, scoreImproved condition) and create formatScore utility
- [ ] 05-02-PLAN.md — Wire GameScreen save call to pass state.score; manual localStorage verification

### Phase 6: Level Complete Record Badge
**Goal**: Players receive a clear signal when they beat their personal best, including the exact improvement margin
**Depends on**: Phase 5
**Requirements**: COMPLETE-01, COMPLETE-02
**Success Criteria** (what must be TRUE):
  1. After beating a previous best, the level-complete screen shows a "Nuovo Record!" badge
  2. The badge shows the improvement delta, e.g. "+340 pt"
  3. Completing a level for the first time (no prior record) shows no "Nuovo Record!" badge
  4. Replaying a level and scoring lower shows no "Nuovo Record!" badge
**Plans**: 1 plan

Plans:
- [ ] 06-01-PLAN.md — Add isNewRecord + scoreDelta logic to GameScreen and record badge UI to LevelComplete

### Phase 7: Level Select Score Display
**Goal**: Players can compare their best scores across all levels at a glance from the level select grid
**Depends on**: Phase 5
**Requirements**: SELECT-01
**Success Criteria** (what must be TRUE):
  1. Each completed level cell shows the best score as "X.XXX pt" below the stars
  2. A level never completed shows "--" in place of a score
  3. Locked level cells show no score value
  4. The score format matches Phase 5's formatScore utility (Italian thousand separator)
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation Fixes | v1.0 | 3/3 | Complete | 2026-02-23 |
| 2. Star System and Level Complete | v1.0 | 3/3 | Complete | 2026-02-23 |
| 3. Progression and Navigation | v1.0 | 3/3 | Complete | 2026-02-25 |
| 4. Level Content and Mode Validation | v1.0 | 6/6 | Complete | 2026-02-25 |
| 5. Storage and Score Utility | v1.1 | 2/2 | Complete | 2026-02-25 |
| 6. Level Complete Record Badge | v1.1 | 1/1 | Complete | 2026-02-25 |
| 7. Level Select Score Display | v1.1 | 0/? | Not started | - |
