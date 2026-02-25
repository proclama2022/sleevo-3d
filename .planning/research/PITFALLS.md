# Domain Pitfalls

**Domain:** Casual browser game — level progression, star ratings, multiple game modes
**Project:** Sleevo (React + Three.js vinyl sorting game)
**Researched:** 2026-02-20
**Confidence:** HIGH (based on direct codebase analysis + domain knowledge)

---

## Critical Pitfalls

Mistakes that cause rewrites, broken progression, or significant player frustration.

---

### Pitfall 1: Star Thresholds That Don't Account for Mode Difficulty

**What goes wrong:** The current star formula in `engine.ts` is flat:
- 0 mistakes + 0 hints used = 3 stars
- <= 2 mistakes OR <= 1 hint = 2 stars
- Anything else = 1 star

This formula is applied identically across all modes. A `rush` level where time expires
also silently returns 1 star (`rushTimeLeft: 0, status: 'completed', stars: 1`) regardless
of how many vinyls were placed correctly before time ran out. A `blackout` level with
hidden labels is objectively harder than a `free` mode level — the same mistake count
yields the same stars in both, punishing players disproportionately on harder modes.

**Why it happens:** The star formula was designed once for the simple base mode and never
differentiated as new modes were added.

**Consequences:**
- Players stuck on 1 star on hard modes even with strong performance
- 3-star threshold on `rush` and `blackout` modes feels impossible
- Discourages replaying to improve rather than just pushing forward

**Prevention:**
- Define per-mode star thresholds in the `Level` data structure (e.g. `starThresholds?: { three: number; two: number }` where the number is max allowed mistakes)
- `rush` and `blackout` modes should allow 1-2 more mistakes for 3-star than `genre` mode
- For `rush` mode specifically: award stars based on percentage of vinyls placed before time runs out (e.g. 100% = 3 stars, >=75% = 2 stars, any completion = 1 star)

**Detection:** Playtest every mode — if 3 stars on `blackout` level 5 requires multiple retries even with good play, the threshold is too tight.

**Phase:** Address when implementing the star system. Do not let the flat formula persist into levels beyond the first 3-4.

---

### Pitfall 2: Level Unlock Key Naming Is a Latent Off-by-One Trap

**What goes wrong:** `isLevelUnlocked(levelIndex)` in `storage.ts` constructs the unlock
check key as `level-${levelIndex}`, not `level-${levelIndex + 1}`. This works today by
coincidence: level at index 1 has id `level-2`, but the unlock check looks for `level-1`
(the id of the level at index 0). The pattern holds only because level IDs use 1-based
numbering while indices are 0-based and the subtraction happens implicitly.

If any level is ever inserted, removed, or given a non-sequential ID, the unlock chain
will silently break — players will be blocked from levels they have already unlocked, or
levels will unlock prematurely.

**Why it happens:** The function was written to check "has the previous level been
completed" but conflated the numeric index with the level ID suffix.

**Consequences:**
- Adding a level between existing levels scrambles all unlock state
- Players who replay older levels may lose progress on newer ones
- Defect is invisible until level count changes

**Prevention:**
- Refactor `isLevelUnlocked` to look up the previous level's ID from the levels array
  directly, rather than constructing a string from the index
- Store progress keyed by a stable level ID, and resolve "previous level ID" from the
  ordered levels array: `levels[levelIndex - 1].id`
- Add a unit test that verifies unlock logic for level at index 2+ after completing only
  the immediately preceding level

**Detection:** Insert a test level between level-1 and level-2 and verify level-2 still
unlocks correctly.

**Phase:** Fix before adding 20+ levels. At 3 levels the bug is dormant; at 20+ it is
likely to be triggered.

---

### Pitfall 3: Scope Creep from Partially-Implemented Modes

**What goes wrong:** The codebase defines 7 `LevelMode` values (`free`, `genre`,
`chronological`, `customer`, `blackout`, `rush`, `sleeve-match`) with full type
definitions and partially-wired engine logic. However:

