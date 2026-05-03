/** Health score color for the metric card (uses CSS variables from global.css). */
export function healthColor(h: number): string {
  if (h >= 90) return 'var(--color-text-success)';
  if (h >= 75) return 'var(--color-text-warning)';
  return 'var(--color-text-danger)';
}
