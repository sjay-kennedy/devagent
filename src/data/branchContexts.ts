/** Workspace / integration branch the portal assumes for agent runs (prototype; not per-repo in data). */
export const BRANCH_CONTEXT_OPTIONS = ['main', 'development', 'features'] as const;

export type BranchContextOption = (typeof BRANCH_CONTEXT_OPTIONS)[number];
