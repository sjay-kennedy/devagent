/** Compact star/fork counts for the sidebar (e.g. 1247 → "1.2k"). */
export function fmtNum(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}
