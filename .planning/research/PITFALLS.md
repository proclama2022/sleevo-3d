# Pitfalls Research

**Domain:** React + Three.js visual polish features (drag wobble, slot glow, level transitions, vinyl spin, ambient particles)
**Researched:** 2026-03-02
**Confidence:** MEDIUM

## Executive Summary

Adding visual polish to an existing React + Three.js game introduces specific performance and integration challenges. The codebase already uses direct DOM manipulation for drag interactions (GameScreen.tsx lines 442-520), which provides good performance but creates complexity when adding new animations. Key risks include: React render loops disrupting Three.js animations, memory leaks from undisposed Three.js objects, layout thrashing from CSS animations during drag, and over-animating causing visual fatigue. The game's existing particle system (lines 36-44) is already optimized for performance with only 6 particles.

## Critical Pitfalls

### Pitfall 1: The React/Three.js Render Loop Conflict

**What goes wrong:**
React state updates during Three.js animations cause jank. When adding drag wobble or vinyl spin, triggering React re-renders every frame creates严重的性能问题 because React's virtual DOM diff runs alongside Three.js's render loop, competing for the main thread.

**Why it happens:**
The existing codebase uses direct DOM manipulation for drag interactions to avoid React re-renders (see `ghostRef` usage in GameScreen.tsx). Developers adding new animations might naively use `useState` for animation values, causing React to re-render the entire component tree on every animation frame.

**How to avoid:**
- Use `useRef` for animation state that doesn't need to trigger React renders
- Keep animation state in Three.js objects, not React state
- Only sync to React state when animation completes or needs UI update
- Follow the existing pattern: direct DOM manipulation during interactions, React state for discrete state changes
- Use `requestAnimationFrame` for all animation updates, never `setInterval`

**Warning signs:**
- Drag interaction feels sluggish or "stuttery"
- Frame rate drops below 50fps during animations
- React DevTools shows excessive re-renders during interactions
- Profiler shows React commit phase taking >10ms during animations

**Phase to address:**
Phase implementing drag wobble and vinyl spin (earliest animation phases)

---

### Pitfall 2: Memory Leaks from Undisposed Three.js Objects

**What goes wrong:**
Three.js geometries, materials, and textures accumulate in memory when level transitions occur or particles are created/destroyed. The browser's memory usage grows unbounded until the tab crashes or becomes extremely slow.

**Why it happens:**
Three.js objects are not garbage collected automatically. When creating particle systems, glow effects, or spin animations, developers often create new geometries/materials without calling `.dispose()` on old ones. Level transitions compound this by creating new scenes without properly cleaning up the old one.

**How to avoid:**
```typescript
// Always dispose when unmounting or transitioning
useEffect(() => {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial();

  return () => {
    geometry.dispose();
    material.dispose();
  };
}, []);

// For particle systems, reuse geometries
const particleGeometry = useMemo(() =>
  new THREE.BufferGeometry(), []
);
```
- Track all created Three.js objects in refs
- Create a cleanup function that disposes all objects
- Use `useEffect` cleanup functions rigorously
- For ambient particles, consider a single long-lived system vs. creating/destroying

**Warning signs:**
- Memory usage in Chrome DevTools grows continuously while playing
- Performance degrades after completing several levels
- "Warning: Too many active WebGL contexts" in console
- Textures appear corrupted or blank after playing for 10+ minutes

**Phase to address:**
Phase implementing ambient particles and level transitions (before adding complex particle systems)

---

### Pitfall 3: Layout Thrashing from CSS Transitions During Drag

**What goes wrong:**
CSS transitions on layout properties (width, height, top, left) force browser reflows. When these overlap with the drag loop, the browser must recalculate layout on every frame, causing severe jank. The existing drag system uses direct style manipulation but adding slot glow transitions could trigger this.

**Why it happens:**
CSS transitions are convenient for smooth animations. Developers might add transitions to slot glow effects or level transitions using properties like `top`, `left`, `width`, or `height`. During drag, these interact with the existing drag positioning code, causing layout thrash.

