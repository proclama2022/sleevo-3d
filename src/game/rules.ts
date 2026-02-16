// 4 columns x 2 rows grid
// Each slot has a target vinyl ID
export const SLOT_TARGETS: Record<string, string> = {
  '0-0': 'v1', // Row 0, Col 0 = Rock
  '0-1': 'v2', // Row 0, Col 1 = Jazz
  '0-2': 'v3', // Row 0, Col 2 = Pop
  '0-3': 'v4', // Row 0, Col 3 = Hip-Hop
  '1-0': 'v6', // Row 1, Col 0 = Rock
  '1-1': 'v7', // Row 1, Col 1 = Jazz
  '1-2': 'v8', // Row 1, Col 2 = Pop
  '1-3': 'v5', // Row 1, Col 3 = Classica
};

export const COLUMN_GENRES = ['Rock', 'Jazz', 'Pop', 'Hip-Hop'] as const;

export function getSlotKey(row: number, col: number): string {
  return `${row}-${col}`;
}

export function getTargetSlot(vinylId: string): { row: number; col: number } | null {
  for (const [key, id] of Object.entries(SLOT_TARGETS)) {
    if (id === vinylId) {
      const [r, c] = key.split('-').map(Number);
      return { row: r, col: c };
    }
  }
  return null;
}

export function isValidPlacement(vinylId: string, row: number, col: number): boolean {
  const key = getSlotKey(row, col);
  return SLOT_TARGETS[key] === vinylId;
}

export const COMBO_TIERS = [
  { minStreak: 0, multiplier: 1.0, label: '' },
  { minStreak: 2, multiplier: 1.5, label: 'NICE!' },
  { minStreak: 4, multiplier: 2.0, label: 'GREAT!' },
  { minStreak: 6, multiplier: 3.0, label: 'AMAZING!' },
  { minStreak: 8, multiplier: 5.0, label: 'LEGENDARY!' },
] as const;

export const COMBO_DECAY_MS = 4000;
