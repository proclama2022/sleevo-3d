# Stack Research

**Domain:** Hypercasual Mobile Game Development (React/TypeScript)
**Researched:** 2026-02-10
**Confidence:** MEDIUM-HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2.4 (current) | UI framework | Already in use. React 19 provides performance improvements for game UIs with automatic batching and concurrent features |
| TypeScript | 5.8.2 (current) | Type safety | Already in use. Enforces stricter type checks, critical for complex game state management |
| Vite | 6.2.0 (current) | Build tool | Already in use. 40x faster builds than CRA, optimized tree-shaking, instant HMR. Uses esbuild for dev and Rollup for production |
| Tailwind CSS | 3.4.17 (current) | Styling | Already in use. Rapid UI development, excellent for game UI components, minimal runtime overhead |
| Capacitor | 8.0.2 (current) | Native runtime | Already in use. Cross-platform iOS/Android support with native APIs (haptics, status bar) |

### Game State Management

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | ^5.0.11 | Global game state | **RECOMMENDED** - Simple, fast (0 dependencies), 3KB bundle. Perfect for level progression, combos, scores. React 18+ required (v5) |
| Context API + useReducer | (built-in) | Feature-level state | For isolated features like settings modals, theme preferences. Use before adding external state library |

**Rationale:** Start with Context API for simple state. Graduate to Zustand when you need:
- Complex interdependent state (combo system + level progression + achievements)
- Performance-critical updates (60fps animations + state changes)
- Minimal re-renders across many components

**Alternatives Considered:**
- Redux Toolkit: Overkill for hypercasual games. Too much boilerplate.
- Jotai: Excellent for atomic state (4KB, TypeScript-first), but Zustand's centralized approach is simpler for game logic
- Context alone: Will cause re-render issues with frequent game state updates

### Animation & Visual Effects

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| GSAP | ^3.14.2 | Core animations | **RECOMMENDED** - Consistent 60fps even with complex sequences. Best for screen shake, slow-mo, combo animations. Zero React lifecycle overhead |
| Motion (Framer Motion) | Latest | React-specific animations | UI transitions, modal animations, layout animations. Use for declarative animations tied to React state |
| CSS Transitions | (native) | Simple UI effects | Button hovers, basic fades. Zero JavaScript overhead |

**Rationale:** **Use GSAP as your primary animation engine** for game mechanics. GSAP maintains 60fps with thousands of simultaneous tweens, while Motion drops to ~45fps with multiple animations. Motion is great for UI layers but not core game loops.

**Key Performance Difference:**
- GSAP: Handles complex animation orchestration without frame loss
- Motion: Excellent for simple animations, struggles with simultaneous complex sequences due to React lifecycle

### Particle Systems & Effects

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tsparticles/react | ^3.0.0 | Particle effects | Confetti on level complete, vinyl dust particles, combo explosions |
| Custom Canvas | (native) | Lightweight effects | Simple particle bursts. Lower overhead than full library |

**Note:** @tsparticles/react v3 was last published 2 years ago. Consider using lightweight custom canvas-based particles for performance-critical mobile scenarios.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| use-sound | ^4.0.3 | SFX management | Alternative to existing Web Audio API. Wraps Howler.js for simple sound effects (~10KB) |
| screen-shake | ^1.0.0 | Screen shake effects | Customizable screen shake. Alternative: implement with GSAP transforms |
| @capacitor/haptics | 8.0.0 (installed) | Tactile feedback | Already installed. Use for vinyl drops, combos, level complete |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| @vitejs/plugin-react | Build plugin | Already using v5. Consider @vitejs/plugin-react-swc for faster compilation with Rust-based SWC |
| TypeScript ESLint | Linting | Enforce strict types for game state. Prevent runtime errors |
| Prettier | Formatting | Consistent code style across team |

## Installation

### State Management
```bash
npm install zustand
```

### Animation & Effects
```bash
# Primary animation engine
npm install gsap

# Optional: UI animations
npm install motion

# Optional: Particles
npm install @tsparticles/react @tsparticles/engine
```

### Audio (Alternative to Web Audio API)
```bash
# Optional: If replacing custom Web Audio implementation
npm install use-sound
```

