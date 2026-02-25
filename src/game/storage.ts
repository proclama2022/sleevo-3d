import type { Level } from './types';

const PROGRESS_KEY = 'sleevo_progress';

export interface LevelProgress {
  stars: number;
  bestTime?: number;
  bestScore?: number;   // undefined means level was never scored
}

export function saveProgress(
  levelId: string,
  stars: number,
  timeSeconds?: number,
  score?: number
): void {
  try {
    const data = loadAllProgress();
    const existing = data[levelId];
    const starsImproved = !existing || stars > existing.stars;
    const timeImproved = !starsImproved &&
      stars === existing?.stars &&
      timeSeconds !== undefined &&
      (existing.bestTime === undefined || timeSeconds < existing.bestTime);
    const scoreImproved = score !== undefined &&
      (existing?.bestScore === undefined || score > existing.bestScore);

    if (starsImproved || timeImproved || scoreImproved) {
      data[levelId] = {
        ...existing,
        stars: starsImproved ? stars : (existing?.stars ?? stars),
        bestTime: starsImproved || timeImproved ? timeSeconds : existing?.bestTime,
        bestScore: scoreImproved ? score : existing?.bestScore,
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
