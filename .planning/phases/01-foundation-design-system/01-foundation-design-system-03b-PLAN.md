---
phase: 01-foundation-design-system
plan: 03b
type: execute
wave: 2
depends_on: ["01", "02a", "03a"]
files_modified:
  - src/design-tokens/theme.ts
  - src/ui/ThemeProvider.tsx
  - src/design-tokens/GlobalStyles.ts
  - src/App.tsx
  - tsconfig.json
  - vite.config.ts
autonomous: true

must_haves:
  truths:
    - "ThemeProvider wraps application with design tokens"
    - "Theme is consumable via useTheme hook in styled components"
    - "GlobalStyles provide CSS resets and CSS variable injection"
  artifacts:
    - path: "src/design-tokens/theme.ts"
      provides: "Complete theme object for styled-components"
      exports: ["theme"]
    - path: "src/ui/ThemeProvider.tsx"
      provides: "React component wrapping app with theme"
      exports: ["ThemeProvider"]
    - path: "src/design-tokens/GlobalStyles.ts"
      provides: "Global CSS styles and CSS variable injection"
      exports: ["GlobalStyles"]
    - path: "src/App.tsx"
      provides: "React app entry with ThemeProvider"
      exports: ["App"]
  key_links:
    - from: "src/design-tokens/theme.ts"
      to: "src/design-tokens/tokens.ts"
      via: "import statement (tokens created in plans 01, 02b)"
      pattern: "from.*tokens"
    - from: "src/ui/ThemeProvider.tsx"
      to: "src/design-tokens/theme.ts"
      via: "import statement"
      pattern: "from.*theme"
    - from: "src/App.tsx"
      to: "src/ui/ThemeProvider.tsx"
      via: "component wrap"
      pattern: "ThemeProvider"
    - from: "src/design-tokens/GlobalStyles.ts"
      to: "src/design-tokens/theme.ts"
      via: "import statement"
      pattern: "from.*theme"
---
<objective>
Complete theme configuration with token imports, create ThemeProvider, GlobalStyles, and integrate with App.tsx.

Purpose: Complete the styled-components theming infrastructure by populating the theme object with actual token imports (from plans 01 and 02b), creating ThemeProvider and GlobalStyles components, and integrating everything into App.tsx. Also configure TypeScript and Vite for React support.

Output: Complete theme object, ThemeProvider component, GlobalStyles, App.tsx integration, and config updates.
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
@.planning/phases/01-foundation-design-system/01-foundation-design-system-01-PLAN.md
@.planning/phases/01-foundation-design-system/01-foundation-design-system-02a-PLAN.md
@.planning/phases/01-foundation-design-system/01-foundation-design-system-02b-PLAN.md
@.planning/phases/01-foundation-design-system/01-foundation-design-system-03a-PLAN.md
</context>

<tasks>

<task type="auto">
  <name>Complete theme.ts with token imports and theme object</name>
  <files>src/design-tokens/theme.ts</files>
  <action>
    Update src/design-tokens/theme.ts to add token imports and complete the theme object (depends on plans 01 and 02b creating tokens.ts):

    Replace the placeholder in theme.ts with:

    ```typescript
    import { DefaultTheme } from 'styled-components';
    import { colors, spacing, typography, breakpoints } from './tokens';

    // Theme interface extending styled-components DefaultTheme
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

    // Theme object consuming design tokens
    export const theme: Theme = {
      colors,
      spacing,
      typography,
      breakpoints,
    };

    // Type assertion for DefaultTheme extension
    declare module 'styled-components' {
      export interface DefaultTheme extends Theme {}
    }

    export default theme;
    ```

    This completes the theme.ts file by importing actual tokens from tokens.ts (created in plans 01 and 02b).
  </action>
  <verify>
    Run: npx tsc --noEmit to verify theme object type is valid
  </verify>
  <done>
    theme.ts imports tokens from tokens.ts, exports theme object with all design tokens, DefaultTheme module augmentation is declared.
  </done>
</task>

