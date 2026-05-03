import type { LucideIcon } from 'lucide-react';

/** Log severity used for coloring and for deciding run failure when any line is `error`. */
export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface Repo {
  id: string;
  name: string;
  owner: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  issues: number;
  prs: number;
  lastCommit: string;
  branch: string;
  health: number;
  /** 12 weekly commit counts, oldest → newest, for the overview chart. */
  commits: number[];
}

export interface AgentTask {
  id: string;
  name: string;
  description: string;
  Icon: LucideIcon;
}

export interface LogScriptEntry {
  level: LogLevel;
  text: string;
}

/** One rendered line in the agent panel (script line + client-side timestamp). */
export interface LogEntry extends LogScriptEntry {
  ts: string;
}

export type AgentStatus = 'idle' | 'pending' | 'running' | 'success' | 'failure';

/** Which main pane is visible to the right of the repo sidebar. */
export type AppView = 'overview' | 'task-picker' | 'agent';
