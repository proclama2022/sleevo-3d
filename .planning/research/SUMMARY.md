# Project Research Summary

**Project:** Sleevo v1.2 — Visual Polish Milestone
**Domain:** React + Three.js browser game with visual polish features
**Researched:** 2026-03-02
**Confidence:** HIGH

## Executive Summary

This is a visual polish milestone for an existing React + Three.js vinyl sorting game. The codebase already has a solid foundation with comprehensive animation infrastructure (timing utilities, keyframes, particle systems) and proven performance patterns (direct DOM manipulation for drag, CSS-first animations, static Three.js rendering). Research indicates that adding visual polish—drag wobble physics, slot glow feedback, screen transitions, vinyl spin animations, and ambient particles—can be achieved primarily by extending existing systems rather than introducing new dependencies.

The recommended approach is CSS-first for UI animations (drag wobble, slot glow, vinyl spin) and selective library additions for cross-screen orchestration (framer-motion for level transitions, react-spring for 3D spring physics). Critical risks include React/Three.js render loop conflicts (avoid with refs and direct DOM manipulation), memory leaks from undisposed Three.js objects (rigorous cleanup functions), and layout thrashing from CSS transitions during drag (use transform/opacity only). The existing drag performance optimizations must be preserved—any animation during drag MUST use direct DOM manipulation, not React state. Research confidence is HIGH based on existing codebase analysis and established game design principles.

## Key Findings

### Recommended Stack

**Core recommendation:** Extend existing animation infrastructure with minimal new dependencies. The codebase already has comprehensive timing utilities, keyframe animations, and particle systems. Only two new packages are needed: framer-motion for smooth level transitions and react-spring for 3D spring physics on vinyl discs.

**Core technologies:**
- **React 19.2.4 + Three.js 0.182.0** — Already validated; core rendering engines remain unchanged
- **@react-three/fiber + @react-three/drei** — Already installed; provides declarative 3D with Sparkles/Stars for ambient particles
- **styled-components 6.3.9** — Already validated with comprehensive keyframes system (glowPulse, discGlowPulse, placedPop, reflectionRotate)
- **framer-motion 12.34.3** (NEW) — Cross-screen transition orchestration (fade/slide between LevelSelect and GameScreen)
- **react-spring 10.0.1** (NEW) — Spring physics for drag wobble on vinyl discs with native react-three/fiber support

**Existing infrastructure to reuse:**
- `src/animations/timing.ts` — Timing constants for all animations
- `src/animations/keyframes.ts` — Pre-built keyframes (glowPulse, discGlowPulse, placedPop) cover slot glow and vinyl spin
- `src/components/ParticleBurst/` — Extensible particle system for ambient effects
- CSS Modules pattern — Co-located component styling with reduced-motion support

### Expected Features

Visual polish features fall into three categories based on user expectations and competitive analysis.

**Must have (table stakes):**
- **Drag wobble physics** — Players expect grabbed objects to react with natural spring physics (MEDIUM complexity)
- **Slot hover glow** — Clear visual feedback about drop targets (LOW complexity, already has data-hover system)
- **Screen transitions** — Abrupt cuts feel unpolished; need fade/slide between screens (MEDIUM complexity)
- **Vinyl spin on placement** — Satisfying "thwack" when disc settles into slot (LOW-MEDIUM complexity)
- **Ambient particles** — Static scenes feel dead; particles add atmosphere (LOW-MEDIUM complexity)

**Should have (competitive differentiators):**
- **Theme-aware particle systems** — Each level theme has unique ambient effects (jazz-club dust, disco light beams)
- **Dynamic drop shadows** — Shadows respond to object height during drag
- **Combo milestone visual variety** — Different burst patterns at 5x, 8x, 10x combo

**Defer (v2+):**
- **3D camera swoops** — Disorienting for sorting puzzle
- **Continuous screen shake** — Causes motion sickness
- **3D physics simulation** — Overkill; CSS-based drag is sufficient

### Architecture Approach

The architecture follows a **CSS-first animations for UI feedback, Three.js for static 3D** pattern. This separation ensures 60fps performance during interactions while maintaining realistic lighting and shadows in the 3D scene. The existing codebase demonstrates this pattern successfully: direct DOM manipulation during drag (GameScreen.tsx lines 442-520), ephemeral state management for one-shot animations (comboBurst, scorePopups), and static Three.js rendering (Shelf3DCanvas renders once on mount/resize).

