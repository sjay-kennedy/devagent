import { ChevronLeft } from 'lucide-react';
import type { AgentTask, Repo } from '../../../types';
import { AGENT_TASKS } from '../../../data';
import { TaskCard } from '../../molecules/TaskCard/TaskCard';
import styles from './TaskPicker.module.css';

export interface TaskPickerProps {
  repo: Repo;
  branchContext: string;
  onSelectTask: (task: AgentTask) => void;
  onBack: () => void;
}

/** Step 2: user picks which agent job to run on the already-selected repo. */
export function TaskPicker({
  repo,
  branchContext,
  onSelectTask,
  onBack,
}: TaskPickerProps) {
  return (
    <section className={styles.taskPicker} aria-labelledby="task-picker-title">
      <button
        type="button"
        className={styles.taskPicker__back}
        onClick={onBack}
      >
        <ChevronLeft size={14} aria-hidden />
        Back to Overview
      </button>

      <h2 id="task-picker-title" className={styles.taskPicker__title}>
        Choose an agent task
      </h2>
      <p className={styles.taskPicker__subtitle}>
        Running on{' '}
        <span className={styles.taskPicker__repoName}>{repo.name}</span>
        {' '}
        <span className={styles.taskPicker__context} title={`Default branch: ${repo.branch}`}>
          · workspace: {branchContext}
        </span>
      </p>

      <div className={styles.taskPicker__grid}>
        {AGENT_TASKS.map((task) => (
          <TaskCard key={task.id} task={task} onSelect={onSelectTask} />
        ))}
      </div>
    </section>
  );
}
