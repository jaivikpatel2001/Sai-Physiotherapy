'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import styles from '../login.module.css';

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      const { accessToken, refreshToken, user } = data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      if (user) localStorage.setItem('user', JSON.stringify(user));

      const role = user?.role;
      const dest =
        role === 'super_admin' || role === 'admin' ? '/admin' :
        role === 'doctor' ? '/admin/appointments' :
        role === 'receptionist' ? '/admin/appointments' :
        '/admin';
      window.location.href = dest;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h1 className={styles.cardTitle}>Staff Login</h1>
        <p className={styles.cardSub}>Sign in to access the clinic management system</p>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

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
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading} id="login-submit">
          {loading ? <span className={styles.spinner} /> : <><LogIn size={18} /> Sign In</>}
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