**Major components:**
1. **VinylDisc** — Vinyl rendering with drag wobble animation (CSS transforms + velocity tracking)
2. **ShelfSlot** — Slot rendering with placement sparkles and glow effects (CSS keyframes + data-attributes)
3. **Counter** — Unplaced vinyls display with carousel rotation (CSS transforms for 3D carousel)
4. **Shelf** — Grid layout integrating 3D canvas with column hints
5. **GameScreen** — Animation orchestration, popup coordination (ephemeral useState for transient UI)
6. **ParticleBurst/AmbientParticles** — One-shot particle explosions and ambient dust/light rays
7. **ScreenTransition** — Fade/slide wrapper for cross-screen transitions (NEW)

**Key architectural patterns:**
- **CSS-first for UI feedback** — Hardware-accelerated transforms, declarative, reduced-motion support
- **Three.js static for 3D** — No render loop, realistic lighting, best performance
- **Ephemeral state management** — Local useState for short-lived effects with self-cleanup
- **Data-attribute driven states** — Zero re-renders for high-frequency hover/active states

### Critical Pitfalls

Top pitfalls identified in research with prevention strategies:

1. **React/Three.js render loop conflict** — Use refs for animation state that doesn't need React renders; only sync to React state when animation completes. Never setState in animation hot paths.

2. **Memory leaks from undisposed Three.js objects** — Always call `.dispose()` on geometries, materials, textures in useEffect cleanup functions. Track all created objects in refs. Reuse particle geometries instead of creating new ones.

3. **Layout thrashing from CSS transitions during drag** — Use `transform` and `opacity` exclusively for animations (GPU-accelerated). Never animate layout properties (width, height, top, left) during interactive sequences. For slot glow, use `box-shadow` or `filter` transitions, not size/position.

4. **Breaking existing drag performance** — The drag system uses aggressive optimizations (cached rects, direct DOM manipulation). Any animation during drag MUST use direct DOM manipulation, not React state. Never setState in handlePointerMove.

5. **Over-animating and visual fatigue** — Establish animation budget (max 3 simultaneous animations per screen). Prioritize critical feedback (drop validation) > atmosphere > decoration. Suppress lower-priority animations during high-intensity moments.

## Implications for Roadmap

Based on combined research, suggested phase structure for v1.2 visual polish milestone:

### Phase 1: Animation Infrastructure Foundation

**Rationale:** Extending existing animation infrastructure must come first to provide timing constants, keyframes, and transition utilities that all subsequent phases depend on. This phase has no dependencies and establishes patterns for consistent animation implementation.

**Delivers:**
- Extended `src/animations/timing.ts` with new constants (drag wobble duration, screen transition timing)
- Extended `src/animations/keyframes.ts` with wobble/glow keyframes
- New `src/animations/transitions.ts` for screen transition utilities
- Animation performance budget guidelines (max particles, max simultaneous animations)

**Addresses:**
- Drag wobble velocity tracking foundation
- Slot glow pulse keyframe definitions
- Screen transition timing coordination

**Avoids:**
- Inconsistent animation timing across features
- Magic numbers scattered throughout components

**Research flags:** None — standard animation infrastructure, well-documented patterns

### Phase 2: Drag Wobble & Slot Glow

**Rationale:** These are the most critical interaction feedback features and can be built in parallel once infrastructure is in place. They share velocity tracking as a dependency and both integrate with the existing drag system, making them natural to implement together.

**Delivers:**
- VinylDisc drag wobble physics (velocity-based oscillation)
- ShelfSlot glow pulse animation (enhanced existing data-hover)
- Direct DOM manipulation patterns for performance during drag
- Integration with existing drag validation system

**Addresses:**
- Drag wobble physics (MEDIUM complexity, table stakes feature)
- Slot glow pulse (LOW complexity, table stakes feature)

**Uses:**
- react-spring for spring physics on vinyl rotation
- Existing styled-components keyframes (glowPulse)
- Existing data-hover attribute system

**Avoids:**
- React/Three.js render loop conflict (use refs for animation state)
- Breaking existing drag performance (direct DOM only during drag)

