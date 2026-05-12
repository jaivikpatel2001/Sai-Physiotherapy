'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './HeroSection.module.css';

const TRUST_METRICS = [
  { num: '10,000+', label: 'Patients treated' },
  { num: '15+',     label: 'Years of care' },
  { num: '95%',     label: 'Recovery rate' },
];

const TREATMENTS = [
  'Back Pain Treatment',
  'Spine Care',
  'Knee Pain & Joint Care',
  'Sports Injury Rehab',
  'Neuro Physiotherapy',
];

const DAYS = (() => {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const out: { label: string; date: number; key: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    out.push({ label: i === 0 ? 'Today' : labels[d.getDay()], date: d.getDate(), key: d.toISOString() });
  }
  return out;
})();

const SLOTS = ['9:00', '10:30', '12:00', '3:00', '5:00 PM'];

const DOTS = [
  { top: '10%',  left: '4%',   size: 12, color: 'var(--color-brand-pink)',         delay: 0 },
  { top: '18%',  right: '6%',  size: 10, color: 'var(--color-brand-orange)',       delay: 0.6 },
  { top: '70%',  left: '6%',   size: 14, color: 'var(--color-brand-purple-300)',   delay: 1.1 },
  { top: '78%',  right: '4%',  size: 9,  color: 'var(--color-brand-green)',        delay: 1.6 },
  { top: '38%',  right: '50%', size: 8,  color: 'var(--color-brand-yellow)',       delay: 2.0 },
  { top: '60%',  left: '46%',  size: 10, color: 'var(--color-brand-teal)',         delay: 0.3 },
];

