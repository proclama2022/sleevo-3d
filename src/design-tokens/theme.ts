import { colors, spacing, typography, breakpoints } from './tokens';

// Theme interface defining custom theme properties (not extending DefaultTheme to avoid circular reference)
// Module augmentation is handled in styled-components.d.ts
export interface Theme {
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

// Re-export CustomTheme for backwards compatibility with styled-components.d.ts
export type { Theme as CustomTheme };

export default theme;
