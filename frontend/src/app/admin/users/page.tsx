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
  ThumbnailCell,
  TablePagination,
  usePagination,
  useTableQuery,
  applyTableQuery,
  Modal,
  ConfirmDialog,
} from '@/components/admin';
import styles from '../admin.module.css';

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
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

interface EditUserForm {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  specialization?: string;
  qualification?: string;
  isActive: boolean;
}

const formatRoleLabel = (role: UserRole | string | undefined): string => {
  if (!role) return 'Unknown';
  return String(role).split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export default function UsersPage() {
  const currentRole = getRole();
  const allowed = currentRole === UserRole.SUPER_ADMIN || currentRole === UserRole.ADMIN;
  const isSuperAdmin = currentRole === UserRole.SUPER_ADMIN;
  const users = useUsersStore((s) => s.items) as unknown as StaffUser[];
  const storeLoading = useUsersStore((s) => s.status === 'loading');
  const fetchList = useUsersStore((s) => s.fetchList);
  const toggleUserStatus = useUsersStore((s) => s.toggleStatus);
  const removeUser = useUsersStore((s) => s.remove);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<StaffUser | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const loading = allowed ? storeLoading : false;

  const q = useTableQuery({
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
    initialFilters: { role: '', isActive: '' },
  });

  useEffect(() => { if (allowed) void fetchList(); }, [allowed, fetchList]);

  const toggleStatus = async (id: string) => {
    // Global axios interceptor surfaces the backend's dynamic success/error message.
    await toggleUserStatus(id);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    const ok = await removeUser(deleting._id);
    setDeleteBusy(false);
    if (ok) setDeleting(null);
  };

  const filtered = useMemo(() => applyTableQuery({
    rows: users,
    search: q.debouncedSearch,
    searchFields: (u) => `${u.name ?? ''} ${u.email ?? ''} ${u.phone ?? ''} ${u.specialization ?? ''}`,
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

  const pager = usePagination(
    filtered,
    `${q.debouncedSearch}|${q.filters.role ?? ''}|${q.filters.isActive ?? ''}|${q.sortBy}|${q.sortOrder}`,
  );

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
        actions={<AddButton label="Add User" onClick={() => setShowCreate(true)} />}
      />

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
          rows={pager.paginated}
          columns={[
            {
              key: 'name', header: 'Name', sortKey: 'name',
              render: (u) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <ThumbnailCell src={u.avatar} alt={u.name} variant="circle" size="md" fallbackText={u.name} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    {u.specialization && <div className={styles.muted} style={{ fontSize: 'var(--text-xs)' }}>{u.specialization}</div>}
                  </div>
                </div>
              ),
            },
            { key: 'email', header: 'Email', sortKey: 'email', render: (u) => u.email },
            { key: 'phone', header: 'Phone', render: (u) => u.phone },
            {
              key: 'role', header: 'Role', sortKey: 'role',
              render: (u) => <StatusBadge label={formatRoleLabel(u.role)} tone={toneFor(u.role ?? 'neutral')} />,
            },
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
              onEdit={() => setEditing(u)}
              onDelete={isSuperAdmin ? () => setDeleting(u) : undefined}
              deleteLabel="Delete user"
            />
          )}
        />
        <TablePagination
          page={pager.page}
          pageSize={pager.pageSize}
          total={pager.total}
          onPageChange={pager.setPage}
          onPageSizeChange={pager.setPageSize}
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

      {showCreate && (
        <NewUserModal
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            void fetchList(undefined, { force: true });
          }}
        />
      )}

      {editing && (
        <EditUserModal
          user={editing}
          canChangeRole={isSuperAdmin}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void fetchList(undefined, { force: true });
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete user account"
        message={deleting ? `Are you sure you want to permanently delete “${deleting.name}”? This cannot be undone.` : ''}
        confirmLabel="Delete"
        tone="danger"
        loading={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => { if (!deleteBusy) setDeleting(null); }}
      />

      <ResourceDetailModal
        open={!!viewingId}
        id={viewingId}
        onClose={() => setViewingId(null)}
        fetcher={usersApi.getOne}
        extraActions={(u) => {
          const user = u as unknown as StaffUser;
          return (
            <>
              <button
                type="button"
                onClick={() => { setViewingId(null); setEditing(user); }}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                <i className="ri-pencil-line" style={{ fontSize: 16 }} /> Edit
              </button>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => { void toggleStatus(user._id); setViewingId(null); }}
                  className={`${styles.btn} ${user.isActive ? styles.btnDanger : styles.btnPrimary}`}
                >
                  <i className="ri-shut-down-line" style={{ fontSize: 16 }} /> {user.isActive ? 'Disable account' : 'Enable account'}
                </button>
              )}
            </>
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
  const role = watch('role');

  const onSubmit = async (form: NewUserForm) => {
    // Success "Registration successful" + any backend failure surface via the
    // global axios toast interceptor — no local error state needed.
    try {
      await authApi.register(form);
      onSaved();
    } catch {
      /* toast already shown */
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Add User"
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
          <button type="submit" form="new-user-form" disabled={isSubmitting} className={`${styles.btn} ${styles.btnPrimary}`}>
            {isSubmitting ? 'Saving...' : 'Create User'}
          </button>
        </>
      }
    >
      <form id="new-user-form" onSubmit={handleSubmit(onSubmit)}>
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
            <input className="form-input" placeholder="10-digit Indian number" {...register('phone', { required: true, pattern: /^[6-9]\d{9}$/ })} />
            {errors.phone && <div className="form-error">10-digit number starting with 6-9</div>}
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
      </form>
    </Modal>
  );
}

function EditUserModal({
  user,
  canChangeRole,
  onClose,
  onSaved,
}: {
  user: StaffUser;
  canChangeRole: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const updateUser = useUsersStore((s) => s.update);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<EditUserForm>({
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      specialization: user.specialization ?? '',
      qualification: user.qualification ?? '',
      isActive: user.isActive,
    },
  });
  const role = watch('role');

  const onSubmit = async (form: EditUserForm) => {
    const payload: Partial<EditUserForm> = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      isActive: form.isActive,
    };
    if (canChangeRole) payload.role = form.role;
    if (role === UserRole.DOCTOR) {
      payload.specialization = form.specialization;
      payload.qualification = form.qualification;
    }
    const result = await updateUser(user._id, payload as Partial<StaffUser>);
    if (result) onSaved();
    // Backend error (incl. validation) already toasted by the axios interceptor.
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${user.name}`}
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
          <button type="submit" form="edit-user-form" disabled={isSubmitting} className={`${styles.btn} ${styles.btnPrimary}`}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      }
    >
      <form id="edit-user-form" onSubmit={handleSubmit(onSubmit)}>
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
            <input className="form-input" placeholder="10-digit Indian number" {...register('phone', { required: true, pattern: /^[6-9]\d{9}$/ })} />
            {errors.phone && <div className="form-error">10-digit number starting with 6-9</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Role {canChangeRole ? '*' : '(super admin only)'}</label>
            <select className="form-input" disabled={!canChangeRole} {...register('role', { required: true })}>
              <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.DOCTOR}>Doctor</option>
              <option value={UserRole.RECEPTIONIST}>Receptionist</option>
            </select>
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
          <div className="form-group full">
            <label className="form-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input type="checkbox" {...register('isActive')} />
              Account active (allow login)
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}
