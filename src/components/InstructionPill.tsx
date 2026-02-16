import styles from './InstructionPill.module.css';

interface Props {
  text: string;
}

export function InstructionPill({ text }: Props) {
  return (
    <div className={styles.pill}>
      {text}
    </div>
  );
}
