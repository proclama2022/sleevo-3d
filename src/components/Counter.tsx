import { VinylCard } from './VinylCard/VinylCard';
import styles from './Counter.module.css';

interface CounterVinyl {
  id: string;
  color: string;
  genre: string;
  year: number;
  cover?: string;
  artist?: string;
  album?: string;
}

interface Props {
  vinyls: CounterVinyl[];
  shakingVinylId?: string | null;
  onDragStart?: (vinylId: string, color: string, x: number, y: number) => void;
  onShakeEnd?: () => void;
}

export function Counter({ vinyls, shakingVinylId, onDragStart, onShakeEnd }: Props) {
  return (
    <div className={styles.counter}>
      <div className={styles.base} />
      <div className={styles.surface}>
        <div className={styles.glassShine} />
        <div className={styles.vinyls}>
          {vinyls.map((v) => (
            <div
              key={v.id}
              className={`${styles.vinylSpot}${shakingVinylId === v.id ? ` ${styles.shaking}` : ''}`}
              onPointerDown={(e) => {
                e.preventDefault();
                onDragStart?.(v.id, v.color, e.clientX, e.clientY);
              }}
              onAnimationEnd={shakingVinylId === v.id ? onShakeEnd : undefined}
              style={{ cursor: 'grab', touchAction: 'none' }}
            >
              <VinylCard
                id={v.id}
                title={v.album ?? v.genre}
                artist={v.artist ?? ''}
                genre={v.genre}
                year={v.year}
                coverImage={v.cover}
                state="idle"
              />
            </div>
          ))}
        </div>
        <div className={styles.hand} />
      </div>
    </div>
  );
}
