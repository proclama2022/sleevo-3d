# Sleevo Vinyl Shop Manager - v2.0 Engagement Overhaul

## What This Is

A vinyl record sorting puzzle game that transforms from a monotonous drag-and-drop experience into an addictive hypercasual game with clear goals, satisfying feedback loops, and meaningful progression. Players organize vinyl records by genre into crates, with increasing complexity through hand-crafted levels and special mechanics.

## Core Value

**Every 30-60 seconds, the player must feel successful and want to play "just one more level".**

If the dopamine loop fails, the game fails. All design decisions prioritize frequent micro-victories and satisfying feedback over complexity.

## Requirements

### Validated

- ✓ Core drag-and-drop vinyl sorting mechanic — existing
- ✓ Multiple game modes (Standard, Timed, Sudden Death, Boss, Endless) — existing
- ✓ Combo system with multipliers — existing
- ✓ Special disc types (diamond, wildcard, bomb, chain, time) — existing
- ✓ Audio system with theme-based music and SFX — existing
- ✓ Theme progression (Basement → Store → Expo) — existing
- ✓ Collection and achievement systems — existing
- ✓ Tutorial system — existing

### Active

- [ ] **Star system (1-3 stars per level)** with clear criteria visible before/during play
- [ ] **60 hand-crafted campaign levels** organized into 6 worlds (10 levels each)
- [ ] **Boss levels every 10 levels** with unique hand-crafted challenges
- [ ] **Sub-goal system** with visible progress during gameplay (crate completion, combo milestones, special disc activations)
- [ ] **Enhanced visual feedback** (screen shake, slow-mo, particle effects for perfect plays)
- [ ] **Perfect Clear Bonus** with celebration animation when achieving 3 stars + all objectives
- [ ] **Level select screen** showing star progress (X/180 total stars)
- [ ] **Improved combo feedback** with escalating visual effects at 3x/5x/10x tiers
- [ ] **Crate completion celebration** with lock animation and confetti
- [ ] **Cosmetic unlock system** (themes: Neon, Retro 80s, Minimalist; backgrounds; vinyl skins)
- [ ] **Daily challenge system** with special rewards
- [ ] **Enhanced collection with Easter eggs** (famous real albums as rare finds)
- [ ] **Mystery vinyl reveal animation** with suspense and card-flip effect
- [ ] **Settings to disable random events** (or convert all to bonus-only)

### Out of Scope

- Power-ups or paid boosts — Maintain skill-based gameplay, zero pay-to-win
- Real-time multiplayer — Too complex for hypercasual genre
- Story/narrative elements — Focus on pure gameplay loop
- Negative random events (blackout, earthquake) — Remove frustration sources
- Complex meta-progression (skill trees, upgrades) — Keep progression lightweight

## Context

### Current Problem
Game becomes monotonous immediately because:
1. No clear objectives beyond "finish level" (no stars, no goals)
2. Weak dopamine loop (no micro-victories every 2-3 minutes)
3. Zero gameplay variety (all levels feel the same)
4. Progression without meaning (leveling up changes nothing visible)
5. Subtle visual feedback (doesn't celebrate player actions enough)

### Hypercasual Best Practices (2026 Research)
- **Dopamine hits every 2-3 minutes**: Micro-victories trigger repeat play
- **Lightweight progression**: Visual unlocks without gameplay complexity
- **Clear goals**: Players know exactly what success looks like
- **Satisfying feedback**: Visual/audio celebration for every good action
- **Hand-crafted + procedural mix**: Campaign for progression, endless for replayability
- **Frequent low-stakes wins**: Three-tier success system (1★/2★/3★)

### Reference Games
- **Fill the Fridge**: Level structure, clear objectives, satisfying placement
- **Candy Crush**: Star system, world progression, level select
- **Tetris Effect**: Visual juice, feedback intensity
- **Bejeweled**: Combo satisfaction, celebration animations

### Technical Environment
- React + TypeScript (Vite)
- Capacitor for iOS deployment
- Web Audio API for procedural audio
- Tailwind CSS for styling
- Existing codebase: 2225 lines App.tsx, modular services

## Constraints

- **Skill-based only**: No pay-to-win mechanics, no power-up purchases
- **Mobile-first**: Must work perfectly on iOS/Android with touch controls
- **Performance**: Maintain 60fps even with enhanced particle effects
- **Existing codebase**: Build on current architecture, don't rewrite from scratch
- **Backward compatibility**: Preserve existing saves/progress where possible

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 60 hand-crafted levels (not infinite random) | Hand-crafted allows controlled difficulty curve and teaching moments; research shows players need structure for engagement | — Pending |
| 3-star system with visible criteria | Clear goals = players know if they're succeeding; industry standard (Candy Crush, Angry Birds) | — Pending |
| Remove negative random events | Research shows frustration kills retention; bonus-only events feel rewarding | — Pending |
| Cosmetic-only unlocks (no gameplay power-ups) | Maintains skill-based purity; progression visible without breaking balance | — Pending |
| Separate campaign + endless modes | Campaign = structured progression; Endless = score attack for pros | — Pending |
| Enhance visual feedback significantly | "Juice" is critical for hypercasual retention; every action must feel powerful | — Pending |

---
*Last updated: 2026-02-10 after initialization*
