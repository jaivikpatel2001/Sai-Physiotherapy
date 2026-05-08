'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
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
          <div className={styles.glow1} />
          <div className={styles.glow2} />

          <div className={styles.content}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} /> Take the first step
            </span>
            <h2 className={styles.heading}>
              Ready to Move <br className={styles.brHide} />
              <span className={styles.gradHi}>Pain-Free?</span>
            </h2>
            <p className={styles.sub}>
              Speak to a specialist today. Personalised, evidence-based recovery plans —
              with a 30-minute response promise.
            </p>

            <div className={styles.actions}>
              <Link href="/book-appointment" className={styles.btnLight}>
                <i className="ri-calendar-2-line" style={{ fontSize: 18 }} />
                Book Appointment
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP}?text=Hi, I'd like to book an appointment`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnOutline}
              >
                <i className="ri-whatsapp-line" style={{ fontSize: 18 }} /> WhatsApp
              </a>
              <a href={`tel:${PHONE}`} className={styles.btnOutline}>
                <i className="ri-phone-line" style={{ fontSize: 18 }} /> Call Now
              </a>
            </div>

            <div className={styles.trustRow}>
              <span><i className="ri-checkbox-circle-fill" style={{ fontSize: 14 }} /> No referral needed</span>
              <span><i className="ri-checkbox-circle-fill" style={{ fontSize: 14 }} /> 30-min response</span>
              <span><i className="ri-checkbox-circle-fill" style={{ fontSize: 14 }} /> Verified specialists</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