**How to avoid:**
- Use `transform` and `opacity` exclusively for animations (GPU-accelerated)
- Never animate layout properties during interactive sequences
- Use `will-change: transform, opacity` sparingly on animated elements
- For slot glow, use `box-shadow` or `filter` transitions, not size/position
- Test drag performance while slot glow is active

**Warning signs:**
- Drag feels "heavy" or "muddy"
- Slot glow animations cause drag to stutter
- Chrome DevTools Performance tab shows excessive "Recalculate Style" and "Layout" events
- Frame rate drops only when hovering over slots

**Phase to address:**
Phase implementing slot glow (test with drag system)

---

### Pitfall 4: Over-Animating and Visual Fatigue

**What goes wrong:**
Too many simultaneous animations create visual noise and cognitive overload. The existing code already has: drag ghost, combo popups, score popups, particle bursts, dust particles. Adding wobble, spin, glow, and transitions without restraint makes the game feel chaotic rather than polished.

**Why it happens:**
Each feature is implemented in isolation, looking good on its own. When combined, they compete for attention. The "more is better" fallacy leads to animating everything that can be animated.

**How to avoid:**
- Establish an "animation budget" - max 3 simultaneous animations per screen
- Use animation priorities: critical feedback (drop validation) > atmosphere > decoration
- Suppress lower-priority animations during high-intensity moments (combo streaks, rush mode countdown)
- Add animation toggles in settings for accessibility
- Follow the existing pattern: particles are already reduced to 6 for performance (line 37)

**Warning signs:**
- Playtesters complain about visual clutter or distraction
- Can't clearly see the core game mechanics through the effects
- Animations feel "busy" rather than "smooth"
- User testing shows decreased performance with all effects enabled

**Phase to address:**
All phases - but establish animation guidelines in the first polish phase

---

### Pitfall 5: Breaking the Existing Drag Performance Optimizations

**What goes wrong:**
The existing drag system uses aggressive optimizations: cached rect calculations (line 93), direct DOM manipulation (lines 442-446), and state updates only on commit (lines 569-574). Adding animations that trigger React re-renders during drag breaks these optimizations and kills performance.

**Why it happens:**
New animations might use `useState` for visual feedback during hover, drag, or drop states. Each `setState` triggers a React re-render, which recalculates the entire component tree and destroys the drag performance.

**How to avoid:**
- Study the existing drag optimization pattern carefully
- Any animation during drag MUST use direct DOM manipulation, not React state
- Only update React state on drag commit (drop)
- Use `data-*` attributes for visual feedback during drag (existing pattern lines 499-504)
- Never `setState` in `handlePointerMove` or similar hot paths

**Warning signs:**
- Drag performance drops from 60fps to <30fps
- React DevTools shows re-renders on every pointer move
- Drag ghost lags behind cursor
- Input feels "floaty" or unresponsive

**Phase to address:**
Phase implementing drag wobble - must integrate with existing drag system

---

### Pitfall 6: Ignoring Accessibility in Visual Polish

**What goes wrong:**
Motion-heavy animations trigger vestibular disorders, migraines, or nausea in some users. The game becomes unplayable for users with motion sensitivity.

**Why it happens:**
Visual polish often emphasizes motion and dynamism. Developers without motion sensitivity may not realize their effects are harmful, and accessibility is often an afterthought in "polish" phases.

**How to avoid:**
- Respect `prefers-reduced-motion` media query for all non-essential animations
- Add a "Reduce Motion" setting in the audio/settings overlay (already have AudioSettingsOverlay.tsx)
- Keep essential feedback (valid/invalid drop) accessible even with motion off
- Use color and position changes as primary feedback, motion as reinforcement
- Test with screen reader and keyboard navigation

**Warning signs:**
- No `prefers-reduced-motion` checks in CSS or JS
- All animations are essential to understand game state
- No way to disable specific effects
- User complaints about dizziness or nausea

**Phase to address:**
All phases - add motion toggle in first phase, respect in all subsequent phases