- `blackout` mode's label-hiding mechanic is triggered by a component-level `useEffect`
  with a `setTimeout(3000)` — not driven by the engine. If the component remounts or the
  effect fires twice, labels hide immediately or not at all.
- `sleeve-match` validation is acknowledged in `rules.ts` to be handled elsewhere
  (`// Sleeve-match mode: la validazione specifica è gestita in engine.ts`) — a split
  that makes the validation path non-obvious and easy to break.
- `customer` mode has two separate +500 bonus paths: one dispatched inline during
  `PLACE_VINYL` and one computed at completion (`customerBonus`). These can stack.

Each mode that is "partially there" becomes a trap when new levels are added that use it,
because the author assumes it is finished.

**Why it happens:** Types were defined speculatively, then modes were partially wired
without a completion checklist.

**Consequences:**
- Regressions when adding new levels that use a mode assumed to work
- Bugs that are hard to reproduce because they depend on component lifecycle
- Inconsistent scoring across modes

**Prevention:**
- Create a one-page "mode contract" for each mode before adding levels that use it:
  what triggers start, what counts as success, how stars are calculated, what resets on
  failure
- Move all timer-based mechanics (`blackout` 3-second trigger, `rush` countdown) into
  the engine via a `TICK` action dispatched from a single stable timer in the game loop
  — never from ad-hoc `useEffect` timeouts scattered across components
- Write one integration test per mode that exercises the full success and failure paths

**Detection:** Run through each mode manually after adding any new level that uses it.
Check: does it complete correctly? Do stars reflect performance? Is the score correct?

**Phase:** Before authoring levels 5-20, audit every mode end-to-end.

---

### Pitfall 4: Player Frustration from Invisible Rules in Harder Modes

**What goes wrong:** `blackout` mode hides labels after 3 seconds and requires
chronological sorting from memory. `customer` mode requires identifying one specific
vinyl by genre and era from a mixed carousel. Neither mode gives the player a way to
recover understanding of the rule mid-level. If a player forgets the order or misidentifies
the customer's target, they have no recourse except random guessing (accumulating
mistakes) or restarting.

The project's own core value statement says: "Il giocatore deve sempre sapere esattamente
cosa deve fare." Modes that intentionally obscure the rule need a fallback that preserves
this promise — otherwise the mode design contradicts the core value.

**Why it happens:** Mode difficulty is designed by removing information, but the player
communication layer is not updated to account for how much information has been removed.

**Consequences:**
- Players perceive the game as unfair rather than challenging
- `blackout` and `customer` levels generate disproportionate quit events
- 1-star completions on these modes as players give up and rush to finish

**Prevention:**
- `blackout`: Show a brief recap overlay ("Hai 3 secondi — memorizza l'ordine!") before
  the timer starts, not just the hint text. After labels disappear, show a subtle
  "Sequenza: Blues < Rock < Pop < Disco..." strip at the bottom as an optional hint
  that costs 1 star penalty.
- `customer`: Show the customer request persistently (CustomerPanel already exists),
  and ensure the matching vinyl is visually distinguishable in the carousel (e.g. a
  brief glow on load).
- Rule: every mode should have a "you can always see this" element that tells the player
  what rule is active, even if other information is hidden.

**Detection:** Give the game to a new player with no prior explanation. If they spend
>10 seconds on a `blackout` level guessing randomly, the rule communication has failed.

**Phase:** Address mode-by-mode when implementing the levels that introduce each mode.

---

## Moderate Pitfalls

---

### Pitfall 5: Customer Mode Double-Bonus Scoring

**What goes wrong:** In `engine.ts`, `customer` mode awards +500 when the correct vinyl
is placed via `SERVE_CUSTOMER` dispatch, AND checks `justServedCustomer` at completion
to add another `customerBonus`. If the customer was served mid-level, both bonuses fire.
If `customerServed` state is not properly reset between levels, a player completing the
next non-customer level may receive a phantom +500.

**Prevention:**
- Audit the customer scoring path to ensure the bonus is applied exactly once, at a
  single defined point (prefer: at level completion, based on state, not as two separate
  additions)
