---
phase: 02-star-system-and-level-complete
plan: 02
type: execute
wave: 2
depends_on:
  - 02-star-system-and-level-complete-01
files_modified:
  - src/game/engine.ts
autonomous: true
requirements:
  - STAR-01
  - STAR-02

must_haves:
  truths:
    - "Star rating is calculated using mistakes + time (not hints)"
    - "3 stars require 0 mistakes AND time ≤ par × 1.10"
    - "2 stars require ≤1 mistake AND time < par (strict, under par)"
    - "1 star is awarded for level completion regardless of performance"
    - "Stars are calculated when the last vinyl is placed (isComplete = true)"
    - "Levels with different parTime values produce different star ratings for the same performance"
  artifacts:
    - path: "src/game/engine.ts"
      provides: "Star calculation formula in PLACE_VINYL case"
      contains: "mistakes === 0 && time <= parTime * 1.10"
      contains: "mistakes <= 1 && time < parTime"
      min_lines: 15
  key_links:
    - from: "src/game/engine.ts (PLACE_VINYL case)"
      to: "state.level.parTime"
      via: "Property access for time threshold"
      pattern: "state\.level\.parTime"
    - from: "src/game/engine.ts (star calculation)"
      to: "state.mistakes"
      via: "Mistake counter for star determination"
      pattern: "state\.mistakes"
    - from: "src/game/engine.ts (star calculation)"
      to: "timeElapsed parameter"
      via: "Time value for formula comparison"
      pattern: "timeElapsed|time"
---

<objective>
Replace the existing mistakes+hints star formula with the CONTEXT.md D1 formula (mistakes + time with parTime thresholds)

Purpose: Implement the locked decision from CONTEXT.md — star rating based on discrete thresholds combining error count and elapsed time
Output: Star calculation in gameReducer that uses parTime to determine 1/2/3 stars
</objective>

<execution_context>
@/Users/martha2022/.claude/get-shit-done/workflows/execute-plan.md
@/Users/martha2022/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-star-system-and-level-complete/02-CONTEXT.md
@.planning/phases/02-star-system-and-level-complete/02-RESEARCH.md

# Phase dependencies
- Requires parTime property from Plan 01 (02-star-system-and-level-complete-01)

# Phase 1 patterns
- useReducer in GameScreen.tsx is canonical state management (from 01-02)
- Type-safe property access (from 01-01)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace star calculation formula in gameReducer</name>
  <files>src/game/engine.ts</files>
  <action>
    In the PLACE_VINYL case of gameReducer (around lines 152-164), replace the existing star calculation logic with the CONTEXT.md D1 formula.

    Current logic (lines 152-164) uses mistakes + hints. Replace with:

    ```typescript
    // Calculate stars on completion
    let stars = 1; // Default to 1 star for completion
    if (isComplete) {
      const mistakes = state.mistakes;
      const parTime = state.level.parTime;
      const currentTime = state.timeElapsed; // Time tracked in GameState

      if (parTime !== undefined) {
        // 3 stars: 0 errors + time ≤ par × 1.10 (10% margin)
        if (mistakes === 0 && currentTime <= parTime * 1.10) {
          stars = 3;
        }
        // 2 stars: ≤1 error + time < par (strict, must be UNDER par)
        else if (mistakes <= 1 && currentTime < parTime) {
          stars = 2;
        }
        // 1 star: default for completion
        else {
          stars = 1;
        }
      } else {
        // Fallback for levels without parTime (shouldn't happen after Plan 01)
        // Use mistakes-only calculation: 0 mistakes = 3 stars, ≤2 mistakes = 2 stars
        stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
      }
    }
    ```

    KEY CHANGES from existing formula:
    1. Remove hintsUsed from star calculation (not in D1 formula)
    2. Add time threshold checks using parTime
    3. 3★ allows 10% margin over par (par × 1.10)
    4. 2★ requires strict under par time (< parTime, not <=)
    5. Fallback for missing parTime to prevent crashes

    DO NOT modify the isComplete check or the return statement — only replace the star calculation block.
  </action>
  <verify>
    <automated>grep -A 10 "Calculate stars on completion" /Users/martha2022/Documents/Sleevo/src/game/engine.ts | grep -q "parTime \* 1.10"</automated>
    <manual>Star calculation checks mistakes === 0 && currentTime <= parTime * 1.10 for 3 stars</manual>
  </verify>
  <done>
    Star rating is calculated using the D1 formula (mistakes + time with parTime thresholds), replacing the old mistakes+hints formula
  </done>
</task>

</tasks>

<verification>
Overall phase verification:
1. TypeScript compilation passes: npx tsc --noEmit
2. Star calculation block includes parTime * 1.10 check for 3 stars
3. Star calculation block includes currentTime < parTime check for 2 stars
4. Hints are NOT used in star calculation (hintsUsed removed from formula)
5. Fallback exists for levels without parTime (defensive programming)
</verification>

<success_criteria>
1. Star calculation in gameReducer uses parTime for time thresholds
2. 3 stars awarded when mistakes === 0 AND time <= parTime * 1.10
3. 2 stars awarded when mistakes <= 1 AND time < parTime
4. 1 star awarded for completion (default)
5. Formula does NOT use hintsUsed (removed from calculation)
</success_criteria>

<output>
After completion, create `.planning/phases/02-star-system-and-level-complete/02-star-system-and-level-complete-02-SUMMARY.md`
</output>
