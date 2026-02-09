# Testing Patterns

**Analysis Date:** 2026-02-07

## Test Framework

**Runner:**
- No test framework configured or detected
- No Jest, Vitest, Testing Library, or other testing tools found in dependencies
- package.json has no test script defined

**Assertion Library:**
- Not applicable - no testing setup exists

**Run Commands:**
```bash
# No test infrastructure currently in place
# To run tests when implemented:
# npm test              # (needs configuration)
# npm run test:watch   # (needs configuration)
# npm run test:coverage # (needs configuration)
```

## Test File Organization

**Location:**
- No test files exist in the codebase
- No `__tests__` directories found
- No `.test.tsx`, `.spec.tsx`, `.test.ts`, or `.spec.ts` files detected

**Naming:**
- Convention not yet established
- Recommended pattern: `{ComponentName}.test.tsx` or `{ComponentName}.spec.tsx` for co-located tests
- Alternative: `__tests__/{ComponentName}.test.tsx` for centralized test directory

**Structure:**
- No examples to reference; would follow industry standard patterns if implemented

## Test Structure

**Suite Organization:**
- Not applicable - no tests exist
- Recommended approach based on component design:
```typescript
describe('VinylCover', () => {
  describe('rendering', () => {
    it('renders vinyl cover with genre color', () => {
      // test code
    });
  });

  describe('interactions', () => {
    it('reveals mystery vinyl on click', () => {
      // test code
    });
  });
});
```

**Patterns:**
- Setup: Would use React Testing Library `render()` for component tests
- Teardown: Standard cleanup via RTL's cleanup after each test
- Assertion: Would use @testing-library/jest-dom matchers or similar

## Mocking

**Framework:**
- Not applicable - no testing setup exists
- If implemented, Jest's built-in mocking would be used

**Patterns:**
- Service mocking needed for:
  ```typescript
  // Mock gameLogic.ts functions
  jest.mock('./services/gameLogic', () => ({
    generateLevel: jest.fn(),
    calculateScore: jest.fn(),
    getXPToNextLevel: jest.fn(),
  }));

  // Mock Capacitor APIs
  jest.mock('@capacitor/core', () => ({
    Capacitor: { isNativePlatform: jest.fn(() => false) }
  }));
  ```

**What to Mock:**
- External service calls (Capacitor haptics, status bar)
- Random data generation (via seeded random in VinylCover)
- Game logic calculations (generateLevel, calculateScore)

**What NOT to Mock:**
- React components being tested
- Tailwind/CSS styling logic
- Type definitions
- Plain data fixtures (GENRE_COLORS, GENRE_LABELS)

## Fixtures and Factories

**Test Data:**
- No fixtures currently exist
- Factory pattern needed for creating test game states:
```typescript
const createMockVinyl = (overrides?: Partial<Vinyl>): Vinyl => ({
  id: 'test-vinyl-1',
  type: 'vinyl',
  genre: Genre.Rock,
  title: 'Test Album',
  artist: 'Test Artist',
  coverColor: 'bg-red-500',
  dustLevel: 0,
  isTrash: false,
  isMystery: false,
  isRevealed: true,
  isGold: false,
  ...overrides,
});

const createMockGameState = (overrides?: Partial<GameState>): GameState => ({
  currentLevel: 1,
  score: 0,
  movesLeft: 10,
  timeLeft: 0,
  maxTime: 0,
  combo: 0,
  xp: 0,
  level: 1,
  status: 'playing',
  difficulty: 'Normal',
  mode: 'Standard',
  theme: 'Basement',
  ...overrides,
});
```

**Location:**
- Recommended: `__tests__/fixtures/` directory
- Alternative: Co-locate with test files as `ComponentName.fixtures.ts`

## Coverage

**Requirements:**
- No coverage requirements enforced
- Suggested target: 80% for business logic, 70% overall
- Components are view-heavy and may not need 100% coverage

**View Coverage:**
```bash
# Once Jest/Vitest configured, run:
npm test -- --coverage
# Generates coverage report in coverage/ directory
```

## Test Types

**Unit Tests:**
- Scope: Individual functions and simple components
- Approach: Test in isolation with mocked dependencies
- Examples needed:
  - `generateLevel()` - validates crate/vinyl generation
  - `calculateScore()` - tests score calculations
  - `randomPick()` - tests randomization logic
  - `seededRandom()` - tests deterministic random generation

**Integration Tests:**
- Scope: Multi-component workflows
- Approach: Render components together, test user interactions
- Examples:
  - Dragging vinyl to crate (VinylCover → CrateBox interaction)
  - Level completion with score calculation
  - Haptic feedback triggers on valid placements

**E2E Tests:**
- Framework: Not used currently
- Suggested: Playwright or Cypress for mobile web testing
- Would test: Complete game flow from menu to level completion

## Async Testing

**Pattern:**
- Currently no async tests exist
- When implementing, use async/await with React Testing Library:
```typescript
it('triggers haptic feedback on drop', async () => {
  const { getByTestId } = render(<App />);
  const vinyl = getByTestId('vinyl-item');
  const crate = getByTestId('crate-box');

  fireEvent.dragEnd(vinyl);

  await waitFor(() => {
    expect(Haptics.impact).toHaveBeenCalled();
  });
});
```

## Error Testing

**Pattern:**
- Currently no error boundary tests exist
- Suggested pattern for testing error scenarios:
```typescript
it('handles missing root element on init', () => {
  // Remove root element
  const root = document.getElementById('root');
  root?.remove();

  expect(() => {
    // Simulate import of index.tsx
  }).toThrow('Could not find root element to mount to');
});

it('gracefully handles haptic API failure', async () => {
  Haptics.impact.mockRejectedValueOnce(new Error('API unavailable'));

  expect(async () => {
    await triggerHaptic('light');
  }).not.toThrow();
});
```

## Testing Gaps

**Critical Areas Without Tests:**
- Game logic: Level generation, vinyl shuffling, move counting
- Component interactions: Drag-drop mechanics, vinyl selection, animation completion
- State management: GameState transitions, score/XP calculations
- Edge cases: Empty crates, mystery vinyl reveals, dust cleaning mechanics

**Risk Level:** HIGH - No automated testing means regressions go undetected

## Recommended Implementation Priority

1. **Phase 1:** Unit tests for `gameLogic.ts`
   - generateLevel() - validates game state generation
   - calculateScore() - tests scoring logic
   - getXPToNextLevel() - tests progression

2. **Phase 2:** Component unit tests
   - VinylCover rendering states (mystery, gold, dusty)
   - CrateBox visual states (valid/invalid drop targets)
   - VinylDisc rotation and spinning animation

3. **Phase 3:** Integration tests
   - Drag-drop workflow end-to-end
   - Level completion flow with scoring
   - Haptic feedback on interactions

4. **Phase 4:** E2E tests
   - Full game session from launch to level completion
   - Mobile touch interactions
   - Settings/difficulty changes

---

*Testing analysis: 2026-02-07*
