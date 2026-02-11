# Project Research Summary

**Project:** Sleevo UI/UX Redesign - Mobile Game UI with Design Tokens
**Domain:** Mobile 3D Puzzle Game UI Components
**Researched:** 2026-02-11
**Confidence:** HIGH

## Executive Summary

Sleevo is a mobile 3D puzzle game built with vanilla Three.js and TypeScript. The current game has functional gameplay (vinyl record placement on shelves) but uses a generic dark UI overlay built with vanilla HTML/CSS. Research indicates that experts build modern game UIs with React-based component systems, styled-components for theming, and centralized design tokens for consistency. The recommended approach involves overlaying a React UI layer on top of the existing Three.js canvas, using a GameBridge pattern with Zustand for state management, and migrating from generic dark styling to a warm vintage vinyl aesthetic with WCAG AA contrast compliance.

The primary technical risk is performance - styled-components can introduce runtime overhead that degrades game frame rates. This is mitigated by keeping the Three.js game layer unchanged, using vanilla CSS for game-critical UI, and applying styled-components selectively to the UI overlay. The primary UX risk is "vintage overload" - applying warm textures and ornate details too uniformly, which creates visual noise and cognitive overload. This is mitigated by following the 80/20 rule (80% clean/functional, 20% vintage/accent) and reserving ornate details for headers and special moments, not every UI element.

## Key Findings

### Recommended Stack

**Core technologies:**
- **styled-components ^6.0.0** — CSS-in-JS library with native TypeScript support, theme prop API, and zero-runtime CSS injection overhead when using babel plugin
- **React ^18.3.0** — Required for styled-components; enables component-based architecture for game UI
- **Zustand** — Lightweight state management for bridging game state between vanilla TypeScript (Three.js) and React UI
- **W3C Design Tokens Format + style-dictionary ^3.0.0** — Platform-agnostic token schema and build tool for transforming JSON tokens to CSS variables

**Build tools:**
- **babel-plugin-styled-components ^2.0.0** or **@swc/plugin-styled-components ^1.0.0** — Required for production builds (displayName, minification, dead code elimination)

**Integration pattern:** Hybrid mounting - React root alongside existing Three.js canvas. React manages UI overlay with `pointer-events: none` on container, Three.js manages game layer.

### Expected Features

**Must have (table stakes):**
- VinylCard Visual States (idle/dragging/placed) — users need clear feedback on draggable objects
- ShelfSlot Drop Feedback — drag-and-drop requires clear valid targets
- HUD (Heads-Up Display) — standard mobile game expectation for score/moves/level
- Touch Feedback — mobile users expect haptic/visual response
- WCAG AA Dark Theme — 4.5:1 contrast required for body text
- Undo/Redo — mobile users make accidental touches
- Responsive Layout — works across phone/tablet sizes

**Should have (competitive):**
- Vinyl Cover Art Showcase — highlights vinyl aesthetic theme
- Physics-based Card Movement — cards tilt based on drag velocity
- Combo Counter with Visual Flair — dopamine hit for skilled play
- Level Theme Transitions — smooth visual transitions between Basement/Store/Expo
- Animated Vinyl Texture — subtle grooves rotation, light reflection changes
- Progressive Hint System — helps without feeling hand-held

**Defer (v2+):**
- Complex particle systems — can add later, not core to puzzle
- Multiplayer — adds significant complexity, not MVP
- Level editor — cool feature but not essential
- Leaderboards — requires backend, can be v2

### Architecture Approach

**System:** Two-layer architecture with React UI overlay on top of vanilla TypeScript Three.js game. Communication flows through GameBridge service with Zustand store as single source of truth.

**Major components:**
1. **UI Layer (React)** — TopBar/HUD, Controls, Tutorial/Modals built with styled-components
2. **GameBridge (Zustand)** — State synchronization layer connecting vanilla GameManager to React components
3. **Three.js Game Layer** — Existing GameManager, InputController, SceneRenderer remain unchanged
4. **Design Token Pipeline** — JSON tokens transformed to CSS variables via style-dictionary

**Key patterns:**
- Hybrid mounting: React root and Three.js canvas initialized in parallel in `main.ts`
- State bridge: GameManager emits events → GameBridge callbacks → Zustand store → React re-render
- Theme provider: styled-components ThemeProvider wraps entire UI overlay with warm vintage colors