- Ensure `customerServed` and `customerLeft` reset fully on `LOAD_LEVEL`

**Phase:** Fix before any customer mode level ships to playtesters.

---

### Pitfall 6: Difficulty Curve Collapse When Modes Are Interleaved

**What goes wrong:** With 20 levels across 7 modes, the natural temptation is to cycle
through modes (level 1: free, level 2: genre, level 3: chronological, level 4: customer,
etc.) without regard for cumulative difficulty. A player hitting `rush + blockedSlots`
at level 15 after a gentle level 14 experiences a cliff, not a curve.

The current level data already shows this pattern: level 16 is "CLIENTE DIFFICILE" with
the shortest customer timer (20 seconds), level 17 is "il grande rush finale" with 75
seconds and 12 vinyls, level 18 is "sleeve-match con timer." Three hard-mode levels in
a row, all at the end, is a wall not a ramp.

**Prevention:**
- Map difficulty as a numeric score (vinyl count + active constraints) before assigning
  mode sequences
- Ensure each new mode is introduced first in a simple/forgiving form, then revisited in
  a harder form 2-3 levels later
- Interleave "relief" levels (free or genre mode with few vinyls) between demanding
  levels to give players a win before the next challenge

**Detection:** Score each level on a simple rubric (1 pt per vinyl, 1 pt per active
constraint, +2 for timer) and plot the scores — the curve should be roughly monotonic
with occasional dips, not flat then spiking.

**Phase:** Plan difficulty curve before finalizing level order.

---

### Pitfall 7: localStorage Progress Schema Has No Version Guard

**What goes wrong:** The progress object stored at `sleevo_progress` is an unversioned
`Record<string, LevelProgress>`. If the data shape changes (e.g. adding a `mode` or
`completionDate` field), old saves will deserialize without error but with missing fields
that code may not guard against.

More critically: if level IDs are ever renamed or renumbered, saved progress keys become
orphaned. A player who completed `level-5` under the old naming will find level 5 locked
after a rename.

**Prevention:**
- Add a `version: number` field to the persisted object
- On load, check version and migrate or clear if stale
- Document that level IDs must never be renamed after shipping

**Phase:** Implement before first public release. Low cost now, high cost after users have saves.

---

### Pitfall 8: Time-Elapsed Scoring Not Wired to Star Formula

**What goes wrong:** `timeElapsed` is tracked in `GameScreen.tsx` via a local
`useState` and passed to `LevelComplete` for display, but it is NOT passed to the engine
and NOT factored into the star calculation. The PROJECT.md specification says stars
should be based on "combinazione errori + velocità." The current engine ignores speed
entirely.

The `bestTime` field in `LevelProgress` persists time, but the star formula
(`mistakes === 0` etc.) never consults time. Players can complete a level in 10 minutes
with zero mistakes and still get 3 stars.

**Prevention:**
- Decide before implementing the star system whether time is a star factor or only a
  "personal best" leaderboard metric. If it is a star factor, wire `timeElapsed` into
  the engine's completion logic and define per-level time thresholds.
- If time is only cosmetic (personal best display), remove it from the spec language to
  avoid future confusion.

**Detection:** The discrepancy is already present in the codebase — check engine.ts line
~157 and confirm `timeElapsed` is not consulted.

**Phase:** Resolve the ambiguity during the star system implementation phase. Do not ship
20 levels and then retroactively add time to star calculations — it invalidates all
existing player saves.

---

### Pitfall 9: `blockedSlots` Not Enforced at Engine Level

**What goes wrong:** `blockedSlots` are checked in `rules.ts` (placement validation)
and rendered in `Shelf.tsx`/`ShelfSlot.tsx`. However, there is no check in the engine's
completion condition that blocked slots are excluded from the "all vinyls placed"
calculation. If a level has 6 vinyls and 2 blocked slots on a 2x4 grid, the completion
check is `placedCount >= totalVinyls` (6 >= 6) which works correctly — but only because
`totalVinyls` counts vinyls, not slots. This remains correct as long as the invariant
`vinyls.length <= available_slots` is maintained in every level definition. Violating
this invariant (e.g. 8 vinyls, 2 blocked slots on a 2x4 grid = 6 available slots)
produces an uncompletable level with no error message.

