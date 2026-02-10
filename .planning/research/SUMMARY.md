# Project Research Summary

**Project:** Sleevo Vinyl Shop Manager - Hypercasual Game Enhancement
**Domain:** Mobile Puzzle Game (React/TypeScript)
**Researched:** 2026-02-10
**Confidence:** HIGH

## Executive Summary

Sleevo is a hypercasual vinyl sorting puzzle game that needs a complete progression system overhaul to transform it from a proof-of-concept into a market-ready product. Research shows the core mechanics are solid, but the game currently lacks the fundamental engagement loops that define successful hypercasual titles: clear objectives (3-star rating system), visible progression (level select with completion tracking), and satisfying feedback ("juice" through screen shake, particles, and audio-visual escalation). The existing codebase is well-structured using React 19 + TypeScript + Vite, making it suitable for incremental enhancement without major refactoring.

The recommended approach is to build progression systems in dependency order: first implement the star rating and level select infrastructure (foundation for all engagement features), then create 20 hand-crafted campaign levels to validate difficulty curve and core loop stickiness, followed by enhanced visual feedback to amplify satisfaction. Only after this core loop is proven engaging should meta-features like cosmetic unlocks and daily challenges be added. This staged approach minimizes risk by validating each layer before building on top of it.

Key risks center on three areas: difficulty curve balancing (research shows 20% of players abandon at first difficulty spike), maintaining 60fps on mobile devices during particle-heavy celebrations, and avoiding grinding-based progression that creates obligation rather than joy. These risks are mitigated by playtesting with fresh users after every 5 levels, implementing device-tier detection to reduce particle counts on low-end mobile, and gating progression by completion (not star grinding) so players can always advance with 1-star performance while perfectionists chase 3-stars.

## Key Findings

### Recommended Stack

The existing stack (React 19.2.4, TypeScript 5.8.2, Vite 6.2.0, Tailwind CSS 3.4.17, Capacitor 8.0.2) is optimal for hypercasual mobile game development and requires minimal additions. Research recommends adding Zustand (5KB state management) only if React Context causes performance issues, GSAP for animation orchestration (maintains 60fps with complex sequences better than Motion), and potentially custom canvas-based particles instead of the outdated @tsparticles/react library.

**Core technologies:**
- **React 19 + TypeScript**: Already in use - automatic batching and concurrent features support 60fps game UI updates
- **GSAP**: Recommended for game mechanics animations - handles screen shake, slow-mo, combo effects without frame loss
- **Zustand**: Use only if needed - lightweight global state for complex interdependent game state (combo + progression + achievements)
- **Custom Canvas Particles**: Replace @tsparticles/react - lighter weight, better mobile performance for critical feedback moments
- **Capacitor Haptics**: Already installed - integrate tactile feedback for vinyl drops, combos, level complete

**Critical pattern:** Keep game loops OFF React re-renders. Use refs + requestAnimationFrame for 60fps mechanics, sync to React state only for UI updates (score display, level complete). This prevents setState every frame which tanks performance.

### Expected Features

Research into hypercasual puzzle games (Candy Crush, Angry Birds, Fill the Fridge) reveals clear hierarchy of expected features versus differentiators.

**Must have (table stakes):**
- **3-star rating system per level** - industry standard since Angry Birds; without this, players don't know what "winning" looks like
- **Level select screen with progress visualization** - shows advancement, prevents "am I getting anywhere?" feeling
- **Clear level objectives shown before play** - star criteria must be explicit ("Complete in 30s + 5x combo") not mysterious
- **Instant feedback on every action** - hypercasual requires immediate visual + audio + haptic response to taps/drags
- **Micro-victories every 30-60 seconds** - crate completion celebrations, combo milestones create dopamine loop fundamental to retention
- **Hand-crafted difficulty curve** - gradual learning prevents frustration; research shows 20% abandon at first difficulty spike
- **One-tap instant restart** - "just one more try" impulse dies with friction in restart flow

