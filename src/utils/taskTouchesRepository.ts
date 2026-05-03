/**
 * Agent tasks that, in production, would typically write to Git
 * (branch commits, PRs, or lockfile/package changes).
 * Read-only style tasks (tests, security scan, code review) skip the approve/revert strip.
 */
const TASK_IDS_TOUCHING_REPO = new Set(['refactor', 'pr', 'deps']);

export function taskTouchesRepository(taskId: string): boolean {
  return TASK_IDS_TOUCHING_REPO.has(taskId);
}
