import type { Metadata } from 'next';

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

export default function TermsPage() {
  return (
    <div style={{ background: 'var(--color-bg)' }}>
      <div style={{ background: 'var(--gradient-hero)', padding: 'calc(var(--header-height) + 3rem) 0 3rem', textAlign: 'center' }}>
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>Legal</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', fontWeight: 700, letterSpacing: '-0.025em', margin: '0.75rem 0 0.5rem' }}>Terms &amp; Conditions</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Last updated April 2026</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          {SECTIONS.map((s) => (
            <div key={s.title} style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 'var(--space-3)' }}>{s.title}</h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text)', lineHeight: 1.75 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