**Prevention:**
- Add a level validation utility that asserts `vinyls.length <= (rows * cols) - blockedSlots.length`
- Run this validation at level-load time in development and log a clear error

**Phase:** Implement before authoring levels 6+ which use `blockedSlots`.

---

## Minor Pitfalls

---

### Pitfall 10: `mistakes` and `invalidDrops` Track the Same Events Inconsistently

**What goes wrong:** `mistakes` is incremented on: invalid placement (line 120),
customer timer expiry (line 252). `invalidDrops` is incremented only on invalid placement
(line 198). The star formula uses `mistakes`, not `invalidDrops`. The LevelComplete
screen also displays `mistakes`, not `invalidDrops`. But the old scoring formula
(`score = placedCount * 10 - invalidDrops * 2`) uses `invalidDrops`. Two parallel
counters tracking similar but not identical events creates confusion about which is
authoritative.

**Prevention:**
- Consolidate to one counter: `mistakes` (which is broader and covers all failure states)
- Update the score formula to use `mistakes` for consistency, or rename `invalidDrops`
  to `placementErrors` and keep it as a sub-category of `mistakes`
- Remove whichever counter is not needed

**Phase:** Resolve during the scoring / star system phase.

---

### Pitfall 11: No Level Selection UI Means No Replay Incentive

**What goes wrong:** The current flow is strictly sequential: complete a level, advance
to the next. There is no way for a player to return to level 3 to improve their 2-star
score to 3 stars. The `bestTime` and star progress saved in localStorage have nowhere
to surface. This means the "improve your performance" loop — a core motivation for star
systems — has no entry point.

**Prevention:**
- Plan a level select screen as part of the progression milestone, even if it is minimal
  (a scrollable list of levels showing earned stars and locked state)
- The level select screen also becomes the natural entry point for the game after the
  first session

**Phase:** Include in the level progression milestone. Do not treat it as optional polish.

---

### Pitfall 12: Combo Decay Makes Later Levels Feel Punishing

**What goes wrong:** The combo timer (4000ms between placements before streak resets)
was calibrated for a fast carousel with 8 vinyls. On larger levels (12+ vinyls, the
`rush` finale has many items) or on `blackout` mode where players must think before
placing, the 4-second window forces players to rush rather than reason, undermining the
skill being tested by those modes.

**Prevention:**
- Make `comboDecayMs` a per-level or per-mode configurable value rather than a global
  constant
- `blackout` and `chronological` modes should use a longer window (6-8 seconds);
  `rush` mode should keep or tighten the current window

**Phase:** Note when designing levels that use combo-sensitive modes (chronological,
blackout).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Star system implementation | Flat thresholds punish hard modes (Pitfall 1) | Define per-mode or per-level thresholds upfront |
| Star system implementation | Time-elapsed not in star formula despite spec (Pitfall 8) | Resolve ambiguity before coding |
| Level unlock logic | Off-by-one in storage key construction (Pitfall 2) | Refactor to derive previous level ID from array |
| Adding levels 5-20 | Partially-implemented modes cause silent bugs (Pitfall 3) | Audit each mode end-to-end before using in new levels |
| Customer mode levels | Double-bonus scoring (Pitfall 5) | Audit scoring path, single bonus point of dispatch |
| Blackout / customer UX | Mode rules obscured without recovery (Pitfall 4) | Add persistent rule reminder per mode |
| Difficulty ordering | Mode interleaving creates walls not curves (Pitfall 6) | Score and plot difficulty before finalizing level order |
| First public release | Unversioned localStorage schema (Pitfall 7) | Add version field and migration before shipping |
| Blocked-slot levels | Uncompletable level possible (Pitfall 9) | Add level validation assertion at load time |
| Level progression overall | No level select = no replay incentive (Pitfall 11) | Include level select in progression milestone scope |

