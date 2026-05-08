'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { Phone, MessageCircle, Clock, MapPin } from 'lucide-react';
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
                <Clock size={16} />
                <span>Mon–Fri: 8AM–8PM · Sat: 8AM–6PM · Sun: 9AM–1PM</span>
              </div>
              <div className={styles.infoItem}>
                <MapPin size={16} />
                <span>Ahmedabad, Gujarat · Easily accessible by metro</span>
              </div>
            </div>
          </div>

          <div className={styles.ctas}>
            <Link href="/book-appointment" className={styles.bookBtn}>
              <span>📅</span>
              Book Appointment Online
            </Link>
            <a href={`tel:${PHONE}`} className={styles.callBtn}>
              <Phone size={20} />
              Call Us Now
            </a>
            <a
              href={`https://wa.me/${WHATSAPP}?text=Hello! I'd like to book a physiotherapy appointment.`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.waBtn}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
