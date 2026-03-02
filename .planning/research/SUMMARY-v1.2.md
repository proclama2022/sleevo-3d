# Research Summary: Sleevo v1.2 Visual Polish

**Domain:** Visual polish animations for React + Three.js browser game
**Researched:** 2026-03-02
**Overall confidence:** HIGH

## Executive Summary

Sleevo v1.2 adds visual polish to an already-shipped vinyl sorting game through five targeted improvements: drag wobble on vinyl discs, slot glow when dragging near valid targets, smooth level transitions between screens, vinyl spin animations on placement, and ambient particles for atmosphere. This is a brownfield milestone — the core game is complete and stable, with comprehensive animation infrastructure already in place via styled-components keyframes, CSS Modules, and @react-three/drei helpers.

The research reveals that most target features are already supported by existing code. Slot glow and vinyl spin animations exist as styled-components keyframes and CSS animations. Ambient particles are supported by the already-installed @react-three/drei package (Sparkles, Stars components). The only genuine gaps are drag wobble (requires react-spring for physics-based 3D animation) and level transitions (requires framer-motion for cross-screen orchestration). The recommended approach is additive: extend existing patterns, leverage installed packages, and add only two new libraries (framer-motion, react-spring) where no current capability exists.

## Key Findings

**Stack:** Existing styled-components + @react-three/drei infrastructure covers 3 of 5 features; add framer-motion for level transitions, react-spring for drag wobble physics
**Architecture:** Component-based 3D scenes via @react-three/fiber; animation timing centralized in `src/animations/timing.ts`; particle system via ParticleBurst component extensible for ambient effects
**Critical pitfall:** Over-engineering animation tech stack — significant infrastructure exists, adding libraries without auditing existing code leads to duplication and bundle bloat

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Level Transitions** - Lowest technical risk, highest visual impact
   - Addresses: framer-motion integration with App.tsx screen routing
   - Avoids: Touching 3D scene during initial integration
   - Uses: NEW library (framer-motion)

2. **Ambient Particles** - Leverages existing @react-three/drei installation
   - Addresses: Dust mote atmosphere using Sparkles/Stars
   - Avoids: Custom shader complexity
   - Uses: EXISTING infrastructure (@react-three/drei already installed)

3. **Slot Glow Enhancement** - Extends existing glowPulse keyframes
   - Addresses: Visual feedback when dragging near valid slots
   - Avoids: New animation system
   - Uses: EXISTING infrastructure (styled-components keyframes)

4. **Vinyl Spin** - Extends existing placedPop, discGlowPulse animations
   - Addresses: Celebratory rotation on successful placement
   - Avoids: 3D rotation complexity
   - Uses: EXISTING infrastructure (VinylDisc.module.css animations)

5. **Drag Wobble** - Highest technical risk, requires react-spring + @react-three/fiber integration
   - Addresses: Tactile feedback during drag interaction
   - Avoids: Implementing during active game state without testing
   - Uses: NEW library (react-spring)

**Phase ordering rationale:**
- Start with level transitions (framer-motion) — isolated from 3D scene, low integration risk
- Ambient particles second — leverages existing @react-three/drei, builds 3D confidence
- Slot glow and vinyl spin together — both use existing CSS/styled-components, low risk
- Drag wobble last — requires new react-spring library integrated with @react-three/fiber during active gameplay, highest complexity

**Research flags for phases:**
- Phase 5 (Drag Wobble): Likely needs deeper research (react-spring + @react-three/fiber integration patterns during drag state)
- Phases 1-4: Standard patterns, unlikely to need research

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Direct codebase inspection confirmed existing animation infrastructure; library versions verified via official docs |
| Features | HIGH | Target features clearly specified in PROJECT.md; existing code audited for capabilities |
| Architecture | HIGH | Component boundaries verified via actual source files; @react-three/fiber + drei integration patterns well-documented |
| Pitfalls | HIGH | Existing anti-patterns identified from codebase; brownfield integration risks documented |

### Gaps to Address

- **react-spring drag integration:** Need to verify useSpring hook behavior during active drag state in @react-three/fiber — may require phase-specific research
- **Particle performance on mobile:** Desktop particle budgets documented; iOS Safari testing needed before finalizing counts
- **Level transition timing:** Existing animation timings in `timing.ts` may need extension for cross-screen durations
