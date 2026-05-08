import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Physiotherapy Clinic Gallery | SAI Physiotherapy Ahmedabad',
  description: 'Tour our state-of-the-art physiotherapy facility in Ahmedabad. See our advanced treatment equipment, therapy bays, and comfortable patient areas.',
};

const GALLERY_ITEMS = [
  { emoji: '🏥', label: 'Reception & Waiting Area', desc: 'Spacious and comfortable reception with helpful front-desk staff', color: '#EBF3FF' },
  { emoji: '⚡', label: 'Electrotherapy Bay', desc: 'Advanced IFT, TENS, and ultrasound therapy equipment', color: '#FEF3C7' },
  { emoji: '🏋️', label: 'Exercise Therapy Room', desc: 'Fully equipped gym for active rehabilitation exercises', color: '#D1FAE5' },
  { emoji: '🛏️', label: 'Treatment Beds', desc: '10+ dedicated treatment bays for hands-on physiotherapy', color: '#FCE7F3' },
  { emoji: '🧠', label: 'Neuro Rehab Zone', desc: 'Specialized area for neurological rehabilitation with parallel bars', color: '#DBEAFE' },
  { emoji: '👶', label: 'Pediatric Section', desc: 'Child-friendly therapy space with age-appropriate equipment', color: '#FFF7ED' },
  { emoji: '💊', label: 'Consultation Room', desc: 'Private consultation rooms for thorough patient assessment', color: '#ECFDF5' },
  { emoji: '📊', label: 'Posture Analysis Lab', desc: 'Advanced posture analysis and gait evaluation facility', color: '#EFF6FF' },
  { emoji: '🔬', label: 'Advanced Equipment', desc: 'Laser therapy, shockwave therapy, and spinal traction units', color: '#F5F3FF' },
];

export default function GalleryPage() {
  return (
    <div style={{ background: 'var(--color-bg)' }}>
      <div style={{ background: 'var(--gradient-primary)', padding: 'calc(var(--header-height) + 4rem) 0 4rem', textAlign: 'center' }}>
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>Our Facility</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'white', fontWeight: 800, margin: '0.75rem 0 1rem' }}>
            Clinic <span style={{ color: 'var(--color-accent-light)' }}>Gallery</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'var(--text-lg)', maxWidth: 560, margin: '0 auto' }}>
            Tour our state-of-the-art 5,000 sq ft physiotherapy facility equipped with the latest technology.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {GALLERY_ITEMS.map((item) => (
              <div key={item.label} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s' }}>
                <div style={{ background: item.color, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>
                  {item.emoji}
                </div>
                <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>{item.label}</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--gradient-primary)', borderRadius: 'var(--radius-xl)', padding: '4rem 3rem', textAlign: 'center', marginTop: '3rem', color: 'white' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h2)', marginBottom: '1rem' }}>Visit Us in Person</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'var(--text-lg)', marginBottom: '2rem' }}>Schedule a free facility tour and meet our expert physiotherapy team.</p>
            <Link href="/contact" style={{ display: 'inline-flex', padding: '1rem 2.5rem', background: 'var(--gradient-accent)', color: 'white', borderRadius: 999, fontWeight: 700, boxShadow: 'var(--shadow-gold)' }}>
              Contact Us to Schedule a Visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
