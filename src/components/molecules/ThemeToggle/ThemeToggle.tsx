import { useCallback, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import {
  DA_THEME_STORAGE_KEY,
  type DaTheme,
} from '../../../utils/themeStorage';
import styles from './ThemeToggle.module.css';

function themeFromDocument(): DaTheme {
  const t = document.documentElement.getAttribute('data-theme');
  return t === 'light' ? 'light' : 'dark';
}

/** Accessible theme control: `role="switch"`, syncs `data-theme` on `<html>`, persists choice. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<DaTheme>(themeFromDocument);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(DA_THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const isLight = theme === 'light';
  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <button
      type="button"
      className={styles.toggle}
      role="switch"
      aria-checked={isLight}
      aria-label={
        isLight
          ? 'Color theme: light. Switch to dark theme.'
          : 'Color theme: dark. Switch to light theme.'
      }
      onClick={toggle}
    >
      {isLight ? (
        <Sun className={styles.toggle__icon} size={18} strokeWidth={2} aria-hidden />
      ) : (
        <Moon className={styles.toggle__icon} size={18} strokeWidth={2} aria-hidden />
      )}
      <span className={styles.toggle__label}>{isLight ? 'Light' : 'Dark'}</span>
    </button>
  );
}