---

### Pitfall 7: Level Transition Timing Mismatches

**What goes wrong:**
Level transitions feel disjointed when animation timing doesn't match state updates. The player sees the old level briefly after the new level should be loaded, or UI elements appear before the scene is ready.

**Why it happens:**
React state updates, Three.js scene transitions, and CSS animations all have different timing models. Orchestrating them requires careful sequencing. The existing code uses `NEXT_LEVEL` action and immediate state update (lines 234-235, 651-667) without transition handling.

**How to avoid:**
```typescript
// Sequence transitions properly:
// 1. Fade out current UI
// 2. Update game state
// 3. Load new level assets
// 4. Fade in new UI
const handleLevelTransition = async () => {
  await fadeOutCurrent(); // CSS transition promise
  dispatch({ type: 'NEXT_LEVEL', ... });
  await loadNewAssets(); // Three.js loading
  await fadeInNew(); // CSS transition promise
};
```
- Use transition promises or callbacks to sequence operations
- Show loading state if asset loading is slow
- Keep state updates atomic during transitions
- Test on slow connections and devices

**Warning signs:**
- Flash of old content during transition
- UI elements appear before scene is ready
- Transition feels "glitchy" or incomplete
- Can interact with old level briefly after transition starts

**Phase to address:**
Phase implementing level transitions

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| CSS animations for everything | Quick implementation, smooth 60fps | Hard to sequence with game state, breaks pause/freeze | Only for non-critical decorative elements (ambient particles) |
| Reusing existing particle system | Faster development, consistent look | Can't optimize for different use cases | If performance is acceptable with max particle count |
| Hardcoded animation timing | Easier to tweak | Impossible to adjust for difficulty or accessibility | NEVER for interactive feedback, MAYBE for decorative effects |
| Skipping dispose() calls | Faster to implement, works initially | Memory leaks, crashes after extended play | Only during rapid prototyping, never in production |
| setState for animations | Simpler code, React-idiomatic | Performance death in drag/render loops | NEVER in hot paths (drag, render), ONLY for UI state |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Slot glow with drag validation | Updating React state during hover for glow effect | Use `data-hover` attribute like existing validation (line 499) |
| Vinyl spin with placement | Spin animation doesn't respect placement validation | Animate spin only for placed vinyls in `placedVinyls` map |
| Drag wobble with ghost | Wobble animation conflicts with ghost positioning | Apply wobble to ghost transform, not separate element |
| Level transitions with sound | Transition finishes before audio completes | Use audio events to sequence transition completion |
| Particle systems with level themes | Particles don't match level aesthetic | Update particle colors/intensity when level theme changes (line 246) |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Creating new geometries per particle | Memory grows linearly with particle count | Reuse geometry, update positions in buffer | >100 particles or frequent creation/destruction |
| CSS box-shadow animations during drag | Drag jank when hovering over slots | Use `filter: drop-shadow()` or pre-render shadow | >5 simultaneous shadow animations |
| setState on every animation frame | Unplayable framerates during animations | Use refs for animation state, batch updates | Any animation running >30fps |
| Unthrottled resize handlers | Lag during window resize on desktop | Debounce/throttle resize, use CSS for responsive | Any resize during gameplay |
| Not using will-change strategically | Animations stutter first time they run | Add `will-change` before animation starts, remove after | Complex transforms on mobile devices |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing animation settings in localStorage without validation | XSS if user data is compromised | Validate/sanitize all stored settings |
| Inline event handlers in animation code | XSS if user-generated content is added | Use event listeners, not inline handlers |
| Not sanitizing level data before rendering animations | Code injection if levels are user-generated | Validate all level data types and ranges |

