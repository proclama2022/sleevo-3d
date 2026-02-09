# Codebase Concerns

**Analysis Date:** 2026-02-07

## Tech Debt

**Overly Large App Component:**
- Issue: `App.tsx` is 655 lines - monolithic component handling game logic, UI rendering, state management, and event handling all in one place
- Files: `App.tsx`
- Impact: Difficult to maintain, test, and reason about. Hard to reuse logic. Performance degradation as state updates cascade through the entire tree.
- Fix approach: Extract game state management to custom hook (`useGameState`), separate game logic from UI rendering, break down into smaller components (`GameBoard`, `ShelfSection`, `HUD`)

**Magic Numbers Scattered Throughout:**
- Issue: Hard-coded values like `120` (MAGNET_RADIUS), `100` (TRASH_RADIUS), `0.6s` animation durations, `3000ms` combo timeout scattered across files without explanation
- Files: `App.tsx` (lines 11-12, 74, 422, 436, etc.)
- Impact: Difficult to tune game feel, understand design intent, or maintain consistency across features
- Fix approach: Create `src/constants/gameConfig.ts` or `src/constants/ui.ts` with all magic numbers as named constants with JSDoc comments

**Type Safety Issues:**
- Issue: `colorMap: any` on line 394 of `App.tsx` uses loose typing for genre-to-color mapping
- Files: `App.tsx:394`
- Impact: Could pass invalid colors, reduces IDE autocomplete, error-prone refactoring
- Fix approach: Create `GENRE_COLOR_MAP` constant with proper typing matching `Record<Genre, string>`

**Untyped Event Handler Parameters:**
- Issue: Event handlers lack proper typing - `(e: React.PointerEvent)` is used but `clientX`/`clientY` accessed without null checks; `(e) => {}` anonymous handlers in several places
- Files: `App.tsx:236, 272, 334, 595`
- Impact: Potential runtime errors if event properties are undefined, lost developer intent
- Fix approach: Create typed event handler wrappers, always validate event before accessing properties

**Unsafe Non-Null Assertions:**
- Issue: Multiple uses of non-null assertion operator (`!`) without proper validation
- Files: `App.tsx:395-396` - `rect!.left`, `rect!.width/2` used after uncertain null check
- Impact: Runtime crashes if rect is unexpectedly null
- Fix approach: Replace with proper conditional guards and fallback values

## Known Bugs

**Explosion Particle Cleanup Bug:**
- Symptoms: Old explosions may not properly remove from DOM, orphaned particles could accumulate
- Files: `App.tsx:247-248, 364-365, 395-396`
- Trigger: Rapidly perform actions that trigger explosions (dust cleaning, trash drops, successful placements)
- Current behavior: Uses `setTimeout` to slice explosions array, but timing could race with rapid updates
- Fix approach: Replace `setTimeout(..., 600)` cleanup with cleanup function in useEffect or dedicated explosion component lifecycle

**React Key Anti-Pattern in Flying Vinyls:**
- Symptoms: Flying vinyl animations may skip/lag on rapid successive placements
- Files: `App.tsx:410` - Uses `Math.random().toString(36)` as unique ID, but could collide in extremely rare cases
- Trigger: Very rapid item placements (combo multiplier increasing)
- Probability: Extremely low but theoretically possible
- Fix approach: Use incrementing counter or UUID library for guaranteed unique keys

**Combo Timer Not Always Cleared:**
- Symptoms: Combo multiplier could persist longer than intended across level transitions
- Files: `App.tsx:160, 380, 436`
- Trigger: Level change or menu return without final combo completion
- Current behavior: `comboTimerRef.current` cleared in `handleMistake` but not all state transitions
- Fix approach: Clear combo timer in level reset function and when transitioning to menu

**Window Inner Width Accessed Without Listener:**
- Symptoms: Responsive breakpoint (mobile vs desktop) determined at render time but doesn't update on resize
- Files: `App.tsx:598, 622` - `window.innerWidth < 768` checked directly in render
- Trigger: User rotates device or resizes browser window
- Impact: UI doesn't reflow properly, vinyl sizes stay frozen
- Fix approach: Create `useWindowSize` hook with resize listener, or use CSS media queries instead

**DOM Reference Safety Issue:**
- Symptoms: Potential undefined references when accessing crate positions
- Files: `App.tsx:294-308` - Iterates through `crateRefs.current` and casts to `HTMLDivElement` without null check
- Trigger: If ref registration fails or element is removed mid-drag
- Fix approach: Add null checks before `getBoundingClientRect()` calls

## Performance Bottlenecks

**Expensive Re-renders on Every Pointer Move:**
- Problem: `handlePointerMove` is called constantly (60+ times per second during drag), causing full component re-render
- Files: `App.tsx:272-332`
- Cause: Direct DOM updates via `dragElRef.current.style.transform` mixed with state updates via `setMagnetTargetId`. React re-renders entire component tree checking for changes.
- Current approach: Uses `useLayoutEffect` to force immediate reflow, but component still renders multiple times per move
- Improvement path:
  - Move drag element to separate memoized component that doesn't trigger parent re-renders
  - Use ref-based position tracking for non-state animation values
  - Consider using `useTransition` for non-blocking state updates if available

