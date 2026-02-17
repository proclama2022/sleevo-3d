---
phase: 01-foundation-design-system
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/design-tokens/colors.json
  - src/design-tokens/spacing.json
  - src/design-tokens/tokens.ts
autonomous: true

must_haves:
  truths:
    - "All color combinations pass WCAG AA contrast ratios (4.5:1 body, 3:1 large text)"
    - "Design tokens follow W3C format with $value and $type properties"
    - "Colors are consumable as TypeScript interface"
    - "Spacing follows 8px grid system exactly"
  artifacts:
    - path: "src/design-tokens/colors.json"
      provides: "Color palette tokens in W3C format"
      contains: "$value, $type, $extensions.wcag-contrast"
    - path: "src/design-tokens/spacing.json"
      provides: "8px grid spacing tokens"
      contains: "base: 8px, scale: 4px, 8px, 16px, 24px, 32px"
    - path: "src/design-tokens/tokens.ts"
      provides: "TypeScript exports for design tokens"
      exports: ["colors", "spacing"]
  key_links:
    - from: "src/design-tokens/colors.json"
      to: "WCAG AA validation"
      via: "contrast ratio calculations"
      pattern: "4.5:1|3:1"
---
<objective>
Create design tokens for color palette and 8px spacing grid system.

Purpose: Establish the foundational design tokens that will be consumed by styled-components ThemeProvider. Colors must pass WCAG AA contrast validation for dark theme accessibility. Spacing follows 8px grid for consistent UI rhythm.

Output: JSON token files (W3C format) and TypeScript exports.
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
  <name>Create color design tokens with WCAG AA validation</name>
  <files>src/design-tokens/colors.json</files>
  <action>
    Create src/design-tokens/colors.json following W3C Design Tokens Format with these colors (per locked decision DESIGN-01):

    ```json
    {
      "color": {
        "background": {
          "primary": {
            "$value": "#24180f",
            "$type": "color",
            "$description": "Warm ink - dark roasted coffee, primary background"
          },
          "secondary": {
            "$value": "#3d2c1f",
            "$type": "color",
            "$description": "Soft ink - aged paper shadows, secondary background"
          }
        },
        "accent": {
          "primary": {
            "$value": "#ff6c3f",
            "$type": "color",
            "$description": "Sunset orange - main accent color"
          },
          "secondary": {
            "$value": "#2db2d7",
            "$type": "color",
            "$description": "Vintage teal - ice accent color"
          }
        },
        "text": {
          "primary": {
            "$value": "#fff8f0",
            "$type": "color",
            "$description": "Cream white - primary text color"
          }
        }
      }
    }
    ```

    Add $extensions.wcag-contrast property to each color documenting contrast ratios:
    - #fff8f0 on #24180f: Calculate contrast ratio (should be >=4.5:1 for AA)
    - #ff6c3f on #24180f: Calculate contrast ratio (should be >=3:1 for UI components)
    - #2db2d7 on #24180f: Calculate contrast ratio (should be >=3:1)

    If any contrast fails WCAG AA, add 0.5 cushion by lightening text or darkening background.
  </action>
  <verify>
    Contrast validation: Use online checker or manual calculation to verify:
    1. #fff8f0 on #24180f >= 4.5:1
    2. #ff6c3f on #24180f >= 3:1
    3. #2db2d7 on #24180f >= 3:1
  </verify>
  <done>
    colors.json exists with all 5 colors, W3C format with $value and $type properties, and documented WCAG AA contrast ratios in $extensions.
  </done>
</task>

<task type="auto">
  <name>Create spacing tokens for 8px grid system</name>
  <files>src/design-tokens/spacing.json</files>
  <action>
    Create src/design-tokens/spacing.json following W3C Design Tokens Format with 8px grid scale (per locked decision DESIGN-03):

    ```json
    {
      "spacing": {
        "base": {
          "$value": "8px",
          "$type": "dimension",
          "$description": "Base spacing unit (8px grid)"
        },
        "xs": {
          "$value": "4px",
          "$type": "dimension",
          "$description": "Half base unit (0.5x)"
        },
        "sm": {
          "$value": "8px",
          "$type": "dimension",
          "$description": "1x base unit"
        },
        "md": {
          "$value": "16px",
          "$type": "dimension",
          "$description": "2x base unit"
        },
        "lg": {
          "$value": "24px",
          "$type": "dimension",
          "$description": "3x base unit"
        },
        "xl": {
          "$value": "32px",
          "$type": "dimension",
          "$description": "4x base unit"
        }
      }
    }
    ```

    All spacing must be multiples of 4px (8px grid compliance).
  </action>
  <verify>
    Check that all spacing values are multiples of 4px (4, 8, 16, 24, 32).
  </verify>
  <done>
    spacing.json exists with 6 spacing steps (xs, sm, md, lg, xl, base), all values are multiples of 4px.
  </done>
</task>

<task type="auto">
  <name>Create TypeScript exports for design tokens</name>
  <files>src/design-tokens/tokens.ts</files>
  <action>
    Create src/design-tokens/tokens.ts to provide type-safe imports for React/styled-components:

    ```typescript
    import colors from './colors.json';
    import spacing from './spacing.json';

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
        primary: colors.color.background.primary.$value,
        secondary: colors.color.background.secondary.$value,
      },
      accent: {
        primary: colors.color.accent.primary.$value,
        secondary: colors.color.accent.secondary.$value,
      },
      text: {
        primary: colors.color.text.primary.$value,
      },
    };

    export const spacing: SpacingTokens = {
      base: spacing.spacing.base.$value,
      xs: spacing.spacing.xs.$value,
      sm: spacing.spacing.sm.$value,
      md: spacing.spacing.md.$value,
      lg: spacing.spacing.lg.$value,
      xl: spacing.spacing.xl.$value,
    };

    // Export raw tokens for style-dictionary if needed
    export const rawTokens = {
      colors: colors,
      spacing: spacing,
    };
    ```

    Ensure src/design-tokens directory is created if it doesn't exist.
  </action>
  <verify>
    Run: npx tsc --noEmit to verify no type errors in tokens.ts
  </verify>
  <done>
    tokens.ts exports ColorTokens and SpacingTokens interfaces, with runtime values extracted from JSON $value properties.
  </done>
</task>

</tasks>

<verification>
1. File structure: src/design-tokens/ directory exists with colors.json, spacing.json, tokens.ts
2. Type safety: TypeScript compilation passes with no errors
3. WCAG AA: All documented contrast ratios meet 4.5:1 (body) or 3:1 (large text/components)
4. 8px grid: All spacing values are multiples of 4px
5. W3C format: JSON uses $value, $type, $description properties correctly
</verification>

<success_criteria>
1. All 5 colors from DESIGN-01 exist in colors.json with W3C format
2. WCAG AA contrast validated and documented in $extensions
3. 6 spacing values exist following 8px grid (4, 8, 16, 24, 32px)
4. TypeScript exports provide type-safe token access
5. No type errors when running tsc --noEmit
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-design-system/01-foundation-design-system-01-SUMMARY.md`
</output>