<task type="auto">
  <name>Create ThemeProvider component</name>
  <files>src/ui/ThemeProvider.tsx</files>
  <action>
    Create src/ui/ThemeProvider.tsx as a React component that wraps app with styled-components ThemeProvider:

    ```typescript
    import React from 'react';
    import { ThemeProvider as SCThemeProvider } from 'styled-components';
    import { theme } from '../design-tokens/theme';

    interface ThemeProviderProps {
      children: React.ReactNode;
    }

    export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
      return (
        <SCThemeProvider theme={theme}>
          {children}
        </SCThemeProvider>
      );
    };

    export default ThemeProvider;
    ```

    Create src/ui directory if it doesn't exist. This component is a thin wrapper around styled-components' ThemeProvider for consistency and potential future customization (e.g., theme switching if light theme is ever added, though dark-only is locked decision).
  </action>
  <verify>
    Run: npx tsc --noEmit to verify component is valid TypeScript
  </verify>
  <done>
    ThemeProvider.tsx exists, exports ThemeProvider component wrapping SCThemeProvider with theme.
  </done>
</task>

<task type="auto">
  <name>Create GlobalStyles and App.tsx with ThemeProvider integration</name>
  <files>src/design-tokens/GlobalStyles.ts src/App.tsx</files>
  <action>
    Create two files:

    1. src/design-tokens/GlobalStyles.ts for CSS resets and CSS variable injection:

    ```typescript
    import { createGlobalStyle } from 'styled-components';
    import { theme } from './theme';

    export const GlobalStyles = createGlobalStyle`
      *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: ${theme.typography.fontFamily.ui};
        font-size: ${theme.typography.fontSize.ui.md};
        line-height: ${theme.typography.lineHeight.normal};
        color: ${theme.colors.text.primary};
        background-color: ${theme.colors.background.primary};
        overflow: hidden; /* Prevent scroll on mobile */
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* CSS variable fallbacks for non-styled-components usage */
      :root {
        --color-bg-primary: ${theme.colors.background.primary};
        --color-bg-secondary: ${theme.colors.background.secondary};
        --color-accent-primary: ${theme.colors.accent.primary};
        --color-accent-secondary: ${theme.colors.accent.secondary};
        --color-text-primary: ${theme.colors.text.primary};
        --spacing-base: ${theme.spacing.base};
        --spacing-xs: ${theme.spacing.xs};
        --spacing-sm: ${theme.spacing.sm};
        --spacing-md: ${theme.spacing.md};
        --spacing-lg: ${theme.spacing.lg};
        --spacing-xl: ${theme.spacing.xl};
      }

      /* Canvas positioning for Three.js */
      #canvas-container {
        position: fixed;
        inset: 0;
        z-index: 1;
      }

      /* UI overlay positioning */
      #ui-overlay {
        position: fixed;
        inset: 0;
        z-index: 10;
        pointer-events: none;
        isolation: isolate;
      }

      /* Re-enable pointer events on interactive UI elements */
      #ui-overlay > * {
        pointer-events: all;
      }
    `;
    ```

    2. Create or update src/App.tsx to integrate ThemeProvider and GlobalStyles:

    ```typescript
    import React from 'react';
    import { ThemeProvider } from './ui/ThemeProvider';
    import { GlobalStyles } from './design-tokens/GlobalStyles';

    // App component with ThemeProvider and global styles
    const App: React.FC = () => {
      return (
        <ThemeProvider>
          <GlobalStyles />
          {/* React UI components will be added here in later phases */}
          <div id="ui-overlay">
            {/* UI overlay for Three.js canvas */}
          </div>
        </ThemeProvider>
      );
    };

    export default App;
    ```

    The current project uses vanilla TypeScript with Three.js. This creates the React app entry point following the hybrid mounting pattern (React UI layer over Three.js canvas).
  </action>
  <verify>
    Run: npx tsc --noEmit to verify App.tsx and GlobalStyles.ts compile without errors
  </verify>
  <done>
    GlobalStyles.ts and App.tsx exist, App.tsx wraps UI with ThemeProvider and GlobalStyles, GlobalStyles includes CSS resets, CSS variables, and canvas/UI positioning.
  </done>
</task>

</tasks>

<verification>
1. theme.ts imports tokens from tokens.ts and exports complete theme object
2. ThemeProvider.tsx wraps app with styled-components ThemeProvider
3. App.tsx renders ThemeProvider with GlobalStyles
4. tsconfig.json supports JSX compilation
5. vite.config.ts includes React plugin
6. TypeScript compilation passes with no errors
7. CSS variables injected via GlobalStyles for non-styled-components usage
</verification>

<success_criteria>
1. Theme object is type-safe and consumable via useTheme() hook
2. All design tokens (colors, spacing, typography, breakpoints) are in theme
3. DefaultTheme is properly augmented for TypeScript autocomplete
4. GlobalStyles provide CSS resets and CSS variable fallbacks
5. Development server starts without errors
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-design-system/01-foundation-design-system-03b-SUMMARY.md`
</output>
