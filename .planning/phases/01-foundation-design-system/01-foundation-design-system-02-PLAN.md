---
phase: 01-foundation-design-system
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/design-tokens/typography.json
  - src/design-tokens/breakpoints.json
  - src/design-tokens/tokens.ts
autonomous: true

must_haves:
  truths:
    - "Typography scale includes 3 fonts (Bebas Neue, Manrope, JetBrains Mono)"
    - "Font sizes match requirements (Display 44-60px, UI 12-16px, Mono 10-12px)"
    - "Breakpoints match mobile sizes (compact <375px, medium 375-414px, large >414px)"
    - "Typography tokens are consumable as CSS variables"
  artifacts:
    - path: "src/design-tokens/typography.json"
      provides: "Typography scale tokens in W3C format"
      contains: "fontFamily, fontSize for display, ui, monospace"
    - path: "src/design-tokens/breakpoints.json"
      provides: "Responsive breakpoint definitions"
      contains: "compact, medium, large with pixel values"
  key_links:
    - from: "src/design-tokens/typography.json"
      to: "Google Fonts import"
      via: "font-family names"
      pattern: "Bebas Neue|Manrope|JetBrains Mono"
---
<objective>
Create typography scale and responsive breakpoint design tokens.

Purpose: Define the typography system (fonts and sizes) and responsive breakpoints per DESIGN-02 and DESIGN-04 requirements. These tokens will be consumed by styled-components for consistent text rendering across all device sizes.

Output: JSON token files for typography and breakpoints, updated TypeScript exports.
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
  <name>Create typography design tokens</name>
  <files>src/design-tokens/typography.json</files>
  <action>
    Create src/design-tokens/typography.json following W3C Design Tokens Format with 3 font scales (per locked decision DESIGN-02):

    ```json
    {
      "typography": {
        "fontFamily": {
          "display": {
            "$value": "'Bebas Neue', sans-serif",
            "$type": "fontFamily",
            "$description": "Display font for headings and game title"
          },
          "ui": {
            "$value": "'Manrope', sans-serif",
            "$type": "fontFamily",
            "$description": "UI font for labels, buttons, HUD elements"
          },
          "monospace": {
            "$value": "'JetBrains Mono', monospace",
            "$type": "fontFamily",
            "$description": "Monospace font for scores and numbers"
          }
        },
        "fontSize": {
          "display": {
            "sm": {
              "$value": "44px",
              "$type": "dimension",
              "$description": "Small display text"
            },
            "md": {
              "$value": "52px",
              "$type": "dimension",
              "$description": "Medium display text"
            },
            "lg": {
              "$value": "60px",
              "$type": "dimension",
              "$description": "Large display text (game title)"
            }
          },
          "ui": {
            "xs": {
              "$value": "12px",
              "$type": "dimension",
              "$description": "Extra small UI text (labels)"
            },
            "sm": {
              "$value": "14px",
              "$type": "dimension",
              "$description": "Small UI text"
            },
            "md": {
              "$value": "16px",
              "$type": "dimension",
              "$description": "Base UI text (body, buttons)"
            }
          },
          "monospace": {
            "sm": {
              "$value": "10px",
              "$type": "dimension",
              "$description": "Small monospace (compact scores)"
            },
            "md": {
              "$value": "12px",
              "$type": "dimension",
              "$description": "Base monospace (score displays)"
            }
          }
        },
        "fontWeight": {
          "regular": {
            "$value": "400",
            "$type": "fontWeight"
          },
          "medium": {
            "$value": "500",
            "$type": "fontWeight"
          },
          "bold": {
            "$value": "700",
            "$type": "fontWeight"
          }
        },
        "lineHeight": {
          "tight": {
            "$value": "1.1",
            "$type": "lineHeight"
          },
          "normal": {
            "$value": "1.5",
            "$type": "lineHeight"
          }
        }
      }
    }
    ```

    Include Google Fonts import instructions in $description or separate comment.
  </action>
  <verify>
    Check that font size ranges match requirements:
    - Display: 44-60px (PASS if min >=44, max <=60)
    - UI: 12-16px (PASS if min >=12, max <=16)
    - Monospace: 10-12px (PASS if min >=10, max <=12)
  </verify>
  <done>
    typography.json exists with 3 font families, size ranges within spec requirements, W3C format with $value and $type.
  </done>
</task>

