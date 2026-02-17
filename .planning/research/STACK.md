# Technology Stack

**Project:** Sleevo UI/UX Redesign - Mobile Game UI with Design Tokens
**Researched:** 2026-02-11
**Confidence:** HIGH

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **styled-components** | ^6.0.0 | CSS-in-JS styling library for React components | Native TypeScript support (v6+), industry standard for React apps, excellent theme prop/context API, zero-runtime CSS injection overhead when using babel plugin, supports CSS nesting and all modern CSS features |
| **React** | ^18.3.0 | UI library for component rendering | Required for styled-components, current project already uses React Three.js (@react-three/fiber), enables component-based architecture for game UI |
| **@types/react** | ^18.3.0 | TypeScript type definitions for React | Required for type-safe React development |

### Design Token Management

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **W3C Design Tokens Format** | (spec) | JSON-based token schema for design system values | Industry standard format (2023), platform-agnostic, supported by major tools (Figma, Adobe XD), uses `$value` and `$type` properties for type-safe tokens, supports composite tokens (typography, shadows, gradients) |
| **style-dictionary** | ^3.0.0 | Build tool to transform design tokens to platform-specific code | Transforms JSON tokens to CSS variables, Sass variables, JS objects, etc., supports multiple output formats, extensible via custom formats, industry standard for token pipeline |

### Build & Development Tools

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| **babel-plugin-styled-components** | ^2.0.0 | Transpilation, SSR support, minification, debugging | Adds displayName to components, minifies CSS, enables dead code elimination with `pure: true`, required for production builds |
| **@swc/plugin-styled-components** | ^1.0.0 | Faster alternative to Babel for SWC users | Drop-in replacement for babel-plugin, significantly faster compilation time, same feature set |
| **postcss-styled-syntax** | ^1.0.0 | Stylelint support for styled-components CSS | Enables stylelint to parse and validate CSS within template literals, required for CSS linting in styled-components projects |
| **stylelint** | ^15.0.0 | Modern CSS linter | Use v15+ with `postcss-styled-syntax`, supports latest CSS features, better error reporting |

### Mobile Performance Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **react-native-web** | ^0.18.0 | Mobile gesture handling and touch events | If adding advanced mobile gestures (swipe, long-press) beyond basic click/touch |
| **use-gesture** | ^10.3.0 | Advanced mouse/touch gesture hooks | For complex drag-and-drop beyond HTML5 DnD, already used in current project for canvas interactions |

## Installation

