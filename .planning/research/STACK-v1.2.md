# Technology Stack

**Project:** Sleevo v1.2 Visual Polish
**Researched:** 2026-03-02
**Milestone:** Visual Polish - drag wobble, slot glow, level transitions, vinyl spin, ambient particles

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React | ^19.2.4 | Component rendering | Already validated; concurrent rendering for smooth animations |
| Three.js | ^0.182.0 | 3D rendering | Already validated; mature WebGL wrapper with Points for particles |
| @react-three/fiber | ^9.5.0 | React renderer for Three.js | Already validated; bridges React + Three.js for declarative 3D |
| @react-three/drei | ^10.7.7 | Three.js helpers | **ALREADY INSTALLED** - contains Sparkles, Stars, Cloud for ambient particles |

### Animation Libraries
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| styled-components | ^6.3.9 | CSS-in-JS animations | **ALREADY VALIDATED** - comprehensive keyframes system in place |
| framer-motion | ^12.34.3 | Screen transitions | NEW: for smooth level transitions (fade/slide) not covered by styled-components |
| react-spring | ^10.0.1 | Spring physics for 3D | NEW: for drag wobble on vinyl discs (react-three-fiber support) |

### Existing Animation Infrastructure (DO NOT DUPLICATE)
| Asset | Location | Capability | Use For |
|-------|----------|------------|---------|
| Timing utilities | `src/animations/timing.ts` | CARD_PICKUP, SHELF_HOVER, spring easing constants | Reuse for new animation timing |
| Keyframes | `src/animations/keyframes.ts` | cardPickup, cardDrop, glowPulse, shake, discGlowPulse | **Already covers slot glow, vinyl spin** |
| ParticleBurst | `src/components/ParticleBurst/` | Particle system component | Extensible for ambient particles |
| VinylDisc CSS | `src/components/VinylDisc.module.css` | placedPop, discGlowPulse, reflectionRotate | **Already covers vinyl spin animations** |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tailwindcss | ^4.2.1 | Utility styling | Existing styling system; use for transition utility classes |
| @tailwindcss/postcss | ^4.2.1 | PostCSS integration | Already configured; supports arbitrary values for animation durations |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Screen transitions | framer-motion | CSS transitions only | Framer Motion provides smoother cross-screen orchestration, gesture handling, exit animations |
| 3D spring physics | react-spring | THREE.MathUtils.lerp manual | react-spring has native react-three-fiber support via @react-three/fiber package |
| Particle systems | @react-three/drei (Sparkles) | custom Points mesh | Drei helpers are optimized, handle frustum culling, support React props |

## Installation

```bash
# NEW additions only (core stack already installed)
npm install framer-motion@^12.34.3 react-spring@^10.0.1

# NO additional packages needed for:
# - Slot glow: styled-components keyframes already exist (glowPulse)
# - Vinyl spin: CSS animations already exist (placedPop, discGlowPulse, reflectionRotate)
# - Ambient particles: @react-three/drei already installed (Sparkles, Stars)
```

## Integration Points

### Drag Wobble (react-spring + @react-three/fiber)
```typescript
// Use react-spring's useSpring with react-three-fiber
import { useSpring } from '@react-three/fiber'
import { a } from '@react-three/fiber'

// Apply to VinylDisc mesh rotation/scale based on drag velocity
```

### Slot Glow (styled-components - EXISTING)
```typescript
// Reuse existing glowPulse keyframes from src/animations/keyframes.ts
import { glowPulseMixin } from '../animations/keyframes'
// Already implemented in ShelfSlot component
```

### Level Transitions (framer-motion - NEW)
```typescript
// Wrap App.tsx screen transitions with AnimatePresence
import { motion, AnimatePresence } from 'framer-motion'

// Use for: LevelComplete → LevelSelect, fade/slide transitions
```

### Vinyl Spin (CSS - EXISTING)
```typescript
// Use existing placedPop, discGlowPulse, reflectionRotate
// Already in VinylDisc.module.css
```

### Ambient Particles (@react-three/drei - EXISTING)
```typescript
// Use installed Sparkles/Stars components
import { Sparkles, Stars } from '@react-three/drei'

// Add to SceneBackdrop.3DCanvas for ambient dust motes
```

## Performance Considerations

### Particle System Budget
| Device | Max Particles | Recommendation |
|---------|---------------|----------------|
| Desktop | 2000+ points | Full Sparkles/Stars effect |
| Laptop | 1000-1500 points | Medium density, reduce radius |
| Mobile | 500-800 points | Minimal particles, consider disable option |

### Animation Performance
- **GPU-acceleration**: Use transform/opacity (not layout properties) for 60fps
- **Spring physics**: react-spring runs on requestAnimationFrame, avoids layout thrashing
- **Reduced motion**: Existing system in `src/animations/timing.ts` extends to new animations
- **Bundle size**: Framer Motion ~40KB gzipped, react-spring ~13KB gzipped (acceptable for polish milestone)

### Three.js Specific
- **Points material**: Use `sizeAttenuation: true` for depth-based particle sizing
- **Frustum culling**: @react-three/drei helpers automatically cull off-screen particles
- **Reuse geometries**: Share BufferGeometry across particle systems for memory efficiency

## What NOT to Add

| Library | Why Avoid |
|---------|-----------|
| gsap | Overkill; CSS transitions + framer-motion sufficient for 2D screen effects |
| popmotion.js | Redundant with react-spring (same author, react-spring more React/Three-friendly) |
| three-custom-shader-material | Shader complexity not needed for simple glow/particle effects |
| lottie-react | Designed for Lottie JSON animations; not applicable to Three.js scene |
| react-motion | Deprecated by author (replaced by react-spring) |

## Migration Notes

### Brownfield Considerations
- **DO NOT refactor existing styled-components animations** - they work well
- **ADD framer-motion only for NEW cross-screen transitions** - don't retro-fit existing animations
- **EXTEND existing ParticleBurst component** - leverage existing patterns for ambient particles
- **REUSE timing constants** - all new animations should reference `src/animations/timing.ts` values

### Risk Areas
- **react-spring + @react-three/fiber integration**: Requires testing drag-wobble during active game state
- **framer-motion AnimatePresence**: Ensure exit animations complete before screen unmount
- **Particle performance**: Test on mobile (iOS Safari) before finalizing particle counts

## Sources

- **HIGH confidence**: Official documentation for framer-motion (https://www.framer.com/motion/), react-spring (https://www.react-spring.dev/), @react-three/drei (https://docs.pmnd.rs/drei)
- **HIGH confidence**: Existing codebase analysis - comprehensive animation infrastructure already in place
- **MEDIUM confidence**: WebFetch documentation review (2026-03-02) - library versions current as of research date
