# Project Research Summary

**Project:** Sleevo — best score persistence + personal record UI
**Domain:** Brownfield feature addition to an existing React/TypeScript browser puzzle game
**Researched:** 2026-02-25
**Confidence:** HIGH

## Executive Summary

This milestone adds best score persistence and a personal record UI to Sleevo v1.0, a shipped vinyl-sorting browser game. The scope is deliberately narrow: three additive changes to four existing files — extend `LevelProgress` in `storage.ts` with a `bestScore` field, display it per cell in `LevelSelect`, and show a "Nuovo Record!" badge on `LevelComplete` when the player beats their saved best. No new dependencies are needed. The entire feature is implementable using native browser APIs (`localStorage`, `Intl.NumberFormat`), React hooks (`useState`, `useRef`), and CSS Module keyframes that are already the project standard.

The recommended build order is strict: storage layer first, then `GameScreen` orchestration, then `LevelComplete` display, then `LevelSelect` display. This order respects the dependency chain — every UI change depends on a correctly extended `saveProgress` signature and `LevelProgress` interface. Skipping straight to UI before the storage layer is extended is the primary source of integration bugs documented in pitfalls research.

The dominant risk category is logic-sequencing: the "Nuovo Record!" comparison must happen in `GameScreen` at render time, reading storage before the save effect fires. Reading after the write, or delegating the comparison to `LevelComplete`, produces a flag that is permanently `false`. The second risk is the new-record guard: using `?? 0` as a fallback causes the badge to fire on every first play, cheapening the reward signal. Both risks are straightforward to avoid with the patterns documented in research — they are traps only when developers assume the naive approach is correct.

---

## Key Findings

### Recommended Stack

No new dependencies are required. The project already has everything needed: React 19.2.4 with standard hooks, TypeScript 5.9.3 for optional interface fields, Vite + CSS Modules for animation, and `localStorage` via the existing `storage.ts` abstraction. All libraries evaluated (idb, zustand, framer-motion, numeral, react-confetti) were rejected — the native equivalents are already in use and sufficient.

Score formatting uses `Intl.NumberFormat('it-IT')` hardcoded — not the browser's default locale — to ensure `1420` always renders as `"1.420 pt"` regardless of the user's system language. A single shared `formatScore` utility must be created before any display work begins.

**Core technologies:**
- `localStorage` (native): Persistence via `sleevo_progress` key — already active in `src/game/storage.ts`; extend in-place with `bestScore?: number`
- `Intl.NumberFormat('it-IT')` (native): Italian thousand-separator score formatting — no library needed; hardcode locale, never rely on browser default
- `useState` / `useRef` (React 19): Hold `isNewRecord` across renders; `useState` for the prop passed to `LevelComplete`, `useRef` as an alternative for values that must not trigger re-renders
- CSS Module keyframes (Vite built-in): Gold pulse animation for "Nuovo Record!" badge — project standard; two CSS rules, no animation library

### Expected Features

