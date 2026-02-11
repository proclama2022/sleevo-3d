---
phase: 01-foundation-design-system
plan: 03a
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - src/design-tokens/theme.ts
autonomous: true

must_haves:
  truths:
    - "styled-components ^6.0.0 is installed"
    - "React ^18.3.0 is installed"
    - "Theme interface extends DefaultTheme from styled-components"
  artifacts:
    - path: "package.json"
      provides: "Dependency declarations"
      contains: "styled-components, react, react-dom, @types/react"
    - path: "src/design-tokens/theme.ts"
      provides: "Theme interface and structure for styled-components"
      exports: ["theme as DefaultTheme"]
  key_links:
    - from: "src/design-tokens/theme.ts"
      to: "styled-components DefaultTheme"
      via: "module augmentation"
      pattern: "declare module 'styled-components'"
---
<objective>
Install styled-components dependencies and create theme configuration structure.

Purpose: Install styled-components and create the theme configuration file that will consume all design tokens. This plan creates the structural theme file that imports tokens (created in plans 01 and 02b).

Output: Installed dependencies, theme configuration structure file.
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
</context>

<tasks>

<task type="auto">
  <name>Install styled-components and React dependencies</name>
  <files>package.json</files>
  <action>
    Install styled-components ^6.0.0, React ^18.3.0, and required type definitions per research STACK.md:

    Run:
    ```bash
    npm install styled-components@^6.0.0 react@^18.3.0 react-dom@^18.3.0
    npm install -D @types/react@^18.3.0 @types/react-dom@^18.3.0
    ```

    Note: The project already uses @react-three/fiber which depends on React, but we need explicit React 18.3.0 for styled-components v6 compatibility. Check existing React version first to avoid version conflicts.

    If React is already installed, verify version is >=18.3.0 and only install styled-components.
  </action>
  <verify>
    Run: npm list styled-components react react-dom to verify correct versions installed
  </verify>
  <done>
    package.json contains styled-components@^6.0.0, react@^18.3.0, react-dom@^18.3.0, @types/react@^18.3.0.
  </done>
</task>

<task type="auto">
  <name>Create styled-components theme configuration structure</name>
  <files>src/design-tokens/theme.ts</files>
  <action>
    Create src/design-tokens/theme.ts with Theme interface and theme object structure that extends styled-components DefaultTheme:

    ```typescript
    import { DefaultTheme } from 'styled-components';

    // Theme interface extending styled-components DefaultTheme
    // Note: Actual token imports will be added in plan 03b after plans 01 and 02b complete
    export interface Theme extends DefaultTheme {
      colors: {
        background: {
          primary: string;
          secondary: string;
        };
        accent: {
          primary: string;
          secondary: string;
        };
        text: {
          primary: string;
        };
      };
      spacing: {
        base: string;
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
      };
      typography: {
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
      };
      breakpoints: {
        compact: string;
        medium: string;
        large: string;
      };
    }

    // Type assertion for DefaultTheme extension
    declare module 'styled-components' {
      export interface DefaultTheme extends Theme {}
    }

    // Theme object placeholder - will be populated in plan 03b
    // export const theme: Theme = { ... };

    export type { Theme };
    ```

    This creates the structural theme file with the Theme interface and DefaultTheme augmentation.
    The actual theme object with token imports will be completed in plan 03b (Wave 2) after plans 01 and 02b complete the token files.
  </action>
  <verify>
    Run: npx tsc --noEmit to verify DefaultTheme extension is valid
  </verify>
  <done>
    theme.ts exists with Theme interface extending DefaultTheme, DefaultTheme module augmentation declared. Token imports and theme object will be added in plan 03b.
  </done>
</task>

</tasks>

<verification>
1. styled-components ^6.0.0 and React ^18.3.0 installed
2. theme.ts exists with Theme interface extending DefaultTheme
3. DefaultTheme module augmentation is declared
4. TypeScript compilation passes with no errors
</verification>

<success_criteria>
1. Theme interface is defined and extends styled-components DefaultTheme
2. Dependencies are installed with correct versions
3. TypeScript recognizes the theme extension for autocomplete
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-design-system/01-foundation-design-system-03a-SUMMARY.md`
</output>