**Array Slice Operations for Cleanup:**
- Problem: Using `.slice(1)` on explosions array and flying vinyls array every frame
- Files: `App.tsx:248, 365, 429`
- Cause: Inefficient array manipulation - creates new array objects constantly
- Current impact: Minor but accumulates with multiple particle effects
- Improvement path: Use index-based filtering or dedicated cleanup service

**useCallback Dependency Chain:**
- Problem: `handleLanding` callback has extensive dependencies that may change frequently
- Files: `App.tsx:425-443`
- Cause: Callback needs to access `comboTimerRef`, game state, and more. If dependencies change, callback is recreated, invalidating memoization
- Impact: Child components like `FlyingVinylItem` may re-render unnecessarily
- Fix approach: Memoize dependencies separately or use context to avoid prop drilling

**Seeded Random Generation on Every Render:**
- Problem: `seededRandom` function in `VinylCover` is computed fresh on every vinyl render
- Files: `components/VinylCover.tsx:86-87`
- Cause: Used inside `useMemo` but the function generator creates new RNG each time
- Impact: Minor performance hit, but violates intent of memoization (geometric art should be stable per vinyl)
- Fix approach: Move seeded random generator outside component or cache it

## Fragile Areas

**Game State Machine Fragility:**
- Files: `App.tsx:122-136` (gameState object), `services/gameLogic.ts`
- Why fragile: Game state transitions not explicitly defined - multiple `status`, `mode`, and `difficulty` combinations, no validation of legal transitions
- Safe modification: Create explicit transition function `transitionGameState(currentState, action) => newState` with exhaustive switch
- Test coverage: No tests for state transitions, only game logic generation is partially covered
- Risk: Unintended state combinations (e.g., `status: 'playing'` with `mode: 'SuddenDeath'` but `movesLeft: 999`)

**Ref-Based Dragging System:**
- Files: `App.tsx:140-148` (multiple ref declarations), `dragElRef`, `dragPosRef`, `initialDragPosRef`, `crateRefs`
- Why fragile: 5+ different refs managing drag state manually with complex coordinate math (lines 279-332), no validation that refs are set before use
- Safe modification: Create `useDragState` custom hook to encapsulate all drag logic and ref management
- Test coverage: No drag logic tests, only visual/integration testing possible
- Risk: Pointer events can fire when refs are null (race condition during state transitions)

**Hardcoded Visual Constants in Components:**
- Files: `components/CrateBox.tsx` (size multipliers, colors), `components/VinylCover.tsx` (size calculations)
- Why fragile: Sizes tied to tailwind classes and pixel values (e.g., `w-[130px] md:w-[160px]` vs responsive logic)
- Safe modification: Extract all layout dimensions to constants, use CSS custom properties or design tokens
- Risk: Changing one size breaks alignment/positioning elsewhere

**Flying Vinyl Animation Assumptions:**
- Files: `App.tsx:70-103` (FlyingVinylItem component)
- Why fragile: Assumes 600ms animation duration, hardcoded cubic-bezier easing, assumes target rect is always valid
- Safe modification: Add validation for rect, extract timing to constants, allow customizable easing
- Test coverage: No tests for animation completion or edge cases
- Risk: If animation timing changes, other timeouts (combo, explosions) go out of sync

**Event Handler Cleanup Gaps:**
- Files: `App.tsx` (multiple setTimeout/setInterval calls without centralized cleanup)
- Why fragile: Scattered timer cleanup - some timers cleaned in effects (line 186), some in handlers (line 381), some rely on automatic cleanup
- Safe modification: Create `useGameTimer` hook to centralize all game-related timers with guaranteed cleanup
- Test coverage: No timeout/interval tests
- Risk: Memory leaks if component unmounts before timers fire

## Scaling Limits

**Menu Animation Performance with Many Particles:**
- Current capacity: 8 particles per explosion * ~10 explosions visible at once = 80 DOM elements
- Limit: Browser starts to stutter around 100+ simultaneous animated particles on mid-range devices
- Scaling path: Implement particle pool reuse or switch to CSS animation-based particles with Web Workers
- Current impact: On older devices (iOS 12-13), multiple explosions cause frame drops

**Crate Count Scaling:**
- Current capacity: 4 crates max (hardcoded on line 86 of gameLogic.ts)
- Limit: UI breaks beyond 5-6 crates (overflow issues on mobile, layout spacing)
- Scaling path: Implement horizontal scrolling or grid layout for crate selection beyond 4
- Current impact: Game levels max out visually at level ~20

**Vinyl Array Size:**
- Current capacity: ~30-50 vinyls per level
- Limit: Re-render performance degrades significantly with 100+ vinyls in shelf (DOM tree too large)
- Scaling path: Implement virtual scrolling for vinyl shelf, only render visible items
- Current impact: Future difficulty increases blocked without refactor

