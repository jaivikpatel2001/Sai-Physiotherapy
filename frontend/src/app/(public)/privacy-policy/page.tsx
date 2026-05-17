import type { Metadata } from 'next';
import styles from './legal.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy | SAI Physiotherapy',
  description: 'How SAI Physiotherapy collects, uses, and protects your personal and health information.',
};

const SECTIONS = [
  { title: 'Information We Collect', body: 'We collect personal information you voluntarily provide when booking appointments, contacting us, or undergoing treatment — including name, contact details, medical history, and payment information necessary to deliver care.' },
  { title: 'How We Use Your Information', body: 'Your information is used solely to provide physiotherapy services, schedule appointments, communicate about your care, process payments, and comply with legal and regulatory requirements.' },
  { title: 'Medical Confidentiality', body: 'All clinical information is protected by medical confidentiality. Records are stored securely and shared only with treating clinicians or with your explicit written consent — never sold or used for marketing without permission.' },
  { title: 'Data Security', body: 'We use industry-standard security measures to protect your data, including encrypted storage, access controls, and regular security audits. No system is perfectly secure, but we work hard to safeguard your information.' },
  { title: 'Your Rights', body: 'You have the right to access, correct, or request deletion of your personal data, subject to legal record-keeping obligations for medical records. Contact us to exercise any of these rights.' },
  { title: 'Cookies', body: 'Our website uses essential cookies for functionality and analytics cookies to understand how visitors use the site. You can disable non-essential cookies in your browser settings.' },
  { title: 'Contact', body: 'For privacy questions or to exercise your rights, contact us at clinic@saiphysiotherapy.com.' },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={`${styles.heroMesh} hero-aura`} />
        <div className="container">
          <span className={styles.eyebrow}>Legal</span>
          <h1 className={styles.title}>
            <span className="gradient-text">Privacy Policy</span>
          </h1>
          <p className={styles.lastUpdated}>Last updated April 2026</p>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <div className={styles.layout}>
            <article className={styles.content}>
              {SECTIONS.map((s) => (
                <section key={s.title} id={slugify(s.title)} className={styles.section}>
                  <h2 className={styles.h2}>{s.title}</h2>
                  <p className={styles.p}>{s.body}</p>
                </section>
              ))}
            </article>

            <aside className={styles.toc}>
              <h3 className={styles.tocTitle}>On This Page</h3>
              <ul>
                {SECTIONS.map((s) => (
                  <li key={s.title}>
                    <a href={`#${slugify(s.title)}`}>
                      <i className="ri-arrow-right-s-line" /> {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
