import { useEffect, useRef, useState, type CSSProperties } from 'react';
import styled, { keyframes } from 'styled-components';
import styles from './ShelfSlot.module.css';

export interface ShelfSlotProps {
  row: number;
  col: number;
  vinyl?: { id: string; color: string; genre?: string; year?: number; artist?: string; album?: string; isRare?: boolean; cover?: string } | null;
  isGlowing?: boolean;
  rejected?: boolean;
  glowing?: boolean;
  labelsVisible?: boolean;
  blocked?: boolean;
  // Sleeve-match mode: mostra la copertina target come indizio nello slot vuoto
  sleeveHint?: { color: string; genre?: string; artist?: string; album?: string } | null;
  onRegister?: (key: string, row: number, col: number, el: HTMLElement) => void;
  onUnregister?: (key: string) => void;
  // Drag dallo scaffale — per riposizionare vinili già piazzati
  onDragStart?: (vinylId: string, color: string, x: number, y: number) => void;
}

// Sparkle animation keyframes
const sparkleAnim = keyframes`
  0% { transform: scale(0) rotate(0deg); opacity: 1; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
  100% { transform: scale(0) rotate(360deg); opacity: 0; }
`;

// Individual sparkle point — gold ✦ character with staggered delay
const SparklePoint = styled.span<{ $delay: number }>`
  position: absolute;
  font-size: 12px;
  color: #ffd700;
  text-shadow: 0 0 4px rgba(255, 215, 0, 0.8);
  animation: ${sparkleAnim} 0.6s ease-out forwards;
  animation-delay: ${(props) => props.$delay}ms;
  opacity: 0;
  pointer-events: none;
`;

