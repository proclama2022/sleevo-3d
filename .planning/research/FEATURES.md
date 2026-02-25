# Feature Research

**Domain:** Personal best score display and "Nuovo Record!" moment — browser puzzle game (Sleevo v1.1 milestone)
**Researched:** 2026-02-25
**Confidence:** HIGH — Patterns drawn from well-documented, pre-2024 mobile/browser games (Alto, Threes!, 2048, Crossy Road, Cut the Rope); full codebase audit completed; no web search required for this stable UX domain.

---

## Scope

This milestone adds three tightly-related things to an already-shipped v1.0:

1. `bestScore` field added to `LevelProgress` in `localStorage` (extend `storage.ts`)
2. Best score displayed on each `LevelCell` in the level-select grid ("1.420 pt")
3. "Nuovo Record!" badge on `LevelComplete` when this run beat the saved best

Everything else (stars, unlock logic, LevelComplete layout, GameScreen save flow) is already built
and must not be re-architected. All three new features are additive.

---

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `bestScore` persisted in localStorage | Score on level select is meaningless if it resets every visit; players return to retry and expect their record to be there | LOW | Extend existing `LevelProgress` interface with one optional `bestScore?: number` field; `saveProgress` already called at completion |
| Best score shown on each LevelCell | Players use the level-select grid as a scoreboard; seeing only stars but no score feels like missing data for a score-based game | LOW | One `<span>` below `.stars` in `LevelCell`; conditionally rendered only when `bestScore > 0` |
| Record signal on LevelComplete when beaten | Every mobile puzzle game with a score system signals a personal best; absent signal = player doesn't know they improved | MEDIUM | Requires reading previous best before saving, comparing, then passing `isNewRecord` boolean to `LevelComplete` |
| Record badge fires only when genuinely beaten | "New record" that fires on first run or on ties feels broken and devalues the signal | LOW | Gate on `currentScore > previousBestScore` (strict greater-than; see edge cases) |
| Score formatted with Italian thousand-separator | "1420 pt" reads as amateurish; "1.420 pt" matches Italian locale convention and the game's existing attention to detail | LOW | `score.toLocaleString('it-IT')` — standard JS API |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| "Nuovo Record!" with gold pulse animation | Transforms a stat row into a celebration moment; makes replaying feel rewarding rather than mechanical | MEDIUM | CSS keyframe pulse on a badge element; gold (#f5b852) already used for earned stars — palette consistent |
| Best score on LevelCell subtly styled | Distinguishes "untouched level" (no score shown) from "cleared level" at a glance without competing with the level number or stars | LOW | ~9px, muted amber — present but recessive |
| Delta display alongside badge ("+ 340 pt") | Tells the player by how much they improved — makes the achievement feel concrete and motivates one more run | LOW | `delta = currentScore - previousBest`; only shown when `previousBest` existed and was strictly beaten |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| "Nuovo Record!" on first completion of a level | "The first time is technically a record!" | Feels hollow; players recognize that beating nothing is meaningless; devalues all future record signals | Only show when `previousBest` was already saved and is strictly beaten |
| Animated score counter on LevelSelect (counting up to bestScore) | Looks dynamic | Adds perceived loading delay, creates motion in a navigation context, conflicts with the compact cell layout | Static text; save animation budget for LevelComplete only |
| "New record" sound effect | Audio reward reinforces the moment | No audio system exists in Sleevo; an unexpected browser sound event is jarring | Visual animation handles the reward signal entirely |
| Showing score on locked cells | Apparent completeness | Locked cells display the lock icon and have 0 stars; "0 pt" reads as a bug, not data | Conditional render: show bestScore only on unlocked cells that have a `bestScore > 0` value |
| Separate "Records" screen | Comprehensive history feels professional | Adds a nav destination, a data structure, and zero gameplay value at this stage; LevelSelect already functions as the scoreboard | Keep everything in LevelSelect and LevelComplete |
| Tracking `bestScore` and `bestTime` with a shared "best run" concept | Elegant | Creates a conflict: what if run A had a higher score but run B was faster? Which is the "best run"? | Keep `bestTime` logic unchanged (already independent); `bestScore` is its own separate best-of field |
| Permanent "record" indicator on LevelCell (e.g., gold border when record was set this session) | Session feedback | localStorage has no session concept; the indicator would disappear on reload; inconsistent state is confusing | The score itself shown on LevelCell is the permanent record display; no session decoration needed |

---

## Feature Dependencies