**Note:** This game uses local data only (no user-generated levels), so security risks are minimal. These become important if adding user-generated content later.

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Animations can't be skipped | User feels trapped waiting for effects | Add click/skip to dismiss animations |
| Too much motion during critical moments | User can't focus on gameplay | Reduce motion during rush mode countdown, high combos |
| No feedback when animations are disabled | User thinks something is broken | Provide alternative visual feedback (color, icons) |
| Inconsistent animation timing | Game feels unpolished or buggy | Use easing functions and duration from design tokens |
| Animations mask loading times | User thinks game froze | Show loading state or skeleton during long transitions |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Drag wobble:** Often missing collision with shelf edge during wobble — verify wobble doesn't clip through shelf boundaries
- [ ] **Slot glow:** Often missing persistence after successful drop — verify glow stays visible for appropriate duration
- [ ] **Vinyl spin:** Often missing synchronization with game state — verify spin stops when level completes or restarts
- [ ] **Ambient particles:** Often missing performance scaling on low-end devices — verify particle count adjusts based on device capability
- [ ] **Level transitions:** Often missing handling of back/forward browser buttons — verify transitions don't break browser navigation
- [ ] **All animations:** Often missing pause/freeze behavior — verify all animations respect game pause state
- [ ] **All animations:** Often missing `prefers-reduced-motion` support — verify motion can be reduced or disabled

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Memory leak from undisposed objects | HIGH | 1. Add memory profiling 2. Find leak source with Chrome DevTools 3. Add dispose() calls 4. Test with automated memory leak detection |
| Drag performance broken | MEDIUM | 1. Profile to confirm React re-renders 2. Replace setState with direct DOM manipulation 3. Remove animations from drag hot path 4. Verify 60fps return |
| Layout thrashing from CSS | LOW | 1. Identify layout animations in CSS 2. Replace with transform/opacity 3. Verify no reflow in DevTools 4. Test drag performance |
| Visual fatigue from over-animation | MEDIUM | 1. Audit all animations 2. Prioritize by importance 3. Add motion reduction setting 4. Test with users |
| Level transition timing broken | MEDIUM | 1. Map out all transition events 2. Add sequencing promises 3. Handle edge cases (slow load) 4. Test on slow connections |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| React/Three.js render conflict | Phase implementing drag wobble and vinyl spin | Profile during drag, verify <5ms React commit time |
| Memory leaks from undisposed objects | Phase implementing ambient particles | Memory profiling after 20 level transitions |
| Layout thrashing from CSS | Phase implementing slot glow | Chrome DevTools Performance tab during drag + hover |
| Over-animating | First polish phase - establish guidelines | User testing feedback on visual clarity |
| Breaking drag performance | Phase implementing drag wobble | Drag framerate must stay >55fps |
| Accessibility - motion sensitivity | First polish phase - add motion toggle | Test with `prefers-reduced-motion` enabled |
| Level transition timing | Phase implementing level transitions | Test on slow 3G connection, old mobile device |

---

## Sources

- Three.js official documentation on memory management and disposal (2025) — MEDIUM confidence
- React rendering optimization patterns from React.dev (2024) — HIGH confidence
- Web.dev animations performance guidelines (2024) — HIGH confidence
- CSS `will-change` and GPU acceleration best practices (MDN, 2024) — HIGH confidence
- WCAG 2.1 Success Criterion 2.3.3 (Animation from Interactions) — HIGH confidence
- Chrome DevTools Performance profiling documentation (2024) — HIGH confidence
- Existing codebase patterns (GameScreen.tsx, engine.ts) — HIGH confidence

---

**Confidence Assessment:**
- Performance patterns: HIGH (based on official docs and proven patterns)
- React/Three.js integration: HIGH (based on existing codebase analysis)
- Accessibility requirements: HIGH (WCAG is well-established)
- Three.js memory management: MEDIUM (official docs are clear but complex)
- Animation timing best practices: MEDIUM (some variance in recommendations)

**Research Gaps:**
- Specific performance benchmarks for drag wobble animations (would need prototyping)
- Optimal particle count for ambient atmosphere on low-end devices (needs device testing)
- Best practices for sequencing CSS animations with Three.js renders (limited official guidance)

---
*Pitfalls research for: React + Three.js visual polish features*
*Researched: 2026-03-02*
