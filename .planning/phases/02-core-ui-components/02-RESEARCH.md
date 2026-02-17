# Phase 2: Core UI Components - Research

**Researched:** 2026-02-11
**Domain:** React component development with styled-components, accessibility, drag-and-drop UI feedback, and SVG circular progress indicators
**Confidence:** MEDIUM

## Summary

Phase 2 requires building four visual components: VinylCard (draggable records), ShelfSlot (drop targets), ProgressBar (circular gauge), and HUD (game status bar). The existing codebase uses React with styled-components v6.3.9, Three.js for 3D rendering, and a design token system from Phase 1.

Key findings: styled-components is now in **maintenance mode** (as of April 2025) but remains viable for this phase. The project's existing setup with styled-components v6 provides TypeScript support without separate @types package. Touch targets must meet WCAG 2.5.5/2.5.8 standards (44x44px minimum). Color-blind accessibility requires redundant indicators beyond color alone (shapes, patterns, labels). Circular progress gauges are best implemented with SVG using stroke-dasharray/stroke-dashoffset technique.

**Primary recommendation:** Use existing styled-components setup with TypeScript interface patterns for component props, implement SVG circular gauge with stroke-dashoffset animation, ensure 44px minimum touch targets, and provide shape+color feedback for accessibility.

## User Constraints (from CONTEXT.md)

### Locked Decisions
The following decisions are **LOCKED** and must be followed exactly:

- **VinylCard Visual Treatment:**
  - Balanced art + info — Album art prominent but genre label, year/decade, and title text visible
  - Modern vintage styling — Clean borders, subtle warmth, modern proportions (not aged/worn look)
  - Color differentiation for states — Visual distinction between idle, dragging, placed via color shift/border highlight (not just elevation)

- **ShelfSlot Feedback Clarity:**
  - Realistic shelf look — Filled slots show vinyl clearly; empty slots look like wood/metal shelf space
  - Color-coded glow for drop targets — Green glow for valid, red glow for invalid
  - Immediate feedback — Glow appears on all slots as soon as drag starts (not on proximity)
  - Success indicator — Correctly placed vinyl shows subtle check mark or "correct" indicator

- **HUD Layout & Hierarchy:**
  - Balanced row — Level name, score, timer, moves count equally weighted horizontally
  - Top bar, full width — Fixed at top of screen
  - Circular gauge for progress — Level progress shown as circular gauge that fills clockwise (not horizontal bar)
  - Four elements displayed: Level name, Score, Timer, Moves count

- **Accessibility Depth:**
  - Minimal A11y — Basic labels only, visual game primarily
  - Touch-focused — No visible focus ring (mobile-first, touch interaction)
  - Honor reduced motion — All animations respect `prefers-reduced-motion`, fall back to instant transitions
  - Shape + color for feedback — Valid/invalid indicators use both shape and color (color blind friendly)

### Claude's Discretion
Areas with freedom to recommend:
- Exact typography sizing for card text
- Specific color values for valid/invalid glow
- Circular gauge visual design (thickness, colors)
- Check mark/success indicator style
- Transition timing between states (within Phase 2 scope — not animation "feel")

### Deferred Ideas (OUT OF SCOPE)
The following are **OUT OF SCOPE** for this phase:
- Animation feel and timing (spring easing, bounce, etc.) — Phase 3
- Complex screen reader navigation — out of scope, visual game
- Keyboard/TV remote navigation — touch-first design

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x (inferred) | UI framework | Industry standard for component-based UI |
| styled-components | 6.3.9 | CSS-in-JS styling | Already in project, TypeScript support built-in |
| TypeScript | 5.x | Type safety | Project configured, prevents runtime errors |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-three/fiber | 9.5.0 | 3D rendering integration | UI overlays on Three.js canvas (future phases) |
| @react-three/drei | 10.7.7 | Three.js helpers | HTML overlay components when needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| styled-components | CSS Modules, Tailwind | styled-components already in use; alternatives would require refactor. Note: styled-components is in maintenance mode as of April 2025 but viable for this project |

