import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Repo, AgentTask, AgentStatus, LogEntry } from '../../../types';
import { StatusBadge } from '../../atoms/StatusBadge/StatusBadge';
import { LogLine } from '../../atoms/LogLine/LogLine';
import styles from './TaskDetailsModal.module.css';

export interface TaskDetailsModalProps {
  repo: Repo;
  task: AgentTask;
  status: AgentStatus;
  logs: LogEntry[];
  onClose: () => void;
}

/**
 * Full transcript + metadata for audit (Part 1 “details without losing parent context”).
 * Overlay uses position:absolute inside the template root, not fixed to the viewport.
 */
export function TaskDetailsModal({
  repo,
  task,
  status,
  logs,
  onClose,
}: TaskDetailsModalProps) {
  const logRef = useRef<HTMLDivElement>(null);

  // Keep modal log pinned to latest line when opened while streaming has finished.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  // Close on Escape without requiring the overlay to be focused.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={onClose}
    >
      <dialog
        className={styles.dialog}
        open
        aria-labelledby="task-details-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.dialog__header}>
          <div>
            <div id="task-details-title" className={styles.dialog__title}>
              Task details
            </div>
            <div className={styles.dialog__subtitle}>
              {task.name} · {repo.owner}/{repo.name}
            </div>
          </div>
          <button
            type="button"
            className={styles.dialog__close}
            onClick={onClose}
            aria-label="Close Details"
          >
            <X size={15} aria-hidden />
          </button>
        </header>

        <div className={styles.dialog__meta}>
          <div className={styles.dialog__metaBlock}>
            <div className={styles.dialog__metaLabel}>Status</div>
            <div className={styles.dialog__metaValue}>
              <StatusBadge status={status} />
            </div>
          </div>
          <div className={styles.dialog__metaBlock}>
            <div className={styles.dialog__metaLabel}>Task</div>
            <div className={styles.dialog__metaValue}>{task.name}</div>
          </div>
          <div className={styles.dialog__metaBlock}>
            <div className={styles.dialog__metaLabel}>Repo</div>
            <div className={styles.dialog__metaValue}>
              {repo.owner}/{repo.name}
            </div>
          </div>
          <div className={styles.dialog__metaBlock}>
            <div className={styles.dialog__metaLabel}>Log lines</div>
            <div className={styles.dialog__metaValue}>{logs.length}</div>
          </div>
        </div>

        <div ref={logRef} className={styles.dialog__log} role="region" aria-label="Full log output">
          {logs.length === 0 ? (
            <p className={styles.dialog__empty}>No log output yet.</p>
          ) : (
            logs.map((entry, i) => (
              <LogLine key={`${entry.ts}-${i}`} entry={entry} />
            ))
          )}
        </div>

        <footer className={styles.dialog__footer}>
          <button
            type="button"
            className={styles.dialog__primaryBtn}
            onClick={onClose}
          >
            Close
          </button>
        </footer>
      </dialog>
    </div>
  );
}
