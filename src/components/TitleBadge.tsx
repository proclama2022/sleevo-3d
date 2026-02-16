import styles from './TitleBadge.module.css';

export function TitleBadge() {
  return (
    <div className={styles.badge}>
      <div className={styles.mainPill}>
        <div className={styles.title}>
          <span className={styles.sleevo}>SLEEVO</span>
          <span className={styles.threeD}>3D</span>
        </div>
      </div>
      <div className={styles.subPill}>
        <div className={styles.subtitle}>VINYL SHOP MANAGER</div>
      </div>
    </div>
  );
}
