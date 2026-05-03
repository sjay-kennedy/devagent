import { Star, AlertCircle } from 'lucide-react';
import type { Repo } from '../../../types';
import { fmtNum } from '../../../utils/format';
import styles from './RepoListRow.module.css';

export interface RepoListRowProps {
  repo: Repo;
  selected: boolean;
  langColor: string;
  onSelect: (repo: Repo) => void;
  variant?: 'default' | 'sidebarDark';
}

/** One selectable repo row in the sidebar list. */
export function RepoListRow({
  repo,
  selected,
  langColor,
  onSelect,
  variant = 'default',
}: RepoListRowProps) {
  const rowClasses = [
    styles.repoListRow,
    variant === 'sidebarDark' ? styles['repoListRow--sidebarDark'] : '',
    selected && variant === 'sidebarDark'
      ? styles['repoListRow--selectedDark']
      : selected
        ? styles['repoListRow--selected']
        : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={rowClasses}
      onClick={() => onSelect(repo)}
      aria-current={selected ? 'true' : undefined}
    >
      <div className={styles.repoListRow__top}>
        <span
          className={styles.repoListRow__langDot}
          style={{ background: langColor }}
          aria-hidden
        />
        <span className={styles.repoListRow__name}>{repo.name}</span>
      </div>
      <div className={styles.repoListRow__meta}>
        <span className={styles.repoListRow__metaItem}>
          <Star size={9} aria-hidden />
          {fmtNum(repo.stars)}
        </span>
        <span className={styles.repoListRow__metaItem}>
          <AlertCircle size={9} aria-hidden />
          {repo.issues}
        </span>
        <span>{repo.lastCommit}</span>
      </div>
    </button>
  );
}
