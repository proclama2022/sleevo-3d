# Phase 1: Foundation Fixes - Research

**Researched:** 2026-02-20
**Domain:** React useReducer state management, localStorage persistence, component wiring, Zustand cleanup
**Confidence:** HIGH — this is entirely an internal codebase investigation; no external library research required.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Score Feedback Visivo (COMM-01)**
- Il feedback "+N" appare vicino al punteggio nell'HUD (non vicino allo slot, non al centro)
- Mostra solo il numero in assenza di combo ("+10"); aggiunge il combo label solo quando scatta NICE!/GREAT!/AMAZING!/LEGENDARY! (es. "+35 GREAT!")
- Animazione e colori: Claude's discretion

**Contatore Progresso (COMM-02)**
- Formato: "5 / 8" (solo numeri, senza testo aggiuntivo)
- Posizione nell'HUD: Claude's discretion (integrare dove ha più senso con il layout esistente)

**Regola del Livello (COMM-03)**
- Stile: icona + testo breve (es. icona musicale + "Genere", icona clock + "Anno")
- Modalità free: Claude's discretion (nascondere o mostrare testo neutro)

### Claude's Discretion
- Animazione score feedback (sale verso l'alto o pop in/fade)
- Colore del testo score feedback
- Posizione esatta contatore nell'HUD
- Comportamento regola in modalità free
- Approccio al quarantining/rimozione Zustand gameStore

### Deferred Ideas (OUT OF SCOPE)
Nessuna — la discussione è rimasta entro lo scope della fase.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FIX-01 | La soglia di sblocco livello successivo è >= 2 stelle (attualmente hardcoded >= 1) | `isLevelUnlocked()` in `storage.ts` line 49: `progress.stars >= 1` — change to `>= 2` |
| FIX-02 | La chiave di storage usa l'ID livello (non l'indice numerico) | `isLevelUnlocked()` in `storage.ts` line 47: uses `level-${levelIndex}` (numeric index) instead of a proper level ID lookup — needs the levels array to resolve ID from index |
| FIX-03 | `SLOT_TARGETS` / `getTargetSlot()` supporta vinili arbitrari | `rules.ts` lines 3-12: hardcoded map for v1-v8 only; hint system path is entirely dead (no SHOW_HINT button exists in UI); safe to stub `getTargetSlot` to always return `null` |
| FIX-04 | Il Zustand store dormante è rimosso o isolato | `gameStore.ts` + `store/index.ts` + `ui/GameProvider.tsx` + `hooks/useGame.ts` + `services/gameBridge.ts` — confirmed dead: none consumed by `App.tsx` or `GameScreen.tsx` |
| COMM-01 | Feedback visivo punti dopo ogni piazzamento corretto | `ScorePopup` component exists but is never rendered in `GameScreen.tsx`; needs wiring to `PLACE_VINYL` dispatch event |
| COMM-02 | HUD mostra contatore "5 / 8" | `HUD` component receives `progress` (0-100%) but not raw counts; needs `placed` and `total` props |
| COMM-03 | HUD mostra regola del livello corrente in modo persistente | No such element exists currently; needs new display in HUD using `state.level.sortRule` and `state.level.mode` |
</phase_requirements>

---

## Summary

Phase 1 is entirely a **wiring and bug-fix phase** within the existing codebase. No new libraries are required and no new architecture is introduced. The canonical state system (`useReducer` + `gameReducer` in `GameScreen.tsx`) is already fully operational. The dormant Zustand `gameStore.ts` is never imported by `App.tsx` or `GameScreen.tsx` — it lives in a parallel file tree (`src/store/`, `src/ui/GameProvider.tsx`, `src/hooks/useGame.ts`, `src/services/gameBridge.ts`) that has no path to the rendered game at all.

The four FIX items are precise one-line or two-line changes in known files. The three COMM items involve connecting an existing but unrendered component (`ScorePopup`) and adding two new HUD sub-elements that follow the project's existing styled-components + CSS Modules pattern.

The key insight from the codebase audit: **ScorePopup already works** — it has its animation (`animations.scoreFloat`), its `onComplete` callback, and its fixed positioning. The only missing piece is a `useState` array of popup instances in `GameScreen.tsx` and a single dispatch listener in `handlePointerUp` that creates a new popup entry after a valid `PLACE_VINYL`. Additionally, `isLevelUnlocked` is defined in `storage.ts` but is never called anywhere in the codebase — it exists purely as a utility function waiting to be connected.

