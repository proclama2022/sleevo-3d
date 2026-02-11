import colorsJson from './colors.json';
import spacingJson from './spacing.json';

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

// Export raw tokens for style-dictionary if needed
export const rawTokens = {
  colors: colorsJson,
  spacing: spacingJson,
};

// Default export for convenience
export default {
  colors,
  spacing,
  rawTokens,
};
