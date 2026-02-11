# v1 Requirements

**Project:** Sleevo UI/UX Redesign
**Target:** Warm "Vinyl Store Sunday Morning" aesthetic with WCAG AA contrast

---

## Design System

### DESIGN-01: Color Palette
User can experience warm vintage vinyl store aesthetic through consistent color palette:
- **Primary Background:** `#24180f` (warm ink - dark roasted coffee)
- **Secondary Background:** `#3d2c1f` (soft ink - aged paper shadows)
- **Primary Accent:** `#ff6c3f` (main accent - sunset orange)
- **Secondary Accent:** `#2db2d7` (ice accent - vintage teal)
- **Text Primary:** `#fff8f0` (cream white)

### DESIGN-02: Typography Scale
User can read UI text at comfortable sizes:
- **Display Font:** 'Bebas Neue', 44-60px (headings, game title)
- **UI Font:** 'Manrope', 12-16px (labels, buttons, HUD)
- **Monospace:** 'JetBrains Mono', 10-12px (scores, numbers)

### DESIGN-03: 8px Spacing Grid
User experiences consistent spacing throughout UI:
- Base unit: 8px
- Spacing scale: 4px (0.5x), 8px (1x), 16px (2x), 24px (3x), 32px (4x)

### DESIGN-04: Responsive Breakpoints
User can play on any mobile device size:
- **Compact:** <375px (iPhone SE, small Android)
- **Medium:** 375-414px (iPhone 14, Pixel)
- **Large:** >414px (iPhone Pro Max, tablets)

### DESIGN-05: WCAG AA Dark Theme
User with visual impairments can read all text:
- Body text contrast: ≥4.5:1
- Large text contrast: ≥3:1
- UI components: ≥3:1

---

## UI Components

### COMP-01: VinylCard Component
User can see vinyl record with clear visual state feedback:
- **Idle State:** Scale 1, subtle shadow, z-index 10
- **Dragging State:** Scale 1.05, deep shadow, z-index 100, slight rotation
- **Placed State:** Scale 1, flattened shadow, z-index 5, locked

### COMP-02: ShelfSlot Component
User can identify valid drop targets:
- **Empty State:** Subtle dashed border, darker background
- **Highlight State:** Bright accent border, glow effect, pulse animation
- **Filled State:** Border matches vinyl accent, shadow cast
- **Invalid State:** Red/orange border, shake animation, card rejection

### COMP-03: ProgressBar Component
User can see level completion progress:
- Visual fill from 0% to 100%
- Smooth animation (500-800ms) on progress change
- Current/total display (e.g., "3/8")

### COMP-04: HUD Component
User can see game state at all times:
- **Level indicator:** Current level number
- **Score:** Animated increment on points earned
- **Progress:** Current vinyls placed / total required
- **Moves:** (optional) Remaining moves indicator

### COMP-05: Touch Feedback
User can feel responsive touch interactions:
- Visual ripple or scale effect on touch (100-150ms)
- Haptic feedback on successful placement
- Active/pressed states on all interactive elements

---

## Micro-Interactions

### MOTION-01: Card Pickup Animation
User experiences satisfying card pickup:
- Duration: 200-250ms
- Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring overshoot)
- Transform: Scale up 1.05, slight rotation

### MOTION-02: Card Drop Animation
User experiences satisfying card placement:
- Duration: 150-200ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard)
- Transform: Scale back to 1, settle into slot

### MOTION-03: Shelf Hover State
User sees clear drop target indication:
- Duration: 150ms (enter), 200-300ms (exit)
- Easing: `ease-out` (enter), `ease-in` (exit)
- Visual: Border highlight, subtle glow

### MOTION-04: Score Increment
User sees points added with celebration:
- Duration: 300-400ms
- Easing: `ease-out`
- Animation: Number count up, scale pulse

### MOTION-05: Combo Popup
User receives positive feedback for consecutive correct placements:
- Total duration: 600-800ms
- Phase 1: Scale in (200ms, `ease-out`)
- Phase 2: Hold (200-400ms)
- Phase 3: Fade out (200ms, `ease-in`)

---

## Architecture

### ARCH-01: React UI Layer
UI is built with React components:
- styled-components for theming
- ThemeProvider with design tokens
- Component-scoped styles

### ARCH-02: Game State Bridge
UI and game state stay synchronized:
- Zustand store for game state
- GameBridge service for Two-way communication
- UI re-renders on state change

### ARCH-03: Canvas Event Layering
UI overlay doesn't block game interactions:
- `pointer-events: none` on overlay container
- `pointer-events: all` on interactive elements only
- Three.js canvas at z-index 1, UI at z-index 10+

---

## Accessibility

### A11Y-01: Touch Targets
User can tap controls with thumb:
- Minimum touch target: 44x44px (iOS) / 48x48px (Android)
- Invisible padding expands visual button hit areas
- Text labels alongside icons for discoverability

### A11Y-02: Screen Reader Support
User with screen reader can navigate:
- ARIA labels on all interactive elements
- Live regions for score/progress updates
- Semantic HTML structure

---

## Anti-Patterns (Explicit Exclusions)

These are explicitly NOT in scope:

| Anti-Pattern | Why Excluded |
|--------------|--------------|
| Blue/purple AI gradients | User explicitly rejected generic AI style |
| Generic glassmorphism | User explicitly rejected generic AI style |
| Uniform border-radius | Contradicts vintage aesthetic |
| Diffuse shadows | Contradicts vintage aesthetic |
| Material Design icons | Contradicts vintage aesthetic |
| Auto-complete animations | Removes player agency |
| Light theme | User explicitly wants dark theme only |

---

## Traceability

| Phase | Requirements |
|-------|--------------|
| Phase 1: Foundation | DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05, ARCH-01 |
| Phase 2: Components | COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, A11Y-01, A11Y-02 |
| Phase 3: Polish | MOTION-01, MOTION-02, MOTION-03, MOTION-04, MOTION-05, ARCH-02, ARCH-03 |

---

*Requirements defined: 2026-02-11*
