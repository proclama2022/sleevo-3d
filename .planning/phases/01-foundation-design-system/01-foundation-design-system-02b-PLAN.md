---
phase: 01-foundation-design-system
plan: 02b
type: execute
wave: 2
depends_on: ["02a"]
files_modified:
  - index.html
  - src/design-tokens/tokens.ts
autonomous: true

must_haves:
  truths:
    - "Typography tokens are consumable as CSS variables"
    - "Breakpoint tokens are consumable as CSS variables"
    - "Google Fonts are imported in index.html"
  artifacts:
    - path: "index.html"
      provides: "HTML entry point with Google Fonts import"
      contains: "fonts.googleapis.com link tags"
    - path: "src/design-tokens/tokens.ts"
      provides: "TypeScript exports for design tokens"
      exports: ["typography", "breakpoints"]
  key_links:
    - from: "src/design-tokens/tokens.ts"
      to: "src/design-tokens/typography.json"
      via: "import statement"
      pattern: "from.*typography"
    - from: "src/design-tokens/tokens.ts"
      to: "src/design-tokens/breakpoints.json"
      via: "import statement"
      pattern: "from.*breakpoints"
---
<objective>
Add Google Fonts import and update TypeScript exports for typography and breakpoint tokens.

Purpose: Complete the typography system by importing Google Fonts and creating TypeScript exports for type-safe token access. This plan depends on 02a completing the token JSON files.

Output: index.html with Google Fonts, updated tokens.ts with typography and breakpoint exports.
</objective>

<execution_context>
@/Users/martha2022/.claude/get-shit-done/workflows/execute-plan.md
@/Users/martha2022/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/research/STACK.md
@.planning/codebase/STACK.md
@.planning/phases/01-foundation-design-system/01-foundation-design-system-02a-PLAN.md
</context>

<tasks>

<task type="auto">
  <name>Add Google Fonts import to index.html</name>
  <files>index.html</files>
  <action>
    Add Google Fonts import to index.html <head> section for the 3 required fonts (per DESIGN-02):

    ```html
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;700&family=Manrope:wght@400;500;700&display=swap" rel="stylesheet">
    ```

    Place these links before any other stylesheets. Use display=swap for performance, preconnect for faster loading.
  </action>
  <verify>
    Run: grep -q "fonts.googleapis.com" index.html to verify font import exists
  </verify>
  <done>
    index.html includes Google Fonts link for Bebas Neue, Manrope, and JetBrains Mono with display=swap.
  </done>
</task>

<task type="auto">
  <name>Update TypeScript exports for new tokens</name>
  <files>src/design-tokens/tokens.ts</files>
  <action>
    Update src/design-tokens/tokens.ts to include typography and breakpoint exports (depends on 02a creating the JSON files):

    Add to existing file:

    ```typescript
    import typography from './typography.json';
    import breakpoints from './breakpoints.json';

    // Add new type definitions
    export interface TypographyTokens {
      fontFamily: {
        display: string;
        ui: string;
        monospace: string;
      };
      fontSize: {
        display: {
          sm: string;
          md: string;
          lg: string;
        };
        ui: {
          xs: string;
          sm: string;
          md: string;
        };
        monospace: {
          sm: string;
          md: string;
        };
      };
      fontWeight: {
        regular: string;
        medium: string;
        bold: string;
      };
      lineHeight: {
        tight: string;
        normal: string;
      };
    }

    export interface BreakpointTokens {
      compact: string;
      medium: string;
      large: string;
    }

    // Add exports alongside existing colors and spacing
    export const typography: TypographyTokens = {
      fontFamily: {
        display: typography.typography.fontFamily.display.$value,
        ui: typography.typography.fontFamily.ui.$value,
        monospace: typography.typography.fontFamily.monospace.$value,
      },
      fontSize: {
        display: {
          sm: typography.typography.fontSize.display.sm.$value,
          md: typography.typography.fontSize.display.md.$value,
          lg: typography.typography.fontSize.display.lg.$value,
        },
        ui: {
          xs: typography.typography.fontSize.ui.xs.$value,
          sm: typography.typography.fontSize.ui.sm.$value,
          md: typography.typography.fontSize.ui.md.$value,
        },
        monospace: {
          sm: typography.typography.fontSize.monospace.sm.$value,
          md: typography.typography.fontSize.monospace.md.$value,
        },
      },
      fontWeight: {
        regular: typography.typography.fontWeight.regular.$value,
        medium: typography.typography.fontWeight.medium.$value,
        bold: typography.typography.fontWeight.bold.$value,
      },
      lineHeight: {
        tight: typography.typography.lineHeight.tight.$value,
        normal: typography.typography.lineHeight.normal.$value,
      },
    };

    export const breakpoints: BreakpointTokens = {
      compact: breakpoints.breakpoint.compact.$value,
      medium: breakpoints.breakpoint.medium.$value,
      large: breakpoints.breakpoint.large.$value,
    };

    // Update rawTokens export
    export const rawTokens = {
      colors: colors,
      spacing: spacing,
      typography: typography,
      breakpoints: breakpoints,
    };
    ```

    Update the existing file rather than replacing it entirely. The tokens.ts file was created in plan 01.
  </action>
  <verify>
    Run: npx tsc --noEmit to verify no type errors
  </verify>
  <done>
    tokens.ts exports TypographyTokens and BreakpointTokens interfaces, with runtime values extracted from JSON $value properties.
  </done>
</task>

</tasks>

<verification>
1. index.html includes Google Fonts import for Bebas Neue, Manrope, JetBrains Mono
2. tokens.ts exports updated with typography and breakpoint types
3. TypeScript compilation passes with no errors
4. Raw tokens export includes all token categories
</verification>

<success_criteria>
1. Google Fonts loaded with display=swap for performance
2. Typography and breakpoint tokens are type-safe and consumable
3. All token exports (colors, spacing, typography, breakpoints) are available
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-design-system/01-foundation-design-system-02b-SUMMARY.md`
</output>