**Should have (competitive advantage):**
- **Theme progression (Basement → Store → Expo)** - environmental storytelling without narrative complexity; already exists in codebase
- **Boss levels every 10 levels** - punctuates progression with climax moments; uncommon in competitors
- **Genre-aware particle effects** - Rock/Jazz/Disco get unique explosion colors/shapes; adds personality to mechanics
- **Collection system with album Easter eggs** - taps into vinyl culture nostalgia; appeals to music fans specifically
- **Perfect Clear Bonus** - rewards mastery beyond 3-stars; creates aspirational "perfect run" goal
- **Secondary objectives system** - adds depth without complexity for experienced players

**Defer (v2+):**
- **Endless mode with leaderboards** - requires score balancing and anti-cheat; not core to initial engagement validation
- **Theme-specific campaigns** - requires 3x content creation; validate single campaign first
- **Seasonal events** - requires live-ops infrastructure; premature before retention proven
- **Replays/ghost data** - nice-to-have for competitive players but not engagement-critical

### Architecture Approach

Mobile puzzle games follow layered architecture separating pure TypeScript business logic from React presentation. The existing Sleevo codebase already uses this pattern with services folder (gameLogic.ts, storage.ts, audio.ts) and should be extended rather than refactored. New systems should maintain this separation: ProgressionService for star calculation, UnlockService for cosmetic logic, ChallengeService for daily rotation, and VFXManager to coordinate multiple feedback types (visual, audio, haptic) without conflicts.

**Major components:**

1. **ProgressionService** (services/progression.ts) - Pure functions for star calculation, level unlocking, XP progression. Exports `calculateStars(score, time, objectives) → 0-3 stars`.

2. **VFXManager** (services/vfx.ts) - Queue-based effect coordination. Prevents conflicts (multiple screen shakes), ensures cleanup, centralizes "juice" logic. Handles screen shake, particles, slow-mo, haptics with priority system.

3. **StorageService** (extend existing storage.ts) - Add new SaveData fields: `levelStars: Record<number, number>`, `totalStars: number`, `unlockedCosmetics: string[]`, `dailyChallenges: Record<string, DailyChallengeRecord>`.

4. **LevelSelect UI** (components/LevelSelect.tsx) - World map navigation showing 60 level nodes with star visualization. Use virtualization (render only visible 20-30 nodes) for mobile performance.

5. **React Hook Abstraction** (hooks/useProgression.ts) - Custom hooks wrap service calls, manage component state. Components never call services directly. Keeps components thin and testable.

**Key patterns:** Service layer (pure TypeScript, no React coupling), data-driven progression (configuration files not hardcoded logic), effect queue system (coordinated feedback without conflicts), refs for game loops (not React state for per-frame updates).

### Critical Pitfalls

Research into hypercasual game design failures and React game development patterns reveals eight critical pitfalls, with top five listed here:

1. **Difficulty Curve Too Steep** - Players abandon at first difficulty spike; completion rate drops 15%+ between consecutive levels indicate wall. **Avoid by:** designing levels in progression arcs (1-10 tutorial, 11-30 skill building, 31-50 mastery, 51-60 perfection), testing each transition with fresh players, introducing ONE new concept per level, tracking completion rates per level.

2. **Poor First-Time User Experience (FTUE)** - The average app loses 80% of users in first three days, primarily from poor onboarding. Tutorial that's too long/complex leaves players unprepared. **Avoid by:** keeping tutorial to 2-3 levels max (30-90 seconds total), introducing most basic AND exciting mechanic first (drag-and-drop vinyl with immediate feedback), letting players discover secondary features over time (don't explain combo + stars + special discs all in level 1), no forced account creation or ads before first successful completion.

3. **Star System Without Clear Criteria** - Players complete levels without understanding what determines rating, reducing replay motivation. Star criteria ambiguity kills dopamine loop. **Avoid by:** displaying criteria BEFORE level starts ("⭐ Complete | ⭐⭐ Complete in 45s | ⭐⭐⭐ Complete in 30s + 5x combo"), showing real-time progress toward thresholds during gameplay, making criteria achievable on first try but challenging for 3-stars (target: 70% get 1★, 40% get 2★, 15% get 3★), visualizing "you just earned 2nd star!" moments with celebration animations.

