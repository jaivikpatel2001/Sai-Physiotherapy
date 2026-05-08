'use client';
import { useState } from 'react';
import type { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import styles from './contact.module.css';

const CONTACT_INFO = [
  { icon: <Phone size={22} />, label: 'Phone', value: '+91 99999 99999', href: 'tel:+919999999999' },
  { icon: <Mail size={22} />, label: 'Email', value: 'clinic@saiphysiotherapy.com', href: 'mailto:clinic@saiphysiotherapy.com' },
  { icon: <MapPin size={22} />, label: 'Address', value: 'SAI Physiotherapy, Ahmedabad, Gujarat 380001', href: 'https://maps.google.com' },
  { icon: <Clock size={22} />, label: 'Hours', value: 'Mon–Fri 8AM–8PM · Sat 8AM–6PM · Sun 9AM–1PM', href: null },
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
                    <div className={styles.infoIcon}>{c.icon}</div>
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
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
                  <CheckCircle2 size={56} className={styles.successIcon} />
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
                        <><Send size={18} /> Send Message</>
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