---

## Sources

- Direct codebase analysis: `src/game/engine.ts`, `src/game/storage.ts`, `src/game/levels.ts`, `src/game/rules.ts`, `src/game/types.ts`
- `src/components/GameScreen.tsx` (timer wiring, blackout trigger, customer timer)
- `src/components/LevelComplete.tsx` (displayed stats vs. star-driving stats)
- `.planning/PROJECT.md` (stated requirements and design decisions)
- `GAME-LOGIC.md` (authoritative description of current game mechanics)
- Confidence: HIGH — all pitfalls grounded in direct code evidence, not assumption

---

---

# Milestone Pitfalls: Best Score Persistence + Personal Record UI

**Milestone:** Adding `bestScore` to localStorage + score display in LevelSelect + "Nuovo Record!" in LevelComplete
**Researched:** 2026-02-25
**Confidence:** HIGH — based on direct inspection of `storage.ts`, `LevelComplete.tsx`, `LevelSelect.tsx`, `GameScreen.tsx`, `game/types.ts`

> These pitfalls are additive to the project-level pitfalls above. They are specific to the brownfield extension described in the milestone context.

---

## Critical Pitfalls

---

### Pitfall M1: Schema Extension Clobbers Existing Records via Destructive Write

**What goes wrong:**
`saveProgress()` currently writes the entire `LevelProgress` object atomically:

```ts
data[levelId] = { stars, bestTime: timeSeconds };
```

If `bestScore` is added naively as a third argument and assigned the same way, any completion where `bestScore` is not provided (or is `undefined`) will write `bestScore: undefined`. `JSON.stringify` drops `undefined` values silently, so the key disappears. On read, `existing.bestScore` resolves as `undefined` — which looks the same as "never played." More dangerously: if the `improved` guard is not updated to include score, a high-score run on a slow completion may be rejected because `stars` stayed the same.

The existing `improved` condition is:
```ts
const improved = !existing || stars > existing.stars ||
  (stars === existing.stars && timeSeconds !== undefined &&
   (existing.bestTime === undefined || timeSeconds < existing.bestTime));
```

This gates writes on star improvement or time improvement. A run that scores higher with identical stars and equal-or-slower time is **silently discarded**.

**Why it happens:**
The save function was written for stars-then-time and was never designed to be extended. Developers add a third parameter without auditing the guard.

**How to avoid:**
- Add `bestScore?: number` to the `LevelProgress` interface.
- Extend `improved`: also write when `score !== undefined && (existing.bestScore === undefined || score > existing.bestScore)`.
- Use a merge-then-overwrite pattern to preserve fields not being updated:
  ```ts
  data[levelId] = { ...existing, stars: newStars, bestTime: ..., bestScore: ... };
  ```
- Keep `bestScore` optional — pre-existing records without it read as `undefined`, which is correct.

**Warning signs:**
- localStorage entry shows `{ "stars": 2, "bestTime": 45 }` with no `bestScore` key after a completed run.
- Replaying a level with a higher score does not update the stored value.
- LevelSelect shows `—` (or `NaN pt`) even after multiple completions.

**Phase to address:**
Phase 1 — extend `LevelProgress` interface and `saveProgress` function before any UI work.

---

### Pitfall M2: "Nuovo Record!" Fires on Every First Play

**What goes wrong:**
The most natural implementation of the new-record guard is:
```ts
const isNewRecord = score > (existingProgress?.bestScore ?? 0);
```

On first play, `existingProgress` is `null` (from `getLevelProgress`), so `existingProgress?.bestScore` is `undefined`, and `?? 0` substitutes `0`. Any positive score — which is the normal case in Sleevo — triggers "Nuovo Record!" every time a level is played for the first time. This devalues the moment for when it actually matters and trains players to ignore it.

**Why it happens:**
`?? 0` is the safe-default pattern for arithmetic, but it conflates "no previous score" with "previous score was zero."