4. **Insufficient Visual Feedback ("Juice")** - Actions feel flat despite correct mechanics. Modern hypercasual design proves "juice" is not optional polish but core to engagement. **Avoid by:** layering feedback types (visual + audio + haptic), escalating intensity with combo tiers (3x = small shake, 10x = dramatic shake + slow-mo), using genre-specific particle effects, celebrating crate completion as milestone moments, implementing easing functions for all animations (no linear motion), testing on muted device (should still feel satisfying through visuals alone).

5. **Monotonous Level Design** - Despite having 60 unique levels, gameplay feels repetitive because levels differ only in vinyl count/genre distribution without introducing new patterns or challenges. **Avoid by:** designing each world with thematic twist (World 1 = fundamentals, World 2 = time pressure, World 3 = combo mastery, World 4 = special discs, World 5 = perfect placement, World 6 = synthesis), hand-crafting boss levels as unique puzzles not just "harder normal level", creating level pattern archetypes (Speed Run, Rainbow, Chaos, Specialist), alternating intensity levels (hard → easy → hard) not linear difficulty increase.

**Additional critical concerns:** Grinding instead of flow state (gate by completion not star grinding, allow 1-star forward progress), daily challenge burnout (single daily system, 2-5 min completion time, nice-to-have rewards not must-have), React performance traps (putting vinyl drag positions in state causes stuttering, use refs for animation state), mobile performance (max 15 simultaneous particles, GPU-accelerated transforms only, debounce localStorage saves).

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Campaign Structure & Star System Foundation
**Rationale:** Star rating is foundational - almost all engagement features depend on it. Research shows players need clear objectives or they don't know if they're winning. Must be first priority before building any other progression systems.

**Delivers:**
- Star calculation service with configurable thresholds per level
- Extended SaveData schema with level star tracking
- Star display UI on victory screen with animated celebration
- Level unlocking logic based on completion (not star grinding)
- Initial 10 tutorial/foundation levels hand-crafted with tested difficulty curve

**Addresses:**
- Table stakes: Clear level objectives, progress visualization foundation
- Pitfall #2: Poor FTUE - tutorial levels designed and tested first
- Pitfall #3: Star criteria clarity - system designed with explicit visible criteria
- Pitfall #6: Grinding vs Flow - gate by completion, 1-star allows forward progress

**Stack elements:** Pure TypeScript services (progression.ts), extend existing storage.ts, React hooks abstraction pattern (useProgression)

**Research flag:** STANDARD PATTERNS - star rating systems are well-documented in hypercasual design literature; skip deep research.

---

### Phase 2: Level Design System & Campaign Expansion
**Rationale:** With star foundation in place, need to validate difficulty curve and core loop stickiness before building meta-features. Hand-crafted levels (not procedural) enable controlled difficulty progression which research shows is critical for retention.

**Delivers:**
- Remaining 50 campaign levels (total 60) hand-crafted in 6 worlds of 10 levels each
- Boss level designs every 10 levels with unique challenges
- Level archetype templates (Speed Run, Rainbow, Chaos, Specialist) for variety
- Difficulty calculator tool scoring level complexity across dimensions
- Data-driven level configuration files (constants/levels.ts) for designer balance adjustments

**Addresses:**
- Table stakes: Difficulty curve, level variety, session flexibility (60-90s per level)
- Differentiators: Boss levels, theme progression integration
- Pitfall #1: Difficulty curve - map progression before designing individual levels, test every 5 levels
- Pitfall #5: Monotonous design - world-based thematic twists, pattern archetypes, intensity alternation

**Implements:** Level configuration system (data-driven), difficulty validation tooling, world-based progression structure

**Research flag:** NEEDS RESEARCH - each world's thematic twist may need mechanic research (e.g., World 4 special discs patterns). Plan `/gsd:research-phase` for boss level design patterns.

---

### Phase 3: Enhanced Feedback & Visual Effects ("Juice")
**Rationale:** Once core gameplay loop is validated with playable levels, enhance satisfaction through feedback amplification. Research shows "juice" is not optional for hypercasual but differentiator between games that feel good and those that don't. Pure enhancement layer - can iterate without breaking existing features.

