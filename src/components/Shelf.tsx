import { ShelfSlot } from './ShelfSlot';
import styles from './Shelf.module.css';

interface PlacedVinyl {
  id: string;
  color: string;
  row: number;
  col: number;
}

interface Props {
  rows: number;
  cols: number;
  placedVinyls: PlacedVinyl[];
  glowingSlot?: { row: number; col: number } | null;
  hoverTarget?: { row: number; col: number } | null;
  hoverValid?: boolean;
  onRegisterSlot?: (key: string, row: number, col: number, el: HTMLElement) => void;
  onUnregisterSlot?: (key: string) => void;
}

export function Shelf({
  rows,
  cols,
  placedVinyls,
  glowingSlot,
  hoverTarget,
  hoverValid,
  onRegisterSlot,
  onUnregisterSlot,
}: Props) {
  const getVinyl = (r: number, c: number) =>
    placedVinyls.find((v) => v.row === r && v.col === c) ?? null;

  const isGlowing = (r: number, c: number) =>
    glowingSlot?.row === r && glowingSlot?.col === c;

  const isHoverValid = (r: number, c: number) =>
    hoverTarget?.row === r && hoverTarget?.col === c && hoverValid === true;

  const isHoverInvalid = (r: number, c: number) =>
    hoverTarget?.row === r && hoverTarget?.col === c && hoverValid === false;

  return (
    <div className={styles.shelfWrapper}>
      <div className={styles.topLedge} />

      <div className={styles.shelfBox}>
        <div className={styles.sideLeft} />
        <div className={styles.sideRight} />

        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => (
              <ShelfSlot
                key={`${r}-${c}`}
                row={r}
                col={c}
                vinyl={getVinyl(r, c)}
                isGlowing={isGlowing(r, c)}
                isValidTarget={isHoverValid(r, c)}
                isInvalidTarget={isHoverInvalid(r, c)}
                onRegister={onRegisterSlot}
                onUnregister={onUnregisterSlot}
              />
            ))
          )}
        </div>

        <div className={styles.rowDivider} />
      </div>

      <div className={styles.bottomLedge} />
    </div>
  );
}
