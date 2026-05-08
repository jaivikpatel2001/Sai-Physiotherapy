'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './gallery.module.css';

const ITEMS = [
  { icon: 'ri-hospital-line', label: 'Reception & Waiting Area', desc: 'Spacious, comfortable reception with helpful front-desk staff.', tint: 'sky', cat: 'Clinic' },
  { icon: 'ri-flashlight-line', label: 'Electrotherapy Bay', desc: 'Advanced IFT, TENS and ultrasound therapy equipment.', tint: 'sand', cat: 'Equipment' },
  { icon: 'ri-boxing-line', label: 'Exercise Therapy Room', desc: 'Fully equipped gym for active rehabilitation.', tint: 'mint', cat: 'Equipment' },
  { icon: 'ri-hotel-bed-line', label: 'Treatment Beds', desc: '10+ dedicated treatment bays for hands-on physiotherapy.', tint: 'blush', cat: 'Treatments' },
  { icon: 'ri-mental-health-line', label: 'Neuro Rehab Zone', desc: 'Specialized neurological rehab area with parallel bars.', tint: 'lavender', cat: 'Treatments' },
  { icon: 'ri-parent-line', label: 'Pediatric Section', desc: 'Child-friendly therapy space with playful equipment.', tint: 'sand', cat: 'Treatments' },
  { icon: 'ri-stethoscope-line', label: 'Consultation Rooms', desc: 'Private rooms for thorough patient assessment.', tint: 'sky', cat: 'Clinic' },
  { icon: 'ri-bar-chart-line', label: 'Posture Analysis Lab', desc: 'Advanced posture and gait evaluation facility.', tint: 'mint', cat: 'Equipment' },
  { icon: 'ri-microscope-line', label: 'Laser & Shockwave', desc: 'Laser, shockwave and spinal traction units.', tint: 'lavender', cat: 'Equipment' },
  { icon: 'ri-team-line', label: 'Our Team', desc: 'Doctors and assistants — your recovery partners.', tint: 'blush', cat: 'Team' },
  { icon: 'ri-graduation-cap-line', label: 'Patient Education Day', desc: 'Free monthly workshops for community wellness.', tint: 'mint', cat: 'Events' },
  { icon: 'ri-trophy-line', label: 'Awards & Recognition', desc: '15 years of trust and patient-care excellence.', tint: 'sky', cat: 'Events' },
];

const FILTERS = ['All', 'Clinic', 'Equipment', 'Treatments', 'Team', 'Events'];

export default function GalleryPage() {
  const [filter, setFilter] = useState('All');
  const filtered = useMemo(() => filter === 'All' ? ITEMS : ITEMS.filter((i) => i.cat === filter), [filter]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroMesh} />
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>Our Facility</p>
          <h1 className={styles.heroTitle}>Clinic <span className="gradient-text">Gallery</span></h1>
          <p className={styles.heroDesc}>
            Tour our 5,000 sq ft physiotherapy facility — equipped with the latest technology and a warm, welcoming team.
          </p>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <div className={styles.chipRow}>
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`${styles.chip} ${filter === f ? styles.chipActive : ''}`}
              >{f}</button>
            ))}
          </div>

          <div className={styles.masonry}>
            {filtered.map((item) => (
              <div key={item.label} className={`${styles.tile} ${styles[`tint_${item.tint}`]}`}>
                <i className={item.icon} />
                <h3>{item.label}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className={styles.cta}>
            <h2>Visit Us in Person</h2>
            <p>Schedule a free facility tour and meet our team.</p>
            <Link href="/contact" className={styles.ctaBtn}>
              Schedule a Visit <i className="ri-arrow-right-line" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
