'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Users, Activity, FileText,
  Receipt, Stethoscope, MessageSquare, Settings, ShieldCheck,
  LogOut, Menu, X, ChevronDown,
} from 'lucide-react';
import { UserRole } from '@sai-physio/types';
import { useAuthStore } from '@/lib/store/authStore';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import styles from './admin.module.css';

type NavLink = { href: string; label: string; Icon: React.ComponentType<{ size?: number | string }>; roles: UserRole[] };

const ALL_STAFF = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST];
const ADMINS = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

const NAV: NavLink[] = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard, roles: ALL_STAFF },
  { href: '/admin/appointments', label: 'Appointments', Icon: Calendar, roles: ALL_STAFF },
  { href: '/admin/patients', label: 'Patients', Icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST] },
  { href: '/admin/billing', label: 'Billing', Icon: Receipt, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST] },
  { href: '/admin/services', label: 'Services', Icon: Stethoscope, roles: ADMINS },
  { href: '/admin/blog', label: 'Blog', Icon: FileText, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR] },
  { href: '/admin/testimonials', label: 'Testimonials', Icon: MessageSquare, roles: ADMINS },
  { href: '/admin/users', label: 'Users', Icon: ShieldCheck, roles: ADMINS },
  { href: '/admin/settings', label: 'Settings', Icon: Settings, roles: [UserRole.SUPER_ADMIN] },
];

// Billing-only role override
const BILLING_NAV: NavLink[] = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard, roles: [] },
  { href: '/admin/billing', label: 'Billing', Icon: Receipt, roles: [] },
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

  // Filter nav by role
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

      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <Activity size={22} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div className={styles.sidebarBrand}>SAI Physio</div>
            <div className={styles.sidebarBrandSub}>Admin Panel</div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`${styles.navItem} ${active ? styles.active : ''}`}>
                <span className={styles.navIcon}><Icon size={18} /></span>
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
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
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
              <ChevronDown size={16} />
            </button>
            {userMenuOpen && (
              <div className={styles.userMenu} onMouseLeave={() => setUserMenuOpen(false)}>
                <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{user.email}</div>
                </div>
                <button className={`${styles.userMenuItem} ${styles.danger}`} onClick={handleLogout}>
                  <LogOut size={16} /> Sign Out
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
