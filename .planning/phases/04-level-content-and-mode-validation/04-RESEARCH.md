# Phase 4: Level Content and Mode Validation - Research

**Researched:** 2026-02-25
**Domain:** Game content authoring, mode behavior fixes, UI overlay components
**Confidence:** HIGH (all findings derived from direct codebase inspection)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Level difficulty curve**
- Mode ordering: simple modes first — levels 1-5 use free/genre; levels 6-10 introduce chronological/customer; levels 11+ gradually add blackout, rush, sleeve-match
- Difficulty levers: two only — more vinyls per level AND stricter sorting rules (e.g. combined rules in later levels). Do NOT use distractor vinyls or artificial time pressure for difficulty.
- Vinyl count ramp: start at 4 vinyls (level 1), reach 8-10 by late levels (16-21+)
- Total levels: 21-25; no unique names needed — mode + rule is sufficient identity (e.g. "Livello 8 — Ordina per Anno")

**Rush mode: timer & time's up**
- Countdown timer position: in the HUD, replacing or sitting near the existing elapsed-time display
- Time expires behavior: auto-complete the level immediately with whatever score was accumulated — no separate "Tempo Scaduto!" screen, just flow into LevelComplete
- Low-time urgency: countdown turns red and pulses in the last 10 seconds
- Duration: each level defines its own `rushTime` field (e.g. `rushTime: 90`) in the level definition in levels.ts — no fixed global default

**Customer mode display**
- Panel content: customer name + request text — e.g. "Marco vuole: Jazz degli anni '70"
- Panel position: below the HUD, above the 3D shelf — always visible, never covers gameplay
- Panel style: dark background, amber text — matches existing HUD aesthetic exactly
- One customer per level; customer and request are fixed in the level definition; same customer appears on every replay
- Request resets correctly on LOAD_LEVEL (existing engine requirement from roadmap)

**Pre-level hint overlay**
- Trigger: shown every time a level loads (not just first exposure to a mode)
- Content: rule only — e.g. "Ordina per: Genere" or "Modalità: Blackout". No explanation text.
- Dismiss: tap anywhere OR tap an "Inizia" button — deliberate player action, not auto-dismiss
- Implementation: overlay on the game screen, appearing before the player can interact with vinyls; dismissing it starts the level

### Claude's Discretion
- Exact vinyl albums/artists used in level definitions (real-sounding Italian vinyl catalog)
- Blackout mode implementation fix (engine-level hide logic, not useEffect — roadmap specifies this)
- Customer name pool and request phrasing
- Exact hint overlay visual design (consistent with game aesthetic)
- parTime values per level (derived from vinyl count × reasonable placement speed)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LVLS-01 | 20+ levels with increasing difficulty | 21 levels already exist in levels.ts — data is complete; validation confirms mode spread and vinyl count ramp are present |
| LVLS-02 | Levels cover all modes: free, genre, chronological, customer, blackout, rush, sleeve-match | All 7 modes present across 21 levels (verified by direct audit below) |
| LVLS-03 | Difficulty curve introduces modes gradually (base → advanced variants) | Current ordering: free(1), genre(2,6,10,19), chrono(3,11), customer(4,7,12,16,20), blackout(5,13), rush(8,14,17), sleeve-match(9,15,18,21) — broadly correct but level 5 blackout is earlier than the decision requires; mode spread patterns documented |
| LVLS-04 | Every level has a clear `hint` explaining the rule | All 21 levels have `hint` field in levels.ts — but CONTEXT mandates a pre-level OVERLAY (not just InstructionPill text); this component does not yet exist |
| MODE-01 | Rush mode fully implemented with HUD timer and defined "time's up" behavior | Timer infrastructure complete (RUSH_TICK, rushTimeLeft, HUD timeRemaining prop, red coloring) — but urgency threshold is 30s not 10s; auto-complete on expiry sets stars=1 but the decision says "whatever score was accumulated" (which may imply recalculating stars normally rather than forcing 1) |
| MODE-02 | Blackout reliably hides column labels without flicker; logic lives in engine, not useEffect | FLICKER BUG EXISTS: blackout trigger is a useEffect in GameScreen.tsx (lines 192-201) dispatching BLACKOUT_TRIGGER after 3s timeout — must move to engine |
| MODE-03 | Customer mode clearly shows active customer request; resets correctly on LOAD_LEVEL | CustomerPanel exists and renders — but lacks customer name field (CONTEXT requires "Marco vuole:"); Level type has no `customerName`; reset on LOAD_LEVEL already works via createGameState() |
| MODE-04 | Sleeve-match mode matches physical disc to cover shown in slot | Fully implemented in engine.ts (sleeveTargets validation) and ShelfSlot.tsx (sleeveHint render) — all sleeve-match levels have sleeveTargets defined |