**Delivers:**
- VFXManager service with effect queue and priority system
- Screen shake implementation tied to combo tiers (3x/5x/10x escalation)
- Enhanced particle systems: genre-specific colors, celebration moments, crate completion
- Slow-motion effect on high combos (10x+)
- Integrated haptic feedback (light/medium/heavy) for key moments
- Combo display component with animated counter and tier visualization

**Addresses:**
- Table stakes: Instant feedback on actions, micro-victories every 30-60s
- Differentiators: Genre-aware particle effects, combo tier escalation
- Pitfall #4: Insufficient juice - layer feedback types, escalate with combos, test on muted device

**Uses:** GSAP for animation orchestration, Capacitor Haptics (already installed), custom Canvas particles for mobile performance, VFXManager queue pattern

**Research flag:** STANDARD PATTERNS - screen shake and particle effects are well-documented game design patterns; reference existing implementations.

---

### Phase 4: Level Progression UI (World Map & Navigation)
**Rationale:** Players need to see progress and access completed levels. Level select is table stakes for puzzle games. Built after core levels exist so there's content to navigate. Requires star data from Phase 1 to display properly.

**Delivers:**
- LevelSelect component with 60 level nodes in 6-world structure
- Star visualization per level (0-3 stars displayed)
- Lock/unlock state indication (completed levels, current level, locked levels)
- World-based visual theming (Basement/Store/Expo aesthetics)
- Navigation from main menu to level select to gameplay
- Level preview with star criteria display before starting

**Addresses:**
- Table stakes: Progress visualization, level select screen, clear objectives shown before play
- Differentiators: Theme progression visual integration

**Implements:** LevelSelect architecture component, world layout configuration, virtualized rendering for mobile performance

**Research flag:** STANDARD PATTERNS - level select UI patterns are established in mobile puzzle games; reference Candy Crush, Angry Birds implementations.

---

### Phase 5: Cosmetic Progression & Unlocks
**Rationale:** Adds long-term goals and rewards for star collection without affecting gameplay fairness. Only valuable after core loop is proven engaging - retention feature, not foundation. Research warns against loot box psychology; use deterministic progress only.

**Delivers:**
- Unlock definitions: themes, backgrounds, vinyl skins (constants/unlocks.ts)
- UnlockService checking conditions based on star milestones
- UnlockModal celebration UI for new cosmetics
- Extension of existing CustomizationScreen with new cosmetics
- Collection tracking in SaveData with deterministic unlock criteria
- Album Easter egg system with famous vinyl references (visual only, no licensing)

**Addresses:**
- Table stakes: Progression rewards (cosmetic unlocks tied to star milestones)
- Differentiators: Collection system with real album Easter eggs
- Pitfall #8: Loot box psychology - use deterministic progress only, transparent criteria, no randomized drops

**Implements:** UnlockService architecture component, data-driven cosmetic configuration

**Research flag:** STANDARD PATTERNS - cosmetic progression without gambling mechanics is well-documented ethical design pattern.

---

### Phase 6: Daily Challenges & Retention Hooks
**Rationale:** Built last after campaign is proven sticky. Daily challenges are meta-feature enhancement, not foundation. Research shows they boost retention 30% when done right but cause burnout when stacked or too demanding. Single daily system, optional participation.

**Delivers:**
- Daily challenge rotation using deterministic day seed
- Challenge pool (100+ predefined unique challenges) in configuration
- DailyChallengeCard component in main menu
- Challenge types: speed run, combo challenge, genre focus, perfect clear
- Bonus cosmetic unlock progress as reward (not progression-blocking)
- Challenge completion tracking with date stamps in SaveData

**Addresses:**
- Differentiators: Daily challenges with unique rewards
- Pitfall #7: Daily challenge burnout - single system, 2-5 min completion, nice-to-have rewards, optional participation

**Implements:** ChallengeService architecture component, seeded RNG for daily rotation

**Research flag:** STANDARD PATTERNS - daily challenge systems are well-documented in mobile F2P design; reference existing rotation patterns.

---

### Phase Ordering Rationale

