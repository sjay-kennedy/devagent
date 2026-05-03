import { GitBranch, GitFork, Clock, Play } from 'lucide-react';
import type { Repo } from '../../../types';
import { LANG_COLORS } from '../../../data';
import { fmtNum } from '../../../utils/format';
import { healthColor } from '../../../utils/healthColor';
import { MetricCard } from '../../atoms/MetricCard/MetricCard';
import { CommitChart } from '../../atoms/CommitChart/CommitChart';
import elevated from '../../_shared/SurfaceCard.module.css';
import styles from './RepositoryOverview.module.css';

export interface RepositoryOverviewProps {
  repo: Repo;
  /** Branch context from sidebar (where agents would run against in a real product). */
  branchContext: string;
  onRunTask: () => void;
}

/** Main pane step 1: repo metadata, insight tiles, chart, CTA to pick an agent task. */
export function RepositoryOverview({
  repo,
  branchContext,
  onRunTask,
}: RepositoryOverviewProps) {
  const dot = LANG_COLORS[repo.language] ?? 'var(--color-lang-dot-fallback)';

  return (
    <section
      className={styles.repositoryOverview}
      aria-labelledby="repo-overview-title"
    >
      <header className={styles.repositoryOverview__header}>
        <div className={styles.repositoryOverview__titleRow}>
          <h2
            id="repo-overview-title"
            className={styles.repositoryOverview__title}
          >
            {repo.name}
          </h2>
          <span className={styles.repositoryOverview__ownerBadge}>
            {repo.owner}
          </span>
        </div>

        <div className={styles.repositoryOverview__meta}>
          <span className={styles.repositoryOverview__metaItem}>
            <span
              className={styles.repositoryOverview__langDot}
              style={{ background: dot }}
              aria-hidden
            />
            {repo.language}
          </span>
          <span className={styles.repositoryOverview__metaSep} aria-hidden>
            ·
          </span>
          <span
            className={styles.repositoryOverview__metaItem}
            title={`Default branch: ${repo.branch}`}
          >
            <GitBranch size={11} aria-hidden />
            {branchContext}
          </span>
          <span className={styles.repositoryOverview__metaSep} aria-hidden>
            ·
          </span>
          <span className={styles.repositoryOverview__metaItem}>
            <Clock size={11} aria-hidden />
            Updated {repo.lastCommit}
          </span>
          <span className={styles.repositoryOverview__metaSep} aria-hidden>
            ·
          </span>
          <span className={styles.repositoryOverview__metaItem}>
            <GitFork size={11} aria-hidden />
            {repo.prs} open PRs
          </span>
        </div>

        <hr
          className={styles.repositoryOverview__metaRule}
          aria-hidden="true"
        />

        <p className={styles.repositoryOverview__desc}>{repo.description}</p>
      </header>

      <div className={styles.repositoryOverview__metrics}>
        <MetricCard label="Stars" value={fmtNum(repo.stars)} sub="GitHub stars" />
        <MetricCard label="Forks" value={fmtNum(repo.forks)} sub="Total forks" />
        <MetricCard
          label="Open issues"
          value={repo.issues}
          sub={`${repo.prs} PRs open`}
        />
        <MetricCard
          label="Health"
          value={`${repo.health}%`}
          sub="Composite score"
          valueColor={healthColor(repo.health)}
        />
      </div>

      <div
        className={`${elevated.elevated} ${elevated.elevated_paddingComfortable} ${elevated.elevated_bgSecondary} ${elevated.elevated_mbBlock}`}
      >
        <div className={styles.repositoryOverview__chartTitle}>
          Commit activity — last 12 weeks
        </div>
        <CommitChart commits={repo.commits} />
        <div className={styles.repositoryOverview__chartAxis}>
          <span>12w ago</span>
          <span>This week</span>
        </div>
      </div>

      <div className={styles.repositoryOverview__agentSection}>
        <div className={styles.repositoryOverview__agentTitle}>Agent tasks</div>
        <p className={styles.repositoryOverview__agentCopy}>
          Trigger an AI agent to automate engineering workflows on this repository.
        </p>
        <button
          type="button"
          className={styles.repositoryOverview__runBtn}
          onClick={onRunTask}
        >
          <Play size={13} aria-hidden />
          Run Agent Task
        </button>
      </div>
    </section>
  );
}
