'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import styles from './ServicesSection.module.css';

const SERVICES = [
  { icon: '🦴', title: 'Back Pain Treatment', slug: 'back-pain-treatment', desc: 'Expert treatment for all types of back pain using advanced physiotherapy and personalized care.', color: '#EBF3FF' },
  { icon: '🧠', title: 'Spine Care & Disc Problems', slug: 'spine-care-disc-problems', desc: 'Specialized treatment for disc herniation, spondylosis, and other spinal conditions.', color: '#FEF3C7' },
  { icon: '🫀', title: 'Paralysis Rehabilitation', slug: 'paralysis-rehabilitation', desc: 'Comprehensive rehab programs for stroke, spinal injury and other paralysis conditions.', color: '#D1FAE5' },
  { icon: '🦵', title: 'Knee Pain & Joint Care', slug: 'knee-pain-joint-care', desc: 'Effective treatment for knee pain, osteoarthritis, ligament injuries and post-surgical rehab.', color: '#FCE7F3' },
  { icon: '🏃', title: 'Sports Injury Rehabilitation', slug: 'sports-injury-rehabilitation', desc: 'Rapid recovery programs for athletes with sports-related injuries and performance training.', color: '#DBEAFE' },
  { icon: '⚡', title: 'Neuro Physiotherapy', slug: 'neuro-physiotherapy', desc: "Specialized care for Parkinson's, MS, cerebral palsy, and stroke with expert neuro therapists.", color: '#EDE9FE' },
  { icon: '🤕', title: 'Neck Pain & Cervical Care', slug: 'neck-pain-cervical-spondylosis', desc: 'Targeted treatment for neck pain, cervical spondylosis, whiplash and cervicogenic headaches.', color: '#FEF9C3' },
  { icon: '🏥', title: 'Post-Surgery Rehabilitation', slug: 'post-surgery-rehabilitation', desc: 'Accelerate your recovery after orthopedic surgeries with structured rehabilitation protocols.', color: '#ECFDF5' },
  { icon: '👶', title: 'Pediatric Physiotherapy', slug: 'pediatric-physiotherapy', desc: 'Gentle, effective physiotherapy for children with developmental delays and musculoskeletal conditions.', color: '#FFF7ED' },
  { icon: '🧓', title: 'Geriatric Care', slug: 'geriatric-care', desc: 'Specialized programs for elderly patients to maintain independence and prevent falls.', color: '#F0FDF4' },
  { icon: '💪', title: 'Shoulder Pain Treatment', slug: 'shoulder-pain-treatment', desc: 'Comprehensive treatment for rotator cuff injuries, shoulder impingement, and chronic pain.', color: '#EFF6FF' },
  { icon: '❄️', title: 'Frozen Shoulder', slug: 'frozen-shoulder', desc: 'Specialized treatment for adhesive capsulitis to restore full movement and eliminate pain.', color: '#F5F3FF' },
];

export default function ServicesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        <div className="section-header">
          <motion.p
            className="section-label"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Our Specializations
          </motion.p>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            12+ <span>Specialized</span> Treatment Areas
          </motion.h2>
          <motion.p
            className="section-desc"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.16 }}
          >
            From acute injuries to chronic conditions, our expert physiotherapists deliver
            evidence-based treatments tailored to your unique recovery journey.
          </motion.p>
        </div>

        <div className={styles.grid}>
          {SERVICES.map((svc, i) => (
            <motion.div
              key={svc.slug}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.05 * (i % 4), duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/services/${svc.slug}`} className={styles.card}>
                <div className={styles.cardIcon} style={{ background: svc.color }}>
                  <span>{svc.icon}</span>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{svc.title}</h3>
                  <p className={styles.cardDesc}>{svc.desc}</p>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.learnMore}>
                    Learn more <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          className={styles.viewAll}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link href="/services" className={styles.viewAllBtn}>
            Explore All Services <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
