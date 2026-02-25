# Phase 3: Progression and Navigation - Research

**Researched:** 2026-02-25
**Domain:** React screen routing (no router), localStorage persistence, level select UI
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Level select layout**
- 3-column grid layout
- Each cell shows: level number + best star count earned (★★★ filled/empty)
- No level name or mode hint on the cell — just number and stars
- Locked levels: same cell style but dimmed/greyed out with a padlock icon (no number hidden)
- Header: simple title (e.g. "Scegli Livello") + back button — minimal chrome

**Locked level interaction**
- Tapping a locked level does nothing (silent block — no toast, no modal)
- Unlock rule explained by subtle hint text below the grid (e.g. "Guadagna 2 stelle per sbloccare il prossimo livello")
- After completing a level with enough stars to unlock the next: LevelComplete screen first (stars animate, player sees score), then player taps Continue and lands on level select with the newly unlocked level visible

**App load & resume**
- Always open at level select on load — never jump directly into a level
- On load, visually highlight/focus the first level the player hasn't earned 3★ on yet
- "Incomplete" = never earned 3★ (not just never played) — encourages replaying for perfection
- If all levels are 3★, focus the last level

**Star persistence**
- Storage: localStorage (JSON, browser-native, no backend needed)
- Best stars are always preserved — a worse replay never overwrites a better result
- Unlocks are permanent: once level N+1 is unlocked (by earning 2★ on level N), it stays unlocked regardless of future replays
- Unlock state is derived from best-ever star count stored in localStorage

### Claude's Discretion
- Exact localStorage key structure and schema
- Scroll animation / focus animation on the highlighted cell
- Transition animation between level select and gameplay
- Exact Italian strings for title and hint text

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROG-01 | Il progresso è salvato in localStorage (stelle per livello, livello più alto sbloccato) | `storage.ts` already has `saveProgress`/`loadAllProgress` with `sleevo_progress` key; schema is `Record<string, { stars, bestTime? }>`; unlock state must be derivable from stars only (no separate unlock field needed) |
| PROG-02 | I livelli si sbloccano quando il precedente raggiunge almeno 2 stelle | `isLevelUnlocked()` in `storage.ts` already implements this logic correctly (FIX-01 applied); just needs to be wired into LevelSelect rendering |
| PROG-03 | Una schermata di selezione livelli mostra la griglia con stato locked/unlocked e stelle acquisite | New `LevelSelect` component needed; App.tsx must lift screen state; CSS Module pattern is the project standard |

</phase_requirements>

---

## Summary

Phase 3 adds the level select screen and makes progression persist across sessions. The heavy lifting for storage is already partially done: `storage.ts` has `saveProgress`, `loadAllProgress`, `getLevelProgress`, and `isLevelUnlocked` — all tested by Phase 1 decisions. What's missing is the screen itself (a new `LevelSelect` component), an app-level screen router, and the wiring that connects LevelComplete's "Continue" button to the level select instead of jumping directly into the next level.

The project has no external router (no React Router, no Next.js). Navigation is currently implicit: `App.tsx` renders `<GameScreen>` unconditionally, and GameScreen manages level transitions internally via `NEXT_LEVEL` dispatch. To add level select, a lightweight "screen state" (`'levelSelect' | 'playing'`) must be lifted into `App.tsx` so the two screens can swap. This is the right level — not GameScreen itself — because LevelComplete's "Continue" now needs to return to level select rather than auto-advancing.

The CSS Module + React approach is well-established across the entire codebase. The project uses `min(100%, 462px)` viewport-capped card layout in `GameScreen.module.css` and design tokens in `globals.css`. LevelSelect should follow the same card shell pattern. The grid is a simple 3-column CSS grid of tap targets, styled to match the dark wood aesthetic already established.

**Primary recommendation:** Lift screen state into App.tsx as `'levelSelect' | 'playing'`, build a LevelSelect component using the existing CSS Module pattern, wire LevelComplete's "Continue" to return to level select, and derive unlock/highlight logic entirely from `loadAllProgress()` — no new storage schema needed.

---

## Standard Stack

### Core (already in project — no new installs needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 19 | ^19.2.4 | Component rendering and state | Already used everywhere |
| CSS Modules | Built-in (Vite) | Scoped styles | Every component uses `.module.css` pattern |
| localStorage (browser native) | — | Progress persistence | Already in `storage.ts`; no backend needed |

### No New Dependencies Required

This phase is pure React + CSS Modules + existing `storage.ts` logic. No new npm packages.

**Installation:**
```bash
# Nothing to install — all dependencies already present
```

