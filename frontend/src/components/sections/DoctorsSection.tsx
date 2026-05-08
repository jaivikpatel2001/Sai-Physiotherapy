'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import styles from './DoctorsSection.module.css';

const DOCTORS = [
  {
    name: 'Dr. Rajesh Patel',
    title: 'Spine & Ortho Specialist',
    qual: 'BPT, MPT (Orthopedics)',
    exp: '15+ yrs',
    languages: ['English', 'हिंदी', 'ગુજરાતી'],
    available: 'Available today',
    availableType: 'today',
    avatar: 'RP',
    color: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
  },
  {
    name: 'Dr. Anita Shah',
    title: 'Neuro Physiotherapist',
    qual: 'BPT, MPT (Neurology)',
    exp: '12+ yrs',
    languages: ['English', 'हिंदी'],
    available: 'Mon, Wed, Fri',
    availableType: 'schedule',
    avatar: 'AS',
    color: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
  },
  {
    name: 'Dr. Vikram Mehta',
    title: 'Sports & Joint Care',
    qual: 'BPT, MPT, Sports Cert.',
    exp: '10+ yrs',
    languages: ['English', 'हिंदी', 'ગુજરાતી'],
    available: 'Available today',
    availableType: 'today',
    avatar: 'VM',
    color: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
  },
  {
    name: 'Dr. Meena Joshi',
    title: 'Geriatric & Women\'s Health',
    qual: 'BPT, MPT (Geriatrics)',
    exp: '8+ yrs',
    languages: ['English', 'ગુજરાતી'],
    available: 'Tue, Thu, Sat',
    availableType: 'schedule',
    avatar: 'MJ',
    color: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
  },
];

export default function DoctorsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        <div className="section-header">
          <motion.span className="section-label" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
            Meet Our Experts
          </motion.span>
          <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
            Qualified <span>Physiotherapy</span> Specialists
          </motion.h2>
          <motion.p className="section-desc" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 }}>
            Our team of BPT &amp; MPT qualified physiotherapists brings decades of combined experience
            across all physiotherapy specializations.
          </motion.p>
        </div>

        <div className={styles.grid}>
          {DOCTORS.map((doc, i) => (
            <motion.div
              key={doc.name}
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.portrait} style={{ background: doc.color }}>
                <div className={styles.expBadge}>
                  <i className="ri-award-line" style={{ fontSize: 12 }} />
                  {doc.exp}
                </div>
                <div className={styles.avatar}>{doc.avatar}</div>
              </div>

              <div className={styles.body}>
                <h3 className={styles.name}>{doc.name}</h3>
                <span className={styles.specChip}>
                  <i className="ri-stethoscope-line" style={{ fontSize: 12 }} /> {doc.title}
                </span>
                <p className={styles.qual}>{doc.qual}</p>

                <div className={styles.languages}>
                  {doc.languages.map((l) => (
                    <span key={l} className={styles.langChip}>{l}</span>
                  ))}
                </div>

                <div className={`${styles.availability} ${doc.availableType === 'today' ? styles.availToday : styles.availSchedule}`}>
                  <span className={styles.availDot} />
                  {doc.available}
                </div>

                <div className={styles.actions}>
                  <Link href="/book-appointment" className={styles.bookBtn}>
                    Book Consultation
                  </Link>
                  <Link href="/doctors" className={styles.profileBtn}>
                    Profile
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div className={styles.teamCta} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}>
          <Link href="/doctors" className={styles.viewTeamBtn}>
            Meet the Full Team <i className="ri-arrow-right-line" style={{ fontSize: 16 }} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