```
[bestScore in localStorage]
    └──required by──> [Best score on LevelCell]
    └──required by──> ["Nuovo Record!" badge on LevelComplete]

[Previous best read BEFORE saveProgress is called]
    └──required by──> ["Nuovo Record!" — must compare pre-save vs current run]

[isNewRecord boolean computed in GameScreen]
    └──required by──> [LevelComplete receives it as a prop]

["Nuovo Record!" badge]
    └──enhances──> [Existing LevelComplete confetti + starPop animations]
    └──uses──> [Existing score prop already on LevelComplete]

[score prop already in LevelComplete]
    └──already exists — LevelComplete already displays score in .stats row]
```

### Dependency Notes

- **Previous best must be read before `saveProgress` is called.** `GameScreen` calls `saveProgress` inside a `useEffect` triggered by `state.status === 'completed'` (line 187–192). The new-record check must happen in the same effect: read `getLevelProgress(state.level.id)`, compute `isNewRecord`, then call `saveProgress`. Saving first would overwrite the previous best, making the comparison always false.

- **`LevelComplete` needs one new prop `isNewRecord: boolean`.** The component is already dumb (pure display). Adding one prop keeps the logic boundary correct: GameScreen knows about storage, LevelComplete only knows what to display.

- **`saveProgress` signature extends to include score.** Current signature: `(levelId, stars, timeSeconds?)`. New: `(levelId, stars, timeSeconds?, score?)`. The existing "only save if improved" guard (`improved` boolean) should be extended: track `bestScore` separately from `bestTime` with its own improvement condition (`score > existing.bestScore`).

- **`LevelSelect` requires no structural changes.** It already calls `loadAllProgress()` on render. Once `bestScore` is in the stored data, it's available; `LevelCell` just needs to read and display it.

---

## MVP Definition

### Launch With (this milestone — v1.1)

- [ ] Extend `LevelProgress` interface: add `bestScore?: number`
- [ ] Update `saveProgress` to accept and persist `score` with its own improvement condition
- [ ] In `GameScreen` completion effect: read previous best, compute `isNewRecord`, then save, then pass `isNewRecord` to `LevelComplete`
- [ ] `LevelComplete` accepts `isNewRecord?: boolean` prop; renders "Nuovo Record!" badge conditionally
- [ ] "Nuovo Record!" badge: gold color, brief pulse animation, no dismiss required, positioned between stars and stats or above stat grid
- [ ] `LevelCell` reads `bestScore` from progress and renders "X.XXX pt" below stars when `bestScore > 0`
- [ ] Score in `LevelCell` formatted with `toLocaleString('it-IT')`

### Add After Validation (v1.x)

- [ ] Delta display ("+ 340 pt") alongside the "Nuovo Record!" badge — adds context; defer to confirm players want the granularity
- [ ] Best score shown on `LevelHintOverlay` before a retry run ("Il tuo record: 1.420 pt") — useful context, low effort

### Future Consideration (v2+)

- [ ] Online leaderboard — explicitly out of scope in PROJECT.md; requires backend
- [ ] Score history over multiple runs — localStorage-only makes this a growing array; complexity without clear value

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| `bestScore` in localStorage | HIGH | LOW | P1 |
| Best score on LevelCell | HIGH | LOW | P1 |
| "Nuovo Record!" badge on LevelComplete | HIGH | MEDIUM | P1 |
| Delta display on badge ("+ N pt") | MEDIUM | LOW | P2 |
| Best score on LevelHintOverlay | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for this milestone
- P2: Should have, add when core is stable
- P3: Nice to have, future consideration

---

## Edge Cases and UX Behaviors

These details determine whether the feature feels correct or feels broken.

### Score Improvement Condition

Use strict greater-than (`>`), not greater-than-or-equal (`>=`).

A tied score is not a record. Showing "Nuovo Record!" on a tie trains the player to distrust the signal. Alto's Adventure, Crossy Road, and Threes! all use strict `>`. Matching the convention is correct here.

### First Completion of a Level

`previousBest` will be `null` — no localStorage entry exists yet. Do not show "Nuovo Record!". There is nothing to beat. Show only the normal completion UI with confetti.

The variable name in code should reflect this: `const isNewRecord = previousBest !== null && state.score > previousBest.bestScore`.

### Score Is Zero or Negative

Error-heavy runs can produce very low or zero scores. Guard: only show "Nuovo Record!" if `state.score > 0`. A zero-point "new record" is nonsensical and may confuse the player into thinking the display is a bug.

### LevelCell Layout After Adding Score Row

Current cell layout: level number (18px bold) + stars row (12px). The cell uses `aspect-ratio: 1`. Adding a score row (~10px) will push the cell taller by approximately that amount. The grid layout reflows uniformly across all 21 cells, so the visual change is consistent.

