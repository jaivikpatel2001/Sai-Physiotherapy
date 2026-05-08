'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import styles from './TestimonialsSection.module.css';

const SURFACES = [
  'var(--color-blush-50)',
  'var(--color-sand-50)',
  'var(--color-mint-50)',
  'var(--color-lavender-50)',
  'var(--color-primary-50)',
  'var(--color-blush-50)',
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', location: 'Ahmedabad', rating: 5, condition: 'Back Pain', text: 'After suffering from chronic back pain for 3 years, SAI Physiotherapy gave me my life back! Dr. Patel\'s treatment plan was exceptional and I recovered in just 2 months.', avatar: 'PS' },
  { name: 'Rajesh Patel', location: 'Gandhinagar', rating: 5, condition: 'Knee Replacement Rehab', text: 'Post knee replacement, I was worried about recovery. The team here made it seamless. The exercises and physiotherapy sessions were perfectly planned. Highly recommend!', avatar: 'RP' },
  { name: 'Meena Joshi', location: 'Surat', rating: 5, condition: 'Paralysis Rehab', text: 'My mother had a stroke and couldn\'t walk. After 6 months of rehabilitation at SAI, she can now walk independently. The staff is incredibly skilled and caring.', avatar: 'MJ' },
  { name: 'Vikram Shah', location: 'Vadodara', rating: 5, condition: 'Cervical Spondylosis', text: 'Cervical pain was affecting my work daily. The team here diagnosed correctly and within 10 sessions I felt 80% better. Excellent knowledge and professional approach.', avatar: 'VS' },
  { name: 'Anita Desai', location: 'Ahmedabad', rating: 5, condition: 'Sports Injury', text: 'As a runner with a ligament tear, I needed quick recovery. SAI\'s sports rehab program got me back on the track in record time. Couldn\'t be happier!', avatar: 'AD' },
  { name: 'Harish Kumar', location: 'Rajkot', rating: 5, condition: 'Frozen Shoulder', text: 'Frozen shoulder was limiting everything from driving to sleeping. The physiotherapists here are world-class. Full mobility restored in 8 weeks!', avatar: 'HK' },
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        <div className="section-header">
          <motion.p className="section-label" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
            Patient Stories
          </motion.p>
          <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
            What Our <span>Patients Say</span>
          </motion.h2>
          <motion.p className="section-desc" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 }}>
            Real stories from real patients who rediscovered their quality of life with our expert care.
          </motion.p>
        </div>

        {/* Google Rating Banner */}
        <motion.div
          className={styles.ratingBanner}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.googleIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 11h8.533c.044.385.067.78.067 1.184 0 2.734-.98 5.036-2.678 6.6l.002-.002C16.36 20.26 14.28 21 12 21c-3.315 0-6.194-1.797-7.76-4.47A8.96 8.96 0 013 12c0-1.633.435-3.164 1.196-4.488C5.774 4.82 8.67 3 12 3c2.395 0 4.392.893 5.925 2.344L16.28 6.99C15.106 5.866 13.645 5.25 12 5.25c-2.443 0-4.51 1.495-5.467 3.648A6.704 6.704 0 006.25 12c0 .792.133 1.55.376 2.256C7.51 16.444 9.578 17.75 12 17.75c1.518 0 2.8-.484 3.772-1.254.913-.726 1.516-1.74 1.714-2.996H12V11z" fill="#4285F4"/></svg>
          </div>
          <div>
            <p className={styles.googleRating}>
              4.9{' '}
              {Array.from({ length: 5 }).map((_, j) => (
                <i key={j} className="ri-star-fill" style={{ fontSize: 16, color: 'var(--color-accent)' }} />
              ))}
            </p>
            <p className={styles.googleCount}>500+ Reviews on Google</p>
          </div>
          <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className={styles.googleLink}>
            View on Google <i className="ri-arrow-right-line" style={{ fontSize: 14, marginLeft: 4 }} />
          </a>
        </motion.div>

        {/* Testimonial Grid */}
        <div className={styles.grid}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              className={styles.card}
              style={{ background: SURFACES[i % SURFACES.length] }}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <i className={`ri-double-quotes-l ${styles.quoteIcon}`} style={{ fontSize: 56 }} />
              <div className={styles.stars}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <i key={j} className="ri-star-fill" style={{ fontSize: 14, color: 'var(--color-accent)' }} />
                ))}
              </div>
              <p className={styles.text}>&ldquo;{t.text}&rdquo;</p>
              <div className={styles.author}>
                <div className={styles.avatar}>{t.avatar}</div>
                <div>
                  <p className={styles.authorName}>{t.name}</p>
                  <p className={styles.authorMeta}>{t.location} · {t.condition}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div className={styles.cta} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}>
          <Link href="/testimonials" className={styles.ctaBtn}>
            Read All Stories <i className="ri-arrow-right-line" style={{ fontSize: 16, marginLeft: 4 }} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
