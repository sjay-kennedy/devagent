import elevated from '../../_shared/SurfaceCard.module.css';
import styles from './MetricCard.module.css';

export interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  /** Optional CSS color for the big number (e.g. health score). */
  valueColor?: string;
}

/** Single stat tile on the repo overview grid. */
export function MetricCard({ label, value, sub, valueColor }: MetricCardProps) {
  return (
    <article
      className={`${elevated.elevated} ${elevated.elevated_paddingDense} ${elevated.elevated_bgSecondary}`}
    >
      <div className={styles.metricCard__label}>{label}</div>
      <div
        className={styles.metricCard__value}
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </div>
      {sub ? <div className={styles.metricCard__sub}>{sub}</div> : null}
    </article>
  );
}
