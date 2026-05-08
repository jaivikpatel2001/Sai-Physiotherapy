import type { Metadata } from 'next';

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

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: 'var(--color-bg)' }}>
      <div style={{ background: 'var(--gradient-hero)', padding: 'calc(var(--header-height) + 3rem) 0 3rem', textAlign: 'center' }}>
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>Legal</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', fontWeight: 700, letterSpacing: '-0.025em', margin: '0.75rem 0 0.5rem' }}>Privacy Policy</h1>
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
