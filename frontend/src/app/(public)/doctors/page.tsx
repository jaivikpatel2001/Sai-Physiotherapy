import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Doctors & Physiotherapists | SAI Physiotherapy Team',
  description: 'Meet our team of qualified BPT & MPT physiotherapists with 8-15+ years of expertise across all specializations.',
};

const DOCTORS = [
  { name: 'Dr. Rajesh Patel', title: 'Senior Physiotherapist & Director', qual: 'BPT, MPT (Orthopedics)', exp: '15+ Years', specialties: ['Spine Care', 'Sports Rehab', 'Ortho'], avatar: 'RP', color: '#EBF3FF' },
  { name: 'Dr. Anita Shah', title: 'Neuro Physiotherapy Specialist', qual: 'BPT, MPT (Neurology)', exp: '12+ Years', specialties: ['Paralysis', 'Stroke Rehab', 'Pediatrics'], avatar: 'AS', color: '#FEF3C7' },
  { name: 'Dr. Vikram Mehta', title: 'Sports & Orthopedic Physiotherapist', qual: 'BPT, MPT, Cert. Sports Physio', exp: '10+ Years', specialties: ['Sports Injury', 'Joint Care', 'Post-Op'], avatar: 'VM', color: '#D1FAE5' },
  { name: 'Dr. Meena Joshi', title: 'Geriatric & Women\'s Health Specialist', qual: 'BPT, MPT (Geriatrics)', exp: '8+ Years', specialties: ['Elderly Care', 'Osteoporosis', 'Fall Prevention'], avatar: 'MJ', color: '#FCE7F3' },
  { name: 'Dr. Suresh Nair', title: 'Pediatric Physiotherapy Specialist', qual: 'BPT, MPT (Pediatrics)', exp: '9+ Years', specialties: ['Cerebral Palsy', 'Developmental Delay', 'Scoliosis'], avatar: 'SN', color: '#DBEAFE' },
  { name: 'Dr. Priya Desai', title: 'Musculoskeletal Physiotherapist', qual: 'BPT, MPT, MIAP', exp: '7+ Years', specialties: ['Neck Pain', 'Shoulder', 'Frozen Shoulder'], avatar: 'PD', color: '#F5F3FF' },
];

const cardStyle = {
  background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
  transition: 'transform 0.25s, box-shadow 0.25s', display: 'flex', flexDirection: 'column' as const,
};

export default function DoctorsPage() {
  return (
    <div style={{ background: 'var(--color-bg)' }}>
      <div style={{ background: 'var(--gradient-primary)', padding: 'calc(var(--header-height) + 4rem) 0 4rem', textAlign: 'center' }}>
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>Our Experts</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'white', fontWeight: 800, margin: '0.75rem 0 1rem' }}>
            Meet Our <span style={{ color: 'var(--color-accent-light)' }}>Specialists</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'var(--text-lg)', maxWidth: 560, margin: '0 auto' }}>
            BPT & MPT qualified physiotherapists with decades of combined expertise.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {DOCTORS.map((doc) => (
              <div key={doc.name} style={cardStyle}>
                <div style={{ background: doc.color, padding: '2.5rem 1.5rem 2rem', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ width: 88, height: 88, background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 800, color: 'white', border: '4px solid white', boxShadow: 'var(--shadow-blue)' }}>{doc.avatar}</div>
                  <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(27,79,138,0.1)', color: 'var(--color-primary)', padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, border: '1px solid rgba(27,79,138,0.2)' }}>{doc.exp}</span>
                </div>
                <div style={{ padding: '1.25rem 1.5rem 1.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)' }}>{doc.name}</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-primary-light)', fontWeight: 500 }}>{doc.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{doc.qual}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem', justifyContent: 'center' }}>
                    {doc.specialties.map((s) => (
                      <span key={s} style={{ padding: '3px 10px', background: 'var(--color-primary-50)', color: 'var(--color-primary)', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700 }}>{s}</span>
                    ))}
                  </div>
                  <Link href="/book-appointment" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1rem', background: 'var(--gradient-primary)', color: 'white', borderRadius: 999, fontWeight: 700, fontSize: '0.875rem', marginTop: '0.5rem', boxShadow: 'var(--shadow-blue)' }}>
                    Book Appointment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
