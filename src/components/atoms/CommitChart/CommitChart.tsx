import styles from './CommitChart.module.css';

export interface CommitChartProps {
  commits: number[];
}

const RECENT_BAR_CLASSES = [
  styles['commitChart__bar--recent1'],
  styles['commitChart__bar--recent2'],
  styles['commitChart__bar--recent3'],
  styles['commitChart__bar--recent4'],
] as const;

/**
 * 12 vertical bars for weekly commits; last 4 weeks use stronger blue ramp from design tokens.
 */
export function CommitChart({ commits }: CommitChartProps) {
  const max = Math.max(...commits, 1);
  const recentCount = 4;
  const recentStart = commits.length - recentCount;

  return (
    <div className={styles.commitChart} role="img" aria-label="Commit activity last 12 weeks">
      {commits.map((v, i) => {
        const pct = (v / max) * 100;
        const heightPct = Math.max(pct, 8);
        const isRecent = i >= recentStart;
        const recentIdx = i - recentStart;
        const barColorClass = isRecent
          ? RECENT_BAR_CLASSES[recentIdx] ?? RECENT_BAR_CLASSES[RECENT_BAR_CLASSES.length - 1]
          : styles['commitChart__bar--muted'];

        return (
          <div
            key={i}
            className={`${styles.commitChart__bar} ${barColorClass}`}
            style={{ height: `${heightPct}%` }}
          />
        );
      })}
    </div>
  );
}