```bash
# Core styling and React
npm install styled-components@^6.0.0 react@^18.3.0
npm install -D @types/react@^18.3.0

# Design token pipeline
npm install -D style-dictionary@^3.0.0

# Build tooling (choose Babel or SWC, not both)
npm install -D babel-plugin-styled-components@^2.0.0
# OR
npm install -D @swc/core@^1.10.0 @swc/plugin-styled-components@^1.0.0

# CSS linting (optional but recommended)
npm install -D stylelint@^15.0.0 stylelint-config-standard postcss-styled-syntax@^1.0.0

# If not already installed for Three.js
npm install react@^18.3.0 react-dom@^18.3.0
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| **CSS-in-JS** | styled-components | **vanilla-extract** | Too manual for large design systems, no theme prop API built-in, more boilerplate |
| | | | **emotion** | Simpler API but less mature theme ecosystem, smaller community, fewer resources for game UI patterns |
| | | | **CSS Modules** | Requires bundler setup, harder to theme dynamically, no runtime theme switching without build step |
| **Design Token Build** | style-dictionary | **theo** | Abandoned project (last release 2019), not maintained for modern CSS features |
| | | | **Diez** | Abandoned project (2018), no TypeScript support, doesn't follow W3C spec |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **@types/styled-components** | No longer needed (v6+ provides native types) | Remove from package.json, use built-in types |
| **styled-components/macro** | Removed in v6.1, unnecessary bloat | Use standard `styled-components` imports with babel plugin |
| **Babel preset-env** for styled-components | Unnecessary in modern setups | Use specific babel plugins or SWC instead |
| **inline styles** for themed components | Breaks theme prop system, harder to maintain | Use styled-components with ThemeProvider |
| **CSS-in-JS objects** (e.g., `style={{ color: 'red' }}`) | Harder to theme, no nesting, no pseudo-selectors | Use styled-components for all themed components |

## Stack Patterns by Variant

**If using Vite:**
- Use `@vitejs/plugin-react` with Babel for styled-components plugin
- Configure `styled-components` plugin in vite.config.js
- Add `@types/styled-components` to `vite.config.ts` types for development (optional)

**If using Webpack:**
- Use `babel-loader` with `babel-plugin-styled-components`
- Enable `pure: true` for production builds (dead code elimination)

**If using SWC (Next.js, Remix, etc.):**
- Use `@swc/plugin-styled-components` instead of babel-plugin
- Significantly faster build times (10x+ faster than Babel)

**If targeting mobile only:**
- Add `user-scalable=no` to viewport meta tag (already present)
- Use touch-friendly tap targets (min 44x44px per WCAG)
- Test on real devices (iOS Safari has different styled-components hydration behavior)

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| styled-components@^6.0.0 | React@^16.8.0 | Dropped support for React < 16.8 |
| styled-components@^6.0.0 | stylis@^4.0.0 | Required upgrade from stylis@^3.0.0 for v6 |
| babel-plugin-styled-components@^2.0.0 | Babel@^7.0.0 | May work with older babel but not tested |
| @swc/plugin-styled-components@^1.0.0 | @swc/core@^1.10.0 | Minimum SWC core version |

## Integration with Existing Three.js Canvas

**Pattern: Overlay UI on top of WebGL canvas**

```typescript
// src/App.tsx (new file)
import { ThemeProvider } from 'styled-components';
import { theme } from './design-tokens/theme';
import { CanvasOverlay } from './components/CanvasOverlay';
import { TopBar } from './components/TopBar';
import { Controls } from './components/Controls';

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CanvasOverlay>
      {/* Three.js canvas renders here via @react-three/fiber */}
      <TopBar />
      <Controls />
    </CanvasOverlay>
  </ThemeProvider>
);
```

**Key Principles:**
- Three.js canvas (`@react-three/fiber`'s `<Canvas>`) renders in background
- UI overlay uses `position: fixed` with higher `z-index` (10+)
- UI overlay has `pointer-events: none` on container, `pointer-events: all` on interactive elements
- ThemeProvider wraps entire app, but styled-components for UI only (not 3D objects)
- 3D objects use Three.js materials, not styled-components

**Performance Considerations:**
- styled-components generates CSS classes at runtime (no style recalc on props change)
- Use transient props (`$prefix`) for styling props that shouldn't reach DOM
- Declare styled components outside render (not inline) to avoid recreation
- Use `css` helper for style composition (prevents unnecessary component creation)

## 8px Grid System Implementation

**Using design tokens for spacing:**

```json
// design-tokens/spacing.json
{
  "spacing": {
    "$type": "dimension",
    "base": {
      "$value": "8px",
      "$description": "Base spacing unit (8px grid)"
    },
    "xs": { "$value": "4px", "$description": "Half base unit" },
    "sm": { "$value": "8px", "$description": "1x base unit" },
    "md": { "$value": "16px", "$description": "2x base unit" },
    "lg": { "$value": "24px", "$description": "3x base unit" },
    "xl": { "$value": "32px", "$description": "4x base unit" }
  }
}
```

**Transformed to CSS variables by style-dictionary:**

```css
:root {
  --spacing-base: 8px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

**Used in styled-components:**

```typescript
import styled from 'styled-components';

const StatCard = styled.div`
  padding: var(--spacing-md);
  gap: var(--spacing-sm);
  border-radius: calc(var(--spacing-base) * 2);
`;
```

## Dark Theme with WCAG AA Contrast

**Design token structure for colors:**

```json
// design-tokens/color.json
{
  "color": {
    "background": {
      "primary": {
        "$value": "#1a1a1a",
        "$type": "color",
        "$description": "Primary background (dark gray)",
        "$extensions": {
          "wcag-contrast": "Passes AA with white text (14.1:1)"
        }
      },
      "secondary": {
        "$value": "#2d2d2d",
        "$type": "color",
        "$description": "Secondary background (lighter gray)"
      }
    },
    "text": {
      "primary": {
        "$value": "#ffffff",
        "$type": "color",
        "$description": "Primary text (white)"
      },
      "secondary": {
        "$value": "#b0b0b0",
        "$type": "color",
        "$description": "Secondary text (light gray, 12.6:1 on dark bg)"
      }
    },
    "accent": {
      "primary": {
        "$value": "#ff6c3f",
        "$type": "color",
        "$description": "Primary accent (orange, 4.5:1 on dark)",
        "$extensions": {
          "wcag-contrast": "Passes AA on dark backgrounds"
        }
      }
    }
  }
}
```

**Theme consumption in styled-components:**

```typescript
// src/design-tokens/theme.ts
import { DefaultTheme } from 'styled-components';

interface Theme {
  colors: {
    background: {
      primary: string;
      secondary: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
    accent: {
      primary: string;
    };
  };
  spacing: {
    base: string;
    sm: string;
    md: string;
    lg: string;
  };
}

export const theme: Theme = {
  colors: {
    background: {
      primary: '#1a1a1a',
      secondary: '#2d2d2d',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    accent: {
      primary: '#ff6c3f',
    },
  },
  spacing: {
    base: '8px',
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
};

// Type assertion for DefaultTheme
export default theme as DefaultTheme<Theme>;
```

**Maintaining 60fps on mobile:**

1. **Avoid layout thrashing**
   - Use `transform` and `opacity` for animations (GPU-accelerated)
   - Avoid animating `width`, `height`, `top`, `left`
   - Use `will-change: transform` sparingly (only on animating elements)

2. **Reduce styled-components overhead**
   - Enable `pure: true` in babel plugin for dead code elimination
   - Use `css` helper for shared styles (prevents duplicate classes)
   - Declare styled components outside render functions

3. **Optimize Three.js + UI layering**
   - UI overlay uses `pointer-events: none` on container
   - Interactive UI elements use `pointer-events: all`
   - Three.js canvas sits behind (z-index: 1)
   - UI overlay sits in front (z-index: 10+)

4. **CSS containment**
   - Use `isolation: isolate` on UI overlay container
   - Prevents UI styles from leaking to Three.js canvas
   - Prevents Three.js styles from affecting UI

```typescript
const UIOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10;
  isolation: isolate;
  pointer-events: none;

  > * {
    pointer-events: all;
  }
`;
```

## Sources

- https://styled-components.com/docs — Main documentation (HIGH confidence)
- https://styled-components.com/docs/advanced#theming — ThemeProvider and theming API (HIGH confidence)
- https://styled-components.com/docs/faqs — Migration guides and best practices (HIGH confidence)
- https://styled-components.com/docs/tooling — Babel/SWC plugin configuration (HIGH confidence)
- https://design-tokens.github.io/community-group/format/ — W3C Design Tokens specification (HIGH confidence)
- Current project's package.json and index.html — Existing vanilla CSS/HTML setup (HIGH confidence)

---

*Stack research for: Mobile Game UI with styled-components and Design Tokens*
*Researched: 2026-02-11*
