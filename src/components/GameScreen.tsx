import { useReducer, useCallback, useRef, useState, useEffect } from 'react';
import { TitleBadge } from './TitleBadge';
import { HUD } from './HUD/HUD';
import { Shelf } from './Shelf';
import { Counter } from './Counter';
import { InstructionPill } from './InstructionPill';
import { Controls } from './Controls';
import { ComboFloat } from './ComboFloat';
import { ComboPopup } from './ComboPopup/ComboPopup';
import { ScorePopup } from './ScorePopup/ScorePopup';
import { LevelComplete } from './LevelComplete';
import { ParticleBurst } from './ParticleBurst';
import { saveProgress } from '../game/storage';
import { LEVELS } from '../game/levels';
import { isValidPlacement, COMBO_TIERS, COMBO_DECAY_MS } from '../game/rules';
import { createGameState, gameReducer, getNextGlowingSlot } from '../game/engine';
import styles from './GameScreen.module.css';
import { Tutorial, shouldShowTutorial } from './Tutorial';
import { CustomerPanel } from './CustomerPanel';
import { ProgressBar } from './ProgressBar';
import { SceneBackdrop } from './SceneBackdrop';
import { LevelHintOverlay } from './LevelHintOverlay';

// Dust particles (static, computed once) - ridotto per performance
const particles = Array.from({ length: 6 }, (_, i) => ({
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

interface CachedDropTarget extends DropTargetInfo {
  rect: DOMRect;
  centerX: number;
  centerY: number;
  magneticRadius: number;
}

interface HoverCandidate {
  slot: { row: number; col: number } | null;
  element: HTMLElement | null;
  magnetic: boolean;
}

interface Props {
  initialLevelIndex: number;
  onReturnToSelect: () => void;
}

export function GameScreen({ initialLevelIndex, onReturnToSelect }: Props) {
  const [state, dispatch] = useReducer(gameReducer, null, () =>
    createGameState(LEVELS[initialLevelIndex], initialLevelIndex)
  );

  const [tutorialStep, setTutorialStep] = useState<number>(() => {
    // Only show tutorial on level 1 (index 0) for first-time users
    return (state.levelIndex === 0 && shouldShowTutorial()) ? 1 : 0;
  });

  // Drag state — SOLO dragStart/dragEnd triggerano re-render.
  // Durante il drag: ghost e highlight sono aggiornati via DOM diretto.
  const [drag, setDrag] = useState<DragState | null>(null);
  const dropTargets = useRef<Map<string, DropTargetInfo>>(new Map());
  const ghostRef = useRef<HTMLDivElement>(null);
  // Cache dei rect degli slot — calcolata una volta al dragStart, riutilizzata per tutto il drag
  const cachedRects = useRef<CachedDropTarget[]>([]);
  // Ref per l'ultimo slot sotto il dito e il suo elemento DOM
  const hoverSlotRef = useRef<{ row: number; col: number } | null>(null);
  const hoverElementRef = useRef<HTMLElement | null>(null);
  const hoverMagneticRef = useRef(false);
  const dropCommitTimerRef = useRef<number | null>(null);
  const isCommittingDropRef = useRef(false);

  // Elapsed time counter (seconds) — tracked locally, resets on restart/next level
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Pre-level hint overlay — shown at every level load and restart
  const [showHintOverlay, setShowHintOverlay] = useState(true);

  // Combo countdown (Fix 2) — conta i secondi rimanenti prima del decay
  const [comboSecondsLeft, setComboSecondsLeft] = useState<number | null>(null);

  // Track last placed slot position for ComboPopup
  const [lastSlotPosition, setLastSlotPosition] = useState<{ x: number; y: number } | null>(null);

  // Track combo milestone bursts (5x, 8x, 10x)
  const [comboBurst, setComboBurst] = useState<{ x: number; y: number } | null>(null);
  const previousComboRef = useRef(0);

  // Score popup state and refs (COMM-01)
  const [scorePopups, setScorePopups] = useState<Array<{
    id: number;
    points: number;
    label: string;
    x: number;
    y: number;
  }>>([]);
  const popupIdRef = useRef(0);
  const scoreElementRef = useRef<HTMLElement | null>(null);

  // Combo decay timer
  useEffect(() => {
    if (state.combo.streak > 0 && state.status === 'playing') {
      const timer = setTimeout(() => dispatch({ type: 'COMBO_DECAY' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [state.combo.lastPlacementTime, state.combo.streak, state.status]);

  // Fix 1: azzera invalidReason dopo 2s
  useEffect(() => {
    if (state.invalidReason) {
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_INVALID_REASON' }), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.invalidReason]);

  // Trigger combo milestone bursts at 5x, 8x, 10x
  useEffect(() => {
    const prevCombo = previousComboRef.current;
    const currentCombo = state.combo.streak;
    if (currentCombo >= 5 && prevCombo < 5 && lastSlotPosition) {
      setComboBurst(lastSlotPosition);
    } else if (currentCombo >= 8 && prevCombo < 8 && lastSlotPosition) {
      setComboBurst(lastSlotPosition);
    } else if (currentCombo >= 10 && prevCombo < 10 && lastSlotPosition) {
      setComboBurst(lastSlotPosition);
    }
    previousComboRef.current = currentCombo;
  }, [state.combo.streak, lastSlotPosition]);

  useEffect(() => {
    return () => {
      if (dropCommitTimerRef.current !== null) {
        window.clearTimeout(dropCommitTimerRef.current);
      }
    };
  }, []);

  // Fix 2: countdown visivo del combo — conta da 4 a 0 ogni secondo
  useEffect(() => {
    if (state.combo.streak > 0 && state.status === 'playing') {
      setComboSecondsLeft(4);
      const interval = setInterval(() => {
        setComboSecondsLeft(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        clearInterval(interval);
        setComboSecondsLeft(null);
      };
    } else {
      setComboSecondsLeft(null);
    }
  }, [state.combo.lastPlacementTime, state.combo.streak, state.status]);

  // Elapsed time — tick every second while playing, stop when complete
  useEffect(() => {
    if (state.status === 'playing') {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state.status]);

  // Save progress to localStorage when level is completed
  useEffect(() => {
    if (state.status === 'completed') {
      saveProgress(state.level.id, state.stars, timeElapsed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.stars]);

  // Reset hint overlay on level change (NEXT_LEVEL dispatches a new level.id)
  useEffect(() => {
    setShowHintOverlay(true);
  }, [state.level.id]);

  // Blackout mode: nascondi le etichette dopo 3 secondi dall'inizio
  useEffect(() => {
    if (state.level.mode === 'blackout' && state.status === 'playing' && state.labelsVisible) {
      const timer = setTimeout(() => {
        dispatch({ type: 'BLACKOUT_TRIGGER' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  // Solo al cambio di livello (level.id) o riavvio
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.level.id, state.status]);

  // Customer timer: tick every second when customer has a timer
  useEffect(() => {
    if (
      state.level.mode === 'customer' &&
      state.level.customerTimer &&
      state.level.customerTimer > 0 &&
      state.status === 'playing' &&
      !state.customerServed &&
      !state.customerLeft &&
      state.customerTimeLeft > 0
    ) {
      const timer = setInterval(() => dispatch({ type: 'CUSTOMER_TICK' }), 1000);
      return () => clearInterval(timer);
    }
  }, [state.level.mode, state.level.customerTimer, state.status, state.customerServed, state.customerLeft, state.customerTimeLeft]);

  // Rush mode: countdown timer
  useEffect(() => {
    if (
      state.level.mode === 'rush' &&
      state.status === 'playing' &&
      state.rushTimeLeft > 0
    ) {
      const timer = setInterval(() => dispatch({ type: 'RUSH_TICK' }), 1000);
      return () => clearInterval(timer);
    }
  }, [state.level.mode, state.status, state.rushTimeLeft]);

  // Register/unregister drop targets
  const registerSlot = useCallback((key: string, row: number, col: number, el: HTMLElement) => {
    dropTargets.current.set(key, { row, col, element: el });
  }, []);
  const unregisterSlot = useCallback((key: string) => {
    dropTargets.current.delete(key);
  }, []);

  // ── Drag handlers ──

  const clearDropUiState = useCallback(() => {
    if (hoverElementRef.current) {
      hoverElementRef.current.removeAttribute('data-hover');
      hoverElementRef.current.removeAttribute('data-hover-magnetic');
      hoverElementRef.current.removeAttribute('data-drop-lock');
    }
    for (const cached of cachedRects.current) {
      cached.element.removeAttribute('data-col-hover');
      cached.element.removeAttribute('data-drop-lock');
    }
  }, []);

  const resetDragState = useCallback(() => {
    setDrag(null);
    hoverSlotRef.current = null;
    hoverElementRef.current = null;
    hoverMagneticRef.current = false;
    cachedRects.current = [];
    isCommittingDropRef.current = false;
    if (dropCommitTimerRef.current !== null) {
      window.clearTimeout(dropCommitTimerRef.current);
      dropCommitTimerRef.current = null;
    }
  }, []);

  const buildDropTargetCache = useCallback(() => {
    const rects: CachedDropTarget[] = [];
    for (const [, target] of dropTargets.current) {
      const rect = target.element.getBoundingClientRect();
      rects.push({
        row: target.row,
        col: target.col,
        element: target.element,
        rect,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        magneticRadius: Math.max(26, Math.min(rect.width, rect.height) * 0.72),
      });
    }
    cachedRects.current = rects;
  }, []);

  const findHoverCandidate = useCallback((x: number, y: number): HoverCandidate => {
    let directMatch: CachedDropTarget | null = null;
    let magneticMatch: CachedDropTarget | null = null;
    let bestMagneticDistance = Number.POSITIVE_INFINITY;

    for (const cached of cachedRects.current) {
      const r = cached.rect;
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        directMatch = cached;
        break;
      }

      const dx = x - cached.centerX;
      const dy = y - cached.centerY;
      const distanceSq = dx * dx + dy * dy;
      const radiusSq = cached.magneticRadius * cached.magneticRadius;
      if (distanceSq <= radiusSq && distanceSq < bestMagneticDistance) {
        magneticMatch = cached;
        bestMagneticDistance = distanceSq;
      }
    }

    const target = directMatch ?? magneticMatch;
    return {
      slot: target ? { row: target.row, col: target.col } : null,
      element: target?.element ?? null,
      magnetic: !directMatch && magneticMatch !== null,
    };
  }, []);

  const handleDragStart = useCallback((vinylId: string, color: string, x: number, y: number) => {
    // Cache tutti i rect degli slot UNA VOLTA — zero reflow durante il drag
    buildDropTargetCache();
    hoverSlotRef.current = null;
    hoverElementRef.current = null;
    hoverMagneticRef.current = false;
    setDrag({ vinylId, color, x, y });
  }, [buildDropTargetCache]);

  // Drag dallo scaffale — rimuove il vinile dalla griglia (REMOVE_VINYL) poi avvia il drag
  const handleDragFromShelf = useCallback((vinylId: string, color: string, x: number, y: number) => {
    dispatch({ type: 'REMOVE_VINYL', vinylId });
    // rAF: aspetta che React aggiorni il DOM prima di cachare i rect
    requestAnimationFrame(() => {
      buildDropTargetCache();
      hoverSlotRef.current = null;
      hoverElementRef.current = null;
      hoverMagneticRef.current = false;
      setDrag({ vinylId, color, x, y });
    });
  }, [buildDropTargetCache]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag || isCommittingDropRef.current) return;

      // ── Ghost segue il dito 1:1 — aggiornamento DOM diretto ──
      const ghost = ghostRef.current;
      if (ghost) {
        ghost.style.left = `${e.clientX - 44}px`;
        ghost.style.top = `${e.clientY - 44}px`;
      }

      // Hit-test + magnetismo: se sei vicino allo slot, lo agganciamo per facilitare il drop
      const candidate = findHoverCandidate(e.clientX, e.clientY);
      const foundSlot = candidate.slot;
      const foundElement = candidate.element;

      // ── Solo se lo slot cambia: aggiorna highlight via DOM (zero setState) ──
      const prev = hoverSlotRef.current;
      const prevMagnetic = hoverMagneticRef.current;
      if (
        prev?.row !== foundSlot?.row ||
        prev?.col !== foundSlot?.col ||
        prevMagnetic !== candidate.magnetic
      ) {
        // Rimuovi highlight dal precedente
        if (hoverElementRef.current) {
          hoverElementRef.current.removeAttribute('data-hover');
          hoverElementRef.current.removeAttribute('data-hover-magnetic');
        }

        // Glow colonna: rimuovi da tutti, applica alla colonna attiva
        if (prev?.col !== foundSlot?.col) {
          for (const cached of cachedRects.current) {
            cached.element.removeAttribute('data-col-hover');
          }
          if (foundSlot) {
            for (const cached of cachedRects.current) {
              if (cached.col === foundSlot.col) {
                cached.element.setAttribute('data-col-hover', 'true');
              }
            }
          }
        }

        hoverSlotRef.current = foundSlot;
        hoverElementRef.current = foundElement;
        hoverMagneticRef.current = candidate.magnetic;

        if (foundSlot && foundElement && ghost) {
          // Valida placement
          const placementResult = isValidPlacement(
            drag.vinylId, foundSlot.row, foundSlot.col,
            state.level.vinyls,
            Object.entries(state.placedVinyls).map(([id, pos]) => ({ vinylId: id, row: pos.row, col: pos.col })),
            state.level.sortRule ?? 'free',
            state.level.mode,
            state.level.customerRequest,
            state.level.blockedSlots
          );
          const valid = placementResult.valid && state.grid[foundSlot.row][foundSlot.col].vinylId === null;

          // Highlight slot via data-attribute (CSS si occupa del rendering)
          foundElement.setAttribute('data-hover', valid ? 'valid' : 'invalid');
          if (valid && candidate.magnetic) {
            foundElement.setAttribute('data-hover-magnetic', 'true');
          } else {
            foundElement.removeAttribute('data-hover-magnetic');
          }

          // Ghost: scala + ombra
          ghost.style.transform = valid && candidate.magnetic
            ? 'scale(0.82) translateY(-2px)'
            : 'scale(0.88)';
          ghost.style.boxShadow = valid
            ? '0 8px 24px rgba(0,0,0,0.5), 0 0 18px 4px rgba(80,220,120,0.5), 0 0 0 2.5px rgba(80,220,120,0.65)'
            : '0 8px 24px rgba(0,0,0,0.5), 0 0 18px 4px rgba(220,60,60,0.45), 0 0 0 2.5px rgba(220,60,60,0.6)';
        } else if (ghost) {
          ghost.style.transform = 'scale(1.08)';
          ghost.style.boxShadow = `0 16px 40px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.5), 0 0 24px 6px color-mix(in srgb, ${drag.color} 40%, transparent)`;
        }
      }
    },
    [drag, findHoverCandidate, state.grid, state.level]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!drag || isCommittingDropRef.current) return;

    // Rimuovi highlight dallo slot attivo e glow colonna
    clearDropUiState();

    const fallbackCandidate = findHoverCandidate(e.clientX, e.clientY);
    const currentSlot = hoverSlotRef.current ?? fallbackCandidate.slot;
    const currentElement = hoverElementRef.current ?? fallbackCandidate.element;
    if (currentSlot) {
      if (state.grid[currentSlot.row][currentSlot.col].vinylId === null) {
        // Calculate combo and show score popup (COMM-01)
        const timeSinceLast = Date.now() - state.combo.lastPlacementTime;
        const comboReset = state.combo.lastPlacementTime > 0 && timeSinceLast > COMBO_DECAY_MS;
        const newStreak = comboReset ? 1 : state.combo.streak + 1;
        const tier = [...COMBO_TIERS].reverse().find(t => newStreak >= t.minStreak) ?? COMBO_TIERS[0];
        const earned = Math.round(100 * tier.multiplier);
        const popupX = scoreElementRef.current?.getBoundingClientRect().x ?? 56;
        const popupY = scoreElementRef.current?.getBoundingClientRect().y ?? 52;
        setScorePopups(prev => [...prev, {
          id: popupIdRef.current++,
          points: earned,
          label: tier.label,
          x: popupX,
          y: popupY,
        }]);

        // Capture slot position before dispatching
        // Capture slot position before dispatching
        const slotElement = currentElement;
        const ghost = ghostRef.current;
        if (slotElement && ghost) {
          const rect = slotElement.getBoundingClientRect();
          setLastSlotPosition({ x: rect.left + rect.width / 2, y: rect.top });

          // Lock-in animation: il ghost scivola dentro la cella prima del commit.
          const targetLeft = rect.left + rect.width / 2 - 44;
          const targetTop = rect.top + rect.height * 0.6 - 44;
          slotElement.setAttribute('data-drop-lock', 'true');
          isCommittingDropRef.current = true;
          ghost.style.transition =
            'left 150ms cubic-bezier(0.22, 1, 0.36, 1), top 150ms cubic-bezier(0.22, 1, 0.36, 1), transform 150ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease-out';
          ghost.style.left = `${targetLeft}px`;
          ghost.style.top = `${targetTop}px`;
          ghost.style.transform = 'scale(0.66) translateY(7px)';
          ghost.style.opacity = '0.84';

          dropCommitTimerRef.current = window.setTimeout(() => {
            slotElement.removeAttribute('data-drop-lock');
            dispatch({ type: 'PLACE_VINYL', vinylId: drag.vinylId, row: currentSlot.row, col: currentSlot.col });
            if (navigator.vibrate) navigator.vibrate(50);
            resetDragState();
          }, 150);
          return;
        }

        dispatch({ type: 'PLACE_VINYL', vinylId: drag.vinylId, row: currentSlot.row, col: currentSlot.col });
        if (navigator.vibrate) navigator.vibrate(50);
      } else {
        dispatch({ type: 'INVALID_DROP' });
        if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
      }
    } else {
      // Fix 3: drop fuori dallo scaffale — il disco torna nel counter con uno shake visivo (no penalità)
      dispatch({ type: 'MISSED_DROP', vinylId: drag.vinylId });
    }

    resetDragState();
  }, [clearDropUiState, drag, findHoverCandidate, resetDragState, state.grid, state.combo, scoreElementRef]);

  // Computed values
  const level = state.level;
  const progress = state.level.vinyls.length > 0
    ? Math.round((Object.keys(state.placedVinyls).length / state.level.vinyls.length) * 100)
    : 0;
  const hudTimeRemaining = state.level.mode === 'rush' ? state.rushTimeLeft : undefined;
  const vinylMap = new Map(level.vinyls.map((v) => [v.id, v]));
  const columnName = (col: number) => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][col] ?? `${col + 1}`;

  // Build placed vinyls array for shelf
  const placedVinyls = Object.entries(state.placedVinyls).map(([id, pos]) => ({
    id,
    color: vinylMap.get(id)?.color ?? '#888',
    genre: vinylMap.get(id)?.genre,
    year: vinylMap.get(id)?.year,
    artist: vinylMap.get(id)?.artist,
    album: vinylMap.get(id)?.album,
    isRare: vinylMap.get(id)?.isRare,
    cover: vinylMap.get(id)?.cover,
    row: pos.row,
    col: pos.col,
  }));

  // Build unplaced vinyls array for counter
  const unplacedVinyls = state.unplacedVinylIds
    .filter((id) => !drag || drag.vinylId !== id) // hide the one being dragged
    .map((id) => ({
      id,
      color: vinylMap.get(id)?.color ?? '#888',
      genre: vinylMap.get(id)?.genre ?? '',
      year: vinylMap.get(id)?.year ?? 0,
      cover: vinylMap.get(id)?.cover,
      artist: vinylMap.get(id)?.artist,
      album: vinylMap.get(id)?.album,
    }));

  // Tutorial handlers
  const handleTutorialNext = () => {
    setTutorialStep(prev => {
      const next = prev + 1;
      if (next > 3) return 0;
      return next;
    });
  };

  const handleTutorialSkip = () => {
    setTutorialStep(0);
  };

  // Handlers
  const handleRestart = useCallback(() => {
    setTimeElapsed(0);
    setShowHintOverlay(true);  // show hint on restart — same level.id so useEffect won't fire
    dispatch({ type: 'RESTART' });
  }, []);
  const handleNext = useCallback(() => {
    setTimeElapsed(0);
    const nextIdx = state.levelIndex + 1;
    if (nextIdx < LEVELS.length) {
      dispatch({ type: 'NEXT_LEVEL', level: LEVELS[nextIdx], levelIndex: nextIdx });
    } else {
      // Loop back to level 1
      dispatch({ type: 'NEXT_LEVEL', level: LEVELS[0], levelIndex: 0 });
    }
  }, [state.levelIndex]);

  const handleJumpToLevel = useCallback((index: number) => {
    setTimeElapsed(0);
    dispatch({ type: 'NEXT_LEVEL', level: LEVELS[index], levelIndex: index });
  }, []);

  return (
    <div className={styles.viewport}>
      <div
        className={`${styles.screen} ${drag ? styles.dragging : ''}`}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* HUD — fixed top bar with score, progress gauge, and moves */}
        <HUD
          score={state.score}
          moves={state.moves}
          progress={progress}
          timeRemaining={hudTimeRemaining}
          placed={Object.keys(state.placedVinyls).length}
          total={state.level.vinyls.length}
          sortRule={state.level.sortRule}
          levelMode={state.level.mode}
        />

        {/* Pre-level hint overlay — shown at every level start and restart, dismissed by player */}
        {showHintOverlay && state.status === 'playing' && (
          <LevelHintOverlay
            hint={state.level.hint ?? ''}
            mode={state.level.mode}
            onDismiss={() => setShowHintOverlay(false)}
          />
        )}

        {/* Themed scene backdrop — AI photo + atmosphere */}
        <SceneBackdrop theme={level.theme} />

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

        {/* Combo float */}
        {state.combo.label && (
          <ComboFloat
            key={state.combo.lastPlacementTime}
            label={state.combo.label}
            multiplier={`x${state.combo.multiplier}`}
            timeLeft={comboSecondsLeft}
          />
        )}

        {/* Combo popup - appears after 4+ streak, positioned near placed slot */}
        {state.combo.streak >= 4 && lastSlotPosition && (
          <ComboPopup
            key={state.combo.lastPlacementTime}
            pointsBonus={Math.round(100 * (state.combo.multiplier - 1))}
            position={lastSlotPosition}
            onComplete={() => setLastSlotPosition(null)}
          />
        )}

        {/* Score popups - appear near HUD score on every correct drop (COMM-01) */}
        {scorePopups.map(p => (
          <ScorePopup
            key={p.id}
            points={p.points}
            label={p.label}
            x={p.x}
            y={p.y}
            onComplete={() => setScorePopups(prev => prev.filter(sp => sp.id !== p.id))}
          />
        ))}

        {/* Combo milestone burst - larger burst at 5x, 8x, 10x */}
        {comboBurst && (
          <ParticleBurst
            x={comboBurst.x}
            y={comboBurst.y}
            count={15}
            distance={{ min: 60, max: 100 }}
            color="#fbbf24"
            onComplete={() => setComboBurst(null)}
          />
        )}

        {/* Customer request panel (solo in customer mode) */}
        {level.mode === 'customer' && level.customerRequest && (
          <CustomerPanel
            genre={level.customerRequest.genre}
            era={level.customerRequest.era}
            served={state.customerServed}
            timeLeft={level.customerTimer ? state.customerTimeLeft : undefined}
            left={state.customerLeft}
          />
        )}

        {/* Shelf */}
        <Shelf
          rows={level.rows}
          cols={level.cols}
          placedVinyls={placedVinyls}
          rejectedSlot={state.rejectedSlot}
          glowingSlot={state.hintsRemaining < 3 ? getNextGlowingSlot(state) : null}
          labelsVisible={state.labelsVisible}
          sortRule={level.sortRule}
          blockedSlots={level.blockedSlots}
          sleeveHints={
            level.mode === 'sleeve-match' && level.sleeveTargets
              ? level.sleeveTargets
                  .filter(t => !state.placedVinyls[t.vinylId]) // mostra solo se non ancora piazzato
                  .map(t => {
                    const v = vinylMap.get(t.vinylId);
                    return {
                      row: t.row,
                      col: t.col,
                      color: v?.color ?? '#888',
                      genre: v?.genre,
                      artist: v?.artist,
                      album: v?.album,
                    };
                  })
              : undefined
          }
          vinylYears={level.sortRule === 'chronological'
            ? level.vinyls.map(v => v.year).filter((y): y is number => y != null)
            : undefined
          }
          onRegisterSlot={registerSlot}
          onUnregisterSlot={unregisterSlot}
          onDragFromShelf={state.status === 'playing' ? handleDragFromShelf : undefined}
        />
        <div className={styles.shelfStage} />

        {/* Instruction */}
        <InstructionPill
          errorText={state.invalidReason ?? undefined}
          text={(() => {
            const n = state.unplacedVinylIds.length;
            if (state.status === 'completed') return '✨ Completato!';
            if (n === level.vinyls.length) return level.hint ?? 'Trascina i vinili sullo scaffale!';
            // Durante il drag in modalità cronologica: mostra l'anno del disco trascinato
            if (drag && level.sortRule === 'chronological') {
              const draggedVinyl = level.vinyls.find(v => v.id === drag.vinylId);
              if (draggedVinyl?.year) {
                return `${draggedVinyl.year} — scegli la colonna giusta!`;
              }
            }
            // Durante il drag in modalità genre: indica chiaramente le colonne valide
            if (drag && level.sortRule === 'genre') {
              const draggedVinyl = level.vinyls.find(v => v.id === drag.vinylId);
              const draggedGenre = draggedVinyl?.genre;
              if (draggedGenre) {
                const colGenres: Array<string | null> = Array.from({ length: level.cols }, () => null);
                for (const [id, pos] of Object.entries(state.placedVinyls)) {
                  if (!colGenres[pos.col]) {
                    colGenres[pos.col] = vinylMap.get(id)?.genre ?? null;
                  }
                }

                const genreCols: number[] = [];
                const emptyCols: number[] = [];
                for (let c = 0; c < level.cols; c += 1) {
                  const g = colGenres[c];
                  if (!g) {
                    emptyCols.push(c);
                  } else if (g === draggedGenre) {
                    genreCols.push(c);
                  }
                }

                const formatCols = (arr: number[]) => arr.map(columnName).join('/');
                if (genreCols.length > 0 && emptyCols.length > 0) {
                  return `${draggedGenre.toUpperCase()} → colonna ${formatCols(genreCols)} (o vuota: ${formatCols(emptyCols)})`;
                }
                if (genreCols.length > 0) {
                  return `${draggedGenre.toUpperCase()} → colonna ${formatCols(genreCols)}`;
                }
                if (emptyCols.length > 0) {
                  return `${draggedGenre.toUpperCase()} → scegli una colonna vuota: ${formatCols(emptyCols)}`;
                }
              }
            }
            const rushRule = level.sortRule === 'genre'
              ? 'raggruppa per genere'
              : level.sortRule === 'chronological'
                ? 'colonna = anno'
                : 'posiziona';
            const blackoutRule = level.sortRule === 'genre'
              ? 'raggruppa per genere a memoria!'
              : 'ordina per anno a memoria!';
            if (level.mode === 'customer') {
              return state.customerServed
                ? `${n} rimasti — posiziona gli altri dove vuoi`
                : `${n} rimasti — trova il disco del cliente!`;
            }
            if (level.mode === 'blackout') {
              return !state.labelsVisible
                ? `${n} rimasti — ${blackoutRule}`
                : `${n} rimasti — memorizza!`;
            }
            if (level.mode === 'rush') {
              return `${n} rimasti — ${state.rushTimeLeft}s! ${rushRule}`;
            }
            if (level.mode === 'sleeve-match') {
              return `${n} rimasti — abbina il disco alla copertina!`;
            }
            if (level.sortRule === 'genre') return `${n} rimasti — stessa colonna = stesso genere`;
            if (level.sortRule === 'chronological') return `${n} rimasti — colonna = anno, riga libera`;
            return `${n} rimasti`;
          })()}
        />

        {/* Progress bar */}
        <ProgressBar total={state.level.vinyls.length} placed={Object.keys(state.placedVinyls).length} />

        <Counter
          vinyls={unplacedVinyls}
          shakingVinylId={state.shakingVinylId}
          highlightAll={tutorialStep === 1}
          onDragStart={handleDragStart}
          onShakeEnd={() => dispatch({ type: 'CLEAR_SHAKE' })}
        />

        {/* Buttons */}
        <Controls
          onRestart={handleRestart}
          onNext={handleNext}
          showNext={state.status === 'completed'}
          currentLevelIndex={state.levelIndex}
          onJumpToLevel={handleJumpToLevel}
        />

        {/* Drag ghost — ottimizzato per 60fps */}
        {drag && (() => {
          const dragVinyl = vinylMap.get(drag.vinylId);
          return (
            <div
              ref={ghostRef}
              style={{
                position: 'fixed',
                left: drag.x - 44,
                top: drag.y - 44,
                width: 88,
                height: 88,
                borderRadius: '50%',
                background: `radial-gradient(circle,
                  color-mix(in srgb, ${drag.color} 80%, #ffd5ab) 0%,
                  color-mix(in srgb, ${drag.color} 60%, #1a1220) 18%,
                  color-mix(in srgb, ${drag.color} 35%, #0f0f13) 32%,
                  #0e0d14 44%,
                  color-mix(in srgb, ${drag.color} 28%, #101018) 60%,
                  #0c0b12 72%,
                  color-mix(in srgb, ${drag.color} 22%, #101018) 84%,
                  #0e0d14 100%
                )`,
                boxShadow: `0 16px 40px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.5), 0 0 24px 6px color-mix(in srgb, ${drag.color} 40%, transparent)`,
                zIndex: 1000,
                pointerEvents: 'none',
                transform: 'scale(1.08) translateZ(0)',
                transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
                willChange: 'transform, left, top',
                contain: 'layout style paint',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {/* Grooves - semplificato */}
              <div style={{
                position: 'absolute',
                inset: '6%',
                borderRadius: '50%',
                boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.04), inset 0 0 0 7px rgba(255,255,255,0.02)',
                pointerEvents: 'none',
              }} />
              {/* Label */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '50%',
                height: '50%',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: `radial-gradient(circle, color-mix(in srgb, ${drag.color} 90%, white) 0%, color-mix(in srgb, ${drag.color} 70%, #1a0f05) 100%)`,
                border: '1px solid rgba(255,255,255,0.25)',
                boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.3), inset 0 -2px 5px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}>
                <span style={{ color: '#fff', fontSize: 8, fontWeight: 700, fontFamily: 'system-ui', textTransform: 'uppercase', letterSpacing: '0.04em', textShadow: '0 1px 3px rgba(0,0,0,0.9)', whiteSpace: 'nowrap' }}>
                  {dragVinyl?.genre ?? ''}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 7, fontFamily: 'system-ui', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                  {dragVinyl?.year ?? ''}
                </span>
              </div>
              {/* Hole */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '7%',
                height: '7%',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #050505 0%, #131217 100%)',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.95)',
                zIndex: 2,
              }} />
            </div>
          );
        })()}

        {/* Level complete overlay */}
        {state.status === 'completed' && (
          <LevelComplete
            levelNumber={state.levelIndex + 1}
            stars={state.stars ?? 1}
            mistakes={state.mistakes ?? 0}
            hintsUsed={state.hintsUsed ?? 0}
            timeElapsed={timeElapsed}
            score={state.score}
            parTime={state.level.parTime}
            hasNextLevel={state.levelIndex + 1 < LEVELS.length}
            onNextLevel={onReturnToSelect}
            onReplay={handleRestart}
          />
        )}

        <Tutorial
          step={tutorialStep}
          onNext={handleTutorialNext}
          onSkip={handleTutorialSkip}
        />
      </div>
    </div>
  );
}
