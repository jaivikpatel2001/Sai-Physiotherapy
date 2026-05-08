'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import styles from './WhyChooseSection.module.css';

const FEATURES = [
  {
    icon: 'ri-stethoscope-line',
    title: 'Expert Physiotherapists',
    desc: 'BPT & MPT qualified specialists with 10+ years of clinical experience each.',
    surface: 'sky',
  },
  {
    icon: 'ri-microscope-line',
    title: 'Advanced Technology',
    desc: 'IFT, TENS, Ultrasound, Laser, Traction and modern therapy equipment.',
    surface: 'mint',
  },
  {
    icon: 'ri-checkbox-circle-line',
    title: 'Evidence-Based Care',
    desc: 'Every protocol is grounded in international research and clinical guidelines.',
    surface: 'lavender',
  },
  {
    icon: 'ri-time-line',
    title: 'Flexible Hours',
    desc: 'Open 7 days a week, 8 AM to 8 PM including Sundays — appointments that fit your day.',
    surface: 'blush',
  },
  {
    icon: 'ri-heart-line',
    title: 'Patient-Centric',
    desc: 'Personalised treatment plans tailored to each patient\'s unique needs and goals.',
    surface: 'sand',
  },
  {
    icon: 'ri-star-line',
    title: '4.9 Google Rating',
    desc: '500+ verified five-star reviews from satisfied patients across Gujarat.',
    surface: 'primary',
  },
];

const SURFACE_CLASS: Record<string, string> = {
  sky: styles.surfaceSky,
  mint: styles.surfaceMint,
  blush: styles.surfaceBlush,
  sand: styles.surfaceSand,
  lavender: styles.surfaceLavender,
  primary: styles.surfacePrimary,
};

export default function WhyChooseSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        <div className="section-header">
          <motion.span className="section-label" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
            Why Choose Us
          </motion.span>
          <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
            Gujarat&apos;s Most <span>Trusted</span> Physiotherapy Centre
          </motion.h2>
          <motion.p className="section-desc" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 }}>
            We combine clinical expertise, cutting-edge technology, and compassionate care
            to deliver the best possible outcomes for every patient.
          </motion.p>
        </div>

        <div className={styles.grid}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className={`${styles.card} ${SURFACE_CLASS[f.surface]}`}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.iconCircle}>
                <i className={f.icon} style={{ fontSize: 28 }} />
              </div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
              <Link href="/about" className={styles.learnMore}>
                Learn more <i className="ri-arrow-right-line" style={{ fontSize: 13 }} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
