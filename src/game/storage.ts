import type { Level } from './types';

const PROGRESS_KEY = 'sleevo_progress';

export interface LevelProgress {
  stars: number;
  bestTime?: number;
}

export function saveProgress(levelId: string, stars: number, timeSeconds?: number): void {
  try {
    const data = loadAllProgress();
    const existing = data[levelId];
    const improved = !existing || stars > existing.stars ||
      (stars === existing.stars && timeSeconds !== undefined &&
       (existing.bestTime === undefined || timeSeconds < existing.bestTime));

    if (improved) {
      data[levelId] = {
        stars,
        bestTime: timeSeconds,
      };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
    }
  } catch {
    // localStorage might be unavailable
  }
}

export function loadAllProgress(): Record<string, LevelProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getLevelProgress(levelId: string): LevelProgress | null {
  const data = loadAllProgress();
  return data[levelId] ?? null;
}

export function isLevelUnlocked(levelIndex: number, levels: Level[]): boolean {
  if (levelIndex === 0) return true;
  const prevLevel = levels[levelIndex - 1];
  if (!prevLevel) return false;
  const progress = getLevelProgress(prevLevel.id);
  return progress !== null && progress.stars >= 2; // FIX-01: was >= 1; FIX-02: uses .id not index arithmetic
}