**How to avoid:**
Gate strictly on the existence of a prior record:
```ts
const isNewRecord =
  existingProgress?.bestScore !== undefined &&
  (score ?? 0) > existingProgress.bestScore;
```
When `bestScore` is absent (first play), `isNewRecord` is `false`. On subsequent plays, it is `true` only for genuine improvement.

**Warning signs:**
- Clear localStorage, play any level once — if the "Nuovo Record!" banner appears, the guard is wrong.
- Testing: open DevTools, delete `sleevo_progress`, reload, complete level 1 — no banner should appear.

**Phase to address:**
Phase 2 — LevelComplete UI. The `isNewRecord` prop must use the strict guard before being passed to the component.

---

### Pitfall M3: `isNewRecord` Reads Stale Pre-Save Value

**What goes wrong:**
In `GameScreen.tsx`, `saveProgress` is called inside a `useEffect` that runs **after paint**:

```ts
useEffect(() => {
  if (state.status === 'completed') {
    saveProgress(state.level.id, state.stars, timeElapsed);
  }
}, [state.status, state.stars]);
```

`LevelComplete` is rendered in the same render that sets `status === 'completed'`. If `isNewRecord` is computed inside `LevelComplete` by calling `getLevelProgress()`, or if it is computed anywhere that reads from localStorage in the same render cycle, it reads the **old record** — because the save effect has not run yet. Result: `isNewRecord` is always `false` even when the score genuinely improved, because the comparison runs against the pre-save value.

**Why it happens:**
React effects run after paint, not synchronously with the render that triggers them. Developers assume the save and the read happen at the same moment.

**How to avoid:**
Compute `isNewRecord` in `GameScreen` at render time by reading the **current stored value** before the save effect fires, then passing it as a prop to `LevelComplete`:

```tsx
// In GameScreen render (not in an effect):
const existingBest = state.status === 'completed'
  ? getLevelProgress(state.level.id)?.bestScore
  : undefined;
const isNewRecord =
  existingBest !== undefined &&
  (state.score ?? 0) > existingBest;

// Pass to LevelComplete:
<LevelComplete isNewRecord={isNewRecord} ... />
```

This reads localStorage once per render while `status === 'completed'`, which is infrequent. Do not read from localStorage inside `LevelComplete` itself.

**Warning signs:**
- `isNewRecord` prop is always `false` in React DevTools even after a confirmed personal best.
- Console log inside the `saveProgress` effect shows the new value written, but the banner did not appear.

**Phase to address:**
Phase 2 — LevelComplete UI. The prop must be computed in `GameScreen`, never derived inside the component.

---

### Pitfall M4: Score Formatting Diverges Across Two Surfaces

**What goes wrong:**
The score is displayed in two separate places:
1. LevelSelect cell: `"1.420 pt"` (Italian thousands separator, unit suffix)
2. LevelComplete stats row: currently `{score ?? 0}` with label `"Punti"` — no thousands separator, no unit

If formatting is implemented inline at each call site, the two surfaces will diverge — different separators, different zero-state strings, different `undefined` handling. In Italian locale, the thousands separator is `.` (period), the opposite of English. `Intl.NumberFormat` uses the browser locale by default; a browser set to `en-US` will use `,` instead.

**Why it happens:**
Developers implement formatting at the first call site, then copy-paste with variations at the second. The browser's locale is silently used, making the output machine-dependent.

**How to avoid:**
Create a single `formatScore(score: number | undefined): string` utility — in `src/utils/index.ts` or co-located with storage — before implementing either surface:

```ts
export function formatScore(score: number | undefined): string {
  if (score === undefined || score === null) return '—';
  return new Intl.NumberFormat('it-IT').format(score) + ' pt';
}
```

Zero-state (`undefined`) renders as `—` (em-dash), not `0 pt`. Both surfaces import this function. The locale `'it-IT'` is hardcoded, not derived from the browser.

**Warning signs:**
- LevelSelect shows `0 pt` for unplayed levels.
- Score above 999 shows without thousands separator.
- LevelComplete and LevelSelect show the same number formatted differently.

