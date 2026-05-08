'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Header.module.css';

const SERVICES_GRID = [
  { label: 'Back Pain Treatment', icon: 'ri-walk-line', href: '/services/back-pain-treatment', recovery: '8-12 sessions' },
  { label: 'Spine Care & Disc', icon: 'ri-mental-health-line', href: '/services/spine-care-disc-problems', recovery: '10-14 sessions' },
  { label: 'Paralysis Rehab', icon: 'ri-heart-pulse-line', href: '/services/paralysis-rehabilitation', recovery: '12-24 weeks' },
  { label: 'Knee & Joint Care', icon: 'ri-run-line', href: '/services/knee-pain-joint-care', recovery: '6-10 sessions' },
  { label: 'Sports Injury', icon: 'ri-football-line', href: '/services/sports-injury-rehabilitation', recovery: '4-8 weeks' },
  { label: 'Neuro Physiotherapy', icon: 'ri-flashlight-line', href: '/services/neuro-physiotherapy', recovery: '12+ weeks' },
  { label: 'Neck & Cervical', icon: 'ri-emotion-unhappy-line', href: '/services/neck-pain-cervical-spondylosis', recovery: '6-10 sessions' },
  { label: 'Post-Surgery Rehab', icon: 'ri-hospital-line', href: '/services/post-surgery-rehabilitation', recovery: '6-12 weeks' },
  { label: 'Pediatric Physio', icon: 'ri-parent-line', href: '/services/pediatric-physiotherapy', recovery: 'Varies' },
];

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services', mega: true },
  { label: 'Doctors', href: '/doctors' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';
const PHONE = process.env.NEXT_PUBLIC_CLINIC_PHONE || '+91 99999 99999';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const check = () => setIsLoggedIn(!!localStorage.getItem('accessToken'));
    check();
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className="container">
          <div className={styles.topBarInner}>
            <span className={styles.topBarText}>
              <i className="ri-hospital-line" style={{ fontSize: 14, marginRight: 6 }} />
              Gujarat&apos;s Most Advanced Physiotherapy Centre
            </span>
            <div className={styles.topBarActions}>
              <a href={`tel:${PHONE}`} className={styles.emergencyBtn}>
                <span className={styles.emergencyDot} />
                <i className="ri-phone-line" style={{ fontSize: 13 }} />
                Emergency: {PHONE}
              </a>
              {isLoggedIn ? (
                <Link href="/admin" className={styles.staffBtn}>
                  <i className="ri-dashboard-line" style={{ fontSize: 13 }} /> Admin Panel
                </Link>
              ) : (
                <Link href="/login" className={styles.staffBtn}>
                  <i className="ri-login-box-line" style={{ fontSize: 13 }} /> Staff Login
                </Link>
              )}
              <a
                href={`https://wa.me/${WHATSAPP}?text=Hello, I'd like to book an appointment`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
              >
                <i className="ri-whatsapp-line" style={{ fontSize: 14 }} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className="container">
          <div className={styles.headerInner}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <i className="ri-pulse-line" style={{ fontSize: 22 }} />
              </div>
              <div className={styles.logoText}>
                <span className={styles.logoName}>SAI Physiotherapy</span>
                <span className={styles.logoTagline}>Spine Care &amp; Paralysis Centre</span>
              </div>
            </Link>

            <nav className={styles.nav} onMouseLeave={() => setMegaOpen(false)}>
              {NAV_LINKS.map((link) => (
                <div
                  key={link.label}
                  className={styles.navItem}
                  onMouseEnter={() => setMegaOpen(!!link.mega)}
                >
                  <Link href={link.href} className={styles.navLink}>
                    {link.label}
                    {link.mega && <i className="ri-arrow-down-s-line" style={{ fontSize: 14 }} />}
                  </Link>
                </div>
              ))}

              <AnimatePresence>
                {megaOpen && (
                  <motion.div
                    className={styles.megaMenu}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    onMouseEnter={() => setMegaOpen(true)}
                  >
                    <div className={styles.megaInner}>
                      <div className={styles.megaGrid}>
                        {SERVICES_GRID.map((s) => (
                          <Link key={s.href} href={s.href} className={styles.megaItem} onClick={() => setMegaOpen(false)}>
                            <div className={styles.megaIcon}>
                              <i className={s.icon} style={{ fontSize: 20 }} />
                            </div>
                            <div>
                              <p className={styles.megaLabel}>{s.label}</p>
                              <p className={styles.megaRecovery}>
                                <i className="ri-time-line" style={{ fontSize: 11 }} /> {s.recovery}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className={styles.megaFeatured}>
                        <span className={styles.megaFeaturedTag}>Featured</span>
                        <h4 className={styles.megaFeaturedTitle}>Need help choosing?</h4>
                        <p className={styles.megaFeaturedSub}>
                          Take our 60-second symptom check or talk to a specialist now.
                        </p>
                        <Link href="/book-appointment" className={styles.megaFeaturedBtn} onClick={() => setMegaOpen(false)}>
                          Book Free Consultation <i className="ri-arrow-right-line" style={{ fontSize: 14 }} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </nav>

            <div className={styles.headerCta}>
              <Link href="/book-appointment" className={styles.bookBtn}>
                Book Appointment
              </Link>
              <button
                className={styles.menuBtn}
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <i className="ri-menu-line" style={{ fontSize: 24 }} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={styles.mobileOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className={styles.mobileMenu}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className={styles.mobileHeader}>
                <span className={styles.mobileTitle}>Menu</span>
                <button onClick={() => setMobileOpen(false)} className={styles.closeBtn}>
                  <i className="ri-close-line" style={{ fontSize: 22 }} />
                </button>
              </div>
              <nav className={styles.mobileNav}>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={styles.mobileNavLink}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                    <i className="ri-arrow-right-s-line" style={{ fontSize: 16 }} />
                  </Link>
                ))}
              </nav>
              <div className={styles.mobileCta}>
                <Link
                  href="/book-appointment"
                  className={styles.bookBtnMobile}
                  onClick={() => setMobileOpen(false)}
                >
                  Book Appointment
                </Link>
                <a href={`tel:${PHONE}`} className={styles.callBtnMobile}>
                  <i className="ri-phone-line" style={{ fontSize: 16 }} /> Call Now
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
