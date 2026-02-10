# Roadmap: Sleevo Vinyl Shop Manager v2.0

## Overview

Transform Sleevo from a proof-of-concept into an addictive hypercasual puzzle game by building progression systems in dependency order. First establish star rating and level infrastructure (Phase 1), validate difficulty curve with hand-crafted campaign levels (Phase 2), amplify satisfaction through enhanced visual feedback (Phase 3), enable visible progress tracking through level select UI (Phase 4), add long-term goals via cosmetic unlocks (Phase 5), and finally introduce retention hooks with daily challenges (Phase 6). Each phase delivers a complete, verifiable capability that makes the game more engaging.

## Phases

- [ ] **Phase 1: Campaign Structure & Star System Foundation** - Clear objectives and progress tracking
- [ ] **Phase 2: Level Design System & Campaign Expansion** - 60 hand-crafted levels with controlled difficulty
- [ ] **Phase 3: Enhanced Feedback & Visual Effects** - Amplify satisfaction through "juice"
- [ ] **Phase 4: Level Progression UI** - World map navigation and star visualization
- [ ] **Phase 5: Cosmetic Progression & Unlocks** - Long-term goals and rewards
- [ ] **Phase 6: Daily Challenges & Retention Hooks** - Ongoing engagement mechanisms

## Phase Details

### Phase 1: Campaign Structure & Star System Foundation
**Goal**: Players can earn 1-3 stars per level based on performance, with clear criteria visible before and during play

**Depends on**: Nothing (first phase)

**Requirements**: STAR-01, STAR-02, STAR-03, STAR-04, STAR-05, STAR-06, LEVEL-04 (initial 10 levels for validation)

**Success Criteria** (what must be TRUE):
  1. User sees star criteria displayed clearly before starting any level (what performance earns 1/2/3 stars)
  2. User sees real-time progress toward star goals during gameplay (indicators showing current performance vs thresholds)
  3. User earns star rating (1-3 stars) at level completion based on accuracy, combo, time, and mode-specific criteria
  4. User sees star rating celebration animation at victory screen showing stars earned
  5. System persists best star rating for each level across sessions (SaveData tracks all level progress)

**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

### Phase 2: Level Design System & Campaign Expansion
**Goal**: Players experience 60 hand-crafted campaign levels organized into 6 worlds with progressively introduced mechanics

**Depends on**: Phase 1 (need star system to set difficulty targets)

**Requirements**: LEVEL-01, LEVEL-02, LEVEL-03, LEVEL-05, LEVEL-06 (remaining level design requirements)

**Success Criteria** (what must be TRUE):
  1. User plays through 60 levels organized into 6 worlds of 10 levels each with visible world progression
  2. User encounters Boss level every 10 levels (10, 20, 30, 40, 50, 60) with unique hand-crafted challenge mechanics
  3. User experiences level variety through archetypes (speed-focused, accuracy-focused, memory challenge, combo-focused)
  4. User learns new mechanics progressively as they advance through worlds (World 1 basics, World 2+ introduces specials/mystery/combos)
  5. Difficulty curve feels natural with no frustrating spikes (validated through completion rate tracking)

**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Enhanced Feedback & Visual Effects
**Goal**: Every player action feels satisfying through layered visual, audio, and haptic feedback

**Depends on**: Phase 2 (need playable levels to test feedback on)

**Requirements**: VFX-01, VFX-02, VFX-03, VFX-04, VFX-05, VFX-06, VFX-07, VFX-08

**Success Criteria** (what must be TRUE):
  1. User sees escalating combo feedback as multiplier increases (3x = small particles, 5x = medium shake + larger particles, 10x = intense shake + slow-mo)
  2. User sees crate completion celebration with lock animation and confetti particles when filling any crate
  3. User sees Perfect Clear Bonus animation when achieving 3 stars plus all secondary objectives
  4. User feels tactile feedback (haptics) at key moments on mobile (vinyl drop, combo milestone, level complete)
  5. Effects remain performant on mobile (60fps maintained, 8 particles max on mobile, 16 on desktop)

**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Level Progression UI
**Goal**: Players can navigate all 60 levels, see star progress, and replay any unlocked level

**Depends on**: Phase 1 (need star data to display), Phase 2 (need level content to navigate)

**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07

**Success Criteria** (what must be TRUE):
  1. User navigates level select screen showing all 60 levels organized by worlds with world-themed visuals
  2. User sees star visualization for each level (0-3 stars earned, grayed stars if not yet earned)
  3. User sees total star counter displaying X/180 total stars earned across all levels
  4. User identifies Boss levels via visual indicator on level select screen
  5. User replays any unlocked level to improve star rating (complete level N unlocks level N+1)

**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Cosmetic Progression & Unlocks
**Goal**: Players unlock visual themes, backgrounds, and vinyl skins based on star milestones

**Depends on**: Phase 1 (need star tracking for unlock conditions)

**Requirements**: COSM-01, COSM-02, COSM-03, COSM-04, COSM-05, COSM-06, COSM-07

**Success Criteria** (what must be TRUE):
  1. User unlocks visual themes (Neon, Retro 80s, Minimalist) at deterministic star milestones (e.g., 30 stars = Neon)
  2. User discovers Easter egg vinyls (real famous albums like "Dark Side of the Moon") during gameplay as rare special vinyls
  3. User sees unlock celebration modal when reaching milestone with clear visual feedback of new cosmetic earned
  4. User accesses collection screen showing all discovered Easter eggs with metadata (artist, album, year)
  5. User customizes game appearance with unlocked themes, backgrounds, and vinyl skins (applies immediately)

**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Daily Challenges & Retention Hooks
**Goal**: Players receive optional daily challenge with unique rewards to encourage return visits

**Depends on**: Phase 2 (need level generation system), Phase 5 (daily rewards are bonus cosmetics)

**Requirements**: (v2 requirements - DAILY-01 through DAILY-05 deferred but included for structure)

**Success Criteria** (what must be TRUE):
  1. User sees single daily challenge card in main menu showing challenge constraint and reward
  2. User completes daily challenge in 2-5 minutes with unique constraint (speed, accuracy, combo, special discs)
  3. User earns bonus cosmetic item not available in campaign upon daily challenge completion
  4. User views challenge history showing past completions and current streak (non-punishing visualization)
  5. Daily challenge rotation cycles deterministically based on date seed (same challenge for all players on same day)

**Plans**: TBD

Plans:
- [ ] 06-01: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Campaign Structure & Star System Foundation | 0/TBD | Not started | - |
| 2. Level Design System & Campaign Expansion | 0/TBD | Not started | - |
| 3. Enhanced Feedback & Visual Effects | 0/TBD | Not started | - |
| 4. Level Progression UI | 0/TBD | Not started | - |
| 5. Cosmetic Progression & Unlocks | 0/TBD | Not started | - |
| 6. Daily Challenges & Retention Hooks | 0/TBD | Not started | - |
