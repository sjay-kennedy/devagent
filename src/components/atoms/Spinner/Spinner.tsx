import styles from './Spinner.module.css';

/** Small indeterminate spinner for pending / running agent header. */
export function Spinner() {
  return (
    <span
      className={styles.spinner}
      role="status"
      aria-label="Loading"
    />
  );
}
