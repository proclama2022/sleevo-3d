# Phase 2: Core UI Components - Context

**Gathered:** 2026-02-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the 4 core visual components players see and touch: VinylCard (draggable records), ShelfSlot (drop targets), ProgressBar (level progress), and HUD (score/moves/level). Vintage styling, accessibility (44px touch targets), clear visual hierarchy. Animation timing is Phase 3 — this phase is visual states and structure.

</domain>

<decisions>
## Implementation Decisions

### VinylCard Visual Treatment
- **Balanced art + info** — Album art prominent but genre label, year/decade, and title text visible
- **Modern vintage styling** — Clean borders, subtle warmth, modern proportions (not aged/worn look)
- **Color differentiation for states** — Visual distinction between idle, dragging, placed via color shift/border highlight (not just elevation)

### ShelfSlot Feedback Clarity
- **Realistic shelf look** — Filled slots show vinyl clearly; empty slots look like wood/metal shelf space
- **Color-coded glow for drop targets** — Green glow for valid, red glow for invalid
- **Immediate feedback** — Glow appears on all slots as soon as drag starts (not on proximity)
- **Success indicator** — Correctly placed vinyl shows subtle check mark or "correct" indicator

### HUD Layout & Hierarchy
- **Balanced row** — Level name, score, timer, moves count equally weighted horizontally
- **Top bar, full width** — Fixed at top of screen
- **Circular gauge for progress** — Level progress shown as circular gauge that fills clockwise (not horizontal bar)
- **Four elements displayed:** Level name, Score, Timer, Moves count

### Accessibility Depth
- **Minimal A11y** — Basic labels only, visual game primarily
- **Touch-focused** — No visible focus ring (mobile-first, touch interaction)
- **Honor reduced motion** — All animations respect `prefers-reduced-motion`, fall back to instant transitions
- **Shape + color for feedback** — Valid/invalid indicators use both shape and color (color blind friendly)

### Claude's Discretion
- Exact typography sizing for card text
- Specific color values for valid/invalid glow
- Circular gauge visual design (thickness, colors)
- Check mark/success indicator style
- Transition timing between states (within Phase 2 scope — not animation "feel")

</decisions>

<specifics>
## Specific Ideas

- Modern vintage = clean but warm, not aged or distressed
- Circular progress gauge is a distinctive choice — should feel like a vintage meter
- Balanced HUD means no single element dominates — clean information display
- Immediate glow on drag start gives instant feedback about all possible moves

</specifics>

<deferred>
## Deferred Ideas

- Animation feel and timing (spring easing, bounce, etc.) — Phase 3
- Complex screen reader navigation — out of scope, visual game
- Keyboard/TV remote navigation — touch-first design

</deferred>

---

*Phase: 02-core-ui-components*
*Context gathered: 2026-02-11*