### Critical Pitfalls

**Top 5 from PITFALLS.md:**

1. **"Everything Vintage" Overload** — Apply vintage treatments selectively (80% clean/functional, 20% vintage/accent), reserve ornate details for headers and special moments
2. **Dark Theme Contrast Collapse** — Test ALL text combinations against WCAG AA (4.5:1 for normal text), add 0.5 contrast ratio cushion above minimum, test in direct sunlight
3. **The "AI Gradient" Hangover** — Ban gradient blurs entirely, use vintage-specific techniques (duotone, halftone, paper textures), limit gradients to 2 colors max with 0% blur
4. **Mobile Touch Target Erosion** — Minimum 44x44px (iOS) / 48x48px (Android), add invisible padding around visual buttons, test with real thumbs
5. **Performance Death by Styled Components** — Keep vanilla CSS for game UI, use styled-components selectively for overlay, test on low-end devices, monitor bundle size

**Technical debt patterns to avoid:**
- Hardcoded colors in CSS instead of design tokens
- `!important` wars (only acceptable for utility classes)
- Backdrop-filter blur on everything (performance tank)
- Importing full icon libraries (use tree-shakeable only)

## Implications for Roadmap

Based on combined research, recommended 3-phase structure:

### Phase 1: Foundation & Design System

**Rationale:** Design tokens must come first to avoid hardcoded colors and establish WCAG AA contrast from day one. Pitfall research emphasizes that vintage aesthetics require upfront restraint principles to prevent over-decoration.

**Delivers:**
- Design token structure (colors, spacing, typography) following W3C format
- Warm vintage color palette with WCAG AA contrast compliance
- style-dictionary build pipeline
- styled-components theme configuration
- 8px grid system implementation
- Aesthetic decision framework (when to be vintage vs. modern)

**Addresses:**
- Features: Dark Theme Contrast, Responsive Layout
- Pitfalls: Dark Theme Contrast Collapse, Professional/Vintage Confusion, Hardcoded Colors

**Uses:** styled-components, W3C Design Tokens Format, style-dictionary

### Phase 2: UI Component Library

**Rationale:** After tokens are established, build reusable components implementing table stakes features. This phase requires touch target validation and gradient avoidance code review checkpoints.

**Delivers:**
- VinylCard component with 3 states (idle/dragging/placed)
- ShelfSlot component with drop feedback
- TopBar/HUD component (score, level, progress)
- Controls component (restart, undo, settings buttons)
- Common UI primitives (Button, Card, Modal)
- Touch feedback animations
- Micro-interaction timing implementation

**Addresses:**
- Features: VinylCard Visual States, ShelfSlot Drop Feedback, HUD, Touch Feedback
- Pitfalls: Touch Target Erosion, AI Gradient Hangover, Mobile Touch Target Erosion

**Uses:** React, styled-components, design tokens

**Avoids:** Gradient backgrounds, insufficient touch targets, over-decoration

### Phase 3: Integration & Polish

**Rationale:** Connect UI to game state through GameBridge and add polish features. This is where performance monitoring is critical to avoid styled-components overhead.

**Delivers:**
- GameBridge service with Zustand store
- Two-way data flow (React ↔ Three.js)
- Tutorial modal
- Settings modal with audio controls
- Level complete screen with celebrations
- Combo counter with visual flair
- Performance optimization (60fps animations)
- Multi-device testing (notched phones, tablets, sunlight)

**Addresses:**
- Features: Undo/Redo, ProgressBar, Physics-based Card Movement, Combo Counter, Level Completion Celebration
- Pitfalls: Performance Death by Styled Components, Canvas Event Blocking, Font Loading FOUT

**Uses:** Zustand, GameBridge pattern, hybrid mounting

### Phase Ordering Rationale

1. **Why Design System first:** Without established tokens, components will use hardcoded values that become expensive to refactor. Contrast and accessibility must be built in from day one to avoid expensive rework.

2. **Why Components before Integration:** Building components in isolation ensures they work correctly before connecting to game state. This allows focused testing of touch targets, animations, and visual states.

