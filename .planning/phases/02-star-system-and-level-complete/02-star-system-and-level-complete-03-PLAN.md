---
phase: 02-star-system-and-level-complete
plan: 03
type: execute
wave: 3
depends_on:
  - 02-star-system-and-level-complete-01
  - 02-star-system-and-level-complete-02
files_modified:
  - src/components/LevelComplete.tsx
  - src/components/GameScreen.tsx
autonomous: true
requirements:
  - COMM-04
  - STAR-01

must_haves:
  truths:
    - "Level complete screen shows final score (points earned)"
    - "Time stat shows format '0:47 / 1:00 par' when parTime is available"
    - "Time stat shows '0:47' only when parTime is undefined"
    - "Score is passed from GameScreen to LevelComplete"
    - "parTime is passed from GameScreen to LevelComplete"
    - "Star animation remains sequential (existing starPop keyframe)"
  artifacts:
    - path: "src/components/LevelComplete.tsx"
      provides: "Level complete screen with score and time/par display"
      contains: "score?: number"
      contains: "parTime?: number"
      contains: "formatTimeWithPar"
      min_lines: 30
    - path: "src/components/GameScreen.tsx"
      provides: "Props wired from GameState to LevelComplete"
      contains: "score={state.score}"
      contains: "parTime={state.level.parTime}"
      min_lines: 5
  key_links:
    - from: "src/components/GameScreen.tsx (LevelComplete render)"
      to: "src/components/LevelComplete.tsx"
      via: "Props: score, parTime"
      pattern: "score=.*parTime="
    - from: "src/components/LevelComplete.tsx"
      to: "formatTimeWithPar function"
      via: "Time formatting with par reference"
      pattern: "formatTimeWithPar.*timeElapsed.*parTime"
---

<objective>
Update LevelComplete component to display final score and time vs par (e.g., "0:47 / 1:00 par")

Purpose: Satisfy COMM-04 requirement — level complete screen shows stars, score, errors, and time with par reference
Output: LevelComplete component with new score and parTime props, formatted time display, and GameScreen wiring
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
- Requires star formula from Plan 02 (02-star-system-and-level-complete-02) to have meaningful stars to display

