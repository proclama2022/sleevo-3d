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

/** Mappa decadi → intervallo di anni */
const ERA_MAP: Record<string, [number, number]> = {
  '30s': [1930, 1939],
  '40s': [1940, 1949],
  '50s': [1950, 1959],
  '60s': [1960, 1969],
  '70s': [1970, 1979],
  '80s': [1980, 1989],
  '90s': [1990, 1999],
  '00s': [2000, 2009],
  '10s': [2010, 2019],
  '20s': [2020, 2029],
};

/** Controlla se un vinile soddisfa la richiesta del cliente */
export function matchesCustomerRequest(
  vinyl: { genre: string; year: number },
  request: { genre: string; era: string }
): boolean {
  const genreMatch = vinyl.genre === request.genre;
  const [from, to] = ERA_MAP[request.era] ?? [0, 9999];
  return genreMatch && vinyl.year >= from && vinyl.year <= to;
}

export interface PlacementResult {
  valid: boolean;
  reason?: string;
}

export function isValidPlacement(
  vinylId: string,
  row: number,
  col: number,
  allVinyls: Array<{ id: string; genre: string; year: number; color: string }>,
  placedVinyls: Array<{ vinylId: string; row: number; col: number }>,
  sortRule: string,
  mode?: string,
  customerRequest?: { genre: string; era: string; targetRow: number; targetCol: number },
  blockedSlots?: Array<{ row: number; col: number }>
): PlacementResult {
  // Blocked slots — can't place anything here
  if (blockedSlots?.some(s => s.row === row && s.col === col)) {
    return { valid: false, reason: 'Slot non disponibile' };
  }

  // Customer mode: solo lo slot target ha un vincolo (deve matchare la richiesta)
  if (mode === 'customer' && customerRequest) {
    const isTargetSlot = row === customerRequest.targetRow && col === customerRequest.targetCol;
    if (isTargetSlot) {
      const vinyl = allVinyls.find(v => v.id === vinylId);
      if (!vinyl) return { valid: false, reason: 'Slot non disponibile' };
      if (!matchesCustomerRequest(vinyl, customerRequest)) {
        return { valid: false, reason: 'Non è il disco che cerca il cliente' };
      }
    }
    return { valid: true };
  }

  // Sleeve-match mode: la validazione specifica è gestita in engine.ts
  if (mode === 'sleeve-match') {
    return { valid: true };
  }

  if (sortRule === 'free') return { valid: true };

  const vinyl = allVinyls.find(v => v.id === vinylId);
  if (!vinyl) return { valid: true };

  if (sortRule === 'genre') {
    // Same column must contain only same genre
    const sameColVinyls = placedVinyls.filter(p => p.col === col && p.vinylId !== vinylId);
    if (sameColVinyls.length === 0) return { valid: true };
    const allSameGenre = sameColVinyls.every(p => {
      const v = allVinyls.find(x => x.id === p.vinylId);
      return v?.genre === vinyl.genre;
    });
    if (!allSameGenre) {
      return { valid: false, reason: 'Stesso genere nella stessa colonna' };
    }
    return { valid: true };
  }

  if (sortRule === 'chronological') {
    // Left columns must have older or same-year vinyls
    const leftVinyls = placedVinyls.filter(p => p.col < col);
    const rightVinyls = placedVinyls.filter(p => p.col > col);
    const leftOk = leftVinyls.every(p => {
      const v = allVinyls.find(x => x.id === p.vinylId);
      return !v || v.year <= vinyl.year;
    });
    const rightOk = rightVinyls.every(p => {
      const v = allVinyls.find(x => x.id === p.vinylId);
      return !v || v.year >= vinyl.year;
    });
    // Distingui direzione: leftOk=false → disco troppo VECCHIO qui (va più a sinistra)
    //                       rightOk=false → disco troppo NUOVO qui (va più a destra)
    if (!leftOk) return { valid: false, reason: 'Troppo nuovo — mettilo più a destra →' };
    if (!rightOk) return { valid: false, reason: 'Troppo vecchio — mettilo più a sinistra ←' };
    return { valid: true };
  }

  return { valid: true };
}

export const COMBO_TIERS = [
  { minStreak: 0, multiplier: 1.0, label: '' },
  { minStreak: 4, multiplier: 1.5, label: 'NICE!' },
  { minStreak: 6, multiplier: 2.0, label: 'GREAT!' },
  { minStreak: 8, multiplier: 3.0, label: 'AMAZING!' },
  { minStreak: 10, multiplier: 5.0, label: 'LEGENDARY!' },
] as const;

export const COMBO_DECAY_MS = 4000;
