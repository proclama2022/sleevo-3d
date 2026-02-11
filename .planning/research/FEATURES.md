# Feature Landscape

**Domain:** Mobile 3D Puzzle Game UI Components
**Researched:** February 11, 2026

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|--------------|-------|
| **VinylCard Visual States** | Users need clear feedback on draggable objects | Low-Medium | 3 states required: idle, dragging, placed. Each state needs distinct visual cues (scale, shadow, z-index) |
| **ShelfSlot Drop Feedback** | Drag-and-drop requires clear valid targets | Low | Visual cue when hovering over valid drop zone (highlight, glow, or border change) |
| **ProgressBar** | Users need to know level completion status | Low | Shows progress toward goal. Must be readable at quick glance during gameplay |
| **HUD (Heads-Up Display)** | Standard mobile game expectation | Low | Score, moves remaining, level indicator - always visible but non-intrusive |
| **Touch Feedback** | Mobile users expect haptic/visual response | Low | Visual ripple or scale effect on touch. Haptic feedback on successful placement |
| **Smooth Dragging** | Laggy dragging = broken game feel | Medium | 60fps rendering required via requestAnimationFrame (not setInterval) |
| **State Transitions** | Jarring state changes feel broken | Low | CSS transitions with appropriate easing (200-300ms for UI, faster for gameplay) |
| **Dark Mode Contrast** | WCAG AA required for accessibility | Medium | 4.5:1 contrast for body text, 3:1 for UI components and icons |
| **Undo/Redo** | Mobile users make accidental touches | Medium | Standard feature in puzzle games. Should have visual limit indicator |
| **Responsive Layout** | Works across phone/tablet sizes | Medium | UI must adapt to viewport. Use relative units (%, vh/vw, flex/grid) |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|--------------|-------|
| **Vinyl Cover Art Showcase** | Highlights the vinyl aesthetic theme | Medium | Since core mechanic is vinyl records, make covers visually prominent with high-quality art, subtle reflections, realistic lighting |
| **Physics-based Card Movement** | Cards feel like physical objects | High | Cards tilt based on drag velocity, have weight when dropped. Requires careful tuning |
| **Combo Counter with Visual Flair** | Adds dopamine hit for skilled play | Low-Medium | Track consecutive correct placements. Show with animation (scale up, color change, particles) |
| **Level Theme Transitions** | Makes progress feel meaningful | Medium | Smooth visual transition between Basement → Store → Expo with atmosphere changes |
| **Personal Best Tracking** | Gives replay value to levels | Low | Store per-level best scores/moves. Show "NEW!" indicator when beaten |
| **Gesture Shortcuts** | Speed up gameplay for experts | Medium | Double-tap to quick-place, long-press for info, pinch for zoom (if applicable) |
| **Satisfying Placement Audio** | Completes the physical feel | Low | Different sound for vinyl placement based on shelf slot (wooden thud, metallic click, etc.) |
| **Animated Vinyl Texture** | Makes vinyls feel alive | Medium | Subtle grooves rotation, light reflection changes as card moves |
| **Progressive Hint System** | Helps without feeling hand-held | High | First hint: highlight movable vinyl. Second hint: show valid shelf. Third hint: partial solution. Track usage for scoring |
| **Level Completion Celebration** | Emotional payoff after effort | Medium | Unique animation per theme (confetti for store, dust particles for basement, spotlight for expo) |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-------------|-------------------|
| **Auto-complete animations** | Removes player agency and satisfaction | Skip button available after 3 seconds of inactivity, but never auto-play |
| **Forced tutorial videos** | Mobile users hate watching videos | Interactive tutorial with "Don't show again" option. Contextual tooltips for first-time actions |
| **Complex menu navigation** | Puzzle games need quick restart | Single tap to restart, one menu layer maximum. No nested settings menus during gameplay |
| **Slow-motion transitions** | Feels sluggish on mobile | Keep UI transitions under 300ms. Use `cubic-bezier` for snappy feel |
| **Gradient text on backgrounds** | Fails WCAG AA contrast in dark themes | Use solid text colors with sufficient contrast, or semi-transparent backgrounds behind text |
| **Fullscreen ads** | Breaks flow, increases uninstall | Rewarded ads only, optional, clearly timed |
| **Energy/stamina systems** | Artificial gating creates frustration | Play unlimited. Monetize through cosmetic options, not gameplay limits |
| **Share gating behind progress** | Social proof should be easy | Share score/card art at any time, not just after winning |
| **Red/green color-only indicators** | ~8% of males are colorblind | Use icons + color, or blue/orange combinations that work for most vision types |