Research confirms three features as table stakes for this milestone. Players of score-based puzzle games (Alto's Adventure, Threes!, 2048, Crossy Road) expect all three, and their absence reads as a broken feature rather than an intentional omission.

**Must have (table stakes — this milestone):**
- `bestScore` persisted in `localStorage` — scores on `LevelSelect` are meaningless if they reset every visit; players returning to retry expect their record to be present
- Best score shown on each `LevelCell` as "X.XXX pt" — the level-select grid is the de facto scoreboard; seeing only stars but no score feels like missing data for a score-based game
- "Nuovo Record!" badge on `LevelComplete` when the score is genuinely beaten — absent signal means the player cannot tell they improved; every comparable mobile puzzle game provides this signal

**Should have (add after core is stable — v1.x):**
- Delta display alongside badge ("+ 340 pt") — makes the improvement concrete and quantified, motivates one more run; defer until core is confirmed working
- Best score shown on `LevelHintOverlay` before a retry run ("Il tuo record: 1.420 pt") — low-effort context for players replaying to improve

**Defer (v2+):**
- Online leaderboard — explicitly out of scope in `PROJECT.md`; requires backend infrastructure
- Score history over multiple runs — localStorage-only makes this a growing array with no clear value ceiling

**Anti-features confirmed as harmful:**
- "Nuovo Record!" on first completion — there is nothing to beat; cheapens every subsequent genuine record signal
- Animated score counter on `LevelSelect` — adds perceived loading delay in a navigation context; save animation budget for `LevelComplete`
- Sound effect — no audio system exists in Sleevo; unexpected browser audio events are jarring
- Showing score on locked cells — "0 pt" reads as a bug, not data; render `—` for `bestScore === undefined`, nothing for locked cells

### Architecture Approach

The architecture is purely additive: four existing files are modified, no new files are created. `storage.ts` is the foundation; `GameScreen.tsx` is the orchestrator; `LevelComplete.tsx` and `LevelSelect/LevelSelect.tsx` are the display layers. The critical architectural constraint is that `LevelComplete` must remain a pure display component — it must never read from storage directly, because by the time it renders, `saveProgress` may have already overwritten the previous best.

**Major components and their changes:**
1. `src/game/storage.ts` — extend `LevelProgress` with `bestScore?: number`; add optional `score` param to `saveProgress`; independent best-only write condition (`scoreImproved`); merge-write pattern to preserve existing fields
2. `src/components/GameScreen.tsx` — compute `isNewRecord` at render time (before save effect fires) by reading `getLevelProgress()`; pass as prop to `LevelComplete`; reset to `false` in `handleRestart` and `handleNext`
3. `src/components/LevelComplete.tsx` — accept `isNewRecord?: boolean` prop; render conditional "Nuovo Record!" badge with gold CSS keyframe pulse; delay badge animation ~0.6s to sequence after star pop-in
4. `src/components/LevelSelect/LevelSelect.tsx` — read `bestScore` from the existing `loadAllProgress()` call (no additional reads); pass to `LevelCell` as new optional prop; render with `formatScore` utility

**Key data flows:**
- Write path: `GameScreen` completion `useEffect` reads existing via `getLevelProgress` (before write) → derives `isNewRecord` → calls `saveProgress` with score
- Record badge path: `isNewRecord` in `GameScreen` state → prop to `LevelComplete` → conditional badge render
- LevelSelect display path: `loadAllProgress()` at render → `LevelCell.bestScore` prop → `formatScore('it-IT')` output

### Critical Pitfalls

The top five pitfalls identified across project-level and milestone-specific research:

1. **Schema extension clobbers existing records (M1)** — Naively assigning `data[levelId] = { stars, bestScore }` without merging drops `bestTime` from existing records. Always use spread-merge: `{ ...existing, bestScore: newBest }`. Also: extend the `improved` guard to include an independent `scoreImproved` condition — without it, high-score runs with identical stars and equal-or-slower time are silently discarded and never written to storage.

2. **"Nuovo Record!" fires on every first play (M2)** — Using `?? 0` as the fallback for `existingProgress?.bestScore` means any positive score triggers the badge on first play. The correct guard: `existingProgress?.bestScore !== undefined && score > existingProgress.bestScore`. When `bestScore` is absent (first play), `isNewRecord` must be `false`. Test by clearing localStorage and completing a level — the badge must not appear.

3. **`isNewRecord` reads stale pre-save value (M3)** — React effects run after paint. If `isNewRecord` is computed inside the `useEffect` that calls `saveProgress`, or inside `LevelComplete` after the effect has run, the comparison reads the already-overwritten value and is always `false`. Solution: compute `isNewRecord` in `GameScreen` at render time using `getLevelProgress()`, before any effect fires, then pass as a prop.

4. **Score formatting diverges across two surfaces (M4)** — Inline formatting at each call site leads to different separators, different zero-state strings, and different `undefined` handling between `LevelSelect` and `LevelComplete`. Create a single `formatScore(score: number | undefined): string` utility before implementing either surface. Hardcode `'it-IT'` — never rely on browser locale. Zero-state renders as `—`, not `0 pt`.

5. **`isLevelUnlocked` off-by-one trap (Pitfall 2, project-level)** — The function constructs unlock-check keys using `levelIndex`, which silently works only because IDs are currently sequential. Adding or renaming any level scrambles the entire unlock chain. Refactor to derive the previous level's ID from the levels array directly (`LEVELS[levelIndex - 1].id`) before expanding beyond ~10 levels.

---

## Implications for Roadmap

This milestone has tight, well-understood dependencies. The correct phase structure follows the data dependency chain — each phase produces an artifact that the next phase consumes. All phases use standard, well-documented patterns; none require a `/gsd:research-phase` pass.

### Phase 1: Storage and Utility Foundation

**Rationale:** All UI changes depend on `bestScore` existing in the `LevelProgress` shape and a correct `saveProgress` signature. Building UI first against placeholder data produces throwaway code. Creating the `formatScore` utility here prevents formatting divergence between `LevelComplete` and `LevelSelect` later.

**Delivers:** Extended `LevelProgress` interface with `bestScore?: number`; extended `saveProgress` with independent score improvement logic and merge-write pattern; `formatScore('it-IT')` shared utility

**Addresses:** `bestScore` persistence (table stakes #1); score formatting consistency across all surfaces

**Avoids:** Schema clobber (M1), formatting divergence (M4), save effect double-write (M5)

**Research flag:** None — standard TypeScript interface extension with optional field, backward-compatible localStorage JSON, established project patterns.

---

### Phase 2: GameScreen Orchestration

**Rationale:** `GameScreen` is the only component with access to both `state.score` (current run) and `getLevelProgress()` (stored best). The `isNewRecord` derivation must live here, computed at render time before the save effect fires. This phase extends the `saveProgress` call and produces the `isNewRecord` prop that Phase 3 consumes. Nothing in Phase 3 or 4 can be correctly implemented until Phase 2 establishes this contract.

**Delivers:** `isNewRecord` derived at render time (pre-save); `saveProgress` call extended with `state.score`; `isNewRecord` reset to `false` in `handleRestart` and `handleNext`; dependency array intentionally kept as `[state.status, state.stars]` with explanatory comment

**Addresses:** New-record comparison logic (dependency chain prerequisite for "Nuovo Record!" badge)

**Avoids:** Stale pre-save read (M3), first-play false positive (M2), double-write from expanded dependency array (M5)

**Research flag:** None — patterns are fully specified in ARCHITECTURE.md with code examples.

---

### Phase 3: LevelComplete Record Badge

**Rationale:** Depends on `isNewRecord` prop from Phase 2. `LevelComplete` is a pure display component — it renders only what it is told. The badge is one conditional element with a CSS keyframe animation timed to sequence after the existing star pop-in.

**Delivers:** "Nuovo Record!" badge visible when `isNewRecord === true`; gold pulse animation (CSS keyframe, ~0.6s delay after card entrance); no dismiss required; does not replace or compete with existing confetti

**Addresses:** Personal record signal on `LevelComplete` (table stakes #3)

**Avoids:** Badge on first play (M2), diluting existing completion celebration (anti-feature from FEATURES.md), looping animation (annoying pattern confirmed by competitive analysis)

**Research flag:** None — CSS Module keyframe animation is the established project pattern; conditional prop rendering is standard React.

---

### Phase 4: LevelSelect Score Display

**Rationale:** Depends only on Phase 1 (storage shape). Can be developed in parallel with Phases 2–3 once Phase 1 is complete. Listed last here for simplicity; in practice, Phases 3 and 4 may proceed concurrently.

**Delivers:** "X.XXX pt" score displayed below stars in each `LevelCell` via `formatScore` utility; `—` shown for unplayed levels (never `0 pt`); score hidden on locked cells; consistent `it-IT` locale via shared utility

**Addresses:** Best score display on `LevelCell` (table stakes #2)

**Avoids:** Formatting divergence (M4), `0 pt` on unplayed levels (UX pitfall), `0 pt` on locked cells (anti-feature), repeated `JSON.parse` per cell (existing `loadAllProgress()` call covers all cells in one read)

**Research flag:** None — `loadAllProgress()` pattern is already established; `LevelCell` extension is a single optional prop and one conditional render.

---

### Phase Ordering Rationale

- **Storage must be first.** Both `LevelComplete` badge and `LevelSelect` score display depend on `bestScore` being in the data shape. Developing UI against stubs means re-integration work.
- **GameScreen before LevelComplete.** `LevelComplete` is a dumb component; it needs the prop contract established by `GameScreen`'s Phase 2 work before its own `isNewRecord` prop can be finalized.
- **LevelSelect is independent of LevelComplete.** After Phase 1, `LevelSelect` work can proceed in parallel with Phases 2–3. The two display phases share only the `formatScore` utility.
- **Single `formatScore` utility created in Phase 1.** This is the only cross-cutting dependency between the display phases. Creating it first eliminates the main source of divergence.

### Research Flags

All four phases use standard patterns — no phase needs `/gsd:research-phase`:

- **Phase 1 (Storage + Utility):** Textbook TypeScript optional interface extension. Backward-compatible `localStorage` JSON. `Intl.NumberFormat` is a documented ECMAScript API. No ambiguity.
- **Phase 2 (GameScreen):** Read-before-write pattern in a `useEffect` is fully specified in ARCHITECTURE.md with code samples. Pre-render computation of `isNewRecord` is a well-understood React pattern.
- **Phase 3 (LevelComplete):** CSS Module keyframe is already in heavy use throughout the project. Conditional prop rendering is standard React.
- **Phase 4 (LevelSelect):** Extending an existing synchronous render-time read. One new prop, one conditional render expression.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Based entirely on direct codebase inspection of `storage.ts`, `GameScreen.tsx`, `LevelComplete.tsx`, `LevelSelect.tsx`, `package.json`, `types.ts` — all integration points confirmed by reading actual source files |
| Features | HIGH | Patterns from well-documented pre-2024 mobile/browser games (Alto's Adventure, Threes!, 2048, Crossy Road, Cut the Rope); codebase audit confirmed existing prop shapes and animation timing |
| Architecture | HIGH | Every component boundary verified by reading actual source files; data flow diagrams in ARCHITECTURE.md grounded in code, not inference; anti-patterns identified from direct code evidence |
| Pitfalls | HIGH | All milestone pitfalls cite specific file paths, line numbers, and actual code snippets from the codebase; `JSON.stringify` dropping `undefined` and React effect timing confirmed against MDN |

**Overall confidence:** HIGH

### Gaps to Address

The following items were identified but are not blockers to starting Phase 1:

- **Time-elapsed in star formula (Pitfall 8, project-level):** `PROJECT.md` states stars should factor in "velocità" (speed), but `timeElapsed` is never consulted by `engine.ts`. This milestone does not touch the star formula, but the ambiguity must be resolved before the next star-related milestone. Decision needed: is time a star factor or only a personal-best display metric? If time becomes a star factor after levels ship, all existing saves are invalidated.

- **`isLevelUnlocked` key construction (Pitfall 2, project-level):** The unlock function's index-based key construction is correct only for sequential level IDs. This milestone does not modify unlock logic, but the refactor should be scheduled before level count exceeds ~10. One-line fix now; potentially high-cost repair after players have saves.

- **Delta display ("+ 340 pt") scope:** FEATURES.md marks this P2. Confirm with stakeholder whether it belongs in this milestone or the next. Low implementation cost; the only decision is scope boundary.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)

- `src/game/storage.ts` — `LevelProgress` interface, `saveProgress` logic, `PROGRESS_KEY`, `getLevelProgress`, `isLevelUnlocked`
- `src/components/GameScreen.tsx` (lines 186–192) — `saveProgress` call site, completion `useEffect` structure, dependency array and lint suppression
- `src/components/LevelComplete.tsx` — existing `score` prop, stats layout, animation timings, confetti pattern
- `src/components/LevelSelect/LevelSelect.tsx` — `LevelCell` props and layout, `loadAllProgress` call pattern
- `src/App.tsx` — screen routing; confirms App has no score awareness
- `src/game/types.ts` — `GameState.score` field, `LevelProgress` structure
- `src/game/engine.ts` — star formula, `improved` guard, `mistakes` vs `invalidDrops` counters
- `package.json` — `zustand` confirmed absent; `styled-components` v6.3.9 present but unused in game components
- `.planning/PROJECT.md` — online leaderboard confirmed out of scope

### Primary (HIGH confidence — established browser/ECMAScript APIs)

- `Intl.NumberFormat('it-IT')` / `Number.prototype.toLocaleString` — MDN: standard ECMAScript API; `1420` → `"1.420"` in `it-IT` locale; hardcoded locale avoids browser-default divergence
- `JSON.stringify` drops `undefined` values silently — MDN: confirmed serialization behavior; source of M1 pitfall
- React `useEffect` runs after paint — React documentation: effects run after the browser has painted; source of M3 pitfall

### Secondary (HIGH confidence — domain UX patterns, pre-2024 releases within training window)

- Alto's Adventure (Snowman, 2014) — personal best display, "New best!" banner, strict `>` comparison, no badge on first run
- Threes! (Sirvo, 2014) — score-based new-record pattern, strict `>`, badge on game-over card
- 2048 (Cirulli, 2014) — persistent best score in browser `localStorage` across sessions
- Crossy Road (Hipster Whale, 2014) — record fires only on genuine beat, not on ties or first play
- Cut the Rope (ZeptoLab, 2010) — star ceremony timing as additive layer, not replacement of completion screen; staggered information reveal

---

*Research completed: 2026-02-25*
*Ready for roadmap: yes*
