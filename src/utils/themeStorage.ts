export const DA_THEME_STORAGE_KEY = 'da-theme';

export type DaTheme = 'light' | 'dark';

export function readStoredTheme(): DaTheme {
  try {
    const v = localStorage.getItem(DA_THEME_STORAGE_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* private mode */
  }
  return 'dark';
}

export function applyThemeToDocument(theme: DaTheme): void {
  document.documentElement.setAttribute('data-theme', theme);
}