---

## Architecture Patterns

### Current App Structure (before Phase 3)

```
src/
├── App.tsx                   # Renders <GameScreen /> unconditionally
├── main.tsx                  # React root mount
├── components/
│   ├── GameScreen.tsx        # All gameplay (level index managed internally)
│   ├── LevelComplete.tsx     # Overlay shown on state.status === 'completed'
│   └── ...
└── game/
    ├── storage.ts            # saveProgress, loadAllProgress, isLevelUnlocked
    ├── levels.ts             # LEVELS[] array (21 levels defined)
    └── types.ts              # Level, GameState, etc.
```

### Pattern 1: Lift Screen State into App.tsx

**What:** App.tsx holds a `screen` discriminated union that determines which top-level component renders. When screen is `'levelSelect'`, LevelSelect renders. When `'playing'`, GameScreen renders with a specific level index.

**When to use:** Appropriate when there are only 2 screens and no deep linking is needed.

**Example:**
```typescript
// src/App.tsx — after Phase 3
import { useState } from 'react';
import { ThemeProvider } from './ui/ThemeProvider';
import { GameScreen } from './components/GameScreen';
import { LevelSelect } from './components/LevelSelect/LevelSelect';
import { LEVELS } from './game/levels';
import { isLevelUnlocked } from './game/storage';

type Screen = 'levelSelect' | 'playing';

export default function App() {
  const [screen, setScreen] = useState<Screen>('levelSelect');
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(() => {
    // Determine first incomplete level on mount (resume behavior)
    return findFirstIncompleteLevel();
  });

  function findFirstIncompleteLevel(): number {
    // "incomplete" = never earned 3★
    // Returns index of first such level; returns last level if all are 3★
    ...
  }

  const handleSelectLevel = (index: number) => {
    if (!isLevelUnlocked(index, LEVELS)) return; // silent block
    setCurrentLevelIndex(index);
    setScreen('playing');
  };

  const handleReturnToSelect = () => {
    setScreen('levelSelect');
  };

  return (
    <ThemeProvider>
      {screen === 'levelSelect' ? (
        <LevelSelect
          onSelectLevel={handleSelectLevel}
          currentFocusIndex={currentLevelIndex}
        />
      ) : (
        <GameScreen
          initialLevelIndex={currentLevelIndex}
          onReturnToSelect={handleReturnToSelect}
        />
      )}
    </ThemeProvider>
  );
}
```

### Pattern 2: LevelSelect Component with CSS Grid

**What:** A full-screen card with a 3-column grid of level cells. Each cell reads progress from `loadAllProgress()` at render time (no extra state needed — localStorage read is synchronous and fast).

**When to use:** This is the locked decision. Always 3 columns.

**Example:**
```typescript
// src/components/LevelSelect/LevelSelect.tsx
import { loadAllProgress, isLevelUnlocked } from '../../game/storage';
import { LEVELS } from '../../game/levels';
import styles from './LevelSelect.module.css';

interface Props {
  onSelectLevel: (index: number) => void;
  currentFocusIndex: number; // cell to visually highlight on load
}

export function LevelSelect({ onSelectLevel, currentFocusIndex }: Props) {
  const progress = loadAllProgress(); // sync read, no useEffect needed

  return (
    <div className={styles.viewport}>
      <div className={styles.screen}>
        <header className={styles.header}>
          <h1 className={styles.title}>Scegli Livello</h1>
        </header>

        <div className={styles.grid}>
          {LEVELS.map((level, index) => {
            const p = progress[level.id];
            const bestStars = p?.stars ?? 0;
            const unlocked = isLevelUnlocked(index, LEVELS);
            const isFocused = index === currentFocusIndex;

            return (
              <LevelCell
                key={level.id}
                levelNumber={index + 1}
                bestStars={bestStars}
                unlocked={unlocked}
                focused={isFocused}
                onClick={() => onSelectLevel(index)}
              />
            );
          })}
        </div>

        <p className={styles.hint}>
          Guadagna 2 stelle per sbloccare il prossimo livello
        </p>
      </div>
    </div>
  );
}
```

### Pattern 3: LevelCell Component

**What:** A self-contained cell that renders its locked/unlocked/focused state via CSS data attributes — same approach as ShelfSlot uses `data-hover` / `data-drop-lock`.

