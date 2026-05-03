import type { AgentTask } from '../../../types';
import styles from './TaskCard.module.css';

export interface TaskCardProps {
  task: AgentTask;
  onSelect: (task: AgentTask) => void;
}

/** Grid tile: pick one agent job before execution starts. */
export function TaskCard({ task, onSelect }: TaskCardProps) {
  const { Icon } = task;
  return (
    <button
      type="button"
      className={styles.taskCard}
      onClick={() => onSelect(task)}
    >
      <div className={styles.taskCard__header}>
        <div className={styles.taskCard__iconWrap}>
          <Icon size={14} color="var(--color-text-secondary)" aria-hidden />
        </div>
        <span className={styles.taskCard__title}>{task.name}</span>
      </div>
      <p className={styles.taskCard__desc}>{task.description}</p>
    </button>
  );
}
