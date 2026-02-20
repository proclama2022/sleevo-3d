# Project Research Summary

**Project:** Sleevo — Level Progression & Score Feedback Milestone
**Domain:** Browser-based casual puzzle/sorting game (vinyl records)
**Researched:** 2026-02-20
**Confidence:** HIGH

## Executive Summary

Sleevo's core gameplay loop — drag-drop, combo system, invalid placement feedback, 3D vinyl rendering — is already complete and differentiated. The milestone is not about new mechanics; it is about communication and progression infrastructure. Players currently cannot see what they earned (no score popup firing), do not know how far they are (no persistent progress counter), have no sense of how well they performed (star rating not displayed), and cannot navigate the game's 21 levels (no level select screen). The research confirms all capabilities needed to fix this are already installed in the codebase: `ScorePopup`, `storage.ts`, `LevelComplete.tsx` with star display, `ProgressBar.tsx`, and the `LEVELS` array. The work is integration, not invention, and no new packages are required.

The recommended approach is to work within the existing `useReducer` + `GameScreen` architecture without touching the dormant Zustand `gameStore`. A thin new `progression.ts` module wraps `storage.ts` to provide level-select data and unlock logic, a new `LevelSelectScreen` component provides navigation, and a `RulePill` component surfaces the active rule in the HUD. The star formula needs one unambiguous decision (does time factor in?) before implementation, and the localStorage unlock logic needs a one-line fix (threshold `>= 1` to `>= 2`). Neither is blocked.

The critical risks are architectural: the dormant Zustand store must not be mixed into the reducer-driven game session, the unlock key naming is a latent off-by-one trap that must be refactored before 20+ levels land, and the star thresholds must be designed per-mode from the start — retrofitting them after levels are authored invalidates player saves. Addressing these three items before expanding the level array avoids the most expensive possible rework.

---

## Key Findings

### Recommended Stack

No new packages are required. The existing stack (React 19, TypeScript, Zustand ^4, CSS Modules/keyframes, `localStorage`) covers every feature in scope. The research found that each proposed feature maps directly to an already-installed capability: CSS `scoreFloat` keyframe for score popups, `storage.ts` for persistence, `LevelComplete.tsx` for star display, `ProgressBar.tsx` for the vinyl counter. Attempts to introduce framer-motion, React Router, `canvas-confetti`, IndexedDB, or Zustand `persist` middleware would each contradict a working system already in place.

The only new structural code is a `progressionStore` Zustand slice (thin reactive wrapper over `storage.ts`) and a `progression.ts` pure-function module. Both follow established patterns already present in the codebase.

**Core technologies:**
- **Zustand (existing) ^4:** Cross-session progression state — follows pattern of `useGameStore`; new `progressionStore` slice keeps persistence concerns separate from game session
- **`useReducer` / `gameReducer` (existing):** All per-level game logic — pure reducer handles stars, mistakes, combo; do not migrate to Zustand
- **`localStorage` via `storage.ts` (existing):** Progress persistence — 21 levels × ~20 bytes = ~420 bytes total; synchronous, already working, no migration needed
- **CSS keyframe animations (existing):** Score floats, star reveals, combo popups — `scoreFloat`, `checkPop`, `glowPulse` all defined in `src/animations/keyframes.ts`
- **React CSS Modules (existing):** All new UI components — consistent with `ShelfSlot.module.css`, `LevelComplete.module.css` patterns

### Expected Features

The feature research confirms this is a genre-conventional casual puzzle game. Players trained by Candy Crush, Sort It 3D, and Two Dots will arrive with precise expectations about what a level-completion ceremony looks like, how unlock gates feel, and why star ratings exist. Failing to meet these expectations reads as "broken," not "intentionally minimal."

**Must have (table stakes):**
- Floating score feedback ("+10", "+35 GREAT!") after each valid placement — cause→effect clarity; `ScorePopup` exists but is not wired to the drop handler
- Vinyl progress counter in HUD ("5 / 8") — players must know when the level ends; already in `ProgressBar.tsx` but confirm wiring
- Level rule persistent display in HUD ("Ordina per: Genere") — players who don't know the rule guess randomly; `RulePill` component needed
- 1–3 star rating on level complete — primary unit of "how well did I do?"; stars already computed in engine, displayed in `LevelComplete.tsx`, but star formula must be finalized
- End-of-level screen with stars + score + errors + time — the ceremony moment; `LevelComplete.tsx` exists but currently missing stars + time display
- Level unlock gating (2 stars to advance) — creates meaningful progression; threshold fix is a one-liner in `storage.ts`
- Save progress across sessions — `storage.ts` already fully implements this; needs wiring to level select
- Level select screen showing star ratings and lock state — without it, the replay incentive loop has no entry point; `LevelSelectScreen` is new work

