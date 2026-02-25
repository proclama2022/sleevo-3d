import styles from './CustomerPanel.module.css';

interface Props {
  customerName?: string;  // Italian name for customer mode display, e.g. "Marco"
  genre: string;
  era: string;
  served: boolean;
  timeLeft?: number;   // seconds remaining (0 = no timer)
  left?: boolean;      // customer gave up and left
}

const ERA_LABELS: Record<string, string> = {
  '30s': 'anni \'30',
  '40s': 'anni \'40',
  '50s': 'anni \'50',
  '60s': 'anni \'60',
  '70s': 'anni \'70',
  '80s': 'anni \'80',
  '90s': 'anni \'90',
  '00s': 'anni 2000',
  '10s': 'anni \'10',
  '20s': 'anni \'20',
};

export function CustomerPanel({ customerName, genre, era, served, timeLeft, left }: Props) {
  const eraLabel = ERA_LABELS[era] ?? era;
  const urgent = timeLeft != null && timeLeft > 0 && timeLeft <= 10;

  const panelCls = [
    styles.panel,
    served ? styles.served : '',
    left ? styles.left : '',
    urgent ? styles.urgent : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={panelCls}>
      <span className={styles.avatar}>{left ? '😤' : served ? '😊' : '🧑'}</span>
      <div className={styles.bubble}>
        {left ? (
          <span className={styles.speech}>Troppo lento! Me ne vado... −200 punti</span>
        ) : served ? (
          <span className={styles.speech}>Grazie mille, ottimo servizio!</span>
        ) : (
          <>
            <span className={styles.speech}>
              "{customerName ?? 'Il cliente'} vuole: <strong>{genre}</strong> degli {eraLabel}"
            </span>
            <span className={styles.tag}>→ mettilo in cima a sinistra</span>
          </>
        )}
      </div>
      {served && <span className={styles.checkmark}>✅</span>}
      {!served && !left && timeLeft != null && timeLeft > 0 && (
        <span className={`${styles.timer}${urgent ? ` ${styles.timerUrgent}` : ''}`}>
          {timeLeft}s
        </span>
      )}
    </div>
  );
}
