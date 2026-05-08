'use client';
import { useEffect, useMemo, useState } from 'react';
import { adminTestimonialsApi } from '@/lib/api';
import { formatDate } from '@sai-physio/utils';
import styles from '../admin.module.css';

interface Testimonial {
  _id: string;
  patientName: string;
  patientAge?: number;
  condition: string;
  rating: number;
  review: string;
  videoUrl?: string;
  isApproved: boolean;
  isFeatured: boolean;
  source: 'manual' | 'google' | 'website_form';
  createdAt: string;
}

type StatusFilter = 'all' | 'pending' | 'approved';

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminTestimonialsApi.getAll();
      setItems(res.data?.data ?? res.data ?? []);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'pending') return items.filter((t) => !t.isApproved);
    if (statusFilter === 'approved') return items.filter((t) => t.isApproved);
    return items;
  }, [items, statusFilter]);

  const moderate = async (id: string, isApproved: boolean) => {
    try {
      await adminTestimonialsApi.moderate(id, { isApproved });
      setItems((prev) => prev.map((t) => t._id === id ? { ...t, isApproved } : t));
    } catch {
      setError('Failed to moderate');
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await adminTestimonialsApi.moderate(id, { isApproved: true, isFeatured: !current });
      setItems((prev) => prev.map((t) => t._id === id ? { ...t, isFeatured: !current, isApproved: true } : t));
    } catch {
      setError('Failed to toggle featured');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await adminTestimonialsApi.remove(id);
      setItems((prev) => prev.filter((t) => t._id !== id));
    } catch {
      setError('Failed to delete');
    }
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Testimonials</h1>
          <p className={styles.pageSub}>Approve or reject patient reviews</p>
        </div>
        <div className={styles.hstack}>
          <i className={`ri-filter-line ${styles.muted}`} style={{ fontSize: 16 }} />
          <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {error && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{error}</div>}

      {loading ? (
        <div className={styles.spinner} />
      ) : filtered.length === 0 ? (
        <div className={styles.adminCard}>
          <div className={styles.empty}>
            <i className={`ri-message-3-line ${styles.emptyIcon}`} style={{ fontSize: 40 }} />
            <span>No testimonials in this view</span>
          </div>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {filtered.map((t) => (
            <div key={t._id} className={styles.serviceCard}>
              <div className={styles.serviceCardBody}>
                <div className={styles.hstack} style={{ justifyContent: 'space-between' }}>
                  <div>
                    <div className={styles.serviceCardName}>{t.patientName}{t.patientAge ? `, ${t.patientAge}` : ''}</div>
                    <div className={styles.serviceCardMeta}>{t.condition}</div>
                  </div>
                  <span className={`${styles.badge} ${t.isApproved ? styles.badgeSuccess : styles.badgeWarning}`}>
                    {t.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <div className={styles.stars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i key={i} className={i < t.rating ? "ri-star-fill" : "ri-star-line"} style={{ fontSize: 14 }} />
                  ))}
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', lineHeight: 'var(--leading-snug)' }}>
                  {t.review}
                </p>
                <div className={styles.serviceCardMeta}>
                  {formatDate(t.createdAt)} · {t.source.replace('_', ' ')}
                  {t.isFeatured && <> · <span style={{ color: 'var(--color-accent-dark)', fontWeight: 600 }}>Featured</span></>}
                </div>
              </div>
              <div className={styles.serviceCardActions}>
                {!t.isApproved ? (
                  <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} onClick={() => moderate(t._id, true)}>
                    <i className="ri-check-line" style={{ fontSize: 14 }} /> Approve
                  </button>
                ) : (
                  <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} onClick={() => moderate(t._id, false)}>
                    <i className="ri-close-line" style={{ fontSize: 14 }} /> Unapprove
                  </button>
                )}
                {t.isApproved && (
                  <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} onClick={() => toggleFeatured(t._id, t.isFeatured)}>
                    <i className="ri-star-line" style={{ fontSize: 14 }} /> {t.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                )}
                <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => remove(t._id)} style={{ color: 'var(--color-error)' }}>
                  <i className="ri-delete-bin-line" style={{ fontSize: 14 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
