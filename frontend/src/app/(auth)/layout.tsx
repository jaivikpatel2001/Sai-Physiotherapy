import styles from './auth.module.css';
import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      {/* Left panel */}
      <div className={styles.left}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}><Activity size={24} strokeWidth={2.5} /></div>
          <div>
            <p className={styles.logoName}>SAI Physiotherapy</p>
            <p className={styles.logoTag}>Staff Portal</p>
          </div>
        </div>
        <div className={styles.tagline}>
          <h2>Healing Hands,<br /><span>Trusted Care.</span></h2>
          <p>Secure access to the clinic management system for doctors, receptionists, and administrators.</p>
        </div>
        <div className={styles.features}>
          {['Patient Management & EMR', 'Appointment Scheduling', 'Billing & Invoicing', 'Analytics Dashboard', 'Treatment Session Logging'].map((f) => (
            <div key={f} className={styles.feature}>
              <span className={styles.featureDot} /> {f}
            </div>
          ))}
        </div>
        <div className={styles.leftFooter}>
          <Link href="/" className={styles.backHome}>← Back to website</Link>
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.right}>
        {children}
      </div>
    </div>
  );
}
