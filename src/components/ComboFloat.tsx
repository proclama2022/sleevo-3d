import styles from './ComboFloat.module.css';

interface Props {
  label: string;
  multiplier: string;
}

export function ComboFloat({ label, multiplier }: Props) {
  if (!label) return null;

  return (
    <div className={styles.combo}>
      <span className={styles.label}>{label}</span>
      <span className={styles.multiplier}>{multiplier}</span>
    </div>
  );
}