const FLOAT_ICONS = [
  { icon: 'ri-pulse-line',         top: '14%', left: '8%',   size: 22, dur: 7, delay: 0,    color: 'var(--color-primary)' },
  { icon: 'ri-stethoscope-line',   top: '24%', right: '10%', size: 20, dur: 8, delay: 1.2,  color: 'var(--color-brand-teal)' },
  { icon: 'ri-heart-pulse-line',   top: '54%', left: '10%',  size: 24, dur: 9, delay: 0.6,  color: 'var(--color-brand-pink-deep)' },
  { icon: 'ri-walk-line',          top: '66%', right: '12%', size: 22, dur: 7.5, delay: 2,  color: 'var(--color-brand-green)' },
  { icon: 'ri-mental-health-line', top: '34%', right: '4%',  size: 18, dur: 10, delay: 0.9, color: 'var(--color-brand-orange)' },
  { icon: 'ri-first-aid-kit-line', top: '78%', left: '4%',   size: 18, dur: 8.5, delay: 1.6, color: 'var(--color-primary-deep)' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HeroSection() {
  const [activeDay, setActiveDay] = useState(0);
  const [activeSlot, setActiveSlot] = useState(1);
  const [treatment, setTreatment] = useState(TREATMENTS[0]);

  return (
    <section className={styles.hero}>
      <div className={styles.band}>
        {/* Drifting soft gradient blobs */}
        <div className={`${styles.blob} ${styles.blobA}`} aria-hidden />
        <div className={`${styles.blob} ${styles.blobB}`} aria-hidden />
        <div className={`${styles.blob} ${styles.blobC}`} aria-hidden />

        {/* Animated ECG / heartbeat line — bottom decoration */}
        <svg className={styles.ecg} viewBox="0 0 1200 80" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(70, 162, 183, 0)" />
              <stop offset="20%" stopColor="rgba(70, 162, 183, 0.55)" />
              <stop offset="50%" stopColor="rgba(70, 162, 183, 0.7)" />
              <stop offset="80%" stopColor="rgba(70, 162, 183, 0.55)" />
              <stop offset="100%" stopColor="rgba(70, 162, 183, 0)" />
            </linearGradient>
          </defs>
          <path
            className={styles.ecgPath}
            d="M0,40 L180,40 L210,40 L230,18 L250,62 L270,28 L290,52 L310,40 L520,40 L545,40 L565,16 L585,64 L605,30 L625,50 L645,40 L860,40 L885,40 L905,18 L925,60 L945,30 L965,52 L985,40 L1200,40"
            fill="none"
            stroke="url(#ecgGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Floating physio icons */}
        {FLOAT_ICONS.map((f, i) => (
          <i
            key={i}
            className={`${f.icon} ${styles.floatIcon}`}
            style={{
              top: f.top,
              left: f.left,
              right: f.right,
              fontSize: f.size,
              color: f.color,
              animation: `floatSoft ${f.dur}s ease-in-out ${f.delay}s infinite`,
            }}
            aria-hidden
          />
        ))}

        {DOTS.map((d, i) => (
          <span
            key={i}
            className={styles.dot}
            style={{
              top: d.top,
              left: d.left,
              right: d.right,
              width: d.size,
              height: d.size,
              background: d.color,
              animation: `dotFade 5s ease-in-out ${d.delay}s infinite`,
            }}
          />
        ))}

        <div className={`container ${styles.content}`}>
          {/* LEFT: text column */}
          <div className={styles.textCol}>
            <motion.span className={styles.eyebrow} custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <span className={styles.eyebrowDot} />
              Trusted by 10,000+ patients across Gujarat
            </motion.span>

            <motion.h1 className={styles.headline} custom={1} variants={fadeUp} initial="hidden" animate="visible">
              Move better.<br />
              Recover faster.<br />
              <span className={styles.accent}>Live pain free.</span>
            </motion.h1>

            <motion.p className={styles.sub} custom={2} variants={fadeUp} initial="hidden" animate="visible">
              Evidence-based physiotherapy and rehabilitation built around you. Expert specialists,
              advanced therapy, and personalised care plans for lasting recovery.
            </motion.p>

            <motion.div className={styles.ctaGroup} custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <Link href="/book-appointment" className={styles.ctaPrimary}>
                Book Consultation <i className="ri-arrow-right-line" style={{ fontSize: 16 }} />
              </Link>
              <Link href="/services" className={styles.ctaGhost}>
                Explore Treatments
              </Link>
            </motion.div>

            <motion.div className={styles.trustInline} custom={4} variants={fadeUp} initial="hidden" animate="visible">
              {TRUST_METRICS.map((m, i) => (
                <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div className={styles.trustItem}>
                    <span className={styles.trustNum}>{m.num}</span>
                    <span className={styles.trustLabel}>{m.label}</span>
                  </div>
                  {i < TRUST_METRICS.length - 1 && <span className={styles.trustDivider} />}
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: booking widget mockup */}
          <motion.div
            className={styles.mockupWrap}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.bookingCard}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.cardEyebrow}>QUICK BOOKING</p>
                  <h3 className={styles.cardTitle}>Book your visit</h3>
                </div>
                <div className={styles.responsePill}>
                  <span className={styles.greenDot} />
                  30-min response
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Specialist</label>
                <div className={styles.doctorSelect}>
                  <div className={styles.doctorAvatar}>RP</div>
                  <div className={styles.doctorMeta}>
                    <span className={styles.doctorName}>Dr. Rajesh Patel</span>
                    <span className={styles.doctorSpec}>Senior Physiotherapist · Spine</span>
                  </div>
                  <i className="ri-arrow-down-s-line" style={{ fontSize: 18, color: 'var(--color-steel)' }} />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Treatment</label>
                <select
                  className={styles.fieldSelect}
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                >
                  {TREATMENTS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Choose date</label>
                <div className={styles.dateStrip}>
                  {DAYS.map((d, i) => (
                    <button
                      type="button"
                      key={d.key}
                      onClick={() => setActiveDay(i)}
                      className={`${styles.datePill} ${activeDay === i ? styles.datePillActive : ''}`}
                    >
                      <span className={styles.dateLabel}>{d.label}</span>
                      <span className={styles.dateNum}>{d.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Available slots</label>
                <div className={styles.slotRow}>
                  {SLOTS.map((s, i) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setActiveSlot(i)}
                      className={`${styles.slotPill} ${activeSlot === i ? styles.slotPillActive : ''}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.cardActions}>
                <Link href="/book-appointment" className={styles.confirmBtn}>
                  Confirm booking <i className="ri-arrow-right-line" style={{ fontSize: 16 }} />
                </Link>
                <a
                  href="https://wa.me/919999999999?text=Hi, I'd like to book an appointment"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsBtn}
                >
                  <i className="ri-whatsapp-line" style={{ fontSize: 16 }} /> WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
