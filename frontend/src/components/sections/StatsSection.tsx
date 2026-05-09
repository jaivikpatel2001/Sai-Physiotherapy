'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import styles from './StatsSection.module.css';

const STATS = [
  { icon: 'ri-team-line',     num: 10000, suffix: '+', label: 'Patients Healed',     desc: 'Across all conditions',    tone: 'sky' },
  { icon: 'ri-calendar-line', num: 15,    suffix: '+', label: 'Years of Excellence', desc: 'Trusted since 2009',        tone: 'mint' },
  { icon: 'ri-star-line',     num: 95,    suffix: '%', label: 'Recovery Rate',       desc: 'Evidence-based outcomes',   tone: 'blush' },
  { icon: 'ri-pulse-line',    num: 12,    suffix: '+', label: 'Specializations',     desc: 'Covering all conditions',   tone: 'lavender' },
];

const TONE_CLASS: Record<string, string> = {
  sky: styles.toneSky,
  mint: styles.toneMint,
  blush: styles.toneBlush,
  lavender: styles.toneLavender,
};

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString('en-IN')}{suffix}</span>;
}

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={styles.section} ref={ref}>
      <div className="container">
        <div className={styles.layout}>
          {/* LEFT — header */}
          <motion.div
            className={styles.left}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              By the numbers
            </span>
            <h2 className={styles.title}>
              Real impact, measurable <span className={styles.titleAccent}>recovery.</span>
            </h2>
            <p className={styles.lead}>
              Sixteen years of evidence-based physiotherapy. Real patients, real outcomes —
              backed by structured assessment, careful protocols, and a team that genuinely cares.
            </p>
            <div className={styles.actions}>
              <Link href="/about" className={styles.ctaPrimary}>
                Our story <i className="ri-arrow-right-line" style={{ fontSize: 16 }} />
              </Link>
              <Link href="/testimonials" className={styles.ctaGhost}>
                Read patient stories
              </Link>
            </div>

            <div className={styles.badges}>
              <span className={styles.badge}>
                <i className="ri-shield-check-line" style={{ fontSize: 14, color: 'var(--color-brand-green)' }} />
                NABH compliant
              </span>
              <span className={styles.badge}>
                <i className="ri-award-line" style={{ fontSize: 14, color: 'var(--color-brand-orange)' }} />
                ISO 9001:2015
              </span>
              <span className={styles.badge}>
                <i className="ri-google-fill" style={{ fontSize: 14, color: 'var(--color-link-blue)' }} />
                4.9 · 500+ reviews
              </span>
            </div>
          </motion.div>

          {/* RIGHT — 2x2 stat tiles */}
          <div className={styles.grid}>
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                className={`${styles.card} ${TONE_CLASS[s.tone]}`}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.iconWrap}>
                  <i className={s.icon} style={{ fontSize: 20 }} />
                </div>
                <div className={styles.num}>
                  {inView ? <Counter target={s.num} suffix={s.suffix} /> : `0${s.suffix}`}
                </div>
                <p className={styles.label}>{s.label}</p>
                <p className={styles.desc}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
