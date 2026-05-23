'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { usePatientsStore, useUsersStore, patientsApi } from '@/store';
import { calculateAge, formatDate } from '@sai-physio/utils';
import {
  PageHeader,
  AddButton,
  ActionMenu,
  ConfirmDialog,
  ResourceDetailModal,
  DataTable,
  type Column,
  FilterToolbar,
  useTableQuery,
  applyTableQuery,
} from '@/components/admin';
import styles from '../admin.module.css';

interface Patient {
  _id: string;
  patientId: string;
  personalInfo: {
    name: string;
    phone: string;
    email?: string;
    gender: 'male' | 'female' | 'other';
    dob: string;
    address?: string;
    city?: string;
    bloodGroup?: string;
    emergencyContact?: { name?: string; phone?: string; relation?: string };
  };
  medicalHistory?: {
    chiefComplaint?: string;
    allergies?: string[];
    medications?: string[];
  };
  assignedDoctor?: { _id: string; name?: string } | string;
  status?: string;
  updatedAt?: string;
}

interface NewPatientForm {
  name: string;
  phone: string;
  email?: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  city: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  assignedDoctor: string;
  chiefComplaint: string;
  allergies?: string;
  medications?: string;
}

interface DoctorUserLite { _id: string; name: string; role: string }

function normalizeIndianPhone(input: string): string {
  const digits = (input ?? '').replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
}