<task type="auto">
  <name>Create responsive breakpoint tokens</name>
  <files>src/design-tokens/breakpoints.json</files>
  <action>
    Create src/design-tokens/breakpoints.json following W3C Design Tokens Format with 3 mobile breakpoints (per locked decision DESIGN-04):

    ```json
    {
      "breakpoint": {
        "compact": {
          "$value": "374px",
          "$type": "dimension",
          "$description": "Compact devices (<375px) - iPhone SE, small Android"
        },
        "medium": {
          "$value": "414px",
          "$type": "dimension",
          "$description": "Medium devices (375-414px) - iPhone 14, Pixel"
        },
        "large": {
          "$value": "415px",
          "$type": "dimension",
          "$description": "Large devices (>414px) - iPhone Pro Max, tablets"
        }
      }
    }
    ```

    Note: Use min-width media queries, so values are set to the breakpoint threshold (e.g., 374px means apply styles from 0-374px for compact).
  </action>
  <verify>
    Check that breakpoint values align with requirements:
    - Compact: <375px (max-width: 374px)
    - Medium: 375-414px (min-width: 375px, max-width: 414px)
    - Large: >414px (min-width: 415px)
  </verify>
  <done>
    breakpoints.json exists with 3 breakpoints (compact, medium, large), values align with pixel requirements.
  </done>
</task>

<task type="auto">
  <name>Add Google Fonts import to index.html</name>
  <files>index.html</files>
  <action>
    Add Google Fonts import to index.html <head> section for the 3 required fonts:

    ```html
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;700&family=Manrope:wght@400;500;700&display=swap" rel="stylesheet">
    ```

    Place these links before any other stylesheets. Use display=swap for performance, preconnect for faster loading.
  </action>
  <verify>
    Run: grep -q "fonts.googleapis.com" index.html to verify font import exists
  </verify>
  <done>
    index.html includes Google Fonts link for Bebas Neue, Manrope, and JetBrains Mono with display=swap.
  </done>
</task>

<task type="auto">
  <name>Update TypeScript exports for new tokens</name>
  <files>src/design-tokens/tokens.ts</files>
  <action>
    Update src/design-tokens/tokens.ts to include typography and breakpoint exports:

    Add to existing file:

    ```typescript
    import typography from './typography.json';
    import breakpoints from './breakpoints.json';

    // Add new type definitions
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

    // Add exports alongside existing colors and spacing
    export const typography: TypographyTokens = {
      fontFamily: {
        display: typography.typography.fontFamily.display.$value,
        ui: typography.typography.fontFamily.ui.$value,
        monospace: typography.typography.fontFamily.monospace.$value,
      },
      fontSize: {
        display: {
          sm: typography.typography.fontSize.display.sm.$value,
          md: typography.typography.fontSize.display.md.$value,
          lg: typography.typography.fontSize.display.lg.$value,
        },
        ui: {
          xs: typography.typography.fontSize.ui.xs.$value,
          sm: typography.typography.fontSize.ui.sm.$value,
          md: typography.typography.fontSize.ui.md.$value,
        },
        monospace: {
          sm: typography.typography.fontSize.monospace.sm.$value,
          md: typography.typography.fontSize.monospace.md.$value,
        },
      },
      fontWeight: {
        regular: typography.typography.fontWeight.regular.$value,
        medium: typography.typography.fontWeight.medium.$value,
        bold: typography.typography.fontWeight.bold.$value,
      },
      lineHeight: {
        tight: typography.typography.lineHeight.tight.$value,
        normal: typography.typography.lineHeight.normal.$value,
      },
    };

    export const breakpoints: BreakpointTokens = {
      compact: breakpoints.breakpoint.compact.$value,
      medium: breakpoints.breakpoint.medium.$value,
      large: breakpoints.breakpoint.large.$value,
    };

    // Update rawTokens export
    export const rawTokens = {
      colors: colors,
      spacing: spacing,
      typography: typography,
      breakpoints: breakpoints,
    };
    ```

    Update the existing file rather than replacing it entirely.
  </action>
  <verify>
    Run: npx tsc --noEmit to verify no type errors
  </verify>
  <done>
    tokens.ts exports TypographyTokens and BreakpointTokens interfaces, with runtime values extracted from JSON $value properties.
  </done>
</task>

</tasks>

<verification>
1. typography.json exists with 3 font families and size ranges within spec
2. breakpoints.json exists with 3 mobile breakpoints at correct pixel values
3. index.html includes Google Fonts import for Bebas Neue, Manrope, JetBrains Mono
4. tokens.ts exports updated with typography and breakpoint types
5. TypeScript compilation passes with no errors
</verification>

<success_criteria>
1. Display font sizes: 44-60px range (per DESIGN-02)
2. UI font sizes: 12-16px range (per DESIGN-02)
3. Monospace sizes: 10-12px range (per DESIGN-02)
4. Breakpoints: compact <375px, medium 375-414px, large >414px (per DESIGN-04)
5. Google Fonts loaded with display=swap for performance
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-design-system/01-foundation-design-system-02-SUMMARY.md`
</output>
