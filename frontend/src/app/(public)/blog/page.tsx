'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './blog.module.css';

const POSTS = [
  { slug: '5-exercises-for-lower-back-pain', category: 'Back Pain', icon: 'ri-walk-line', tint: 'sky', author: 'Dr. Sai Patel', title: '5 Physiotherapist-Approved Exercises for Lower Back Pain Relief', excerpt: 'Lower back pain affects 80% of people. Our senior physiotherapist shares five evidence-based exercises you can do at home for immediate relief.', readTime: '5 min', date: 'April 28, 2026', featured: true },
  { slug: 'understanding-cervical-spondylosis', category: 'Spine Care', icon: 'ri-mental-health-line', tint: 'sand', author: 'Dr. Anjali Mehta', title: 'Understanding Cervical Spondylosis: Causes, Symptoms & Treatment', excerpt: 'Neck pain and stiffness are increasingly common in the digital age. Learn how cervical spondylosis develops and how physiotherapy offers long-term relief.', readTime: '7 min', date: 'April 15, 2026' },
  { slug: 'post-stroke-rehabilitation-guide', category: 'Neuro Rehab', icon: 'ri-heart-pulse-line', tint: 'mint', author: 'Dr. Rakesh Joshi', title: 'A Complete Guide to Post-Stroke Rehabilitation & Recovery', excerpt: 'Stroke recovery is a journey. Our neuro physio team explains the stages of recovery and what to expect.', readTime: '8 min', date: 'March 30, 2026' },
  { slug: 'knee-osteoarthritis-management', category: 'Joint Care', icon: 'ri-run-line', tint: 'blush', author: 'Dr. Sai Patel', title: 'Managing Knee Osteoarthritis with Physiotherapy', excerpt: 'Knee osteoarthritis doesn\'t have to mean a lifetime of pain. Learn how targeted physiotherapy reduces pain and improves function.', readTime: '6 min', date: 'March 15, 2026' },
  { slug: 'sports-injury-prevention-tips', category: 'Sports', icon: 'ri-football-line', tint: 'sky', author: 'Dr. Karan Shah', title: '10 Physiotherapist Tips to Prevent Sports Injuries', excerpt: 'Prevention is better than cure. Essential warm-up, cool-down, and conditioning tips for athletes.', readTime: '5 min', date: 'March 1, 2026' },
  { slug: 'frozen-shoulder-treatment', category: 'Shoulder', icon: 'ri-snowy-line', tint: 'lavender', author: 'Dr. Anjali Mehta', title: 'Frozen Shoulder: What It Is and How We Treat It', excerpt: 'Adhesive capsulitis affects 2-5% of the population. Discover the stages, symptoms, and physiotherapy treatments.', readTime: '6 min', date: 'February 20, 2026' },
];

const CATEGORIES = ['All', 'Back Pain', 'Spine Care', 'Neuro Rehab', 'Joint Care', 'Sports', 'Shoulder'];

export default function BlogPage() {
  const [category, setCategory] = useState('All');
  const featured = POSTS.find((p) => p.featured) || POSTS[0];
  const rest = useMemo(() => {
    const others = POSTS.filter((p) => p !== featured);
    return category === 'All' ? others : others.filter((p) => p.category === category);
  }, [category, featured]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroMesh} />
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>Health Resources</p>
          <h1 className={styles.heroTitle}>Health Articles &amp; <span className="gradient-text">Guides</span></h1>
          <p className={styles.heroDesc}>Evidence-based health information written by our qualified physiotherapists.</p>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <Link href={`/blog/${featured.slug}`} className={styles.featured}>
            <div className={`${styles.featuredCover} ${styles[`tint_${featured.tint}`]}`}>
              <i className={featured.icon} />
              <span className={styles.featuredBadge}>Featured</span>
            </div>
            <div className={styles.featuredBody}>
              <span className={styles.cat}>{featured.category}</span>
              <h2 className={styles.featuredTitle}>
                <span className="gradient-text">{featured.title}</span>
              </h2>
              <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
              <div className={styles.metaRow}>
                <div className={styles.authorMini}>
                  <div className={styles.authorAvatar}>{featured.author.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
                  <span>{featured.author}</span>
                </div>
                <span className={styles.dot} />
                <span><i className="ri-calendar-line" /> {featured.date}</span>
                <span className={styles.dot} />
                <span><i className="ri-time-line" /> {featured.readTime}</span>
              </div>
            </div>
          </Link>

          <div className={styles.chipRow}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`${styles.chip} ${category === c ? styles.chipActive : ''}`}
              >{c}</button>
            ))}
          </div>

          <div className={styles.grid}>
            {rest.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.card}>
                <div className={`${styles.cover} ${styles[`tint_${post.tint}`]}`}>
                  <i className={post.icon} />
                  <span className={styles.coverCat}>{post.category}</span>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{post.title}</h3>
                  <p className={styles.cardExcerpt}>{post.excerpt}</p>
                  <div className={styles.cardFoot}>
                    <div className={styles.authorMini}>
                      <div className={styles.authorAvatarSm}>{post.author.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
                      <span>{post.author}</span>
                    </div>
                    <span className={styles.cardDate}>{post.date} · {post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {rest.length === 0 && (
            <div className={styles.empty}>
              <i className="ri-article-line" />
              <p>No articles in this category yet.</p>
            </div>
          )}

          <div className={styles.pagination}>
            <button type="button" className={styles.pageBtn} disabled><i className="ri-arrow-left-s-line" /></button>
            <button type="button" className={`${styles.pageBtn} ${styles.pageActive}`}>1</button>
            <button type="button" className={styles.pageBtn}>2</button>
            <button type="button" className={styles.pageBtn}>3</button>
            <button type="button" className={styles.pageBtn}><i className="ri-arrow-right-s-line" /></button>
          </div>
        </div>
      </section>
    </div>
  );
}