**Game State Serialization:**
- Current capacity: No persistence layer - game progress lost on page refresh
- Limit: LocalStorage can only handle ~5MB, would support ~100 game saves max
- Scaling path: Implement IndexedDB for larger storage, add compression for serialized state
- Current impact: Players can't save progress mid-game

## Dependencies at Risk

**Capacitor Version Mismatch Risk:**
- Risk: Using `@capacitor/core@^8.0.2` but Capacitor 8 is now in maintenance (released ~2021)
- Files: `App.tsx:7-8` (imports), `vite.config.ts` (not bundled as plugin)
- Impact: Security updates for native API vulnerabilities may be delayed, features locked to older Capacitor API
- Current behavior: Gracefully falls back to browser vibration if native unavailable (line 63-67)
- Migration plan: Update to Capacitor 6+ (latest), test native platform integrations, update all three plugins together

**React 19 Early Adoption:**
- Risk: Using React 19.2.4 (very new, released early 2025), some libraries may not support it yet
- Files: `package.json:12` (dependency), entire codebase uses React hooks
- Impact: Potential compatibility issues with future third-party components, experimental features could be unstable
- Current behavior: Works well with lucide-react and react-dom, but ecosystem support is still building
- Mitigation: Pin React version explicitly, monitor breaking changes in minor releases

**Lucide React Icon Library:**
- Risk: Using lucide-react 0.563.0 - large library for just 10 icons used
- Files: `App.tsx:6` (10 icons imported)
- Impact: Adds ~50KB to bundle (minified), slows initial load
- Improvement path: Switch to inline SVG or smaller icon library, or tree-shake better with build config

## Missing Critical Features

**No Error Boundary:**
- Problem: Any runtime error in game code will crash entire app with white screen
- Blocks: Users can't recover without reload, errors aren't reported
- Recommendation: Add `ErrorBoundary` component wrapping `App`, log errors to external service

**No Offline Support:**
- Problem: Game requires network only for Capacitor (which is optional), but no manifest caching for PWA
- Blocks: Game won't work if user loses internet briefly (unlikely, but asset loading would fail)
- Current impact: Minimal, but should add service worker for robustness

**No Accessibility (a11y):**
- Problem: No alt text on visual elements, no keyboard navigation, no screen reader support
- Blocks: Game unplayable for visually/mobility impaired users
- Recommendation: Add ARIA labels, keyboard-accessible menus, high-contrast mode option

**No Analytics or Telemetry:**
- Problem: No way to track user behavior, level difficulty balance, or crash statistics
- Blocks: Can't iterate on game feel or identify if certain levels are too hard
- Recommendation: Add basic event tracking (level starts, level completes, time spent per level)

**No Save System:**
- Problem: Game progress is lost on refresh - no checkpointing
- Blocks: Players can't resume mid-game or track high scores
- Recommendation: Implement `useGamePersistence` hook with LocalStorage, add save slot UI

## Test Coverage Gaps

**No Unit Tests for Game Logic:**
- What's not tested: `services/gameLogic.ts` functions like `generateLevel`, `calculateScore`, `getXPToNextLevel`
- Files: `services/gameLogic.ts`
- Risk: Progression scaling could break silently - difficulty changes, scoring formula typos won't be caught
- Priority: HIGH - Game logic is core and deterministic, easy to test
- Recommended test suite:
  ```typescript
  // Test generateLevel produces correct crate counts
  // Test trash count scales with difficulty and level
  // Test all genres are eventually unlocked
  // Test calculateScore follows multiplier formula
  ```

**No Component Integration Tests:**
- What's not tested: Drag-drop flow, vinyl landing animations, crate highlighting
- Files: `App.tsx`, `components/*`
- Risk: Visual bugs in interaction flow won't surface until manual testing
- Priority: MEDIUM - Behavior is testable with @testing-library/react
- Recommended coverage: Drag events, magnet radius collision, successful/failed drops

**No State Transition Tests:**
- What's not tested: Game state changes (menu → playing → won → menu, etc.)
- Files: `App.tsx:122-136` (game state definition and transitions)
- Risk: Invalid state combinations possible, edge cases like level skip not handled
- Priority: HIGH - Prevents hard-to-debug runtime bugs

**No Performance Profiling:**
- What's not tested: Re-render performance, memory leaks from timers/animations
- Files: All files with effects and timers
- Risk: Slowdowns on lower-end devices go undetected, accumulating tech debt
- Priority: MEDIUM - Use React DevTools Profiler to identify bottlenecks

**No Cross-Browser Testing:**
- What's not tested: Safari compatibility, older Android browsers, touch event handling
- Files: `App.tsx` (pointer events), `components/VinylCover.tsx` (WebGL-like gradients)
- Risk: Game unplayable on some target platforms
- Priority: MEDIUM - Test on iOS Safari (Capacitor target), Chrome, Firefox

---

*Concerns audit: 2026-02-07*
