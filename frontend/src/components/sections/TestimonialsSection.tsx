'use client';
import { useRef, useState, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import styles from './TestimonialsSection.module.css';
import type { CmsTestimonial } from '@/lib/cms';

interface TestimonialCard {
  name: string;
  location: string;
  rating: number;
  condition: string;
  recovery: string;
  avatar: string;
  image: string;
  text: string;
}

const FALLBACK_TESTIMONIALS: TestimonialCard[] = [
  { name: 'Priya Sharma', location: 'Ahmedabad', rating: 5, condition: 'Back Pain', recovery: 'Recovered in 8 weeks', avatar: 'PS', image: '/images/testimonials/testimonial_priya_sharma.png', text: 'After suffering from chronic back pain for 3 years, SAI Physiotherapy gave me my life back. Dr. Patel\'s plan was thoughtful and effective — I felt heard, treated and properly guided.' },
  { name: 'Rajesh Patel', location: 'Gandhinagar', rating: 5, condition: 'Knee Replacement Rehab', recovery: 'Full mobility in 10 weeks', avatar: 'RP', image: '/images/testimonials/testimonial_rajesh_patel.png', text: 'Post knee replacement, I was worried about recovery. The team made it seamless. The exercises and physiotherapy sessions were perfectly planned. Highly recommend.' },
  { name: 'Meena Joshi', location: 'Surat', rating: 5, condition: 'Paralysis Rehab', recovery: 'Walking again in 6 months', avatar: 'MJ', image: '/images/testimonials/testimonial_meena_joshi.png', text: 'My mother had a stroke and couldn\'t walk. After 6 months of rehabilitation at SAI, she can now walk independently. The staff is incredibly skilled and caring.' },
  { name: 'Vikram Shah', location: 'Vadodara', rating: 5, condition: 'Cervical Spondylosis', recovery: 'Pain free in 10 sessions', avatar: 'VS', image: '/images/testimonials/testimonial_vikram_shah.png', text: 'Cervical pain was affecting my work daily. They diagnosed correctly and within 10 sessions I felt 80% better. Excellent knowledge and a professional approach.' },
];

function fromCms(items: CmsTestimonial[]): TestimonialCard[] {
  return items.map((t) => ({
    name: t.patientName,
    location: '',
    rating: t.rating,
    condition: t.condition,
    recovery: '',
    avatar: t.patientName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase(),
    image: '/images/testimonials/testimonial_priya_sharma.png',
    text: t.review,
  }));
}

interface Props {
  testimonials?: CmsTestimonial[] | null;
}

export default function TestimonialsSection({ testimonials }: Props = {}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [activeIdx, setActiveIdx] = useState(0);
  const TESTIMONIALS = useMemo(
    () => (testimonials && testimonials.length > 0 ? fromCms(testimonials).slice(0, 8) : FALLBACK_TESTIMONIALS),
    [testimonials],
  );
  const featured = TESTIMONIALS[activeIdx] ?? TESTIMONIALS[0];
  const others = TESTIMONIALS.filter((_, i) => i !== activeIdx).slice(0, 3);

  return (
    <section className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        <div className="section-header">
          <motion.span className="section-label" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
            Patient Stories
          </motion.span>
          <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
            What Our <span>Patients Say</span>
          </motion.h2>
          <motion.p className="section-desc" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 }}>
            Real stories from real patients who rediscovered their quality of life with our expert care.
          </motion.p>
        </div>

        {/* Google rating */}
        <motion.div
          className={`glass-card ${styles.ratingBanner}`}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.googleIcon}>
            <i className="ri-google-fill" style={{ fontSize: 24 }} />
          </div>
          <div>
            <p className={styles.googleRating}>
              4.9
              {Array.from({ length: 5 }).map((_, j) => (
                <i key={j} className="ri-star-fill" style={{ fontSize: 16, color: '#F59E0B', marginLeft: 4 }} />
              ))}
            </p>
            <p className={styles.googleCount}>500+ Reviews on Google</p>
          </div>
          <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className={styles.googleLink}>
            View on Google <i className="ri-arrow-right-line" style={{ fontSize: 14, marginLeft: 4 }} />
          </a>
        </motion.div>

        <div className={styles.layout}>
          {/* Featured */}
          <AnimatePresence mode="wait">
            <motion.article
              key={featured.name}
              className={styles.featured}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <i className={`ri-double-quotes-l ${styles.bigQuote}`} />
              <div className={styles.featuredStars}>
                {Array.from({ length: featured.rating }).map((_, j) => (
                  <i key={j} className="ri-star-fill" style={{ fontSize: 18, color: '#F59E0B' }} />
                ))}
              </div>
              <p className={styles.featuredText}>&ldquo;{featured.text}&rdquo;</p>
              <div className={styles.featuredFooter}>
                <div className={styles.featuredAvatar} style={{ position: 'relative', overflow: 'hidden', borderRadius: '50%' }}>
                  <Image src={featured.image} alt={featured.name} fill style={{ objectFit: 'cover' }} sizes="56px" />
                </div>
                <div>
                  <p className={styles.featuredName}>{featured.name}</p>
                  <p className={styles.featuredMeta}>{featured.location}</p>
                </div>
                <div className={styles.featuredChips}>
                  <span className={styles.condChip}>{featured.condition}</span>
                  <span className={styles.recovChip}>
                    <i className="ri-checkbox-circle-fill" style={{ fontSize: 12 }} /> {featured.recovery}
                  </span>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>

          {/* Sidebar previews */}
          <div className={styles.sidebar}>
            {others.map((t) => {
              const realIdx = TESTIMONIALS.findIndex((x) => x.name === t.name);
              return (
                <button
                  key={t.name}
                  className={styles.preview}
                  onClick={() => setActiveIdx(realIdx)}
                >
                  <div className={styles.previewAvatar} style={{ position: 'relative', overflow: 'hidden', borderRadius: '50%', flexShrink: 0 }}>
                    <Image src={t.image} alt={t.name} fill style={{ objectFit: 'cover' }} sizes="44px" />
                  </div>
                  <div className={styles.previewBody}>
                    <div className={styles.previewStars}>
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <i key={j} className="ri-star-fill" style={{ fontSize: 11, color: '#F59E0B' }} />
                      ))}
                    </div>
                    <p className={styles.previewText}>&ldquo;{t.text.slice(0, 90)}…&rdquo;</p>
                    <div className={styles.previewMeta}>
                      <span className={styles.previewName}>{t.name}</span>
                      <span className={styles.previewCond}>{t.condition}</span>
                    </div>
                  </div>
                  <i className="ri-arrow-right-line" style={{ fontSize: 16, color: 'var(--color-text-light)' }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        <div className={styles.dots}>
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`${styles.dot} ${activeIdx === i ? styles.dotActive : ''}`}
              aria-label={`View testimonial ${i + 1}`}
            />
          ))}
        </div>

        <motion.div className={styles.cta} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}>
          <Link href="/testimonials" className={styles.ctaBtn}>
            Read 500+ Verified Reviews <i className="ri-arrow-right-line" style={{ fontSize: 16 }} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