**Dependency-driven order:**
- Phase 1 must be first - star system is foundational dependency for all other phases
- Phase 2 depends on Phase 1 - need star calculation to set level difficulty targets
- Phase 4 depends on Phase 1 & 2 - level select needs star data and level content to display
- Phase 5 depends on Phase 1 - unlock conditions based on star milestones
- Phase 6 is last - daily challenges reuse existing level generation, provide variety after campaign complete

**Risk mitigation order:**
- Phases 1-3 validate core engagement loop before meta-features (star system + levels + juice = complete core experience)
- Building 10 levels in Phase 1 allows early testing before committing to full 60-level production
- Phase 3 (juice) is pure enhancement - can iterate based on playtesting without breaking other systems
- Meta-features (Phases 5-6) only built after retention is proven, avoiding wasted effort on features nobody will reach

**Architecture-driven grouping:**
- Phase 1 establishes service layer pattern (ProgressionService) that other phases follow
- Phase 3 introduces VFXManager which becomes reusable infrastructure for later celebration moments
- Phase 4-6 are parallel-buildable once foundation exists (different developers can work simultaneously)

**Pitfall avoidance strategy:**
- Phase 1-2 directly address FTUE and difficulty curve (design and test early)
- Phase 3 prevents "insufficient juice" by dedicating full phase to feedback enhancement
- Phase 2's validation step prevents building 60 levels before testing core loop (content scope pitfall)
- Phase 6 as last prevents daily challenge burnout by only adding after core retention proven

### Research Flags

**Phases likely needing deeper research during planning:**

- **Phase 2 (Level Design System):** Boss level design patterns may need research - unique puzzle mechanics for climax moments. Consider `/gsd:research-phase` for boss level archetypes if patterns aren't clear during planning.

- **Phase 3 (Enhanced Feedback):** Device-tier detection for performance scaling - research optimal particle counts per device tier, GPU acceleration techniques for mobile. May need technical research on Canvas optimization vs DOM particles.

**Phases with standard patterns (skip research-phase):**

- **Phase 1:** Star rating systems have extensive documentation in hypercasual design literature. Three-star progression is industry standard with clear implementation patterns.

- **Phase 4:** Level select UI patterns are well-established in mobile puzzle games. Reference implementations from Candy Crush, Angry Birds provide clear templates.

- **Phase 5:** Deterministic cosmetic progression without gambling mechanics is documented ethical design pattern. Avoid randomization, use milestone-based unlocks.

- **Phase 6:** Daily challenge rotation systems are standard in mobile F2P design. Seeded RNG for deterministic daily selection is well-documented pattern.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Existing React + TypeScript + Vite stack is optimal for hypercasual mobile. Recommendations (GSAP, Zustand) backed by performance comparisons and official documentation. Version compatibility verified. |
| Features | HIGH | Extensive research into hypercasual standards (Candy Crush, Angry Birds, Fill the Fridge case studies). 3-star systems, level select, progress visualization are table stakes with clear evidence. Differentiators validated by competitive analysis. |
| Architecture | HIGH | Service layer pattern is established game development best practice. Component boundaries tested in existing codebase (storage.ts, gameLogic.ts, audio.ts work well). Performance patterns validated by React at 60fps research and mobile game development guides. |
| Pitfalls | HIGH | Critical pitfalls backed by multiple authoritative sources (GameAnalytics, Game Developer Magazine, research papers on loot boxes and difficulty curves). Mobile performance traps validated by React Native performance optimization research. Technical debt patterns common across React game projects. |

**Overall confidence:** HIGH

Research synthesizes findings from 50+ sources including official documentation (Capacitor, GSAP, React), industry analytics firms (GameAnalytics, GameAnalytics), game design authorities (Game Developer Magazine, GameDesignSkills), and academic research (loot box psychology studies). Recommendations align across multiple independent sources. Key patterns (3-star rating, service layer architecture, FTUE best practices) have extensive real-world validation.

### Gaps to Address

