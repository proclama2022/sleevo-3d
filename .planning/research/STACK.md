# Stack Research

**Domain:** Best score persistence + personal record UI in existing React/TypeScript browser game
**Researched:** 2026-02-25
**Confidence:** HIGH

## Verdict: No New Dependencies Required

This milestone is a pure vanilla implementation. Every capability needed already exists in the
codebase or the browser runtime. Adding libraries would introduce unnecessary bundle overhead
and potential version conflicts with zero benefit.

---

## Existing Stack (Confirmed In Use — Do Not Change)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| React | 19.2.4 | Component rendering | Active |
| TypeScript | 5.9.3 | Type safety | Active |
| Vite | 7.3.1 | Dev server, bundler | Active |
| CSS Modules | (Vite built-in) | Component-scoped styling | Active — use for all new styles |
| `localStorage` (browser API) | native | Persistence via `sleevo_progress` key | Active — `src/game/storage.ts` |

---

## Integration Points for This Milestone

### 1. `src/game/storage.ts` — Extend `LevelProgress` with `bestScore`

Current `LevelProgress` interface:
```typescript
export interface LevelProgress {
  stars: number;
  bestTime?: number;
}
```

Needed: add `bestScore?: number`. The existing `saveProgress` improvement logic already handles
optional fields — the same pattern extends to score (`!existing.bestScore || score > existing.bestScore`).

**No migration needed.** Old localStorage records without `bestScore` read as `undefined`.
Comparison against `undefined` with `>` yields `false`, so the first score ever recorded is
always saved. Natural, zero-effort migration.

**Call site in `GameScreen.tsx` line 189:**
```typescript
saveProgress(state.level.id, state.stars, timeElapsed);
```
Needs `state.score` added as a fourth argument after the function signature is extended.

### 2. `src/components/LevelSelect/LevelSelect.tsx` — Display `bestScore` in `LevelCell`

`LevelCell` already reads `p?.stars` from `loadAllProgress()`. Adding `p?.bestScore` requires:
- One additional prop on `CellProps`
- One conditional `<span>` below the stars row
- One new CSS class in `LevelSelect.module.css`

No new component file needed. The cell is small enough to absorb this inline.

**Score formatting:** Use `(score).toLocaleString('it-IT')` — native browser API, no library.
Produces "1.420" from `1420` with Italian thousands separator. Append " pt" as a string literal.

### 3. `src/components/LevelComplete.tsx` — "Nuovo Record!" highlight

Component already accepts `score?: number`. Two new optional props needed:
- `bestScore?: number` — the previous stored record, read before saving overwrites it
- `isNewRecord?: boolean` — computed in GameScreen; drives a conditional CSS class on the score stat

Implementation: one `if` in render, one additional CSS class in `LevelComplete.module.css`.
The golden glow/pulse is two CSS keyframe rules (opacity + box-shadow/color oscillation).
No animation library.

### 4. `src/components/GameScreen.tsx` — Compute and propagate record state

The `useEffect` at line 187–192 is the right location:
```typescript
useEffect(() => {
  if (state.status === 'completed') {
    // Read BEFORE saving — save will overwrite bestScore
    const prev = getLevelProgress(state.level.id);
    const isNewRecord = state.score > (prev?.bestScore ?? 0);
    saveProgress(state.level.id, state.stars, timeElapsed, state.score);
    // Pass isNewRecord and prev?.bestScore to LevelComplete via state or direct props
  }
}, [state.status, state.stars]);
```

The previous best score needs to survive re-renders until LevelComplete is dismissed. A
`useRef` is the right tool — it holds a value across renders without triggering re-renders:
```typescript
const prevBestScoreRef = useRef<number>(0);
const isNewRecordRef = useRef<boolean>(false);
```
Set both inside the `useEffect` before calling `saveProgress`.

---

## Score Formatting — Vanilla, Not a Library

