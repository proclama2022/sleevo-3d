# Feature Research

**Domain:** Hypercasual puzzle game (vinyl record sorting)
**Researched:** 2026-02-10
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Clear level objectives** | Players need to know what "winning" looks like; industry standard since Angry Birds (2010) | LOW | Star criteria visible before/during play; 1-3 stars based on score/performance thresholds |
| **Progress visualization** | Shows player they're advancing; prevents "am I getting anywhere?" feeling | LOW | Level select screen with stars earned (X/180), world map showing completion |
| **Instant feedback on actions** | Hypercasual requires immediate response to every tap/drag; silence = broken game feel | MEDIUM | Visual (particles, screen shake) + audio (SFX) + haptic on every vinyl placement |
| **Micro-victories every 30-60s** | Dopamine loop fundamental to hypercasual retention; research shows 2-3 minute victory cycles critical | MEDIUM | Crate completion celebrations, combo milestones, sub-goals during level |
| **Tutorial with skip option** | First-time users need guidance; veterans demand immediate gameplay | LOW | Existing tutorial with prominent skip button; save data detects returning players |
| **Progression rewards** | Players expect visible payoff for advancement; "what do I get?" is universal question | MEDIUM | Cosmetic unlocks (themes, skins, backgrounds) tied to star milestones |
| **Difficulty curve** | Gradual learning curve prevents frustration; sudden spikes = abandonment | HIGH | Hand-crafted 60-level campaign with controlled pacing; introduce one mechanic at a time |
| **Immediate restart** | Hypercasual lives on "one more try"; friction in restart = player exits | LOW | One-tap restart button always visible; no confirmation dialog |
| **Level variety** | Repetition without novelty = boredom; research shows balance critical | HIGH | Hand-crafted levels with unique layouts, special disc patterns, themed challenges every 10 levels |
| **Session flexibility** | Hypercasual = 30s-5min sessions; must pause/resume instantly | LOW | Levels complete in 60-90s; pause doesn't penalize; auto-save progress |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Theme progression (Basement → Store → Expo)** | Environmental storytelling without narrative complexity; visual variety without new mechanics | MEDIUM | Existing in codebase; theme-specific music and aesthetics create sense of journey |
| **Genre-aware particle effects** | Each genre (Rock/Jazz/Funk) has unique explosion colors/shapes; adds personality to abstract mechanic | LOW | Visual polish differentiator; makes identical mechanics feel varied |
| **Collection system with real album Easter eggs** | Taps into vinyl culture nostalgia; rewards recognition ("that's Dark Side of the Moon!") | MEDIUM | Famous albums as rare drops create discovery moments; appeals to music fans specifically |
| **Boss levels every 10 levels** | Punctuates progression with climax moments; research shows players remember peaks | HIGH | Hand-crafted challenges with unique constraints (e.g., "sort 50 vinyls in 90s") |
| **Perfect Clear Bonus** | Rewards mastery beyond 3-stars; creates aspirational "perfect run" goal | MEDIUM | Special animation + bonus when achieving 3★ + all sub-objectives in one play |
| **Secondary objectives system** | Adds depth without complexity; "complete level" vs "complete level + 5 combos + no mistakes" | MEDIUM | Visible during play; optional challenges for experienced players |
| **Daily challenges** | Creates external motivation to return; FOMO from limited-time rewards | MEDIUM | Single special level per day with unique rewards (exclusive skins/themes) |
| **Mystery vinyl reveal animation** | Transforms mundane "wildcard" mechanic into moment of suspense and delight | LOW | Card-flip animation with anticipation build-up before genre reveal |
| **Combo tier escalation** | Visual feedback intensifies at 3x/5x/10x; makes skill progression feel visceral | MEDIUM | Screen shake + particle density + audio pitch increases with combo tier |
| **Procedural music per theme** | Web Audio API generates music dynamically; zero asset loading = instant play | MEDIUM | Existing in codebase; unique selling point for web-based game |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Power-ups or boosters** | "Candy Crush has them" | Breaks skill-based purity; creates pay-to-win perception even if free; balancing nightmare | Secondary objectives provide optional advantages through mastery, not purchases |
| **Real-time multiplayer** | "Make it social" | Massive complexity for hypercasual; requires servers, matchmaking, cheat prevention; session flexibility dies | Daily challenge leaderboards provide async competition without technical overhead |
| **Story/narrative mode** | "Give it meaning" | Text skipping = wasted dev time; hypercasual players want gameplay loop, not lore | Theme progression (Basement → Expo) provides environmental storytelling without interruption |
| **Negative random events (blackout, earthquake)** | "Add unpredictability" | Research shows frustration kills retention; players blame game, not themselves | Bonus-only random events (magnet, gold vinyl, bonus time) maintain surprise without punishment |
| **Complex skill trees or upgrade systems** | "Give players choices" | Analysis paralysis breaks hypercasual flow; fear of "wrong" choices creates anxiety | Linear cosmetic unlocks tied to star milestones; no decisions, just rewards |
| **Infinite procedural levels only** | "Saves hand-crafting time" | Players need structure for engagement; research shows controlled difficulty curves retain better | 60 hand-crafted campaign levels + separate endless mode for score attack |
| **Social sharing after every level** | "Viral growth hack" | Interrupts dopamine loop; players want "one more level," not social flow | Share button in pause menu; never force sharing in critical path |
| **Video ads between levels** | "Monetization strategy" | Destroys "just one more level" impulse; research shows retention drop from forced ads | Optional rewarded ads for bonus rewards only; never gate core gameplay |
| **Energy/lives system** | "Industry standard for F2P" | Creates negative emotion (punishment for playing); incompatible with "just one more level" core value | Unlimited plays; monetize through cosmetics and ad removal, not access restriction |
| **Forced tutorials** | "Ensure everyone learns" | Patronizes experienced players; research shows big visible skip button critical | Existing tutorial with prominent skip; returning player detection skips automatically |

