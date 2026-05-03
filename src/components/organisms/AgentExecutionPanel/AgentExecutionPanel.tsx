import { useEffect, useRef } from 'react';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import type { AgentTask, Repo, AgentStatus, LogEntry } from '../../../types';
import { StatusBadge } from '../../atoms/StatusBadge/StatusBadge';
import { Spinner } from '../../atoms/Spinner/Spinner';
import { LogLine } from '../../atoms/LogLine/LogLine';
import styles from './AgentExecutionPanel.module.css';

/** After a successful "writes to repo" run, whether the user kept or threw away the mock outcome. */
export type ChangeGuardDecision = null | 'approved' | 'reverted';

export interface AgentExecutionPanelProps {
  repo: Repo;
  task: AgentTask;
  status: AgentStatus;
  logs: LogEntry[];
  progress: number;
  /** True for refactor / PR / dep audit — show approve vs revert strip when the run finishes. */
  taskTouchesRepository: boolean;
  /** User choice for that strip; null means they have not chosen yet. */
  changeGuardDecision: ChangeGuardDecision;
  onApproveChanges: () => void;
  onRevertChanges: () => void;
  onBack: () => void;
  onRetry: () => void;
  onDetails: () => void;
  /** Matches sidebar branch context (mock target ref for the run). */
  branchContext: string;
}

/**
 * Step 3: task chrome (header/footer) + streaming log body.
 * Ref keeps the log scrolled to bottom as new lines arrive.
 */
export function AgentExecutionPanel({
  repo,
  task,
  status,
  logs,
  progress,
  taskTouchesRepository,
  changeGuardDecision,
  onApproveChanges,
  onRevertChanges,
  onBack,
  onRetry,
  onDetails,
  branchContext,
}: AgentExecutionPanelProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  const canRetry = status === 'success' || status === 'failure';
  const done = status === 'success' || status === 'failure';

  const fillPct = done ? 100 : progress;
  const fillMod = done
    ? status === 'failure'
      ? styles['agentPanel__progressFill--failure']
      : styles['agentPanel__progressFill--success']
    : styles['agentPanel__progressFill--running'];

  return (
    <section
      className={styles.agentPanel}
      aria-labelledby="agent-panel-task"
    >
      <header className={styles.agentPanel__header}>
        <div className={styles.agentPanel__headerLeft}>
          <button
            type="button"
            className={styles.agentPanel__backBtn}
            onClick={onBack}
            aria-label="Back to overview"
          >
            <ChevronLeft size={14} aria-hidden />
          </button>
          <div className={styles.agentPanel__titles}>
            <div id="agent-panel-task" className={styles.agentPanel__taskName}>
              {task.name}
            </div>
            <div
              className={styles.agentPanel__context}
              title={`Default branch: ${repo.branch}`}
            >
              {repo.owner}/{repo.name} · workspace: {branchContext}
            </div>
          </div>
        </div>
        <div className={styles.agentPanel__headerRight}>
          {(status === 'running' || status === 'pending') && <Spinner />}
          <StatusBadge status={status} />
        </div>
      </header>

      <div
        className={styles.agentPanel__progressTrack}
        role="progressbar"
        aria-valuenow={fillPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Agent progress"
      >
        <div
          className={`${styles.agentPanel__progressFill} ${fillMod}`}
          style={{ width: `${fillPct}%` }}
        />
      </div>

      <div
        ref={logRef}
        className={styles.agentPanel__log}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {status === 'pending' && (
          <div className={styles.agentPanel__pendingRow}>
            <Spinner />
            Preparing agent workspace…
          </div>
        )}

        {logs.map((entry, i) => (
          <LogLine key={`${entry.ts}-${i}`} entry={entry} />
        ))}

        {status === 'running' && logs.length > 0 && (
          <div className={styles.agentPanel__cursor} aria-hidden>
            ▌
          </div>
        )}

        {done && (
          <div
            className={`${styles.agentPanel__outcome} ${
              status === 'success'
                ? styles['agentPanel__outcome--success']
                : styles['agentPanel__outcome--failure']
            }`}
          >
            {status === 'success'
              ? '✓ Task completed successfully'
              : '✕ Task completed with errors — review the log above'}
          </div>
        )}
      </div>

      {/* Refactor / PR / deps: real systems mutate Git — prototype surfaces approve vs revert after success. */}
      {taskTouchesRepository && done && (
        <div className={styles.agentPanel__manage}>
          {status === 'failure' && changeGuardDecision === null ? (
            <>
              <div className={styles.agentPanel__manageTitle}>
                No promoted changes
              </div>
              <p className={styles.agentPanel__manageCopy}>
                The run failed before a safe publish step. In production you would fix the error,
                then retry; any partial agent branch would be abandoned or never pushed.
              </p>
              <div className={styles.agentPanel__manageActions}>
                <button
                  type="button"
                  className={styles.agentPanel__manageBtnSecondary}
                  onClick={onRevertChanges}
                >
                  Acknowledge (mock)
                </button>
              </div>
            </>
          ) : status === 'failure' && changeGuardDecision === 'reverted' ? (
            <div
              className={`${styles.agentPanel__manageBanner} ${styles['agentPanel__manageBanner--reverted']}`}
            >
              <strong>Acknowledged.</strong> Mock workspace cleared — nothing would be merged from
              this failed run.
            </div>
          ) : status === 'success' && changeGuardDecision === null ? (
            <>
              <div className={styles.agentPanel__manageTitle}>
                Manage proposed changes
              </div>
              <p className={styles.agentPanel__manageCopy}>
                A real refactor (or PR / dep upgrade) would push commits to an integration branch.
                Example branch name:{' '}
                <span className={styles.agentPanel__manageBranch}>
                  agent/{repo.name}-{task.id}-preview
                </span>
                . Use the actions below to simulate how a developer accepts or throws away that
                work after reading the log.
              </p>
              <div className={styles.agentPanel__manageActions}>
                <button
                  type="button"
                  className={styles.agentPanel__manageBtnPrimary}
                  onClick={onApproveChanges}
                >
                  Approve &amp; keep
                </button>
                <button
                  type="button"
                  className={styles.agentPanel__manageBtnSecondary}
                  onClick={onRevertChanges}
                >
                  Revert / discard
                </button>
              </div>
            </>
          ) : status === 'success' && changeGuardDecision === 'approved' ? (
            <div
              className={`${styles.agentPanel__manageBanner} ${styles['agentPanel__manageBanner--approved']}`}
            >
              <strong>Approved (prototype).</strong> In production this would mark the change as
              ready to merge, open a PR for humans, or keep the agent branch for follow-up review.
            </div>
          ) : status === 'success' && changeGuardDecision === 'reverted' ? (
            <div
              className={`${styles.agentPanel__manageBanner} ${styles['agentPanel__manageBanner--reverted']}`}
            >
              <strong>Reverted (prototype).</strong> In production you would delete the agent
              branch, close a draft PR, or reset to the previous tip so nothing ships by accident.
            </div>
          ) : null}
        </div>
      )}

      <footer className={styles.agentPanel__footer}>
        <button
          type="button"
          className={styles.agentPanel__footerBtn}
          onClick={onRetry}
          disabled={!canRetry}
        >
          <RotateCcw size={11} aria-hidden />
          Retry
        </button>
        <button
          type="button"
          className={styles.agentPanel__footerBtn}
          onClick={onDetails}
        >
          View details
        </button>
        <div className={styles.agentPanel__footerSpacer} />
        {done && (
          <span className={styles.agentPanel__footerMeta}>
            {logs.length} log lines
          </span>
        )}
      </footer>
    </section>
  );
}
