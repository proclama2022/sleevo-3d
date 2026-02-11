/**
 * Performance Monitoring Utilities
 * Phase 5: Accessibility & Final Polish
 */

/**
 * FPS Monitor
 */
export class FPSMonitor {
  private frames: number[] = [];
  private lastFrameTime = 0;
  private isRunning = false;

  /**
   * Start monitoring
   */
  start(): void {
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.tick();
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isRunning = false;
  }

  /**
   * Record frame
   */
  private tick = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Calculate FPS from frame time
    const fps = 1000 / delta;
    this.frames.push(fps);

    // Keep last 60 frames
    if (this.frames.length > 60) {
      this.frames.shift();
    }

    requestAnimationFrame(this.tick);
  };

  /**
   * Get current FPS
   */
  getFPS(): number {
    if (this.frames.length === 0) return 0;
    const sum = this.frames.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.frames.length);
  }

  /**
   * Get min/max/avg FPS
   */
  getStats(): { min: number; max: number; avg: number; current: number } {
    if (this.frames.length === 0) {
      return { min: 0, max: 0, avg: 0, current: 0 };
    }

    const min = Math.min(...this.frames);
    const max = Math.max(...this.frames);
    const avg = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    const current = this.frames[this.frames.length - 1];

    return {
      min: Math.round(min),
      max: Math.round(max),
      avg: Math.round(avg),
      current: Math.round(current),
    };
  }

  /**
   * Check if performance is acceptable (60fps target)
   */
  isPerformanceGood(): boolean {
    return this.getFPS() >= 55;
  }
}

/**
 * Memory Monitor (where available)
 */
export const getMemoryUsage = (): { used: number; total: number } | null => {
  const memory = (performance as any).memory;
  if (!memory) return null;

  return {
    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
  };
};

/**
 * Measure function execution time
 */
export const measureTime = async <T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  return { result, duration };
};

/**
 * Performance marks
 */
export const perfMark = {
  start: (name: string): void => {
    performance.mark(`${name}-start`);
  },

  end: (name: string): number => {
    performance.mark(`${name}-end`);
    try {
      performance.measure(name, `${name}-start`, `${name}-end`);
      const entries = performance.getEntriesByName(name);
      const duration = entries[entries.length - 1]?.duration ?? 0;
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
      return duration;
    } catch {
      return 0;
    }
  },
};

/**
 * Bundle size analyzer (development only)
 */
export const logBundleInfo = (): void => {
  if (typeof window === 'undefined') return;

  const resources = performance.getEntriesByType('resource');
  const scripts = resources.filter(r => r.name.endsWith('.js'));
  const styles = resources.filter(r => r.name.endsWith('.css'));

  console.group('Bundle Info');
  
  console.group('JavaScript');
  scripts.forEach(s => {
    console.log(`${s.name.split('/').pop()}: ${(s as any).transferSize / 1024} KB`);
  });
  console.groupEnd();

  console.group('CSS');
  styles.forEach(s => {
    console.log(`${s.name.split('/').pop()}: ${(s as any).transferSize / 1024} KB`);
  });
  console.groupEnd();

  console.groupEnd();
};

/**
 * Performance observer for long tasks
 */
export const observeLongTasks = (callback: (duration: number) => void): PerformanceObserver | null => {
  if (!('PerformanceObserver' in window)) return null;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        callback(entry.duration);
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
    return observer;
  } catch {
    return null;
  }
};

/**
 * Check if device is low-end
 */
export const isLowEndDevice = (): boolean => {
  // Check hardware concurrency
  const cores = navigator.hardwareConcurrency || 2;
  if (cores <= 2) return true;

  // Check device memory (where available)
  const memory = (navigator as any).deviceMemory;
  if (memory && memory <= 2) return true;

  // Check if mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  return isMobile && cores <= 4;
};

/**
 * Adaptive quality settings based on device
 */
export const getAdaptiveQuality = (): {
  shadows: boolean;
  antialias: boolean;
  pixelRatio: number;
  effects: boolean;
} => {
  const lowEnd = isLowEndDevice();
  
  return {
    shadows: !lowEnd,
    antialias: !lowEnd,
    pixelRatio: lowEnd ? 1 : Math.min(window.devicePixelRatio, 2),
    effects: !lowEnd,
  };
};
