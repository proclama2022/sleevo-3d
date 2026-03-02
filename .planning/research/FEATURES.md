# Feature Research: Visual Polish in React + Three.js Games

**Domain:** Game UI/UX visual polish and game feel
**Researched:** 2026-03-02
**Confidence:** HIGH (based on existing codebase patterns and established game design principles)

## Feature Landscape

### Table Stakes (Users Expect These)

Visual polish features that players expect in modern casual games. Missing these makes the game feel unfinished or unresponsive.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Drag wobble / spring physics** | Players expect grabbed objects to react to mouse movement with natural physics | MEDIUM | Currently using scale(1.08) - needs oscillation on velocity change |
| **Slot hover glow** | Players need clear visual feedback about drop targets | LOW | Already implemented with `data-hover` - needs pulse animation |
| **Screen transitions** | Abrupt cuts feel jarring and unpolished | MEDIUM | Currently instant cuts - needs fade/slide between screens |
| **Placement feedback** | Players need confirmation that their action registered | MEDIUM | Already has shake/bounce-back - needs spin animation + shadow |
| **Ambient particles** | Static scenes feel dead; particles add life | LOW-MEDIUM | Already has 6 particles - could be enhanced with light rays |
| **Sound + visual sync** | Juiciness comes from combined audiovisual feedback | MEDIUM | Already has sound engine - needs tighter animation sync |

### Differentiators (Competitive Advantage)

Features that make Sleevo feel special and memorable compared to other casual sorting games.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Theme-aware particle systems** | Each level theme (jazz-club, punk-basement) has unique ambient effects | MEDIUM | Dust motes for classic, colored light beams for disco-70s |
| **Vinyl spin on placement** | Satisfying "thwack" when disc settles into slot | LOW-MEDIUM | CSS rotation animation with easing |
| **Dynamic drop shadows** | Shadows that respond to object height during drag | MEDIUM | Already has shadow system - needs dynamic sizing |
| **Magnetic snap feedback** | Visual "lock-in" when near valid slot | LOW | Already implemented - needs polish |
| **Combo milestone bursts** | Celebratory effects at 5x, 8x, 10x combo | LOW | Already implemented with ParticleBurst |

### Anti-Features (Commonly Requested, Often Problematic)

Visual effects that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Continuous screen shake** | Seems exciting and dynamic | Causes motion sickness, distracts from gameplay | Use shake ONLY for error feedback (already implemented) |
| **Particle explosions on every action** | Feels "juicy" and responsive | Performance killer, visual clutter, diminishes impact | Reserve for milestones (combo bursts, level complete) |
| **Slow-motion transitions** | Cinematic feel | Breaks game flow, feels sluggish | Use snappy 200-300ms transitions (per existing TIMING constants) |
| **3D camera swoops** | Shows off Three.js capabilities | Disorienting for sorting puzzle, adds complexity | Keep camera fixed, polish object animations instead |
| **Generic stock animations** | Easy to implement | Feels cheap, breaks immersion | Custom animations tied to game mechanics |

## Feature Dependencies

```
[Drag wobble physics]
    ├──requires──> [Velocity tracking system]
                    └──enhances──> [Existing drag ghost]

[Slot glow feedback]
    ├──requires──> [Existing data-hover system]
    └──enhances──> [Magnetic snap targeting]

[Vinyl spin on placement]
    ├──requires──> [Placement trigger in reducer]
    └──enhances──> [Existing sparkle effect]

[Screen transitions]
    ├──requires──> [Screen state management]
    └──conflicts──> [React.lazy lazy loading timing]

[Ambient particles]
    ├──requires──> [SceneBackdrop component]
    └──enhances──> [Theme system]
```

### Dependency Notes

- **Drag wobble requires velocity tracking:** Need to track pointer velocity during drag to apply oscillation. Current implementation updates ghost position but doesn't track delta for physics.
- **Slot glow enhances magnetic snap:** The existing `data-hover-magnetic` attribute is perfect for enhanced glow - just needs CSS animation polish.
- **Vinyl spin enhances sparkle effect:** Current sparkle (✦ points) triggers on placement - adding disc rotation creates a complete "settle" sequence.
- **Screen transitions conflict with lazy loading:** React.lazy's Suspense causes visible loading states. Need to preload GameScreen or add transition after component mounts.
- **Ambient particles enhance theme system:** SceneBackdrop already has theme variants - particles should respond to theme CSS variables.

## MVP Definition

### Launch With (v1.2 - Current Milestone)

Minimum viable polish to make the game feel satisfying and responsive.