# Phase 1 patterns
- Single source of truth: useReducer in GameScreen.tsx (from 01-02)
- Props flow from state -> UI components (from 01-03 HUD wiring)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update LevelComplete component with score and parTime props</name>
  <files>src/components/LevelComplete.tsx</files>
  <action>
    Modify the LevelComplete component to accept and display score and parTime:

    1. Add new props to the Props interface (after line 13):

    ```typescript
    interface Props {
      levelNumber: number;
      stars: number;
      mistakes: number;
      hintsUsed: number;
      timeElapsed: number;
      score?: number;      // ADD THIS - final score from GameState
      parTime?: number;    // ADD THIS - par time from level for comparison
      hasNextLevel: boolean;
      onNextLevel: () => void;
      onReplay: () => void;
    }
    ```

    2. Add formatTimeWithPar helper function (after line 20):

    ```typescript
    function formatTimeWithPar(seconds: number, par?: number): string {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      const formatted = m === 0 ? `${s}s` : `${m}:${String(s).padStart(2, '0')}`;

      if (par !== undefined) {
        const parM = Math.floor(par / 60);
        const parS = par % 60;
        const parFormatted = parM === 0 ? `${parS}s` : `${parM}:${String(parS).padStart(2, '0')}`;
        return `${formatted} / ${parFormatted} par`;
      }
      return formatted;
    }
    ```

    3. Add score stat to the stats section (after line 95, before the closing div):

    ```typescript
    <div className={styles.stats}>
      <div className={styles.stat}>
        <span className={styles.statValue}>{score ?? 0}</span>
        <span className={styles.statLabel}>Punti</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statValue}>{formatTimeWithPar(timeElapsed, parTime)}</span>
        <span className={styles.statLabel}>Tempo</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statValue}>{mistakes}</span>
        <span className={styles.statLabel}>Errori</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statValue}>{hintsUsed}</span>
        <span className={styles.statLabel}>Sugger.</span>
      </div>
    </div>
    ```

    KEY CHANGES:
    - Add score?: number and parTime?: number to Props interface (optional for backward compatibility)
    - Create formatTimeWithPar helper that returns "X:XX / Y:YY par" when parTime exists, or "X:XX" when undefined
    - Add score stat as FIRST stat item (before time) for visual hierarchy
    - Update time stat to use formatTimeWithPar instead of formatTime

    DO NOT modify: star rendering, confetti, buttons, or layout structure.
  </action>
  <verify>
    <automated>grep -q "score?: number" /Users/martha2022/Documents/Sleevo/src/components/LevelComplete.tsx && grep -q "parTime?: number" /Users/martha2022/Documents/Sleevo/src/components/LevelComplete.tsx && grep -q "formatTimeWithPar" /Users/martha2022/Documents/Sleevo/src/components/LevelComplete.tsx</automated>
    <manual>LevelComplete Props interface includes score and parTime props</manual>
  </verify>
  <done>
    LevelComplete component accepts score and parTime props, displays score as "Punti", and shows time as "0:47 / 1:00 par" format
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire score and parTime props in GameScreen</name>
  <files>src/components/GameScreen.tsx</files>
  <action>
    In the LevelComplete render call (around lines 872-883), add the new props:

    Find this block:
    ```typescript
    {state.status === 'completed' && (
      <LevelComplete
        levelNumber={state.levelIndex + 1}
        stars={state.stars ?? 1}
        mistakes={state.mistakes ?? 0}
        hintsUsed={state.hintsUsed ?? 0}
        timeElapsed={timeElapsed}
        hasNextLevel={state.levelIndex + 1 < LEVELS.length}
        onNextLevel={handleNext}
        onReplay={handleRestart}
      />
    )}
    ```

    Replace with:
    ```typescript
    {state.status === 'completed' && (
      <LevelComplete
        levelNumber={state.levelIndex + 1}
        stars={state.stars ?? 1}
        mistakes={state.mistakes ?? 0}
        hintsUsed={state.hintsUsed ?? 0}
        timeElapsed={timeElapsed}
        score={state.score}                        // ADD THIS
        parTime={state.level.parTime}              // ADD THIS
        hasNextLevel={state.levelIndex + 1 < LEVELS.length}
        onNextLevel={handleNext}
        onReplay={handleRestart}
      />
    )}
    ```

    DO NOT modify any other props or the conditional rendering logic — only add score and parTime.
  </action>
  <verify>
    <automated>grep -A 5 "LevelComplete" /Users/martha2022/Documents/Sleevo/src/components/GameScreen.tsx | grep -q "score={state.score}" && grep -A 5 "LevelComplete" /Users/martha2022/Documents/Sleevo/src/components/GameScreen.tsx | grep -q "parTime={state.level.parTime}"</automated>
    <manual>LevelComplete render includes score and parTime props from GameState</manual>
  </verify>
  <done>
    GameScreen passes score and parTime from state to LevelComplete, enabling display of final points and time vs par comparison
  </done>
</task>

</tasks>

<verification>
Overall phase verification:
1. TypeScript compilation passes: npx tsc --noEmit
2. LevelComplete Props interface includes score?: number and parTime?: number
3. formatTimeWithPar function returns "X:XX / Y:YY par" when parTime is provided
4. GameScreen LevelComplete render includes score={state.score} and parTime={state.level.parTime}
5. Score stat appears before time stat in the stats display
</verification>

<success_criteria>
1. Level complete screen displays final score in a "Punti" stat
2. Time stat shows "0:47 / 1:00 par" format when parTime exists
3. Time stat shows "0:47" format when parTime is undefined (fallback)
4. Score and parTime props are wired from GameScreen to LevelComplete
5. Existing features (stars, mistakes, hints, buttons) remain unchanged
</success_criteria>

<output>
After completion, create `.planning/phases/02-star-system-and-level-complete/02-star-system-and-level-complete-03-SUMMARY.md`
</output>
