'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUsersStore, authApi, usersApi } from '@/store';
import { getRole } from '@/lib/auth';
import { UserRole } from '@sai-physio/types';
import { formatDate } from '@sai-physio/utils';
import {
  PageHeader,
  AddButton,
  ActionMenu,
  StatusBadge,
  toneFor,
  ResourceDetailModal,
  DataTable,
  type Column,
  FilterToolbar,
  useTableQuery,
  applyTableQuery,
} from '@/components/admin';
import styles from '../admin.module.css';

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  specialization?: string;
  qualification?: string;
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

export default function UsersPage() {
  const role = getRole();
  const allowed = role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
  const users = useUsersStore((s) => s.items) as unknown as StaffUser[];
  const storeLoading = useUsersStore((s) => s.status === 'loading');
  const error = useUsersStore((s) => s.error?.message ?? '');
  const fetchList = useUsersStore((s) => s.fetchList);
  const toggleUserStatus = useUsersStore((s) => s.toggleStatus);

  const [showModal, setShowModal] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const loading = allowed ? storeLoading : false;

  const q = useTableQuery({
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
    initialFilters: { role: '', isActive: '' },
  });

  useEffect(() => { if (allowed) void fetchList(); }, [allowed, fetchList]);

  const toggleStatus = async (id: string) => {
    await toggleUserStatus(id);
  };

  const filtered = useMemo(() => applyTableQuery({
    rows: users,
    search: q.debouncedSearch,
    searchFields: (u) => `${u.name} ${u.email} ${u.phone} ${u.specialization ?? ''}`,
    filters: q.filters,
    filterAccessors: {
      role: (u) => u.role,
      isActive: (u) => String(u.isActive),
    },
    sortBy: q.sortBy,
    sortOrder: q.sortOrder,
    sortAccessors: {
      name: (u) => u.name,
      email: (u) => u.email,
      role: (u) => u.role,
      createdAt: (u) => u.createdAt ? new Date(u.createdAt) : undefined,
      lastLogin: (u) => u.lastLogin ? new Date(u.lastLogin) : undefined,
    },
  }), [users, q.debouncedSearch, q.filters, q.sortBy, q.sortOrder]);

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
      <PageHeader
        title="Staff & Users"
        subtitle="Manage admin, doctor, and receptionist accounts"
        actions={<AddButton label="Add User" onClick={() => setShowModal(true)} />}
      />

      {error && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{error}</div>}

      <div className={styles.adminCard}>
        <FilterToolbar
          search={q.search}
          onSearchChange={q.setSearch}
          searchPlaceholder="Search name, email, phone, or specialization…"
          filters={[
            {
              type: 'select', key: 'role', label: 'Role', icon: 'ri-shield-user-line',
              options: [
                { value: UserRole.SUPER_ADMIN, label: 'Super Admin' },
                { value: UserRole.ADMIN, label: 'Admin' },
                { value: UserRole.DOCTOR, label: 'Doctor' },
                { value: UserRole.RECEPTIONIST, label: 'Receptionist' },
              ],
            },
            {
              type: 'select', key: 'isActive', label: 'Status', icon: 'ri-flag-line',
              options: [
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Disabled' },
              ],
            },
          ]}
          filterValues={q.filters}
          onFilterChange={q.setFilter}
          sort={{
            options: [
              { value: 'createdAt', label: 'Date created' },
              { value: 'name', label: 'Name' },
              { value: 'email', label: 'Email' },
              { value: 'role', label: 'Role' },
              { value: 'lastLogin', label: 'Last login' },
            ],
          }}
          sortBy={q.sortBy}
          sortOrder={q.sortOrder}
          onSortChange={(by, order) => q.setSort(by, order)}
          onReset={q.resetAll}
          hasActive={q.hasActive}
          totalCount={users.length}
          filteredCount={filtered.length}
        />

        <DataTable
          rows={filtered}
          columns={[
            {
              key: 'name', header: 'Name', sortKey: 'name',
              render: (u) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  {u.specialization && <div className={styles.muted} style={{ fontSize: 'var(--text-xs)' }}>{u.specialization}</div>}
                </div>
              ),
            },
            { key: 'email', header: 'Email', sortKey: 'email', render: (u) => u.email },
            { key: 'phone', header: 'Phone', render: (u) => u.phone },
            { key: 'role', header: 'Role', sortKey: 'role', render: (u) => <StatusBadge label={u.role.replace('_', ' ')} tone={toneFor(u.role)} /> },
            { key: 'status', header: 'Status', render: (u) => <StatusBadge label={u.isActive ? 'Active' : 'Disabled'} tone={u.isActive ? 'success' : 'error'} /> },
            { key: 'lastLogin', header: 'Last Login', sortKey: 'lastLogin', render: (u) => u.lastLogin ? formatDate(u.lastLogin) : '—' },
          ] as Column<StaffUser>[]}
          rowKey={(u) => u._id}
          loading={loading}
          sortBy={q.sortBy}
          sortOrder={q.sortOrder}
          onSort={q.toggleSort}
          renderActions={(u) => (
            <ActionMenu
              onView={() => setViewingId(u._id)}
              onDelete={() => toggleStatus(u._id)}
              deleteLabel={u.isActive ? 'Disable account' : 'Enable account'}
            />
          )}
        />

        {!loading && filtered.length === 0 && (
          <div className={styles.empty}>
            <i className={`ri-shield-user-line ${styles.emptyIcon}`} style={{ fontSize: 40 }} />
            <span>{q.hasActive ? 'No users match your filters' : 'No users found'}</span>
            {q.hasActive && (
              <button type="button" onClick={q.resetAll} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
                <i className="ri-refresh-line" /> Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {showModal && <NewUserModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); void fetchList(undefined, { force: true }); }} />}

      <ResourceDetailModal
        open={!!viewingId}
        id={viewingId}
        onClose={() => setViewingId(null)}
        fetcher={usersApi.getOne}
        extraActions={(u) => {
          const user = u as unknown as StaffUser;
          return (
            <button
              type="button"
              onClick={() => { void toggleStatus(user._id); setViewingId(null); }}
              className={`${styles.btn} ${user.isActive ? styles.btnDanger : styles.btnPrimary}`}
            >
              <i className="ri-shut-down-line" style={{ fontSize: 16 }} /> {user.isActive ? 'Disable account' : 'Enable account'}
            </button>
          );
        }}
      />
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
