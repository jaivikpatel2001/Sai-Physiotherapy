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
