'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import styles from './testimonials.module.css';

const TESTIMONIALS: Array<{ name: string; location: string; rating: number; condition: string; duration: string; text: string; avatar: string; image?: string }> = [
  { name: 'Priya Sharma', location: 'Ahmedabad', rating: 5, condition: 'Back Pain', duration: '6 weeks', text: 'After suffering from chronic back pain for 3 years, SAI Physiotherapy gave me my life back. Dr. Patel\'s treatment plan was exceptional.', avatar: 'PS', image: '/images/testimonials/testimonial_priya_sharma.png' },
  { name: 'Rajesh Patel', location: 'Gandhinagar', rating: 5, condition: 'Knee Replacement', duration: '12 weeks', text: 'Post knee replacement, the team here made recovery seamless. Exercises and sessions were perfectly planned.', avatar: 'RP', image: '/images/testimonials/testimonial_rajesh_patel.png' },
  { name: 'Meena Joshi', location: 'Surat', rating: 5, condition: 'Stroke Rehab', duration: '6 months', text: 'My mother had a stroke and could not walk. After 6 months of rehabilitation at SAI, she walks independently.', avatar: 'MJ', image: '/images/testimonials/testimonial_meena_joshi.png' },
  { name: 'Vikram Shah', location: 'Vadodara', rating: 5, condition: 'Cervical Pain', duration: '5 weeks', text: 'Cervical pain was affecting my work daily. Within 10 sessions I felt 80% better. Excellent professional approach.', avatar: 'VS', image: '/images/testimonials/testimonial_vikram_shah.png' },
  { name: 'Anita Desai', location: 'Ahmedabad', rating: 4, condition: 'Sports Injury', duration: '8 weeks', text: 'As a runner with a ligament tear, SAI\'s sports rehab program got me back on the track in record time.', avatar: 'AD' },
  { name: 'Harish Kumar', location: 'Rajkot', rating: 5, condition: 'Frozen Shoulder', duration: '8 weeks', text: 'Full mobility restored in 8 weeks. The physiotherapists here are world-class. I can drive and sleep again.', avatar: 'HK' },
  { name: 'Sita Bhatt', location: 'Ahmedabad', rating: 5, condition: 'Post-Op Hip', duration: '10 weeks', text: 'After hip replacement I was scared. The team gave me confidence and got me walking normally within weeks.', avatar: 'SB' },
  { name: 'Arun Malhotra', location: 'Ahmedabad', rating: 5, condition: 'Sciatica', duration: '12 weeks', text: 'Sciatica was unbearable. After 12 sessions, I am completely pain free.', avatar: 'AM' },
  { name: 'Kavita Rao', location: 'Anand', rating: 5, condition: 'Pediatric Neuro', duration: 'Ongoing', text: 'My son has cerebral palsy. The pediatric physio team has helped him achieve milestones we thought impossible.', avatar: 'KR' },
];

const CONDITIONS = ['All', 'Back Pain', 'Knee Replacement', 'Stroke Rehab', 'Cervical Pain', 'Sports Injury', 'Frozen Shoulder'];
const RATINGS: { label: string; min: number }[] = [
  { label: 'All', min: 0 },
  { label: '5 stars', min: 5 },
  { label: '4+ stars', min: 4 },
  { label: '3+ stars', min: 3 },
];

export default function TestimonialsPage() {
  const [condition, setCondition] = useState('All');
  const [ratingMin, setRatingMin] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', condition: '', review: '', rating: 5 });

  const filtered = useMemo(
    () => TESTIMONIALS.filter((t) =>
      (condition === 'All' || t.condition === condition) && t.rating >= ratingMin),
    [condition, ratingMin],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroMesh} />
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>Patient Stories</p>
          <h1 className={styles.heroTitle}>Real Stories, <span className="gradient-text">Real Results</span></h1>
          <p className={styles.heroDesc}>500+ patients have shared their recovery journeys with us.</p>
          <div className={`glass-card ${styles.ratingBanner}`}>
            <span className={styles.stars}>
              {Array.from({ length: 5 }).map((_, i) => (<i key={i} className="ri-star-fill" />))}
            </span>
            <span className={styles.ratingNum}>4.9 / 5.0</span>
            <span className={styles.ratingMeta}>Based on 500+ Google Reviews</span>
          </div>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Condition</span>
              <div className={styles.chipGroup}>
                {CONDITIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={`${styles.chip} ${condition === c ? styles.chipActive : ''}`}
                  >{c}</button>
                ))}
              </div>
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Rating</span>
              <div className={styles.chipGroup}>
                {RATINGS.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setRatingMin(r.min)}
                    className={`${styles.chip} ${ratingMin === r.min ? styles.chipActive : ''}`}
                  >{r.label}</button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.masonry}>
            {filtered.map((t) => (
              <div key={t.name + t.condition} className={styles.card}>
                <i className={`ri-double-quotes-l ${styles.quote}`} />
                <span className={styles.stars}>
                  {Array.from({ length: t.rating }).map((_, j) => (<i key={j} className="ri-star-fill" />))}
                </span>
                <p className={styles.text}>&ldquo;{t.text}&rdquo;</p>
                <div className={styles.metaRow}>
                  <span className={styles.condChip}>{t.condition}</span>
                  <span className={styles.durChip}><i className="ri-time-line" /> {t.duration}</span>
                </div>
                <div className={styles.author}>
                  {t.image ? (
                    <div className={styles.avatar} style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
                      <Image src={t.image} alt={t.name} fill sizes="48px" style={{ objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div className={styles.avatar}>{t.avatar}</div>
                  )}
                  <div>
                    <p className={styles.authorName}>{t.name}</p>
                    <p className={styles.authorMeta}>{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className={styles.empty}>
              <i className="ri-chat-3-line" />
              <p>No reviews match those filters.</p>
            </div>
          )}

          <div className={styles.submitSection}>
            <div className={styles.submitInner}>
              <h2>Share Your Story</h2>
              <p>Recovered with us? Help others by sharing your experience.</p>
              {submitted ? (
                <div className={styles.thanks}>
                  <i className="ri-checkbox-circle-fill" />
                  <span>Thank you! Your testimonial has been received.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                    <input
                      placeholder="Your name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={styles.input}
                    />
                    <input
                      placeholder="Condition treated"
                      required
                      value={form.condition}
                      onChange={(e) => setForm({ ...form, condition: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  <textarea
                    placeholder="Share your recovery journey..."
                    rows={4}
                    required
                    value={form.review}
                    onChange={(e) => setForm({ ...form, review: e.target.value })}
                    className={styles.textarea}
                  />
                  <div className={styles.ratingRow}>
                    <span>Your rating:</span>
                    <div className={styles.starPicker}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          type="button"
                          key={n}
                          onClick={() => setForm({ ...form, rating: n })}
                          className={`${styles.starBtn} ${form.rating >= n ? styles.starOn : ''}`}
                          aria-label={`${n} stars`}
                        ><i className="ri-star-fill" /></button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className={styles.submitBtn}>
                    <i className="ri-send-plane-line" /> Submit Testimonial
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
