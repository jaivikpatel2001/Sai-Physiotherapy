'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import styles from '../login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const storeLoading = useAuthStore((s) => s.status === 'loading');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Backend "Login successful" success + "Invalid email or password" / lockout
    // errors surface via the global axios toast interceptor.
    const user = await login(form);
    if (!user) return;
    // Mirror the user object for getRole() in lib/auth (used by admin/users + admin/settings).
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('user', JSON.stringify(user));
    }

    const role = user.role;
    const dest =
      role === 'super_admin' || role === 'admin' ? '/admin' :
      role === 'doctor' ? '/admin/appointments' :
      role === 'receptionist' ? '/admin/appointments' :
      '/admin';
    // Client-side navigation — no browser reload, store stays hydrated.
    router.replace(dest);
  };

  const loading = storeLoading;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h1 className={styles.cardTitle}>Staff Login</h1>
        <p className={styles.cardSub}>Sign in to access the clinic management system</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            placeholder="admin@saiphysio.com"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            id="login-email"
          />
        </div>

        <div className="form-group">
          <div className={styles.labelRow}>
            <label className="form-label">Password</label>
            <Link href="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
          </div>
          <div className={styles.passwordWrap}>
            <input
              type={show ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              id="login-password"
              style={{ paddingRight: '3rem' }}
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShow(!show)} aria-label="Toggle password">
              <i className={show ? 'ri-eye-off-line' : 'ri-eye-line'} style={{ fontSize: 18 }} />
            </button>
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading} id="login-submit">
          {loading ? <span className={styles.spinner} /> : <><i className="ri-login-box-line" style={{ fontSize: 18 }} /> Sign In</>}
        </button>
      </form>

      {/* Demo credentials */}
      <div className={styles.demoBox}>
        <p className={styles.demoTitle}>Demo Credentials</p>
        <div className={styles.demoCreds}>
          <div className={styles.demoCred}>
            <span className={styles.demoRole}>Super Admin</span>
            <code>admin@saiphysio.com / Admin@123456</code>
          </div>
          <div className={styles.demoCred}>
            <span className={styles.demoRole}>Doctor</span>
            <code>doctor@saiphysio.com / Doctor@123456</code>
          </div>
          <div className={styles.demoCred}>
            <span className={styles.demoRole}>Receptionist</span>
            <code>reception@saiphysio.com / Recept@123456</code>
          </div>
        </div>
      </div>
    </div>
  );
}
