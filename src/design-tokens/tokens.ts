import colorsJson from './colors.json';
import spacingJson from './spacing.json';
import typographyJson from './typography.json';
import breakpointsJson from './breakpoints.json';

// Type definitions for design tokens
export interface ColorTokens {
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
}

export interface SpacingTokens {
  base: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

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

// Extract $values from W3C format for runtime use
export const colors: ColorTokens = {
  background: {
    primary: colorsJson.color.background.primary.$value,
    secondary: colorsJson.color.background.secondary.$value,
  },
  accent: {
    primary: colorsJson.color.accent.primary.$value,
    secondary: colorsJson.color.accent.secondary.$value,
  },
  text: {
    primary: colorsJson.color.text.primary.$value,
  },
};

export const spacing: SpacingTokens = {
  base: spacingJson.spacing.base.$value,
  xs: spacingJson.spacing.xs.$value,
  sm: spacingJson.spacing.sm.$value,
  md: spacingJson.spacing.md.$value,
  lg: spacingJson.spacing.lg.$value,
  xl: spacingJson.spacing.xl.$value,
};

export const typography: TypographyTokens = {
  fontFamily: {
    display: typographyJson.typography.fontFamily.display.$value,
    ui: typographyJson.typography.fontFamily.ui.$value,
    monospace: typographyJson.typography.fontFamily.monospace.$value,
  },
  fontSize: {
    display: {
      sm: typographyJson.typography.fontSize.display.sm.$value,
      md: typographyJson.typography.fontSize.display.md.$value,
      lg: typographyJson.typography.fontSize.display.lg.$value,
    },
    ui: {
      xs: typographyJson.typography.fontSize.ui.xs.$value,
      sm: typographyJson.typography.fontSize.ui.sm.$value,
      md: typographyJson.typography.fontSize.ui.md.$value,
    },
    monospace: {
      sm: typographyJson.typography.fontSize.monospace.sm.$value,
      md: typographyJson.typography.fontSize.monospace.md.$value,
    },
  },
  fontWeight: {
    regular: typographyJson.typography.fontWeight.regular.$value,
    medium: typographyJson.typography.fontWeight.medium.$value,
    bold: typographyJson.typography.fontWeight.bold.$value,
  },
  lineHeight: {
    tight: typographyJson.typography.lineHeight.tight.$value,
    normal: typographyJson.typography.lineHeight.normal.$value,
  },
};

export const breakpoints: BreakpointTokens = {
  compact: breakpointsJson.breakpoint.compact.$value,
  medium: breakpointsJson.breakpoint.medium.$value,
  large: breakpointsJson.breakpoint.large.$value,
};

// Export raw tokens for style-dictionary if needed
export const rawTokens = {
  colors: colorsJson,
  spacing: spacingJson,
  typography: typographyJson,
  breakpoints: breakpointsJson,
};

// Default export for convenience
export default {
  colors,
  spacing,
  typography,
  breakpoints,
  rawTokens,
};
