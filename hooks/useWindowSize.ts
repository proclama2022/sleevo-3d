import { useState, useEffect } from 'react';
import { MOBILE_BREAKPOINT, RESIZE_DEBOUNCE_DELAY } from '../constants/gameConfig';

/**
 * Debounce utility function to limit function calls
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Custom hook to track window size and mobile state
 * Provides reactive window dimensions that update on resize
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < MOBILE_BREAKPOINT
  });

  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < MOBILE_BREAKPOINT
      });
    }, RESIZE_DEBOUNCE_DELAY);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};
