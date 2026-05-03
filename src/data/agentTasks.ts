import {
  GitPullRequest,
  Code2,
  Terminal,
  Package,
  Shield,
  Eye,
} from 'lucide-react';
import type { AgentTask } from '../types';

/** Six canned agent jobs shown in the task picker. */
export const AGENT_TASKS: AgentTask[] = [
  {
    id: 'pr',
    name: 'Create PR',
    description:
      'Draft a PR with AI-generated description, changelog, and suggested reviewers.',
    Icon: GitPullRequest,
  },
  {
    id: 'refactor',
    name: 'Refactor Code',
    description:
      'Detect code smells, extract functions, and apply automated refactoring safely.',
    Icon: Code2,
  },
  {
    id: 'tests',
    name: 'Run Tests',
    description:
      'Execute the full test suite with root cause analysis and coverage report.',
    Icon: Terminal,
  },
  {
    id: 'deps',
    name: 'Dep Audit',
    description:
      'Scan for outdated or vulnerable dependencies and generate an upgrade PR.',
    Icon: Package,
  },
  {
    id: 'security',
    name: 'Security Scan',
    description:
      'Run SAST analysis to detect injection flaws, exposed secrets, and CVEs.',
    Icon: Shield,
  },
  {
    id: 'review',
    name: 'Code Review',
    description:
      'AI-powered review of recent commits with inline suggestions and approval status.',
    Icon: Eye,
  },
];
