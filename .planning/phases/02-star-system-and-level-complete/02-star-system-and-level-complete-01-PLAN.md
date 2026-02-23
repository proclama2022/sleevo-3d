---
phase: 02-star-system-and-level-complete
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/game/types.ts
  - src/game/levels.ts
autonomous: true
requirements:
  - STAR-01
  - STAR-02
  - STAR-03

must_haves:
  truths:
    - "Every level has a parTime property defined in seconds"
    - "parTime is optional in the interface for backward compatibility"
    - "parTime values are calculated using the formula (vinyls × 3s) × (1 + mode_multiplier)"
    - "Levels with different modes can have different parTime values for the same performance"
  artifacts:
    - path: "src/game/types.ts"
      provides: "Level interface with parTime property"
      contains: "parTime?: number"
      min_lines: 1
    - path: "src/game/levels.ts"
      provides: "Level definitions with parTime values"
      contains: "parTime:"
      min_lines: 10
  key_links:
    - from: "src/game/levels.ts"
      to: "src/game/types.ts"
      via: "Level interface import"
      pattern: "import.*Level.*from.*types"
    - from: "src/game/engine.ts"
      to: "src/game/types.ts"
      via: "Level.parTime property access in star calculation"
      pattern: "state.level.parTime"
---

<objective>
Add parTime property to Level interface and all level definitions, enabling time-based star rating calculations

Purpose: Star rating formula (D1 from CONTEXT.md) requires parTime to differentiate performance between levels and modes
Output: Level interface with parTime, all levels populated with calculated parTime values
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

# Phase 1 patterns
- Single source of truth: useReducer in GameScreen.tsx (from 01-02)
- Type-safe progression: Use actual level.id property (from 01-01)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add parTime to Level interface</name>
  <files>src/game/types.ts</files>
  <action>
    Add optional parTime property to the Level interface (line 31-46):

    ```typescript
    export interface Level {
      id: string;
      rows: number;
      cols: number;
      vinyls: Vinyl[];
      sortRule: SortRule;
      mode: LevelMode;
      timeLimit?: number;
      parTime?: number;  // ADD THIS LINE - seconds for star calculation
      hint?: string;
      theme?: LevelTheme;
      // ... rest of properties
    }
    ```

    Make it optional (parTime?: number) for backward compatibility with existing level definitions that haven't been updated yet.
  </action>
  <verify>
    <automated>grep -n "parTime?: number" /Users/martha2022/Documents/Sleevo/src/game/types.ts</automated>
    <manual>Level interface shows parTime?: number property</manual>
  </verify>
  <done>
    Level interface includes parTime?: number property, allowing level definitions to specify par time for star calculation
  </done>
</task>

<task type="auto">
  <name>Task 2: Add parTime values to all level definitions</name>
  <files>src/game/levels.ts</files>
  <action>
    For each level definition in levels.ts, add a parTime property calculated using the formula from CONTEXT.md D4:

    Formula: `(vinyls × 3s) × (1 + mode_multiplier)`

    Mode multipliers:
    - free: 1.0
    - genre: 1.2
    - chronological: 1.3
    - customer: 1.1
    - blackout: 1.5
    - rush: 0.8 (less time = harder)
    - sleeve-match: 1.4

    Example calculation:
    - level1: 6 vinyls, free mode → 6 × 3s × 1.0 = 18s → parTime: 18
    - level2: 8 vinyls, genre mode → 8 × 3s × 1.2 = 29s → parTime: 29
    - level8 (rush): 10 vinyls, rush mode → 10 × 3s × 0.8 = 24s → parTime: 24 (or manual override if timeLimit is 60s)

    Round all values to nearest integer using Math.round().

    Do NOT modify level structure or other properties — only add parTime to each level object.
  </action>
  <verify>
    <automated>grep -c "parTime:" /Users/martha2022/Documents/Sleevo/src/game/levels.ts</automated>
    <manual>All level definitions include parTime property with realistic values</manual>
  </verify>
  <done>
    Every level in levels.ts has a parTime property, enabling differentiated star thresholds based on mode and vinyl count
  </done>
</task>

</tasks>

<verification>
Overall phase verification:
1. TypeScript compilation passes: npx tsc --noEmit
2. All level definitions include parTime values
3. parTime values differ between modes (e.g., rush mode has lower parTime than blackout mode for same vinyl count)
</verification>

<success_criteria>
1. Level interface in types.ts includes parTime?: number property
2. Every level definition in levels.ts has a parTime value
3. parTime values are calculated using the formula (vinyls × 3s) × (1 + mode_multiplier)
4. Different modes produce different parTime values for the same vinyl count
</success_criteria>

<output>
After completion, create `.planning/phases/02-star-system-and-level-complete/02-star-system-and-level-complete-01-SUMMARY.md`
</output>