**Research flags:** Needs `/gsd:research-phase` — drag wobble physics integration with existing drag system is complex; need to validate react-spring + @react-three/fiber integration pattern

### Phase 3: Vinyl Spin & Placement Feedback

**Rationale:** Vinyl spin enhances placement feedback and naturally extends the existing sparkle effect. It has no dependencies on other features and can be implemented independently once animation infrastructure is in place.

**Delivers:**
- Vinyl spin animation on placement (rotation with easing)
- Enhanced placement feedback sequence (spin + sparkle + sound)
- CSS keyframe extension for vinyl rotation

**Addresses:**
- Vinyl spin on placement (LOW-MEDIUM complexity, table stakes feature)

**Uses:**
- Existing placedPop, discGlowPulse, reflectionRotate keyframes
- Existing sparkle effect system

**Avoids:**
- Spin animation triggering on invalid placements (only animate placed vinyls)

**Research flags:** None — CSS animations, well-established pattern

### Phase 4: Ambient Particles & Atmosphere

**Rationale:** Ambient particles are independent of core gameplay interactions and can be added once the more critical feedback features (wobble, glow, spin) are implemented. They enhance the theme system and add polish without affecting game mechanics.

**Delivers:**
- AmbientParticles component (dust motes, light rays)
- Integration with SceneBackdrop for theme-aware effects
- Performance-optimized particle system (device-based particle counts)
- Theme-specific particle palettes (jazz-club dust, disco light beams)

**Addresses:**
- Enhanced ambient particles (LOW-MEDIUM complexity, table stakes feature)
- Theme-aware particle systems (MEDIUM complexity, differentiator)

**Uses:**
- @react-three/drei (Sparkles, Stars) — already installed
- Existing ParticleBurst component patterns
- CSS variables for theme colors

**Avoids:**
- Memory leaks from undisposed Three.js objects (rigorous cleanup)
- Performance degradation on mobile (device-based particle budgets)

**Research flags:** Needs `/gsd:research-phase` — ambient particle performance on low-end devices needs validation; optimal particle count by device class

### Phase 5: Screen Transitions & Integration

**Rationale:** Screen transitions should come later because they orchestrate across all other features and depend on the component structure being stable. They also require careful timing coordination with React.lazy loading patterns.

**Delivers:**
- ScreenTransition component (fade/slide wrapper)
- App.tsx integration with AnimatePresence
- Level transition sequencing (fade out → state update → fade in)
- Loading state handling for React.lazy timing

**Addresses:**
- Screen transitions (MEDIUM complexity, table stakes feature)

**Uses:**
- framer-motion for cross-screen orchestration
- AnimatePresence for exit animations

**Avoids:**
- Level transition timing mismatches (sequence operations properly)
- Flash of old content during transition

**Research flags:** Needs `/gsd:research-phase` — framer-motion AnimatePresence integration with React.lazy Suspense timing needs validation

### Phase 6: Performance Optimization & Polish

**Rationale:** Performance optimization and final polish should come after all features are implemented. This allows profiling real-world usage patterns and optimizing bottlenecks based on actual performance data.

**Delivers:**
- Drag performance profiling and optimization
- Animation budget enforcement
- Reduced motion support validation
- Mobile performance tuning
- Accessibility audit (motion sensitivity, screen reader, keyboard)

**Addresses:**
- All performance pitfalls from research
- Accessibility compliance (WCAG 2.1)

**Avoids:**
- Over-animating and visual fatigue
- Ignoring accessibility in visual polish

**Research flags:** None — standard optimization practices

### Phase Ordering Rationale

This order follows dependency constraints, risk mitigation, and incremental value delivery:

1. **Foundation first** — Animation infrastructure underlies all features
2. **Core interaction feedback** — Wobble and glow are most critical for game feel
3. **Enhancement features** — Vinyl spin and ambient particles build on foundation
4. **Cross-cutting orchestration** — Screen transitions require stable component structure
5. **Optimization last** — Can't optimize what doesn't exist yet

This grouping respects architectural patterns (CSS-first for UI, Three.js for static 3D), avoids critical pitfalls (render loop conflicts, memory leaks, layout thrashing), and delivers value incrementally with each phase.

### Research Flags

**Phases likely needing deeper research during planning:**

