import type { ReactNode } from 'react';
import styles from './DevAgentTemplate.module.css';

export interface DevAgentTemplateProps {
  /** Right side of the app header (e.g. theme toggle). */
  headerTrailing?: ReactNode;
  /** Left rail: repo search + list (navigation). */
  sidebar: ReactNode;
  /** Right pane: overview, task picker, or agent execution. */
  main: ReactNode;
}

/**
 * Full-page layout: masthead, repo + main split (scrolls within panes), footer slot.
 */
export function DevAgentTemplate({
  headerTrailing,
  sidebar,
  main,
}: DevAgentTemplateProps) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.logo}>DevAgent</div>
        {headerTrailing ? (
          <div className={styles.headerRight}>{headerTrailing}</div>
        ) : null}
      </header>
      <div className={styles.body}>
        <div className={styles.shell}>
          {sidebar}
          <div className={styles.main}>{main}</div>
        </div>
      </div>
      <footer className={styles.footer} />
    </div>
  );
}