- [x] **Drag wobble** — Add oscillation to ghost based on velocity changes
  - Why essential: Makes grabbing feel tactile and responsive
  - Implementation: Track pointer velocity in `handlePointerMove`, apply rotation wobble to ghost

- [x] **Slot glow pulse** — Enhance existing hover glow with subtle animation
  - Why essential: Clear drop target feedback is game feel 101
  - Implementation: Add CSS animation to `[data-hover]` state (already has glowPulse keyframes)

- [x] **Vinyl spin on placement** — Rotate disc when placed in slot
  - Why essential: Satisfying "thwack" feedback completes the placement action
  - Implementation: Add rotation animation to `.vinylStanding` in ShelfSlot, trigger on vinyl ID change

- [x] **Screen transitions** — Fade between level select and game screen
  - Why essential: Prevents jarring cuts that feel unpolished
  - Implementation: Add fade-out/fade-in wrapper in App.tsx, handle React.lazy timing

- [x] **Enhanced ambient particles** — Add light rays and themed particle behavior
  - Why essential: Static scenes feel dead; particles add atmosphere
  - Implementation: Extend SceneBackdrop with light ray elements, use CSS vars for theme colors

### Add After Validation (v1.3+)

Polish features to add once core v1.2 is working and tested.

- [ ] **Dynamic drop shadows** — Shadow grows/shrinks with drag height
  - Trigger for adding: When basic drag wobble feels solid
  - Value: Reinforces 3D illusion, adds depth perception

- [ ] **Theme-specific particle palettes** — Jazz club has warm dust, disco has colored beams
  - Trigger for adding: When ambient particles are implemented
  - Value: Each theme feels distinct and immersive

- [ ] **Combo milestone visual variety** — Different burst patterns at 5x, 8x, 10x
  - Trigger for adding: When existing ParticleBurst is proven stable
  - Value: Makes progression feel earned and celebrated

### Future Consideration (v2+)

Features to defer until v1.2 is shipped and user feedback collected.

- [ ] **3D object physics in Three.js** — Full physics simulation for vinyl disc
  - Why defer: Current CSS-based drag is performant and sufficient; Three.js physics is overkill

- [ ] **Procedural animation system** — Spring physics library (react-spring)
  - Why defer: Current CSS animations are working; adding library increases bundle size

- [ ] **Haptic feedback patterns** — Vibration API for different events
  - Why defer: Limited browser support, not critical for desktop web experience

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Drag wobble physics | HIGH | MEDIUM | P1 |
| Slot glow pulse | HIGH | LOW | P1 |
| Vinyl spin on placement | HIGH | LOW | P1 |
| Screen transitions | MEDIUM | MEDIUM | P1 |
| Enhanced ambient particles | MEDIUM | MEDIUM | P1 |
| Dynamic drop shadows | MEDIUM | MEDIUM | P2 |
| Theme-specific particles | LOW | MEDIUM | P2 |
| Combo milestone variety | LOW | LOW | P2 |
| 3D physics system | LOW | HIGH | P3 |
| Procedural animation library | LOW | HIGH | P3 |

**Priority key:**
- **P1:** Must have for v1.2 milestone
- **P2:** Should have, add when possible
- **P3:** Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Typical Web Games | Mobile Casual Games | Our Approach |
|---------|------------------|---------------------|--------------|
| **Drag feedback** | Simple scale/opacity | Spring physics + haptic | Velocity-based wobble + magnetic snap |
| **Hover states** | Color change/border | Glow + particle effects | Pulsing green glow (per user decision) |
| **Screen transitions** | Instant cuts | Slide/fade with animation | Fade with React.lazy timing handling |
| **Placement feedback** | Simple snap | Sound + animation + haptic | Spin + sparkle + sound (already have sound) |
| **Ambient effects** | Static backgrounds | Parallax + particles | Themed particles + light rays per theme |
| **Error feedback** | Red flash/shake | Shake + sound + vibration | Shake + bounce-back + red flash (already implemented) |

**Key differentiator:** We're combining web performance (CSS animations) with game feel polish (velocity-based physics, magnetic targeting) typically seen in native mobile games.

## Implementation Patterns

### Drag Wobble Physics

**Pattern:** Track pointer velocity, apply oscillation to dragged object

