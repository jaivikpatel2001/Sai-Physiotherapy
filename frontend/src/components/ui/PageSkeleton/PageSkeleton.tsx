/**
 * Shared loading skeleton used by every route segment's `loading.tsx`.
 *
 * Streamed instantly while the server compiles/renders the page — gives the
 * user a "page is loading" signal without holding the browser at the
 * previous screen. Pure server component, no client JS.
 */
import styles from './PageSkeleton.module.css';

interface Props {
  /** Whether to render a hero block at the top (default true). */
  hero?: boolean;
  /** Number of body rows of skeleton text. */
  rows?: number;
  /** Override the visual variant. */
  variant?: 'public' | 'article' | 'admin';
}

export default function PageSkeleton({ hero = true, rows = 6, variant = 'public' }: Props = {}) {
  if (variant === 'admin') {
    return (
      <div className={styles.adminWrap} aria-busy="true" aria-label="Loading">
        <div className={styles.adminHeader}>
          <div className={styles.bar} style={{ width: '180px', height: 24 }} />
          <div className={styles.bar} style={{ width: '120px', height: 36 }} />
        </div>
        <div className={styles.adminGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.kpiCard} />
          ))}
        </div>
        <div className={styles.adminTable} />
      </div>
    );
  }

  if (variant === 'article') {
    return (
      <article className={styles.articleWrap} aria-busy="true" aria-label="Loading article">
        <div className={styles.bar} style={{ width: '120px', height: 18, marginBottom: 20 }} />
        <div className={styles.bar} style={{ width: '85%', height: 40, marginBottom: 12 }} />
        <div className={styles.bar} style={{ width: '70%', height: 40, marginBottom: 28 }} />
        <div className={styles.heroImg} />
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={styles.bar}
            style={{
              width: `${85 - (i % 3) * 8}%`,
              height: 14,
              marginBottom: 14,
            }}
          />
        ))}
      </article>
    );
  }

  return (
    <div aria-busy="true" aria-label="Loading">
      {hero && (
        <section className={styles.heroSection}>
          <div className={styles.bar} style={{ width: 140, height: 16, margin: '0 auto 16px' }} />
          <div className={styles.bar} style={{ width: '70%', height: 48, margin: '0 auto 12px' }} />
          <div className={styles.bar} style={{ width: '50%', height: 18, margin: '0 auto' }} />
        </section>
      )}
      <section className={styles.bodySection}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={styles.bar}
            style={{
              width: `${90 - (i % 3) * 10}%`,
              height: 14,
              marginBottom: 14,
            }}
          />
        ))}
      </section>
    </div>
  );
}
