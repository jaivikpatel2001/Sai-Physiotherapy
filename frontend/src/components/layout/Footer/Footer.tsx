'use client';
import Link from 'next/link';
import { useState } from 'react';
import styles from './Footer.module.css';

const SERVICES = [
  { label: 'Back Pain Treatment', href: '/services/back-pain-treatment' },
  { label: 'Spine Care & Disc Problems', href: '/services/spine-care-disc-problems' },
  { label: 'Paralysis Rehabilitation', href: '/services/paralysis-rehabilitation' },
  { label: 'Knee Pain & Joint Care', href: '/services/knee-pain-joint-care' },
  { label: 'Sports Injury', href: '/services/sports-injury-rehabilitation' },
  { label: 'Neuro Physiotherapy', href: '/services/neuro-physiotherapy' },
  { label: 'Frozen Shoulder', href: '/services/frozen-shoulder' },
  { label: 'Pediatric Physiotherapy', href: '/services/pediatric-physiotherapy' },
];

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Our Doctors', href: '/doctors' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Patient Stories', href: '/testimonials' },
  { label: 'Blog & Articles', href: '/blog' },
  { label: 'Book Appointment', href: '/book-appointment' },
  { label: 'Contact Us', href: '/contact' },
];

const BUSINESS_HOURS = [
  { day: 'Mon – Fri', time: '8:00 AM – 8:00 PM' },
  { day: 'Saturday', time: '8:00 AM – 6:00 PM' },
  { day: 'Sunday', time: '9:00 AM – 1:00 PM' },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className={styles.footer}>
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />

      <div className="container">
        {/* Newsletter */}
        <div className={styles.newsletter}>
          <div>
            <h3 className={styles.newsletterTitle}>Health insights, every month</h3>
            <p className={styles.newsletterSub}>
              Recovery tips, exercise guides and clinic updates from our specialists. No spam.
            </p>
          </div>
          <form
            className={styles.newsletterForm}
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setSubscribed(true);
            }}
          >
            <div className={styles.inputWrap}>
              <i className="ri-mail-line" style={{ fontSize: 16 }} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
              />
            </div>
            <button type="submit" className={styles.subscribeBtn}>
              {subscribed ? (
                <>Subscribed <i className="ri-check-line" style={{ fontSize: 16 }} /></>
              ) : (
                <>Subscribe <i className="ri-arrow-right-line" style={{ fontSize: 16 }} /></>
              )}
            </button>
          </form>
        </div>

        {/* Main grid */}
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <i className="ri-pulse-line" style={{ fontSize: 22 }} />
              </div>
              <div>
                <span className={styles.logoName}>SAI Physiotherapy</span>
                <span className={styles.logoTagline}>Spine Care & Paralysis Centre</span>
              </div>
            </Link>
            <p className={styles.brandDesc}>
              Gujarat&apos;s most trusted physiotherapy and rehabilitation centre.
              Evidence-based recovery, with compassion at the core.
            </p>
            <div className={styles.socialLinks}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                <i className="ri-facebook-fill" style={{ fontSize: 16 }} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                <i className="ri-instagram-line" style={{ fontSize: 16 }} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="YouTube">
                <i className="ri-youtube-fill" style={{ fontSize: 16 }} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="X / Twitter">
                <i className="ri-twitter-x-line" style={{ fontSize: 14 }} />
              </a>
            </div>
            <div className={styles.certBadges}>
              <div className={styles.certBadge}>
                <i className="ri-shield-check-line" style={{ fontSize: 13 }} /> NABH
              </div>
              <div className={styles.certBadge}>
                <i className="ri-checkbox-circle-line" style={{ fontSize: 13 }} /> ISO 9001
              </div>
              <div className={styles.certBadge}>
                <i className="ri-award-line" style={{ fontSize: 13 }} /> 15+ Years
              </div>
            </div>
          </div>

          <div>
            <h3 className={styles.colTitle}>Services</h3>
            <ul className={styles.linkList}>
              {SERVICES.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className={styles.footerLink}>
                    <span className={styles.linkDot} />
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={styles.colTitle}>Quick Links</h3>
            <ul className={styles.linkList}>
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={styles.footerLink}>
                    <span className={styles.linkDot} />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={styles.colTitle}>Contact</h3>
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <i className={`ri-map-pin-line ${styles.contactIcon}`} style={{ fontSize: 16 }} />
                <span>SAI Physiotherapy, Ahmedabad, Gujarat 380001</span>
              </div>
              <div className={styles.contactItem}>
                <i className={`ri-phone-line ${styles.contactIcon}`} style={{ fontSize: 16 }} />
                <a href="tel:+919999999999">+91 99999 99999</a>
              </div>
              <div className={styles.contactItem}>
                <i className={`ri-mail-line ${styles.contactIcon}`} style={{ fontSize: 16 }} />
                <a href="mailto:clinic@saiphysiotherapy.com">clinic@saiphysiotherapy.com</a>
              </div>
            </div>

            <h3 className={styles.colTitle} style={{ marginTop: '1.5rem' }}>Hours</h3>
            <div className={styles.hoursList}>
              {BUSINESS_HOURS.map((h) => (
                <div key={h.day} className={styles.hoursItem}>
                  <span className={styles.hoursDay}>{h.day}</span>
                  <span className={styles.hoursTime}>{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <div className={styles.bottomInner}>
            <p>© {year} SAI Physiotherapy Spine Care &amp; Paralysis Centre. All rights reserved.</p>
            <div className={styles.bottomLinks}>
              <Link href="/privacy-policy">Privacy</Link>
              <span className={styles.sep}>·</span>
              <Link href="/terms">Terms</Link>
              <span className={styles.sep}>·</span>
              <Link href="/sitemap">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
