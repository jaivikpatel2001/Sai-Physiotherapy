import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About SAI Physiotherapy — Our Story, Mission & Team',
  description: 'Learn about SAI Physiotherapy Spine Care & Paralysis Centre — Gujarat\'s leading physiotherapy center since 2009. Our mission, values, and expert team.',
};

const MILESTONES = [
  { year: '2009', title: 'Founded', desc: 'SAI Physiotherapy opened its doors in Ahmedabad with a vision to provide world-class physiotherapy care.' },
  { year: '2013', title: 'Expanded', desc: 'Grew to a 5,000 sq ft facility with 10+ treatment bays and advanced electrotherapy equipment.' },
  { year: '2017', title: '5,000 Patients', desc: 'Crossed the milestone of 5,000 successfully treated patients across all specializations.' },
  { year: '2021', title: 'NABH Compliant', desc: 'Achieved NABH compliance — the gold standard for healthcare quality in India.' },
  { year: '2024', title: '10,000+ Patients', desc: 'Serving 10,000+ patients with a 95% recovery rate and 4.9-star Google rating.' },
];

const VALUES = [
  { icon: 'ri-heart-line', title: 'Patient First', desc: 'Every decision starts with patient wellbeing. Compassionate care is non-negotiable.' },
  { icon: 'ri-focus-3-line', title: 'Evidence-Based', desc: 'All treatment protocols are grounded in the latest clinical research and best practices.' },
  { icon: 'ri-award-line', title: 'Excellence', desc: 'We continuously invest in education, technology, and processes to deliver the best outcomes.' },
  { icon: 'ri-team-line', title: 'Collaboration', desc: 'Our multidisciplinary team works together to create the most effective recovery plans.' },
  { icon: 'ri-line-chart-line', title: 'Innovation', desc: 'We embrace new physiotherapy technologies and techniques to accelerate recovery.' },
  { icon: 'ri-checkbox-circle-line', title: 'Integrity', desc: 'Honest diagnosis, transparent pricing, and ethical practice — always.' },
];

const CERTIFICATIONS = [
  'NABH Compliant Physiotherapy Practice',
  'ISO 9001:2015 Certified',
  'Registered with Physiotherapy Council of India',
  'Member — Indian Association of Physiotherapists',
  'Affiliated with B.J. Medical College, Ahmedabad',
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <p className="section-label">Our Story</p>
              <h1 className={styles.heroTitle}>
                15 Years of <span className="gradient-text">Healing Lives</span><br />Across Gujarat
              </h1>
              <p className={styles.heroDesc}>
                Founded in 2009, SAI Physiotherapy Spine Care & Paralysis Centre has grown from
                a single-room clinic to Gujarat&apos;s most trusted physiotherapy destination —
                treating over 10,000 patients and counting.
              </p>
              <div className={styles.heroStats}>
                {[
                  { num: '2009', label: 'Established' },
                  { num: '10K+', label: 'Patients Healed' },
                  { num: '4.9', label: 'Google Rating' },
                  { num: '12+', label: 'Doctors' },
                ].map((s) => (
                  <div key={s.label} className={styles.heroStat}>
                    <span className={styles.heroStatNum}>{s.num}</span>
                    <span className={styles.heroStatLabel}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.clinicCard}>
                <div className={styles.clinicEmoji}><i className="ri-hospital-line" style={{ fontSize: 48 }} /></div>
                <h2>SAI Physiotherapy</h2>
                <p>Spine Care & Paralysis Centre</p>
                <div className={styles.certList}>
                  {CERTIFICATIONS.slice(0, 3).map((c) => (
                    <div key={c} className={styles.certItem}>
                      <i className="ri-checkbox-circle-line" style={{ fontSize: 14 }} /> {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className={`section ${styles.missionSection}`}>
        <div className="container">
          <div className={styles.missionGrid}>
            <div className={styles.missionCard}>
              <div className={styles.missionIcon}><i className="ri-focus-3-line" style={{ fontSize: 32 }} /></div>
              <h2>Our Mission</h2>
              <p>
                To provide evidence-based, patient-centred physiotherapy care that empowers individuals
                to recover fully, prevent re-injury, and achieve their highest functional potential —
                without compromising on quality or compassion.
              </p>
            </div>
            <div className={styles.missionCard}>
              <div className={styles.missionIcon}><i className="ri-eye-line" style={{ fontSize: 32 }} /></div>
              <h2>Our Vision</h2>
              <p>
                To be Gujarat&apos;s benchmark physiotherapy institution, setting the standard for
                clinical excellence, patient experience, and community health education
                across all specializations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={`section ${styles.valuesSection}`}>
        <div className="container">
          <div className="section-header">
            <p className="section-label">What Drives Us</p>
            <h2 className="section-title">Our Core <span>Values</span></h2>
            <p className="section-desc">The principles that guide every treatment decision, patient interaction, and business choice we make.</p>
          </div>
          <div className={styles.valuesGrid}>
            {VALUES.map((v) => (
              <div key={v.title} className={styles.valueCard}>
                <div className={styles.valueIcon}><i className={v.icon} style={{ fontSize: 28 }} /></div>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className={`section ${styles.timelineSection}`}>
        <div className="container">
          <div className="section-header">
            <p className="section-label">Our Journey</p>
            <h2 className="section-title">15 Years of <span>Growth</span></h2>
          </div>
          <div className={styles.timeline}>
            {MILESTONES.map((m, i) => (
              <div key={m.year} className={`${styles.timelineItem} ${i % 2 === 0 ? styles.left : styles.right}`}>
                <div className={styles.timelineCard}>
                  <span className={styles.timelineYear}>{m.year}</span>
                  <h3 className={styles.timelineTitle}>{m.title}</h3>
                  <p className={styles.timelineDesc}>{m.desc}</p>
                </div>
                <div className={styles.timelineDot} />
              </div>
            ))}
            <div className={styles.timelineLine} />
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className={`section ${styles.certSection}`}>
        <div className="container">
          <div className="section-header">
            <p className="section-label">Quality Assured</p>
            <h2 className="section-title">Certifications & <span>Accreditations</span></h2>
          </div>
          <div className={styles.certGrid}>
            {CERTIFICATIONS.map((c) => (
              <div key={c} className={styles.certCard}>
                <i className={`ri-checkbox-circle-line ${styles.certCheck}`} style={{ fontSize: 22 }} />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaBox}>
            <h2>Ready to Experience the SAI Difference?</h2>
            <p>Join 10,000+ patients who have trusted us with their recovery. Book your consultation today.</p>
            <div className={styles.ctaBtns}>
              <Link href="/book-appointment" className={styles.ctaPrimary}>Book Appointment</Link>
              <Link href="/contact" className={styles.ctaSecondary}>Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