### Performance Optimization
```bash
# Optional: Faster builds with SWC
npm install -D @vitejs/plugin-react-swc
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Zustand | Jotai | If you need fine-grained reactivity and Suspense integration. Better for rapidly changing localized state |
| GSAP | Motion only | If animations are purely UI-driven and tied to React state changes. Not suitable for 60fps game mechanics |
| @tsparticles/react | Custom Canvas | **Use custom canvas** for mobile performance. tsparticles v3 hasn't been updated in 2 years |
| Zustand | Context API | Keep Context for isolated features. Use Zustand only when Context causes performance issues |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Redux Toolkit | Too much boilerplate for hypercasual games. Overkill for simple state | Zustand for global state, Context for features |
| react-spring | Good for physics-based animations, but GSAP has better performance for complex game sequences | GSAP for game mechanics, Motion for UI |
| Old animation libs | Libraries like react-motion (archived), Animated (React Native legacy) are deprecated | Motion or GSAP |
| setState in game loops | Calling setState every frame (60fps) will tank performance | Use refs + requestAnimationFrame for game engine, sync to React state minimally |
| Particles.js | Deprecated. Replaced by tsparticles v3 | @tsparticles/react or custom canvas |

## Stack Patterns by Use Case

**Game Loop & Core Mechanics:**
```typescript
// Use refs + requestAnimationFrame, NOT React state
const gameStateRef = useRef({ position: 0, velocity: 0 });

useEffect(() => {
  let frameId: number;

  const gameLoop = (timestamp: number) => {
    // Update game state (refs, not setState)
    gameStateRef.current.position += gameStateRef.current.velocity;

    // Render with GSAP or canvas
    gsap.to(element, { x: gameStateRef.current.position });

    frameId = requestAnimationFrame(gameLoop);
  };

  frameId = requestAnimationFrame(gameLoop);
  return () => cancelAnimationFrame(frameId);
}, []);
```

**State Management:**
```typescript
// Zustand store for game state
import { create } from 'zustand';

interface GameState {
  level: number;
  score: number;
  combo: number;
  incrementCombo: () => void;
  resetCombo: () => void;
}

const useGameStore = create<GameState>((set) => ({
  level: 1,
  score: 0,
  combo: 0,
  incrementCombo: () => set((state) => ({ combo: state.combo + 1 })),
  resetCombo: () => set({ combo: 0 }),
}));
```

**Animations:**
```typescript
// GSAP for game mechanics
import { gsap } from 'gsap';

// Screen shake on combo
gsap.to(screenRef.current, {
  x: '+=10',
  yoyo: true,
  repeat: 5,
  duration: 0.05,
  ease: 'power2.inOut'
});

// Slow motion effect
gsap.globalTimeline.timeScale(0.3); // 30% speed
setTimeout(() => gsap.globalTimeline.timeScale(1), 500);
```

**Haptic Feedback:**
```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// On vinyl drop
await Haptics.impact({ style: ImpactStyle.Medium });

