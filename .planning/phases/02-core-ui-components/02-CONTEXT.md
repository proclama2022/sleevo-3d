# Phase 2: Core UI Components - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the 4 core visual components players see and touch: VinylCard (draggable records), ShelfSlot (drop targets), ProgressBar (level progress), and HUD (score/moves/level). Vintage styling, accessibility (44px touch targets), clear visual hierarchy. Animation timing is Phase 3 — this phase is visual states and structure.

</domain>

<decisions>
## Implementation Decisions

### VinylCard Visual Treatment
- **Balanced art + info (50/50)** — Equal space for album art and text info
- **Vinyl + sleeve shape** — Slightly offset to show sleeve edge (not just square)
- **Standard 100px size** — Good balance on mobile, readable text
- **Text overlay on art** — Genre/year/title overlaid on bottom of art area (not below or beside)
- **Color-coded states** — Visual distinction between idle, dragging, placed via color/border

### ShelfSlot Feedback Clarity
- **Wood grain texture** — Warm wooden shelf look for empty slots (vinyl store aesthetic)
- **Pulsing glow for drop targets** — Green for valid, red for invalid; animated pulse draws attention
- **Immediate feedback** — Glow appears on all slots as soon as drag starts
- **Recessed filled state** — Placed vinyl appears inset into the shelf (realistic depth)
- **Sparkle/glimmer on correct** — Brief sparkle effect rewards correct placement

### HUD Layout & Hierarchy
- **Top bar, full width** — Fixed at top of screen
- **Transparent bar style** — Semi-transparent, game shows through
- **Circular gauge centered** — Level progress gauge as focal point in center of HUD
- **Three elements displayed:** Score, Timer, Moves count (no Level name)
- **Balanced layout** — Elements arranged around centered gauge

### Accessibility Depth
- **44x44px minimum for ALL elements** — Every touchable element meets minimum touch target
- **Minimal screen reader labels** — Basic component labels only (visual game)
- **Honor reduced motion** — All animations respect `prefers-reduced-motion` system setting
- **Shape + color for feedback** — Valid/invalid indicators use both (color blind friendly)

### Claude's Discretion
- Exact typography sizing for card overlay text
- Specific color values for valid/invalid glow (green/red)
- Circular gauge visual design (thickness, colors, fill direction)
- Sparkle/glimmer effect style and duration
- Wood grain texture implementation (CSS or image)

</decisions>

<specifics>
## Specific Ideas

- Vinyl + sleeve offset gives tactile, realistic record feel
- Wood grain texture reinforces "vinyl store Sunday morning" warmth
- Sparkle on correct placement is satisfying feedback
- Transparent HUD keeps focus on the game area
- Centered circular gauge as visual anchor

</specifics>

<deferred>
## Deferred Ideas

- Animation timing and easing curves (spring, bounce) — Phase 3
- Complex screen reader navigation — out of scope, visual game
- Keyboard/TV remote navigation — touch-first design
- Level name display — removed from HUD per user decision

</deferred>

---

*Phase: 02-core-ui-components*
*Context gathered: 2026-02-19 (updated from 2026-02-11)*
