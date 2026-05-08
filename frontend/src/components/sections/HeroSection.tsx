'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Phone, Calendar, Star, Shield, Award } from 'lucide-react';
import styles from './HeroSection.module.css';

const TRUST_BADGES = [
  { icon: <Star size={14} />, text: '4.9★ Rating' },
  { icon: <Shield size={14} />, text: 'NABH Compliant' },
  { icon: <Award size={14} />, text: '15+ Years' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      {/* Background */}
      <div className={styles.bg}>
        <div className={styles.bgGradient} />
        <div className={styles.bgPattern} />
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
      </div>

      <div className={`container ${styles.content}`}>
        <div className={styles.left}>
          {/* Trust badges */}
          <motion.div className={styles.trustBadges} custom={0} variants={fadeUp} initial="hidden" animate="visible">
            {TRUST_BADGES.map((b) => (
              <div key={b.text} className={styles.trustBadge}>
                {b.icon} {b.text}
              </div>
            ))}
          </motion.div>

          {/* Headline */}
          <motion.h1 className={styles.headline} custom={1} variants={fadeUp} initial="hidden" animate="visible">
            Gujarat&apos;s{' '}
            <span className={styles.highlightText}>Most Advanced</span>
            <br />
            Physiotherapy &amp;
            <br />
            <span className={styles.accentLine}>Rehabilitation Centre</span>
          </motion.h1>

          <motion.p className={styles.sub} custom={2} variants={fadeUp} initial="hidden" animate="visible">
            Expert treatment for back pain, spine care, paralysis rehabilitation, sports injuries,
            and 12+ specialized conditions. 10,000+ patients healed. Book your consultation today.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div className={styles.ctaGroup} custom={3} variants={fadeUp} initial="hidden" animate="visible">
            <Link href="/book-appointment" className={styles.ctaPrimary}>
              <Calendar size={18} />
              Book Appointment
            </Link>
            <a href="tel:+919999999999" className={styles.ctaSecondary}>
              <Phone size={18} />
              Call Now
            </a>
          </motion.div>

          {/* Quick stats row */}
          <motion.div className={styles.quickStats} custom={4} variants={fadeUp} initial="hidden" animate="visible">
            {[
              { num: '10,000+', label: 'Patients Healed' },
              { num: '15+', label: 'Years of Excellence' },
              { num: '95%', label: 'Recovery Rate' },
              { num: '12+', label: 'Specializations' },
            ].map((s) => (
              <div key={s.label} className={styles.quickStat}>
                <span className={styles.quickStatNum}>{s.num}</span>
                <span className={styles.quickStatLabel}>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Visual card */}
        <motion.div
          className={styles.right}
          initial={{ opacity: 0, scale: 0.92, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.heroCard}>
            <div className={styles.heroCardHeader}>
              <div className={styles.heroCardAvatar}>
                <span>🩺</span>
              </div>
              <div>
                <p className={styles.heroCardTitle}>Today&apos;s Availability</p>
                <p className={styles.heroCardSub}>Slots available for walk-ins</p>
              </div>
              <div className={styles.liveIndicator}>
                <span className={styles.liveDot} />
                Live
              </div>
            </div>

            <div className={styles.slotGrid}>
              {['9:00 AM', '10:30 AM', '12:00 PM', '2:00 PM', '4:30 PM', '6:00 PM'].map((t, i) => (
                <div key={t} className={`${styles.slot} ${i === 1 ? styles.slotBooked : ''}`}>
                  {t}
                  {i === 1 && <span className={styles.slotTag}>Booked</span>}
                </div>
              ))}
            </div>

            <Link href="/book-appointment" className={styles.bookNowBtn}>
              Reserve Your Slot →
            </Link>

            <div className={styles.reviewStrip}>
              <div className={styles.reviewStars}>{'★'.repeat(5)}</div>
              <p className={styles.reviewText}>&ldquo;Best physiotherapy centre in Ahmedabad!&rdquo;</p>
              <p className={styles.reviewAuthor}>— 500+ Google Reviews</p>
            </div>
          </div>

          {/* Floating achievements */}
          <motion.div
            className={`${styles.floatingBadge} ${styles.floatingBadge1}`}
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            <span className={styles.floatingIcon}>🏆</span>
            <div>
              <p className={styles.floatingTitle}>Best Physio 2024</p>
              <p className={styles.floatingDesc}>Gujarat Healthcare Awards</p>
            </div>
          </motion.div>

          <motion.div
            className={`${styles.floatingBadge} ${styles.floatingBadge2}`}
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
          >
            <span className={styles.floatingIcon}>✅</span>
            <div>
              <p className={styles.floatingTitle}>Advanced Equipment</p>
              <p className={styles.floatingDesc}>IFT • TENS • Ultrasound</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className={styles.scrollHint}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className={styles.scrollMouse}>
          <div className={styles.scrollWheel} />
        </div>
        <span>Scroll to explore</span>
      </motion.div>
    </section>
  );
}