**Phase to address:**
Phase 1 — create the utility in the same commit that extends the schema, before any rendering work.

---

### Pitfall M5: Double-Write Race from Save Effect Dependency Array

**What goes wrong:**
The save effect has an intentionally minimal dependency array `[state.status, state.stars]` and a lint suppression comment. `state.score` is not in the array. If a developer "fixes" the lint warning by adding `score` to the dependencies, the effect will fire on every score change during gameplay — i.e. on every vinyl placement. This hammers localStorage 5-12 times per level and can write in-progress scores as "best scores."

Conversely, if `score` is removed from the effect closure by moving it outside, a stale value may be written.

**Why it happens:**
The lint suppression (`// eslint-disable-next-line react-hooks/exhaustive-deps`) is a known smell that future developers may "fix" without understanding the intent.

**How to avoid:**
Keep the dependency array as `[state.status, state.stars]`. Read `state.score` from the closure inside the effect body — this is safe because React guarantees the closure captures current values when the effect runs. Add a comment explaining why `score` is intentionally omitted from dependencies:

```ts
useEffect(() => {
  if (state.status === 'completed') {
    // score is read from closure, not deps — intentional: fires once per completion
    saveProgress(state.level.id, state.stars, timeElapsed, state.score);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [state.status, state.stars]);
```

**Warning signs:**
- Console shows `saveProgress` being called multiple times during a single level.
- localStorage `bestScore` updates mid-level (check with DevTools Application tab open during play).

**Phase to address:**
Phase 1 — extend the save effect in the same task that extends `saveProgress`.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Inline score formatting at each call site | Faster to write | Two surfaces diverge; broken Italian separator on non-IT browsers | Never — one utility is <10 lines |
| `?? 0` as new-record guard fallback | One line, no null check | "Nuovo Record!" on every first play; reward cheapened | Never |
| Computing `isNewRecord` inside `LevelComplete` via `getLevelProgress()` | No extra prop needed | Reads stale pre-save value; banner never shows | Never |
| Writing `bestScore` without merge (`data[levelId] = { stars, bestScore }`) | Simple assignment | Drops `bestTime` from existing record; corrupts historical data | Never |
| Adding `score` to the save effect dependency array | Satisfies lint | Fires on every vinyl placement; writes in-progress scores as bests | Never |
| Showing "Nuovo Record!" with `>=` instead of `>` | Catches score ties | Fires on replay with identical score; annoys player | Never |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `localStorage` JSON round-trip | Storing `undefined` — key is dropped by `JSON.stringify` silently | Use optional field `bestScore?: number`; guard reads with `=== undefined`, not `=== null` |
| `LevelProgress` interface extension | Adding field but forgetting `isLevelUnlocked` caller — it only reads `stars`, so it is safe, but audit all `getLevelProgress` call sites | Grep for `getLevelProgress` and `loadAllProgress` before shipping |
| `Intl.NumberFormat` locale | Omitting locale argument — output depends on browser locale | Always pass `'it-IT'` explicitly; test with browser set to `en-US` |
| `saveProgress` `improved` guard | Not updating guard to include score comparison | Guard must cover: `stars improved OR (same stars, score improved)` |
| `LevelSelect` — `loadAllProgress` call | Calling `getLevelProgress()` per cell in render = 21 `JSON.parse` calls | Existing pattern calls `loadAllProgress()` once — maintain it; pass `bestScore` as prop to `LevelCell` |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| "Nuovo Record!" on every first play | Reward cheapened; players ignore it when it matters | Only show on genuine improvement over stored `bestScore` |
| "Nuovo Record!" on replay with same score (using `>=`) | Annoying repeated celebration | Strict `>` comparison only |
| `0 pt` in LevelSelect for unplayed levels | Implies the player scored zero, not that the level is new | Show `—` for `bestScore === undefined` |
| Animating "Nuovo Record!" with the full confetti burst | Dilutes the existing completion celebration | Use a distinct, smaller effect (gold shimmer/flash on the score row) separate from the confetti already present |
| Displaying bestScore in LevelSelect without a label or icon | Score meaning unclear | Include unit `pt` and optionally a small trophy icon to identify as personal best |

