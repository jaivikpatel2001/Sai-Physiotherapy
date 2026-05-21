'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import styles from '../login.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as Error)?.message ||
        'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div style={{ color: 'var(--color-success)', marginBottom: 'var(--space-3)' }}>
            <i className="ri-checkbox-circle-line" style={{ fontSize: 48 }} />
          </div>
          <h1 className={styles.cardTitle}>Check Your Email</h1>
          <p className={styles.cardSub}>
            If an account with <strong>{email}</strong> exists, we&apos;ve sent password reset instructions to it.
          </p>
        </div>
        <Link href="/login" className={styles.forgotLink} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <i className="ri-arrow-left-line" style={{ fontSize: 16 }} /> Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h1 className={styles.cardTitle}>Forgot Password</h1>
        <p className={styles.cardSub}>Enter your email and we&apos;ll send you a reset link.</p>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <i className="ri-error-warning-line" style={{ fontSize: 16 }} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <span className={styles.spinner} /> : <><i className="ri-mail-line" style={{ fontSize: 18 }} /> Send Reset Link</>}
        </button>
      </form>

      <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
        <Link href="/login" className={styles.forgotLink} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <i className="ri-arrow-left-line" style={{ fontSize: 16 }} /> Back to login
        </Link>
      </div>
    </div>
  );
}
