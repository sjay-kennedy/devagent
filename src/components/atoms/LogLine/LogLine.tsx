import type { LogEntry } from '../../../types';
import styles from './LogLine.module.css';

const PREFIX: Record<string, string> = {
  info: '   ',
  warn: '⚠  ',
  error: '✕  ',
  success: '✓  ',
};

export interface LogLineProps {
  entry: LogEntry;
}

/** One monospace log row with timestamp + level prefix + message. */
export function LogLine({ entry }: LogLineProps) {
  // Dynamic BEM modifier from log level; default to info if an unknown level slips through.
  const levelClass = (styles[`logLine--${entry.level}`] ??
    styles['logLine--info']) as string;
  return (
    <div className={`${styles.logLine} ${levelClass}`}>
      <span className={styles.logLine__time}>{entry.ts}</span>
      {PREFIX[entry.level] ?? '   '}
      {entry.text}
      {entry.fileLink ? (
        <>
          {' '}
          <a
            href={entry.fileLink.href}
            className={styles.logLine__link}
            onClick={(e) => e.preventDefault()}
            title="Prototype: would open this file in the host or editor."
          >
            {entry.fileLink.label}
          </a>
        </>
      ) : null}
    </div>
  );
}
