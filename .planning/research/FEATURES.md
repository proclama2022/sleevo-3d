# Feature Landscape

**Domain:** Browser-based casual puzzle / sorting game (vinyl records)
**Project:** Sleevo
**Researched:** 2026-02-20
**Confidence:** MEDIUM — Based on training-data knowledge of Candy Crush, Monument Valley, Sort It 3D, Ball Sort Puzzle, 1010!, Threes!, Two Dots, and related genre. Web search unavailable; claims sourced from well-documented, widely-analyzed games. Marked where confidence is lower.

---

## Table Stakes

Features users expect. Missing = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Floating score feedback ("+10", "+70 AMAZING!") after each placement | Players need immediate cause→effect clarity; the score counter alone is invisible | Low | This is in PROJECT.md Active requirements. Already known missing. |
| Vinyl progress counter in HUD ("5 / 8") | Players must know when the level ends; without this, completion feels random | Low | Also in PROJECT.md Active. Trivial to add. |
| Level rule shown clearly before and during play | Players who don't know the rule guess randomly; confusion causes abandonment | Low | "Sort by genre" displayed in HUD as persistent reminder. The level-start screen is the moment players read the rule — skip it and they're lost. |
| Star rating on level complete (1–3 stars) | Every casual game since Angry Birds has conditioned players to expect this. It is the primary unit of "how well did I do?" | Low-Med | PROJECT.md has this as Active. Stars must mean something (gate progression). |
| Level select / world map showing progress | Players need a mental map of how far they've come and what's next | Medium | 20+ levels with no map = players don't know where they are in the journey. |
| Level unlock gating (need N stars to continue) | Creates meaningful progression; without it, all content is immediately trivially available | Low | PROJECT.md proposes 2 stars to unlock next. This is the right call. |
| Save progress across sessions | Casual players leave and return; losing progress on return = quit | Low | localStorage is sufficient for a browser game. PROJECT.md Active requirement. |
| End-of-level screen with score + stars + errors + time | The "ceremony" moment — players feel rewarded or motivated to retry | Low-Med | PROJECT.md Active requirement. Currently shows only score + errors. Missing: stars, time. |
| Clear invalid placement feedback | Players must know immediately they made a wrong move | None — already exists | Shake + bounce-back + red flash already implemented. |
| Restart level easily | Casual players who make early mistakes need a low-cost escape | Low | "Restart" button during play, not just on level complete. |
| Visual differentiation between genres/categories | Players must be able to distinguish vinyls at a glance | None — already exists | Color coding by genre already implemented. |
| Combo feedback visible during play | Combo multiplier is a key engagement driver; if players don't see it they don't feel it | None — already exists | Combo label/value shown in HUD. |
| Tutorial / onboarding for first level | First-time players must understand drag-drop without reading documentation | None — already exists | Two-step onboarding exists. |

---

## Differentiators

Features that set this product apart. Not universally expected, but make the game memorable and replayable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Multiple level modes (genre, chronological, customer request, blackout, rush, sleeve-match) | Variety sustains long-term engagement; each mode is a fresh puzzle type | High | Defined in LevelMode TypeScript types but not all implemented. This is Sleevo's primary differentiator. No other browser vinyl game does this. |
| Customer Request mode | Narrative framing: player fills a specific order, not a generic rule. More engaging than abstract sorting | Med | Adds story context; makes player feel like they are running a real shop |
| Rush mode (time pressure) | Transforms the same mechanics into a completely different feel — anxiety vs. deliberation | Low-Med | Carousel already accelerates as vinyls deplete; a full rush mode pushes this further |
| Blackout mode (hidden column labels) | Expert-mode challenge that rewards memorization | Low | Labels hidden; player must remember genre → column from experience |
| Sleeve-match mode | Visual pattern matching instead of metadata sorting — different cognitive challenge | Med | Requires album cover art on vinyls; currently covers are optional |
| Combo + multiplier system already in place | Makes perfect runs feel spectacular (5x LEGENDARY!); most browser puzzle games lack this depth | None — already exists | This is already a differentiator; just needs to be more visible to players |
| 3D vinyl disc rendering (Three.js) | Tactile, premium feel vs. flat card-based sorting games | None — already exists | This is already differentiated; worth leaning into aesthetically |
| Level-specific difficulty curves within the same mode | e.g., Genre mode → 4 genres → 6 genres → genres with duplicate columns (ROCK appears twice) | Low-Med | The current 8-column setup already has this complexity; needs levels that exploit it progressively |
| End-of-level replay incentive ("Best: 3 stars" shown on select screen) | Players re-play to improve; star replay is a well-established retention loop | Low | Requires save system + level select |

---

## Anti-Features