</phase_requirements>

---

## Summary

The game has 21 levels already authored in `src/game/levels.ts` and all 7 level modes are structurally present. Phases 1-3 built the engine, scoring, and navigation — Phase 4 is primarily a content validation and behavior-fix phase, not a greenfield build.

The three areas requiring active implementation work are: (1) a pre-level hint overlay component that does not yet exist, (2) blackout mode trigger that is currently in a useEffect and must move to the engine, and (3) customer mode enhancement to display a customer name. Rush mode needs a minor threshold adjustment (30s → 10s for urgency) and validation of the star calculation behavior on timer expiry.

The level content itself (21 levels, all modes covered, vinyl catalog) is complete. The planner does not need to author new levels unless validation reveals a difficulty curve gap.

**Primary recommendation:** Three focused tasks: (1) build `LevelHintOverlay` component with dismiss gate, (2) move blackout trigger to engine initialization (not useEffect), (3) add `customerName` to `Level` type and `CustomerPanel`. Rush mode urgency threshold is a one-line CSS/logic fix.

---

## Standard Stack

### Core (no new dependencies needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.2.4 | Component rendering | Already in use — all UI is React |
| styled-components | ^6.3.9 | Component styling | HUD, CustomerPanel already use it or CSS Modules — both patterns exist in project |
| TypeScript | ^5.9.3 | Type safety | Entire codebase is TS |

**No new packages required.** All Phase 4 work is React component + game engine logic only.

**Installation:**
```bash
# No new installations needed
```

---

## Architecture Patterns

### Recommended Project Structure

No new directories needed. Work is in existing files:

```
src/
├── game/
│   ├── engine.ts        # Add LOAD_LEVEL action, move blackout init logic here
│   ├── types.ts         # Add customerName?: string to Level, add rushTime?: number alias
│   └── levels.ts        # Validate/update level definitions (customerName, rushTime fields)
├── components/
│   ├── LevelHintOverlay.tsx         # NEW: pre-level hint gate overlay
│   ├── LevelHintOverlay.module.css  # NEW: overlay styles
│   ├── CustomerPanel.tsx            # Update: show customerName field
│   ├── HUD/HUD.tsx                  # Update: urgency threshold 30s → 10s
│   └── GameScreen.tsx               # Wire LevelHintOverlay, remove blackout useEffect
```

### Pattern 1: Pre-Level Hint Overlay Gate

**What:** A full-screen overlay shown at level load that renders `level.hint` and blocks interaction until dismissed. Sits above `GameScreen` content (z-index > shelf, < HUD z-index or same level but covers gameplay area).

**When to use:** Every time a level initializes — on RESTART, NEXT_LEVEL, and initial load.

**Key decision:** The overlay is a `useState` boolean in `GameScreen`. It resets to `true` any time `state.levelIndex` changes (i.e. `state.level.id` changes).

**Example:**
```typescript
// In GameScreen.tsx
const [showHintOverlay, setShowHintOverlay] = useState(true);

// Reset on level change
useEffect(() => {
  setShowHintOverlay(true);
}, [state.level.id]);

// In JSX, before the shelf renders:
{showHintOverlay && (
  <LevelHintOverlay
    hint={state.level.hint ?? ''}
    mode={state.level.mode}
    onDismiss={() => setShowHintOverlay(false)}
  />
)}
```

**LevelHintOverlay component structure:**
```tsx
// LevelHintOverlay.tsx
interface Props {
  hint: string;
  mode: LevelMode;
  onDismiss: () => void;
}

// Full-screen semi-transparent backdrop + centered card
// "Inizia" button calls onDismiss
// onClick on backdrop also calls onDismiss
// Mode icon + hint text — no explanatory copy
```