**Primary recommendation:** Implement all seven requirements in order: FIX-01 through FIX-04 first (pure logic changes, no visual risk), then COMM-01, COMM-02, COMM-03 (incremental HUD additions).

---

## Standard Stack

### Core (already installed — no new dependencies needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.2.4 | UI rendering | Already in use |
| styled-components | ^6.3.9 | HUD and ScorePopup styling | Already used by HUD and ScorePopup |
| CSS Modules | (Vite built-in) | Component-scoped styles | Already used by ComboFloat, InstructionPill, etc. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand | (installed as dep of react-three) | Dormant store — NOT to be used for game state | Only relevant for FIX-04 removal/quarantine |

**Installation:** No new packages needed.

---

## Architecture Patterns

### Existing Canonical Pattern: useReducer in GameScreen

The live game state lives in `GameScreen.tsx`:

```typescript
// src/components/GameScreen.tsx — this is the canonical state authority
const [state, dispatch] = useReducer(gameReducer, null, () =>
  createGameState(LEVELS[0], 0)
);
```

All game actions go through `dispatch`. The `PLACE_VINYL` action in `gameReducer` returns the new score (`state.score + earnedScore`). The `earnedScore` value is already calculated there.

### Pattern 1: ScorePopup Wiring (COMM-01)

**What:** Add a `useState<Array<{id, points, label, x, y}>>` to `GameScreen`, populate it after a valid drop, render the array as `<ScorePopup>` elements, and remove each entry on `onComplete`.

**When to use:** After `PLACE_VINYL` dispatches successfully. The earned score is known at dispatch time.

The tricky part: the score earned per placement is calculated **inside** `gameReducer` and not returned to the caller. Two approaches:

**Approach A — Calculate outside before dispatch (recommended):**
Read `state.combo` and `state.level.vinyls` in `handlePointerUp` before dispatching, apply the same `Math.round(BASE_SCORE * tier.multiplier)` formula, and use that to populate the popup. This is a read-only calculation — not a duplicate of state, just a derived display value.

**Approach B — Add `lastEarnedScore` to GameState:**
Add a field to `GameState` and populate it in the reducer on `PLACE_VINYL`. A `useEffect` watching `state.lastEarnedScore` triggers the popup. This is cleaner architecture but requires touching `types.ts`, `engine.ts`, and `createGameState`.

Approach A is faster and lower risk. Approach B is more correct architecturally. Claude's discretion — both are valid.

**Score popup position:** Near the HUD score area (locked decision). The HUD `LeftSection` (top-left) shows the score. ScorePopup uses `position: fixed` with `$x` and `$y` props. Recommended: attach a `useRef` to the `AnimatedScore` element in HUD and capture its `getBoundingClientRect()` to position the popup dynamically. The `ComboPopup` already does this via `lastSlotPosition`. Fallback: hardcode approximately `{ x: 60, y: 70 }`.

**Combo label in popup:** Show `+35 GREAT!` only when `state.combo.label` is non-empty at drop time. The combo label values are: `''`, `'NICE!'`, `'GREAT!'`, `'AMAZING!'`, `'LEGENDARY!'` (from `COMBO_TIERS` in `rules.ts`).

**Example pattern:**
```typescript
// In GameScreen.tsx — popup state
const [scorePopups, setScorePopups] = useState<Array<{
  id: number;
  points: number;
  label: string;
  x: number;
  y: number;
}>>([]);
const popupIdRef = useRef(0);

// In handlePointerUp, after valid drop (before dispatch):
const timeSinceLast = Date.now() - state.combo.lastPlacementTime;
const comboReset = state.combo.lastPlacementTime > 0 && timeSinceLast > COMBO_DECAY_MS;
const newStreak = comboReset ? 1 : state.combo.streak + 1;
const tier = getComboTier(newStreak);
const earned = Math.round(100 * tier.multiplier);
setScorePopups(prev => [...prev, {
  id: popupIdRef.current++,
  points: earned,
  label: tier.label,
  x: HUD_SCORE_X,  // from getBoundingClientRect() or hardcoded fallback
  y: HUD_SCORE_Y,
}]);

// In JSX:
{scorePopups.map(p => (
  <ScorePopup
    key={p.id}
    points={p.points}
    label={p.label}
    x={p.x}
    y={p.y}
    onComplete={() => setScorePopups(prev => prev.filter(sp => sp.id !== p.id))}
  />
))}
```

