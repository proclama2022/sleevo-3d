import { useReducer, useCallback, useRef, useState, useEffect } from 'react';
import { TitleBadge } from './TitleBadge';
import { InfoPanel } from './InfoPanel';
import { Shelf } from './Shelf';
import { Counter } from './Counter';
import { InstructionPill } from './InstructionPill';
import { Controls } from './Controls';
import { ComboFloat } from './ComboFloat';
import { LevelComplete } from './LevelComplete';
import { LEVELS } from '../game/levels';
import { isValidPlacement } from '../game/rules';
import { createGameState, gameReducer, getNextGlowingSlot } from '../game/engine';
import styles from './GameScreen.module.css';

// Dust particles (static, computed once)
const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${5 + Math.random() * 90}%`,
  size: 1.5 + Math.random() * 1.5,
  duration: `${8 + Math.random() * 12}s`,
  delay: `${-Math.random() * 15}s`,
  opacity: 0.2 + Math.random() * 0.4,
}));

interface DragState {
  vinylId: string;
  color: string;
  x: number;
  y: number;
}

interface DropTargetInfo {
  row: number;
  col: number;
  element: HTMLElement;
}

export function GameScreen() {
  const [state, dispatch] = useReducer(gameReducer, null, () =>
    createGameState(LEVELS[0], 0)
  );

  // Drag state
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hoverSlot, setHoverSlot] = useState<{ row: number; col: number } | null>(null);
  const dropTargets = useRef<Map<string, DropTargetInfo>>(new Map());

  // Combo decay timer
  useEffect(() => {
    if (state.combo.streak > 0 && state.status === 'playing') {
      const timer = setTimeout(() => dispatch({ type: 'COMBO_DECAY' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [state.combo.lastPlacementTime, state.combo.streak, state.status]);

  // Register/unregister drop targets
  const registerSlot = useCallback((key: string, row: number, col: number, el: HTMLElement) => {
    dropTargets.current.set(key, { row, col, element: el });
  }, []);
  const unregisterSlot = useCallback((key: string) => {
    dropTargets.current.delete(key);
  }, []);

  // Drag handlers
  const handleDragStart = useCallback((vinylId: string, color: string, x: number, y: number) => {
    setDrag({ vinylId, color, x, y });
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return;
      setDrag((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));

      // Hit-test drop targets
      let found: { row: number; col: number } | null = null;
      for (const [, target] of dropTargets.current) {
        const rect = target.element.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          found = { row: target.row, col: target.col };
          break;
        }
      }
      setHoverSlot(found);
    },
    [drag]
  );

  const handlePointerUp = useCallback(() => {
    if (!drag) return;
    if (hoverSlot) {
      const valid = isValidPlacement(drag.vinylId, hoverSlot.row, hoverSlot.col);
      if (valid && state.grid[hoverSlot.row][hoverSlot.col].vinylId === null) {
        dispatch({ type: 'PLACE_VINYL', vinylId: drag.vinylId, row: hoverSlot.row, col: hoverSlot.col });
      } else {
        dispatch({ type: 'INVALID_DROP' });
      }
    }
    setDrag(null);
    setHoverSlot(null);
  }, [drag, hoverSlot, state.grid]);

  // Computed values
  const glowingSlot = getNextGlowingSlot(state);
  const level = state.level;
  const vinylMap = new Map(level.vinyls.map((v) => [v.id, v]));

  // Build placed vinyls array for shelf
  const placedVinyls = Object.entries(state.placedVinyls).map(([id, pos]) => ({
    id,
    color: vinylMap.get(id)?.color ?? '#888',
    row: pos.row,
    col: pos.col,
  }));

  // Build unplaced vinyls array for counter
  const unplacedVinyls = state.unplacedVinylIds
    .filter((id) => !drag || drag.vinylId !== id) // hide the one being dragged
    .map((id) => ({
      id,
      color: vinylMap.get(id)?.color ?? '#888',
    }));

  // Hover valid/invalid
  const hoverValid =
    drag && hoverSlot
      ? isValidPlacement(drag.vinylId, hoverSlot.row, hoverSlot.col) &&
        state.grid[hoverSlot.row][hoverSlot.col].vinylId === null
      : undefined;

  // Handlers
  const handleRestart = useCallback(() => dispatch({ type: 'RESTART' }), []);
  const handleNext = useCallback(() => {
    const nextIdx = state.levelIndex + 1;
    if (nextIdx < LEVELS.length) {
      dispatch({ type: 'NEXT_LEVEL', level: LEVELS[nextIdx], levelIndex: nextIdx });
    } else {
      // Loop back to level 1
      dispatch({ type: 'NEXT_LEVEL', level: LEVELS[0], levelIndex: 0 });
    }
  }, [state.levelIndex]);

  return (
    <div className={styles.viewport}>
      <div
        className={styles.screen}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Stylized record-shop backdrop */}
        <div className={styles.shopBackdrop} aria-hidden="true">
          <div className={styles.lampLeft} />
          <div className={styles.lampRight} />
          <div className={styles.lightConeLeft} />
          <div className={styles.lightConeRight} />
          <div className={styles.backShelfTop} />
          <div className={styles.backShelfMid} />
          <div className={styles.backShelfBottom} />
          <div className={`${styles.backCrate} ${styles.backCrateA}`} />
          <div className={`${styles.backCrate} ${styles.backCrateB}`} />
          <div className={`${styles.backCrate} ${styles.backCrateC}`} />
          <div className={`${styles.backCrate} ${styles.backCrateD}`} />
          <div className={styles.backSpeaker} />
          <div className={styles.backPoster} />
          <div className={`${styles.bokeh} ${styles.bokehA}`} />
          <div className={`${styles.bokeh} ${styles.bokehB}`} />
          <div className={`${styles.bokeh} ${styles.bokehC}`} />
          <div className={`${styles.bokeh} ${styles.bokehD}`} />
        </div>

        {/* Background atmosphere */}
        <div className={styles.bgGlow} />
        <div className={styles.bgShelfLeft} />
        <div className={styles.bgShelfRight} />
        <div className={styles.sceneFog} />

        {/* Floating dust particles */}
        <div className={styles.particles}>
          {particles.map((p) => (
            <div
              key={p.id}
              className={styles.particle}
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                animationDuration: p.duration,
                animationDelay: p.delay,
                opacity: p.opacity,
              }}
            />
          ))}
        </div>

        {/* Title */}
        <TitleBadge />

        {/* Info panels row */}
        <div className={styles.infoRow}>
          <InfoPanel
            rows={[
              { label: 'LEVEL', value: `${state.levelIndex + 1}` },
              { label: 'SORT BY:', value: 'COLOR' },
              { label: 'ALLOW GAPS:', value: 'FALSE' },
            ]}
          />
          <InfoPanel
            rows={[
              { label: 'MOVES:', value: `${state.moves}` },
              { label: 'SCORE:', value: state.score.toLocaleString() },
            ]}
            align="right"
          />
        </div>

        {/* Combo float */}
        {state.combo.label && (
          <ComboFloat
            key={state.combo.lastPlacementTime}
            label={state.combo.label}
            multiplier={`x${state.combo.multiplier}`}
          />
        )}

        {/* Shelf */}
        <Shelf
          rows={level.rows}
          cols={level.cols}
          placedVinyls={placedVinyls}
          glowingSlot={glowingSlot}
          hoverTarget={drag ? hoverSlot : null}
          hoverValid={hoverValid}
          onRegisterSlot={registerSlot}
          onUnregisterSlot={unregisterSlot}
        />
        <div className={styles.shelfStage} />

        {/* Instruction */}
        <InstructionPill
          text={
            state.status === 'completed'
              ? 'Well done!'
              : state.unplacedVinylIds.length === level.vinyls.length
                ? 'Drag the records to the shelf!'
                : `${state.unplacedVinylIds.length} records left`
          }
        />

        {/* Counter with unplaced vinyls */}
        <Counter vinyls={unplacedVinyls} onDragStart={handleDragStart} />

        {/* Buttons */}
        <Controls
          onRestart={handleRestart}
          onNext={handleNext}
          showNext={state.status === 'completed'}
        />

        {/* Drag ghost */}
        {drag && (
          <div
            style={{
              position: 'fixed',
              left: drag.x - 34,
              top: drag.y - 34,
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: `radial-gradient(circle, color-mix(in srgb, ${drag.color} 16%, #251f1f) 0%, color-mix(in srgb, ${drag.color} 24%, #111216) 32%, #0f0f13 36%, color-mix(in srgb, ${drag.color} 20%, #101015) 58%, #121117 100%)`,
              boxShadow: '0 16px 40px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.5)',
              zIndex: 1000,
              pointerEvents: 'none',
              transform: 'scale(1.15)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '38%',
                height: '38%',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                backgroundColor: drag.color,
                boxShadow: '0 0 8px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.2)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '7%',
                height: '7%',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #050505 0%, #111 100%)',
                zIndex: 2,
              }}
            />
          </div>
        )}

        {/* Level complete overlay */}
        {state.status === 'completed' && (
          <LevelComplete
            score={state.score}
            moves={state.moves}
            onNext={handleNext}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