**CSS:** Dark semi-transparent overlay (`rgba(0,0,0,0.75)`), centered card with amber border matching HUD aesthetic. `z-index: 200` (above shelf z-index 5–8, above drag ghost z-index 1000 NOT needed — overlay blocks input before drag starts).

### Pattern 2: Blackout Trigger — Engine vs. useEffect

**What goes wrong today:** `GameScreen.tsx` lines 192-201 run a `setTimeout` inside `useEffect` that dispatches `BLACKOUT_TRIGGER` after 3000ms. This can flicker because:
- If the component re-renders between the setTimeout being set and firing, the effect may re-run (re-registering the timeout) depending on the dependency array
- The dep array is `[state.level.id, state.status]` — if status briefly changes and snaps back, a duplicate timer fires

**Correct approach (engine-level):** The engine state should track a `blackoutCountdown` initialized from the level definition, decremented via `TICK` or similar, and flipping `labelsVisible` when it reaches zero. Alternatively, a simpler approach: initialize `labelsVisible` to `false` in `createGameState` when `mode === 'blackout'`, but schedule the initial 3-second "preview" period differently.

**Recommended implementation** (engine-driven countdown approach):
```typescript
// In types.ts — add to GameState:
blackoutSecondsLeft: number;  // countdown before labels hide; 0 = already hidden or not blackout

// In engine.ts — createGameState():
labelsVisible: level.mode === 'blackout' ? true : true,  // always start visible
blackoutSecondsLeft: level.mode === 'blackout' ? 3 : 0,

// Add new action:
| { type: 'BLACKOUT_TICK' }  // decrement blackoutSecondsLeft

// In reducer case BLACKOUT_TICK:
case 'BLACKOUT_TICK': {
  if (state.blackoutSecondsLeft <= 0) return state;
  const newCount = state.blackoutSecondsLeft - 1;
  return {
    ...state,
    blackoutSecondsLeft: newCount,
    labelsVisible: newCount > 0,
  };
}
```

Then in `GameScreen.tsx` — replace the existing blackout useEffect:
```typescript
// REPLACE the current blackout useEffect with:
useEffect(() => {
  if (state.level.mode === 'blackout' && state.blackoutSecondsLeft > 0 && state.status === 'playing') {
    const timer = setInterval(() => dispatch({ type: 'BLACKOUT_TICK' }), 1000);
    return () => clearInterval(timer);
  }
}, [state.level.mode, state.blackoutSecondsLeft, state.status]);
```

**Why this is "engine logic not useEffect":** The state transition `labelsVisible = false` is now computed inside the reducer from `blackoutSecondsLeft`, not from a fire-and-forget setTimeout in a React effect. The reducer is pure and deterministic. The useEffect only manages the clock tick (unavoidable for any time-based feature in React), but the hide logic itself is in the engine.

### Pattern 3: Customer Name in Level Definition

**What:** Add `customerName?: string` to the `Level` interface. Add `rushTime?: number` as the canonical field name (the CONTEXT uses `rushTime`, but the existing code uses `timeLimit`).

**Resolution for `timeLimit` vs `rushTime`:** The type `Level` currently has `timeLimit?: number`. Two levels of code use this: `engine.ts createGameState()` (`rushTimeLeft: level.timeLimit ?? 0`) and `GameScreen.tsx` (`rushTimeLeft > 0` check). The CONTEXT says "each level defines its own `rushTime` field." The cleanest approach: rename `timeLimit` to `rushTime` in the type and all 3 usages, since `timeLimit` was always only used for rush mode. This is a find-replace across 4 files.