**Installation:**
```bash
# No new packages needed - using existing styled-components v6
# Dependencies already installed:
# - styled-components@6.3.9
# - @types/react (included in React 18)
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/          # NEW: React UI components
│   ├── VinylCard/      # Draggable vinyl card component
│   │   ├── VinylCard.tsx
│   │   ├── VinylCard.test.tsx
│   │   └── index.ts
│   ├── ShelfSlot/      # Drop target component
│   │   ├── ShelfSlot.tsx
│   │   ├── ShelfSlot.test.tsx
│   │   └── index.ts
│   ├── ProgressBar/     # Circular progress gauge
│   │   ├── ProgressBar.tsx
│   │   ├── ProgressBar.test.tsx
│   │   └── index.ts
│   └── HUD/            # Game status bar
│       ├── HUD.tsx
│       ├── HUD.test.tsx
│       └── index.ts
├── ui/                 # Existing: ThemeProvider
├── design-tokens/       # Existing: theme system
└── types.ts            # Existing: Vinyl, Level interfaces
```

### Pattern 1: Styled Component with TypeScript Props
**What:** Create styled components with strongly-typed props using TypeScript interfaces
**When to use:** All UI components to ensure type safety and IntelliSense support

**Example:**
```typescript
// Source: styled-components official docs + existing patterns
import styled from 'styled-components';
import { theme } from '../design-tokens/theme';

interface VinylCardProps {
  state: 'idle' | 'dragging' | 'placed';
  genre: string;
  year: number;
  title: string;
  coverImage?: string;
}

const CardContainer = styled.div<{ $state: VinylCardProps['$state'] }>`
  border: 2px solid ${(props) => {
    switch (props.$state) {
      case 'idle': return props.theme.colors.background.secondary;
      case 'dragging': return props.theme.colors.accent.primary;
      case 'placed': return '#4ade80'; // Success green
      default: return props.theme.colors.background.secondary;
    }
  }};
  background: ${(props) => props.theme.colors.background.secondary};
  border-radius: 8px;
  padding: ${(props) => props.theme.spacing.sm};
  min-height: 44px; // WCAG 2.5.5 touch target
  min-width: 44px;
`;

export const VinylCard: React.FC<VinylCardProps> = ({ state, genre, year, title }) => {
  return (
    <CardContainer $state={state}>
      <span className="genre">{genre}</span>
      <span className="year">{year}</span>
      <span className="title">{title}</span>
    </CardContainer>
  );
};
```

### Pattern 2: SVG Circular Progress Gauge
**What:** Use SVG circle with stroke-dasharray and stroke-dashoffset for progress
**When to use:** Circular progress indicator in HUD

**Example:**
```typescript
// Source: LogRocket SVG Circular Progress tutorial + CSS-Tricks
import styled from 'styled-components';

interface ProgressBarProps {
  progress: number; // 0-100
  size?: number; // pixel diameter
}

const calculateDashOffset = (progress: number, radius: number) => {
  const circumference = 2 * Math.PI * radius;
  return circumference - (progress / 100) * circumference;
};

const ProgressSvg = styled.svg<{ $size: number }>`
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  transform: rotate(-90deg); // Start from top
`;

const ProgressCircle = styled.circle<{ $progress: number; $radius: number }>`
  fill: none;
  stroke: ${(props) => props.theme.colors.accent.primary};
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
  stroke-dasharray: ${(props) => 2 * Math.PI * props.$radius};
  stroke-dashoffset: ${(props) => calculateDashOffset(props.$progress, props.$radius)};
`;

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, size = 64 }) => {
  const radius = (size - 16) / 2; // Account for stroke width
  const center = size / 2;

  return (
    <ProgressSvg $size={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke={theme.colors.background.secondary}
        strokeWidth="8"
        fill="none"
      />
      {/* Progress circle */}
      <ProgressCircle
        $progress={progress}
        $radius={radius}
        cx={center}
        cy={center}
        r={radius}
      />
    </ProgressSvg>
  );
};
```

### Pattern 3: Accessibility with Reduced Motion
**What:** Respect prefers-reduced-motion media query for animations
**When to use:** All animated transitions between states

**Example:**
```typescript
// Source: MDN ARIA + CSS accessibility guides 2025
const AnimatedCard = styled.div<{ $isDragging: boolean }>`
  transition: transform ${(props) =>
    props.$isDragging ? 'none' : '0.2s ease-out'},
    background-color 0.2s ease,
    border-color 0.2s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