**Should have (differentiators):**
- Multiple game modes (genre, chronological, customer, blackout, rush, sleeve-match) — Sleevo's primary differentiator; types and engine logic exist, need level data and mode-specific star tuning
- Customer Request mode — narrative framing makes the game feel like running a real shop; partial implementation exists
- Rush and Blackout modes — transform the base mechanic into a different cognitive challenge; low code cost, need 15+ base levels first
- Per-level difficulty curves within modes — e.g. Genre mode with 4 genres → 6 genres → duplicate columns
- End-of-level replay incentive ("Best: 3 stars" on select screen) — requires save system + level select (both in scope)

**Defer (v2+):**
- Sleeve-match mode — requires album cover art data and a new matching algorithm; high content cost
- Leaderboards and social features — infrastructure complexity without payoff at current player count
- Full account/cloud sync — localStorage is sufficient; engineering cost not justified for v1
- Animated cutscenes between levels — high production cost, blocks experienced players

### Architecture Approach

The architecture is a single-orchestrator pattern: `GameScreen.tsx` owns the `useReducer` session and passes all data down as props. This must remain the canonical model. The dormant Zustand `gameStore` (in `src/store/gameStore.ts`) uses a different `GameState` shape and is effectively dead code — it should be deleted or left dormant. The new `progressionStore` (cross-session, persistent) and `progression.ts` (pure functions) sit alongside the reducer without mixing into it. New display components (`RulePill`, `LevelSelectScreen`) receive data as props; they do not read from `localStorage` directly.

**Major components:**
1. **`GameScreen.tsx` (orchestrator)** — owns `useReducer`, handles drag lifecycle, fires `saveProgress` in `useEffect`, resolves level index for `dispatch`
2. **`src/game/engine.ts` (gameReducer)** — pure state machine; all gameplay events including star calculation; no side effects, no localStorage access
3. **`src/game/progression.ts` (new)** — pure functions: `calculateStars()`, `canAdvanceToLevel()`, `getLevelSelectData()`; wraps `storage.ts`; consumed by `GameScreen` and `LevelSelectScreen`
4. **`src/game/storage.ts` (persistence)** — raw localStorage I/O; fix unlock threshold from `>= 1` to `>= 2`
5. **`LevelSelectScreen.tsx` (new)** — level grid with locked/unlocked/star state; reads from `progression.ts`; navigates to `GameScreen` with `initialLevelIndex`
6. **`RulePill.tsx` (new)** — HUD sub-component showing active mode rule; receives `state.level.mode` and `state.level.hint` as props
7. **`ScorePopup.tsx` (existing, needs wiring)** — floating "+N" after each placement; receives points delta and slot coordinates from `GameScreen`

### Critical Pitfalls

1. **Flat star thresholds punish hard modes** — the current `engine.ts` formula (`mistakes === 0` = 3 stars) is applied identically to `rush`, `blackout`, and `genre` modes. Hard modes need more forgiving thresholds. Define per-mode or per-level `starThresholds` in the `Level` type before authoring more than 4 levels. Retrofitting is painful after player saves exist.

2. **Unlock key naming is an off-by-one trap** — `isLevelUnlocked(levelIndex)` constructs the key as `level-${levelIndex}` but level IDs are 1-based. This works today by coincidence. Refactor to look up the previous level's ID directly from the `LEVELS` array (`LEVELS[levelIndex - 1].id`) before adding 20+ levels. One inserted level scrambles all unlock state.

3. **Dual state systems must not mix** — `useGameStore` (Zustand, dormant) and `useReducer` (active) have incompatible `GameState` shapes. Calling both in the same component creates two sources of truth. Decision: keep System A (reducer) as canonical; delete or ignore `src/store/gameStore.ts`.

4. **Time-elapsed is unresolved in the star spec** — PROJECT.md says stars reflect "errori + velocità" but `timeElapsed` is never consulted by `engine.ts`. Decide whether time factors into stars before implementing. If yes, wire it into the engine at implementation time. If no, remove it from the spec language. Retrofitting time into star calculations after levels ship invalidates all saves.

5. **localStorage schema has no version guard** — renaming level IDs or changing the `LevelProgress` shape silently orphans or misreads player saves. Add a `version` field and migration check before first public release.

---

## Implications for Roadmap

Based on the combined research, this milestone decomposes into four sequential phases. Each phase is independently shippable and unblocks the next.

### Phase 1: Foundation Fixes and Wiring