**Performance benchmarking on target devices:**
- Research identifies performance patterns but actual targets (iPhone SE 2020, Samsung Galaxy A52) need validation during Phase 1
- **Handle by:** Implement FPS counter in dev mode, test on real devices after Phase 1 foundation, establish actual particle count limits
- Budget exists (16.67ms per frame at 60fps) but need to measure actual overhead of star calculation, particle spawning, localStorage saves

**Level difficulty balancing methodology:**
- Research provides principles (gradual curve, one new concept per level) but specific difficulty scoring algorithm needs development
- **Handle by:** Create difficulty calculator tool during Phase 2 that scores levels across dimensions (vinyl count, genre count, time pressure, special discs)
- Test with fresh players every 5 levels, track completion rates, adjust thresholds based on data

**Boss level mechanic patterns:**
- Research shows boss levels should be "hand-crafted puzzles with unique solutions" but specific mechanic types need design exploration
- **Handle by:** Plan `/gsd:research-phase` during Phase 2 roadmap execution to research puzzle game boss mechanics (time attack variants, constraint-based challenges, pattern recognition)
- Reference games: Angry Birds boss levels, Peggle fever mode, Tetris Effect zone mechanics

**Device tier detection accuracy:**
- Architecture recommends device-tier detection (low/med/high) but accuracy of hardwareConcurrency + deviceMemory heuristics unverified
- **Handle by:** During Phase 3, implement basic detection, gather analytics on actual performance per tier, refine algorithm based on field data
- Fallback: conservative particle counts initially, progressive enhancement based on demonstrated performance

**Daily challenge engagement metrics:**
- Research shows daily challenges boost retention 30% when done right but specific implementation details (frequency, difficulty, reward value) need A/B testing
- **Handle by:** During Phase 6 planning, define metrics for success (target 60% completion rate stable over 30 days), instrument analytics, plan A/B test variants (daily vs every 3 days vs weekly)
- Start with daily frequency, adjust based on completion trends and player feedback

## Sources

### Primary (HIGH confidence)