## Feature Dependencies

```
Star System (1-3 per level)
    ├──requires──> Clear level objectives
    └──requires──> Score calculation system [EXISTS]

Hand-crafted Campaign (60 levels)
    ├──requires──> Level data structure
    ├──requires──> Difficulty curve design
    └──enables──> Boss levels (every 10th level)

Progress Visualization
    ├──requires──> Level select screen
    ├──requires──> Star system
    └──enables──> World map UI

Visual Feedback Enhancement
    ├──requires──> Particle system [EXISTS]
    ├──requires──> Screen shake implementation
    └──enhances──> Every other feature

Cosmetic Unlocks
    ├──requires──> Theme system [EXISTS]
    ├──requires──> Star milestone tracking
    └──requires──> Asset creation (themes, skins, backgrounds)

Daily Challenges
    ├──requires──> Date/time logic
    ├──requires──> Separate challenge level pool
    └──requires──> Special reward system

Secondary Objectives
    ├──requires──> Objective tracking system
    ├──requires──> Progress UI during gameplay
    └──enhances──> Star system (3rd star criteria)

Perfect Clear Bonus
    ├──requires──> Star system (3★)
    ├──requires──> Secondary objectives (all completed)
    └──requires──> Special celebration animation

Boss Levels
    ├──requires──> Hand-crafted campaign structure
    ├──requires──> Unique level constraints system
    └──requires──> Enhanced visual treatment
```

### Dependency Notes

- **Star System is foundational:** Almost all engagement features depend on it. Must be first priority.
- **Visual Feedback Enhancement is universal:** Once implemented, applies to all features. High ROI.
- **Hand-crafted Campaign enables Boss Levels:** Boss levels are meaningless without campaign structure. Cannot exist independently.
- **Cosmetic Unlocks require Star System:** Rewards need progression metric. Star milestones are the unlock trigger.
- **Secondary Objectives enhance replayability:** Adds depth to star system without new mechanics. Must integrate cleanly with level objectives UI.

## MVP Definition

### Launch With (v1.0)

Minimum viable product for hypercasual engagement validation.

