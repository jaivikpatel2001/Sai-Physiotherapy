'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import styles from './BlogPreviewSection.module.css';

const FEATURED = {
  slug: '5-exercises-for-lower-back-pain',
  category: 'Back Pain',
  title: '5 Physiotherapist-Approved Exercises for Lower Back Pain Relief',
  excerpt: 'Lower back pain affects 80% of people at some point. Our senior physiotherapist shares five evidence-based exercises you can do at home for immediate relief.',
  readTime: '5 min',
  date: 'April 28, 2026',
  author: 'Dr. Rajesh Patel',
  image: '/images/blog/blog_back_pain_exercises.png',
  authorImage: '/images/doctors/doctor_rajesh_patel.png',
  icon: 'ri-walk-line',
  surface: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #BAE6FD 100%)',
};

const SECONDARY = [
  {
    slug: 'understanding-cervical-spondylosis',
    category: 'Spine Care',
    title: 'Understanding Cervical Spondylosis: Causes & Treatment',
    readTime: '7 min',
    date: 'April 15, 2026',
    image: '/images/blog/blog_cervical_spondylosis.png',
    icon: 'ri-mental-health-line',
    surface: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
  },
  {
    slug: 'post-stroke-rehabilitation-guide',
    category: 'Neuro Rehab',
    title: 'A Complete Guide to Post-Stroke Rehabilitation',
    readTime: '8 min',
    date: 'March 30, 2026',
    image: '/images/blog/blog_stroke_rehab.png',
    icon: 'ri-heart-pulse-line',
    surface: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
  },
];

export default function BlogPreviewSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        <div className="section-header">
          <motion.span className="section-label" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
            Health Resources
          </motion.span>
          <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
            Expert <span>Health Articles</span> &amp; Guides
          </motion.h2>
          <motion.p className="section-desc" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 }}>
            Evidence-based health information written by our qualified physiotherapists to help
            you understand your condition and make informed decisions.
          </motion.p>
        </div>

        <div className={styles.layout}>
          {/* Featured */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <Link href={`/blog/${FEATURED.slug}`} className={styles.featured}>
              <div className={styles.featuredCover} style={{ background: FEATURED.surface }}>
                <Image
                  src={FEATURED.image}
                  alt={FEATURED.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 55vw"
                />
                <span className={styles.featuredCategory} style={{ position: 'relative', zIndex: 1 }}>
                  <i className="ri-price-tag-3-line" style={{ fontSize: 11 }} /> {FEATURED.category}
                </span>
              </div>
              <div className={styles.featuredBody}>
                <div className={styles.meta}>
                  <span>{FEATURED.date}</span>
                  <span className={styles.dot}>·</span>
                  <span><i className="ri-time-line" style={{ fontSize: 12, marginRight: 3 }} /> {FEATURED.readTime}</span>
                </div>
                <h3 className={styles.featuredTitle}>{FEATURED.title}</h3>
                <p className={styles.featuredExcerpt}>{FEATURED.excerpt}</p>
                <div className={styles.author}>
                  <div className={styles.authorAvatar} style={{ position: 'relative', overflow: 'hidden', borderRadius: '50%' }}>
                    <Image src={FEATURED.authorImage} alt={FEATURED.author} fill style={{ objectFit: 'cover', objectPosition: 'top' }} sizes="36px" />
                  </div>
                  <div>
                    <p className={styles.authorName}>{FEATURED.author}</p>
                    <p className={styles.authorTitle}>Senior Physiotherapist</p>
                  </div>
                  <span className={styles.readMore}>
                    Read article <i className="ri-arrow-right-line" style={{ fontSize: 14 }} />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Secondary */}
          <div className={styles.secondaryCol}>
            {SECONDARY.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
              >
                <Link href={`/blog/${post.slug}`} className={styles.secondary}>
                  <div className={styles.secondaryCover} style={{ background: post.surface, position: 'relative', overflow: 'hidden' }}>
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </div>
                  <div className={styles.secondaryBody}>
                    <span className={styles.secondaryCategory}>{post.category}</span>
                    <h4 className={styles.secondaryTitle}>{post.title}</h4>
                    <div className={styles.meta}>
                      <span>{post.date}</span>
                      <span className={styles.dot}>·</span>
                      <span><i className="ri-time-line" style={{ fontSize: 12, marginRight: 3 }} /> {post.readTime}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div className={styles.viewAll} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.45 }}>
          <Link href="/blog" className={styles.viewAllBtn}>
            View All Articles <i className="ri-arrow-right-line" style={{ fontSize: 18 }} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
