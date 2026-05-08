import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Physiotherapy Clinic Gallery | SAI Physiotherapy Ahmedabad',
  description: 'Tour our state-of-the-art physiotherapy facility in Ahmedabad. See our advanced treatment equipment, therapy bays, and comfortable patient areas.',
};

const GALLERY_ITEMS = [
  { icon: 'ri-hospital-line', label: 'Reception & Waiting Area', desc: 'Spacious and comfortable reception with helpful front-desk staff', color: 'var(--color-primary-50)' },
  { icon: 'ri-flashlight-line', label: 'Electrotherapy Bay', desc: 'Advanced IFT, TENS, and ultrasound therapy equipment', color: 'var(--color-sand-50)' },
  { icon: 'ri-boxing-line', label: 'Exercise Therapy Room', desc: 'Fully equipped gym for active rehabilitation exercises', color: 'var(--color-mint-50)' },
  { icon: 'ri-hotel-bed-line', label: 'Treatment Beds', desc: '10+ dedicated treatment bays for hands-on physiotherapy', color: 'var(--color-blush-50)' },
  { icon: 'ri-mental-health-line', label: 'Neuro Rehab Zone', desc: 'Specialized area for neurological rehabilitation with parallel bars', color: 'var(--color-primary-50)' },
  { icon: 'ri-parent-line', label: 'Pediatric Section', desc: 'Child-friendly therapy space with age-appropriate equipment', color: 'var(--color-sand-50)' },
  { icon: 'ri-stethoscope-line', label: 'Consultation Room', desc: 'Private consultation rooms for thorough patient assessment', color: 'var(--color-mint-50)' },
  { icon: 'ri-bar-chart-line', label: 'Posture Analysis Lab', desc: 'Advanced posture analysis and gait evaluation facility', color: 'var(--color-primary-50)' },
  { icon: 'ri-microscope-line', label: 'Advanced Equipment', desc: 'Laser therapy, shockwave therapy, and spinal traction units', color: 'var(--color-lavender-50)' },
];

export default function GalleryPage() {
  return (
    <div style={{ background: 'var(--color-bg)' }}>
      <div style={{ background: 'var(--gradient-hero)', padding: 'calc(var(--header-height) + 4rem) 0 4rem', textAlign: 'center' }}>
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>Our Facility</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text)', fontWeight: 700, margin: '0.75rem 0 1rem', letterSpacing: '-0.02em' }}>
            Clinic <span style={{ color: 'var(--color-primary)' }}>Gallery</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', maxWidth: 560, margin: '0 auto' }}>
            Tour our state-of-the-art 5,000 sq ft physiotherapy facility equipped with the latest technology.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {GALLERY_ITEMS.map((item) => (
              <div key={item.label} style={{ background: 'white', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)', transition: 'transform 0.25s, box-shadow 0.25s' }}>
                <div style={{ background: item.color, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={item.icon} style={{ fontSize: 72, color: 'var(--color-primary)', opacity: 0.55 }} />
                </div>
                <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>{item.label}</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--gradient-soft)', borderRadius: 'var(--radius-xl)', padding: '4rem 3rem', textAlign: 'center', marginTop: '3rem', border: '1px solid var(--color-border-light)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h2)', marginBottom: '1rem', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Visit Us in Person</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', marginBottom: '2rem' }}>Schedule a free facility tour and meet our expert physiotherapy team.</p>
            <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2.5rem', background: 'var(--gradient-primary)', color: 'white', borderRadius: 999, fontWeight: 600, boxShadow: 'var(--shadow-blue)' }}>
              Contact Us to Schedule a Visit <i className="ri-arrow-right-line" style={{ fontSize: 16 }} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
