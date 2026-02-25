import styles from './LevelHintOverlay.module.css';
import type { LevelMode } from '../game/types';

interface Props {
  hint: string;
  mode: LevelMode;
  onDismiss: () => void;
}

export function LevelHintOverlay({ hint, mode, onDismiss }: Props) {
  return (
    <div className={styles.overlay} onClick={onDismiss}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modeLabel}>{getModeLabel(mode)}</div>
        <div className={styles.hint}>{hint}</div>
        <button className={styles.startButton} onClick={onDismiss}>
          Inizia
        </button>
      </div>
    </div>
  );
}

function getModeLabel(mode: LevelMode): string {
  switch (mode) {
    case 'free':          return '🎵 Modalità Libera';
    case 'genre':         return '🎸 Ordina per Genere';
    case 'chronological': return '📅 Ordina per Anno';
    case 'customer':      return '👤 Cliente';
    case 'blackout':      return '🌑 Modalità Blackout';
    case 'rush':          return '⏱ Modalità Rush';
    case 'sleeve-match':  return '🎨 Abbina Copertina';
    default:              return '';
  }
}