If height is a concern, reduce the level number font from 18px to 16px — still fully legible at the grid scale. Do not remove `aspect-ratio`; it keeps all cells consistent.

### Return to LevelSelect After Completion

`LevelSelect` calls `loadAllProgress()` synchronously on render (no async). After `saveProgress` runs in `GameScreen`, the data is in localStorage. When the player returns to `LevelSelect` (via `onReturnToSelect`), the component re-renders and reads the updated best. No extra mechanism needed.

### "Annulla e torna" / Early Exit

`saveProgress` is only called when `state.status === 'completed'`. If a player exits early, nothing is saved. No edge case here — the existing architecture already handles it correctly.

---

## What Makes "Nuovo Record!" Feel Satisfying vs Annoying

**Satisfying patterns (observed in Alto, Threes!, 2048, Crossy Road, Cut the Rope):**
- Fires rarely — only when genuinely beaten with strict `>`; not on first run, not on ties
- Appears as an additive element on the existing completion screen — does not replace or obscure stars
- Uses the existing reward color (gold) — visually consistent with earned stars
- Brief animation that completes in under 1 second and does not loop
- Appears after the initial card animation and star pop-in sequence (0.4–0.8s delay), so it does not compete with the primary celebration
- Requires no player action to dismiss — it is informational, not a gate

**Annoying patterns to avoid:**
- Fires on first completion ("you set a new record!" with no previous record — meaningless)
- Fires on score ties (feels wrong to experienced players)
- Full-screen overlay that blocks buttons and requires a dismiss tap
- Color that clashes with the existing warm-brown/amber aesthetic (avoid pure white, pure red)
- Persistent session badges on LevelCell that disappear on reload (inconsistent state)
- Any sound or vibration — Sleevo has no audio system; unexpected browser audio is jarring

**Timing recommendation:** The LevelComplete `cardIn` animation takes 0.4s. Stars pop in at 0.1s, 0.25s, 0.4s (nth-child delays). Position the "Nuovo Record!" badge animation to begin at ~0.6s — after stars have popped. This sequence mirrors how Alto's Adventure staggers its post-run information reveals.

---

## Competitor Feature Analysis

| Feature | Alto's Adventure | Threes! | 2048 | Sleevo (proposed) |
|---------|-----------------|---------|------|-------------------|
| Personal best display | Session-best in HUD during run; all-time best on run-end screen | Best tile achieved shown in game-over card | Best score shown above grid, persists across sessions | Best score in level-select cell, persists in localStorage |
| "New record" signal | "New best!" banner, top of screen, fades ~3s | "New best!" in bright color on game-over card | Score area turns amber / highlighted | Badge on LevelComplete card, no dismiss |
| First-run behavior | No "new best" on first run | No "new best" on first game | No "new best" on first game | No badge on first completion |
| Strict `>` or `>=` | Strict `>` | Strict `>` | Strict `>` | Strict `>` |
| Score formatting | Integer | Integer | Integer | Integer, Italian locale `.` separator |
| Badge persistence | Ephemeral (fades) | Shown only on that game-over screen instance | Shown until next run starts | Shown only during that LevelComplete render |

---

## Sources

- Codebase audit (HIGH confidence):
  - `src/game/storage.ts` — existing `LevelProgress` interface, `saveProgress`, `getLevelProgress`
  - `src/components/LevelComplete.tsx` — existing props, stats layout, animation timings
  - `src/components/LevelSelect/LevelSelect.tsx` — `LevelCell` layout, `loadAllProgress` usage
  - `src/components/GameScreen.tsx` lines 186–192 — `saveProgress` call site in completion `useEffect`
  - `src/game/types.ts` — `GameState.score` field, `LevelProgress` structure
  - `.planning/PROJECT.md` — out-of-scope list confirming leaderboard/online features excluded
- Game UX patterns (HIGH confidence — well-documented, pre-2024 releases within training window):
  - Alto's Adventure (Snowman, 2014) — personal best display and "new best" signal
  - Threes! (Sirvo, 2014) — score-based new-record pattern
  - 2048 (Cirulli, 2014) — persistent best score across sessions in browser localStorage
  - Crossy Road (Hipster Whale, 2014) — record-only-on-genuine-beat behavior
  - Cut the Rope (ZeptoLab, 2010) — star ceremony timing as additive layer on completion screen
- Italian locale formatting: `Number.prototype.toLocaleString('it-IT')` — standard ECMAScript API, documented in MDN

---

*Feature research for: Sleevo — personal best score display + "Nuovo Record!" milestone*
*Researched: 2026-02-25*
