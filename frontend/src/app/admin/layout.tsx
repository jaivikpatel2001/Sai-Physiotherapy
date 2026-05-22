'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserRole } from '@sai-physio/types';
import { useAuthStore } from '@/store';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import styles from './admin.module.css';

type NavLink = { href: string; label: string; icon: string; roles: UserRole[] };

const ALL_STAFF = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST];
const ADMINS = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

const NAV: NavLink[] = [
  { href: '/admin', label: 'Dashboard', icon: 'ri-dashboard-line', roles: ALL_STAFF },
  { href: '/admin/appointments', label: 'Appointments', icon: 'ri-calendar-line', roles: ALL_STAFF },
  { href: '/admin/patients', label: 'Patients', icon: 'ri-team-line', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST] },
  { href: '/admin/billing', label: 'Billing', icon: 'ri-receipt-line', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST] },
  { href: '/admin/services', label: 'Services', icon: 'ri-stethoscope-line', roles: ADMINS },
  { href: '/admin/doctors', label: 'Doctors', icon: 'ri-user-heart-line', roles: ADMINS },
  { href: '/admin/blog', label: 'Blog', icon: 'ri-file-text-line', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR] },
  { href: '/admin/gallery', label: 'Gallery', icon: 'ri-image-2-line', roles: ADMINS },
  { href: '/admin/testimonials', label: 'Testimonials', icon: 'ri-message-3-line', roles: ADMINS },
  { href: '/admin/pages', label: 'CMS Pages', icon: 'ri-pages-line', roles: ADMINS },
  { href: '/admin/users', label: 'Users', icon: 'ri-shield-user-line', roles: ADMINS },
  { href: '/admin/settings', label: 'Settings', icon: 'ri-settings-3-line', roles: [UserRole.SUPER_ADMIN] },
];

const BILLING_NAV: NavLink[] = [
  { href: '/admin', label: 'Dashboard', icon: 'ri-dashboard-line', roles: [] },
  { href: '/admin/billing', label: 'Billing', icon: 'ri-receipt-line', roles: [] },
];

function pageTitleForPath(path: string): string {
  if (path === '/admin') return 'Dashboard';
  const seg = path.split('/').filter(Boolean)[1] ?? '';
  return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthGuard();
  const { logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.spinner} />
      </div>
    );
  }

  const navItems: NavLink[] = (() => {
    if (user.role === 'billing_staff' as UserRole) return BILLING_NAV;
    return NAV.filter((n) => n.roles.includes(user.role));
  })();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const initial = user.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className={styles.shell}>
      {menuOpen && <div className={styles.sidebarBackdrop} onClick={() => setMenuOpen(false)} />}

      <aside
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}
        data-lenis-prevent
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <i className="ri-pulse-line" style={{ fontSize: 22, color: 'white' }} />
          </div>
          <div>
            <div className={styles.sidebarBrand}>SAI Physio</div>
            <div className={styles.sidebarBrandSub}>Admin Panel</div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map(({ href, label, icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`${styles.navItem} ${active ? styles.active : ''}`}>
                <span className={styles.navIcon}><i className={icon} style={{ fontSize: 18 }} /></span>
                <span className={styles.navLabel}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>v1.0 — © {new Date().getFullYear()} SAI</div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.hstack}>
            <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              <i className={menuOpen ? 'ri-close-line' : 'ri-menu-line'} style={{ fontSize: 20 }} />
            </button>
            <div className={styles.topbarTitle}>{pageTitleForPath(pathname)}</div>
          </div>

          <div className={styles.userBox}>
            <button className={styles.userBtn} onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <div className={styles.userAvatar}>{initial}</div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>{user.name}</div>
                <div className={styles.userRole}>{user.role.replace('_', ' ')}</div>
              </div>
              <i className="ri-arrow-down-s-line" style={{ fontSize: 16 }} />
            </button>
            {userMenuOpen && (
              <div className={styles.userMenu} onMouseLeave={() => setUserMenuOpen(false)}>
                <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{user.email}</div>
                </div>
                <button className={`${styles.userMenuItem} ${styles.danger}`} onClick={handleLogout}>
                  <i className="ri-logout-box-line" style={{ fontSize: 16 }} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
