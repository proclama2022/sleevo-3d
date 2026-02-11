---
phase: 01-foundation-design-system
plan: 03
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - src/design-tokens/theme.ts
  - src/ui/ThemeProvider.tsx
  - src/App.tsx
  - tsconfig.json
  - vite.config.ts
autonomous: true

must_haves:
  truths:
    - "styled-components ^6.0.0 is installed"
    - "React ^18.3.0 is installed"
    - "ThemeProvider wraps the application with design tokens"
    - "Theme interface extends DefaultTheme from styled-components"
    - "Theme is consumable via useTheme hook in styled components"
  artifacts:
    - path: "package.json"
      provides: "Dependency declarations"
      contains: "styled-components, react, react-dom, @types/react"
    - path: "src/design-tokens/theme.ts"
      provides: "Theme interface and object for styled-components"
      exports: ["theme as DefaultTheme"]
    - path: "src/ui/ThemeProvider.tsx"
      provides: "React component wrapping app with theme"
      exports: ["ThemeProvider"]
  key_links:
    - from: "src/ui/ThemeProvider.tsx"
      to: "src/design-tokens/theme.ts"
      via: "import statement"
      pattern: "from.*theme"
    - from: "src/App.tsx"
      to: "styled-components ThemeProvider"
      via: "component wrap"
      pattern: "ThemeProvider"
---
<objective>
Install styled-components, create theme configuration, and set up ThemeProvider for the React UI layer.

Purpose: Establish the styled-components theming infrastructure per ARCH-01. This creates the theme object that consumes all design tokens (colors, spacing, typography, breakpoints) and provides them to the React UI layer via ThemeProvider.

Output: Installed dependencies, theme configuration file, ThemeProvider component, and App.tsx integration.
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
  <name>Create styled-components theme configuration</name>
  <files>src/design-tokens/theme.ts</files>
  <action>
    Create src/design-tokens/theme.ts with Theme interface and theme object that extends styled-components DefaultTheme:

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

    This enables type-safe theme consumption in styled components via props.theme.
  </action>
  <verify>
    Run: npx tsc --noEmit to verify DefaultTheme extension is valid
  </verify>
  <done>
    theme.ts exists with Theme interface extending DefaultTheme, exports theme object with all design tokens, DefaultTheme module augmentation is declared.
  </done>
</task>

<task type="auto">
  <name>Create ThemeProvider component</name>
  <files>src/ui/ThemeProvider.tsx</files>
  <action>
    Create src/ui/ThemeProvider.tsx as a React component that wraps the app with styled-components ThemeProvider:

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
  <name>Create or update App.tsx with ThemeProvider integration</name>
  <files>src/App.tsx</files>
  <action>
    Create or update src/App.tsx to integrate ThemeProvider. The current project uses vanilla TypeScript with Three.js, not React. Since we're adding a React UI layer per hybrid mounting pattern:

    First check if src/App.tsx exists. If not, create it:

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

    Also create src/design-tokens/GlobalStyles.ts for CSS resets and CSS variable injection:

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

    Note: The actual Three.js canvas integration will happen in a later phase. This is just the foundation.
  </action>
  <verify>
    Run: npx tsc --noEmit to verify App.tsx and GlobalStyles.ts compile without errors
  </verify>
  <done>
    App.tsx exists and wraps UI with ThemeProvider and GlobalStyles. GlobalStyles includes CSS resets, CSS variables, and canvas/UI positioning.
  </done>
</task>

<task type="auto">
  <name>Configure TypeScript for React JSX</name>
  <files>tsconfig.json</files>
  <action>
    Update tsconfig.json to support React JSX if not already configured:

    Check if tsconfig.json has:
    - "jsx": "react-jsx" or "react"
    - "jsxImportSource": undefined or "react" (NOT "react/jsx-runtime" for compatibility)

    Update tsconfig.json compiler options:

    ```json
    {
      "compilerOptions": {
        // ... existing options ...
        "jsx": "react-jsx",
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "moduleResolution": "bundler",
        "allowImportingTsExtensions": true,
        "resolveJsonModule": true
      }
    }
    ```

    Preserve existing strict mode settings. Only add/modify React-specific options if missing.
  </action>
  <verify>
    Run: npx tsc --noEmit to verify JSX compilation works
  </verify>
  <done>
    tsconfig.json supports JSX compilation, tsc --noEmit passes.
  </done>
</task>

<task type="auto">
  <name>Update Vite config for React</name>
  <files>vite.config.ts</files>
  <action>
    Update vite.config.ts to support React if not already configured:

    Check current vite.config.ts structure. The project uses Vite 7.3.1 which has built-in React support via @vitejs/plugin-react.

    If @vitejs/plugin-react is not in the config:

    1. Install the plugin:
       ```bash
       npm install -D @vitejs/plugin-react
       ```

    2. Update vite.config.ts:
       ```typescript
       import { defineConfig } from 'vite';
       import react from '@vitejs/plugin-react';

       export default defineConfig({
         plugins: [react()],
         // ... existing config ...
       });
       ```

    Note: The existing Three.js project may already have some React config due to @react-three/fiber. Check existing plugins before adding.
  </action>
  <verify>
    Run: npm run dev and verify server starts without React/Vite errors
  </verify>
  <done>
    vite.config.ts includes @vitejs/plugin-react, dev server starts successfully.
  </done>
</task>

</tasks>

<verification>
1. styled-components ^6.0.0 and React ^18.3.0 installed
2. theme.ts exports Theme interface extending DefaultTheme
3. ThemeProvider.tsx wraps app with styled-components ThemeProvider
4. App.tsx renders ThemeProvider with GlobalStyles
5. tsconfig.json supports JSX compilation
6. vite.config.ts includes React plugin
7. TypeScript compilation passes with no errors
8. CSS variables injected via GlobalStyles for non-styled-components usage
</verification>

<success_criteria>
1. Theme object is type-safe and consumable via useTheme() hook
2. All design tokens (colors, spacing, typography, breakpoints) are in theme
3. DefaultTheme is properly augmented for TypeScript autocomplete
4. GlobalStyles provide CSS resets and CSS variable fallbacks
5. Development server starts without errors
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-design-system/01-foundation-design-system-03-SUMMARY.md`
</output>
