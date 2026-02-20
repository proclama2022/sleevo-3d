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
