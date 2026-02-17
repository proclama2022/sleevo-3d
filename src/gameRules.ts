// 8 columns for 8 vinyls (including duplicates)
// Order matches the vinyls array in main.ts level1
export const COLUMN_GENRE_LABELS = [
  'ROCK',      // v1 - 1975
  'JAZZ',      // v2 - 1959
  'POP',       // v3 - 1989
  'HIP-HOP',   // v4 - 1992
  'CLASSICA',  // v5 - 1791
  'ROCK',      // v6 - 1969
  'JAZZ',      // v7 - 1965
  'POP',       // v8 - 2001
] as const;

// Mapping each vinyl ID to its target column
const VINYL_ID_TO_COLUMN: Record<string, number> = {
  'v1': 0,  // Rock 1975
  'v2': 1,  // Jazz 1959
  'v3': 2,  // Pop 1989
  'v4': 3,  // Hip-Hop 1992
  'v5': 4,  // Classica 1791
  'v6': 5,  // Rock 1969
  'v7': 6,  // Jazz 1965
  'v8': 7,  // Pop 2001
};

export function getColumnForVinylId(vinylId: string): number | null {
  const col = VINYL_ID_TO_COLUMN[vinylId];
  return typeof col === 'number' ? col : null;
}

// One color per genre: same as vinyl colors in level so "same color = same column"
// Increased saturation for better visual impact and accessibility
const GENRE_TO_COLOR: Record<string, number> = {
  rock: 0xff1744,      // Vivid red - more saturated
  jazz: 0x2979ff,      // Electric blue - brighter, more saturated
  pop: 0xff4081,       // Hot pink - higher saturation
  'hip-hop': 0xff6d00, // Vibrant orange - punchier
  hiphop: 0xff6d00,
  classica: 0x9c27b0,  // Rich purple - deeper, more saturated
};

export function getColorForGenre(genre: string): number {
  if (!genre) return 0x8b7355; // fallback warm brown
  const normalized = genre.trim().toLowerCase().replace(/\s+/g, '-');
  return GENRE_TO_COLOR[normalized] ?? 0x8b7355;
}

// Legacy function for backwards compatibility
const NORMALIZED_GENRE_TO_COLUMN: Record<string, number> = {
  rock: 0,
  jazz: 1,
  pop: 2,
  'hip-hop': 3,
  hiphop: 3,
  classica: 4,
};

export function getColumnForGenre(genre?: string): number | null {
  if (!genre) return null;
  const normalized = genre.trim().toLowerCase();
  const col = NORMALIZED_GENRE_TO_COLUMN[normalized];
  return typeof col === 'number' ? col : null;
}

export function getColumnLabel(col: number): string {
  return COLUMN_GENRE_LABELS[col] ?? `COLONNA ${col + 1}`;
}
