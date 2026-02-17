# Requirements: Sleevo Vinyl Shop Manager v2.0

**Defined:** 2026-02-10
**Core Value:** Every 30-60 seconds, the player must feel successful and want to play "just one more level"

## v1 Requirements

Requirements for v2.0 engagement overhaul. Each maps to roadmap phases.

### Campaign Structure & Star System

- [ ] **STAR-01**: User can earn 1-3 stars per level based on performance (1★ = complete, 2★ = good accuracy, 3★ = perfect + combo)
- [ ] **STAR-02**: User sees star criteria before level starts (what performance earns each star tier)
- [ ] **STAR-03**: User sees real-time progress toward star goals during gameplay
- [ ] **STAR-04**: System tracks best star rating achieved per level and displays on level select
- [ ] **STAR-05**: SaveData schema extended to store star progress for all 60 levels
- [ ] **STAR-06**: Progression service calculates star ratings based on accuracy, combo, time, and mode-specific criteria

### Level Content & Design

- [ ] **LEVEL-01**: User plays through 60 hand-crafted campaign levels organized into 6 worlds (10 levels each)
- [ ] **LEVEL-02**: User encounters Boss levels every 10 levels (10, 20, 30, 40, 50, 60) with unique hand-crafted challenges
- [ ] **LEVEL-03**: Levels use archetypes for variety (speed-focused, accuracy-focused, memory challenge, combo-focused)
- [ ] **LEVEL-04**: Level difficulty curve is validated through playtesting (start with 10 levels, iterate, then scale to 60)
- [ ] **LEVEL-05**: Each world introduces new mechanics progressively (World 1: basics, World 2: mystery/dusty, World 3: specials, etc.)
- [ ] **LEVEL-06**: Boss levels feature unique mechanics not present in standard levels (e.g., "Only gold vinyls", "Memory challenge", "Speed run")

### Visual Feedback & Effects

- [ ] **VFX-01**: User sees escalating combo feedback at 3x/5x/10x tiers (particles, text size, screen shake intensity increase)
- [ ] **VFX-02**: Screen shakes when combo milestones achieved (subtle at 3x, moderate at 5x, intense at 10x)
- [ ] **VFX-03**: User sees crate completion celebration with lock animation and confetti when crate filled
- [ ] **VFX-04**: User sees Perfect Clear bonus animation when achieving 3★ + all secondary objectives
- [ ] **VFX-05**: VFXManager service orchestrates effect queue to prevent conflicts (e.g., multiple simultaneous screen shakes)
- [ ] **VFX-06**: Particle system optimized for mobile (Canvas-based, limited to 8 particles on mobile, 16 on desktop)
- [ ] **VFX-07**: Genre-specific particle effects enhanced (Jazz = stars, Disco = stars, Funk/Punk = squares, others = circles)
- [ ] **VFX-08**: Slow-motion effect triggers for special moments (e.g., perfect placement on final vinyl)

### Level Progression UI

- [ ] **UI-01**: User navigates level select screen showing all 60 levels organized by worlds
- [ ] **UI-02**: User sees star visualization for each level (0-3 stars earned, grayed if not yet earned)
- [ ] **UI-03**: User sees lock/unlock states for levels (complete level N to unlock N+1)
- [ ] **UI-04**: User sees total star counter showing X/180 total stars earned
- [ ] **UI-05**: Level select screen uses world themes matching game progression (Basement → Store → Expo aesthetics)
- [ ] **UI-06**: User can replay any unlocked level to improve star rating
- [ ] **UI-07**: Level select screen shows which levels have boss mechanics (visual indicator)

### Cosmetic Progression & Unlocks

- [ ] **COSM-01**: User unlocks visual themes (Neon, Retro 80s, Minimalist) based on star milestones
- [ ] **COSM-02**: Theme unlocks are deterministic (X stars = unlock Y theme, no randomness/loot boxes)
- [ ] **COSM-03**: User discovers Easter egg collection (real famous albums like "Dark Side of the Moon") as rare special vinyls
- [ ] **COSM-04**: User unlocks background styles (variants beyond default bricks/wood/concrete)
- [ ] **COSM-05**: User unlocks vinyl cover customization options (skin variants for vinyl appearance)
- [ ] **COSM-06**: Unlock modal displays when milestone reached with clear visual celebration
- [ ] **COSM-07**: Collection screen shows discovered Easter eggs with metadata (artist, album, year)

