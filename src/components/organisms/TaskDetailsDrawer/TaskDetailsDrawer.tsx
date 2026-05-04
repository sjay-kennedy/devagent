import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Copy, Download, Link2, X } from 'lucide-react';
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

type DrawerTabId = 'logs' | 'ci' | 'pr' | 'diffs';

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
  const [activeTab, setActiveTab] = useState<DrawerTabId>('logs');

  const runId = mockRunId(task.id);
  const shareUrl = mockShareUrl(task.id);
  const rawOutput = mockRawToolOutput(task, repo);

  const tabs = useMemo(
    () => [
      { id: 'logs' as const, label: 'Logs', enabled: true },
      { id: 'ci' as const, label: 'CI run', enabled: true },
      { id: 'pr' as const, label: 'PR draft', enabled: true },
      { id: 'diffs' as const, label: 'Review file diffs', enabled: taskTouchesRepository },
    ],
    [taskTouchesRepository]
  );

  useEffect(() => {
    if (activeTab === 'diffs' && !taskTouchesRepository) {
      setActiveTab('logs');
    }
  }, [activeTab, taskTouchesRepository]);

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
  }, [logs, filteredLogs, activeTab]);

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
          {copyHint ? (
            <div className={styles.drawer__toast} role="status">
              {copyHint}
            </div>
          ) : null}
        </div>

        <div className={styles.drawer__tabRow} role="tablist" aria-label="Review details tabs">
          {tabs.filter((t) => t.enabled).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`drawer-tab-panel-${tab.id}`}
              id={`drawer-tab-${tab.id}`}
              className={`${styles.drawer__tabBtn} ${activeTab === tab.id ? styles.drawer__tabBtnActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section
          className={styles.drawer__tabPanel}
          role="tabpanel"
          id={`drawer-tab-panel-${activeTab}`}
          aria-labelledby={`drawer-tab-${activeTab}`}
        >
          {activeTab === 'logs' ? (
            <>
              <div className={styles.drawer__toolbar}>
                <label className={styles.drawer__searchLabel}>
                  <span className="sr-only">Filter log</span>
                  <input
                    type="search"
                    className={styles.drawer__searchInput}
                    placeholder="Search in log..."
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
            </>
          ) : (
            <div className={styles.drawer__tabContent}>
              {activeTab === 'ci' ? (
                <>
                  <div className={styles.drawer__tabTitle}>CI run #89124031</div>
                  <p className={styles.drawer__tabCopy}>
                    Embedded CI results view (mock) with jobs, failures, and rerun status, all in-drawer.
                  </p>
                  <div className={styles.drawer__mockSurface}>
                    <div className={styles.drawer__mockRow}>
                      <span>build-and-test</span>
                      <span className={styles.drawer__mockBadgeFail}>failed</span>
                    </div>
                    <div className={styles.drawer__mockRow}>
                      <span>lint</span>
                      <span className={styles.drawer__mockBadgePass}>passed</span>
                    </div>
                    <div className={styles.drawer__mockRow}>
                      <span>security-scan</span>
                      <span className={styles.drawer__mockBadgePass}>passed</span>
                    </div>
                  </div>
                </>
              ) : activeTab === 'pr' ? (
                <>
                  <div className={styles.drawer__tabTitle}>Draft PR #142</div>
                  <p className={styles.drawer__tabCopy}>
                    Embedded PR review view (mock) with summary, reviewers, and checklist before merge.
                  </p>
                  <div className={styles.drawer__mockSurface}>
                    <div className={styles.drawer__mockRow}>
                      <span>Summary</span>
                      <span>Refactor + dependency updates</span>
                    </div>
                    <div className={styles.drawer__mockRow}>
                      <span>Reviewers</span>
                      <span>@alice, @carol</span>
                    </div>
                    <div className={styles.drawer__mockRow}>
                      <span>Merge checks</span>
                      <span>1 failing, 2 passing</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.drawer__tabTitle}>File diff review</div>
                  <p className={styles.drawer__tabCopy}>
                    Embedded file diff list (mock) to inspect changed files before approving.
                  </p>
                  <div className={styles.drawer__mockSurface}>
                    <div className={styles.drawer__mockRow}>
                      <span>src/routes.ts</span>
                      <span>+42 / -18</span>
                    </div>
                    <div className={styles.drawer__mockRow}>
                      <span>src/upstream.test.ts</span>
                      <span>+11 / -6</span>
                    </div>
                    <div className={styles.drawer__mockRow}>
                      <span>package.json</span>
                      <span>+3 / -1</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

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
