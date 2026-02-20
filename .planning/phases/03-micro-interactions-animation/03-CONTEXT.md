# Phase 3: Micro-Interactions & Animation - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement micro-interactions with specific timing for existing components. Cards, slots, HUD, and drag system already work — this phase adds feel and polish, not new features. Animation timing specs from roadmap are baseline; discussion clarifies style and behavior.

</domain>

<decisions>
## Implementation Decisions

### Card Animation Feel
- **Pickup spring:** Bouncy with higher spring tension — snappier, more energetic feel
- **Pickup scale:** Scale up 1.05-1.1x during lift — adds energy to the gesture
- **Drop settle:** Ease-out settle (smooth) — smooth deceleration to final position with no overshoot
- **Drag shadow:** Dynamic shadow — shadow grows deeper as card lifts, adds depth and separation

### Success/Failure Feedback
- **Correct placement:** Medium celebration — burst effect with particles radiating outward + existing sparkle animation
- **Wrong placement:** Shake only — card shakes left-right briefly and returns to counter (no red flash)
- **Slot hover highlight:** Glow pulse — ring + pulsing glow that intensifies as you hover over slot
- **Wrong shake intensity:** Fast shake (150ms) — quick shake, 2-3 oscillations, feels snappy

### Combo System Behavior
- **Trigger threshold:** 4+ correct placements in a row — higher bar, combo feels like a real achievement
- **Display content:** Points bonus only — shows point bonus like '+50', '+100' (not streak count)
- **Popup position:** Floating near slot — appears near the placed vinyl, fades out after showing
- **Reset behavior:** Reduce by 1 (forgiving) — wrong reduces streak by 1 but doesn't fully reset

### Reduced Motion Mode
- **Animation behavior:** Faster, no bounce — everything works but animations are 2-3x faster, no spring physics
- **Sparkle effect:** Static sparkle points — sparkle still appears but without rotation/scale animation
- **Combo popup:** Instant appear, fade out — popup appears instantly and fades after reading time
- **Hover states:** Instant color switch — instant color change, no transition

### Claude's Discretion
- Exact spring tension values (within "bouncy" feel)
- Particle burst shape and count for correct placement
- Combo popup typography and size
- Exact timing within roadmap ranges (200-250ms pickup, 150-200ms drop, etc.)

</decisions>

<specifics>
## Specific Ideas

- Pickup should feel like picking up a real vinyl — some weight but still responsive
- Combo is an achievement moment — should feel earned, not handed out easily
- Forgiving combo system keeps players engaged without feeling punished for one mistake

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-micro-interactions-animation*
*Context gathered: 2026-02-20*
