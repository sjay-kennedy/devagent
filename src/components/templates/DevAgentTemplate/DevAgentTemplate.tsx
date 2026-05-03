import type { ReactNode } from 'react';
import styles from './DevAgentTemplate.module.css';

export interface DevAgentTemplateProps {
  /** Left rail: repo search + list (navigation). */
  sidebar: ReactNode;
  /** Right pane: overview, task picker, or agent execution. */
  main: ReactNode;
}

/**
 * Page-level layout only — no business state.
 * Wraps sidebar + main so the prototype matches the tutorial wireframe (split view).
 */
export function DevAgentTemplate({ sidebar, main }: DevAgentTemplateProps) {
  return (
    <div className={styles.root}>
      <div className={styles.shell}>
        {sidebar}
        <div className={styles.main}>{main}</div>
      </div>
    </div>
  );
}