**Example:**
```typescript
// Inline or extracted LevelCell
function LevelCell({ levelNumber, bestStars, unlocked, focused, onClick }) {
  return (
    <button
      className={styles.cell}
      data-unlocked={unlocked}
      data-focused={focused}
      onClick={onClick}
      disabled={!unlocked}
      aria-label={`Livello ${levelNumber}${!unlocked ? ', bloccato' : ''}`}
    >
      <span className={styles.number}>{levelNumber}</span>
      <div className={styles.stars}>
        {[1, 2, 3].map(n => (
          <span
            key={n}
            className={`${styles.star} ${n <= bestStars ? styles.starFilled : ''}`}
          >
            ★
          </span>
        ))}
      </div>
      {!unlocked && <span className={styles.lock}>🔒</span>}
    </button>
  );
}
```

### Pattern 4: GameScreen receives initialLevelIndex prop

**What:** GameScreen's `useReducer` initializer currently hardcodes `LEVELS[0]`. It needs to accept `initialLevelIndex` as a prop so App.tsx can tell it which level to start at.

**Current code (GameScreen.tsx line 60-62):**
```typescript
const [state, dispatch] = useReducer(gameReducer, null, () =>
  createGameState(LEVELS[0], 0)  // ← hardcoded LEVELS[0]
);
```

**After Phase 3:**
```typescript
interface Props {
  initialLevelIndex: number;
  onReturnToSelect: () => void;
}

export function GameScreen({ initialLevelIndex, onReturnToSelect }: Props) {
  const [state, dispatch] = useReducer(gameReducer, null, () =>
    createGameState(LEVELS[initialLevelIndex], initialLevelIndex)
  );
  // ...
}
```

### Pattern 5: LevelComplete "Continue" returns to level select

**What:** The existing `onNextLevel` prop on LevelComplete currently calls `handleNext` which auto-advances. After Phase 3, "Continue" must call `onReturnToSelect` in App.tsx instead.

**Current flow:** LevelComplete → onNextLevel → handleNext (GameScreen) → NEXT_LEVEL dispatch
**New flow:** LevelComplete → onNextLevel → onReturnToSelect (App.tsx) → screen = 'levelSelect'

The LevelComplete component's button text should change from "Livello successivo →" to "Continua →" (or similar) since it now returns to the map rather than auto-starting the next level.

### Pattern 6: findFirstIncompleteLevel() logic

**What:** Computes the level to highlight/focus on load. "Incomplete" = never earned 3★.

```typescript
function findFirstIncompleteLevel(): number {
  const progress = loadAllProgress();
  for (let i = 0; i < LEVELS.length; i++) {
    const p = progress[LEVELS[i].id];
    if (!p || p.stars < 3) return i;
  }
  // All levels are 3★ — focus last level
  return LEVELS.length - 1;
}
```

### Recommended File Structure (additions only)

```
src/
├── App.tsx                             # MODIFIED: add screen state + routing
├── components/
│   ├── LevelSelect/
│   │   ├── LevelSelect.tsx             # NEW: main level select screen
│   │   └── LevelSelect.module.css      # NEW: styles
│   ├── GameScreen.tsx                  # MODIFIED: add initialLevelIndex prop, onReturnToSelect prop
│   └── LevelComplete.tsx               # MODIFIED: "Continue" returns to select
└── game/
    └── storage.ts                      # MINIMAL: may add helper for focus computation
```

### Anti-Patterns to Avoid

- **Storing unlock state separately in localStorage:** Unlocks are derived from `bestStars >= 2`. Never write a separate `unlocked` boolean to storage — it's redundant and can diverge.
- **Reading localStorage in a useEffect:** `loadAllProgress()` is synchronous. Read it during render initialization (useState initializer or directly in render) — no async patterns needed.
- **Passing LEVELS array down as prop:** It's a module-level constant. Import directly in LevelSelect, not passed through App.
- **Using React Router or any router library:** This project has 2 screens. A `screen` string state in App.tsx is sufficient.
- **Auto-advancing to next level from LevelComplete:** Post-Phase 3, "Continue" always returns to level select. Never jump directly into a level from LevelComplete.
- **Resetting progress key per level index:** Phase 1 already fixed this (FIX-02). `storage.ts` uses `level.id` strings like `'level-1'`, not numeric indices.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll/focus to highlighted cell | Custom scroll logic | `element.scrollIntoView({ behavior: 'smooth', block: 'center' })` | Built-in browser API, works on all targets |
| Page transition animation | Custom animation framework | CSS transition on the top-level screen container (opacity + translate) | Simple, consistent with existing animation style |
| Level unlock computation | Custom state machine | Existing `isLevelUnlocked(index, LEVELS)` in `storage.ts` | Already correct, already covers FIX-01 (2★ threshold) |
| Star persistence logic | Custom save/load | Existing `saveProgress()` / `loadAllProgress()` / `getLevelProgress()` | Already handles best-only semantics, try/catch around localStorage |