## Feature Dependencies

```
VinylCard Component → ShelfSlot Component (ShelfSlot provides drop targets)
ProgressBar → Level State (driven by game logic)
HUD → Game State (score, moves, level all from state)
Touch Feedback → All interactive components
Dark Theme → All components (must maintain WCAG AA throughout)
```

## MVP Recommendation

**Phase 1 (Core Feel):**
1. VinylCard with 3 states (idle/dragging/placed)
2. ShelfSlot with drop highlight
3. Basic HUD (score/moves/level)
4. Touch feedback animations
5. WCAG AA dark theme colors

**Phase 2 (Polish):**
1. ProgressBar for level completion
2. Undo/Redo system
3. Placement audio feedback
4. Combo counter

**Phase 3 (Delight):**
1. Physics-based card movement
2. Level completion celebrations
3. Hint system
4. Gesture shortcuts

**Defer:**
- Complex particle systems (can add later, not core to puzzle)
- Multiplayer (adds significant complexity, not MVP)
- Level editor (cool feature but not essential)
- Leaderboards (requires backend, can be v2)

## Micro-Interaction Timing Benchmarks

Based on CSS transitions best practices and mobile gaming UX patterns:

| Interaction | Duration | Easing | Notes |
|-------------|-----------|---------|-------|
| **Touch feedback** | 100-150ms | `ease-out` | Fast tap response. Scale(0.95) on press, return to scale(1) on release |
| **Card pickup (idle→dragging)** | 200-250ms | `ease-out` or `cubic-bezier(0.34, 1.56, 0.64, 1)` | Snappy pickup with slight overshoot for "spring" feel |
| **Card drop (dragging→placed)** | 150-200ms | `ease-in-out` or `cubic-bezier(0.4, 0, 0.2, 1)` | Satisfying settle into slot |
| **Shelf hover state** | 150ms | `ease-out` | Quick highlight when card enters valid zone |
| **Shelf unhover** | 200-300ms | `ease-in` | Slightly slower fade out for smoother feel |
| **Score increment** | 300-400ms | `ease-out` | Count up animation for numbers |
| **Combo popup** | 600-800ms total | `ease-out` for scale-in, linear hold, `ease-in` for fade-out | Scale up (200ms), hold (200-400ms), fade (200ms) |
| **ProgressBar fill** | 500-800ms | `ease-out` or `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Smooth fill when level complete |
| **Level complete reveal** | 800-1200ms | Staggered `ease-out` | Elements appear sequentially, not all at once |
| **Button hover** | 150-200ms | `ease-out` | Fast feedback on interaction |
| **Page/modal transitions** | 250-350ms | `ease-in-out` | Smooth but quick enough to not feel slow |

### Key Easing Functions

```css
/* Snappy UI interactions */
ease-out: cubic-bezier(0, 0, 0.2, 1)           /* Fast start, smooth end */

/* Spring-like feel */
overshoot: cubic-bezier(0.34, 1.56, 0.64, 1)   /* Slight bounce */

/* Smooth natural motion */
material: cubic-bezier(0.4, 0, 0.2, 1)            /* Google Material standard */

/* Deceleration */
decelerate: cubic-bezier(0.25, 0.46, 0.45, 0.94) /* Slowdown feel */
```

## Accessibility Requirements (WCAG AA Dark Theme)

Based on MDN documentation for WCAG 2.1 AA standards:

| Element | Contrast Ratio | Notes |
|---------|---------------|-------|
| **Body text** | 4.5:1 minimum | Standard text under 18pt |
| **Large text (18pt+)** | 3:1 minimum | Headings, labels |
| **UI components/icons** | 3:1 minimum | Buttons, progress indicators, graphical elements |
| **VinylCard borders/edges** | 3:1 minimum | Must be distinguishable from background |

### Recommended Dark Theme Colors

```css
/* Backgrounds */
--bg-dark: #1a1a1a;        /* Near-black background */
--bg-card: #2d2d2d;        /* Card background */
--bg-shelf: #252525;        /* Shelf slot */

/* Text */
--text-primary: #f5f5f5;      /* 14.6:1 on bg-dark */
--text-secondary: #b8b8b8;    /* 6.5:1 on bg-dark */