**Official Documentation:**
- [Capacitor Haptics Plugin API](https://capacitorjs.com/docs/apis/haptics) - Tactile feedback integration patterns
- [GSAP Official Docs](https://motion.dev/docs/gsap-vs-motion) - Animation performance comparison with Motion
- [Announcing Zustand v5](https://pmnd.rs/blog/announcing-zustand-v5) - State management library official release notes
- [tsParticles Official Site](https://particles.js.org/) - Particle system library documentation

**Industry Analytics & Research:**
- [GameAnalytics: Hybrid-casual higher retention](https://www.gameanalytics.com/blog/hybrid-casual-higher-retention-better-engagement) - Retention strategy research from major analytics firm
- [CrazyLabs: 5 Tips for Improving Retention](https://www.crazylabs.com/blog/5-tips-for-improving-retention-in-hybrid-casual-games/) - Best practices from major mobile game publisher
- [Moloco: Hyper Casual Game Design Guide](https://www.moloco.com/blog/hyper-casual-games-design) - Comprehensive industry research on hypercasual patterns

**Game Design Authority:**
- [Game Developer: Compulsion Loops & Dopamine](https://www.gamedeveloper.com/design/compulsion-loops-dopamine-in-games-and-gamification) - Dopamine loop mechanics from authoritative publication
- [Game Developer: Difficulty Curves](https://www.gamedeveloper.com/design/difficulty-curves) - Difficulty progression research
- [Game Programming Patterns](https://gameprogrammingpatterns.com/architecture-performance-and-games.html) - Established architecture patterns for games

### Secondary (MEDIUM confidence)

**Performance & Best Practices:**
- [React at 60 FPS - Optimizing performance](https://g3f4.github.io/react-at-60-fps/) - React game performance optimization techniques
- [Using requestAnimationFrame with React Hooks](https://css-tricks.com/using-requestanimationframe-with-react-hooks/) - Animation loop patterns in React
- [React Native Performance Optimization Guide 2025](https://baltech.in/blog/react-native-performance-optimization-best-practices/) - Mobile performance patterns

**State Management:**
- [State Management in 2025: Context, Redux, Zustand, Jotai](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k) - Comparison of state management approaches
- [Top 5 React State Management Tools 2026](https://www.syncfusion.com/blogs/post/react-state-management-libraries) - State library comparison

**Animation Libraries:**
- [GSAP vs. Framer Motion Comprehensive Comparison](https://tharakasachin98.medium.com/gsap-vs-framer-motion-a-comprehensive-comparison-0e4888113825) - Performance comparison between animation libraries
- [Comparing Framer Motion and GSAP Performance](https://blog.uavdevelopment.io/blogs/comparing-the-performance-of-framer-motion-and-gsap-animations-in-next-js) - Animation library benchmarking

**Hypercasual Design:**
- [Hyper Casual Game Development in 2026](https://medium.com/@jackjill7659/hyper-casual-game-development-in-2026-scaling-engagement-speed-and-profitability-18413a5ae0d6) - Industry trends and best practices
- [Making a Hyper-Casual Game? 5 Common Mistakes to Avoid](https://www.gameanalytics.com/blog/hyper-casual-game-common-mistakes) - Pitfall identification
- [Lifting Retention in Hyper-Casual Games: Case Study](https://www.theexperimentation.group/our-work/lifting-retention-in-hyper-casual-games) - Real-world retention optimization

**Visual Feedback & Juice:**
- [Squeezing more juice out of your game design](https://www.gameanalytics.com/blog/squeezing-more-juice-out-of-your-game-design) - Game feel enhancement patterns
- [What makes for good visual game juice?](https://medium.com/swlh/what-makes-for-good-visual-game-juice-e63cb8ba2068) - Feedback design principles
- [Juice in Game Design: Making Games Feel Amazing](https://www.bloodmooninteractive.com/articles/juice.html) - Visual feedback best practices

**FTUE & Onboarding:**
- [First-Time User Experience In Mobile Games](https://www.blog.udonis.co/mobile-marketing/mobile-games/first-time-user-experience) - FTUE research and statistics
- [10 Tips For A Great FTUE](https://www.gameanalytics.com/blog/tips-for-a-great-first-time-user-experience-ftue-in-f2p-games) - Onboarding best practices
- [Best Practices For Mobile Game Onboarding](https://adriancrook.com/best-practices-for-mobile-game-onboarding/) - Expert consultant guidance

**Progression Systems:**
- [What are Progression Systems in Games?](https://www.universityxp.com/blog/2024/1/16/what-are-progression-systems-in-games) - Comprehensive progression system overview
- [Game Progression and Progression Systems](https://gamedesignskills.com/game-design/game-progression/) - Design principles
- [7 progression systems every developer should study](https://www.gamedeveloper.com/design/7-progression-and-event-systems-that-every-developer-should-study) - Case studies

### Tertiary (LOW confidence, needs validation)

**Loot Box Psychology:**
- [The Psychology of Loot Boxes](https://medium.com/@OVI_E-SPORTS/the-psychology-of-loot-boxes-reward-chance-and-controversy-6b975594d1f8) - Overview of gambling mechanics
- [Loot box spending associated with problem gambling](https://royalsocietypublishing.org/doi/10.1098/rsos.220111) - Academic research paper
- [Unpacking the Phenomenon of Loot Boxes](https://medium.com/@milijanakomad/product-design-and-psychology-unpacking-the-phenomenon-of-loot-boxes-in-video-game-design-d22f81032b81) - Design ethics

**Difficulty & Balance:**
- [Mastering Game Difficulty Curves](https://www.numberanalytics.com/blog/mastering-game-difficulty-curves) - Difficulty design methodology
- [Skill vs RNG: Debate of Controlling Progress](https://www.gamedeveloper.com/design/skill-vs-rng----the-debate-of-controlling-progress) - Balance philosophy

**Session Metrics:**
- [Hyper-casual game metrics](https://hc.games/hyper-casual-game-metrics/) - Industry benchmarks (median session 6:42, average 2:39)
- [2020 in Metrics: Understanding Casual and Hypercasual Markets](https://www.gameanalytics.com/blog/2020-in-metrics-understanding-casual-and-hypercasual-gaming-markets) - Market analysis

---
*Research completed: 2026-02-10*
*Ready for roadmap: yes*