**Key insight:** `storage.ts` already solves 80% of this phase's data layer. The primary work is UI, not storage.

---

## Common Pitfalls

### Pitfall 1: initialLevelIndex prop ignored after first render

**What goes wrong:** `useReducer` initializer runs once. If `initialLevelIndex` changes (e.g., player returns to select and picks a different level), GameScreen still starts at the original level.
**Why it happens:** React's `useReducer` lazy initializer only runs on mount.
**How to avoid:** When navigating from level select into gameplay, the GameScreen component should unmount/remount (achieved naturally by the `screen` state toggle in App.tsx, since `'levelSelect'` renders a completely different component). No key prop needed — the screen swap itself triggers unmount.
**Warning signs:** Player taps level 5 on select, game starts at level 1.

### Pitfall 2: LevelSelect reads stale progress after returning from gameplay

**What goes wrong:** Progress saved during gameplay isn't visible when the player returns to level select.
**Why it happens:** `loadAllProgress()` is called once during render and not refreshed.
**How to avoid:** Because LevelSelect unmounts during gameplay and remounts on return, `loadAllProgress()` re-runs on every mount. No caching or useEffect subscription needed. The unmount/remount cycle is sufficient.
**Warning signs:** Player earns stars, returns to select, stars don't show on the cell.

### Pitfall 3: Locked level tap causes visible state change

**What goes wrong:** Tapping a locked level triggers `disabled` button flash or default browser focus style.
**Why it happens:** HTML `<button disabled>` still has browser-default disabled styling that may differ from design intent.
**How to avoid:** Use `pointer-events: none` on the cell overlay for locked state AND `disabled` attribute for accessibility. Style `[data-unlocked="false"]` in CSS explicitly to control appearance. Use `-webkit-tap-highlight-color: transparent` (already set globally in `globals.css`).
**Warning signs:** Locked cell briefly flashes blue/grey on tap.

### Pitfall 4: Focus highlight not visible on initial load

**What goes wrong:** The highlighted "first incomplete" level is off-screen (below the fold) on load and the player doesn't see it.
**Why it happens:** LevelSelect renders 21 cells in a 3-column grid; cell 10+ requires scrolling.
**How to avoid:** After mount, use `useEffect` + `scrollIntoView` on the focused cell's ref. The LevelSelect container should be scrollable (`overflow-y: auto`), not the viewport.
**Warning signs:** Player loads app, sees only levels 1-6, doesn't notice they should start at level 8.

### Pitfall 5: GameScreen initialLevelIndex prop breaks Tutorial logic

**What goes wrong:** The tutorial currently checks `state.levelIndex === 0 && shouldShowTutorial()`. If the player is sent to level 1 from select, tutorial shows correctly. But if code is rearranged, tutorial may fire on wrong levels.
**Why it happens:** Tutorial state is initialized from `state.levelIndex` at mount time.
**How to avoid:** Tutorial logic already correctly reads `state.levelIndex === 0`. Preserve this check — no changes needed to tutorial.
**Warning signs:** Tutorial appears on level 5.

### Pitfall 6: Best-star preservation breaks if saveProgress called before storage.ts fix

**What goes wrong:** Phase 1's FIX-02 changed the storage key from numeric index to level ID. If old data exists in localStorage under numeric keys, `getLevelProgress('level-1')` returns null even for players who have existing progress.
**Why it happens:** Key migration never ran.
**How to avoid:** This is a known migration edge case. For v1, the game has no existing players — clean slate is fine. If needed in future, add a one-time migration in `loadAllProgress()`. Do not implement for Phase 3 (no players yet).
**Warning signs:** Not applicable for v1.

---

## Code Examples

### scrollIntoView for focused cell

```typescript
// Source: MDN Web Docs — Element.scrollIntoView()
// In LevelSelect component:
const focusedCellRef = useRef<HTMLButtonElement>(null);

useEffect(() => {
  if (focusedCellRef.current) {
    focusedCellRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
}, []); // Only on mount — intended behavior
```

### loadAllProgress during render (no useEffect)

```typescript
// Source: storage.ts — loadAllProgress() is synchronous
// Safe to call directly in component body or useState initializer
export function LevelSelect({ onSelectLevel, currentFocusIndex }: Props) {
  // Direct call — no useEffect, no useState for progress
  const progress = loadAllProgress();
  // progress is a plain object, used directly in render
}
```

