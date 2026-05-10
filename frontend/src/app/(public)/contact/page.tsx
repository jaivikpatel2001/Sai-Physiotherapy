'use client';
import { useState } from 'react';
import Image from 'next/image';
import styles from './contact.module.css';

const CHANNELS = [
  { icon: 'ri-phone-line', label: 'Call Us', value: '+91 99999 99999', cta: 'Call Now', href: 'tel:+919999999999', tint: 'sky' },
  { icon: 'ri-whatsapp-line', label: 'WhatsApp', value: 'Quick replies, all day', cta: 'Chat on WhatsApp', href: 'https://wa.me/919999999999?text=Hi, I have a question', tint: 'mint' },
  { icon: 'ri-mail-line', label: 'Email', value: 'clinic@saiphysiotherapy.com', cta: 'Send Email', href: 'mailto:clinic@saiphysiotherapy.com', tint: 'blush' },
  { icon: 'ri-map-pin-line', label: 'Visit', value: 'Ahmedabad, Gujarat', cta: 'Get Directions', href: 'https://maps.google.com/maps?q=Ahmedabad+Gujarat', tint: 'sand' },
];

const HOURS = [
  { day: 'Monday', hours: '8:00 AM – 8:00 PM', open: true },
  { day: 'Tuesday', hours: '8:00 AM – 8:00 PM', open: true },
  { day: 'Wednesday', hours: '8:00 AM – 8:00 PM', open: true },
  { day: 'Thursday', hours: '8:00 AM – 8:00 PM', open: true },
  { day: 'Friday', hours: '8:00 AM – 8:00 PM', open: true },
  { day: 'Saturday', hours: '8:00 AM – 6:00 PM', open: true },
  { day: 'Sunday', hours: '9:00 AM – 1:00 PM', open: true },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', preferredTime: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroMesh} />
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>Get In Touch</p>
          <h1 className={styles.heroTitle}>
            Contact <span className="gradient-text">SAI Physiotherapy</span>
          </h1>
          <p className={styles.heroDesc}>
            Have a question or ready to book? We&apos;re here — pick the channel that suits you best.
          </p>
        </div>
      </section>

      <section className={styles.channelsSection}>
        <div className="container">
          <div className={styles.channelsCard}>
            {CHANNELS.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={c.cta}
                className={`${styles.channelCard} ${styles[`tint_${c.tint}`]}`}
              >
                <div className={styles.channelIcon}>
                  <i className={c.icon} />
                </div>
                <div className={styles.channelBody}>
                  <span className={styles.channelLabel}>{c.label}</span>
                  <span className={styles.channelValue}>{c.value}</span>
                </div>
                <i className={`ri-arrow-right-up-line ${styles.channelArrow}`} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.bodySection}>
        <div className="container">
          <div className={styles.bodyGrid}>
            <div className={styles.formCard}>
              <h2 className={styles.h2}>Quick Inquiry</h2>
              <p className={styles.subText}>Send us a quick message and we&apos;ll get back within 2 hours.</p>
              {submitted ? (
                <div className={styles.successState}>
                  <div className={styles.successCheck}>
                    <i className="ri-checkbox-circle-fill" />
                  </div>
                  <h3>Message Sent!</h3>
                  <p>Thank you. Our team will reach out within 2 hours during working hours.</p>
                  <button onClick={() => setSubmitted(false)} className={styles.againBtn}>
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Full Name <span className={styles.req}>*</span></label>
                      <input
                        className={styles.input}
                        placeholder="Your full name"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Phone <span className={styles.req}>*</span></label>
                      <input
                        type="tel"
                        className={styles.input}
                        placeholder="+91 XXXXX XXXXX"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Email</label>
                    <input
                      type="email"
                      className={styles.input}
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Preferred contact time</label>
                    <select
                      className={styles.input}
                      value={form.preferredTime}
                      onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                    >
                      <option value="">Anytime</option>
                      <option>Morning (8 AM – 12 PM)</option>
                      <option>Afternoon (12 – 4 PM)</option>
                      <option>Evening (4 – 8 PM)</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Message <span className={styles.req}>*</span></label>
                    <textarea
                      className={styles.textarea}
                      rows={5}
                      placeholder="Tell us about your condition or question..."
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>
                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? <span className={styles.spinner} /> : <><i className="ri-send-plane-line" /> Send Message</>}
                  </button>
                </form>
              )}
            </div>

            <div className={styles.mapCard}>
              <h2 className={styles.h2}>Find Us</h2>
              <p className={styles.subText}>Convenient location with on-site parking.</p>
              <div className={styles.mapWrap}>
                <Image
                  src="/images/clinic/contact_map_clinic.png"
                  alt="SAI Physiotherapy clinic location in Ahmedabad"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
                <a
                  href="https://maps.google.com/maps?q=SAI+Physiotherapy+Ahmedabad"
                  target="_blank" rel="noopener noreferrer"
                  className={styles.mapOverlayBtn}
                >
                  <i className="ri-external-link-line" /> Open in Google Maps
                </a>
              </div>
              <a
                href="https://maps.google.com/maps?q=SAI+Physiotherapy+Ahmedabad"
                target="_blank" rel="noopener noreferrer"
                className={styles.mapCta}
              >
                <i className="ri-route-line" /> Get Directions
              </a>
            </div>
          </div>

          <div className={styles.hoursCard}>
            <div className={styles.hoursHead}>
              <h2 className={styles.h2}>Working Hours</h2>
              <span className={styles.openPill}>
                <span className={styles.openDot} /> Open Now
              </span>
            </div>
            <div className={styles.hoursTable}>
              {HOURS.map((h, i) => (
                <div key={h.day} className={`${styles.hoursRow} ${i === todayIdx ? styles.hoursToday : ''}`}>
                  <span className={styles.hoursDay}>{h.day}{i === todayIdx && <span className={styles.todayBadge}>Today</span>}</span>
                  <span className={styles.hoursTime}>{h.hours}</span>
                  <span className={`${styles.hoursStatus} ${h.open ? styles.statusOpen : styles.statusClosed}`}>
                    {h.open ? 'Open' : 'Closed'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.emergencyBanner}>
            <div className={styles.emergencyIcon}>
              <i className="ri-alarm-warning-line" />
            </div>
            <div className={styles.emergencyBody}>
              <h3>Emergency? Call us 24/7</h3>
              <p>For urgent post-op or post-stroke recovery needs, our emergency line is always open.</p>
            </div>
            <a href="tel:+919999999999" className={styles.emergencyBtn}>
              <i className="ri-phone-fill" /> Emergency Line
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
