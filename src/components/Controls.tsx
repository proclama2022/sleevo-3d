import styles from './Controls.module.css';

interface Props {
  onRestart?: () => void;
  onNext?: () => void;
  showNext?: boolean;
}

export function Controls({ onRestart, onNext, showNext = false }: Props) {
  return (
    <div className={styles.controls}>
      <button className={styles.btn} onClick={onRestart}>
        RESTART
      </button>
      <button className={styles.btn} onClick={onNext} disabled={!showNext}>
        NEXT
      </button>
    </div>
  );
}