- **Phase 2 (Drag Wobble & Slot Glow):** Complex integration with existing drag system. Need to validate react-spring + @react-three/fiber pattern for drag wobble physics. Risk of breaking existing drag performance optimizations.

- **Phase 4 (Ambient Particles):** Need to validate optimal particle count for ambient atmosphere on low-end devices. @react-three/drei Sparkles/Stars components need testing on iOS Safari for performance.

- **Phase 5 (Screen Transitions):** Framer-motion AnimatePresence integration with React.lazy Suspense timing is tricky. Need to research proper sequencing to avoid flash of old content or premature unmount.

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Animation Infrastructure):** Well-documented pattern, existing codebase provides clear template
- **Phase 3 (Vinyl Spin):** CSS animations, existing keyframes cover this use case
- **Phase 6 (Performance Optimization):** Standard web performance practices, Chrome DevTools profiling

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core stack already validated; new packages (framer-motion, react-spring) are industry standards with excellent documentation |
| Features | HIGH | Based on existing codebase patterns and established game design principles; feature complexity accurately assessed |
| Architecture | HIGH | Analyzed existing codebase patterns; CSS-first + static Three.js approach already proven in production |
| Pitfalls | HIGH | Performance patterns based on official docs and proven React/Three.js integration patterns; existing drag optimizations provide clear guidance |

**Overall confidence:** HIGH

### Gaps to Address

Areas where research was inconclusive or needs validation during implementation:

1. **Drag wobble performance with react-spring** — Need to validate that react-spring physics don't introduce jank during active drag. Test on low-end mobile devices during Phase 2.

2. **Ambient particle count on mobile** — Research provides desktop estimates but mobile performance is device-dependent. Need real device testing during Phase 4 to establish particle budgets by device class.

3. **Framer-motion + React.lazy timing** — Limited official guidance on sequencing AnimatePresence with Suspense. May need to prototype transition timing during Phase 5 planning.

4. **Optimal animation budget** — Research suggests "max 3 simultaneous animations" but this is heuristic. Need user testing during Phase 6 to validate visual fatigue threshold.

**How to handle during planning/execution:**
- Prototype drag wobble early in Phase 2 to validate performance
- Test ambient particles on physical devices (iOS Safari, Android Chrome) in Phase 4
- Create transition timing prototype in Phase 5 to avoid implementation dead-ends
- Schedule user testing sessions for Phase 6 to validate animation budget

## Sources

### Primary (HIGH confidence)

- **Existing codebase analysis** — `/Users/martha2022/Documents/Sleevo/src/components/GameScreen.tsx` (drag optimization patterns, ephemeral state), `/Users/martha2022/Documents/Sleevo/src/animations/` (timing utilities, keyframes), `/Users/martha2022/Documents/Sleevo/src/components/Shelf3DCanvas.tsx` (static Three.js pattern)
- **Official library documentation** — framer-motion (https://www.framer.com/motion/), react-spring (https://www.react-spring.dev/), @react-three/drei (https://docs.pmnd.rs/drei), Three.js (https://threejs.org/docs/)
- **Established game design principles** — "The 12 Principles of Animation" (Disney/Ollie Johnston), "Juice It or Lose It" (Martin Jonasson & Petri Purho), "Game Feel" (Steve Swink)

### Secondary (MEDIUM confidence)

- **Web animation best practices** — CSS Triggers (https://csstriggers.com/), Web.dev performance guidelines (https://web.dev/animations/), MDN Web Animations API documentation
- **React/Three.js integration patterns** — @react-three/fiber documentation (https://docs.pmnd.rs/react-three-fiber), community patterns for avoiding render loop conflicts
- **Accessibility guidelines** — WCAG 2.1 Success Criterion 2.3.3 (Animation from Interactions), prefers-reduced-motion media query documentation

### Tertiary (LOW confidence)

- **Performance benchmarking data** — Particle count estimates based on general WebGL best practices, not device-specific testing
- **Animation budget heuristics** — "Max 3 simultaneous animations" is industry rule-of-thumb, not scientifically validated for this specific game
- **Transition timing patterns** — Limited official guidance on framer-motion + React.lazy integration; may need validation during implementation

---
*Research completed: 2026-03-02*
*Ready for roadmap: yes*
