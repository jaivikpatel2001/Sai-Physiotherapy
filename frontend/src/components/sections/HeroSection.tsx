'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './HeroSection.module.css';

const VERIFIED = [
  { icon: 'ri-shield-check-line', text: 'NABH Compliant' },
  { icon: 'ri-award-line', text: 'ISO 9001:2015' },
  { icon: 'ri-google-fill', text: 'Google 4.9 / 500+ Reviews' },
];

const TRUST_METRICS = [
  { icon: 'ri-user-heart-line', num: '10,000+', label: 'Patients' },
  { icon: 'ri-award-line', num: '15+', label: 'Years' },
  { icon: 'ri-shield-check-line', num: '95%', label: 'Recovery' },
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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HeroSection() {
  const [activeDay, setActiveDay] = useState(0);
  const [activeSlot, setActiveSlot] = useState(1);
  const [treatment, setTreatment] = useState(TREATMENTS[0]);

  return (
    <section className={styles.hero}>
      <div className={styles.bg}>
        <div className={styles.bgGradient} />
        <div className={styles.bgMesh} />
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
      </div>

      <div className={`container ${styles.content}`}>
        {/* LEFT */}
        <div className={styles.left}>
          <motion.div className={styles.eyebrow} custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <span className={styles.eyebrowDot} />
            Trusted by 10,000+ patients across Gujarat
          </motion.div>

          <motion.h1 className={styles.headline} custom={1} variants={fadeUp} initial="hidden" animate="visible">
            Move Better. Recover Faster.
            <br />
            <span className="gradient-text">Live Pain Free.</span>
          </motion.h1>

          <motion.p className={styles.sub} custom={2} variants={fadeUp} initial="hidden" animate="visible">
            Evidence-based physiotherapy and rehabilitation built around you. Expert specialists,
            advanced therapy, and personalised care plans for lasting recovery.
          </motion.p>

          <motion.div className={styles.ctaGroup} custom={3} variants={fadeUp} initial="hidden" animate="visible">
            <Link href="/book-appointment" className={styles.ctaPrimary}>
              Book Consultation <i className="ri-arrow-right-line" style={{ fontSize: 18 }} />
            </Link>
            <Link href="/services" className={styles.ctaGhost}>
              Explore Treatments <i className="ri-arrow-right-line" style={{ fontSize: 16 }} />
            </Link>
          </motion.div>

          <motion.div className={styles.trustStrip} custom={4} variants={fadeUp} initial="hidden" animate="visible">
            {TRUST_METRICS.map((m, i) => (
              <div key={m.label} className={styles.trustItem}>
                <i className={m.icon} style={{ fontSize: 18, color: 'var(--color-primary)' }} />
                <div>
                  <span className={styles.trustNum}>{m.num}</span>
                  <span className={styles.trustLabel}>{m.label}</span>
                </div>
                {i < TRUST_METRICS.length - 1 && <span className={styles.trustDivider} />}
              </div>
            ))}
          </motion.div>

          <motion.div className={styles.verifiedRow} custom={5} variants={fadeUp} initial="hidden" animate="visible">
            {VERIFIED.map((v) => (
              <div key={v.text} className={`glass-card ${styles.verifiedChip}`}>
                <i className={v.icon} style={{ fontSize: 14 }} />
                {v.text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — Booking widget mockup */}
        <motion.div
          className={styles.right}
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.bookingCard}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardEyebrow}>Quick Booking</p>
                <h3 className={styles.cardTitle}>Book Your Visit</h3>
              </div>
              <div className={styles.responsePill}>
                <span className={styles.greenDot} />
                30-min response
              </div>
            </div>

            {/* Doctor */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Specialist</label>
              <div className={styles.doctorSelect}>
                <div className={styles.doctorAvatar}>RP</div>
                <div className={styles.doctorMeta}>
                  <span className={styles.doctorName}>Dr. Rajesh Patel</span>
                  <span className={styles.doctorSpec}>Senior Physiotherapist · Spine</span>
                </div>
                <i className="ri-arrow-down-s-line" style={{ fontSize: 18, color: 'var(--color-text-light)' }} />
              </div>
            </div>

            {/* Treatment */}
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

            {/* Date strip */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Choose Date</label>
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

            {/* Slots */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Available Slots</label>
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
                Confirm Booking <i className="ri-arrow-right-line" style={{ fontSize: 16 }} />
              </Link>
              <a
                href="https://wa.me/919999999999?text=Hi, I'd like to book an appointment"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsBtn}
              >
                <i className="ri-whatsapp-line" style={{ fontSize: 18 }} /> WhatsApp Us
              </a>
            </div>
          </div>

          {/* Floating glass cards */}
          <motion.div
            className={`glass-card ${styles.floatTop}`}
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }}
          >
            <i className="ri-pulse-line" style={{ fontSize: 18, color: 'var(--color-primary)' }} />
            <div>
              <p className={styles.floatTitle}>Live Slots Updated</p>
              <p className={styles.floatSub}><span className={styles.greenDot} /> Just now</p>
            </div>
          </motion.div>

          <motion.div
            className={`glass-card ${styles.floatBottom}`}
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut', delay: 0.4 }}
          >
            <div className={styles.avatarStack}>
              <span className={styles.stackAvatar} style={{ background: 'var(--color-primary)' }}>R</span>
              <span className={styles.stackAvatar} style={{ background: 'var(--color-accent)' }}>A</span>
              <span className={styles.stackAvatar} style={{ background: 'var(--color-accent-dark)' }}>M</span>
            </div>
            <div>
              <p className={styles.floatTitle}>+12 booked today</p>
              <p className={styles.floatSub}>Reserve yours</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
