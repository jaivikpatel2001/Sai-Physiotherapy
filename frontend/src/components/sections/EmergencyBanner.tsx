'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import styles from './EmergencyBanner.module.css';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';
const PHONE = process.env.NEXT_PUBLIC_CLINIC_PHONE || '+919999999999';

export default function EmergencyBanner() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={styles.section} ref={ref}>
      <div className={styles.bg} />
      <div className="container">
        <motion.div
          className={styles.inner}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.textBlock}>
            <div className={styles.emergencyTag}>
              <span className={styles.pulse} />
              Available 7 Days a Week
            </div>
            <h2 className={styles.title}>
              Ready to Start Your<br />
              <span className={styles.highlight}>Recovery Journey?</span>
            </h2>
            <p className={styles.desc}>
              Don&apos;t let pain control your life. Our expert physiotherapists are
              here to help you heal faster. Book a consultation today — same-day
              appointments often available.
            </p>
            <div className={styles.info}>
              <div className={styles.infoItem}>
                <i className="ri-time-line" style={{ fontSize: 16 }} />
                <span>Mon–Fri: 8AM–8PM · Sat: 8AM–6PM · Sun: 9AM–1PM</span>
              </div>
              <div className={styles.infoItem}>
                <i className="ri-map-pin-line" style={{ fontSize: 16 }} />
                <span>Ahmedabad, Gujarat · Easily accessible by metro</span>
              </div>
            </div>
          </div>

          <div className={styles.ctas}>
            <Link href="/book-appointment" className={styles.bookBtn}>
              <i className="ri-calendar-line" style={{ fontSize: 20 }} />
              Book Appointment Online
            </Link>
            <a href={`tel:${PHONE}`} className={styles.callBtn}>
              <i className="ri-phone-line" style={{ fontSize: 20 }} />
              Call Us Now
            </a>
            <a
              href={`https://wa.me/${WHATSAPP}?text=Hello! I'd like to book a physiotherapy appointment.`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.waBtn}
            >
              <i className="ri-whatsapp-line" style={{ fontSize: 20 }} />
              WhatsApp Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
