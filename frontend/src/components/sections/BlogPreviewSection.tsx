'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import styles from './BlogPreviewSection.module.css';

const BLOGS = [
  {
    slug: '5-exercises-for-lower-back-pain',
    category: 'Back Pain',
    title: '5 Physiotherapist-Approved Exercises for Lower Back Pain Relief',
    excerpt: 'Lower back pain affects 80% of people at some point. Our senior physiotherapist shares five evidence-based exercises you can do at home for immediate relief.',
    readTime: '5 min read',
    date: 'April 28, 2026',
    icon: 'ri-walk-line',
    color: 'var(--color-primary-50)',
  },
  {
    slug: 'understanding-cervical-spondylosis',
    category: 'Spine Care',
    title: 'Understanding Cervical Spondylosis: Causes, Symptoms & Treatment',
    excerpt: 'Neck pain and stiffness are increasingly common in the digital age. Learn how cervical spondylosis develops and how physiotherapy offers long-term relief.',
    readTime: '7 min read',
    date: 'April 15, 2026',
    icon: 'ri-mental-health-line',
    color: 'var(--color-sand-50)',
  },
  {
    slug: 'post-stroke-rehabilitation-guide',
    category: 'Neuro Rehab',
    title: 'A Complete Guide to Post-Stroke Rehabilitation & Recovery',
    excerpt: 'Stroke recovery is a journey, not a destination. Our neuro physio team explains the stages of recovery and what to expect from a structured rehabilitation program.',
    readTime: '8 min read',
    date: 'March 30, 2026',
    icon: 'ri-heart-pulse-line',
    color: 'var(--color-mint-50)',
  },
];

export default function BlogPreviewSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        <div className="section-header">
          <motion.p className="section-label" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
            Health Resources
          </motion.p>
          <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
            Expert <span>Health Articles</span> & Guides
          </motion.h2>
          <motion.p className="section-desc" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 }}>
            Evidence-based health information written by our qualified physiotherapists to help
            you understand your condition and make informed decisions.
          </motion.p>
        </div>

        <div className={styles.grid}>
          {BLOGS.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/blog/${post.slug}`} className={styles.card}>
                <div className={styles.cardThumb} style={{ background: post.color }}>
                  <i className={`${post.icon} ${styles.thumbIcon}`} />
                  <span className={styles.category}>
                    <i className="ri-price-tag-3-line" style={{ fontSize: 11 }} /> {post.category}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.meta}>
                    <span className={styles.date}>{post.date}</span>
                    <span className={styles.dot}>·</span>
                    <span className={styles.readTime}>
                      <i className="ri-time-line" style={{ fontSize: 12 }} /> {post.readTime}
                    </span>
                  </div>
                  <h3 className={styles.title}>{post.title}</h3>
                  <p className={styles.excerpt}>{post.excerpt}</p>
                  <div className={styles.readMore}>
                    Read Article <i className="ri-arrow-right-line" style={{ fontSize: 14 }} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
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
