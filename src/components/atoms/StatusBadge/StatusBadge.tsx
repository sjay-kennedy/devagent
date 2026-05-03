import type { AgentStatus } from '../../../types';
import styles from './StatusBadge.module.css';

/** Maps agent lifecycle to label + BEM modifier class for the pill. */
/* CSS module keys are string-typed; each class below exists in the .module.css file. */
const VARIANT: Record<AgentStatus, { label: string; mod: string }> = {
  idle: { label: 'idle', mod: styles['statusBadge--idle'] as string },
  pending: { label: 'pending', mod: styles['statusBadge--pending'] as string },
  running: { label: 'running', mod: styles['statusBadge--running'] as string },
  success: { label: 'success', mod: styles['statusBadge--success'] as string },
  failure: { label: 'failed', mod: styles['statusBadge--failure'] as string },
};

export interface StatusBadgeProps {
  status: AgentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, mod } = VARIANT[status];
  return (
    <span className={`${styles.statusBadge} ${mod}`}>
      {status === 'running' && (
        <span className={styles.statusBadge__dot} aria-hidden />
      )}
      {label}
    </span>
  );
}
