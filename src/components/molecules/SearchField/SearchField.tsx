import { Search } from 'lucide-react';
import styles from './SearchField.module.css';

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  /** Dark panel (sidebar): light icon + dark input field. */
  variant?: 'default' | 'sidebarDark';
}

/** Controlled search input with leading icon (sidebar repo filter). */
export function SearchField({
  value,
  onChange,
  placeholder = 'Search repos…',
  id = 'repo-search',
  variant = 'default',
}: SearchFieldProps) {
  const rootClass =
    variant === 'sidebarDark'
      ? `${styles.searchField} ${styles['searchField--sidebarDark']}`
      : styles.searchField;

  return (
    <div className={rootClass}>
      <Search size={12} className={styles.searchField__icon} aria-hidden />
      <input
        id={id}
        type="search"
        className={styles.searchField__input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}
