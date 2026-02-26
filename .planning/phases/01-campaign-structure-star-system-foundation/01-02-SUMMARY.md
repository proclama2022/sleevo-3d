---
phase: 01-campaign-structure-star-system-foundation
plan: 02
subsystem: "Campaign/Level Design"
tags: [level-design, campaign, difficulty-curve, star-system]
dependency-graph:
  requires: [types.ts, constants/gameConfig.ts]
  provides: [constants/levelConfigs.ts]
  affects: []
tech-stack:
  added: []
  patterns: [data-configuration, progressive-difficulty]
key-files:
  created:
    - constants/levelConfigs.ts
  modified: []
decisions:
  - "Used explicit star criteria descriptions for player transparency"
  - "Boss level uses Expo theme and speed-round mechanics (40s timer)"
  - "Timed mode introduced at level 6, returns at level 8 for variety"
  - "Special discs introduced at level 7 (diamond, wildcard)"
metrics:
  duration: 94
  tasks: 1
  completed: 2026-02-10
---

# Phase 1 Plan 2: Hand-Crafted Campaign Levels Summary

**One-liner:** Created 10 hand-crafted campaign levels with curated difficulty progression: 3 tutorial levels, 4 skill-building levels, 2 challenge levels, and 1 boss level, each with explicit star criteria.

## Overview

This plan created the foundational 10 campaign levels needed to validate the star system and difficulty curve before scaling to 60 levels. Each level was carefully designed with a specific teaching purpose and smooth progression.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Design 10 hand-crafted campaign levels | 03b7e87 | constants/levelConfigs.ts (created, 363 lines) |

## Implementation Details

### Level Progression Structure

**Levels 1-3 (Tutorial/Easy):**
- Level 1 "First Sort": 2 genres, 2 capacity each, no trash/mystery/dusty
- Level 2 "Getting Sorted": 2 genres, 3 capacity, introduces trash
- Level 3 "Triple Threat": 3 genres, introduces mystery vinyls

**Levels 4-7 (Skill Building):**
- Level 4 "Mystery Box": Multiple mystery vinyls to teach reveal mechanic
- Level 5 "Dust Off": Introduces dusty vinyls + Store theme transition
- Level 6 "Beat the Clock": First timed mode challenge (45s)
- Level 7 "Special Delivery": Introduces special discs (diamond, wildcard)

**Levels 8-9 (Challenge):**
- Level 8 "Vinyl Rush": 4 crates, timed mode, bombs and chains
- Level 9 "The Gauntlet": 4 crates, all mechanics combined, standard mode

**Level 10 (Boss):**
- "The Big Sort": Boss mode, Expo theme, 40s speed challenge, all mechanics

### Star Criteria Design

Each level has human-readable star criteria descriptions that are shown to players:

**Standard Mode Progression:**
- Early levels: 2★ = 75-80% accuracy, 3★ = 95-100% accuracy + small combo
- Later levels: 2★ = 75% accuracy, 3★ = 90% accuracy + larger combo (4-5x)

**Timed Mode:**
- 2★: Accuracy + time remaining threshold (e.g., 70% acc + 25% time)
- 3★: Higher accuracy + better time ratio (e.g., 85% acc + 50% time)

**Boss Mode:**
- 2★: 70% accuracy to complete the challenge
- 3★: 90% accuracy + 60% time remaining (very difficult)

### Difficulty Progression Verification

The plan required smooth progression with no sudden spikes. Verified metrics:

**Genre Count:** 2→2→3→3→3→3→3→4→4→4 (gradual increase)
**Trash Count:** 0→1→1→2→2→2→3→3→4→4 (gentle ramp)
**Mystery Count:** 0→0→1→3→1→2→2→3→4→4 (introduced gradually)
**Dusty Count:** 0→0→0→0→3→2→2→3→4→4 (introduced at Store theme)
**Crate Capacities:** Increase from 2-3 (early) to 4-5 (late)

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. **Star criteria descriptions are player-facing:** Each level has plain-English descriptions like "Sort with 80% accuracy" instead of technical thresholds. This makes goals clear and achievable.

2. **Boss level timing:** Set to 40 seconds (tighter than Level 8's 50s) to create climactic pressure. Combined with 5-capacity crates and all mechanics for maximum challenge.

3. **Timed mode timing:** Level 6 gets 45s, Level 8 gets 50s despite being harder - this accounts for Level 8 having more mechanics to learn but rewards mastery.

4. **Special disc introduction:** Friendly specials (diamond, wildcard) come first at Level 7. Challenging specials (bomb, chain) come at Level 8 to avoid overwhelming players.

## Integration Points

**Imports Required:**
- `Genre` enum from types.ts
- `LevelMode` type from types.ts
- `ShopTheme` type from types.ts
- `SpecialDiscType` type from types.ts

**Exports Provided:**
- `CampaignLevelConfig` interface
- `CAMPAIGN_LEVELS` array (10 entries)
- `getCampaignLevel(levelNumber: number)` function

**Next Integration (Plan 03):**
- Game logic will need to read these configs
- Convert configs to actual Vinyl[] and Crate[] arrays
- Integrate star criteria with star calculation system

## Testing Notes

**Verified:**
- TypeScript compilation passes (no errors in levelConfigs.ts)
- Exactly 10 level configs exist
- Level 10 has Boss mode and Expo theme
- getCampaignLevel(1-10) returns configs
- getCampaignLevel(11+) should return null
- All Genre references use valid enum values
- Difficulty progression is smooth (no sudden spikes)

**Manual Review:**
- Each level has unique name and description
- Star criteria descriptions are human-readable
- Mode variety: 7 Standard, 2 Timed, 1 Boss
- Theme progression: Basement (1-4), Store (5-9), Expo (10)

## Next Steps

Plan 03 will:
1. Create level generator that reads these configs
2. Convert configs to actual game state (Vinyl[], Crate[])
3. Integrate with star calculation system
4. Add level selection UI showing star criteria

## Self-Check: PASSED

**Files Created:**
- [FOUND] /Users/martha2022/Documents/Claude code/Sleevo Vinyl Shop Manager/constants/levelConfigs.ts (363 lines)

**Commits:**
- [FOUND] 03b7e87 - feat(01-02): create 10 hand-crafted campaign levels

**Exports Verified:**
- [FOUND] CampaignLevelConfig interface defined
- [FOUND] CAMPAIGN_LEVELS array with 10 entries
- [FOUND] getCampaignLevel function exported

**Requirements Met:**
- [✓] 10 levels with smooth difficulty progression
- [✓] Each level has unique name, description, and explicit star criteria
- [✓] Mode variety: 7 Standard, 2 Timed, 1 Boss
- [✓] Theme progression: Basement (1-4), Store (5-9), Expo (10)
- [✓] All configs are pure data (no game logic, no React)
- [✓] Minimum 100 lines achieved (363 lines)
