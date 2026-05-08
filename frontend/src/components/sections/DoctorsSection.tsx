'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import styles from './DoctorsSection.module.css';

const DOCTORS = [
  {
    name: 'Dr. Rajesh Patel',
    title: 'Senior Physiotherapist & Director',
    qual: 'BPT, MPT (Orthopedics)',
    exp: '15+ Years',
    specialties: ['Spine Care', 'Sports Rehab', 'Ortho'],
    avatar: 'RP',
    color: 'var(--color-primary-50)',
  },
  {
    name: 'Dr. Anita Shah',
    title: 'Neuro Physiotherapy Specialist',
    qual: 'BPT, MPT (Neurology)',
    exp: '12+ Years',
    specialties: ['Paralysis', 'Stroke Rehab', 'Pediatrics'],
    avatar: 'AS',
    color: 'var(--color-sand-50)',
  },
  {
    name: 'Dr. Vikram Mehta',
    title: 'Sports & Orthopedic Physiotherapist',
    qual: 'BPT, MPT, Cert. Sports Physio',
    exp: '10+ Years',
    specialties: ['Sports Injury', 'Joint Care', 'Post-Op'],
    avatar: 'VM',
    color: 'var(--color-mint-50)',
  },
  {
    name: 'Dr. Meena Joshi',
    title: "Geriatric & Women's Health Specialist",
    qual: 'BPT, MPT (Geriatrics)',
    exp: '8+ Years',
    specialties: ['Elderly Care', 'Osteoporosis', 'Fall Prevention'],
    avatar: 'MJ',
    color: 'var(--color-blush-50)',
  },
];

export default function DoctorsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        <div className="section-header">
          <motion.p className="section-label" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
            Meet Our Experts
          </motion.p>
          <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
            Qualified <span>Physiotherapy</span> Specialists
          </motion.h2>
          <motion.p className="section-desc" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 }}>
            Our team of BPT & MPT qualified physiotherapists brings decades of combined experience
            across all physiotherapy specializations.
          </motion.p>
        </div>

        <div className={styles.grid}>
          {DOCTORS.map((doc, i) => (
            <motion.div
              key={doc.name}
              className={styles.card}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.cardTop} style={{ background: doc.color }}>
                <div className={styles.avatar}>{doc.avatar}</div>
                <div className={styles.expBadge}>
                  <i className="ri-award-line" style={{ fontSize: 12 }} />
                  {doc.exp}
                </div>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.name}>{doc.name}</h3>
                <p className={styles.title}>{doc.title}</p>
                <div className={styles.qual}>
                  <i className="ri-book-open-line" style={{ fontSize: 12 }} />
                  {doc.qual}
                </div>
                <div className={styles.specialties}>
                  {doc.specialties.map((s) => (
                    <span key={s} className={styles.specialty}>{s}</span>
                  ))}
                </div>
                <Link href="/book-appointment" className={styles.bookBtn}>
                  Book Appointment
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div className={styles.teamCta} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}>
          <Link href="/doctors" className={styles.viewTeamBtn}>
            Meet the Full Team <i className="ri-arrow-right-line" style={{ fontSize: 16, marginLeft: 4 }} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