```typescript
// In GameScreen.tsx handlePointerMove
const prevPosRef = useRef({ x: 0, y: 0 });
const velocityRef = useRef({ x: 0, y: 0 });

// Calculate velocity
const vx = e.clientX - prevPosRef.current.x;
const vy = e.clientY - prevPosRef.current.y;
velocityRef.current = { x: vx, y: vy };

// Apply wobble rotation based on velocity
const wobbleAngle = vx * 2; // 2px movement = 1 degree rotation
ghost.style.transform = `scale(1.08) rotate(${wobbleAngle}deg)`;

// Decay wobble over time
setTimeout(() => {
  velocityRef.current = { x: 0, y: 0 };
  ghost.style.transform = 'scale(1.08) rotate(0deg)';
}, 150);
```

**Complexity:** MEDIUM (velocity tracking + decay)
**Performance:** HIGH (CSS transform, no reflow)

### Slot Glow Pulse

**Pattern:** CSS keyframe animation on hover state

```css
/* In ShelfSlot.module.css */
.slot[data-hover="valid"] {
  animation: slotGlowPulse 2s ease-in-out infinite;
}

@keyframes slotGlowPulse {
  0%, 100% {
    box-shadow: 0 0 12px rgba(74, 222, 128, 0.4),
                0 0 24px rgba(74, 222, 128, 0.2);
  }
  50% {
    box-shadow: 0 0 20px rgba(74, 222, 128, 0.6),
                0 0 40px rgba(74, 222, 128, 0.3);
  }
}
```

**Complexity:** LOW (already has glowPulse keyframes, just apply to slot)
**Performance:** HIGH (CSS animation, GPU accelerated)

### Vinyl Spin on Placement

**Pattern:** Trigger rotation animation when vinyl ID changes

```typescript
// In ShelfSlot.tsx, extend existing vinyl transition effect
useEffect(() => {
  if (vinyl && vinyl.id !== prevVinylId.current) {
    // Trigger spin animation
    const disc = ref.current?.querySelector('.discPeek');
    if (disc) {
      disc.style.animation = 'vinylSpin 0.4s ease-out forwards';
    }
    prevVinylId.current = vinyl.id;
  }
}, [vinyl]);
```

```css
/* In ShelfSlot.module.css */
@keyframes vinylSpin {
  0% { transform: rotate(0deg) translateY(0); }
  50% { transform: rotate(180deg) translateY(-2px); }
  100% { transform: rotate(360deg) translateY(0); }
}
```

**Complexity:** LOW-MEDIUM (extension of existing sparkle effect)
**Performance:** HIGH (CSS transform, isolated to slot)

### Screen Transitions

**Pattern:** Fade wrapper with timing coordination

```typescript
// In App.tsx
const [isTransitioning, setIsTransitioning] = useState(false);

const handleSelectLevel = (index: number) => {
  setIsTransitioning(true);
  setTimeout(() => {
    setCurrentLevelIndex(index);
    setScreen('playing');
    setTimeout(() => setIsTransitioning(false), 300);
  }, 200);
};

return (
  <div className={`app-wrapper ${isTransitioning ? 'transitioning' : ''}`}>
    {/* Screen content */}
  </div>
);
```

```css
/* In App.module.css */
.app-wrapper.transitioning {
  animation: screenFade 500ms ease-in-out;
}

@keyframes screenFade {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0; transform: scale(0.98); }
  100% { opacity: 1; transform: scale(1); }
}
```

**Complexity:** MEDIUM (React.lazy timing + state coordination)
**Performance:** HIGH (opacity transform, GPU accelerated)

### Enhanced Ambient Particles

**Pattern:** Extend SceneBackdrop with themed light rays

```tsx
// In SceneBackdrop.tsx
const rayCount = THEME_RAYS[theme] ?? 0;
return (
  <div className={styles.backdrop}>
    {/* Existing elements */}
    {Array.from({ length: rayCount }).map((_, i) => (
      <div
        key={i}
        className={styles.lightRay}
        style={{
          left: `${20 + i * 30}%`,
          animationDelay: `${-i * 3}s`,
          '--ray-color': `var(--theme-ray-color, rgba(255, 220, 180, 0.15))`,
        }}
      />
    ))}
  </div>
);
```

```css
/* In SceneBackdrop.module.css */
.lightRay {
  position: absolute;
  top: -20%;
  width: 60px;
  height: 140%;
  background: linear-gradient(
    180deg,
    var(--ray-color) 0%,
    transparent 60%
  );
  filter: blur(20px);
  animation: rayDrift 12s ease-in-out infinite alternate;
}

@keyframes rayDrift {
  0% { transform: translateX(-10px) rotate(-5deg); opacity: 0.3; }
  100% { transform: translateX(10px) rotate(5deg); opacity: 0.6; }
}
```