export function ShelfSlot({
  row,
  col,
  vinyl,
  isGlowing = false,
  rejected = false,
  glowing = false,
  labelsVisible = true,
  blocked = false,
  sleeveHint = null,
  onRegister,
  onUnregister,
  onDragStart,
}: ShelfSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const key = `${row}-${col}`;

  // Track previous vinyl ID to trigger effects only on new placement
  const prevVinylId = useRef<string | undefined>(undefined);

  // Sparkle trigger state
  const [showSparkle, setShowSparkle] = useState(false);
  const prevVinylIdSparkle = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (ref.current && onRegister) {
      onRegister(key, row, col, ref.current);
    }
    return () => {
      if (onUnregister) onUnregister(key);
    };
  }, [key, row, col, onRegister, onUnregister]);

  // Audio Feedback: Play slide sound on vinyl placement
  useEffect(() => {
    if (vinyl && vinyl.id !== prevVinylId.current) {
      // Play realistic wood slide sound
      // Note: Ensure '/sounds/vinyl_slide.mp3' exists in public folder
      const audio = new Audio('/sounds/vinyl_slide.mp3');
      audio.volume = 0.3;
      // Randomize pitch slightly for realism
      audio.playbackRate = 0.9 + Math.random() * 0.2;
      audio.play().catch(() => { /* Ignore auto-play blocking or missing file */ });
    }
    prevVinylId.current = vinyl?.id;
  }, [vinyl]);

  // Sparkle effect: trigger when vinyl transitions from absent to present
  useEffect(() => {
    if (vinyl && vinyl.id !== prevVinylIdSparkle.current) {
      setShowSparkle(true);
      const timer = setTimeout(() => setShowSparkle(false), 900);
      prevVinylIdSparkle.current = vinyl.id;
      return () => clearTimeout(timer);
    }
    if (!vinyl) {
      prevVinylIdSparkle.current = undefined;
    }
  }, [vinyl]);

  const cls = [
    styles.slot,
    isGlowing && !vinyl ? styles.glowing : '',
    rejected ? styles.rejected : '',
    glowing && !vinyl ? styles.glowing : '',
    blocked ? styles.blocked : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Font sizing helpers — album is primary, artist secondary
  const albumLen  = vinyl?.album?.length  ?? 0;
  const artistLen = vinyl?.artist?.length ?? 0;
  const albumFontSize  = albumLen  > 18 ? '5.5px' : albumLen  > 13 ? '6.5px' : '7.5px';
  const artistFontSize = artistLen > 18 ? '5px'   : artistLen > 13 ? '5.5px' : '6px';

  return (
    <div
      ref={ref}
      className={cls}
      style={vinyl ? {
        // Vinyl inserted in slot — subtle depth but not buried
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)',
      } : undefined}
    >
      {blocked && !vinyl && (
        <div className={styles.blockedOverlay}>
          <span className={styles.blockedIcon}>🔧</span>
        </div>
      )}
      {vinyl ? (
        <div
          className={`${styles.vinylStanding}${!labelsVisible ? ` ${styles.labelsHidden}` : ''}${vinyl.isRare ? ` ${styles.rare}` : ''}${onDragStart ? ` ${styles.draggable}` : ''}`}
          style={{ '--v-color': vinyl.color } as CSSProperties}
          onPointerDown={onDragStart ? (e) => {
            e.preventDefault();
            onDragStart(vinyl.id, vinyl.color, e.clientX, e.clientY);
          } : undefined}
        >
          {/* Disc peeking out from the TOP of the sleeve */}
          <div className={styles.discPeek}>
            <div className={styles.discInner}>
              <div className={styles.discShine} />
              <div className={styles.discGrooves} />
            </div>
          </div>

          {/* The album sleeve / cover — nearly front-facing */}
          <div className={styles.sleeve}>
            {/* AI-generated cover art — shown when cover path is available */}
            {vinyl.cover && (
              <>
                <img
                  className={styles.sleeveCoverImg}
                  src={vinyl.cover}
                  alt=""
                  draggable={false}
                />
                <div className={styles.sleeveCoverOverlay} />
              </>
            )}
            <div className={styles.sleeveShine} />
            <div className={styles.sleeveLabel}>
              {/* Genre pill at top — tiny category badge */}
              <span className={styles.labelGenre}>{vinyl.genre ?? ''}</span>
              {/* Album title — bold, main focus */}
              {vinyl.album && (
                <span className={styles.labelAlbum} style={{ fontSize: albumFontSize }}>
                  {vinyl.album}
                </span>
              )}
              {/* Artist name — italic, below album */}
              {vinyl.artist && (
                <span className={styles.labelArtist} style={{ fontSize: artistFontSize }}>
                  {vinyl.artist}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : sleeveHint ? (
        /* Sleeve-match mode: copertina vuota come indizio — attende il disco giusto */
        <div
          className={styles.vinylHint}
          style={{ '--v-color': sleeveHint.color } as CSSProperties}
        >
          {/* Spazio disco vuoto — tratteggiato */}
          <div className={styles.discPeek}>
            <div className={styles.discInner} />
          </div>

          {/* Copertina — mostra artista e album come indizio */}
          <div className={styles.sleeve}>
            <div className={styles.sleeveShine} />
            <div className={styles.sleeveLabel}>
              <span className={styles.labelGenre}>{sleeveHint.genre ?? ''}</span>
              {sleeveHint.album && (
                <span className={styles.labelAlbum} style={{
                  fontSize: (sleeveHint.album.length > 18 ? '5.5px' : sleeveHint.album.length > 13 ? '6.5px' : '7.5px'),
                }}>
                  {sleeveHint.album}
                </span>
              )}
              {sleeveHint.artist && (
                <span className={styles.labelArtist} style={{
                  fontSize: (sleeveHint.artist.length > 18 ? '5px' : sleeveHint.artist.length > 13 ? '5.5px' : '6px'),
                }}>
                  {sleeveHint.artist}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Gold sparkle points — visible briefly on new vinyl placement */}
      {showSparkle && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }} aria-hidden="true">
          {[
            { top: '8%', left: '12%', delay: 0 },
            { top: '15%', right: '15%', delay: 100 },
            { top: '40%', left: '5%', delay: 200 },
            { top: '50%', right: '8%', delay: 150 },
            { top: '75%', left: '10%', delay: 250 },
            { top: '85%', right: '12%', delay: 50 },
          ].map((pt, i) => (
            <SparklePoint key={i} $delay={pt.delay} style={{ top: pt.top, left: pt.left, right: (pt as any).right }}>
              ✦
            </SparklePoint>
          ))}
        </div>
      )}
    </div>
  );
}
