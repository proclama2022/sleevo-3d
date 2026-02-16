import { type CSSProperties, useCallback, useRef } from 'react';
import styles from './VinylDisc.module.css';

interface Props {
  vinylId?: string;
  color: string;
  size?: number;
  lean?: boolean;
  draggable?: boolean;
  onDragStart?: (vinylId: string, color: string, x: number, y: number) => void;
  className?: string;
}

export function VinylDisc({
  vinylId,
  color,
  size = 64,
  lean = false,
  draggable = false,
  onDragStart,
  className = '',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!draggable || !vinylId || !onDragStart) return;
      e.preventDefault();
      e.stopPropagation();
      onDragStart(vinylId, color, e.clientX, e.clientY);
    },
    [draggable, vinylId, color, onDragStart]
  );

  return (
    <div
      ref={ref}
      className={`${styles.disc} ${lean ? styles.lean : ''} ${draggable ? styles.draggable : ''} ${className}`}
      style={{ width: size, height: size, '--disc-color': color } as CSSProperties}
      onPointerDown={handlePointerDown}
    >
      <div className={styles.grooves} />
      <div className={styles.label} style={{ backgroundColor: color }} />
      <div className={styles.hole} />
    </div>
  );
}
