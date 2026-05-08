'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Header.module.css';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Back Pain Treatment', href: '/services/back-pain-treatment' },
      { label: 'Spine Care', href: '/services/spine-care-disc-problems' },
      { label: 'Paralysis Rehabilitation', href: '/services/paralysis-rehabilitation' },
      { label: 'Knee Pain & Joint Care', href: '/services/knee-pain-joint-care' },
      { label: 'Sports Injury', href: '/services/sports-injury-rehabilitation' },
      { label: 'Neuro Physiotherapy', href: '/services/neuro-physiotherapy' },
      { label: 'View All Services', href: '/services' },
    ],
  },
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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
              <a href={`tel:${PHONE}`} className={styles.topBarPhone}>
                <i className="ri-phone-line" style={{ fontSize: 13 }} />
                {PHONE}
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
                <i className="ri-whatsapp-line" style={{ fontSize: 14 }} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className="container">
          <div className={styles.headerInner}>
            {/* Logo */}
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <i className="ri-pulse-line" style={{ fontSize: 22 }} />
              </div>
              <div className={styles.logoText}>
                <span className={styles.logoName}>SAI Physiotherapy</span>
                <span className={styles.logoTagline}>Spine Care & Paralysis Centre</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className={styles.nav}>
              {NAV_LINKS.map((link) => (
                <div
                  key={link.label}
                  className={styles.navItem}
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link href={link.href} className={styles.navLink}>
                    {link.label}
                    {link.children && <i className="ri-arrow-down-s-line" style={{ fontSize: 14 }} />}
                  </Link>
                  {link.children && (
                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          className={styles.dropdown}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                        >
                          {link.children.map((child) => (
                            <Link key={child.href} href={child.href} className={styles.dropdownItem}>
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* CTA */}
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

      {/* Mobile Menu */}
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
