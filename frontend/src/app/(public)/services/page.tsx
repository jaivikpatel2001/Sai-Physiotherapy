import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './services.module.css';

export const metadata: Metadata = {
  title: 'Physiotherapy Services — Back Pain, Spine Care, Paralysis & More',
  description: 'Explore our 12+ specialized physiotherapy services in Ahmedabad. Expert treatment for back pain, spine care, paralysis rehabilitation, sports injuries, and more.',
};

const SERVICES = [
  { icon: 'ri-walk-line', title: 'Back Pain Treatment', slug: 'back-pain-treatment', category: 'Spine & Back', price: '₹500 – ₹2,000', sessions: '8–12 sessions', desc: 'Expert treatment for all types of back pain using advanced physiotherapy techniques and personalized care plans.', benefits: ['Pain relief without surgery', 'Improved posture & mobility', 'Strengthened back muscles', 'Long-term recovery plan'], color: 'var(--color-primary-50)' },
  { icon: 'ri-mental-health-line', title: 'Spine Care & Disc Problems', slug: 'spine-care-disc-problems', category: 'Spine & Back', price: '₹800 – ₹3,000', sessions: '10–15 sessions', desc: 'Specialized treatment for disc herniation, spondylosis, and other spinal conditions using advanced spinal techniques.', benefits: ['Disc decompression therapy', 'Pain & inflammation reduction', 'Restored mobility', 'Posture correction'], color: 'var(--color-sand-50)' },
  { icon: 'ri-heart-pulse-line', title: 'Paralysis Rehabilitation', slug: 'paralysis-rehabilitation', category: 'Neuro Rehab', price: '₹1,000 – ₹4,000', sessions: '20–30 sessions', desc: 'Comprehensive rehabilitation for stroke, spinal cord injury, and other conditions causing paralysis to maximize functional recovery.', benefits: ['Muscle strength recovery', 'Gait & balance training', 'Daily function independence', 'Neuroplasticity activation'], color: 'var(--color-mint-50)' },
  { icon: 'ri-run-line', title: 'Knee Pain & Joint Care', slug: 'knee-pain-joint-care', category: 'Orthopedics', price: '₹600 – ₹2,500', sessions: '8–15 sessions', desc: 'Effective treatment for knee pain, osteoarthritis, ligament injuries, and post-surgical rehabilitation.', benefits: ['Reduced joint pain', 'Improved range of motion', 'Strengthened supporting muscles', 'Delayed need for surgery'], color: 'var(--color-blush-50)' },
  { icon: 'ri-emotion-unhappy-line', title: 'Neck Pain & Cervical Care', slug: 'neck-pain-cervical-spondylosis', category: 'Spine & Back', price: '₹500 – ₹2,000', sessions: '8–12 sessions', desc: 'Targeted treatment for neck pain, cervical spondylosis, whiplash, and headaches arising from the cervical spine.', benefits: ['Neck pain relief', 'Reduced headaches', 'Improved neck mobility', 'Better posture habits'], color: 'var(--color-lavender-50)' },
  { icon: 'ri-football-line', title: 'Sports Injury Rehabilitation', slug: 'sports-injury-rehabilitation', category: 'Sports', price: '₹800 – ₹3,000', sessions: '10–20 sessions', desc: 'Rapid recovery programs for athletes and active individuals with sports-related injuries.', benefits: ['Faster return to sport', 'Re-injury prevention', 'Performance enhancement', 'Sport-specific conditioning'], color: 'var(--color-primary-50)' },
  { icon: 'ri-flashlight-line', title: 'Neuro Physiotherapy', slug: 'neuro-physiotherapy', category: 'Neuro Rehab', price: '₹1,000 – ₹4,000', sessions: '20+ sessions', desc: "Specialized physiotherapy for neurological conditions including Parkinson's, MS, cerebral palsy, and stroke.", benefits: ["Improved balance & coordination", "Better cognitive-motor function", "Enhanced independence", "Slowed disease progression"], color: 'var(--color-lavender-50)' },
  { icon: 'ri-hospital-line', title: 'Post-Surgery Rehabilitation', slug: 'post-surgery-rehabilitation', category: 'Orthopedics', price: '₹700 – ₹3,000', sessions: '12–20 sessions', desc: 'Accelerate your recovery after orthopedic surgeries with structured rehabilitation protocols designed by experts.', benefits: ['Faster healing', 'Scar tissue management', 'Strength restoration', 'Full function recovery'], color: 'var(--color-mint-50)' },
  { icon: 'ri-parent-line', title: 'Pediatric Physiotherapy', slug: 'pediatric-physiotherapy', category: 'Pediatrics', price: '₹600 – ₹2,500', sessions: '10–20 sessions', desc: 'Gentle and effective physiotherapy for children with developmental delays, cerebral palsy, and musculoskeletal conditions.', benefits: ['Developmental milestones', 'Improved motor skills', 'Better posture', 'Enhanced confidence'], color: 'var(--color-sand-50)' },
  { icon: 'ri-user-heart-line', title: 'Geriatric Care', slug: 'geriatric-care', category: 'Elderly Care', price: '₹500 – ₹2,000', sessions: '10–15 sessions', desc: 'Specialized physiotherapy programs designed for elderly patients to maintain independence and manage chronic conditions.', benefits: ['Fall prevention', 'Improved balance', 'Pain management', 'Maintained independence'], color: 'var(--color-mint-50)' },
  { icon: 'ri-boxing-line', title: 'Shoulder Pain Treatment', slug: 'shoulder-pain-treatment', category: 'Orthopedics', price: '₹600 – ₹2,500', sessions: '8–15 sessions', desc: 'Comprehensive treatment for rotator cuff injuries, shoulder impingement, and chronic shoulder pain.', benefits: ['Pain elimination', 'Full range of motion', 'Strength restoration', 'Injury prevention'], color: 'var(--color-primary-50)' },
  { icon: 'ri-snowy-line', title: 'Frozen Shoulder', slug: 'frozen-shoulder', category: 'Orthopedics', price: '₹700 – ₹3,000', sessions: '12–20 sessions', desc: 'Specialized treatment for adhesive capsulitis (frozen shoulder) to restore movement and eliminate pain.', benefits: ['Full mobility restored', 'Pain relief', 'Faster recovery', 'Prevention of recurrence'], color: 'var(--color-lavender-50)' },
];