```

### Anti-Patterns to Avoid
- **Color-only feedback:** Don't rely on color alone to indicate valid/invalid drops. Use shape + color (checkmarks vs X marks) for color blind accessibility per WCAG 1.4.1.
- **Small touch targets:** Don't make interactive elements smaller than 44x44px. This violates WCAG 2.5.5 and creates "rage taps" on mobile.
- **Ignoring styled-components maintenance mode:** Don't invest heavily in styled-components for new major features. It's viable for this phase but consider CSS Modules or Tailwind for future phases.
- **Separate @types/styled-components:** In v6, types are bundled. Don't install @types package (causes conflicts).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Circular progress animation | Custom requestAnimationFrame loop | CSS transition on stroke-dashoffset | Browsers optimize CSS transitions, no JS overhead |
| Touch target hit testing | Manual coordinate calculations | CSS min-width/min-height on container | Browser handles tap target expansion natively |
| Color-blind indicators | Color variations alone | Icons (check/X) + color | WCAG 1.4.1 requires non-color cues |
| Theme switching | Context consumers manually | styled-components ThemeProvider | Already set up, automatic prop injection |

**Key insight:** Modern CSS features and styled-components abstractions handle most edge cases. Custom solutions introduce maintenance burden and miss browser optimizations.

## Common Pitfalls

### Pitfall 1: Touch Target Hit Testing
**What goes wrong:** Components render at correct size but tap targets are still too small
**Why it happens:** CSS transforms or positioning affect hit testing areas unexpectedly
**How to avoid:** Explicit min-width/min-height of 44px on interactive containers, test on real mobile devices
**Warning signs:** Users report "taps don't register" or "accidentally tapped wrong item"

### Pitfall 2: Circular Progress Animation Jumping
**What goes wrong:** Progress bar jumps to new value instead of animating smoothly
**Why it happens:** Missing transition property on stroke-dashoffset or recalculation on every render
**How to avoid:** Add CSS transition, memoize dashoffset calculation, use React refs for DOM updates
**Warning signs:** Visual "snapping" instead of smooth fill

### Pitfall 3: Theme Not Propagating
**What goes wrong:** styled-component doesn't receive theme colors
**Why it happens:** Component rendered outside ThemeProvider wrapper or missing TypeScript type augmentation
**How to avoid:** Ensure ThemeProvider wraps entire app, verify styled-components.d.ts augmentation exists
**Warning signs:** "Cannot read property 'colors' of undefined" or props.theme is undefined

### Pitfall 4: Accessibility Labels Not Exposed
**What goes wrong:** Screen readers announce generic "button" or "div" instead of meaningful labels
**Why it happens:** Missing aria-label, aria-valuenow, or semantic HTML elements
**How to avoid:** Add ARIA attributes to all interactive components, test with screen reader
**Warning signs:** Voice Control users can't interact with UI elements

### Pitfall 5: Styled Components v6 Type Errors
**What goes wrong:** TypeScript errors about theme type not existing
**Why it happens:** styled-components v6 bundles types but existing styled-components.d.ts may reference v5 patterns
**How to avoid:** Remove @types/styled-components if installed, verify styled-components.d.ts uses DefaultTheme from styled-components
**Warning signs:** "Module not found" or type incompatibility after npm install

## Code Examples

Verified patterns from official sources:

### Touch Target Compliance (44x44px)
```typescript
// Source: WCAG 2.5.5 Target Size + 2025 accessibility guides
const TouchTarget = styled.button`
  min-height: 44px;
  min-width: 44px;
  padding: ${(props) => props.theme.spacing.sm};
  /* Visual styling can be smaller, but hit area must be 44px minimum */
`;
```

### Color Blind Accessibility (Shape + Color)
```typescript
// Source: WCAG 1.4.1 Use of Color + 2025 state guidelines
const FeedbackIcon = styled.span<{ $valid: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;

  ${(props) =>
    props.$valid
      ? `
        background: #4ade80;
        content: '✓'; /* Check mark shape */
        color: white;
      `
      : `
        background: #ef4444;
        content: '✕'; /* X mark shape */
        color: white;
      `}
`;
```

### Circular Gauge with ARIA
```typescript
// Source: MDN ARIA progressbar role + LogRocket SVG patterns
<ProgressSvg
  $size={size}
  viewBox={`0 0 ${size} ${size}`}
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin="0"
  aria-valuemax="100"
>
```

### Reduced Motion Support
```typescript
// Source: CSS Accessibility Guide 2025 + prefers-reduced-motion docs
const animated = css`
  @media (prefers-reduced-motion: no-preference) {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const StaticGlow = styled.div<{ $active: boolean }>`
  box-shadow: ${(props) =>
    props.$active ? `0 0 20px ${props.theme.colors.accent.primary}` : 'none'};
  ${(props) => (props.$active ? animated : '')};
`;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Class name toggling for drag state | styled-components prop-driven styling | 2020-2021 | More type-safe, co-located styles |
| CSS keyframes for animation | CSS transitions on state change | 2019-2020 | Simpler code, browser-optimized |
| Separate touch/click handlers | Unified pointer events | 2022-2023 | Consistent across mouse/touch/pen |
| @types/styled-components package | Bundled types in v6 | 2024 | Simpler setup, no conflicts |

**Deprecated/outdated:**
- **styled-components v5 patterns:** Installing separate @types package is unnecessary in v6
- **Class-based state management:** Co-locating styles with components via styled-components is preferred
- **prefers-reduced-motion: no-preference only:** Modern guidance says provide milder animations for reduce, not complete removal (2025 updates)

## Open Questions

1. **Circular Gauge Vintage Styling Details**
   - What we know: Needs vintage aesthetic with warm colors
   - What's unclear: Specific stroke width, tick marks, needle design details
   - Recommendation: Start with simple clean gauge, iterate visual styling in implementation

2. **Success Indicator Icon Style**
   - What we know: Needs check mark or "correct" indicator
   - What's unclear: Should be icon overlay, text label, or both
   - Recommendation: Use icon (✓) + subtle color shift for redundancy

3. **HUD Element Priority Visual Hierarchy**
   - What we know: All four elements equally weighted
   - What's unclear: Should any element become prominent during gameplay (timer on low time?)
   - Recommendation: Start equal, test with users for priority needs

4. **Shelf Slot "Realistic" Appearance**
   - What we know: Empty = wood/metal, filled = vinyl visible
   - What's unclear: Texture details, lighting integration with Three.js shelf
   - Recommendation: Match visual style to existing Three.js shelf materials (wood grain, shadows)

## Sources

### Primary (HIGH confidence)
- [styled-components Documentation](https://styled-components.com/docs) - Core API, advanced usage, theming, TypeScript patterns
- [WCAG 2.5.5 Target Size (W3C)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) - 44x44px touch target requirement
- [WCAG 1.4.1 Use of Color (W3C)](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html) - Color blind accessibility, redundant cues required
- [MDN ARIA progressbar role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/progressbar_role) - ARIA attributes for progress indicators
- [Existing codebase](/Users/martha2022/Documents/Claude code/Sleevo Vinyl Shop Manager/src/) - Project structure, theme setup, type definitions

### Secondary (MEDIUM confidence)
- [LogRocket: SVG Circular Progress Component](https://blog.logrocket.com/build-svg-circular-progress-component-react-hooks/) - stroke-dasharray/offset technique (July 2022)
- [CSS-Tricks: Building a Progress Ring](https://css-tricks.com/building-progress-ring-quickly/) - SVG animation patterns
- [Accessibility Animation: Designing Motion for Inclusion](https://educationalvoice.co.uk/accessibility-animation/) - prefers-reduced-motion best practices (August 2025)
- [The New Accessibility Standards Every Designer Must Know in 2025](https://robertcelt95.medium.com/the-new-accessibility-standards-every-designer-must-know-in-2025-815a297d2c6d) - Updated WCAG guidance (September 2025)
- [Making UI Accessible: How WCAG Shapes Good Design in 2025](https://umeshabalasooriya.medium.com/making-ui-accessible-how-wcag-shapes-good-design-in-2025-05859ba50744) - Touch targets and clear labels (September 2025)
- [WebAIM Animation and Carousels](https://webaim.org/techniques/carousels/) - prefers-reduced-motion implementation (November 2025)

### Tertiary (LOW confidence)
- [Build a Kanban Board With Drag-and-Drop in React](https://marmelab.com/blog/2026/01/15/building-a-kanban-board-with-shadcn.html) - Drag state visual feedback (January 2026) - *Not verified for specifics*
- [RIP Styled-Components. Now What?](https://fadamakis.com/rip-styled-components-now-what-a8717df86e86) - Maintenance mode announcement (April 2025) - *Requires verification for migration impact*

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - styled-components in maintenance mode (April 2025) but viable; React patterns verified from official docs
- Architecture: HIGH - Project structure follows React best practices; existing codebase confirms patterns
- Pitfalls: MEDIUM - Accessibility standards verified from W3C/WCAG 2025 docs; some component-specific patterns from older tutorials (2022) need validation during implementation

**Research date:** 2026-02-11
**Valid until:** 2026-03-13 (30 days - React ecosystem stable, but styled-components maintenance warrants shorter window)
