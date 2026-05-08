'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Calendar, Star, Activity } from 'lucide-react';
import styles from './StatsSection.module.css';

const STATS = [
  { icon: <Users size={28} />, num: 10000, suffix: '+', label: 'Patients Healed', desc: 'Across all conditions' },
  { icon: <Calendar size={28} />, num: 15, suffix: '+', label: 'Years of Excellence', desc: 'Trusted since 2009' },
  { icon: <Star size={28} />, num: 95, suffix: '%', label: 'Recovery Rate', desc: 'Evidence-based outcomes' },
  { icon: <Activity size={28} />, num: 12, suffix: '+', label: 'Specializations', desc: 'Covering all conditions' },
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
      <div className={styles.bgAccent} />
      <div className="container">
        <div className={styles.grid}>
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className={styles.card}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.iconWrap}>{s.icon}</div>
              <div className={styles.num}>
                {inView ? <Counter target={s.num} suffix={s.suffix} /> : `0${s.suffix}`}
              </div>
              <p className={styles.label}>{s.label}</p>
              <p className={styles.desc}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
