'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2, Microscope, Clock, Star, Heart, Stethoscope } from 'lucide-react';
import styles from './WhyChooseSection.module.css';

const FEATURES = [
  { icon: <Stethoscope size={22} />, title: 'Expert Physiotherapists', desc: 'BPT & MPT qualified doctors with 10+ years experience each.' },
  { icon: <Microscope size={22} />, title: 'Advanced Technology', desc: 'IFT, TENS, Ultrasound Therapy, Laser, Traction & more.' },
  { icon: <CheckCircle2 size={22} />, title: 'Evidence-Based Treatment', desc: 'All protocols backed by international research and clinical guidelines.' },
  { icon: <Clock size={22} />, title: 'Flexible Appointment Times', desc: 'Open 7 days a week, 8 AM to 8 PM including Sundays.' },
  { icon: <Heart size={22} />, title: 'Patient-Centric Care', desc: 'Personalized treatment plans tailored to each patient\'s unique needs.' },
  { icon: <Star size={22} />, title: '4.9★ Google Rating', desc: '500+ five-star reviews from satisfied patients across Gujarat.' },
];

const TECH = ['IFT Therapy', 'TENS', 'Ultrasound', 'Laser Therapy', 'Cervical Traction', 'Lumbar Traction', 'Hot/Cold Therapy', 'Dry Needling', 'Kinesio Taping', 'Exercise Therapy'];

export default function WhyChooseSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={`section ${styles.section}`} ref={ref}>
      <div className={styles.bgShape} />
      <div className="container">
        <div className={styles.layout}>
          {/* Left — Visual */}
          <motion.div
            className={styles.visual}
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.visualCard}>
              <div className={styles.visualTop}>
                <div className={styles.clinicIcon}>🏥</div>
                <div>
                  <h3 className={styles.clinicName}>SAI Physiotherapy</h3>
                  <p className={styles.clinicTag}>Spine Care & Paralysis Centre</p>
                </div>
              </div>

              <div className={styles.ratingBlock}>
                <div className={styles.ratingStars}>{'★'.repeat(5)}</div>
                <p className={styles.ratingNum}>4.9 / 5.0</p>
                <p className={styles.ratingCount}>Based on 500+ reviews</p>
              </div>

              <div className={styles.techStack}>
                <p className={styles.techLabel}>Advanced Machines & Techniques</p>
                <div className={styles.techTags}>
                  {TECH.map((t) => (
                    <span key={t} className={styles.techTag}>{t}</span>
                  ))}
                </div>
              </div>

              <div className={styles.milestones}>
                <div className={styles.milestone}>
                  <span className={styles.milestoneNum}>2009</span>
                  <span className={styles.milestoneTxt}>Founded</span>
                </div>
                <div className={styles.milestoneDivider} />
                <div className={styles.milestone}>
                  <span className={styles.milestoneNum}>10K+</span>
                  <span className={styles.milestoneTxt}>Patients</span>
                </div>
                <div className={styles.milestoneDivider} />
                <div className={styles.milestone}>
                  <span className={styles.milestoneNum}>12+</span>
                  <span className={styles.milestoneTxt}>Doctors</span>
                </div>
              </div>
            </div>

            {/* Floating card */}
            <motion.div
              className={styles.floatCard}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            >
              <div className={styles.floatIcon}>🏆</div>
              <div>
                <p className={styles.floatTitle}>NABH Compliant</p>
                <p className={styles.floatSub}>Quality Assured Care</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Content */}
          <div className={styles.content}>
            <motion.p
              className="section-label"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              Why Choose Us
            </motion.p>
            <motion.h2
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Gujarat&apos;s Most <span>Trusted</span> Physiotherapy Centre
            </motion.h2>
            <motion.p
              className="section-desc"
              style={{ textAlign: 'left', marginBottom: '2rem' }}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              We combine clinical expertise, cutting-edge technology, and compassionate care
              to deliver the best possible outcomes for every patient.
            </motion.p>

            <div className={styles.features}>
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  className={styles.featureItem}
                  initial={{ opacity: 0, x: 30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
                >
                  <div className={styles.featureIcon}>{f.icon}</div>
                  <div>
                    <h4 className={styles.featureTitle}>{f.title}</h4>
                    <p className={styles.featureDesc}>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
