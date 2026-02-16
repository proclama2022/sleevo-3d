import { VinylDisc } from './VinylDisc';
import styles from './Counter.module.css';

interface CounterVinyl {
  id: string;
  color: string;
}

interface Props {
  vinyls: CounterVinyl[];
  onDragStart?: (vinylId: string, color: string, x: number, y: number) => void;
}

export function Counter({ vinyls, onDragStart }: Props) {
  const discSize = vinyls.length > 6 ? 56 : 72;

  return (
    <div className={styles.counter}>
      <div className={styles.base} />
      <div className={styles.surface}>
        <div className={styles.glassShine} />
        <div className={styles.vinyls}>
          {vinyls.map((v) => (
            <div key={v.id} className={styles.vinylSpot}>
              <div className={styles.shadow} />
              <VinylDisc
                vinylId={v.id}
                color={v.color}
                size={discSize}
                draggable
                onDragStart={onDragStart}
              />
            </div>
          ))}
        </div>
        <div className={styles.hand} />
      </div>
    </div>
  );
}
