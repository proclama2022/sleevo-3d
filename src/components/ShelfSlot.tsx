import { useEffect, useRef } from 'react';
import { VinylDisc } from './VinylDisc';
import styles from './ShelfSlot.module.css';

interface Props {
  row: number;
  col: number;
  vinyl?: { id: string; color: string } | null;
  isGlowing?: boolean;
  isValidTarget?: boolean;
  isInvalidTarget?: boolean;
  onRegister?: (key: string, row: number, col: number, el: HTMLElement) => void;
  onUnregister?: (key: string) => void;
}

export function ShelfSlot({
  row,
  col,
  vinyl,
  isGlowing = false,
  isValidTarget = false,
  isInvalidTarget = false,
  onRegister,
  onUnregister,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const key = `${row}-${col}`;

  useEffect(() => {
    if (ref.current && onRegister) {
      onRegister(key, row, col, ref.current);
    }
    return () => {
      if (onUnregister) onUnregister(key);
    };
  }, [key, row, col, onRegister, onUnregister]);

  const cls = [
    styles.slot,
    isGlowing && !vinyl ? styles.glowing : '',
    isValidTarget ? styles.validTarget : '',
    isInvalidTarget ? styles.invalidTarget : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={cls}>
      {vinyl ? <VinylDisc color={vinyl.color} size={54} lean /> : null}
    </div>
  );
}