---

## "Looks Done But Isn't" Checklist

- [ ] **bestScore in LevelSelect:** Score is shown — verify it shows `—` for unplayed levels, not `0 pt` or `undefined pt`
- [ ] **Nuovo Record! first-play guard:** Play a level for the first time (clear localStorage first) — banner must NOT appear
- [ ] **Nuovo Record! genuine improvement:** Play a level twice with second run scoring higher — banner MUST appear on second run
- [ ] **Nuovo Record! same score:** Play a level twice with identical score — banner must NOT appear on second run
- [ ] **saveProgress writes bestScore:** Inspect localStorage after completion — value is a `number`, not `null`, not absent
- [ ] **Replay does not regress bestScore:** Complete a level with a lower score — localStorage bestScore must not decrease
- [ ] **Existing records not corrupted:** After new code runs once, existing `{ stars, bestTime }` records are intact and unlock logic still works
- [ ] **Score formatting consistency:** Complete a level scoring > 1000 — both LevelSelect and LevelComplete show `1.XXX pt` with Italian thousands separator
- [ ] **Non-IT browser locale:** Test with browser language set to `en-US` — thousands separator must still be `.` not `,`

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| `bestScore` written as `null` (if `undefined` was explicitly assigned) | LOW | Add migration in `loadAllProgress`: delete `null` bestScore keys on read; re-persist cleaned data |
| `isNewRecord` always false (stale read) | LOW | Move computation to GameScreen render time; no data migration needed |
| `isNewRecord` always true (wrong guard) | LOW | Fix guard expression; no data migration needed |
| Score formatting diverged between surfaces | LOW | Extract utility, replace two inline call sites |
| `improved` guard too strict — bestScore never updates | LOW | Fix condition; future runs write correctly; cannot recover true past best |
| `improved` guard too loose — regressions stored as bests | MEDIUM | Fix condition immediately; add migration that clears only `bestScore` (preserves stars/unlock); player replays to re-establish best |
| Existing `bestTime` dropped from records (non-merge write) | MEDIUM | Migration impossible (data lost); add merge pattern and add regression test |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Schema extension clobbers existing records (M1) | Phase 1: extend `LevelProgress` + `saveProgress` | Inspect localStorage after save; old fields preserved |
| First-play triggers "Nuovo Record!" (M2) | Phase 2: LevelComplete `isNewRecord` prop | Clear storage, play level, confirm no banner |
| `isNewRecord` reads stale pre-save value (M3) | Phase 2: compute prop in GameScreen render | React DevTools: prop is `true` on first genuine improvement |
| Score formatting inconsistency (M4) | Phase 1: create `formatScore` utility before any display | Play to >999 pts; both surfaces show identical format |
| Double-write from effect dependency (M5) | Phase 1: extend save effect, keep dep array minimal | `saveProgress` fires exactly once per completion (add temp log) |

---

## Sources

- Direct codebase inspection: `/src/game/storage.ts` — `saveProgress`, `loadAllProgress`, `getLevelProgress`, `isLevelUnlocked`
- Direct codebase inspection: `/src/components/LevelComplete.tsx` — current props, stats rendering, confetti pattern
- Direct codebase inspection: `/src/components/LevelSelect/LevelSelect.tsx` — `loadAllProgress` call pattern, `LevelCell` props
- Direct codebase inspection: `/src/components/GameScreen.tsx` — save effect (lines 186–192), dependency array, `state.score` closure
- Direct codebase inspection: `/src/game/types.ts` — `GameState.score`, `LevelProgress` shape
- MDN: `JSON.stringify` drops `undefined` object values — serialisation behaviour confirmed
- MDN: `Intl.NumberFormat` locale-aware formatting — `'it-IT'` thousands separator is `.`

---
*Pitfalls research for: Sleevo — best score persistence and personal record UI (milestone addition)*
*Researched: 2026-02-25*
