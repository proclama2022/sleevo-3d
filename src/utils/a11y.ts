/**
 * Accessibility Utilities
 * Phase 5: Accessibility & Final Polish
 */

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user prefers high contrast
 */
export const prefersHighContrast = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: more)').matches;
};

/**
 * Check if screen reader is likely active
 */
export const isScreenReaderActive = (): boolean => {
  if (typeof window === 'undefined') return false;
  // Common indicators of screen reader usage
  return (
    'speechSynthesis' in window ||
    navigator.userAgent.includes('NVDA') ||
    navigator.userAgent.includes('JAWS') ||
    navigator.userAgent.includes('VoiceOver')
  );
};

/**
 * Generate unique ID for accessibility
 */
let idCounter = 0;
export const generateA11yId = (prefix = 'a11y'): string => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

/**
 * ARIA live region announcer
 */
export class LiveAnnouncer {
  private region: HTMLDivElement | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.region = document.createElement('div');
      this.region.setAttribute('role', 'status');
      this.region.setAttribute('aria-live', 'polite');
      this.region.setAttribute('aria-atomic', 'true');
      this.region.className = 'sr-only';
      this.region.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(this.region);
    }
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.region) return;
    
    this.region.setAttribute('aria-live', priority);
    // Clear and re-set to trigger announcement
    this.region.textContent = '';
    setTimeout(() => {
      if (this.region) {
        this.region.textContent = message;
      }
    }, 50);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.region && this.region.parentNode) {
      this.region.parentNode.removeChild(this.region);
      this.region = null;
    }
  }
}

/**
 * Global live announcer instance
 */
let globalAnnouncer: LiveAnnouncer | null = null;

export const getAnnouncer = (): LiveAnnouncer => {
  if (!globalAnnouncer) {
    globalAnnouncer = new LiveAnnouncer();
  }
  return globalAnnouncer;
};

/**
 * Announce message helper
 */
export const announce = (message: string, priority?: 'polite' | 'assertive'): void => {
  getAnnouncer().announce(message, priority);
};

/**
 * Focus management utilities
 */
export const focusFirstFocusable = (container: HTMLElement): boolean => {
  const focusable = container.querySelector<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable) {
    focusable.focus();
    return true;
  }
  return false;
};

export const focusLastFocusable = (container: HTMLElement): boolean => {
  const focusables = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusables.length > 0) {
    focusables[focusables.length - 1].focus();
    return true;
  }
  return false;
};

/**
 * Trap focus within container (for modals, etc.)
 */
export const trapFocus = (container: HTMLElement): (() => void) => {
  const focusables = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusables[0];
  const lastFocusable = focusables[focusables.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  
  // Focus first element
  firstFocusable?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Color contrast utilities
 */
export const getLuminance = (hex: string): number => {
  const rgb = hex.replace('#', '').match(/.{2}/g);
  if (!rgb) return 0;
  
  const [r, g, b] = rgb.map(x => {
    const val = parseInt(x, 16) / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const getContrastRatio = (color1: string, color2: string): number => {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

export const meetsWCAG_AA = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= 4.5;
};

export const meetsWCAG_AA_Large = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= 3;
};
