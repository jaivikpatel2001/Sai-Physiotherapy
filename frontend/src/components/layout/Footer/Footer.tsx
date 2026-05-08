import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Activity, Facebook, Instagram, Youtube } from 'lucide-react';
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
  { day: 'Monday – Friday', time: '8:00 AM – 8:00 PM' },
  { day: 'Saturday', time: '8:00 AM – 6:00 PM' },
  { day: 'Sunday', time: '9:00 AM – 1:00 PM' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* Main Footer */}
      <div className={styles.main}>
        <div className="container">
          <div className={styles.grid}>
            {/* Brand Column */}
            <div className={styles.brand}>
              <Link href="/" className={styles.logo}>
                <div className={styles.logoIcon}>
                  <Activity size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <span className={styles.logoName}>SAI Physiotherapy</span>
                  <span className={styles.logoTagline}>Spine Care & Paralysis Centre</span>
                </div>
              </Link>
              <p className={styles.brandDesc}>
                Gujarat&apos;s most trusted physiotherapy and rehabilitation center.
                We combine evidence-based practice with compassionate care to help
                you heal faster and live better.
              </p>
              <div className={styles.socialLinks}>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                  <Facebook size={18} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                  <Instagram size={18} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="YouTube">
                  <Youtube size={18} />
                </a>
              </div>
              <div className={styles.certBadges}>
                <div className={styles.certBadge}>✓ NABH Compliant</div>
                <div className={styles.certBadge}>✓ ISO Certified</div>
                <div className={styles.certBadge}>✓ 15+ Years</div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className={styles.colTitle}>Our Services</h3>
              <ul className={styles.linkList}>
                {SERVICES.map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} className={styles.footerLink}>
                      <span className={styles.linkDot}></span>
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className={styles.colTitle}>Quick Links</h3>
              <ul className={styles.linkList}>
                {QUICK_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={styles.footerLink}>
                      <span className={styles.linkDot}></span>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Hours */}
            <div>
              <h3 className={styles.colTitle}>Contact Us</h3>
              <div className={styles.contactList}>
                <div className={styles.contactItem}>
                  <MapPin size={16} className={styles.contactIcon} />
                  <span>SAI Physiotherapy, Ahmedabad, Gujarat 380001</span>
                </div>
                <div className={styles.contactItem}>
                  <Phone size={16} className={styles.contactIcon} />
                  <a href="tel:+919999999999">+91 99999 99999</a>
                </div>
                <div className={styles.contactItem}>
                  <Mail size={16} className={styles.contactIcon} />
                  <a href="mailto:clinic@saiphysiotherapy.com">clinic@saiphysiotherapy.com</a>
                </div>
              </div>

              <h3 className={styles.colTitle} style={{ marginTop: '1.5rem' }}>Working Hours</h3>
              <div className={styles.hoursList}>
                {BUSINESS_HOURS.map((h) => (
                  <div key={h.day} className={styles.hoursItem}>
                    <div className={styles.hoursDay}>
                      <Clock size={12} />
                      {h.day}
                    </div>
                    <span className={styles.hoursTime}>{h.time}</span>
                  </div>
                ))}
              </div>

              <Link href="/book-appointment" className={styles.ctaButton}>
                Book Appointment →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottom}>
        <div className="container">
          <div className={styles.bottomInner}>
            <p>© {year} SAI Physiotherapy Spine Care & Paralysis Centre. All rights reserved.</p>
            <div className={styles.bottomLinks}>
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms">Terms & Conditions</Link>
              <Link href="/sitemap">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
