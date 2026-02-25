/**
 * Format an integer score for display using Italian thousand-separator notation.
 * Always uses 'it-IT' locale — never the browser default — so that 1420 renders
 * as "1.420 pt" regardless of system language.
 * Returns '—' (em dash) for undefined/null (level never completed).
 */
export function formatScore(score: number | undefined | null): string {
  if (score === undefined || score === null) return '\u2014';
  return new Intl.NumberFormat('it-IT').format(score) + ' pt';
}
