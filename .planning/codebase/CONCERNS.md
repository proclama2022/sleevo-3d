# Codebase Concerns

**Analysis Date:** 2026-02-10

## Tech Debt

**Massive App.tsx Component:**
- Issue: App.tsx contains 2,225+ lines of code with mixed responsibilities
- Files: `App.tsx`
- Impact: Difficult to maintain, test, and understand. Hot reload performance suffers
- Fix approach: Split into smaller components based on features (GameScreen, MenuScreen, SettingsScreen)

**Missing Error Logging Service:**
- Issue: ErrorBoundary logs only to console
- Files: `components/ErrorBoundary.tsx:49`
- Impact: Production errors cannot be tracked or analyzed
- Fix approach: Integrate Sentry or similar error tracking service

**Inline Style Constants:**
- Issue: CSS magic numbers and durations scattered throughout code
- Files: `App.tsx`, `constants/gameConfig.ts`
- Impact: Inconsistent animations, hard to maintain theme
- Fix approach: Centralize all animation constants in a single file with CSS variables

## Known Bugs

**Mobile Performance Issues:**
- Symptoms: Particle explosions lag on mobile devices
- Files: `App.tsx:93`
- Trigger: High particle count on mobile
- Workaround: Particles already limited to 8 on mobile, but could be further optimized

**Potential Memory Leaks:**
- Symptoms: Timers and intervals may not clean up properly
- Files: `App.tsx:414, 470`
- Trigger: Component unmount during active intervals
- Workaround: Add cleanup useEffects for all intervals

**Audio Context State:**
- Symptoms: Audio may not initialize properly on iOS
- Files: `services/audio.ts:40`
- Trigger: iOS requires user interaction before audio context
- Workaround: Already handled with `initAudioContext()` but may need fallback

## Security Considerations

**localStorage Storage:**
- Risk: User data exposed if device is compromised
- Files: `services/storage.ts`
- Current mitigation: Data is JSON serialized and versioned
- Recommendations: Consider encrypting sensitive save data

**No CSP Headers:**
- Risk: Potential for XSS if added in future
- Files: No CSP configuration found
- Current mitigation: React's built-in XSS protection
- Recommendations: Add Content Security Policy headers when deploying

## Performance Bottlenecks

**Heavy DOM Manipulation:**
- Problem: Frequent style updates during drag/drop
- Files: `App.tsx`
- Cause: Direct CSS property manipulation on RAF
- Improvement path: Use CSS transforms with will-change property

**Particle System Performance:**
- Problem: Many DOM elements created/destroyed
- Files: `App.tsx`
- Cause: CSS-based particle explosions
- Improvement path: Canvas-based particle system for better performance

**Unnecessary Re-renders:**
- Problem: Complex game state causes frequent re-renders
- Files: `App.tsx`
- Cause: Large game state object passed to many components
- Improvement path: Split state into multiple useState hooks, use React.memo

## Fragile Areas

**Random Events System:**
- Files: `services/randomEvents.ts`, `App.tsx`
- Why fragile: Complex conditional logic, multiple active events possible
- Safe modification: Add state validation before applying event effects
- Test coverage: Limited testing of event combinations

**Achievement System:**
- Files: `constants/achievements.ts`, `services/storage.ts`
- Why fragile: Hardcoded achievement IDs, complex progression logic
- Safe modification: Create achievement registry type
- Test coverage: Missing achievement edge case tests

**Game State Management:**
- Files: `App.tsx`
- Why fragile: Single large state object, many dependent updates
- Safe modification: Break into smaller state slices
- Test coverage: No comprehensive game state tests

## Scaling Limits

**Memory Usage:**
- Current capacity: Unknown, no memory monitoring
- Limit: Browser tabs may crash with large save data
- Scaling path: Implement save data compression and chunking

**Save Data Size:**
- Current capacity: Grows with collection and achievements
- Limit: localStorage typically 5-10MB
- Scaling path: IndexedDB for larger save data

## Dependencies at Risk

**React 19:**
- Risk: New version may break existing patterns
- Impact: All components
- Migration plan: Monitor React 19 stability, test early

**Capacitor:**
- Risk: Platform updates may break iOS build
- Impact: Mobile deployment
- Migration plan: Keep Capacitor updated, test on new iOS versions

## Missing Critical Features

**Cloud Save Sync:**
- Problem: Only local storage
- Blocks: Player progression loss if device changed
- Priority: Medium

**Analytics:**
- Problem: No user behavior tracking
- Blocks: Game balance improvements
- Priority: Low

## Test Coverage Gaps

**Game Logic Tests:**
- What's not tested: Score calculation, combo mechanics, level generation
- Files: `services/gameLogic.ts`
- Risk: Game-breaking bugs in core mechanics
- Priority: High

**Component Integration Tests:**
- What's not tested: Component interactions, drag/drop flow
- Files: All components
- Risk: UI state inconsistencies
- Priority: Medium

**Audio Integration Tests:**
- What's not tested: Audio context initialization, volume controls
- Files: `services/audio.ts`
- Risk: Silent game or audio errors
- Priority: Low

---

*Concerns audit: 2026-02-10*