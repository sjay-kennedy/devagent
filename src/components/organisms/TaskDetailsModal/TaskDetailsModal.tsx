import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Download, ExternalLink, Link2, X } from 'lucide-react';
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

function mockRunId(taskId: string): string {
  return `da-run-${taskId}-7f3a9c2`;
}

function mockShareUrl(taskId: string): string {
  return `https://devagent.acme.example/runs/${mockRunId(taskId)}`;
}

function mockRawToolOutput(task: AgentTask, repo: Repo): string {
  return JSON.stringify(
    {
      tool: task.id === 'tests' ? 'jest' : task.id === 'deps' ? 'npm-audit' : 'agent-cli',
      cwd: `${repo.owner}/${repo.name}`,
      argv: ['--ci', '--json'],
      exitCode: task.id === 'tests' || task.id === 'deps' ? 1 : 0,
      wallMs: 18420,
      stderr_tail:
        task.id === 'tests'
          ? 'TimeoutError: exceeded 5000ms\n    at waitForUpstream (src/upstream.test.ts:218:11)'
          : task.id === 'deps'
            ? 'npm ERR! audit found 1 critical vulnerability in dependency tree'
            : '(no stderr)',
    },
    null,
    2
  );
}

function logLinePlain(entry: LogEntry): string {
  const link = entry.fileLink ? ` ${entry.fileLink.label}` : '';
  return `${entry.ts} ${entry.text}${link}`;
}

/**
 * Audit-oriented surface: shareable run, CI/PR links, search/filter log, copy/export, raw tool JSON.
 * Complements the execution panel without duplicating only the stream.
 */
export function TaskDetailsModal({
  repo,
  task,
  status,
  logs,
  onClose,
}: TaskDetailsModalProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const [logQuery, setLogQuery] = useState('');
  const [copyHint, setCopyHint] = useState<string | null>(null);

  const runId = mockRunId(task.id);
  const shareUrl = mockShareUrl(task.id);
  const rawOutput = mockRawToolOutput(task, repo);

  const filteredLogs = useMemo(() => {
    const q = logQuery.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((entry) => {
      const hay = `${entry.text} ${entry.fileLink?.label ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [logs, logQuery]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs, filteredLogs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const showCopyHint = useCallback((message: string) => {
    setCopyHint(message);
    window.setTimeout(() => setCopyHint(null), 2000);
  }, []);

  const copyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showCopyHint('Run link copied');
    } catch {
      showCopyHint('Copy blocked in this browser');
    }
  }, [shareUrl, showCopyHint]);

  const copyTranscript = useCallback(async () => {
    const body = logs.map(logLinePlain).join('\n');
    try {
      await navigator.clipboard.writeText(body);
      showCopyHint('Transcript copied');
    } catch {
      showCopyHint('Copy blocked in this browser');
    }
  }, [logs, showCopyHint]);

  const exportTranscript = useCallback(() => {
    const body = logs.map(logLinePlain).join('\n');
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${repo.name}-${task.id}-log.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showCopyHint('Download started');
  }, [logs, repo.name, task.id, showCopyHint]);

  const ciHref = `https://github.com/${repo.owner}/${repo.name}/actions/runs/89124031`;
  const prHref = `https://github.com/${repo.owner}/${repo.name}/pull/142`;

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

        <div className={styles.dialog__runBar}>
          <div className={styles.dialog__runRow}>
            <span className={styles.dialog__metaLabel}>Run ID</span>
            <code className={styles.dialog__runId}>{runId}</code>
          </div>
          <div className={styles.dialog__shareRow}>
            <span className={styles.dialog__shareUrl} title={shareUrl}>
              {shareUrl}
            </span>
            <button
              type="button"
              className={styles.dialog__iconBtn}
              onClick={copyShareLink}
              title="Copy shareable run URL"
            >
              <Link2 size={14} aria-hidden />
              <span>Copy link</span>
            </button>
          </div>
          <div className={styles.dialog__externalRow}>
            <a
              className={styles.dialog__textLink}
              href={ciHref}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={12} aria-hidden />
              CI run #89124031
            </a>
            <a
              className={styles.dialog__textLink}
              href={prHref}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={12} aria-hidden />
              Draft PR #142
            </a>
          </div>
          {copyHint ? (
            <div className={styles.dialog__toast} role="status">
              {copyHint}
            </div>
          ) : null}
        </div>

        <div className={styles.dialog__toolbar}>
          <label className={styles.dialog__searchLabel}>
            <span className="sr-only">Filter log</span>
            <input
              type="search"
              className={styles.dialog__searchInput}
              placeholder="Search in log…"
              value={logQuery}
              onChange={(e) => setLogQuery(e.target.value)}
              autoComplete="off"
            />
          </label>
          <div className={styles.dialog__toolbarActions}>
            <button
              type="button"
              className={styles.dialog__toolbarBtn}
              onClick={copyTranscript}
              disabled={logs.length === 0}
              title="Copy full transcript"
            >
              <Copy size={14} aria-hidden />
              Copy log
            </button>
            <button
              type="button"
              className={styles.dialog__toolbarBtn}
              onClick={exportTranscript}
              disabled={logs.length === 0}
              title="Download transcript as .txt"
            >
              <Download size={14} aria-hidden />
              Export
            </button>
          </div>
        </div>

        <div
          ref={logRef}
          className={styles.dialog__log}
          role="region"
          aria-label="Full log output"
        >
          {logs.length === 0 ? (
            <p className={styles.dialog__empty}>No log output yet.</p>
          ) : filteredLogs.length === 0 ? (
            <p className={styles.dialog__empty}>No lines match your search.</p>
          ) : (
            filteredLogs.map((entry, i) => (
              <LogLine
                key={`${entry.ts}-${i}-${entry.text.slice(0, 32)}`}
                entry={entry}
              />
            ))
          )}
        </div>

        <details className={styles.dialog__rawDetails}>
          <summary className={styles.dialog__rawSummary}>Raw tool output (mock)</summary>
          <pre className={styles.dialog__rawPre}>{rawOutput}</pre>
        </details>

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
