'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './MobileBottomNav.module.css';

const ITEMS = [
  { href: '/', label: 'Home', icon: 'ri-home-5-line', activeIcon: 'ri-home-5-fill' },
  { href: '/services', label: 'Services', icon: 'ri-stethoscope-line', activeIcon: 'ri-stethoscope-line' },
  { href: '/book-appointment', label: 'Book', icon: 'ri-calendar-2-fill', activeIcon: 'ri-calendar-2-fill', center: true },
  { href: '/doctors', label: 'Doctors', icon: 'ri-team-line', activeIcon: 'ri-team-fill' },
  { href: '/contact', label: 'Contact', icon: 'ri-phone-line', activeIcon: 'ri-phone-fill' },
];

export default function MobileBottomNav() {
  const pathname = usePathname() || '/';

  return (
    <nav className={styles.nav} aria-label="Mobile bottom navigation">
      {ITEMS.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        if (item.center) {
          return (
            <Link key={item.href} href={item.href} className={styles.centerWrap} aria-label={item.label}>
              <span className={styles.center}>
                <i className={item.activeIcon} style={{ fontSize: 24 }} />
              </span>
              <span className={styles.centerLabel}>{item.label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
          >
            <i className={isActive ? item.activeIcon : item.icon} style={{ fontSize: 22 }} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
