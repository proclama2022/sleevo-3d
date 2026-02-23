---
phase: 01-foundation-fixes
plan: "03"
title: "Player Communication Elements"
one-liner: "Floating score popups, HUD vinyl counter, and level rule badge using combo tier system"
subsystem: "UI / Game Feedback"
tags: ["feedback", "hud", "combo", "communication"]
author: "Claude (Sonnet)"
completed: "2026-02-23T16:44:33Z"
duration: "14m 41s"
phase_number: 1
total_plans: 3
---

# Phase 1 Plan 3: Player Communication Elements Summary

**Completed:** 2026-02-23 in 14 minutes 41 seconds

## Objective

Wire three player communication elements: floating score feedback popup (COMM-01), HUD vinyl counter (COMM-02), and HUD level rule badge (COMM-03).

These elements provide real-time feedback loops that make the game legible — players see what they earned, how far they've progressed, and what rule they're following.

## Requirements Satisfied

- **COMM-01:** Floating "+N" or "+N LABEL" appears near HUD score within 200ms of each correct vinyl placement
- **COMM-02:** HUD displays "placed / total" counter in "N / M" format, updating live
- **COMM-03:** HUD displays persistent icon + label badge for the active level rule; hidden for free mode

## Key Files Created/Modified

### Modified Files

| File | Changes |
|------|---------|
| `src/components/ScorePopup/ScorePopup.tsx` | Added `label?: string` prop; renders "+N" or "+N LABEL" with conditional label span |
| `src/components/HUD/HUD.tsx` | Added `placed`, `total`, `sortRule`, `levelMode` props; new RuleBadge, RuleBadgeIcon, RuleBadgeLabel styled components; getLevelRuleDisplay helper function; updated LeftSection to vertical stack |
| `src/components/GameScreen.tsx` | Added `scorePopups` state array, `popupIdRef`, `scoreElementRef`; imported COMBO_TIERS and COMBO_DECAY_MS; calculate combo tier before PLACE_VINYL dispatch; render scorePopups array; pass new HUD props |

### Commits

- `9468330`: feat(01-foundation-fixes-01-03): add label prop to ScorePopup
- `43633f8`: feat(01-foundation-fixes-01-03): add vinyl counter and rule badge to HUD
- `3ee541a`: feat(01-foundation-fixes-01-03): wire ScorePopup and new HUD props in GameScreen

## Technical Implementation

### ScorePopup Extension (COMM-01)

Extended the existing `ScorePopup` component with an optional `label` prop:

```typescript
export interface ScorePopupProps {
  points: number;
  x: number;
  y: number;
  label?: string;  // NEW
  onComplete?: () => void;
}
```

The label renders conditionally after the points:
```typescript
{label && <span style={{ marginLeft: 4, fontSize: '0.8em', opacity: 0.9 }}>{label}</span>}
```

Result: "+10" (no combo) or "+35 GREAT!" (with combo label).

### HUD Vinyl Counter (COMM-02)

Added `placed` and `total` props to `HUDProps`:
```typescript
export interface HUDProps {
  score: number;
  timeRemaining?: number;
  moves: number;
  progress: number;
  placed?: number;      // NEW
  total?: number;       // NEW
  sortRule?: string;    // NEW
  levelMode?: string;   // NEW
}
```

Added a new `StatItem` in `RightSection` that renders `{placed} / {total}` using the existing `StatValue` styled component.

### HUD Level Rule Badge (COMM-03)

Created `getLevelRuleDisplay` helper that maps rules to icon+label pairs:
- `customer` mode → "👤 Cliente"
- `blackout` mode → "👁 Memoria"
- `rush` mode → "⏱ Rush"
- `sleeve-match` mode → "🖼 Abbina"
- `genre` sortRule → "🎵 Genere"
- `chronological` sortRule → "📅 Anno"
- Free mode → `null` (no badge shown)

Added `RuleBadge`, `RuleBadgeIcon`, and `RuleBadgeLabel` styled components with compact layout, semi-transparent background, and responsive design.

Changed `LeftSection` from horizontal to vertical stack (`flex-direction: column`) to accommodate the badge below the score.

### GameScreen Wiring

Added state management for score popups:
```typescript
const [scorePopups, setScorePopups] = useState<Array<{
  id: number;
  points: number;
  label: string;
  x: number;
  y: number;
}>>([]);
const popupIdRef = useRef(0);
const scoreElementRef = useRef<HTMLElement | null>(null);
```

In `handlePointerUp`, before dispatching `PLACE_VINYL`:
1. Calculate time since last placement
2. Determine if combo resets or continues
3. Find appropriate combo tier
4. Calculate earned points
5. Push popup to state array with HUD score coordinates

Used fallback coordinates `{ x: 56, y: 52 }` for popup positioning (acceptable per research).

Updated HUD render call:
```typescript
<HUD
  score={state.score}
  moves={state.moves}
  progress={progress}
  timeRemaining={hudTimeRemaining}
  placed={Object.keys(state.placedVinyls).length}
  total={state.level.vinyls.length}
  sortRule={state.level.sortRule}
  levelMode={state.level.mode}
/>
```

Rendered score popups in JSX alongside existing `ComboPopup`:
```typescript
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

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

## Key Decisions

### 1. Fallback coordinates for HUD score positioning

**Decision:** Use hardcoded `{ x: 56, y: 52 }` fallback instead of threading `scoreRef` through HUD component.

**Rationale:** Simpler implementation; acceptable per research notes; avoids prop drilling complexity.

**Impact:** Score popup positioning is slightly less precise on different screen sizes, but still appears in the correct general area (top-left HUD score region).

### 2. LeftSection layout change

**Decision:** Changed `LeftSection` from horizontal to vertical stack to accommodate rule badge below score.

**Rationale:** Badge needs to be subordinate to score visually; vertical stacking maintains hierarchy while keeping left-side alignment.

**Impact:** Slight layout change in HUD left section; responsive breakpoints ensure compact display on small screens.

## Dependencies

### Requires
- `COMBO_TIERS` constant from `src/game/rules.ts`
- `COMBO_DECAY_MS` constant from `src/game/rules.ts`
- Existing `ScorePopup` component with `animations.scoreFloat`
- Existing `HUD` component with styled component infrastructure

### Provides
- COMM-01: Real-time score feedback near HUD score
- COMM-02: Live "N / M" progress counter
- COMM-03: Persistent level rule indicator
- Infrastructure for future combo escalation visual feedback

## Testing & Verification

Browser verification completed with all 5 checks passed:

1. ✓ Score popup "+N" appears near top-left HUD score on correct drops
2. ✓ HUD counter shows "N / M" and increments correctly (e.g., "1 / 8" after first drop)
3. ✓ HUD rule badge displays icon + label correctly (e.g., "🎵 Genere")
4. ✓ Combo labels escalate with quick successive drops (NICE! → GREAT! → etc.)
5. ✓ Popup appears near HUD score, not near shelf slot

## Performance Notes

- Popups are cleaned up via `onComplete` callback after animation completes
- No memory leaks from popup state accumulation
- No re-renders during drag operations (existing `GameScreen` pattern maintained)
- Combo calculation happens before dispatch, avoiding reducer complexity

## Next Steps

This plan completes Phase 1 (Foundation Fixes). All three phase plans are now complete:

1. ✓ Plan 01-01: Removed hint button infrastructure
2. ✓ Plan 01-02: Removed dormant Zustand cluster
3. ✓ Plan 01-03: Wired player communication elements

**Phase 1 Status:** COMPLETE

Ready for Phase 2 (Core UI Components) or next foundation iteration as prioritized.