| Need | Solution | Library? |
|------|----------|----------|
| "1.420 pt" (Italian thousands) | `n.toLocaleString('it-IT') + ' pt'` | No |
| Conditional label render | `{bestScore !== undefined && <span>...}` | No |
| Golden highlight animation | CSS keyframe in `.module.css` | No |

`Intl.NumberFormat` (called via `toLocaleString`) is supported in all modern browsers.
Confidence: HIGH.

---

## Supporting Libraries — All Rejected

| Library | Verdict | Reason |
|---------|---------|--------|
| `idb` / `localforage` | DO NOT ADD | Storage layer is already working; `bestScore` is one integer field; switching storage mid-project for a trivial addition is over-engineering |
| `zustand` | DO NOT ADD | Already confirmed absent from the codebase (not in `package.json`); score comparison is a one-time read at level completion, not ongoing reactive state; `useRef` handles it |
| `numeral` / `accounting.js` | DO NOT ADD | `toLocaleString('it-IT')` covers the only formatting need |
| `framer-motion` | DO NOT ADD | CSS Module keyframes are used throughout; "Nuovo Record!" pulse is two CSS rules |
| `react-confetti` | DO NOT ADD | LevelComplete already has hand-rolled confetti; no new confetti for this feature |
| `react-router-dom` | DO NOT ADD | Not relevant to this milestone; single-URL game |

---

## Installation

```bash
# Nothing to install.
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Extend `LevelProgress` in `storage.ts` with `bestScore` | Separate `bestScore_<levelId>` localStorage keys | Fragmentation — current code manages one JSON blob per key; a separate key requires separate read/write and risks stale reads if one write fails |
| Compute `isNewRecord` in `GameScreen` before `saveProgress` runs | Compute inside `saveProgress` and return a boolean | `saveProgress` is a pure side-effect function with no return value; changing its contract to return values would require refactoring the existing call site and tests (if any) |
| CSS Module `.recordHighlight` keyframe | Inline `style` prop with JavaScript | CSS keyframes cannot be expressed as inline styles; a CSS class is the only correct approach |
| `useRef` to hold `prevBestScore` across render | `useState` | `useState` would cause an extra render cycle; `useRef` holds the value without triggering re-renders, which is correct for a one-time read before save |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Any state management library | Score comparison is a momentary read at level completion, not shared reactive state | `useRef` + `getLevelProgress` in the existing `useEffect` |
| Any storage abstraction library | `localStorage` is synchronous, proven, and already the project standard | Native `localStorage` via existing `storage.ts` |
| `styled-components` for the record highlight | Project uses CSS Modules for all component styling; `styled-components` is installed but not used for game components | `.module.css` class |

---

## Version Compatibility

| Package | Version | Notes |
|---------|---------|-------|
| React | 19.2.4 | Standard hooks (`useRef`, `useEffect`) — no compatibility concerns |
| TypeScript | 5.9.3 | Optional interface fields (`bestScore?: number`) — standard syntax, no issues |
| Vite + CSS Modules | 7.3.1 | CSS Module keyframes already in heavy use throughout; no config change needed |

---

## Sources

- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/game/storage.ts` — `LevelProgress` interface, `saveProgress` logic, `PROGRESS_KEY` — HIGH confidence
- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/components/GameScreen.tsx` lines 186–192 — `saveProgress` call site, `useEffect` structure — HIGH confidence
- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/components/LevelSelect/LevelSelect.tsx` — `LevelCell` props and `loadAllProgress` usage — HIGH confidence
- Direct inspection of `/Users/martha2022/Documents/Sleevo/src/components/LevelComplete.tsx` — existing `score` prop, stat display at line 103 — HIGH confidence
- Direct inspection of `/Users/martha2022/Documents/Sleevo/package.json` — confirmed `zustand` is NOT a dependency; `styled-components` v6.3.9 is present but unused in game components — HIGH confidence
- MDN `Intl.NumberFormat` / `toLocaleString` — browser native API, no external source needed — HIGH confidence

---

*Stack research for: Sleevo — best score persistence + personal record UI*
*Researched: 2026-02-25*
