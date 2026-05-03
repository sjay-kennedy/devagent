import { useState } from 'react';
import type { BranchContextOption } from '../../../data';
import { BRANCH_CONTEXT_OPTIONS } from '../../../data';
import type { Repo } from '../../../types';
import elevated from '../../_shared/SurfaceCard.module.css';
import styles from './RefactorRunTarget.module.css';

const ENV_OPTIONS = [
  { value: 'staging', label: 'Staging' },
  { value: 'production', label: 'Production' },
] as const;

export interface RefactorRunTargetProps {
  repo: Repo;
  baseBranch: BranchContextOption;
  onBaseBranchChange: (value: BranchContextOption) => void;
  onConfirm: () => void;
}

/** Pre-run target controls for refactor; parent starts the stream after confirm. */
export function RefactorRunTarget({
  repo,
  baseBranch,
  onBaseBranchChange,
  onConfirm,
}: RefactorRunTargetProps) {
  const [environment, setEnvironment] =
    useState<(typeof ENV_OPTIONS)[number]['value']>('staging');

  return (
    <div
      className={`${elevated.elevated} ${elevated.elevated_paddingComfortable} ${elevated.elevated_bgSecondary} ${styles.wrap}`}
    >
      <fieldset className={styles.form}>
        <legend className="sr-only">Run target</legend>

        <div className={styles.field}>
          <span className={styles.label}>Repository</span>
          <span className={styles.valueReadonly}>{repo.owner}/{repo.name}</span>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="refactor-run-base-branch">
            Base branch
          </label>
          <select
            id="refactor-run-base-branch"
            className={styles.select}
            value={baseBranch}
            onChange={(e) =>
              onBaseBranchChange(e.target.value as BranchContextOption)
            }
          >
            {BRANCH_CONTEXT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="refactor-run-environment">
            Environment
          </label>
          <select
            id="refactor-run-environment"
            className={styles.select}
            value={environment}
            onChange={(e) =>
              setEnvironment(
                e.target.value as (typeof ENV_OPTIONS)[number]['value']
              )
            }
          >
            {ENV_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <button type="button" className={styles.confirmBtn} onClick={onConfirm}>
        Confirm Target &amp; Run Agent
      </button>
    </div>
  );
}