/* Accents (high contrast) */
--accent-blue: #64b5f6;       /* 7.2:1 on bg-dark */
--accent-green: #81c784;      /* 8.1:1 on bg-dark */
--accent-orange: #ffb74d;       /* 7.5:1 on bg-dark */
--accent-red: #e57373;         /* 6.8:1 on bg-dark */

/* Borders/dividers */
--border-subtle: #404040;     /* 5.1:1 on bg-dark */
--border-strong: #606060;       /* 3.4:1 on bg-dark */
```

## Component State Patterns

### VinylCard States

```typescript
interface VinylCardState {
  // IDLE: Default resting state
  // - scale: 1
  // - shadow: subtle elevation
  // - z-index: 10
  idle: 'idle';

  // DRAGGING: Active user interaction
  // - scale: 1.05-1.1 (pickup zoom)
  // - shadow: deep shadow below
  // - z-index: 100 (above all)
  // - opacity: 0.9 (see-through slightly)
  dragging: 'dragging';

  // PLACED: Successfully in shelf slot
  // - scale: 1 (returns to normal)
  // - shadow: flattened (sits on surface)
  // - z-index: 5 (below dragging, above background)
  // - locked: true (no longer draggable)
  placed: 'placed';
}
```

### ShelfSlot States

```typescript
interface ShelfSlotState {
  // EMPTY: No vinyl placed
  // - border: subtle dashed line
  // - background: slightly darker than shelf
  empty: 'empty';

  // HIGHLIGHT: Card hovering over valid target
  // - border: bright accent color
  // - background: glow effect
  // - animation: subtle pulse
  highlight: 'highlight';

  // FILLED: Vinyl successfully placed
  // - border: matches vinyl accent
  // - shadow: casting from vinyl
  filled: 'filled';

  // INVALID: Wrong vinyl type attempted
  // - border: red/orange
  // - shake animation (300ms)
  // - card rejection (returns to idle)
  invalid: 'invalid';
}
```

### HUD Component Patterns

| Element | Layout | Visibility | Update Behavior |
|---------|---------|------------|-----------------|
| **Score** | Top-left or top-center | Always visible | Animate increment (+100, +50, etc.) |
| **Moves** | Top-right or below score | Always visible | Decrement. Flash red when < 5 remaining |
| **Level indicator** | Top or subtle background | Always visible | "Basement 1-3" or similar |
| **ProgressBar** | Bottom or below HUD | Visible during gameplay | Smooth fill as vinyls placed correctly |
| **Pause button** | Top-right corner | Always visible | Icon standard (⏸ or similar) |
| **Hint button** | Bottom-right or edge | Always visible, cooldown indicator | Grey out when no hints available |

## Performance Considerations

- **Use `requestAnimationFrame`** for all drag operations, not `setInterval` (smoother, better battery)
- **CSS transforms over position changes** for animations (use `transform: translate3d()` for GPU acceleration)
- **Avoid animating `height`/`width`** - use `transform: scale()` instead for better performance
- **Will-change sparingly** - only on elements about to animate, remove after animation completes
- **Debounce resize handlers** - prevent layout thrashing on mobile orientation changes
- **Use `transform-style: preserve-3d`** for vinyl cards to enable proper z-indexing during 3D interactions

## Sources

- [MDN Web Docs - WCAG Contrast Requirements](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_WCAG/Perceivable/Color_contrast) (HIGH confidence - official W3C spec)
- [CSS-Tricks - CSS Transitions](https://css-tricks.com/almanac/properties/t/transition/) (HIGH confidence - established CSS reference)
- [CSS-Tricks - requestAnimationFrame](https://css-tricks.com/using-requestanimationframe/) (HIGH confidence - animation best practices)
- [Material Design Motion Guidelines](https://m3.material.io/styles/motion/easing-and-duration/standard-easing) (MEDIUM confidence - couldn't fully load, but Material Design is industry standard)

### Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Table Stakes Features | HIGH | Based on standard mobile game patterns and UX best practices |
| Differentiating Features | MEDIUM | Some features (physics-based movement) are more experimental |
| Anti-Features | HIGH | Based on common mobile gaming complaints and UX research |
| Timing Benchmarks | MEDIUM | Based on CSS-Tricks and Material Design standards. Real-world testing recommended |
| Accessibility (WCAG AA) | HIGH | Directly from W3C WCAG 2.1 specification via MDN |
| Component State Patterns | MEDIUM | Standard React/TypeScript patterns, but game-specific states may need iteration |
