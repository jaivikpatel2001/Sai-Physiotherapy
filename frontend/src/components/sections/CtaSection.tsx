'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import styles from './CtaSection.module.css';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';
const PHONE = process.env.NEXT_PUBLIC_CLINIC_PHONE || '+919999999999';

export default function CtaSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={styles.section} ref={ref}>
      <div className="container">
        <motion.div
          className={styles.box}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* LEFT — clinic image with floating badge */}
          <div className={styles.media}>
            <Image
              src="/images/therapy/consultation_doctor_patient.png"
              alt="SAI Physiotherapy specialist consulting a patient"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
            <div className={styles.mediaOverlay} />

            <div className={styles.statBadge}>
              <span className={styles.statNum}>10,000+</span>
              <span className={styles.statLabel}>patients recovered</span>
            </div>

            <div className={styles.responseBadge}>
              <span className={styles.responseDot} />
              30-min response
            </div>
          </div>

          {/* RIGHT — content */}
          <div className={styles.content}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              Take the first step
            </span>
            <h2 className={styles.heading}>
              Ready to move <span className={styles.gradHi}>pain-free?</span>
            </h2>
            <p className={styles.sub}>
              Speak to a specialist today. Personalised, evidence-based recovery
              plans built around your goals — with a 30-minute response promise.
            </p>

            <div className={styles.actions}>
              <Link href="/book-appointment" className={styles.btnPrimary}>
                <i className="ri-calendar-2-line" style={{ fontSize: 18 }} />
                Book Appointment
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP}?text=Hi, I'd like to book an appointment`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnWhatsApp}
              >
                <i className="ri-whatsapp-line" style={{ fontSize: 18 }} /> WhatsApp
              </a>
            </div>

            <a href={`tel:${PHONE}`} className={styles.callLink}>
              <i className="ri-phone-line" style={{ fontSize: 16 }} />
              <span>
                Or call directly · <strong>+91 99999 99999</strong>
              </span>
            </a>

            <ul className={styles.trustList}>
              <li><i className="ri-checkbox-circle-fill" style={{ fontSize: 18 }} /> No referral needed — book directly</li>
              <li><i className="ri-checkbox-circle-fill" style={{ fontSize: 18 }} /> Verified BPT &amp; MPT specialists</li>
              <li><i className="ri-checkbox-circle-fill" style={{ fontSize: 18 }} /> 4.9 ★ rating from 500+ verified patients</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