export default function ServicesPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>Our Specializations</p>
          <h1 className={styles.heroTitle}>Expert Physiotherapy <span>Services</span></h1>
          <p className={styles.heroDesc}>
            12+ specialized treatment areas. Evidence-based protocols. Compassionate care.
            Every treatment plan is tailored specifically to your condition and goals.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <section className={`section ${styles.services}`}>
        <div className="container">
          <div className={styles.grid}>
            {SERVICES.map((svc) => (
              <Link key={svc.slug} href={`/services/${svc.slug}`} className={styles.card}>
                <div className={styles.cardTop} style={{ background: svc.color }}>
                  <span className={styles.cardEmoji}>
                    <i className={svc.icon} style={{ fontSize: 40, color: 'var(--color-primary)' }} />
                  </span>
                  <span className={styles.cardCategory}>{svc.category}</span>
                </div>
                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>{svc.title}</h2>
                  <p className={styles.cardDesc}>{svc.desc}</p>
                  <ul className={styles.benefits}>
                    {svc.benefits.map((b) => (
                      <li key={b}>
                        <i className="ri-checkbox-circle-line" style={{ fontSize: 14 }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className={styles.cardFooter}>
                    <div className={styles.priceInfo}>
                      <span className={styles.price}>{svc.price}</span>
                      <span className={styles.sessions}>{svc.sessions}</span>
                    </div>
                    <span className={styles.learnMore}>
                      Learn More <i className="ri-arrow-right-line" style={{ fontSize: 14 }} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaBox}>
            <h2>Not sure which treatment you need?</h2>
            <p>Book a free 15-minute consultation and our expert physiotherapists will recommend the right treatment for you.</p>
            <div className={styles.ctaBtns}>
              <Link href="/book-appointment" className={styles.ctaPrimary}>Book Free Consultation</Link>
              <a href="tel:+919999999999" className={styles.ctaSecondary}>Call Us: +91 99999 99999</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
