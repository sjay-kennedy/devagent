import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Copy, Download, ExternalLink, Link2, X } from 'lucide-react';
import type { Repo, AgentTask, AgentStatus, LogEntry } from '../../../types';
import { StatusBadge } from '../../atoms/StatusBadge/StatusBadge';
import { LogLine } from '../../atoms/LogLine/LogLine';
import styles from './TaskDetailsDrawer.module.css';

export interface TaskDetailsDrawerProps {
  repo: Repo;
  task: AgentTask;
  status: AgentStatus;
  logs: LogEntry[];
  /** When true, show a host link to review changed files before approve/merge (refactor, PR, deps). */
  taskTouchesRepository: boolean;
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
 * Off-canvas drawer in the main column: audit surface without covering header, footer, or sidebar.
 */
export function TaskDetailsDrawer({
  repo,
  task,
  status,
  logs,
  taskTouchesRepository,
  onClose,
}: TaskDetailsDrawerProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const [logQuery, setLogQuery] = useState('');
  const [copyHint, setCopyHint] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);

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

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
  const diffFilesHref = `${prHref}/files`;

  return (
    <div className={styles.root}>
      <div
        className={`${styles.scrim} ${entered ? styles.scrimVisible : ''}`}
        role="presentation"
        aria-hidden
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-details-title"
        className={`${styles.panel} ${entered ? styles.panelOpen : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.drawer__header}>
          <button
            type="button"
            className={styles.drawer__closeIcon}
            onClick={onClose}
            aria-label="Close review details"
          >
            <X size={17} aria-hidden />
          </button>
          <div className={styles.drawer__headerTitles}>
            <div id="review-details-title" className={styles.drawer__title}>
              Review details
            </div>
            <div className={styles.drawer__subtitle}>
              {task.name} · {repo.owner}/{repo.name}
            </div>
          </div>
        </header>

        <div className={styles.drawer__meta}>
          <div className={styles.drawer__metaBlock}>
            <div className={styles.drawer__metaLabel}>Status</div>
            <div className={styles.drawer__metaValue}>
              <StatusBadge status={status} />
            </div>
          </div>
          <div className={styles.drawer__metaBlock}>
            <div className={styles.drawer__metaLabel}>Task</div>
            <div className={styles.drawer__metaValue}>{task.name}</div>
          </div>
          <div className={styles.drawer__metaBlock}>
            <div className={styles.drawer__metaLabel}>Repo</div>
            <div className={styles.drawer__metaValue}>
              {repo.owner}/{repo.name}
            </div>
          </div>
          <div className={styles.drawer__metaBlock}>
            <div className={styles.drawer__metaLabel}>Log lines</div>
            <div className={styles.drawer__metaValue}>{logs.length}</div>
          </div>
        </div>

        <div className={styles.drawer__runBar}>
          <div className={styles.drawer__runRow}>
            <span className={styles.drawer__metaLabel}>Run ID</span>
            <code className={styles.drawer__runId}>{runId}</code>
          </div>
          <div className={styles.drawer__shareRow}>
            <span className={styles.drawer__shareUrl} title={shareUrl}>
              {shareUrl}
            </span>
            <button
              type="button"
              className={styles.drawer__iconBtn}
              onClick={copyShareLink}
              title="Copy shareable run URL"
            >
              <Link2 size={14} aria-hidden />
              <span>Copy link</span>
            </button>
          </div>
          <div className={styles.drawer__externalRow}>
            <a
              className={styles.drawer__textLink}
              href={ciHref}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={12} aria-hidden />
              CI run #89124031
            </a>
            <a
              className={styles.drawer__textLink}
              href={prHref}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={12} aria-hidden />
              Draft PR #142
            </a>
            {taskTouchesRepository ? (
              <a
                className={styles.drawer__textLink}
                href={diffFilesHref}
                target="_blank"
                rel="noreferrer"
                title="Opens in a new tab so you can review diffs alongside this workflow"
              >
                <ExternalLink size={12} aria-hidden />
                Review file diffs
              </a>
            ) : null}
          </div>
          {copyHint ? (
            <div className={styles.drawer__toast} role="status">
              {copyHint}
            </div>
          ) : null}
        </div>

        <div className={styles.drawer__toolbar}>
          <label className={styles.drawer__searchLabel}>
            <span className="sr-only">Filter log</span>
            <input
              type="search"
              className={styles.drawer__searchInput}
              placeholder="Search in log…"
              value={logQuery}
              onChange={(e) => setLogQuery(e.target.value)}
              autoComplete="off"
            />
          </label>
          <div className={styles.drawer__toolbarActions}>
            <button
              type="button"
              className={styles.drawer__toolbarBtn}
              onClick={copyTranscript}
              disabled={logs.length === 0}
              title="Copy full transcript"
            >
              <Copy size={14} aria-hidden />
              Copy log
            </button>
            <button
              type="button"
              className={styles.drawer__toolbarBtn}
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
          className={styles.drawer__log}
          role="region"
          aria-label="Full log output"
        >
          {logs.length === 0 ? (
            <p className={styles.drawer__empty}>No log output yet.</p>
          ) : filteredLogs.length === 0 ? (
            <p className={styles.drawer__empty}>No lines match your search.</p>
          ) : (
            filteredLogs.map((entry, i) => (
              <LogLine
                key={`${entry.ts}-${i}-${entry.text.slice(0, 32)}`}
                entry={entry}
              />
            ))
          )}
        </div>

        <details className={styles.drawer__rawDetails}>
          <summary className={styles.drawer__rawSummary}>Raw tool output (mock)</summary>
          <pre className={styles.drawer__rawPre}>{rawOutput}</pre>
        </details>

        <footer className={styles.drawer__footer}>
          <button
            type="button"
            className={styles.drawer__primaryBtn}
            onClick={onClose}
          >
            Close
          </button>
        </footer>
      </aside>
    </div>
  );
}
