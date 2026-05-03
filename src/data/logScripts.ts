import type { LogScriptEntry } from '../types';

/**
 * Fake log lines per task id. The UI streams these on an interval.
 * If any line uses level `error`, the run ends in `failure` (see App streaming effect).
 */
export const LOG_SCRIPTS: Record<string, LogScriptEntry[]> = {
  pr: [
    { level: 'info', text: 'Initializing agent workspace...' },
    { level: 'info', text: 'Cloning acme-corp/api-gateway @ main' },
    { level: 'info', text: 'Analyzing diff between HEAD~5..HEAD' },
    { level: 'info', text: 'Identified 3 modified modules' },
    { level: 'info', text: 'Generating PR title and description...' },
    { level: 'success', text: 'PR #142 title: "feat: add circuit breaker"' },
    { level: 'info', text: 'Adding reviewers: @alice, @carol' },
    { level: 'info', text: 'Setting labels: enhancement, needs-review' },
    { level: 'success', text: 'PR #142 created and ready for review ✓' },
  ],
  refactor: [
    { level: 'info', text: 'Initializing refactor agent...' },
    { level: 'info', text: 'Running static analysis (eslint + sonarjs)' },
    { level: 'warn', text: 'Found 14 code smell patterns' },
    { level: 'info', text: 'Extracting utility functions from routes.ts' },
    { level: 'info', text: 'Inlining unnecessary abstractions...' },
    { level: 'warn', text: 'Skipped 2 patterns — manual review needed' },
    { level: 'info', text: 'Running type-check post-refactor...' },
    { level: 'success', text: 'Type-check passed — 0 errors' },
    { level: 'success', text: 'Refactor complete. 12 of 14 patterns fixed ✓' },
  ],
  tests: [
    { level: 'info', text: 'Initializing test runner...' },
    { level: 'info', text: 'Cloning acme-corp/api-gateway @ main' },
    { level: 'info', text: 'Installing dependencies (npm ci)...' },
    { level: 'info', text: 'Running jest --coverage --ci' },
    { level: 'success', text: 'PASS src/routes.test.ts (4 tests)' },
    { level: 'warn', text: 'SKIP src/cache.test.ts — no mocks defined' },
    { level: 'success', text: 'PASS src/middleware.test.ts (8 tests)' },
    { level: 'error', text: 'FAIL src/upstream.test.ts — timeout 5000ms' },
    { level: 'warn', text: 'Coverage: 78.4% (target 80%) · 1 failure' },
  ],
  deps: [
    { level: 'info', text: 'Initializing dependency scanner...' },
    { level: 'info', text: 'Reading package.json (64 dependencies)' },
    { level: 'info', text: 'Querying npm registry for updates...' },
    { level: 'warn', text: 'express 4.17.1 → 4.19.2 (security patch)' },
    { level: 'warn', text: 'lodash 4.17.19 → 4.17.21 (low CVE)' },
    { level: 'error', text: 'axios 0.21.1 → 1.6.0 (BREAKING + CVE-2023-45857)' },
    { level: 'info', text: 'Generating upgrade PR with migration notes...' },
    { level: 'success', text: 'Audit complete. 3 updates recommended.' },
  ],
  security: [
    { level: 'info', text: 'Starting SAST security scan...' },
    { level: 'info', text: 'Scanning for hardcoded secrets...' },
    { level: 'success', text: 'No secrets found in source files ✓' },
    { level: 'info', text: 'Checking for SQL injection patterns...' },
    { level: 'success', text: 'No injection vectors found ✓' },
    { level: 'info', text: 'Checking for XSS patterns...' },
    { level: 'warn', text: 'Potential XSS — admin/render.ts:L44' },
    { level: 'info', text: 'Running CVE database lookup...' },
    { level: 'warn', text: 'Scan complete. 1 medium-severity finding.' },
  ],
  review: [
    { level: 'info', text: 'Fetching last 10 commits from main...' },
    { level: 'info', text: 'Analyzing changes across 8 files...' },
    { level: 'info', text: 'Reviewing: a4f3c91 "add rate limiting"' },
    { level: 'warn', text: 'routes.ts:L87 — extract RateLimiter config' },
    { level: 'info', text: 'Reviewing: 2d8b441 "fix memory leak"' },
    { level: 'success', text: 'Good fix — clears interval correctly ✓' },
    { level: 'warn', text: 'middleware.ts:L34 — missing error boundary' },
    { level: 'info', text: 'Generating review summary...' },
    { level: 'success', text: 'Review complete. 2 suggestions, 1 approval.' },
  ],
};