// On combo milestone
await Haptics.notification({ type: NotificationType.Success });
```

## Performance Patterns

### Mobile 60fps Requirements

1. **Game Engine Architecture:**
   - Keep game logic OFF React re-renders
   - Use refs for per-frame state
   - Sync to React state only for UI updates (score display, level complete)

2. **Animation Best Practices:**
   - Avoid animating during React render cycles
   - Use GSAP's timeline for complex sequences
   - Leverage CSS transforms (translateX/Y, scale, rotate) - GPU accelerated

3. **State Update Strategy:**
   ```typescript
   // BAD: setState every frame
   const [position, setPosition] = useState(0);
   useEffect(() => {
     const gameLoop = () => {
       setPosition(p => p + 1); // 60 re-renders per second!
     };
   });

   // GOOD: Refs for game loop, state for UI
   const positionRef = useRef(0);
   const [displayScore, setDisplayScore] = useState(0);

   useEffect(() => {
     const gameLoop = () => {
       positionRef.current += 1;

       // Update UI state only on milestones
       if (positionRef.current % 100 === 0) {
         setDisplayScore(positionRef.current);
       }
     };
   });
   ```

4. **Bundle Size Optimization:**
   - Vite automatically tree-shakes unused code
   - Use dynamic imports for heavy libraries
   - Consider replacing @tsparticles (large) with custom canvas for critical mobile performance

5. **Asset Loading:**
   - Preload critical assets (vinyl covers, UI elements)
   - Use WebP for images (better compression)
   - Lazy load non-critical screens (achievements, settings)

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| zustand@5.x | react@18+ | Dropped React <18 support, uses native useSyncExternalStore |
| gsap@3.14.x | All modern frameworks | Framework-agnostic, works with React 19 |
| @tsparticles/react@3.x | react@18+ | Last published 2 years ago - verify maintenance status |
| @capacitor/haptics@8.x | @capacitor/core@8.x | Match major versions |

## Mobile-First Considerations

### iOS Performance
- Use Capacitor Haptics API (already installed)
- Initialize audio context on user interaction (iOS requirement)
- Test on lower-end devices (iPhone SE) for 60fps validation

### Android Performance
- Test gesture responsiveness with chrome://inspect
- Verify haptics work across device manufacturers
- Consider reduced particle counts on mid-tier devices

### Bundle Size Targets
- **Initial load:** <500KB (gzipped)
- **Runtime assets:** <2MB total
- **Per-animation library:** <15KB (Motion ~30KB, GSAP ~50KB, Zustand ~3KB)

### Performance Budget
- Startup time: <1.5s on mobile
- Frame rate: Consistent 60fps during gameplay
- Time to interactive: <2s
- Largest Contentful Paint: <2.5s

## Sources

**State Management:**
- [State Management in 2025: When to Use Context, Redux, Zustand, or Jotai](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k) - MEDIUM confidence
- [Announcing Zustand v5](https://pmnd.rs/blog/announcing-zustand-v5) - HIGH confidence (official)
- [Top 5 React State Management Tools Developers Actually Use in 2026](https://www.syncfusion.com/blogs/post/react-state-management-libraries) - MEDIUM confidence

**Animation Libraries:**
- [GSAP vs. Framer Motion: A Comprehensive Comparison](https://tharakasachin98.medium.com/gsap-vs-framer-motion-a-comprehensive-comparison-0e4888113825) - MEDIUM confidence
- [GSAP vs Motion: A detailed comparison](https://motion.dev/docs/gsap-vs-motion) - HIGH confidence (official docs)
- [Comparing the performance of Framer Motion and GSAP](https://blog.uavdevelopment.io/blogs/comparing-the-performance-of-framer-motion-and-gsap-animations-in-next-js) - MEDIUM confidence
- [Beyond Eye Candy: Top 7 React Animation Libraries for Real-World Apps in 2026](https://www.syncfusion.com/blogs/post/top-react-animation-libraries) - MEDIUM confidence

**Performance & Best Practices:**
- [React at 60 FPS - Optimizing performance](https://g3f4.github.io/react-at-60-fps/) - MEDIUM confidence
- [Using requestAnimationFrame with React Hooks](https://css-tricks.com/using-requestanimationframe-with-react-hooks/) - MEDIUM confidence
- [React Native Performance Optimization & Best Practices (2025 Guide)](https://baltech.in/blog/react-native-performance-optimization-best-practices/) - MEDIUM confidence

**Build Tools:**
- [Vite + TypeScript: Fastest Frontend Setup for React in 2026](https://medium.com/@mernstackdevbykevin/vite-typescript-2026-frontend-setup-in-the-fast-lane-822c28a6c3f0) - MEDIUM confidence
- [How to Set Up a Production-Ready React Project with TypeScript and Vite](https://oneuptime.com/blog/post/2026-01-08-react-typescript-vite-production-setup/view) - MEDIUM confidence

**Particles & Effects:**
- [tsParticles Official Site](https://particles.js.org/) - HIGH confidence (official)
- [GitHub - tsparticles/react](https://github.com/tsparticles/react) - HIGH confidence (official)

**Audio:**
- [use-sound - A React Hook for playing sound effects](https://github.com/joshwcomeau/use-sound) - HIGH confidence (official)
- [The Only React Hook for Sound Effects You Will Ever Need](https://dev.to/bricourse/the-only-react-hook-for-sound-effects-you-will-ever-need-2g9j) - MEDIUM confidence

**Haptics:**
- [Haptics Capacitor Plugin API](https://capacitorjs.com/docs/apis/haptics) - HIGH confidence (official)

**Game Development:**
- [React Native Game Development: A Comprehensive Guide 2026](https://amela.tech/react-native-game-development-made-easy-from-concept-to-launch/) - MEDIUM confidence
- [Why Use React for Game Development?](https://jslegenddev.substack.com/p/why-use-react-for-game-development) - LOW confidence

---
*Stack research for: Sleevo Vinyl Shop Manager - Hypercasual Game Enhancement*
*Researched: 2026-02-10*
*Researcher: gsd-project-researcher*