Note: `ScorePopup` currently only accepts `points`, `x`, `y`, `onComplete`. It does not have a `label` prop. To show `"+35 GREAT!"` we need to extend `ScorePopupProps` with `label?: string`.

### Pattern 2: HUD Progress Counter (COMM-02)

**What:** Add `placed` and `total` number props to `HUD` component. Display as `"5 / 8"` in the `RightSection`.

**Current HUD props:**
```typescript
interface HUDProps {
  score: number;
  timeRemaining?: number;
  moves: number;
  progress: number; // 0-100 — kept for ProgressBar gauge
}
```

Add `placed: number` and `total: number` props. In `GameScreen`, pass:
```typescript
placed={Object.keys(state.placedVinyls).length}
total={state.level.vinyls.length}
```

The format `"5 / 8"` is just a `StatValue` styled component with content `${placed} / ${total}`. No animation needed.

**Position decision:** The existing `RightSection` already has `timeRemaining` (conditional) and `moves`. Adding a `placed / total` `StatItem` there is the most natural fit. The `CenterSection` hosts the circular `ProgressBar` gauge — that stays as-is.

### Pattern 3: Level Rule Display (COMM-03)

**What:** A persistent pill/badge in or near the HUD showing the active sort rule. Maps `level.sortRule` and `level.mode` to an icon + short label.

**Mapping table to implement:**
```
mode 'customer'          → 👤 Cliente
mode 'blackout'          → 👁 Memoria
mode 'rush'              → ⏱ Rush
mode 'sleeve-match'      → 🖼 Abbina
sortRule 'genre'         → 🎵 Genere
sortRule 'chronological' → 📅 Anno
sortRule 'free'          → hide (Claude's discretion)
```

Note: `level.mode` takes precedence over `level.sortRule` for display (e.g., `mode: 'blackout'` with `sortRule: 'chronological'` shows "Memoria" not "Anno").

**Implementation options:**
1. Add `sortRule` and `levelMode` props to `HUD` and render a styled badge inside the existing grid layout.
2. Create a standalone `LevelRuleBadge` component placed below the HUD.

Option 1 keeps everything in the existing HUD grid layout. Option 2 is more isolated. The rule never changes mid-level, so no animation needed.

### Pattern 4: FIX-02 — Storage Key Correctness

**Current bug in `storage.ts`:**
```typescript
// Line 47-49 — BUG: uses numeric index arithmetic, not level ID
export function isLevelUnlocked(levelIndex: number): boolean {
  if (levelIndex === 0) return true;
  const prevLevelId = `level-${levelIndex}`; // uses index as suffix, e.g. level-1 for index 1
  const progress = getLevelProgress(prevLevelId);
  return progress !== null && progress.stars >= 1; // BUG: should be >= 2
}
```

The level IDs in `levels.ts` are `'level-1'`, `'level-2'`, etc. The function constructs `level-${levelIndex}` where `levelIndex` is 0-based. So to unlock level at index 1, it checks `level-1` (0-based index 1 → `level-${1}` = `'level-1'`). This works by coincidence for the current `level-N` naming convention but breaks if IDs are ever non-sequential.

**Important:** `isLevelUnlocked` is defined but never imported or called anywhere in the codebase. It is a dead utility function. The fix still matters because Phase 3 (progression/level select) will need it.

**Clean fix:** Combines FIX-01 and FIX-02:
```typescript
export function isLevelUnlocked(levelIndex: number, levels: Level[]): boolean {
  if (levelIndex === 0) return true;
  const prevLevel = levels[levelIndex - 1];
  if (!prevLevel) return false;
  const progress = getLevelProgress(prevLevel.id);
  return progress !== null && progress.stars >= 2; // FIX-01: was >= 1; FIX-02: uses actual ID
}
```

No call sites need updating — the function is currently unused. The new signature is ready for Phase 3.

### Pattern 5: FIX-03 — SLOT_TARGETS Generalization

**Current state:**
```typescript
// rules.ts lines 3-12 — hardcoded for v1-v8 only
export const SLOT_TARGETS: Record<string, string> = {
  '0-0': 'v1', '0-1': 'v2', '0-2': 'v3', '0-3': 'v4',
  '1-0': 'v6', '1-1': 'v7', '1-2': 'v8', '1-3': 'v5',
};
```

**Dead code path confirmed:** `SLOT_TARGETS` → `getTargetSlot()` → `getNextGlowingSlot()` → rendered as `glowingSlot` prop only when `state.hintsRemaining < 3`. Hints start at 3, so this only activates after a hint button is pressed. `Controls.tsx` has NO hint button — `SHOW_HINT` is never dispatched. The entire glow-via-hint path is unreachable in the current UI.

