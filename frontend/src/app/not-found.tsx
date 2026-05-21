import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.desc}>The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className={styles.actions}>
          <Link href="/" className={styles.homeBtn}>Go Home</Link>
          <Link href="/services" className={styles.servicesBtn}>View Services</Link>
        </div>
      </div>
    </div>
  );
}
