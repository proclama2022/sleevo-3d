# Sleevo UI/UX Redesign

## What This Is

Complete visual redesign of "Sleevo - Vinyl Shop Manager", a 3D puzzle game where players sort vinyl records on shelves. This redesign transforms the UI from a dark, generic AI-style to a warm, authentic "vinyl store Sunday morning" aesthetic that emphasizes vinyl covers and creates clear visual hierarchy for mobile gaming.

## Core Value

**Make vinyl covers the visual star** - Players must instantly recognize vinyl genres and feel the warmth of a real record store. Everything else supports this core experience.

## Requirements

### Validated

- ✓ 3D rendering with Three.js — existing
- ✓ Drag-drop vinyl sorting mechanics — existing
- ✓ Single row shelf layout (1×8 columns) — existing
- ✓ Genre-based puzzle logic — existing
- ✓ Mobile touch support — existing
- ✓ Audio system with procedural music/SFX — existing

### Active

- [ ] **UI-01**: Color palette with "vinyl store Sunday morning" theme (5 specific HEX codes)
- [ ] **UI-02**: Typography scale (3 fonts with specific pixel sizes)
- [ ] **UI-03**: 8px spacing grid system
- [ ] **UI-04**: 3 responsive mobile layouts (compact <375px, medium 375-414px, large >414px)
- [ ] **UI-05**: VinylCard component with 3 states (idle, dragging, placed)
- [ ] **UI-06**: ShelfSlot component with visual feedback
- [ ] **UI-07**: ProgressBar component for level progress
- [ ] **UI-08**: HUD component (score, moves, level info)
- [ ] **UI-09**: 5 micro-interactions with exact timing (ms) and easing
- [ ] **UI-10**: WCAG AA contrast compliance (dark theme)
- [ ] **UI-11**: Design tokens as JSON
- [ ] **UI-12**: styled-components CSS-in-JS implementation

### Out of Scope

- React migration (current: vanilla TypeScript + Three.js) — stay with current stack
- Light theme — user explicitly wants dark theme only
- Desktop-first layouts — focus is mobile-first
- Multi-row shelves — single row mode only

## Context

### Current Problems to Solve

1. **UI troppo scura e poco contrastata** - Vinyls don't stand out well against dark background
2. **Mobile layout condensato verso il basso** - Elements too small, compressed toward bottom
3. **Nessuna gerarchia visiva chiara** - HUD, shelves, and vinyls lack clear visual priority
4. **Design "generico AI"** - Lacks personality and vinyl/vintage theme

### Anti-Patterns to Avoid

- NO gradienti blu/viola standard AI
- NO glassmorphism generico
- NO bordi radius uniformi su tutto
- NO ombre diffuse
- NO iconography Material Design

### Target Aesthetic

**"Vinyl Store Sunday Morning"** - Warm, vintage, wood tones. The feeling of walking into a cozy record shop on a quiet morning with sunlight streaming through dusty windows.

### Design Deliverables Required

1. **JSON Design Tokens** - Colors, spacing, typography as structured data
2. **CSS-in-JS (styled-components)** - For each UI component
3. **ASCII Wireframes** - For each breakpoint layout
4. **Prioritized Implementation List** - P0/P1/P2 categories

## Constraints

- **Tech Stack**: React + Three.js + styled-components (as specified in requirements)
- **Theme**: Dark theme only, but with WCAG AA contrast
- **Platform**: Mobile-first responsive design
- **Performance**: Must maintain 60fps on mobile devices

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| styled-components over plain CSS | Component-scoped styles, theming support | — Pending |
| 8px grid system | Consistent spacing, easier responsive | — Pending |
| Mobile-first breakpoints | Primary use case is mobile gaming | — Pending |
| WCAG AA contrast | Accessibility while keeping dark theme | — Pending |

---
*Last updated: 2026-02-11 after UI/UX redesign initialization*
