'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/lib/api';
import styles from '../login.module.css';

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Reset token missing or invalid.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as Error)?.message ||
        'Reset failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div style={{ color: 'var(--color-success)', marginBottom: 'var(--space-3)' }}>
            <CheckCircle2 size={48} />
          </div>
          <h1 className={styles.cardTitle}>Password Reset</h1>
          <p className={styles.cardSub}>Your password has been updated. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h1 className={styles.cardTitle}>Reset Password</h1>
        <p className={styles.cardSub}>Choose a new password for your account.</p>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <div className={styles.passwordWrap}>
            <input
              type={show ? 'text' : 'password'}
              className="form-input"
              placeholder="At least 8 characters"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: '3rem' }}
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShow(!show)} aria-label="Toggle password">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            type={show ? 'text' : 'password'}
            className="form-input"
            placeholder="Repeat your new password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <span className={styles.spinner} /> : <><KeyRound size={18} /> Reset Password</>}
        </button>
      </form>

      <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
        <Link href="/login" className={styles.forgotLink}>Back to login</Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className={styles.card}><p>Loading…</p></div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