## v2 Requirements

Deferred to future release after core campaign proven sticky.

### Daily Challenges

- **DAILY-01**: User receives single daily challenge with 2-5 minute completion time
- **DAILY-02**: Daily challenge participation is optional (no FOMO pressure, no penalties for missing)
- **DAILY-03**: Daily challenge rewards bonus cosmetic items not available in campaign
- **DAILY-04**: Challenge rotation system cycles through different constraint types (speed, accuracy, combo, special discs)
- **DAILY-05**: User sees challenge history showing past completions and streaks (non-punishing)

## Out of Scope

Explicitly excluded features with reasoning.

| Feature | Reason |
|---------|--------|
| Power-ups or paid boosts | Maintain skill-based gameplay, zero pay-to-win philosophy |
| Randomized loot boxes for cosmetics | Ethical concern: avoid loot box psychology even in non-paid context |
| Negative random events (blackout, earthquake) | Research shows frustration kills retention; remove or make bonus-only |
| Real-time multiplayer | Too complex for hypercasual genre, session flexibility more important |
| Complex skill trees or permanent upgrades | Breaks skill-based purity; progression should be cosmetic only |
| Story/narrative elements | Focus on pure gameplay loop, not narrative structure |
| Multiple daily obligations | Aggressive daily systems cause burnout; single optional challenge only |
| More than 60 campaign levels | Validate engagement with 60 first before considering expansion |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STAR-01 | Phase 1 | Pending |
| STAR-02 | Phase 1 | Pending |
| STAR-03 | Phase 1 | Pending |
| STAR-04 | Phase 1 | Pending |
| STAR-05 | Phase 1 | Pending |
| STAR-06 | Phase 1 | Pending |
| LEVEL-04 | Phase 1 | Pending |
| LEVEL-01 | Phase 2 | Pending |
| LEVEL-02 | Phase 2 | Pending |
| LEVEL-03 | Phase 2 | Pending |
| LEVEL-05 | Phase 2 | Pending |
| LEVEL-06 | Phase 2 | Pending |
| VFX-01 | Phase 3 | Pending |
| VFX-02 | Phase 3 | Pending |
| VFX-03 | Phase 3 | Pending |
| VFX-04 | Phase 3 | Pending |
| VFX-05 | Phase 3 | Pending |
| VFX-06 | Phase 3 | Pending |
| VFX-07 | Phase 3 | Pending |
| VFX-08 | Phase 3 | Pending |
| UI-01 | Phase 4 | Pending |
| UI-02 | Phase 4 | Pending |
| UI-03 | Phase 4 | Pending |
| UI-04 | Phase 4 | Pending |
| UI-05 | Phase 4 | Pending |
| UI-06 | Phase 4 | Pending |
| UI-07 | Phase 4 | Pending |
| COSM-01 | Phase 5 | Pending |
| COSM-02 | Phase 5 | Pending |
| COSM-03 | Phase 5 | Pending |
| COSM-04 | Phase 5 | Pending |
| COSM-05 | Phase 5 | Pending |
| COSM-06 | Phase 5 | Pending |
| COSM-07 | Phase 5 | Pending |
| DAILY-01 | Phase 6 (v2) | Deferred |
| DAILY-02 | Phase 6 (v2) | Deferred |
| DAILY-03 | Phase 6 (v2) | Deferred |
| DAILY-04 | Phase 6 (v2) | Deferred |
| DAILY-05 | Phase 6 (v2) | Deferred |

**Coverage:**
- v1 requirements: 34 total
- Mapped to phases: 34/34 (100%)
- Unmapped: 0

**Notes:**
- LEVEL-04 (initial 10 levels for validation) maps to Phase 1 to enable early testing of star system
- DAILY-* requirements are v2 scope but included in Phase 6 structure for completeness
- All 34 v1 requirements have explicit phase mapping with no orphans

---
*Requirements defined: 2026-02-10*
*Last updated: 2026-02-10 after roadmap creation*
