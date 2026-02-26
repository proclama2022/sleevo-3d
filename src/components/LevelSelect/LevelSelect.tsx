import { useRef, useEffect } from 'react';
import { loadAllProgress, isLevelUnlocked } from '../../game/storage';
import { LEVELS } from '../../game/levels';
import { formatScore } from '../../utils';
import styles from './LevelSelect.module.css';

interface Props {
  onSelectLevel: (index: number) => void;
  currentFocusIndex: number;
}

interface CellProps {
  levelNumber: number;
  bestStars: number;
  bestScore?: number;        // undefined means never completed
  unlocked: boolean;
  focused: boolean;
  onClick: () => void;
  cellRef?: React.Ref<HTMLButtonElement>;
}

function LevelCell({ levelNumber, bestStars, bestScore, unlocked, focused, onClick, cellRef }: CellProps) {
  return (
    <button
      ref={cellRef}
      className={styles.cell}
      data-unlocked={String(unlocked)}
      data-focused={String(focused)}
      disabled={!unlocked}
      aria-label={`Livello ${levelNumber}${!unlocked ? ', bloccato' : ''}`}
      onClick={onClick}
    >
      <span className={styles.number}>{levelNumber}</span>
      <div className={styles.stars}>
        {[1, 2, 3].map(n => (
          <span
            key={n}
            className={`${styles.star} ${n <= bestStars ? styles.starFilled : styles.starEmpty}`}
          >
            ★
          </span>
        ))}
      </div>
      {unlocked && (
        <span className={styles.score}>{formatScore(bestScore)}</span>
      )}
      {!unlocked && <span className={styles.lock}>🔒</span>}
    </button>
  );
}

export function LevelSelect({ onSelectLevel, currentFocusIndex }: Props) {
  const progress = loadAllProgress();
  const focusedCellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    focusedCellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  return (
    <div className={styles.viewport}>
      <div className={styles.screen}>
        <header className={styles.header}>
          <h1 className={styles.title}>Scegli Livello</h1>
        </header>

        <div className={styles.grid}>
          {LEVELS.map((level, index) => {
            const p = progress[level.id];
            const bestStars = p?.stars ?? 0;
            const bestScore = p?.bestScore;   // undefined if level never completed
            const unlocked = isLevelUnlocked(index, LEVELS);
            const isFocused = index === currentFocusIndex;

            return (
              <LevelCell
                key={level.id}
                levelNumber={index + 1}
                bestStars={bestStars}
                bestScore={bestScore}
                unlocked={unlocked}
                focused={isFocused}
                onClick={() => onSelectLevel(index)}
                cellRef={isFocused ? focusedCellRef : undefined}
              />
            );
          })}
        </div>

        <p className={styles.hint}>
          Guadagna 2 stelle per sbloccare il prossimo livello
        </p>
      </div>
    </div>
  );
}
