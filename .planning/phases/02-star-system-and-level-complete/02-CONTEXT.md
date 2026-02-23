# Phase 2: Star System and Level Complete — Context

**Created:** 2026-02-23
**Status:** Decisions captured, ready for research

---

## Phase Boundary

**Goal:** Players receive a clear, meaningful performance rating at the end of every level

**In Scope:**
- Star rating formula (errors + time → 1/2/3 stars)
- End-of-level screen (stats display + ceremony)
- Mode-differentiated thresholds via per-level parTime
- Progress persistence (stars saved across sessions)

**NOT In Scope:**
- Level select / navigation (Phase 3)
- Level content / mode implementation (Phase 4)

**Requirements:** STAR-01, STAR-02, STAR-03, COMM-04

---

## Decisions

### D1: Star Calculation Formula

**Chosen approach:** Discrete thresholds (not weighted formula)

| Stars | Condition |
|-------|-----------|
| 3★ | 0 errors + time ≤ par × 1.10 |
| 2★ | ≤1 error + time < par |
| 1★ | Level completed |

**Notes:**
- Time threshold for 3★ allows 10% margin over par (par × 1.10)
- Time threshold for 2★ is strict: must be UNDER par (< parTime)
- Errors are counted as wrong placements (PLACE_VINYL with isValidPlacement = false)
- 1 star is guaranteed for completing the level, regardless of performance

---

### D2: Mode-Differentiated Thresholds

**Chosen approach:** Per-level manual parTime (not automatic multipliers)

Each level has its own `parTime` property defined manually by the level designer. This gives maximum flexibility because:
- Difficulty varies by vinyl count, not just mode
- Complex layouts need more time regardless of mode
- Designer can tune each level individually

**No automatic mode multipliers.** The parTime is set per-level during level authoring (Phase 4).

---

### D3: End-of-Level Screen Layout

**Chosen approach:** Centered modal with darkened background

**Content displayed:**
1. **Stars** — 1-3 stars with animated reveal (primary focus)
2. **Score** — Total points earned
3. **Errors** — Count of wrong placements (e.g., "2 errori")
4. **Time vs Par** — Elapsed time with par reference (e.g., "0:47 / 1:00 par")

**Star Animation:**
- Sequential reveal: stars appear one after another with 0.3s delay
- Builds tension and celebration

**Actions:**
- "Rigioca" button — restarts current level
- "Prossimo livello" button — goes to next level (only if unlocked)

---

### D4: parTime Definition and Storage

**Definition approach:** Formula + manual override

**Default formula:** `(vinyls × 3s) × (1 + mode_multiplier)`

This gives a baseline that the designer can override in the level definition.

**Storage:** `parTime` is a property on the `Level` object in `levels.ts`

```typescript
interface Level {
  id: string;
  name: string;
  mode: LevelMode;
  vinyls: Vinyl[];
  parTime: number; // seconds
  // ... other properties
}
```

---

## Out of Scope (Deferred)

These ideas came up but belong in other phases:

- **Level select screen** → Phase 3
- **Star display on level tiles** → Phase 3
- **Rush mode countdown timer** → Phase 4
- **Blackout flicker fix** → Phase 4

---

## Key Files

| File | Purpose |
|------|---------|
| `src/game/levels.ts` | Level definitions with parTime |
| `src/game/types.ts` | Level interface with parTime property |
| `src/game/storage.ts` | Progress persistence (stars per level) |
| `src/components/LevelComplete.tsx` | End-of-level screen component |
| `src/components/GameScreen.tsx` | Triggers level complete on finish |

---

## Research Questions

Before planning, the researcher should investigate:

1. How is level completion detected? (Where does `isLevelComplete` logic live?)
2. What triggers the transition to LevelComplete screen?
3. What animation library/utilities exist for the star reveal?
4. How is score currently calculated? (combo tiers, point values)
5. What's the current LevelComplete.tsx structure?

---

## Success Criteria (from ROADMAP)

1. ✓ The end-of-level screen shows 1, 2, or 3 stars with an animated reveal
2. ✓ The end-of-level screen shows the final score, error count, and time elapsed
3. ✓ A rush/blackout level with 2 mistakes and under par time yields a different star count than a genre level with the same stats (via different parTime values)
4. ✓ Star ratings and level completion state persist across browser sessions

---

*Context captured via /gsd:discuss-phase on 2026-02-23*
