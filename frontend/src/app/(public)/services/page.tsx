'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './services.module.css';

const SERVICES = [
  { icon: 'ri-walk-line', title: 'Back Pain Treatment', slug: 'back-pain-treatment', category: 'Spine & Back', price: '₹500 – ₹2,000', sessions: '8–12 sessions', desc: 'Expert treatment for all types of back pain using advanced physiotherapy techniques and personalized care plans.', tint: 'sky', symptoms: ['back hurts'] },
  { icon: 'ri-mental-health-line', title: 'Spine Care & Disc Problems', slug: 'spine-care-disc-problems', category: 'Spine & Back', price: '₹800 – ₹3,000', sessions: '10–15 sessions', desc: 'Specialized treatment for disc herniation, spondylosis, and other spinal conditions using advanced spinal techniques.', tint: 'sand', symptoms: ['back hurts'] },
  { icon: 'ri-heart-pulse-line', title: 'Paralysis Rehabilitation', slug: 'paralysis-rehabilitation', category: 'Neuro Rehab', price: '₹1,000 – ₹4,000', sessions: '20–30 sessions', desc: 'Comprehensive rehabilitation for stroke, spinal cord injury, and other conditions causing paralysis to maximize functional recovery.', tint: 'mint', symptoms: ['stroke recovery'] },
  { icon: 'ri-run-line', title: 'Knee Pain & Joint Care', slug: 'knee-pain-joint-care', category: 'Orthopedics', price: '₹600 – ₹2,500', sessions: '8–15 sessions', desc: 'Effective treatment for knee pain, osteoarthritis, ligament injuries, and post-surgical rehabilitation.', tint: 'blush', symptoms: ['joint pain'] },
  { icon: 'ri-emotion-unhappy-line', title: 'Neck Pain & Cervical Care', slug: 'neck-pain-cervical-spondylosis', category: 'Spine & Back', price: '₹500 – ₹2,000', sessions: '8–12 sessions', desc: 'Targeted treatment for neck pain, cervical spondylosis, whiplash, and headaches arising from the cervical spine.', tint: 'lavender', symptoms: ['neck pain'] },
  { icon: 'ri-football-line', title: 'Sports Injury Rehabilitation', slug: 'sports-injury-rehabilitation', category: 'Sports', price: '₹800 – ₹3,000', sessions: '10–20 sessions', desc: 'Rapid recovery programs for athletes and active individuals with sports-related injuries.', tint: 'sky', symptoms: ['sports injury'] },
  { icon: 'ri-flashlight-line', title: 'Neuro Physiotherapy', slug: 'neuro-physiotherapy', category: 'Neuro Rehab', price: '₹1,000 – ₹4,000', sessions: '20+ sessions', desc: "Specialized physiotherapy for neurological conditions including Parkinson's, MS, cerebral palsy, and stroke.", tint: 'lavender', symptoms: ['stroke recovery'] },
  { icon: 'ri-hospital-line', title: 'Post-Surgery Rehabilitation', slug: 'post-surgery-rehabilitation', category: 'Orthopedics', price: '₹700 – ₹3,000', sessions: '12–20 sessions', desc: 'Accelerate your recovery after orthopedic surgeries with structured rehabilitation protocols designed by experts.', tint: 'mint', symptoms: ['recovering from surgery'] },
  { icon: 'ri-parent-line', title: 'Pediatric Physiotherapy', slug: 'pediatric-physiotherapy', category: 'Pediatrics', price: '₹600 – ₹2,500', sessions: '10–20 sessions', desc: 'Gentle and effective physiotherapy for children with developmental delays, cerebral palsy, and musculoskeletal conditions.', tint: 'sand', symptoms: ['child therapy'] },
  { icon: 'ri-user-heart-line', title: 'Geriatric Care', slug: 'geriatric-care', category: 'Elderly Care', price: '₹500 – ₹2,000', sessions: '10–15 sessions', desc: 'Specialized physiotherapy programs designed for elderly patients to maintain independence and manage chronic conditions.', tint: 'mint', symptoms: ['joint pain'] },
  { icon: 'ri-boxing-line', title: 'Shoulder Pain Treatment', slug: 'shoulder-pain-treatment', category: 'Orthopedics', price: '₹600 – ₹2,500', sessions: '8–15 sessions', desc: 'Comprehensive treatment for rotator cuff injuries, shoulder impingement, and chronic shoulder pain.', tint: 'sky', symptoms: ['joint pain'] },
  { icon: 'ri-snowy-line', title: 'Frozen Shoulder', slug: 'frozen-shoulder', category: 'Orthopedics', price: '₹700 – ₹3,000', sessions: '12–20 sessions', desc: 'Specialized treatment for adhesive capsulitis (frozen shoulder) to restore movement and eliminate pain.', tint: 'lavender', symptoms: ['joint pain'] },
];