**Rationale:** Three pre-existing issues create integration risk for everything that follows. Fix them first so that Phase 2+ builds on solid ground. All three are small, low-risk, and have clear correct answers from the research.

**Delivers:**
- `storage.ts` unlock threshold changed from `>= 1` to `>= 2`
- `isLevelUnlocked` refactored to derive previous level ID from `LEVELS` array (not string construction)
- Dormant `src/store/gameStore.ts` deleted or explicitly quarantined with a comment
- `ScorePopup` wired to `GameScreen` drop handler (uses existing `lastSlotPosition` ref and placement timestamp as `key`)
- `mistakes` / `invalidDrops` dual-counter resolved to a single authoritative counter

**Addresses:** Table-stakes feature: floating score feedback. Pitfalls 2, 3, 10.

**Avoids:** Unlock off-by-one breaks at level expansion; mixed state systems causing debugging hell.

**Research flag:** Standard patterns — skip phase-level research. All implementation paths are fully documented in ARCHITECTURE.md with line-level specifics.

---

### Phase 2: Star System and Level Complete Ceremony

**Rationale:** Stars are the central unit of player progress. The unlock gate, level select display, and replay incentive all depend on stars being correct and meaningful. Must be implemented before the level select screen, not after.

**Delivers:**
- Explicit decision on whether `timeElapsed` factors into stars (recommend: yes, as "par time" baseline per level)
- `calculateStars()` extracted to a pure function in `rules.ts` with per-mode thresholds
- `Level` type extended with optional `starThresholds` and `parTime` fields
- `LevelComplete.tsx` updated to display stars + time + score + errors with staggered star reveal animation (`checkPop` keyframe, 200ms delay per star)
- `saveProgress` call verified in `GameScreen` `useEffect [state.status]`
- `localStorage` schema versioned with `version: 1` guard

**Addresses:** Table-stakes feature: end-of-level ceremony. Table-stakes: save progress. Pitfalls 1, 7, 8.

**Research flag:** Needs one design decision (time in stars or not) before coding starts — but this is a 5-minute team call, not a research phase. No external research needed.

---

### Phase 3: Level Select Screen and Progression Navigation

**Rationale:** Stars have no replay value without a level select screen to surface them. The progression store and `progression.ts` module also unblock the HUD rule display and the "last unlocked level on app start" behaviour. Build after stars are reliable.

**Delivers:**
- `src/game/progression.ts` module with `canAdvanceToLevel()`, `getLevelSelectData()`, `getBestStats()`
- `progressionStore` Zustand slice providing reactive access to `loadAllProgress()` for `LevelSelectScreen`
- `LevelSelectScreen.tsx` — scrollable grid of level cards showing lock state, best star count, level number and mode icon
- `App.tsx` screen routing via `screen: 'game' | 'level-select'` local state (no router library)
- `GameScreen` on-mount reads `getLastPlayableIndex()` to resume at the player's current level
- `GameScreen` "Next Level" button gates on `canAdvanceToLevel(nextIndex)`
- `RulePill.tsx` sub-component in HUD showing active mode rule ("Ordina per: Genere")

**Addresses:** Table-stakes: level select, unlock gating, progress counter in HUD. Pitfall 11 (no replay incentive).

**Research flag:** Standard patterns — full implementation blueprint in ARCHITECTURE.md including data flow diagrams, component boundaries, and integration points. Skip research phase.

---

### Phase 4: Level Authoring (20+ Levels) and Mode Validation

**Rationale:** Level content expansion is only safe after the progression and star infrastructure is correct. Adding 20 levels on top of a broken unlock chain or flat star formula requires rewriting level data. The mode audit (Pitfall 3) must gate this phase.

**Delivers:**
- Audit of all 7 `LevelMode` implementations end-to-end (blackout timer moved to engine `TICK` action; customer double-bonus fixed; `blockedSlots` level validator added)
- Level data in `levels.ts` expanded from 2 to 21+ levels covering all modes
- Difficulty curve scored and plotted (vinyl count + active constraints) to ensure monotonic ramp with relief levels
- `comboDecayMs` made per-level configurable (longer for `blackout`/`chronological`, tighter for `rush`)
- Mode-by-mode "contract" documentation for `blackout`, `customer`, `rush`, `sleeve-match` before levels using each mode are authored
- `blackout` mode: pre-timer memorization overlay added; optional hint strip added (1-star penalty)
- `customer` mode: scoring path audited for double-bonus; `customerServed` reset on `LOAD_LEVEL`

**Addresses:** Differentiator features: all mode variants. Pitfalls 3, 4, 5, 6, 9, 12.

