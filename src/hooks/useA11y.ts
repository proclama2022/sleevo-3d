import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  prefersReducedMotion, 
  prefersHighContrast,
  LiveAnnouncer,
  getAnnouncer,
  trapFocus,
} from '../utils/a11y';
import { FPSMonitor, isLowEndDevice, getAdaptiveQuality } from '../utils/performance';

/**
 * Hook for reduced motion preference
 */
export const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reducedMotion;
};

/**
 * Hook for high contrast preference
 */
export const useHighContrast = (): boolean => {
  const [highContrast, setHighContrast] = useState(prefersHighContrast);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return highContrast;
};

/**
 * Hook for screen reader announcements
 */
export const useAnnouncer = () => {
  const announcerRef = useRef<LiveAnnouncer | null>(null);

  useEffect(() => {
    announcerRef.current = getAnnouncer();
    return () => {
      // Don't destroy global announcer
    };
  }, []);

  const announce = useCallback((message: string, priority?: 'polite' | 'assertive') => {
    announcerRef.current?.announce(message, priority);
  }, []);

  return { announce };
};

/**
 * Hook for focus trap
 */
export const useFocusTrap = <T extends HTMLElement>(active: boolean) => {
  const ref = useRef<T>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (active && ref.current) {
      cleanupRef.current = trapFocus(ref.current);
    } else {
      cleanupRef.current?.();
      cleanupRef.current = null;
    }

    return () => {
      cleanupRef.current?.();
    };
  }, [active]);

  return ref;
};

/**
 * Hook for FPS monitoring
 */
export const useFPSMonitor = (active = true) => {
  const [fps, setFps] = useState(0);
  const [stats, setStats] = useState({ min: 0, max: 0, avg: 0, current: 0 });
  const monitorRef = useRef<FPSMonitor | null>(null);

  useEffect(() => {
    if (active) {
      monitorRef.current = new FPSMonitor();
      monitorRef.current.start();

      const interval = setInterval(() => {
        if (monitorRef.current) {
          setFps(monitorRef.current.getFPS());
          setStats(monitorRef.current.getStats());
        }
      }, 1000);

      return () => {
        clearInterval(interval);
        monitorRef.current?.stop();
      };
    }
  }, [active]);

  return { fps, stats, isGood: fps >= 55 };
};

/**
 * Hook for low-end device detection
 */
export const useLowEndDevice = () => {
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [quality, setQuality] = useState(getAdaptiveQuality());

  useEffect(() => {
    setIsLowEnd(isLowEndDevice());
    setQuality(getAdaptiveQuality());
  }, []);

  return { isLowEnd, quality };
};

/**
 * Hook for keyboard navigation
 */
export const useKeyboardNavigation = (
  items: string[],
  onSelect: (id: string) => void,
  active = true
) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    if (!active) {
      setFocusedIndex(-1);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
        case ' ':
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            e.preventDefault();
            onSelect(items[focusedIndex]);
          }
          break;
        case 'Escape':
          setFocusedIndex(-1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, items, focusedIndex, onSelect]);

  return { focusedIndex, setFocusedIndex };
};

/**
 * Hook for viewport size
 */
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isCompact = viewport.width < 640;
  const isMedium = viewport.width >= 640 && viewport.width < 1024;
  const isLarge = viewport.width >= 1024;

  return { ...viewport, isCompact, isMedium, isLarge };
};

/**
 * Hook for breakpoint detection
 */
export const useBreakpoint = () => {
  const { isCompact, isMedium, isLarge } = useViewport();
  
  return {
    current: isCompact ? 'compact' : isMedium ? 'medium' : 'large',
    isCompact,
    isMedium,
    isLarge,
  };
};
