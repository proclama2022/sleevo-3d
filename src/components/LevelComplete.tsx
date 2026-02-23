import { useMemo } from 'react';
import styles from './LevelComplete.module.css';

interface Props {
  levelNumber: number;
  stars: number;
  mistakes: number;
  hintsUsed: number;
  timeElapsed: number;
  score?: number;      // final score from GameState
  parTime?: number;    // par time from level for comparison
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatTimeWithPar(seconds: number, par?: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const formatted = m === 0 ? `${s}s` : `${m}:${String(s).padStart(2, '0')}`;

  if (par !== undefined) {
    const parM = Math.floor(par / 60);
    const parS = par % 60;
    const parFormatted = parM === 0 ? `${parS}s` : `${parM}:${String(parS).padStart(2, '0')}`;
    return `${formatted} / ${parFormatted} par`;
  }
  return formatted;
}

const CONFETTI_COLORS = ['#f5b852', '#f06060', '#50c8a8', '#6090f0', '#f080c0'];

export function LevelComplete({
  levelNumber,
  stars,
  mistakes,
  hintsUsed,
  timeElapsed,
  score,
  parTime,
  hasNextLevel,
  onNextLevel,
  onReplay,
}: Props) {
  const messages = ['Ottimo lavoro!', 'Perfetto!', 'Incredibile! ✨'];
  const titleMsg = stars === 3 ? messages[2] : stars === 2 ? messages[1] : messages[0];

  const confetti = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.8}s`,
      duration: `${2 + Math.random() * 2}s`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 8,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    }));
  }, []);

  return (
    <div className={styles.overlay}>
      <div className={styles.confetti}>
        {confetti.map(c => (
          <div
            key={c.id}
            className={styles.confettiPiece}
            style={{
              left: c.left,
              animationDelay: c.delay,
              animationDuration: c.duration,
              backgroundColor: c.color,
              width: c.size,
              height: c.size,
              borderRadius: c.borderRadius,
            }}
          />
        ))}
      </div>
      <div className={styles.card}>
        <div className={styles.title}>{titleMsg}</div>
        <div className={styles.subtitle}>Livello {levelNumber} completato</div>

        <div className={styles.stars}>
          {[1, 2, 3].map(n => (
            <span
              key={n}
              className={`${styles.star} ${n <= stars ? styles.starEarned : ''}`}
            >
              ★
            </span>
          ))}
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{score ?? 0}</span>
            <span className={styles.statLabel}>Punti</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatTimeWithPar(timeElapsed, parTime)}</span>
            <span className={styles.statLabel}>Tempo</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{mistakes}</span>
            <span className={styles.statLabel}>Errori</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{hintsUsed}</span>
            <span className={styles.statLabel}>Sugger.</span>
          </div>
        </div>

        <div className={styles.buttons}>
          {hasNextLevel ? (
            <button className={styles.btnPrimary} onClick={onNextLevel}>
              Livello successivo →
            </button>
          ) : (
            <div className={styles.noNextLevel}>Hai completato tutti i livelli! 🎉</div>
          )}
          <button className={styles.btnSecondary} onClick={onReplay}>
            ↺ Rigioca
          </button>
        </div>
      </div>
    </div>
  );
}
