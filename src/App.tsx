import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { REPOS, LOG_SCRIPTS } from './data';
import type { BranchContextOption } from './data';
import type {
  Repo,
  AgentTask,
  AgentStatus,
  AppView,
  LogEntry,
} from './types';
import { filterRepos } from './utils/filterRepos';
import { taskTouchesRepository } from './utils/taskTouchesRepository';
import { ThemeToggle } from './components/molecules/ThemeToggle/ThemeToggle';
import { DevAgentTemplate } from './components/templates/DevAgentTemplate/DevAgentTemplate';
import appStyles from './App.module.css';
import { Sidebar } from './components/organisms/Sidebar/Sidebar';
import { RepositoryOverview } from './components/organisms/RepositoryOverview/RepositoryOverview';
import { TaskPicker } from './components/organisms/TaskPicker/TaskPicker';
import {
  AgentExecutionPanel,
  type ChangeGuardDecision,
} from './components/organisms/AgentExecutionPanel/AgentExecutionPanel';
import { TaskDetailsModal } from './components/organisms/TaskDetailsModal/TaskDetailsModal';

/** Milliseconds between appended log lines while status === 'running'. */
const STREAM_MS = 620;
/** Short delay so the user sees 'pending' before logs stream (tutorial behavior). */
const PENDING_MS = 900;

export default function App() {
  // --- Repo navigation (sidebar) ---
  const [selectedRepo, setSelectedRepo] = useState<Repo>(REPOS[0]!);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('All');
  /** Sidebar: which branch / environment agents target for this session (mock). */
  const [branchContext, setBranchContext] =
    useState<BranchContextOption>('main');

  // --- Step-driven main pane: overview → pick task → watch agent ---
  const [view, setView] = useState<AppView>('overview');

  // --- Single active agent run (mock; no server) ---
  const [activeTask, setActiveTask] = useState<AgentTask | null>(null);
  const [status, setStatus] = useState<AgentStatus>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  /** For tasks that touch the repo: after success/failure, user approves or discards the mock outcome. */
  const [changeGuardDecision, setChangeGuardDecision] =
    useState<ChangeGuardDecision>(null);
  /** Refactor task: stay pending until user confirms target in the agent panel. */
  const [refactorRunTargetConfirmed, setRefactorRunTargetConfirmed] =
    useState(true);

  // Timer ids live in refs so clearing them does not trigger extra renders.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // "All" plus every distinct language from dummy data (chip source).
  const languageOptions = useMemo(() => {
    const langs = Array.from(new Set(REPOS.map((r) => r.language))).sort();
    return ['All', ...langs];
  }, []);

  const filteredRepos = useMemo(
    () => filterRepos(REPOS, search, langFilter),
    [search, langFilter]
  );

  /** Stops mock streaming; call before any navigation that abandons the current run. */
  function clearTimers() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  const closeModal = useCallback(() => setShowModal(false), []);

  // When status flips to 'running', drain LOG_SCRIPTS for activeTask on an interval.
  useEffect(() => {
    if (status !== 'running' || !activeTask) return;

    const script = LOG_SCRIPTS[activeTask.id] ?? [];
    if (script.length === 0) return;

    let idx = 0;
    intervalRef.current = setInterval(() => {
      if (idx >= script.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        const hasFail = script.some((l) => l.level === 'error');
        setStatus(hasFail ? 'failure' : 'success');
        setProgress(100);
        return;
      }

      const entry = script[idx]!;
      const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
      setLogs((prev) => [...prev, { ...entry, ts }]);
      setProgress(Math.round(((idx + 1) / script.length) * 100));
      idx += 1;
    }, STREAM_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, activeTask]);

  // Clear timers if the whole app unmounts (e.g. strict mode remount in dev).
  useEffect(
    () => () => {
      clearTimers();
    },
    []
  );

  function startTask(task: AgentTask) {
    clearTimers();
    setChangeGuardDecision(null);
    setActiveTask(task);
    setStatus('pending');
    setLogs([]);
    setProgress(0);
    setView('agent');
    const isRefactor = task.id === 'refactor';
    setRefactorRunTargetConfirmed(!isRefactor);
    if (!isRefactor) {
      timerRef.current = setTimeout(() => setStatus('running'), PENDING_MS);
    }
  }

  function confirmRefactorRunTarget() {
    setRefactorRunTargetConfirmed(true);
    timerRef.current = setTimeout(() => setStatus('running'), PENDING_MS);
  }

  function retryTask() {
    if (!activeTask) return;
    clearTimers();
    setChangeGuardDecision(null);
    setStatus('pending');
    setLogs([]);
    setProgress(0);
    setRefactorRunTargetConfirmed(true);
    timerRef.current = setTimeout(() => setStatus('running'), PENDING_MS);
  }

  /** Picking another repo resets the funnel — matches Part 1 "backing out / wrong target". */
  function selectRepo(repo: Repo) {
    clearTimers();
    setSelectedRepo(repo);
    setView('overview');
    setStatus('idle');
    setLogs([]);
    setProgress(0);
    setActiveTask(null);
    setShowModal(false);
    setChangeGuardDecision(null);
  }

  return (
    <div className={appStyles.page}>
      <div className={appStyles.themeBar}>
        <ThemeToggle />
      </div>
      <DevAgentTemplate
        sidebar={
          <Sidebar
            repos={filteredRepos}
            totalRepoCount={REPOS.length}
            selectedId={selectedRepo.id}
            search={search}
            onSearchChange={setSearch}
            langFilter={langFilter}
            onLangFilterChange={setLangFilter}
            languageOptions={languageOptions}
            branchContext={branchContext}
            onBranchContextChange={setBranchContext}
            onSelectRepo={selectRepo}
          />
        }
        main={
          <>
            {view === 'overview' && (
              <RepositoryOverview
                repo={selectedRepo}
                branchContext={branchContext}
                onRunTask={() => setView('task-picker')}
              />
            )}
            {view === 'task-picker' && (
              <TaskPicker
                repo={selectedRepo}
                branchContext={branchContext}
                onSelectTask={startTask}
                onBack={() => setView('overview')}
              />
            )}
            {view === 'agent' && activeTask && (
              <AgentExecutionPanel
                repo={selectedRepo}
                task={activeTask}
                status={status}
                logs={logs}
                progress={progress}
                onBack={() => {
                  // User left the run: stop streaming and drop task state (Part 1 backing out).
                  clearTimers();
                  setView('overview');
                  setStatus('idle');
                  setActiveTask(null);
                  setLogs([]);
                  setProgress(0);
                  setShowModal(false);
                  setChangeGuardDecision(null);
                  setRefactorRunTargetConfirmed(true);
                }}
                onRetry={retryTask}
                onDetails={() => setShowModal(true)}
                taskTouchesRepository={taskTouchesRepository(activeTask.id)}
                changeGuardDecision={changeGuardDecision}
                onApproveChanges={() => setChangeGuardDecision('approved')}
                onRevertChanges={() => setChangeGuardDecision('reverted')}
                branchContext={branchContext}
                onBranchContextChange={setBranchContext}
                refactorRunTargetConfirmed={refactorRunTargetConfirmed}
                onConfirmRefactorRunTarget={confirmRefactorRunTarget}
              />
            )}
            {showModal && activeTask && (
              <TaskDetailsModal
                repo={selectedRepo}
                task={activeTask}
                status={status}
                logs={logs}
                taskTouchesRepository={taskTouchesRepository(activeTask.id)}
                onClose={closeModal}
              />
            )}
          </>
        }
      />
    </div>
  );
}
