import type { Metadata } from 'next';
import styles from '../privacy-policy/legal.module.css';

export const metadata: Metadata = {
  title: 'Terms & Conditions | SAI Physiotherapy',
  description: 'The terms governing the use of SAI Physiotherapy services and website.',
};

const SECTIONS = [
  { title: 'Acceptance of Terms', body: 'By using our website or booking services with SAI Physiotherapy, you agree to these terms. If you do not agree, please do not use our services.' },
  { title: 'Services Provided', body: 'We provide physiotherapy assessment and treatment services. Outcomes vary by individual; we make no guarantee of specific results. All clinical recommendations are made by qualified physiotherapists.' },
  { title: 'Appointments & Cancellations', body: 'Appointments must be cancelled at least 4 hours in advance. Late cancellations and no-shows may incur a fee at our discretion. We reserve the right to reschedule when clinically necessary.' },
  { title: 'Payments', body: 'Payment is due at the time of service unless prior arrangements are agreed in writing. We accept cash, cards, UPI, and bank transfers. Outstanding dues may attract reasonable late fees.' },
  { title: 'Patient Responsibilities', body: 'You are responsible for providing accurate medical history, following clinical advice, and informing the team of any changes in your condition. Honest communication enables the best care.' },
  { title: 'Limitation of Liability', body: 'To the fullest extent permitted by law, our liability is limited to the cost of the services provided. We are not liable for indirect or consequential losses.' },
  { title: 'Website Use', body: 'Content on this website is for general information only and does not constitute medical advice. Always consult a qualified clinician for personal medical guidance.' },
  { title: 'Governing Law', body: 'These terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of the courts of Ahmedabad, Gujarat.' },
  { title: 'Contact', body: 'For questions about these terms, write to clinic@saiphysiotherapy.com.' },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={`${styles.heroMesh} hero-aura`} />
        <div className="container">
          <span className={styles.eyebrow}>Legal</span>
          <h1 className={styles.title}>
            <span className="gradient-text">Terms &amp; Conditions</span>
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