**Fix:** Delete `SLOT_TARGETS` constant and stub `getTargetSlot` to always return `null`. `getNextGlowingSlot` will always return `null`, and the shelf renders no glow. This is identical to existing runtime behavior.

### Pattern 6: FIX-04 — Zustand Store Removal

**Dead code cluster (confirmed):**
- `src/store/gameStore.ts` — Zustand store
- `src/store/index.ts` — re-exports from gameStore
- `src/ui/GameProvider.tsx` — context wrapper using gameStore (never mounted in App.tsx)
- `src/hooks/useGame.ts` — hooks that call useGameStore (never used in GameScreen)
- `src/services/gameBridge.ts` — GameBridge class (never instantiated in App.tsx)

**Verification:** `App.tsx` renders `<ThemeProvider><GameScreen /></ThemeProvider>` — no `GameProvider`, no `useGame` hooks. Grep confirms no other files import from these paths.

**Quarantine approach (safer, Claude's discretion):** Add a `QUARANTINED` comment block at the top of `gameStore.ts`, leave files in place.

**Removal approach (cleaner, recommended):** Delete all five files/directories. No active imports exist. Run TypeScript build after removal to confirm clean.

### Anti-Patterns to Avoid

- **Do NOT position ScorePopup near the dropped slot.** The locked decision says near the HUD score area. `lastSlotPosition` state already exists for `ComboPopup` — ScorePopup must use HUD coordinates, not slot coordinates.
- **Do NOT use a useEffect to watch score change for popup timing.** Score change happens after dispatch, which is asynchronous in React. This introduces a frame delay. Calculate points synchronously in `handlePointerUp` before dispatching.
- **Do NOT touch `saveProgress()` for FIX-01/FIX-02.** `saveProgress` correctly uses `levelId` already. Only `isLevelUnlocked()` is broken.
- **Do NOT import from `src/store/` in any new or modified file.**

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Score float animation | Custom CSS keyframes | `animations.scoreFloat` in `src/animations/keyframes.ts` | Already wired into `ScorePopup.tsx` |
| Pop-in timing | Custom timing values | `TIMING.SCORE_INCREMENT.duration` = 350ms in `src/animations/timing.ts` | Consistent with existing HUD score animation |
| Icon rendering | SVG/icon library | Unicode emoji or CSS text characters | No icon library installed; ComboFloat uses text labels |
| Progress counter animation | Custom counter roll | Simple `${placed} / ${total}` text with `StatValue` styled component | No animation specified in requirements |

**Key insight:** The animation infrastructure already exists. The only missing piece for COMM-01 is rendering the component.

---

## Common Pitfalls

### Pitfall 1: ScorePopup Combo Label Not Shown
**What goes wrong:** `ScorePopup` renders `<PlusSign>+</PlusSign>{points}` — no `label` prop. "+35 GREAT!" cannot be shown without modifying the component.
**Why it happens:** Component was built before the combo label requirement was specified.
**How to avoid:** Extend `ScorePopupProps` with `label?: string`. Render `+{points} {label}` when label is non-empty.
**Warning signs:** "+35" appears without "GREAT!" after a combo placement.

### Pitfall 2: Score Earned Miscalculation for Popup
**What goes wrong:** Popup shows wrong points because combo streak is off by one.
**Why it happens:** `gameReducer` increments the streak on `PLACE_VINYL`. Reading `state.combo.streak` before dispatching gives the pre-placement streak. Must replicate the `comboReset` logic exactly.
**How to avoid:** Calculate `comboReset = state.combo.lastPlacementTime > 0 && (Date.now() - state.combo.lastPlacementTime) > COMBO_DECAY_MS`, then `newStreak = comboReset ? 1 : state.combo.streak + 1`, then `getComboTier(newStreak)`. `COMBO_DECAY_MS` is exported from `rules.ts`.
**Warning signs:** Points shown in popup don't match points added to HUD total score.

### Pitfall 3: Multiple ScorePopups Stacking at Same HUD Position
**What goes wrong:** Rapid drops create multiple popups at identical fixed coordinates, visually colliding.
**Why it happens:** HUD score position is fixed, not slot-based. All popups land at the same point.
**How to avoid:** Stagger vertical position by `id * 4px`, or limit to one active popup at a time by clearing the previous immediately.
**Warning signs:** Visual clutter near HUD score area on fast consecutive placements.

### Pitfall 4: TypeScript Build Failure After Zustand Deletion
**What goes wrong:** Deleting the store files causes TypeScript errors if any file (including test files) imports from them.
**Why it happens:** `src/types/game.ts` (a different file from `src/game/types.ts`) references Zustand-specific types like `GamePhase`, `ShelfSlot`. These exist only in the Zustand type system.
**How to avoid:** Check `src/types/game.ts` before deleting — it imports `GamePhase` etc. that only exist in the Zustand type world. The Zustand `GameState` is a different interface from the `useReducer` `GameState` in `src/game/types.ts`. If deleting, also delete or update `src/types/game.ts` and `src/types/index.ts`.
**Warning signs:** TypeScript errors on `GamePhase`, `ShelfSlot`, `GameActions`, `GameStore` types after deletion.

### Pitfall 5: isLevelUnlocked Called Nowhere — Fix Still Needed
**What goes wrong:** Developer skips FIX-01/FIX-02 because `isLevelUnlocked` appears unused.
**Why it happens:** The function is dead today but Phase 3 will connect the level select screen to it.
**How to avoid:** Fix it now so Phase 3 inherits correct behavior from day one. The fix is one function body change.

---

## Code Examples

### ScorePopup Extension (add label prop)
```typescript
// src/components/ScorePopup/ScorePopup.tsx — extend props
export interface ScorePopupProps {
  points: number;
  label?: string;   // e.g. 'GREAT!' — only shown when non-empty
  x: number;
  y: number;
  onComplete?: () => void;
}

// In component body, update PointsText render:
<PointsText $isAnimating={isAnimating} aria-live="polite">
  <PlusSign>+</PlusSign>
  {points}
  {label && <span style={{ marginLeft: 4, fontSize: '0.8em' }}>{label}</span>}
</PointsText>
```

### HUD Props Extension (COMM-02 + COMM-03)
```typescript
// src/components/HUD/HUD.tsx — extend HUDProps
export interface HUDProps {
  score: number;
  timeRemaining?: number;
  moves: number;
  progress: number;
  placed: number;        // new — for "5 / 8" display
  total: number;         // new
  sortRule?: string;     // new — for level rule display
  levelMode?: string;    // new — level mode takes precedence for display
}
```

### isLevelUnlocked Fix (FIX-01 + FIX-02 combined)
```typescript
// src/game/storage.ts — add Level import, update function
import type { Level } from './types';

export function isLevelUnlocked(levelIndex: number, levels: Level[]): boolean {
  if (levelIndex === 0) return true;
  const prevLevel = levels[levelIndex - 1];
  if (!prevLevel) return false;
  const progress = getLevelProgress(prevLevel.id);
  return progress !== null && progress.stars >= 2; // FIX-01: was >= 1; FIX-02: uses .id
}
```

### SLOT_TARGETS Removal (FIX-03)
```typescript
// src/game/rules.ts — remove SLOT_TARGETS constant (lines 3-12)
// Stub getTargetSlot to always return null:
export function getTargetSlot(_vinylId: string): { row: number; col: number } | null {
  return null; // FIX-03: SLOT_TARGETS removed; hint glow disabled for all levels
}
// getSlotKey can remain (used elsewhere for slot keying)
```

### Level Rule Label Mapping (COMM-03)
```typescript
// Can be inlined in HUD.tsx or extracted to a utils helper
function getLevelRuleDisplay(sortRule: string, mode: string): { icon: string; label: string } | null {
  if (mode === 'customer')          return { icon: '👤', label: 'Cliente' };
  if (mode === 'blackout')          return { icon: '👁', label: 'Memoria' };
  if (mode === 'rush')              return { icon: '⏱', label: 'Rush' };
  if (mode === 'sleeve-match')      return { icon: '🖼', label: 'Abbina' };
  if (sortRule === 'genre')         return { icon: '🎵', label: 'Genere' };
  if (sortRule === 'chronological') return { icon: '📅', label: 'Anno' };
  return null; // free mode — hide the rule badge
}
```

### Zustand Deletion Checklist
Files to delete for FIX-04:
```
src/store/gameStore.ts
src/store/index.ts
src/ui/GameProvider.tsx
src/hooks/useGame.ts
src/services/gameBridge.ts
src/types/game.ts        ← contains Zustand-only types (GamePhase, ShelfSlot, GameActions, GameStore)
src/types/index.ts       ← re-exports from types/game.ts
```

Note: `src/game/types.ts` (the useReducer GameState) is NOT deleted — it is the canonical type file.

---

## State of the Art

| Old Approach | Current Approach | Status | Impact |
|--------------|------------------|--------|--------|
| Zustand gameStore | useReducer in GameScreen | Zustand dead — never called | FIX-04: delete dead cluster |
| `stars >= 1` unlock | `stars >= 2` unlock | Bug — function defined but unused | FIX-01: fix now for Phase 3 |
| `level-${index}` as storage key | `levels[index-1].id` | Bug — works by coincidence today | FIX-02: make robust now |
| v1-v8 hardcoded SLOT_TARGETS | Always-null stub | Glow path is dead (no hint button) | FIX-03: remove constant |
| ScorePopup built but unwired | Wire to PLACE_VINYL | Component fully ready | COMM-01: wiring job only |
| HUD shows `moves` and `timeRemaining` | Add `placed / total` | HUD props need extension | COMM-02: prop + render |
| No level rule display | New HUD badge element | No component exists | COMM-03: new element |

---

## Open Questions

1. **ScorePopup positioning: how to get HUD score element coordinates reliably?**
   - What we know: `ScorePopup` uses `position: fixed`. HUD score is in `LeftSection` at top-left. The HUD grid padding is `theme.spacing.md` / `theme.spacing.lg`. Screen size varies (mobile vs desktop).
   - Recommendation: Add a `ref` forwarding mechanism from `HUD` to `GameScreen` — pass a `scoreRef` prop that GameScreen attaches to the `AnimatedScore` element. At drop time, call `scoreRef.current?.getBoundingClientRect()` to get pixel position. Fallback: hardcode `{ x: 56, y: 52 }` which works for the primary mobile viewport (375px width).

2. **Should `src/types/game.ts` (Zustand types) and `src/types/index.ts` be deleted with FIX-04, or retained?**
   - What we know: `src/types/game.ts` defines `GamePhase`, `ShelfSlot`, `GameActions`, `GameStore` — types that only make sense with Zustand. `src/game/types.ts` is the separate canonical type file (Vinyl, Level, GameState, etc.).
   - What's unclear: Are `src/types/game.ts` types imported anywhere outside the dead Zustand cluster?
   - Recommendation: Grep `from.*types/game` before deleting. If only the dead files import it, delete it too. If anything else imports from it, retain and annotate as `QUARANTINED`.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase audit — all findings verified by reading source files
  - `src/components/GameScreen.tsx` — canonical state, PLACE_VINYL dispatch, ScorePopup import status confirmed absent from render
  - `src/components/ScorePopup/ScorePopup.tsx` — component API, existing animation, missing label prop
  - `src/components/HUD/HUD.tsx` — current props, grid layout sections
  - `src/components/Controls.tsx` — confirmed: no hint button, no `isLevelUnlocked` call
  - `src/game/engine.ts` — gameReducer, earnedScore calculation, PLACE_VINYL action
  - `src/game/rules.ts` — SLOT_TARGETS, getTargetSlot, COMBO_TIERS, COMBO_DECAY_MS
  - `src/game/storage.ts` — isLevelUnlocked bug confirmed (lines 42-50), function never called
  - `src/store/gameStore.ts` — dead Zustand store confirmed
  - `src/App.tsx` — confirmed GameProvider/hooks NOT in render tree
  - `src/types/game.ts` — Zustand-only type definitions, separate from canonical `src/game/types.ts`

### Secondary (MEDIUM confidence)
- N/A — all findings are from direct code inspection, no external sources consulted

---

## Metadata

**Confidence breakdown:**
- FIX-01 (stars threshold): HIGH — exact line identified (storage.ts:49), function currently dead so no regression risk
- FIX-02 (storage key): HIGH — bug confirmed, fix approach clear, no call sites to update
- FIX-03 (SLOT_TARGETS): HIGH — hint path confirmed dead (no SHOW_HINT button exists)
- FIX-04 (Zustand removal): HIGH — dead code confirmed; only caution is `src/types/game.ts` may need separate handling
- COMM-01 (ScorePopup wiring): HIGH — component exists and works; only open question is coordinate sourcing
- COMM-02 (HUD counter): HIGH — HUD props extension is straightforward, format locked
- COMM-03 (Level rule display): HIGH — mapping is deterministic from existing level data

**Research date:** 2026-02-20
**Valid until:** 2026-04-20 (stable codebase; only invalidated if architecture changes)