**Research flag:** Mode implementations (blackout timer in engine, rush progression) may benefit from a focused research-phase before tasking. The mode-contract approach (one-page spec per mode before level authoring) is the key mitigation.

---

### Phase Ordering Rationale

- Phase 1 before Phase 2: the dual-counter and unlock key bugs will corrupt star and progression data if not fixed first.
- Phase 2 before Phase 3: the level select screen renders stars; if the star formula changes after the level select ships, it creates a confusing player experience.
- Phase 3 before Phase 4: unlocking 20 levels without a level select screen means players have no way to replay them, defeating the purpose of authoring them.
- Phase 4 last: mode content expansion is safe only once the infrastructure beneath it is validated.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Mode Validation):** The `blackout` and `rush` timer architectures have component-level `useEffect` timeouts that need to move into the engine. The correct `TICK` action pattern is documented at a high level but the detailed refactor path warrants a focused investigation of the current `GameScreen` timer setup before tasking.

Phases with standard patterns (skip research phase):
- **Phase 1 (Foundation Fixes):** All changes are one-line or already have exact code samples in ARCHITECTURE.md.
- **Phase 2 (Stars):** Implementation blueprint is complete. Decision about time-in-stars is a design call, not a research question.
- **Phase 3 (Level Select):** Full architecture documented including component tree, data flow, and integration points.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Direct codebase audit confirmed all existing capabilities; no new packages needed; all package.json dependencies verified |
| Features | MEDIUM | Genre conventions drawn from training-data knowledge of comparable games (Candy Crush, Sort It 3D, Two Dots); no live web search. Core table-stakes claims (star ratings, level select, score feedback) are HIGH — universal genre conventions. Mode ordering and gating choices are MEDIUM. |
| Architecture | HIGH | Based on direct analysis of engine.ts, storage.ts, GameScreen.tsx, rules.ts, types.ts. Component boundaries, data flow diagrams, and integration points are grounded in actual code, not inference. |
| Pitfalls | HIGH | All 12 pitfalls cite specific file paths and line-level evidence from the codebase. No speculative pitfalls. |

**Overall confidence:** HIGH

### Gaps to Address

- **Time-in-stars decision:** PROJECT.md says "errori + velocità" but the engine ignores speed. This is a product design decision that must be made before Phase 2 starts. Recommendation: use a per-level `parTime` field (default `totalVinyls * 8` seconds); 3 stars requires under 1.5x par time with 0 mistakes. Exact thresholds need playtesting.

- **Sleeve-match mode readiness:** `rules.ts` acknowledges sleeve-match validation is handled elsewhere. Before any sleeve-match level is authored (deferred to v2+), a complete audit of the validation path is needed.

- **Rush mode completion condition:** The current engine returns `status: 'completed'` with `stars: 1` when `rushTimeLeft` reaches 0. Whether partially-completed rush levels should show a distinct "time's up" screen vs. the standard `LevelComplete` overlay is an unresolved UX question. Address during Phase 4 mode audit.

---

## Sources

### Primary (HIGH confidence)
- `src/game/engine.ts` — gameReducer, star calculation, PLACE_VINYL action
- `src/game/storage.ts` — persistence implementation, unlock logic
- `src/game/levels.ts` — LEVELS array (21 levels confirmed)
- `src/game/types.ts` — GameState, LevelMode, ComboState type definitions
- `src/game/rules.ts` — isValidPlacement, COMBO_TIERS
- `src/components/GameScreen.tsx` — orchestrator, drag lifecycle, timer, ScorePopup integration gap
- `src/components/LevelComplete.tsx` — end-of-level screen, star display, confetti
- `src/components/HUD/HUD.tsx` — live stats display
- `src/components/ScorePopup/ScorePopup.tsx` — floating score delta (implemented, not wired)
- `src/animations/keyframes.ts` — scoreFloat, checkPop, glowPulse, cardPickup
- `.planning/PROJECT.md` — stated requirements and design decisions
- `GAME-LOGIC.md` — authoritative mechanics description
- `package.json` — installed dependencies (no router, no animation library)

### Secondary (MEDIUM confidence)
- Genre knowledge: Candy Crush Saga, Monument Valley, Sort It 3D, Ball Sort Puzzle, Threes!, Two Dots, 1010! (training data, August 2025 cutoff) — feature conventions, anti-features, mode introduction ordering

### Tertiary (LOW confidence)
- Star threshold exact values (0 mistakes = 3 stars, parTime multipliers) — derived from PROJECT.md + genre conventions; requires playtesting to validate

---

*Research completed: 2026-02-20*
*Ready for roadmap: yes*