- [x] **Core sorting mechanic** — Existing; drag-and-drop with genre matching
- [x] **Combo system** — Existing; provides skill expression
- [x] **Audio/visual feedback** — Existing; needs enhancement, not rebuild
- [x] **Special disc types** — Existing; adds variety
- [ ] **Star system (1-3 per level)** — CRITICAL; without this, no clear objectives (player doesn't know if winning)
- [ ] **Level select screen** — CRITICAL; without this, no progress visualization (player doesn't feel advancement)
- [ ] **20 hand-crafted campaign levels** — MINIMUM; enough to validate difficulty curve (3-4 worlds)
- [ ] **Enhanced visual feedback** — CRITICAL; hypercasual lives on "juice" (screen shake, particle intensity, combo escalation)
- [ ] **Crate completion celebration** — CRITICAL; micro-victory every 30-60s (lock animation, confetti, audio cue)
- [ ] **Tutorial skip button enhancement** — QUALITY OF LIFE; returning players must reach gameplay instantly

**Why these for v1.0:**
- Star system + level select = solves "no clear objectives" problem
- 20 campaign levels = validates hand-crafted approach without over-investing
- Enhanced feedback = solves "subtle celebration" problem
- Crate celebrations = creates dopamine loop micro-victories

### Add After Validation (v1.x)

Features to add once core engagement loop is proven working.

- [ ] **Expand to 60 campaign levels** — Trigger: positive player retention metrics from v1.0 20-level test
- [ ] **Boss levels every 10 levels** — Trigger: campaign expansion; creates progression peaks
- [ ] **Secondary objectives system** — Trigger: players mastering 3-star system and asking for more depth
- [ ] **Perfect Clear Bonus** — Trigger: secondary objectives proven popular
- [ ] **Cosmetic unlock system** — Trigger: progression rewards needed for long-term retention
- [ ] **Mystery vinyl reveal animation** — Trigger: cosmetic unlocks implemented (enhances discovery moment)
- [ ] **Daily challenges** — Trigger: core campaign completed by early players; need daily return incentive
- [ ] **Collection Easter eggs (real albums)** — Trigger: collection system shown to be popular with players
- [ ] **Settings to disable random events** — Trigger: if player feedback shows random events are frustrating (may not be needed if bonus-only)

### Future Consideration (v2.0+)

Features to defer until product-market fit is established.

- [ ] **Endless mode with leaderboards** — Why defer: requires score balancing and anti-cheat; not core to initial engagement validation
- [ ] **Theme-specific campaigns** — Why defer: requires 3x content creation (one per theme); validate single campaign structure first
- [ ] **Collaborative challenges** — Why defer: async multiplayer adds complexity; single-player must work first
- [ ] **Seasonal events** — Why defer: requires live-ops infrastructure; premature before retention is proven
- [ ] **Advanced accessibility features** — Why defer: existing colorblind mode is sufficient for v1; expand based on user feedback
- [ ] **Replays/ghost data** — Why defer: nice-to-have for competitive players but not engagement-critical

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Star system (1-3 per level) | HIGH | MEDIUM | P1 |
| Level select screen | HIGH | MEDIUM | P1 |
| Enhanced visual feedback | HIGH | MEDIUM | P1 |
| Crate completion celebration | HIGH | LOW | P1 |
| 20 hand-crafted campaign levels | HIGH | HIGH | P1 |
| Tutorial skip enhancement | MEDIUM | LOW | P1 |
| Expand to 60 campaign levels | HIGH | HIGH | P2 |
| Boss levels (every 10th) | MEDIUM | HIGH | P2 |
| Secondary objectives system | MEDIUM | MEDIUM | P2 |
| Perfect Clear Bonus | MEDIUM | LOW | P2 |
| Cosmetic unlock system | MEDIUM | HIGH | P2 |
| Daily challenges | MEDIUM | MEDIUM | P2 |
| Mystery vinyl reveal animation | LOW | LOW | P2 |
| Collection Easter eggs | LOW | MEDIUM | P2 |
| Settings for random events | LOW | LOW | P2 |
| Endless mode leaderboards | MEDIUM | HIGH | P3 |
| Seasonal events | LOW | HIGH | P3 |
| Theme-specific campaigns | LOW | HIGH | P3 |
| Replays/ghost data | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch — solves identified engagement problems
- P2: Should have when possible — adds depth without complexity
- P3: Nice to have, future consideration — requires product-market fit first

## Competitor Feature Analysis

| Feature | Candy Crush | Fill the Fridge | Angry Birds | Our Approach |
|---------|-------------|-----------------|-------------|--------------|
| **3-star rating** | ✓ Score-based | ✗ Single star | ✓ Score-based | Score + objectives hybrid (3rd star = secondary objectives) |
| **Level select** | ✓ Linear progression | ✓ Linear progression | ✓ World-based | World-based with 6 worlds (10 levels each) |
| **Boss levels** | ✗ None | ✗ None | ✗ None | Every 10th level (differentiator) |
| **Daily challenges** | ✓ With special rewards | ✗ None | ✓ With leaderboards | Single challenge per day with exclusive cosmetic rewards |
| **Power-ups** | ✓ Paid/earned | ✗ None | ✗ None | None (anti-feature; maintains skill purity) |
| **Lives/energy** | ✓ 5 lives refill | ✗ Unlimited | ✗ Unlimited | Unlimited (anti-feature; enables "just one more") |
| **Visual juice** | Medium intensity | High intensity | Low intensity | High intensity (Tetris Effect inspiration) |
| **Cosmetic rewards** | ✓ Character skins | ✗ None | ✗ None | Themes, vinyl skins, backgrounds |
| **Tutorial skip** | ✗ Forced | ✓ Prominent | ✗ Forced | Prominent + returning player detection |
| **Negative events** | ✗ None | ✗ None | ✗ None | Removed (anti-feature; frustration kills retention) |
| **Collection system** | ✗ None | ✗ None | ✗ None | With real album Easter eggs (differentiator) |
| **Procedural audio** | ✗ Asset-based | ✗ Asset-based | ✗ Asset-based | Web Audio API generation (differentiator) |

**Key insights:**
- **3-star system is universal** in successful hypercasual puzzle games; our hybrid approach (score + objectives) adds depth
- **Boss levels are uncommon** in competitors; opportunity to differentiate with climax moments every 10 levels
- **Power-ups and lives are anti-patterns** for our "just one more level" core value; competitors that use them create friction
- **Visual juice is critical** but underused in genre; Fill the Fridge and Tetris Effect show high-juice approach wins
- **Collection systems are rare** in hypercasual; opportunity to appeal to vinyl culture specifically

## Research Confidence Assessment

| Area | Confidence | Evidence |
|------|------------|----------|
| **Table Stakes (Star System, Progress Viz)** | HIGH | Multiple authoritative sources confirm 3-star systems, level select screens, and progress tracking are hypercasual standards; Candy Crush (12,000+ levels), Angry Birds (established genre conventions), academic research on difficulty curves and flow theory |
| **Differentiators (Boss Levels, Collection)** | HIGH | Research shows punctuated progression creates memorable moments; boss levels uncommon in genre = differentiation opportunity; collection systems validated by broader game industry (Pokemon, etc.) |
| **Anti-Features (Power-ups, Lives, Negative Events)** | HIGH | Multiple sources confirm frustration kills retention; research on loss aversion and FOMO shows negative emotions reduce long-term engagement; energy systems documented as creating negative play experiences in hypercasual context |
| **Dopamine Loop Mechanics** | HIGH | Comprehensive research on compulsion loops, dopamine triggers in game design, and flow theory; 30-60s micro-victory pattern validated across multiple successful games |
| **Visual Feedback ("Juice")** | HIGH | Extensive research on "juice" in game design; Tetris Effect, Peggle, and Bejeweled case studies demonstrate importance of exaggerated feedback for satisfaction |
| **Daily Challenges** | MEDIUM | Common in mobile games with proven retention benefits; specific implementation details less documented but pattern well-established |
| **Cosmetic Progression** | MEDIUM | Research confirms cosmetic unlocks provide progression rewards without gameplay complexity; specific to hypercasual genre less documented but validated in broader F2P mobile space |
| **Hand-crafted vs Procedural Levels** | MEDIUM | Research suggests hand-crafted levels enable controlled difficulty curves; however, many successful hypercasual games use procedural generation (Fill the Fridge); decision contextual to gameplay complexity |

## Sources

### Hypercasual Game Design & Retention
- [Hyper Casual Game Development in 2026: Scaling Engagement, Speed, and Profitability](https://medium.com/@jackjill7659/hyper-casual-game-development-in-2026-scaling-engagement-speed-and-profitability-18413a5ae0d6) (MEDIUM confidence: trade publication)
- [Hybrid-casual: the secret sauce to higher retention and better engagement — GameAnalytics](https://www.gameanalytics.com/blog/hybrid-casual-higher-retention-better-engagement) (HIGH confidence: industry analytics firm)
- [5 Tips for Improving Retention in Hybrid-Casual Games](https://www.crazylabs.com/blog/5-tips-for-improving-retention-in-hybrid-casual-games/) (HIGH confidence: major mobile game publisher)
- [The Ultimate Guide to Hyper Casual Game Design | Moloco](https://www.moloco.com/blog/hyper-casual-games-design) (HIGH confidence: industry research)

### Dopamine Loops & Progression Systems
- [Compulsion Loops & Dopamine in Games and Gamification](https://www.gamedeveloper.com/design/compulsion-loops-dopamine-in-games-and-gamification) (HIGH confidence: Game Developer Magazine)
- [The Dopamine Loop: How Game Design Keeps Players Hooked](https://videogameheart.com/the-dopamine-loop-how-game-design-keeps-players-hooked/) (MEDIUM confidence: game design blog)
- [Game Progression Systems: A Deep Dive](https://www.numberanalytics.com/blog/deep-dive-game-progression-systems) (HIGH confidence: game analytics firm)

### Candy Crush Case Studies
- [Why Candy Crush Saga Still Feels Satisfying as 2026 Begins](https://lootbar.gg/blog/en/why-candy-crush-saga-still-feels-satisfying-as-2026-begins.html) (MEDIUM confidence: gaming blog)
- [Candy Crush Saga: A Sweet Success Story in Mobile Game Development](https://studiokrew.com/blog/candy-crush-success-story/) (MEDIUM confidence: game development studio)
- [How Candy Crush Mastered Game Development and Monetization](https://www.juegostudio.com/blog/candy-crush-success-story) (MEDIUM confidence: game development studio)

### Angry Birds & Star Rating Systems
- [Star (classification) - Wikipedia](https://en.wikipedia.org/wiki/Star_(classification)) (HIGH confidence: establishes 3-star rating convention)
- [Angry Birds: The All-Purpose Guide to Three Stars](https://www.macobserver.com/tmo/article/angry_birds_the_all-purpose_guide_to_three_stars_part_1) (MEDIUM confidence: game guide)
- [Star | Angry Birds Wiki | Fandom](https://angrybirds.fandom.com/wiki/Star) (MEDIUM confidence: community wiki)

### Daily Challenges & Engagement
- [10 Tips for Creating Engaging and Rewarding In-Game Challenges](https://onesignal.com/blog/10-tips-for-creating-engaging-and-rewarding-in-game-challenges/) (HIGH confidence: major engagement platform)
- [How Gaming Apps Drive Engagement and Retention with Personalized Messaging](https://onesignal.com/blog/how-gaming-apps-drive-engagement-and-retention-with-personalized-messaging/) (HIGH confidence: OneSignal blog)

### Visual Feedback & "Juice"
- [Squeezing more juice out of your game design! — GameAnalytics](https://www.gameanalytics.com/blog/squeezing-more-juice-out-of-your-game-design) (HIGH confidence: industry analytics firm)
- [Visual Feedback in Game Design: How to enhance player experience](https://www.bravezebra.com/blog/visual-feedback-game-design/) (MEDIUM confidence: design studio)
- [Juice in Game Design: Making Your Games Feel Amazing | Blood Moon Interactive](https://www.bloodmooninteractive.com/articles/juice.html) (MEDIUM confidence: game studio)

### Difficulty Curves & Learning
- [Mastering the Art of Difficulty Curve Design: A Game Developer's Guide](https://stake-minespredictor.com/mastering-the-art-of-difficulty-curve-design-a-game-developers-guide/) (MEDIUM confidence: game design resource)
- [Difficulty Curves - Game Developer Magazine](https://www.gamedeveloper.com/design/difficulty-curves) (HIGH confidence: industry publication)

### Onboarding & Tutorial Design
- [Best Practices For Mobile Game Onboarding - Mobile Freemium Game Design](https://adriancrook.com/best-practices-for-mobile-game-onboarding/) (HIGH confidence: industry consultant with mobile F2P expertise)
- [Onboarding for Games - Apple Developer](https://developer.apple.com/app-store/onboarding-for-games/) (HIGH confidence: platform guidelines)

### Repetition vs Novelty
- [Balancing Repetition and Variation in Game Design | Fid Plays](https://cobble.games/wise-inspiring-smart/game-design/balancing-repetition-and-variation-in-game-design) (MEDIUM confidence: game design resource)
- [The Value of Repetition - Game Developer Magazine](https://www.gamedeveloper.com/design/the-value-of-repetition) (HIGH confidence: industry publication)

---
*Feature research for: Sleevo Vinyl Shop Manager v2.0 Engagement Overhaul*
*Researched: 2026-02-10*
