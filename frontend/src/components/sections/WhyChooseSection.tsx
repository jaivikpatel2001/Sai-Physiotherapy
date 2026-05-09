'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import styles from './WhyChooseSection.module.css';

const FEATURES = [
  {
    icon: 'ri-stethoscope-line',
    title: 'Expert physiotherapists',
    desc: 'BPT & MPT qualified specialists with 10+ years of clinical experience each.',
    tone: 'sky',
  },
  {
    icon: 'ri-microscope-line',
    title: 'Advanced technology',
    desc: 'IFT, TENS, ultrasound, laser, traction and modern therapy equipment.',
    tone: 'mint',
  },
  {
    icon: 'ri-checkbox-circle-line',
    title: 'Evidence-based care',
    desc: 'Every protocol grounded in international research and clinical guidelines.',
    tone: 'lavender',
  },
  {
    icon: 'ri-time-line',
    title: 'Flexible hours',
    desc: 'Open 7 days a week, 8 AM to 8 PM. Appointments that fit your schedule.',
    tone: 'blush',
  },
  {
    icon: 'ri-heart-line',
    title: 'Patient-centric',
    desc: 'Personalised treatment plans tailored to your unique needs and goals.',
    tone: 'sand',
  },
  {
    icon: 'ri-star-line',
    title: '4.9 Google rating',
    desc: '500+ verified five-star reviews from patients across Gujarat.',
    tone: 'cream',
  },
];

const TONE_CLASS: Record<string, string> = {
  sky: styles.toneSky,
  mint: styles.toneMint,
  blush: styles.toneBlush,
  sand: styles.toneSand,
  lavender: styles.toneLavender,
  cream: styles.toneCream,
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function WhyChooseSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        <div className={styles.layout}>
          {/* LEFT — sticky editorial column */}
          <motion.aside
            className={styles.sticky}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
          >
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              Why SAI
            </span>
            <h2 className={styles.title}>
              Six reasons families across Gujarat <span className={styles.titleAccent}>trust us</span> with their recovery.
            </h2>
            <p className={styles.lead}>
              Clinical expertise, evidence-based protocols, and compassionate care —
              the combination that turns rehabilitation into real results.
            </p>

            <div className={styles.quoteCard}>
              <i className="ri-double-quotes-l" style={{ fontSize: 32, color: 'var(--color-primary)', opacity: 0.5 }} />
              <p className={styles.quoteText}>
                After three failed treatments elsewhere, SAI got me walking again in 8 weeks.
                Honest, careful, and they actually listen.
              </p>
              <div className={styles.quoteMeta}>
                <span className={styles.quoteAuthor}>Vikram Shah</span>
                <span className={styles.quoteCondition}>Cervical spondylosis · Recovered in 8 weeks</span>
              </div>
            </div>

            <Link href="/about" className={styles.aboutLink}>
              Learn about our approach <i className="ri-arrow-right-line" style={{ fontSize: 14 }} />
            </Link>
          </motion.aside>

          {/* RIGHT — feature list */}
          <ul className={styles.list}>
            {FEATURES.map((f, i) => (
              <motion.li
                key={f.title}
                className={styles.row}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
              >
                <span className={styles.rowNum}>{String(i + 1).padStart(2, '0')}</span>
                <div className={`${styles.iconBadge} ${TONE_CLASS[f.tone]}`}>
                  <i className={f.icon} style={{ fontSize: 22 }} />
                </div>
                <div className={styles.rowBody}>
                  <h3 className={styles.rowTitle}>{f.title}</h3>
                  <p className={styles.rowDesc}>{f.desc}</p>
                </div>
                <i className={`ri-arrow-right-up-line ${styles.rowArrow}`} style={{ fontSize: 18 }} />
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
