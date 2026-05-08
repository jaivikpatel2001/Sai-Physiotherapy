'use client';
import { useState } from 'react';
import styles from './contact.module.css';

const CONTACT_INFO = [
  { icon: 'ri-phone-line', label: 'Phone', value: '+91 99999 99999', href: 'tel:+919999999999' },
  { icon: 'ri-mail-line', label: 'Email', value: 'clinic@saiphysiotherapy.com', href: 'mailto:clinic@saiphysiotherapy.com' },
  { icon: 'ri-map-pin-line', label: 'Address', value: 'SAI Physiotherapy, Ahmedabad, Gujarat 380001', href: 'https://maps.google.com' },
  { icon: 'ri-time-line', label: 'Hours', value: 'Mon–Fri 8AM–8PM · Sat 8AM–6PM · Sun 9AM–1PM', href: null as string | null },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>Get In Touch</p>
          <h1 className={styles.heroTitle}>Contact <span>SAI Physiotherapy</span></h1>
          <p className={styles.heroDesc}>Have a question or need to book an appointment? We&apos;re here to help you start your recovery journey.</p>
        </div>
      </div>

      <section className={`section ${styles.content}`}>
        <div className="container">
          <div className={styles.layout}>
            {/* Contact Info */}
            <div className={styles.infoPanel}>
              <h2 className={styles.infoTitle}>How to Reach Us</h2>
              <div className={styles.infoList}>
                {CONTACT_INFO.map((c) => (
                  <div key={c.label} className={styles.infoItem}>
                    <div className={styles.infoIcon}><i className={c.icon} style={{ fontSize: 22 }} /></div>
                    <div>
                      <p className={styles.infoLabel}>{c.label}</p>
                      {c.href ? (
                        <a href={c.href} className={styles.infoValue} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{c.value}</a>
                      ) : (
                        <p className={styles.infoValue}>{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp */}
              <a
                href="https://wa.me/919999999999?text=Hello! I have a question about physiotherapy."
                target="_blank"
                rel="noopener noreferrer"
                className={styles.waBtn}
              >
                <i className="ri-whatsapp-line" style={{ fontSize: 20 }} />
                Chat on WhatsApp
              </a>

              {/* Map embed */}
              <div className={styles.mapBox}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235013.68897883285!2d72.74952505!3d23.02063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="220"
                  style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  title="SAI Physiotherapy location"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className={styles.formPanel}>
              {submitted ? (
                <div className={styles.successState}>
                  <i className={`ri-checkbox-circle-line ${styles.successIcon}`} style={{ fontSize: 56 }} />
                  <h2>Message Sent!</h2>
                  <p>Thank you for reaching out. Our team will contact you within 2 hours during working hours.</p>
                  <button onClick={() => setSubmitted(false)} className={styles.resetBtn}>Send Another Message</button>
                </div>
              ) : (
                <>
                  <h2 className={styles.formTitle}>Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formRow}>
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input className="form-input" placeholder="Your full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number *</label>
                        <input className="form-input" type="tel" placeholder="+91 XXXXX XXXXX" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject *</label>
                      <select className="form-input" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                        <option value="">Select a subject</option>
                        <option>Book an Appointment</option>
                        <option>Ask About a Service</option>
                        <option>Feedback / Complaint</option>
                        <option>General Enquiry</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message *</label>
                      <textarea className="form-input" rows={5} placeholder="Tell us about your condition or question..." required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={{ resize: 'vertical' }} />
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading ? (
                        <span className={styles.spinner} />
                      ) : (
                        <><i className="ri-send-plane-line" style={{ fontSize: 18 }} /> Send Message</>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
