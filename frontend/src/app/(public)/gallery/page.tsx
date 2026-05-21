'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './gallery.module.css';

type Item = { src: string; label: string; desc: string; cat: string };

const ITEMS: Item[] = [
  { src: '/images/clinic/clinic_reception.png', label: 'Reception', desc: 'A warm welcome — spacious reception with helpful front-desk staff.', cat: 'Clinic' },
  { src: '/images/clinic/clinic_consultation_room.png', label: 'Consultation Room', desc: 'Private rooms for thorough patient assessment and discussion.', cat: 'Clinic' },
  { src: '/images/clinic/clinic_treatment_room.png', label: 'Treatment Room', desc: 'Dedicated treatment bays for hands-on physiotherapy.', cat: 'Clinic' },
  { src: '/images/clinic/clinic_electrotherapy.png', label: 'Electrotherapy', desc: 'Advanced IFT, TENS and ultrasound therapy equipment.', cat: 'Clinic' },
  { src: '/images/clinic/clinic_gym_rehab.png', label: 'Gym & Rehab Floor', desc: 'Fully equipped gym for progressive active rehabilitation.', cat: 'Clinic' },
  { src: '/images/therapy/back_pain_treatment.png', label: 'Back Pain Therapy', desc: 'Manual therapy and targeted exercise for chronic back pain.', cat: 'Treatments' },
  { src: '/images/therapy/exercise_rehab_session.png', label: 'Rehab Session', desc: 'A typical progressive rehabilitation session in our gym.', cat: 'Treatments' },
  { src: '/images/therapy/consultation_doctor_patient.png', label: 'Doctor Consultation', desc: 'One-on-one assessment and treatment planning.', cat: 'Treatments' },
  { src: '/images/therapy/therapy_pediatric.png', label: 'Pediatric Care', desc: 'Gentle, play-based therapy for children.', cat: 'Treatments' },
  { src: '/images/gallery/gallery_team_event.png', label: 'Team Event', desc: 'Our team building a culture of compassion and excellence.', cat: 'Events' },
];

const FILTERS = ['All', 'Clinic', 'Treatments', 'Events'];

export default function GalleryPage() {
  const [filter, setFilter] = useState('All');
  const filtered = useMemo(() => filter === 'All' ? ITEMS : ITEMS.filter((i) => i.cat === filter), [filter]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={`${styles.heroMesh} hero-aura`} />
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

          <div className={styles.grid}>
            {filtered.map((item) => (
              <figure key={item.label} className={styles.tile}>
                <div className={styles.tileImage}>
                  <Image
                    src={item.src}
                    alt={item.label}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                  <span className={styles.tileCat}>{item.cat}</span>
                </div>
                <figcaption className={styles.tileBody}>
                  <h3>{item.label}</h3>
                  <p>{item.desc}</p>
                </figcaption>
              </figure>
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
