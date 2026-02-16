import styles from './LevelComplete.module.css';

interface Props {
  score: number;
  moves: number;
  onNext: () => void;
  onRestart: () => void;
}

export function LevelComplete({ score, moves, onNext, onRestart }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.title}>LEVEL COMPLETE!</div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>SCORE</span>
            <span className={styles.statValue}>{score.toLocaleString()}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>MOVES</span>
            <span className={styles.statValue}>{moves}</span>
          </div>
        </div>
        <div className={styles.buttons}>
          <button className={styles.btn} onClick={onRestart}>REPLAY</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onNext}>NEXT LEVEL</button>
        </div>
      </div>
    </div>
  );
}