Features to explicitly NOT build for this game.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Lives / energy system (lose energy on errors) | Blocks casual play; creates frustration in a game that is already punishing errors with combo resets | Use combo reset as sufficient punishment; no artificial gate |
| Timers on every level by default | Removes the "browse a record shop" atmosphere that makes Sleevo feel premium vs. frantic mobile clones | Use rush mode as opt-in/level-specific variant; base game is unhurried |
| Pop-up ads or intrusive monetization UI | Destroys the aesthetic experience entirely | Out of scope per PROJECT.md — but document this as a deliberate design stance |
| Undo button | Trivializes the puzzle; no tension | PROJECT.md already notes undo() is empty by design. Keep it empty. |
| Random / shuffled correct columns per play | Destroys replayability and memory-building; players need deterministic rules to improve | Correct columns stay fixed per vinyl ID (already the design) |
| Leaderboards / social features in v1 | Complexity without engagement payoff at low player count; adds infrastructure burden | Defer until there is a player base to compete within |
| Animated cutscenes between levels | High production cost, blocks experienced players on repeat plays | A brief text rule display ("Level 5: Sort by year — oldest to newest") is enough ceremony |
| Penalty for being slow (outside rush mode) | Breaks the chill sorting-shop atmosphere | Reward speed with combo bonuses; punish errors, not pace |
| More than 3 star tiers | Stars above 3 add confusion ("what's a 4-star run?"); 3 is the genre standard | Stick with 1/2/3 stars |
| Full account/cloud sync | Engineering complexity not justified for v1 browser game | localStorage is sufficient |

---

## Feature Dependencies

```
Save system (localStorage) → Level unlock gating
Save system (localStorage) → Level select screen with star display
Star rating → Level unlock gating
Star rating → End-of-level screen
Level rule display (HUD) → Every level mode that has a non-obvious rule
Floating score feedback → Combo system (feedback must show multiplier label)
Level select screen → 20+ levels (no point building the screen with 2 levels)
Customer Request mode → Level data with specific customer order field
Sleeve-match mode → Album cover art on vinyls (coverImage field, currently optional)
Rush mode → Timer component in HUD
Blackout mode → Ability to suppress column labels per level
Progress counter ("5/8") → totalVinyls tracked in store (already tracked)
```

---

## MVP Recommendation

Given Sleevo already has: drag-drop, combo system, error feedback, 2 levels, genre-color coding, end-of-level screen (partial).

**Prioritize (must ship before any new modes):**

1. Floating score feedback after each placement ("+10", "+35 GREAT!")
2. Progress counter in HUD ("Piazzati: 5 / 8")
3. Level rule persistent display in HUD (e.g., "Ordina per: Genere")
4. Star rating system (errors + speed → 1/2/3 stars)
5. End-of-level screen showing stars + score + errors + time (extend existing screen)
6. Save progress to localStorage (stars per level, highest unlocked level)
7. Level select screen (simple grid, locked/unlocked/star count)
8. 20+ level definitions using existing modes

**Defer:**

- Sleeve-match mode: Requires album art data and a new matching algorithm. High content cost. Build after 10+ levels exist.
- Customer Request mode: Needs level data redesign (order lists). Build in second content wave.
- Blackout and Rush modes: Low code cost, but need 15+ base levels first so they feel like a mode escalation rather than the first challenge.
- Leaderboards: Post-launch.

**The critical insight:** The game's core loop (drag → snap → combo → score) is already solid. The entire gap is *communication to the player* — they don't see what they earned, don't know how far they are, and don't know how well they did. All MVP items above are communication fixes, not new mechanics. This is a very fast path to a shippable game.

---

## Confidence Assessment

| Claim | Confidence | Source |
|-------|------------|--------|
| Floating score feedback is table stakes | HIGH | Universal pattern in Candy Crush, 1010!, Two Dots, Sort It 3D — all use this |
| Star rating (1-3) is expected | HIGH | Genre convention since Angry Birds (2009); every comparable casual game uses it |
| 2 stars to unlock is appropriate gate | MEDIUM | Common pattern; some games use 1 star (permissive) or 3 (strict). 2 is the median observed. |
| Undo is harmful to the puzzle loop | MEDIUM | Confirmed in Sort It 3D and Ball Sort Puzzle — neither has undo; it would trivialize |
| Timer default-off is right for Sleevo's tone | MEDIUM | Judgment call based on Sleevo's "record shop" aesthetic; Monument Valley similarly time-free |
| Customer/Rush/Blackout ordering advice | MEDIUM | Based on observed mode introduction order in comparable games (easy core → time pressure → memory variants) |
| Lives/energy system as anti-feature | HIGH | Mobile-specific monetization mechanic; browser games without monetization should not use it |

---

## Sources

- Genre knowledge: Candy Crush Saga, Monument Valley, Sort It 3D, Ball Sort Puzzle, Threes!, Two Dots, 1010! (training data, HIGH confidence for well-documented games)
- Project context: `/Users/martha2022/Documents/Sleevo/.planning/PROJECT.md`
- Game mechanics: `/Users/martha2022/Documents/Sleevo/GAME-LOGIC.md`
- Web search: Unavailable during this research session. Claims rely on training data (cutoff August 2025). No post-Aug 2025 sources consulted.
- Note: All named games are pre-2024 releases well within the training window. Confidence is appropriate.
