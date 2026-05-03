import type { Repo } from '../../../types';
import {
  BRANCH_CONTEXT_OPTIONS,
  LANG_COLORS,
  type BranchContextOption,
} from '../../../data';
import { SearchField } from '../../molecules/SearchField/SearchField';
import { FilterChipGroup } from '../../molecules/FilterChipGroup/FilterChipGroup';
import { RepoListRow } from '../../molecules/RepoListRow/RepoListRow';
import styles from './Sidebar.module.css';

export interface SidebarProps {
  repos: Repo[];
  totalRepoCount: number;
  selectedId: string | undefined;
  search: string;
  onSearchChange: (v: string) => void;
  langFilter: string;
  onLangFilterChange: (v: string) => void;
  languageOptions: string[];
  /** Which branch / environment context agent tasks target (mock; same for all repos). */
  branchContext: BranchContextOption;
  onBranchContextChange: (value: BranchContextOption) => void;
  onSelectRepo: (repo: Repo) => void;
}

/**
 * Left rail: app title, macro workspace (branch) selector, repo search, language chips, list, footer.
 * Only `.sidebar__list` scrolls so header + chips stay visible (tutorial sidebar behavior).
 */
export function Sidebar({
  repos,
  totalRepoCount,
  selectedId,
  search,
  onSearchChange,
  langFilter,
  onLangFilterChange,
  languageOptions,
  branchContext,
  onBranchContextChange,
  onSelectRepo,
}: SidebarProps) {
  return (
    <aside className={styles.sidebar} aria-label="Repositories">
      <div className={styles.sidebar__header}>
        <div className={styles.sidebar__title}>DevAgent</div>
        <div className={styles.sidebar__branch}>
          <label
            htmlFor="sidebar-branch-context"
            className={styles.sidebar__branchLabel}
          >
            Workspace
          </label>
          <select
            id="sidebar-branch-context"
            className={styles.sidebar__branchSelect}
            value={branchContext}
            onChange={(e) =>
              onBranchContextChange(e.target.value as BranchContextOption)
            }
            aria-label="Workspace: main, development, or features (macro context for agent runs)"
          >
            {BRANCH_CONTEXT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <SearchField
          value={search}
          onChange={onSearchChange}
          variant="sidebarDark"
        />
      </div>

      <FilterChipGroup
        options={languageOptions}
        active={langFilter}
        onChange={onLangFilterChange}
        variant="sidebarDark"
      />

      <nav className={styles.sidebar__list} aria-label="Repository list">
        {repos.length === 0 ? (
          <p className={styles.sidebar__empty}>No repos match your filters.</p>
        ) : (
          repos.map((repo) => (
            <RepoListRow
              key={repo.id}
              repo={repo}
              selected={repo.id === selectedId}
              langColor={
                LANG_COLORS[repo.language] ?? 'var(--color-lang-dot-fallback)'
              }
              onSelect={onSelectRepo}
              variant="sidebarDark"
            />
          ))
        )}
      </nav>

      <footer className={styles.sidebar__footer}>
        {repos.length} of {totalRepoCount} repos
      </footer>
    </aside>
  );
}