const CATEGORIES = ['All', 'Spine & Back', 'Orthopedics', 'Neuro Rehab', 'Sports', 'Pediatrics', 'Elderly Care'];

const QUICK_FILTERS = [
  { label: 'Back hurts', symptom: 'back hurts' },
  { label: 'Neck pain', symptom: 'neck pain' },
  { label: 'Joint pain', symptom: 'joint pain' },
  { label: 'Recovering from surgery', symptom: 'recovering from surgery' },
  { label: 'Sports injury', symptom: 'sports injury' },
  { label: 'Stroke recovery', symptom: 'stroke recovery' },
  { label: 'Child therapy', symptom: 'child therapy' },
];

export default function ServicesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [activeSymptom, setActiveSymptom] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return SERVICES.filter((s) => {
      if (category !== 'All' && s.category !== category) return false;
      if (activeSymptom && !s.symptoms.includes(activeSymptom)) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, category, activeSymptom]);

  const reset = () => { setSearch(''); setCategory('All'); setActiveSymptom(null); };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroMesh} />
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>Our Specializations</p>
          <h1 className={styles.heroTitle}>Expert Physiotherapy <span className="gradient-text">Services</span></h1>
          <p className={styles.heroDesc}>
            12+ specialized treatment areas. Evidence-based protocols. Compassionate care —
            tailored to your condition, your goals, your life.
          </p>
        </div>
      </div>

      <section className={styles.body}>
        <div className="container">
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <div className={styles.sideCard}>
                <div className={styles.searchWrap}>
                  <i className={`ri-search-line ${styles.searchIcon}`} />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <p className={styles.filterTitle}>Categories</p>
                  <div className={styles.radioList}>
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={`${styles.radioChip} ${category === c ? styles.radioActive : ''}`}
                      >
                        <span className={styles.radioDot} />{c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <p className={styles.filterTitle}>Quick Filters by Symptom</p>
                  <div className={styles.quickChips}>
                    {QUICK_FILTERS.map((q) => (
                      <button
                        key={q.symptom}
                        type="button"
                        onClick={() => setActiveSymptom(activeSymptom === q.symptom ? null : q.symptom)}
                        className={`${styles.quickChip} ${activeSymptom === q.symptom ? styles.quickActive : ''}`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>

                {(search || category !== 'All' || activeSymptom) && (
                  <button type="button" onClick={reset} className={styles.resetLink}>
                    <i className="ri-refresh-line" /> Reset filters
                  </button>
                )}
              </div>
            </aside>

            <div className={styles.results}>
              <div className={styles.resultsHead}>
                <span className={styles.resultsCount}>{filtered.length} {filtered.length === 1 ? 'service' : 'services'} found</span>
              </div>

              {filtered.length === 0 ? (
                <div className={styles.empty}>
                  <i className="ri-search-eye-line" style={{ fontSize: 48, color: 'var(--color-text-light)' }} />
                  <h3>No services match your filters</h3>
                  <p>Try clearing filters or use a broader search.</p>
                  <button type="button" onClick={reset} className={styles.emptyBtn}>Reset filters</button>
                </div>
              ) : (
                <div className={styles.grid}>
                  {filtered.map((svc) => (
                    <Link key={svc.slug} href={`/services/${svc.slug}`} className={styles.card}>
                      <div className={`${styles.cardIcon} ${styles[`tint_${svc.tint}`]}`}>
                        <i className={svc.icon} style={{ fontSize: 30 }} />
                      </div>
                      <span className={styles.cardCategory}>{svc.category}</span>
                      <h2 className={styles.cardTitle}>{svc.title}</h2>
                      <p className={styles.cardDesc}>{svc.desc}</p>
                      <div className={styles.cardMeta}>
                        <span><i className="ri-time-line" /> {svc.sessions}</span>
                        <span><i className="ri-price-tag-3-line" /> {svc.price}</span>
                      </div>
                      <span className={styles.learnMore}>
                        Learn more <i className="ri-arrow-right-line" />
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