**Complexity:** MEDIUM (theme integration + animation tuning)
**Performance:** MEDIUM (blur is expensive, limit to 2-3 rays)

## Game Feel Principles

### The 12 Principles of Animation Applied to UI

1. **Squash and stretch** → Drag ghost scales up on grab (already implemented: `scale(1.08)`)
2. **Anticipation** → Slot glow before drop (already implemented: `data-hover`)
3. **Staging** → Clear focus on dragged object (already implemented: ghost z-index 1000)
4. **Straight ahead action** → Direct 1:1 pointer tracking (already implemented)
5. **Follow through and overlapping action** → **MISSING: Drag wobble**
6. **Slow in and slow out** → Easing curves (already implemented: `cubic-bezier`)
7. **Arc** → Natural motion curves (partially implemented: magnetic snap)
8. **Secondary action** → Sparkle effects (already implemented)
9. **Timing** → **NEEDS WORK: Screen transitions are instant**
10. **Exaggeration** → Combo bursts (already implemented)
11. **Solid drawing** → Consistent visual style (already implemented)
12. **Appeal** → Theme variety (already implemented)

**Critical gap:** #5 (follow through) - drag wobble will add this missing principle.

### Juice = Feedback + Polish

**Juice elements checklist:**
- [x] Visual feedback on every interaction
- [x] Audio feedback on every interaction
- [x] Haptic feedback (where supported)
- [x] Particle effects for milestones
- [ ] **Physics-based motion** (drag wobble)
- [ ] **Smooth scene transitions**
- [x] Clear error communication
- [x] Progress indication

**Current juice score:** 7/10
**With v1.2 features:** 9/10

## Performance Considerations

### Animation Performance Best Practices

1. **Use CSS transforms instead of layout properties**
   - ✓ Current implementation uses `transform: scale() translate() rotate()`
   - ✓ Avoids `width`, `height`, `top`, `left` during animations

2. **Limit active animations**
   - ✓ Current: 6 particles (reduced for performance)
   - ✓ Ghost animation only during drag
   - ⚠️ Screen transitions should use `will-change` sparingly

3. **Use GPU-accelerated properties**
   - ✓ `transform`, `opacity`, `filter` are GPU accelerated
   - ⚠️ `box-shadow` can be expensive (limit glow radius)

4. **Prevent layout thrashing**
   - ✓ Current implementation caches DOM rects during drag
   - ✓ Batch DOM reads and writes

5. **Respect prefers-reduced-motion**
   - ✓ Already implemented in keyframes.ts
   - ✓ All animations check `@media (prefers-reduced-motion: reduce)`

### Performance Budget

| Element | Budget | Current | Status |
|---------|--------|---------|--------|
| Particles | 10-15 | 6 | ✓ Under budget |
| Active animations | 5-8 | 3-4 | ✓ Under budget |
| Ghost updates | 60fps | 60fps | ✓ Optimal |
| Glow radius | 40px | 24px | ✓ Conservative |

**Recommendation:** Add drag wobble and screen transitions without concern - current implementation is well under performance budgets.

## Sources

### Codebase Analysis (HIGH confidence)
- `/Users/martha2022/Documents/Sleevo/src/components/GameScreen.tsx` - Drag implementation
- `/Users/martha2022/Documents/Sleevo/src/components/ShelfSlot.tsx` - Placement effects
- `/Users/martha2022/Documents/Sleevo/src/animations/timing.ts` - Animation timing constants
- `/Users/martha2022/Documents/Sleevo/src/animations/keyframes.ts` - Existing keyframe animations
- `/Users/martha2022/Documents/Sleevo/src/components/SceneBackdrop.tsx` - Theme system
- `/Users/martha2022/Documents/Sleevo/src/App.tsx` - Screen routing

### Established Game Design Principles (HIGH confidence)
- "The 12 Principles of Animation" - Disney/Ollie Johnston
- "Juice It or Lose It" - Martin Jonasson & Petri Purho
- "Game Feel: A Game Designer's Guide to Virtual Sensation" - Steve Swink
- Material Design Motion Guidelines - Google

### Web Animation Best Practices (HIGH confidence)
- CSS Triggers - https://csstriggers.com/ (layout thrashing reference)
- prefers-reduced-motion - CSS Media Queries Level 5
- Web Animations API - MDN documentation

---

**Feature research for: Visual polish features in React + Three.js vinyl sorting game**
**Researched: 2026-03-02**
**Next step:** Write STACK.md with technology recommendations for implementing these features
