// Theme interface defining custom theme properties
// Note: Actual token imports will be added in plan 03b after plans 01 and 02b complete
export interface CustomTheme {
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

// Theme object placeholder - will be populated in plan 03b
// export const theme: Theme = { ... };

export type { CustomTheme as Theme };