export default function PatientsPage() {
  const router = useRouter();
  const items = usePatientsStore((s) => s.items) as unknown as Patient[];
  const loading = usePatientsStore((s) => s.status === 'loading');
  const error = usePatientsStore((s) => s.error?.message ?? '');
  const fetchList = usePatientsStore((s) => s.fetchList);
  const removePatient = usePatientsStore((s) => s.remove);
  const usersAllForFilter = useUsersStore((s) => s.items) as unknown as DoctorUserLite[];
  const fetchUsersForFilter = useUsersStore((s) => s.fetchList);

  const [showModal, setShowModal] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const q = useTableQuery({
    initialSortBy: 'updatedAt',
    initialSortOrder: 'desc',
    initialFilters: { gender: '', status: '', doctor: '' },
  });

  useEffect(() => { void fetchList(); }, [fetchList]);
  useEffect(() => { void fetchUsersForFilter({ role: 'doctor' }); }, [fetchUsersForFilter]);

  const doctorOptions = useMemo(
    () => (usersAllForFilter ?? []).filter((u) => u.role === 'doctor').map((u) => ({ value: u._id, label: u.name })),
    [usersAllForFilter],
  );

  const handleDelete = async () => {
    if (!deletingId) return;
    await removePatient(deletingId);
    setDeletingId(null);
  };

  const filtered = useMemo(() => applyTableQuery({
    rows: items,
    search: q.debouncedSearch,
    searchFields: (p) => `${p.patientId ?? ''} ${p.personalInfo.name} ${p.personalInfo.phone} ${p.personalInfo.email ?? ''}`,
    filters: q.filters,
    filterAccessors: {
      gender: (p) => p.personalInfo.gender,
      status: (p) => p.status ?? '',
      doctor: (p) => typeof p.assignedDoctor === 'object' ? p.assignedDoctor?._id ?? '' : (p.assignedDoctor ?? ''),
    },
    sortBy: q.sortBy,
    sortOrder: q.sortOrder,
    sortAccessors: {
      name: (p) => p.personalInfo.name,
      patientId: (p) => p.patientId,
      updatedAt: (p) => p.updatedAt ? new Date(p.updatedAt) : undefined,
      age: (p) => p.personalInfo.dob ? -new Date(p.personalInfo.dob).getTime() : 0,
    },
  }), [items, q.debouncedSearch, q.filters, q.sortBy, q.sortOrder]);

  const columns = useMemo<Column<Patient>[]>(() => [
    { key: 'patientId', header: 'Patient ID', sortKey: 'patientId', render: (r) => <code style={{ fontSize: 'var(--text-xs)' }}>{r.patientId}</code> },
    { key: 'name', header: 'Name', sortKey: 'name', render: (r) => <strong>{r.personalInfo.name}</strong> },
    { key: 'phone', header: 'Phone', render: (r) => r.personalInfo.phone },
    { key: 'gender', header: 'Gender', render: (r) => <span style={{ textTransform: 'capitalize' }}>{r.personalInfo.gender}</span> },
    { key: 'age', header: 'Age', sortKey: 'age', render: (r) => r.personalInfo.dob ? calculateAge(r.personalInfo.dob) : '—' },
    { key: 'updatedAt', header: 'Last Visit', sortKey: 'updatedAt', render: (r) => r.updatedAt ? formatDate(r.updatedAt) : '—' },
  ], []);

  return (
    <>
      <PageHeader
        title="Patients"
        subtitle="All registered patients"
        actions={<AddButton label="Add Patient" onClick={() => setShowModal(true)} />}
      />

      {error && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{error}</div>}

      <div className={styles.adminCard}>
        <FilterToolbar
          search={q.search}
          onSearchChange={q.setSearch}
          searchPlaceholder="Search name, phone, email, or patient ID…"
          filters={[
            {
              type: 'select',
              key: 'gender',
              label: 'Gender',
              icon: 'ri-user-3-line',
              options: [
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ],
            },
            {
              type: 'select',
              key: 'status',
              label: 'Status',
              icon: 'ri-flag-line',
              options: [
                { value: 'active', label: 'Active' },
                { value: 'discharged', label: 'Discharged' },
                { value: 'followup', label: 'Follow-up' },
              ],
            },
            {
              type: 'select',
              key: 'doctor',
              label: 'Doctor',
              icon: 'ri-user-star-line',
              options: doctorOptions,
            },
          ]}
          filterValues={q.filters}
          onFilterChange={q.setFilter}
          sort={{
            options: [
              { value: 'updatedAt', label: 'Last visit' },
              { value: 'name', label: 'Name' },
              { value: 'patientId', label: 'Patient ID' },
              { value: 'age', label: 'Age' },
            ],
          }}
          sortBy={q.sortBy}
          sortOrder={q.sortOrder}
          onSortChange={(by, order) => q.setSort(by, order)}
          onReset={q.resetAll}
          hasActive={q.hasActive}
          totalCount={items.length}
          filteredCount={filtered.length}
        />

        <DataTable
          rows={filtered}
          columns={columns}
          rowKey={(r) => r._id}
          loading={loading}
          sortBy={q.sortBy}
          sortOrder={q.sortOrder}
          onSort={q.toggleSort}
          renderActions={(row) => (
            <ActionMenu
              onView={() => setViewingId(row._id)}
              onEdit={() => router.push(`/admin/patients/${row._id}`)}
              onDelete={() => setDeletingId(row._id)}
            />
          )}
        />

        {!loading && filtered.length === 0 && (
          <div className={styles.empty}>
            <i className={`ri-team-line ${styles.emptyIcon}`} style={{ fontSize: 40 }} />
            <span>{q.hasActive ? 'No patients match your filters' : 'No patients yet'}</span>
            {q.hasActive && (
              <button type="button" onClick={q.resetAll} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
                <i className="ri-refresh-line" /> Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {showModal && <AddPatientModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); void fetchList(undefined, { force: true }); }} />}

      <ResourceDetailModal
        open={!!viewingId}
        id={viewingId}
        onClose={() => setViewingId(null)}
        fetcher={patientsApi.getOne}
        extraActions={(p) => (
          <button
            type="button"
            onClick={() => { const id = (p as { _id: string })._id; setViewingId(null); router.push(`/admin/patients/${id}`); }}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            Open Full Profile
          </button>
        )}
      />

      <ConfirmDialog
        open={!!deletingId}
        title="Delete this patient?"
        message="This will permanently remove the patient record and related history."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </>
  );
}

function AddPatientModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewPatientForm>();
  const [err, setErr] = useState('');
  const createPatient = usePatientsStore((s) => s.create);
  const usersAll = useUsersStore((s) => s.items) as unknown as DoctorUserLite[];
  const fetchUsers = useUsersStore((s) => s.fetchList);

  const doctors = useMemo(
    () => (usersAll ?? []).filter((u) => u.role === 'doctor'),
    [usersAll],
  );

  useEffect(() => {
    void fetchUsers({ role: 'doctor' });
  }, [fetchUsers]);

  const onSubmit = async (form: NewPatientForm) => {
    setErr('');
    const payload = {
      personalInfo: {
        name: form.name.trim(),
        phone: normalizeIndianPhone(form.phone),
        email: form.email?.trim() || undefined,
        dob: form.dob,
        gender: form.gender,
        address: form.address.trim(),
        city: form.city?.trim() || 'Ahmedabad',
        emergencyContact: {
          name: form.emergencyName.trim(),
          phone: normalizeIndianPhone(form.emergencyPhone),
          relation: form.emergencyRelation.trim(),
        },
      },
      medicalHistory: {
        chiefComplaint: form.chiefComplaint,
        allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        medications: form.medications ? form.medications.split(',').map((s) => s.trim()).filter(Boolean) : [],
      },
      assignedDoctor: form.assignedDoctor,
    };
    const result = await createPatient(payload as never);
    if (result) onSaved();
    else setErr('Failed to save');
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose} data-lenis-prevent>
      <div
        className={`${styles.modal} ${styles.modalLg}`}
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Add Patient</div>
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
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  className="form-input"
                  placeholder="10-digit Indian number"
                  maxLength={13}
                  {...register('phone', {
                    required: true,
                    validate: (v) => /^[6-9]\d{9}$/.test(normalizeIndianPhone(v)),
                  })}
                />
                {errors.phone && <div className="form-error">Enter a valid 10-digit Indian number</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" {...register('email')} />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input type="date" className="form-input" {...register('dob', { required: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select className="form-input" {...register('gender', { required: true })}>
                  <option value="">Select</option>
                  <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" placeholder="Ahmedabad" {...register('city')} />
              </div>
              <div className="form-group full">
                <label className="form-label">Address *</label>
                <textarea className="form-input" rows={2} {...register('address', { required: true, minLength: 5 })} />
                {errors.address && <div className="form-error">Address is required (min 5 chars)</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Doctor *</label>
                <select className="form-input" {...register('assignedDoctor', { required: true })}>
                  <option value="">Select doctor</option>
                  {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                {errors.assignedDoctor && <div className="form-error">Doctor is required</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Contact Name *</label>
                <input className="form-input" {...register('emergencyName', { required: true })} />
                {errors.emergencyName && <div className="form-error">Required</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Phone *</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  className="form-input"
                  placeholder="10-digit Indian number"
                  maxLength={13}
                  {...register('emergencyPhone', {
                    required: true,
                    validate: (v) => /^[6-9]\d{9}$/.test(normalizeIndianPhone(v)),
                  })}
                />
                {errors.emergencyPhone && <div className="form-error">Enter a valid 10-digit Indian number</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Relation *</label>
                <input className="form-input" placeholder="e.g. Spouse" {...register('emergencyRelation', { required: true })} />
                {errors.emergencyRelation && <div className="form-error">Required</div>}
              </div>
              <div className="form-group full">
                <label className="form-label">Chief Complaint *</label>
                <textarea className="form-input" rows={2} {...register('chiefComplaint', { required: true, minLength: 5 })} />
                {errors.chiefComplaint && <div className="form-error">Required (min 5 chars)</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Allergies (comma-separated)</label>
                <input className="form-input" {...register('allergies')} />
              </div>
              <div className="form-group">
                <label className="form-label">Medications (comma-separated)</label>
                <input className="form-input" {...register('medications')} />
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`${styles.btn} ${styles.btnPrimary}`}>
              {isSubmitting ? 'Saving...' : 'Create Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
