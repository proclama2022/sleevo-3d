# Sleevo UI/UX Redesign - Roadmap

**Project:** Sleevo Vinyl Shop Manager
**Created:** 2026-02-11
**Mode:** Standard (5-8 phases)
**Status:** Phase 1 Complete, Phase 2 Planned

---

## Overview

| Metric | Value |
|--------|-------|
| Total Phases | 5 |
| Total Requirements | 16 |
| Est. Complexity | Medium |

---

## Phase 1: Foundation & Design System

**Goal:** Establish design tokens, typography, and theming infrastructure for the "vinyl store Sunday morning" aesthetic.

**Requirements:** DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05, ARCH-01

**Deliverables:**
- JSON design tokens file with color palette (5 HEX codes)
- Typography scale configuration
- 8px spacing grid system
- Responsive breakpoint definitions
- WCAG AA contrast validation
- styled-components ThemeProvider setup

**Success Criteria:**
1. All color combinations pass WCAG AA contrast ratios
2. Typography renders correctly across all breakpoints
3. Spacing follows 8px grid consistently
4. Theme object is type-safe and consumable by components

**Priority:** P0 - Must complete before any component work

**Plans:** 5 plans (Wave 1: 01, 02a, 03a | Wave 2: 02b, 03b)

- [x] 01-foundation-design-system-01-PLAN.md — Color and spacing design tokens with WCAG AA validation
- [x] 01-foundation-design-system-02a-PLAN.md — Typography and breakpoint token JSON files
- [x] 01-foundation-design-system-02b-PLAN.md — Google Fonts import and TypeScript token exports
- [x] 01-foundation-design-system-03a-PLAN.md — Install dependencies and create theme structure
- [x] 01-foundation-design-system-03b-PLAN.md — Complete theme, ThemeProvider, GlobalStyles, App.tsx integration

---

## Phase 2: Core UI Components

**Goal:** Update existing components to match locked user decisions: vinyl+sleeve card shape, text overlay on art, recessed shelf slots with sparkle, transparent HUD with centered gauge.

**Requirements:** COMP-01, COMP-02, COMP-03, COMP-04, A11Y-01

**Deliverables:**
- VinylCard component with vinyl+sleeve shape, text overlay, 100px size
- ShelfSlot component with recessed filled state, sparkle effect
- HUD component with transparent bar, centered gauge, no level name
- ProgressBar component (circular SVG gauge)
- Touch target validation (44x44px minimum)

**Success Criteria:**
1. VinylCard shows vinyl disc offset from sleeve with text overlaid on art
2. ShelfSlot provides recessed filled state and sparkle on correct placement
3. HUD displays Score/Timer/Moves with centered gauge, no level name
4. All touch targets meet 44x44px minimum
5. All feedback uses shape + color for color blind accessibility

**Priority:** P0 - Core gameplay UI

**Plans:** 5 plans (Wave 1: 01, 02, 03 | Wave 2: 04 | Wave 3: 05)

- [x] 02-01-PLAN.md — Update VinylCard: vinyl+sleeve shape, text overlay, 100px size
- [x] 02-02-PLAN.md — Update ShelfSlot: recessed filled state, sparkle effect
- [ ] 02-03-PLAN.md — Update HUD: transparent bar, centered gauge, remove level name
- [ ] 02-04-PLAN.md — Accessibility verification: touch targets, shape+color, reduced motion
- [ ] 02-05-PLAN.md — Human verification checkpoint

---

## Phase 3: Micro-Interactions & Animation

**Goal:** Implement satisfying micro-interactions with exact timing specifications.

**Requirements:** MOTION-01, MOTION-02, MOTION-03, MOTION-04, MOTION-05

**Deliverables:**
- Card pickup animation (200-250ms, spring easing)
- Card drop animation (150-200ms, Material easing)
- Shelf hover state animation (150ms in, 200-300ms out)
- Score increment animation (300-400ms)
- Combo popup animation (600-800ms total)

**Success Criteria:**
1. Card pickup feels springy and responsive
2. Card drop settles satisfyingly into slot
3. Hover states provide instant feedback
4. Score increment celebrates points earned
5. Combo popup rewards consecutive correct placements

**Priority:** P1 - Polish layer

**Plans:** To be created

---

## Phase 4: Architecture Integration

**Goal:** Connect React UI layer to existing Three.js game with state synchronization.

**Requirements:** ARCH-02, ARCH-03, COMP-05

**Deliverables:**
- Zustand store for game state
- GameBridge service for UI <-> Game communication
- Canvas event layering (pointer-events configuration)
- Touch feedback with haptic support

**Success Criteria:**
1. UI and game state stay synchronized
2. Game interactions work with UI overlay present
3. Score/progress updates in real-time
4. Touch feedback feels responsive

**Priority:** P1 - Required for functional game

**Plans:** To be created

---

## Phase 5: Accessibility & Final Polish

**Goal:** Ensure full accessibility compliance and mobile optimization.

**Requirements:** A11Y-02, responsive testing, performance validation

**Deliverables:**
- Screen reader support (ARIA labels, live regions)
- Multi-device testing (compact/medium/large)
- Performance profiling (60fps maintained)
- Bundle size optimization

**Success Criteria:**
1. Screen reader navigates all UI elements
2. Game works on all target device sizes
3. Animations maintain 60fps on mobile
4. Bundle size increase <50KB

**Priority:** P2 - Quality assurance

**Plans:** To be created

---

## Dependency Graph

```
Phase 1 (Foundation) ————————┐
    ↓                          │
Phase 2 (Components) ────────┤
    ↓                          │
Phase 3 (Interactions)         │
    ↓                          ↓
Phase 4 (Integration) ←────────┘
    ↓
Phase 5 (Polish)
```

---

## Risk Mitigation

| Risk | Mitigation | Phase |
|------|------------|-------|
| Vintage overload | 80/20 rule, restraint principles | Phase 1 |
| Contrast failure | WCAG validation in design tokens | Phase 1 |
| AI gradient hangover | Code review checklist | Phase 2 |
| Touch targets too small | Automated size testing | Phase 2 |
| Canvas event blocking | pointer-events configuration | Phase 4 |
| Performance drops | Lighthouse >90, 60fps requirement | Phase 5 |

---

## Next Steps

1. **Now:** Run `/gsd:execute-phase 02-core-ui-components` to execute Phase 2 plans
2. **After Phase 2:** Proceed to Phase 3 micro-interactions
3. **Recommended:** Use `/clear` between phases for fresh context

---

*Roadmap created: 2026-02-11*
*Phase 1 planned: 2026-02-11*
*Phase 1 revised: 2026-02-11 (split into 5 plans with wave structure)*
*Phase 2 planned: 2026-02-19 (5 plans, 3 waves)*
*Total requirements mapped: 16*
*All v1 requirements covered: Y*
