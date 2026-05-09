'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './doctors.module.css';

const DOCTORS = [
  { name: 'Dr. Rajesh Patel', title: 'Senior Physiotherapist & Director', qual: 'BPT, MPT (Orthopedics)', exp: '15+ Years', specialties: ['Spine Care', 'Sports Rehab', 'Orthopedics'], avatar: 'RP', image: '/images/doctors/doctor_rajesh_patel.png' },
  { name: 'Dr. Anita Shah', title: 'Neuro Physiotherapy Specialist', qual: 'BPT, MPT (Neurology)', exp: '12+ Years', specialties: ['Neuro Rehab', 'Stroke Rehab', 'Pediatrics'], avatar: 'AS', image: '/images/doctors/doctor_anita_shah.png' },
  { name: 'Dr. Vikram Mehta', title: 'Sports & Orthopedic Physiotherapist', qual: 'BPT, MPT, Cert. Sports Physio', exp: '10+ Years', specialties: ['Sports Rehab', 'Orthopedics', 'Post-Op'], avatar: 'VM', image: '/images/doctors/doctor_vikram_mehta.png' },
  { name: 'Dr. Meena Joshi', title: 'Geriatric & Women\'s Health Specialist', qual: 'BPT, MPT (Geriatrics)', exp: '8+ Years', specialties: ['Elderly Care', 'Women\'s Health'], avatar: 'MJ', image: '/images/doctors/doctor_meena_joshi.png' },
  { name: 'Dr. Suresh Nair', title: 'Pediatric Physiotherapy Specialist', qual: 'BPT, MPT (Pediatrics)', exp: '9+ Years', specialties: ['Pediatrics', 'Neuro Rehab'], avatar: 'SN', image: '/images/doctors/doctor_suresh_nair.jpg' },
  { name: 'Dr. Priya Desai', title: 'Musculoskeletal Physiotherapist', qual: 'BPT, MPT, MIAP', exp: '7+ Years', specialties: ['Orthopedics', 'Spine Care'], avatar: 'PD', image: '/images/doctors/doctor_priya_desai.png' },
];

const SPECIALTIES = ['All', 'Spine Care', 'Orthopedics', 'Neuro Rehab', 'Sports Rehab', 'Pediatrics', 'Elderly Care'];

export default function DoctorsPage() {
  const [filter, setFilter] = useState('All');
  const filtered = useMemo(
    () => filter === 'All' ? DOCTORS : DOCTORS.filter((d) => d.specialties.includes(filter)),
    [filter],
  );

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroMesh} />
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>Our Experts</p>
          <h1 className={styles.heroTitle}>Meet Our <span className="gradient-text">Specialists</span></h1>
          <p className={styles.heroDesc}>BPT &amp; MPT qualified physiotherapists with decades of combined expertise.</p>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <div className={styles.chipRow}>
            {SPECIALTIES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`${styles.chip} ${filter === s ? styles.chipActive : ''}`}
              >{s}</button>
            ))}
          </div>

          <div className={styles.grid}>
            {filtered.map((doc) => (
              <div key={doc.name} className={styles.card}>
                <div className={styles.avatarBg}>
                  <div className={styles.portrait}>
                    <Image
                      src={doc.image}
                      alt={`${doc.name}, ${doc.title}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      style={{ objectFit: 'cover', objectPosition: 'top center' }}
                    />
                  </div>
                  <span className={styles.expBadge}>{doc.exp}</span>
                </div>
                <div className={styles.cardBody}>
                  <h2 className={styles.docName}>{doc.name}</h2>
                  <p className={styles.docTitle}>{doc.title}</p>
                  <p className={styles.docQual}>{doc.qual}</p>
                  <div className={styles.specs}>
                    {doc.specialties.map((s) => (
                      <span key={s} className={styles.specChip}>{s}</span>
                    ))}
                  </div>
                  <div className={styles.actions}>
                    <Link href="/book-appointment" className={styles.bookBtn}>
                      Book Appointment <i className="ri-arrow-right-line" />
                    </Link>
                    <a href="mailto:clinic@saiphysiotherapy.com" className={styles.mailBtn} aria-label="Email doctor">
                      <i className="ri-mail-line" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className={styles.empty}>
              <i className="ri-user-search-line" />
              <p>No specialists match this filter yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