**CustomerName field — customer pool (Claude's discretion):**
Use Italian male/female names: Marco, Sofia, Luca, Elena, Giovanni, Chiara, Antonio, Valentina. Each customer-mode level gets one name matched to the existing level flavor.

**Updated Level type:**
```typescript
// In types.ts:
export interface Level {
  // ... existing fields ...
  rushTime?: number;      // replaces timeLimit (rush mode countdown in seconds)
  customerName?: string;  // "Marco", "Sofia", etc. for customer mode display
}
```

**Updated CustomerPanel:**
```tsx
// CustomerPanel props add: customerName?: string
// Display: "{customerName} vuole: {genre} degli {eraLabel}"
// Fallback if no name: "Il cliente vuole: ..."
```

### Anti-Patterns to Avoid

- **Do not add a new LOAD_LEVEL action just for reset:** `RESTART` and `NEXT_LEVEL` both call `createGameState()`, which already resets all customer/rush/blackout state. Adding `LOAD_LEVEL` is unnecessary complexity.
- **Do not auto-dismiss the hint overlay:** The CONTEXT requires deliberate player action. No `setTimeout` dismiss.
- **Do not change the star formula for rush time-up:** The engine already calls `status: 'completed'` when rush expires. The star calculation happens inside `PLACE_VINYL` on completion check — when rush expires mid-level, `RUSH_TICK` sets `status: 'completed'` with whatever `stars` value was last set. Since `stars` is only computed on `PLACE_VINYL` completion, a rush expiry will leave `stars` at whatever it was set to during init (`stars: 0` in initial state, set to minimum `1` for any completion). The current `stars: 1` in RUSH_TICK case is appropriate for a time-expiry scenario.
- **Do not flicker labels using CSS transition on re-render:** The `labelsHidden` CSS class uses `opacity: 0; transition: opacity 0.8s ease` — this is correct and smooth. The flicker issue is from duplicate useEffect timers, not the CSS.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Timer countdown display | Custom tick formatter | Existing `formatTime()` in HUD.tsx | Already formats `M:SS` correctly |
| Overlay backdrop click dismiss | Custom event propagation logic | `onClick` on outer div + `stopPropagation` on card | Standard React pattern |
| Level mode label display | New lookup table | Existing `getLevelRuleDisplay()` in HUD.tsx | Already maps all 7 modes to icon + label |
| Rush urgency color | New theme/styled-component variant | Existing `TimerValue` styled component with `$lowTime` prop | Already handles color + pulse — just adjust threshold |

**Key insight:** The existing HUD, CustomerPanel, ShelfSlot, and engine already have hooks for every feature. Phase 4 is mostly wiring and minor additions, not new systems.

---

## Common Pitfalls

### Pitfall 1: Hint Overlay Blocking Drag Ghost

**What goes wrong:** The `LevelHintOverlay` at high z-index intercepts pointer events. The drag ghost uses `position: fixed; z-index: 1000; pointer-events: none`. If the overlay is at z-index > 1000 without `pointer-events: none` on the ghost container, visual layering gets confused.

**Why it happens:** The overlay needs z-index above the shelf (z-index 5-8), above the HUD (z-index 100), but the drag ghost is z-index 1000. Since the overlay is shown BEFORE the player can drag, the overlay being at z-index 200 is sufficient — it's dismissed before any drag can start.

**How to avoid:** Set overlay z-index to 200. It only exists before the level starts, so it never competes with the drag ghost.

### Pitfall 2: Hint Overlay Not Resetting on Restart

**What goes wrong:** Player restarts mid-level — overlay should re-appear (per CONTEXT: "shown every time a level loads"). If `showHintOverlay` is only reset on `state.level.id` change, a RESTART (which keeps the same level) won't trigger it.

**How to avoid:** Use `state.level.id + '-' + restartCount` as the key, or reset `showHintOverlay` in both `handleRestart` and the `state.level.id` useEffect. Simplest: add `setShowHintOverlay(true)` directly in the `handleRestart` callback.

**Warning signs:** Overlay shows on first level load but not on RESTART — test RESTART flow specifically.

### Pitfall 3: Blackout TICK Firing After Level Complete

**What goes wrong:** `BLACKOUT_TICK` interval continues firing after the level is marked `completed`, causing state updates on a "done" game.

**How to avoid:** The `BLACKOUT_TICK` reducer case should check `if (state.status !== 'playing') return state`. The useEffect dependency on `state.status` will also stop the interval when status becomes 'completed' (same pattern as RUSH_TICK and CUSTOMER_TICK).

**Warning signs:** Console React warnings about state updates after unmount, or blackout triggering on the LevelComplete screen.

### Pitfall 4: CustomerName Defaulting to Empty String

**What goes wrong:** Existing levels have no `customerName` field. If `CustomerPanel` renders `"{name} vuole:"` and name is `undefined`, the output is `"undefined vuole:"`.

**How to avoid:** Add a null-coalescing fallback: `{customerName ?? 'Il cliente'} vuole:`. All new customer mode levels get names; existing levels without names fall back gracefully.

### Pitfall 5: Rush Urgency at 10s vs 30s

**What goes wrong:** The current HUD.tsx line 193 defines `const isLowTime = timeRemaining !== undefined && timeRemaining < 30;`. The CONTEXT says urgency starts at 10 seconds. If unchanged, the urgency animation fires at 30 seconds — too early and distracting.

**How to avoid:** Change `< 30` to `<= 10` in HUD.tsx. Simple one-line fix.

**Warning signs:** Red pulsing timer at 29 seconds on a 90-second rush level is obviously too early.

### Pitfall 6: `timeLimit` vs `rushTime` Migration

**What goes wrong:** If `timeLimit` is renamed to `rushTime` in the Level type but not updated in `engine.ts createGameState()` or `GameScreen.tsx`, TypeScript will catch compile-time errors. However, existing levels (8, 14, 17) define `timeLimit` — these need updating too.

**How to avoid:** Search for all occurrences of `timeLimit` across `src/` before renaming. Files affected: `types.ts`, `engine.ts`, `GameScreen.tsx`, `levels.ts` (levels 5, 8, 13, 14, 17 use `timeLimit`).

**Warning signs:** `rushTimeLeft: level.rushTime ?? 0` evaluating to 0 on rush levels because `timeLimit` is still defined but `rushTime` is not.

---

## Code Examples

Verified patterns from existing codebase:

### Rush Urgency Threshold Fix (HUD.tsx)
```typescript
// Current (HUD.tsx line 193):
const isLowTime = timeRemaining !== undefined && timeRemaining < 30;

// Corrected to match CONTEXT decision (10 seconds):
const isLowTime = timeRemaining !== undefined && timeRemaining <= 10;
```

### LevelHintOverlay Integration (GameScreen.tsx)
```typescript
// State declaration:
const [showHintOverlay, setShowHintOverlay] = useState(true);

// Reset on level change (covers NEXT_LEVEL):
useEffect(() => {
  setShowHintOverlay(true);
}, [state.level.id]);

// Reset on restart (same level.id, so useEffect won't fire):
const handleRestart = useCallback(() => {
  setTimeElapsed(0);
  setShowHintOverlay(true);  // ADD THIS LINE
  dispatch({ type: 'RESTART' });
}, []);

// Render (before <Shelf>, after <HUD>):
{showHintOverlay && state.status === 'playing' && (
  <LevelHintOverlay
    hint={state.level.hint ?? ''}
    mode={state.level.mode}
    onDismiss={() => setShowHintOverlay(false)}
  />
)}
```

### Blackout Tick in Engine (engine.ts)
```typescript
// Add to GameAction union type:
| { type: 'BLACKOUT_TICK' }

// Add to GameState:
blackoutSecondsLeft: number;

// In createGameState():
blackoutSecondsLeft: level.mode === 'blackout' ? 3 : 0,

// New reducer case:
case 'BLACKOUT_TICK': {
  if (state.status !== 'playing' || state.blackoutSecondsLeft <= 0) return state;
  const newCount = state.blackoutSecondsLeft - 1;
  return {
    ...state,
    blackoutSecondsLeft: newCount,
    labelsVisible: newCount > 0,
  };
}
```

### Customer Mode Panel Update (CustomerPanel.tsx)
```tsx
// Updated props interface:
interface Props {
  customerName?: string;  // NEW — e.g. "Marco"
  genre: string;
  era: string;
  served: boolean;
  timeLeft?: number;
  left?: boolean;
}

// Updated speech render:
<span className={styles.speech}>
  "{customerName ?? 'Il cliente'} vuole: <strong>{genre}</strong> degli {eraLabel}"
</span>
```

### Rush Time Expiry — Current Behavior (engine.ts, confirmed correct)
```typescript
case 'RUSH_TICK': {
  if (state.status !== 'playing') return state;
  const newRush = state.rushTimeLeft - 1;
  if (newRush <= 0) {
    // Time's up — completes with current score, star stays at whatever was earned
    return { ...state, rushTimeLeft: 0, status: 'completed', stars: 1 };
  }
  return { ...state, rushTimeLeft: newRush };
}
// NOTE: stars: 1 is appropriate for time-expiry (player didn't complete all vinyls)
// This flows directly into LevelComplete via state.status === 'completed' — correct per CONTEXT
```

### Level Type Updates (types.ts)
```typescript
export interface Level {
  id: string;
  rows: number;
  cols: number;
  vinyls: Vinyl[];
  sortRule: SortRule;
  mode: LevelMode;
  rushTime?: number;        // RENAMED from timeLimit (rush mode countdown seconds)
  parTime?: number;
  hint?: string;
  theme?: LevelTheme;
  customerRequest?: CustomerRequest;
  customerName?: string;    // NEW — Italian name for customer mode panel
  blockedSlots?: { row: number; col: number }[];
  customerTimer?: number;
  sleeveTargets?: { row: number; col: number; vinylId: string }[];
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded SLOT_TARGETS for hint glow | getTargetSlot() returns null | Phase 1 FIX-03 | Hint glow disabled by design |
| Zustand gameStore (dormant) | useReducer in GameScreen | Phase 1 FIX-04 | engine.ts is single source of truth |
| parTime optional (legacy compatibility) | parTime on all levels | Phase 2 | Star formula works correctly |
| timeElapsed as local state | timeElapsed separate from gameState | Phase 1 | Separate for correct reset semantics |

**Current state relevant to Phase 4:**
- `blackoutSecondsLeft`: does NOT exist yet — must be added to GameState and engine
- `customerName`: does NOT exist in Level type yet — must be added
- `rushTime`: field is currently called `timeLimit` in Level type — must be renamed
- `LevelHintOverlay`: does NOT exist — must be created from scratch
- Pre-level hint gate: `showHintOverlay` state does NOT exist in GameScreen — must be added

---

## Level Audit: Current 21 Levels

Direct inspection of `src/game/levels.ts` confirms:

| Level | Mode | sortRule | Vinyls | rushTime/timeLimit |
|-------|------|----------|--------|--------------------|
| 1 | free | free | 6 | — |
| 2 | genre | genre | 8 | — |
| 3 | chronological | chronological | 8 | — |
| 4 | customer | free | 8 | — |
| 5 | blackout | chronological | 8 | timeLimit: 90 |
| 6 | genre | genre | 6 | — |
| 7 | customer | free | 8 | customerTimer: 30 |
| 8 | rush | chronological | 10 | timeLimit: 60 |
| 9 | sleeve-match | free | 6 | — |
| 10 | genre | genre | 10 | — |
| 11 | chronological | chronological | 8 | — |
| 12 | customer | chronological | 8 | customerTimer: 35 |
| 13 | blackout | genre | 8 | timeLimit: 120 |
| 14 | rush | genre | 8 | timeLimit: 45 |
| 15 | sleeve-match | free | 9 | — |
| 16 | customer | free | 8 | customerTimer: 20 |
| 17 | rush | chronological | 12 | timeLimit: 75 |
| 18 | sleeve-match | free | 8 | — |
| 19 | genre | genre | 8 | — |
| 20 | customer | genre | 8 | customerTimer: 40 |
| 21 | sleeve-match | free | 10 | — |

**Mode coverage confirmed:**
- free: level 1
- genre: levels 2, 6, 10, 19, 20 (sortRule genre in customer/genre combos)
- chronological: levels 3, 8, 11, 12, 17
- customer: levels 4, 7, 12, 16, 20
- blackout: levels 5, 13
- rush: levels 8, 14, 17
- sleeve-match: levels 9, 15, 18, 21

**Difficulty curve observation:** Level 5 is blackout mode — early per the CONTEXT decision which says "levels 11+ gradually add blackout." Level 5 blackout is a known deviation. The planner should decide: reorder (levels 5 becomes something simpler, blackout moves to level 11+) OR accept current ordering as sufficient for playability.

**Vinyl count ramp:** Level 1 starts at 6 vinyls (CONTEXT says 4). Levels 8, 10, 17, 21 reach 10-12 vinyls. The ramp is reasonable but level 1 is slightly above the target of 4.

**Customer levels all lack `customerName`:** All 5 customer levels (4, 7, 12, 16, 20) have `customerRequest` but no `customerName`. These need names added when the field is introduced.

**Rush levels use `timeLimit` not `rushTime`:** Levels 5, 8, 13, 14, 17 use `timeLimit`. Note level 5 (blackout) also uses `timeLimit: 90` — this is a blackout level timeout, not a rush countdown. The rename to `rushTime` should only apply when `mode === 'rush'`. Level 5's `timeLimit: 90` may be an artifact or for a future "blackout time limit" feature — the planner should decide whether to keep it, remove it, or leave it unused.

---

## Open Questions

1. **Level 5 blackout position**
   - What we know: Level 5 is blackout mode; CONTEXT says blackout appears at levels 11+
   - What's unclear: Whether to reorder levels 5 and 11-13 or accept the current position
   - Recommendation: Keep level 5 as blackout for now — reordering 21 levels risks breaking save progress (level IDs are stable, but indices shift). The CONTEXT says mode ordering guidance is aspirational; the actual levels.ts already diverges. Document as acceptable variance.

2. **Level 1 vinyl count (6 vs 4)**
   - What we know: Level 1 has 6 vinyls; CONTEXT decision says "start at 4 vinyls"
   - What's unclear: Whether this requires changing level 1 or just accepting 6 as close enough
   - Recommendation: The planner should reduce level 1 to 4 vinyls in the level definition, removing 2 vinyls. This is a content edit, not a code change.

3. **`timeLimit` on blackout level 5 (and 13)**
   - What we know: Levels 5 and 13 (both blackout) define `timeLimit: 90` and `timeLimit: 120` respectively. These aren't used by the rush timer but sit in the type.
   - What's unclear: Are these blackout time limits (fail if not done in time) or unused artifacts?
   - Recommendation: Remove `timeLimit` from blackout levels when renaming to `rushTime`. If a blackout time limit is wanted, it can be added back as a separate concern.

4. **Star formula for rush time-expiry**
   - What we know: RUSH_TICK sets `stars: 1` when time expires. CONTEXT says "auto-complete with whatever score was accumulated."
   - What's unclear: Should "whatever score was accumulated" affect the star count (e.g. partial completion giving 2 stars if fast enough)?
   - Recommendation: Keep `stars: 1` for time-expiry (player didn't complete — 1 star is correct). The score itself accumulates as vinyls are placed. 1 star on time-expiry is a fair consequence.

---

## Sources

### Primary (HIGH confidence)
- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/game/levels.ts` — level count, mode coverage, vinyl counts, field names
- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/game/engine.ts` — RUSH_TICK, BLACKOUT_TRIGGER, createGameState, GameAction types
- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/game/types.ts` — Level interface, GameState, LevelMode
- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/components/GameScreen.tsx` — blackout useEffect (lines 192-201), rush timer useEffect (219-229), HUD wiring
- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/components/HUD/HUD.tsx` — isLowTime threshold (line 193), TimerValue component, getLevelRuleDisplay
- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/components/CustomerPanel.tsx` — current display format, missing customerName
- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/components/ShelfSlot.tsx` — labelsHidden CSS class usage
- Direct inspection of `/Users/martha2022/Documents/Sleevo/.planning/phases/04-level-content-and-mode-validation/04-CONTEXT.md`
- Direct inspection of `/Users/martha2022/Documents/Sleevo/.planning/REQUIREMENTS.md`
- Direct inspection of `/Users/martha2022/Documents/Sleevo/.planning/STATE.md`

### Secondary (MEDIUM confidence)
- None needed — all claims verified from source code

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Level content audit: HIGH — direct file inspection of all 21 levels
- Mode behavior gaps: HIGH — exact line numbers identified in source
- Architecture patterns: HIGH — patterns follow established project conventions
- Implementation approach: HIGH — based on existing engine.ts patterns (RUSH_TICK, CUSTOMER_TICK precedents)

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (stable codebase; no fast-moving dependencies)