3. **Why Integration last:** GameBridge and state synchronization are the riskiest technical piece. Defer until components are proven and stable. Performance monitoring happens here when full UI layer is in place.

4. **How this avoids pitfalls:**
   - Phase 1 prevents contrast collapse and vintage overload by establishing constraints upfront
   - Phase 2 prevents gradient hangover and touch erosion with code review checkpoints
   - Phase 3 prevents performance death with profiling and low-end device testing

### Research Flags

**Phases needing deeper research during planning:**

- **Phase 2:** Physics-based Card Movement — High complexity, requires careful tuning. Consider `/gsd:research-phase` for this feature to explore Three.js physics integration patterns.

- **Phase 3:** GameBridge Integration — Medium complexity. Research patterns for Zustand + vanilla TypeScript bridging, event callback best practices.

**Phases with standard patterns (skip research-phase):**

- **Phase 1:** Design tokens and styled-components are well-documented with established patterns. Official documentation is sufficient.

- **Phase 2:** Basic UI components (HUD, buttons, cards) follow standard React/styled-components patterns. No special research needed.

- **Phase 3:** Tutorial modals, level complete screens, and combo counters are standard game UI patterns. Web game design resources are sufficient.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Based on official styled-components docs, W3C Design Tokens spec, and established React patterns |
| Features | HIGH | Based on standard mobile game UX patterns, WCAG 2.1 AA requirements, and puzzle game best practices |
| Architecture | HIGH | Hybrid mounting and GameBridge patterns are established for React + Three.js integration. Existing codebase analysis confirms feasibility |
| Pitfalls | MEDIUM | Based on established mobile game UX patterns and CSS-in-JS performance implications. Specific vintage aesthetic pitfalls are well-founded but rely on general design principles rather than vinyl-specific case studies |

**Overall confidence:** HIGH

Research is grounded in official documentation (styled-components, W3C, WCAG), established mobile game UX patterns, and existing codebase analysis. The only area with MEDIUM confidence is pitfalls specific to vintage vinyl aesthetics, as this combines general mobile game UX principles with domain-specific design challenges that may need real-world validation.

### Gaps to Address

- **Vintage vinyl aesthetic examples:** Research identified general principles for vintage UI design (restraint, 80/20 rule, selective ornamentation) but few specific examples of vinyl/audio apps doing this well. Recommendation: Create mood board with vintage vinyl reissue labels and boutique audio equipment brands during Phase 1 design system work.

- **Physics-based card movement:** Listed as should-have feature but marked high complexity. If this feature is prioritized for Phase 2 or 3, conduct deeper research on Three.js physics integration patterns specific to card dragging with tilt/weight effects.

- **Real user testing on mobile devices:** Pitfall research emphasizes sunlight testing and thumb testing. While research identifies what to test for, actual validation requires hands-on device testing during Phase 3 integration. Plan usability testing sessions with iPhone SE (small screen), iPhone 14 Pro (notched), and Android mid-range device.

## Sources

### Primary (HIGH confidence)
- styled-components official documentation (https://styled-components.com/docs) — Theming API, migration guides, best practices
- W3C Design Tokens Format specification (https://design-tokens.github.io/community-group/format/) — Token schema, `$value` and `$type` properties
- WCAG 2.1 AA requirements (via MDN) — Contrast ratios: 4.5:1 normal text, 3:1 large text, 3:1 UI components
- Zustand documentation (https://github.com/pmndrs/zustand) — State patterns, TypeScript support
- React Three Fiber documentation (https://pmnd.rs/react-three-fiber) — Hybrid mounting patterns
- Existing codebase analysis — GameManager.ts (1763 lines), InputController.ts (873 lines), index.html structure

### Secondary (MEDIUM confidence)
- Material Design Motion Guidelines — Easing functions and duration benchmarks (couldn't fully load but Material Design is industry standard)
- CSS-Tricks — CSS transitions, requestAnimationFrame best practices
- iOS Human Interface Guidelines — 44pt minimum touch target
- Material Design guidelines — 48dp minimum touch target

### Tertiary (LOW confidence)
- Specific 2026 mobile game UI trends — Couldn't verify due to WebSearch access limitations; findings based on established 2024-2025 patterns

---
*Research completed: 2026-02-11*
*Ready for roadmap: yes*
