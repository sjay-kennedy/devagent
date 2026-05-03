import styles from './FilterChipGroup.module.css';

export interface FilterChipGroupProps {
  /** Chip labels in display order; first is usually "All". */
  options: string[];
  active: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'sidebarDark';
}

/** Language filter chips: short labels for TS/JS to save horizontal space. */
function displayLabel(lang: string): string {
  if (lang === 'TypeScript') return 'TS';
  if (lang === 'JavaScript') return 'JS';
  return lang;
}

export function FilterChipGroup({
  options,
  active,
  onChange,
  variant = 'default',
}: FilterChipGroupProps) {
  const rootClass =
    variant === 'sidebarDark'
      ? `${styles.filterChipGroup} ${styles['filterChipGroup--sidebarDark']}`
      : styles.filterChipGroup;

  return (
    <div
      className={rootClass}
      role="group"
      aria-label="Filter by language"
    >
      {options.map((lang) => {
        const isActive = lang === active;
        return (
          <button
            key={lang}
            type="button"
            className={`${styles.filterChipGroup__chip} ${
              isActive
                ? styles['filterChipGroup__chip--active']
                : styles['filterChipGroup__chip--inactive']
            }`}
            onClick={() => onChange(lang)}
            aria-pressed={isActive}
          >
            {displayLabel(lang)}
          </button>
        );
      })}
    </div>
  );
}
