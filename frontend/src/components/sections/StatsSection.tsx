'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './StatsSection.module.css';

const STATS = [
  { icon: 'ri-team-line', num: 10000, suffix: '+', label: 'Patients Healed', desc: 'Across all conditions', surface: 'var(--color-primary-50)' },
  { icon: 'ri-calendar-line', num: 15, suffix: '+', label: 'Years of Excellence', desc: 'Trusted since 2009', surface: 'var(--color-mint-50)' },
  { icon: 'ri-star-line', num: 95, suffix: '%', label: 'Recovery Rate', desc: 'Evidence-based outcomes', surface: 'var(--color-blush-50)' },
  { icon: 'ri-pulse-line', num: 12, suffix: '+', label: 'Specializations', desc: 'Covering all conditions', surface: 'var(--color-lavender-50)' },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
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
        <div className={styles.wrap}>
          <div className={styles.grid}>
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                className={styles.card}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.iconWrap}>
                  <i className={s.icon} style={{ fontSize: 18 }} />
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
