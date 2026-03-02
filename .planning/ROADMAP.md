# Roadmap: Sleevo

## Overview

Sleevo è un gioco di sorting di vinili in 3D. v1.0 MVP ha consegnato il core gameplay con 21 livelli e 7 modalità. v1.1 ha aggiunto best score tracking e "Nuovo Record!" badge. v1.2 Visual Polish renderà il gioco più soddisfacente con feedback tattile, animazioni fluide e atmosfera ambientale.

## Milestones

- ✅ **v1.0 MVP** - Phases 1-4 (shipped 2026-02-25)
- ✅ **v1.1 Social & Retention** - Phases 5-7 (shipped 2026-02-26)
- 🚧 **v1.2 Visual Polish** - Phases 8-12 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (8, 9, 10): Planned milestone work
- Decimal phases (8.1, 8.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 8: Accessibility Foundation** - Establish accessibility patterns for all animations
- [ ] **Phase 9: Drag Wobble + Slot Glow** - Add tactile feedback to core drag interaction
- [ ] **Phase 10: Placement Feedback** - Enhance placement satisfaction with spin and shadow
- [ ] **Phase 11: Screen Transitions** - Smooth transitions between all game screens
- [ ] **Phase 12: Ambient Atmosphere** - Add ambient particles for visual polish

<details>
<summary>✅ v1.0 MVP (Phases 1-4) - SHIPPED 2026-02-25</summary>

- [x] Phase 1: Foundation Fixes (3/3 plans) — completed 2026-02-23
- [x] Phase 2: Star System and Level Complete (3/3 plans) — completed 2026-02-23
- [x] Phase 3: Progression and Navigation (3/3 plans) — completed 2026-02-25
- [x] Phase 4: Level Content and Mode Validation (6/6 plans) — completed 2026-02-25

See: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>✅ v1.1 Social & Retention (Phases 5-7) - SHIPPED 2026-02-26</summary>

- [x] Phase 5: Storage and Score Utility (2/2 plans) — completed 2026-02-25
- [x] Phase 6: Level Complete Record Badge (1/1 plan) — completed 2026-02-25
- [x] Phase 7: Level Select Score Display (1/1 plan) — completed 2026-02-26

See: `.planning/milestones/v1.1-ROADMAP.md`

</details>

### 🚧 v1.2 Visual Polish (In Progress)

**Milestone Goal:** Make the game feel more satisfying and polished with tactile feedback and ambient atmosphere.

#### Phase 8: Accessibility Foundation
**Goal**: Establish accessibility patterns for all animations
**Depends on**: Phase 7
**Requirements**: ACES-01, ACES-02
**Success Criteria** (what must be TRUE):
  1. User with prefers-reduced-motion sees no animations (all animations respect the setting)
  2. No animations cause vestibular issues (no infinite motion, no extreme parallax)
**Plans**: TBD

Plans:
- [ ] 08-01: Implement prefers-reduced-motion detection
- [ ] 08-02: Audit all animations for vestibular safety
- [ ] 08-03: Add reduced-motion fallbacks

#### Phase 9: Drag Wobble + Slot Glow
**Goal**: Add tactile feedback to core drag interaction
**Depends on**: Phase 8
**Requirements**: DRAG-01, DRAG-02, DRAG-03, SLOT-01, SLOT-02, SLOT-03
**Success Criteria** (what must be TRUE):
  1. Vinyl disc oscillates naturally when grabbed (wobble responds to drag velocity)
  2. Wobble gradually attenuates when drag stops
  3. Slot emits pulsing glow when vinyl is near
  4. Glow intensifies when vinyl is directly over slot
  5. Glow fades smoothly when vinyl moves away
**Plans**: TBD

Plans:
- [ ] 09-01: Implement drag wobble physics
- [ ] 09-02: Add velocity tracking to drag system
- [ ] 09-03: Implement slot glow animation
- [ ] 09-04: Add proximity detection for glow intensity

#### Phase 10: Placement Feedback
**Goal**: Enhance placement satisfaction with spin and shadow
**Depends on**: Phase 9
**Requirements**: PLACE-01, PLACE-02, PLACE-03
**Success Criteria** (what must be TRUE):
  1. Vinyl rotates 360° when placed correctly
  2. Drop shadow appears under vinyl during drag
  3. "Thwack" effect (mini-bounce + sparkle) on valid placement
**Plans**: TBD

Plans:
- [ ] 10-01: Implement vinyl spin animation
- [ ] 10-02: Add drop shadow during drag
- [ ] 10-03: Enhance placement feedback sequence

#### Phase 11: Screen Transitions
**Goal**: Smooth transitions between all game screens
**Depends on**: Phase 10
**Requirements**: TRAN-01, TRAN-02, TRAN-03, TRAN-04
**Success Criteria** (what must be TRUE):
  1. LevelSelect to GameScreen transition fades smoothly
  2. GameScreen to LevelComplete transition fades smoothly
  3. Loading state visible during lazy loading
  4. All transitions respect prefers-reduced-motion
**Plans**: TBD

Plans:
- [ ] 11-01: Implement screen transition component
- [ ] 11-02: Add fade transitions between screens
- [ ] 11-03: Add loading state handling
- [ ] 11-04: Integrate with prefers-reduced-motion

#### Phase 12: Ambient Atmosphere
**Goal**: Add ambient particles for visual polish
**Depends on**: Phase 11
**Requirements**: AMBI-01, AMBI-02, AMBI-03
**Success Criteria** (what must be TRUE):
  1. Dust particles float in scene
  2. Light rays appear in appropriate themes
  3. Particles react to theme (color, intensity)
**Plans**: TBD

Plans:
- [ ] 12-01: Implement ambient particles system
- [ ] 12-02: Add dust particles to scene
- [ ] 12-03: Add theme-based light rays
- [ ] 12-04: Connect particles to theme system

## Progress

**Execution Order:**
Phases execute in numeric order: 8 → 9 → 10 → 11 → 12

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation Fixes | v1.0 | 3/3 | Complete | 2026-02-23 |
| 2. Star System and Level Complete | v1.0 | 3/3 | Complete | 2026-02-23 |
| 3. Progression and Navigation | v1.0 | 3/3 | Complete | 2026-02-25 |
| 4. Level Content and Mode Validation | v1.0 | 6/6 | Complete | 2026-02-25 |
| 5. Storage and Score Utility | v1.1 | 2/2 | Complete | 2026-02-25 |
| 6. Level Complete Record Badge | v1.1 | 1/1 | Complete | 2026-02-25 |
| 7. Level Select Score Display | v1.1 | 1/1 | Complete | 2026-02-26 |
| 8. Accessibility Foundation | v1.2 | 0/3 | Not started | - |
| 9. Drag Wobble + Slot Glow | v1.2 | 0/4 | Not started | - |
| 10. Placement Feedback | v1.2 | 0/3 | Not started | - |
| 11. Screen Transitions | v1.2 | 0/4 | Not started | - |
| 12. Ambient Atmosphere | v1.2 | 0/4 | Not started | - |
