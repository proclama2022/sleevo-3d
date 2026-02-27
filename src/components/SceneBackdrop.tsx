import type { LevelTheme } from '../game/types';
import styles from './SceneBackdrop.module.css';

interface Props {
  theme?: LevelTheme;
}

const THEME_CLASS: Record<LevelTheme, string> = {
  'classic':       styles.classic,
  'jazz-club':     styles.jazz_club,
  'punk-basement': styles.punk_basement,
  'disco-70s':     styles.disco_70s,
  'indie-loft':    styles.indie_loft,
  'electronic-neon': styles.electronic_neon,
  'vinyl-storage':   styles.vinyl_storage,
};

export function SceneBackdrop({ theme = 'classic' }: Props) {
  return (
    <div className={`${styles.backdrop} ${THEME_CLASS[theme]}`}>
      {/* AI-generated background photo */}
      <div className={styles.bgPhoto} style={{ backgroundImage: `url(/themes/${theme}.jpg)` }} />

      {/* Theme-specific color overlay */}
      <div className={styles.colorOverlay} />

      {/* Shared atmospheric effects */}
      <div className={styles.bgGlow} />
      <div className={styles.sceneFog} />

      {/* Lamps — always present, tinted per theme */}
      <div className={`${styles.lamp} ${styles.lampLeft}`} />
      <div className={`${styles.lamp} ${styles.lampRight}`} />
      <div className={`${styles.lightCone} ${styles.lightConeLeft}`} />
      <div className={`${styles.lightCone} ${styles.lightConeRight}`} />

      {/* Bokeh blobs — different palettes per theme via CSS vars */}
      <div className={`${styles.bokeh} ${styles.bokehA}`} />
      <div className={`${styles.bokeh} ${styles.bokehB}`} />
      <div className={`${styles.bokeh} ${styles.bokehC}`} />
      <div className={`${styles.bokeh} ${styles.bokehD}`} />

      {/* Side shelves blur */}
      <div className={styles.bgShelfLeft} />
      <div className={styles.bgShelfRight} />
    </div>
  );
}
