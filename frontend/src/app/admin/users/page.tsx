'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { usersApi, authApi } from '@/lib/api';
import { getRole } from '@/lib/auth';
import { UserRole } from '@sai-physio/types';
import { formatDate } from '@sai-physio/utils';
import styles from '../admin.module.css';

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  specialization?: string;
  lastLogin?: string;
  createdAt?: string;
}

interface NewUserForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  specialization?: string;
  qualification?: string;
}

const ROLE_BADGE: Record<string, string> = {
  super_admin: styles.badgePrimary,
  admin: styles.badgeInfo,
  doctor: styles.badgeSuccess,
  receptionist: styles.badgeWarning,
  patient: styles.badgeNeutral,
};

export default function UsersPage() {
  const role = getRole();
  const allowed = role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await usersApi.getAll();
      setUsers(res.data?.data ?? res.data ?? []);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (allowed) fetchData(); else setLoading(false); }, [allowed]);

  const toggleStatus = async (id: string) => {
    try {
      await usersApi.toggleStatus(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: !u.isActive } : u));
    } catch {
      setError('Failed to toggle status');
    }
  };

  if (!allowed) {
    return (
      <div className={styles.adminCard}>
        <div className={styles.empty}>
          <i className={`ri-shield-cross-line ${styles.emptyIcon}`} style={{ fontSize: 40 }} />
          <span>Only admins can manage users.</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Staff & Users</h1>
          <p className={styles.pageSub}>Manage admin, doctor, and receptionist accounts</p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setShowModal(true)}>
          <i className="ri-add-line" style={{ fontSize: 16 }} /> Add User
        </button>
      </div>

      {error && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{error}</div>}

      <div className={styles.adminCard}>
        <div className={styles.tableWrap}>
          {loading ? <div className={styles.spinner} /> : users.length === 0 ? (
            <div className={styles.empty}><i className={`ri-shield-user-line ${styles.emptyIcon}`} style={{ fontSize: 40 }} /><span>No users found</span></div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      {u.specialization && <div className={styles.muted} style={{ fontSize: 'var(--text-xs)' }}>{u.specialization}</div>}
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td><span className={`${styles.badge} ${ROLE_BADGE[u.role] || styles.badgeNeutral}`}>{u.role.replace('_', ' ')}</span></td>
                    <td><span className={`${styles.badge} ${u.isActive ? styles.badgeSuccess : styles.badgeError}`}>{u.isActive ? 'Active' : 'Disabled'}</span></td>
                    <td>{u.lastLogin ? formatDate(u.lastLogin) : '—'}</td>
                    <td>
                      <button
                        className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                        onClick={() => toggleStatus(u._id)}
                        title={u.isActive ? 'Disable' : 'Enable'}
                      >
                        <i className="ri-shut-down-line" style={{ fontSize: 14 }} /> {u.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && <NewUserModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchData(); }} />}
    </>
  );
}

function NewUserModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<NewUserForm>({
    defaultValues: { role: UserRole.RECEPTIONIST },
  });
  const [err, setErr] = useState('');
  const role = watch('role');

  const onSubmit = async (form: NewUserForm) => {
    setErr('');
    try {
      await authApi.register(form);
      onSaved();
    } catch (e: unknown) {
      setErr((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose} data-lenis-prevent>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} data-lenis-prevent>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Add User</div>
          <button className={styles.iconBtn} onClick={onClose}><i className="ri-close-line" style={{ fontSize: 18 }} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.modalBody}>
            {err && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{err}</div>}
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" {...register('name', { required: true })} />
                {errors.name && <div className="form-error">Required</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" {...register('email', { required: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input" {...register('phone', { required: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="form-input" {...register('role', { required: true })}>
                  <option value={UserRole.ADMIN}>Admin</option>
                  <option value={UserRole.DOCTOR}>Doctor</option>
                  <option value={UserRole.RECEPTIONIST}>Receptionist</option>
                </select>
              </div>
              <div className="form-group full">
                <label className="form-label">Temporary Password *</label>
                <input type="password" className="form-input" minLength={8} {...register('password', { required: true, minLength: 8 })} />
                {errors.password && <div className="form-error">Min 8 characters</div>}
              </div>
              {role === UserRole.DOCTOR && (
                <>
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <input className="form-input" placeholder="e.g. Sports Therapy" {...register('specialization')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Qualification</label>
                    <input className="form-input" placeholder="e.g. MPT, BPT" {...register('qualification')} />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`${styles.btn} ${styles.btnPrimary}`}>
              {isSubmitting ? 'Saving...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