### CSS Module pattern for grid (3 columns, matching project style)

```css
/* LevelSelect.module.css */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 12px;
  overflow-y: auto;
  flex: 1;
}

.cell {
  aspect-ratio: 1;
  border-radius: 12px;
  background: rgba(255, 235, 200, 0.06);
  border: 1px solid rgba(255, 200, 120, 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.12s ease;
  -webkit-tap-highlight-color: transparent;
}

.cell[data-unlocked="false"] {
  opacity: 0.38;
  pointer-events: none;  /* silent block */
}

.cell[data-focused="true"] {
  border-color: rgba(255, 200, 120, 0.6);
  background: rgba(255, 200, 120, 0.12);
  box-shadow: 0 0 0 2px rgba(255, 200, 120, 0.35);
}
```

### App.tsx screen routing pattern

```typescript
// App.tsx — minimal screen router
type Screen = 'levelSelect' | 'playing';

export default function App() {
  const [screen, setScreen] = useState<Screen>('levelSelect');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(
    () => findFirstIncompleteLevel()
  );

  const handleSelectLevel = (index: number) => {
    setCurrentLevelIndex(index);
    setScreen('playing');
  };

  const handleReturnToSelect = () => {
    setScreen('levelSelect');
    // Re-compute focus index when returning (player may have earned stars)
    setCurrentLevelIndex(findFirstIncompleteLevel());
  };

  return (
    <ThemeProvider>
      {screen === 'levelSelect'
        ? <LevelSelect onSelectLevel={handleSelectLevel} currentFocusIndex={currentLevelIndex} />
        : <GameScreen initialLevelIndex={currentLevelIndex} onReturnToSelect={handleReturnToSelect} />
      }
    </ThemeProvider>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| GameScreen auto-advances on LevelComplete "Next" | LevelComplete "Continue" returns to level select | Player always sees their full progress before re-entering a level |
| App.tsx renders GameScreen unconditionally (LEVELS[0]) | App.tsx holds screen state, passes initial level index | Enables level select as a real screen, not an overlay |
| No progress visibility before entering a level | LevelSelect shows all stars earned | Player can choose which level to replay for a better score |

---

## Open Questions

1. **CSS transition for screen swap (App-level)**
   - What we know: Project uses CSS Modules; GameScreen uses `opacity` + transform in other overlays
   - What's unclear: Whether App.tsx should animate the screen swap (fade out LevelSelect, fade in GameScreen) or just swap instantly
   - Recommendation: Claude's discretion. A simple `opacity` transition on the screen container (200ms ease) would feel polished. If it adds complexity, instant swap is acceptable.

2. **LevelComplete button label after Phase 3**
   - What we know: Currently says "Livello successivo →"
   - What's unclear: Whether "Continua →" or "Torna alla mappa →" or "Scegli livello →" is the right Italian label
   - Recommendation: Claude's discretion. "Continua →" is shortest; "Scegli livello →" is most explicit.

3. **handleNext behavior in GameScreen after Phase 3**
   - What we know: `handleNext` in GameScreen currently calls `dispatch({ type: 'NEXT_LEVEL', ... })` which loads the next level directly
   - What's unclear: Should `handleNext` be removed, or kept for possible "quick next" from Controls?
   - Recommendation: Remove `handleNext` and the "Livello successivo →" path entirely from GameScreen. All level transitions go through App.tsx. This avoids divergent navigation paths.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection of `storage.ts` — `saveProgress`, `loadAllProgress`, `isLevelUnlocked`, `getLevelProgress` all verified present with correct semantics
- Direct code inspection of `GameScreen.tsx` — `initialLevelIndex` hardcoding identified at line 61, `handleNext`/`handleJumpToLevel` handlers understood
- Direct code inspection of `LevelComplete.tsx` — button props and `onNextLevel` callback verified
- Direct code inspection of `App.tsx` — single-component structure confirmed (`<GameScreen />` only)
- Direct code inspection of `levels.ts` — `LEVELS` array confirmed, 21 levels with `id` strings confirmed
- Direct code inspection of `globals.css` + `GameScreen.module.css` — CSS Module pattern, design tokens, card layout constraints

### Secondary (MEDIUM confidence)
- `Element.scrollIntoView()` with `{ behavior: 'smooth', block: 'center' }` — standard browser API, works in all modern browsers; no library needed

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; all tools already in project
- Architecture: HIGH — directly verified from codebase; no assumptions needed
- Pitfalls: HIGH — derived from direct code reading of the specific files that must change

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (stable codebase, no fast-moving dependencies)
