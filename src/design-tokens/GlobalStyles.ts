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
