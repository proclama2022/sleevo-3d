import styles from './InfoPanel.module.css';

interface InfoRow {
  label: string;
  value: string;
}

interface Props {
  rows: InfoRow[];
  align?: 'left' | 'right';
}

export function InfoPanel({ rows, align = 'left' }: Props) {
  return (
    <div className={`${styles.panel} ${align === 'right' ? styles.right : ''}`}>
      {rows.map((row, i) => (
        <div key={i} className={styles.row}>
          <span className={styles.label}>{row.label}</span>
          <span className={styles.value}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}
