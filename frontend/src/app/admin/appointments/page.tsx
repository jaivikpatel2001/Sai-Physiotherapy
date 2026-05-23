'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useAppointmentsStore,
  usePatientsStore,
  useServicesStore,
  useUsersStore,
  appointmentsApi,
} from '@/store';
import { formatDate, formatTime } from '@sai-physio/utils';
import {
  PageHeader,
  AddButton,
  ActionMenu,
  ConfirmDialog,
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

interface Appt {
  _id: string;
  appointmentId: string;
  patient: { _id: string; personalInfo?: { name?: string; phone?: string } } | string;
  doctor: { _id: string; name?: string } | string;
  service: { _id: string; name?: string } | string;
  scheduledAt: string;
  duration?: number;
  type?: string;
  status: string;
  notes?: string;
  cancelReason?: string;
}

const STATUSES = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];

interface ApptForm {
  patient: string;
  doctor: string;
  service: string;
  scheduledAt: string;
  duration: number;
  type: 'new' | 'followup' | 'emergency';
  notes?: string;
}

export default function AppointmentsPage() {
  const data = useAppointmentsStore((s) => s.items) as unknown as Appt[];
  const loading = useAppointmentsStore((s) => s.status === 'loading');
  const error = useAppointmentsStore((s) => s.error?.message ?? '');
  const fetchList = useAppointmentsStore((s) => s.fetchList);
  const updateApptStatus = useAppointmentsStore((s) => s.updateStatus);
  const removeAppt = useAppointmentsStore((s) => s.remove);

  const [showCreate, setShowCreate] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Appt | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const q = useTableQuery({
    initialSortBy: 'scheduledAt',
    initialSortOrder: 'desc',
    initialFilters: { status: '', date: '', type: '' },
  });

  useEffect(() => {
    const params: Record<string, string> = {};
    if (q.filters.status) params.status = q.filters.status;
    if (q.filters.date) params.date = q.filters.date;
    void fetchList(params, { force: true });
  }, [q.filters.status, q.filters.date, fetchList]);

  const handleStatusChange = async (id: string, status: string) => {
    await updateApptStatus(id, status);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await removeAppt(deletingId);
    setDeletingId(null);
  };

  const filtered = useMemo(() => applyTableQuery({
    rows: data,
    search: q.debouncedSearch,
    searchFields: (a) => {
      const name = typeof a.patient === 'object' ? a.patient.personalInfo?.name ?? '' : '';
      const phone = typeof a.patient === 'object' ? a.patient.personalInfo?.phone ?? '' : '';
      return `${a.appointmentId ?? ''} ${name} ${phone}`;
    },
    filters: { type: q.filters.type ?? '' },
    filterAccessors: { type: (a) => a.type ?? '' },
    sortBy: q.sortBy,
    sortOrder: q.sortOrder,
    sortAccessors: {
      scheduledAt: (a) => a.scheduledAt ? new Date(a.scheduledAt) : undefined,
      patient: (a) => typeof a.patient === 'object' ? a.patient.personalInfo?.name ?? '' : '',
      doctor: (a) => typeof a.doctor === 'object' ? a.doctor.name ?? '' : '',
      status: (a) => a.status,
      appointmentId: (a) => a.appointmentId ?? '',
    },
  }), [data, q.debouncedSearch, q.filters.type, q.sortBy, q.sortOrder]);

  const columns = useMemo<Column<Appt>[]>(() => [
    {
      key: 'appointmentId',
      header: 'ID',
      sortKey: 'appointmentId',
      render: (r) => <code style={{ fontSize: 'var(--text-xs)' }}>{r.appointmentId}</code>,
    },
    {
      key: 'patient',
      header: 'Patient',
      sortKey: 'patient',
      render: (r) => typeof r.patient === 'object' ? (r.patient.personalInfo?.name ?? '—') : '—',
    },
    {
      key: 'service',
      header: 'Service',
      render: (r) => typeof r.service === 'object' ? (r.service.name ?? '—') : '—',
    },
    {
      key: 'scheduledAt',
      header: 'Date & Time',
      sortKey: 'scheduledAt',
      render: (r) => r.scheduledAt ? `${formatDate(r.scheduledAt)} · ${formatTime(r.scheduledAt)}` : '—',
    },
    {
      key: 'doctor',
      header: 'Doctor',
      sortKey: 'doctor',
      render: (r) => typeof r.doctor === 'object' ? (r.doctor.name ?? '—') : '—',
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      render: (r) => <StatusBadge label={r.status.replace('_', ' ')} tone={toneFor(r.status)} />,
    },
  ], []);

  return (
    <>
      <PageHeader
        title="Appointments"
        subtitle="Manage scheduled, today, and upcoming appointments"
        actions={<AddButton label="New Appointment" onClick={() => setShowCreate(true)} />}
      />

      {error && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{error}</div>}

      <div className={styles.adminCard}>
        <FilterToolbar
          search={q.search}
          onSearchChange={q.setSearch}
          searchPlaceholder="Search patient, phone, or appointment ID…"
          filters={[
            {
              type: 'select',
              key: 'status',
              label: 'Status',
              icon: 'ri-flag-line',
              options: STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') })),
            },
            { type: 'date', key: 'date', label: 'Date', icon: 'ri-calendar-line' },
            {
              type: 'select',
              key: 'type',
              label: 'Type',
              icon: 'ri-stack-line',
              options: [
                { value: 'new', label: 'New visit' },
                { value: 'followup', label: 'Follow-up' },
                { value: 'emergency', label: 'Emergency' },
              ],
            },
          ]}
          filterValues={q.filters}
          onFilterChange={q.setFilter}
          sort={{
            options: [
              { value: 'scheduledAt', label: 'Date & time' },
              { value: 'patient', label: 'Patient name' },
              { value: 'doctor', label: 'Doctor' },
              { value: 'status', label: 'Status' },
              { value: 'appointmentId', label: 'Appointment ID' },
            ],
          }}
          sortBy={q.sortBy}
          sortOrder={q.sortOrder}
          onSortChange={(by, order) => q.setSort(by, order)}
          onReset={q.resetAll}
          hasActive={q.hasActive}
          totalCount={data.length}
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
              onEdit={() => setEditing(row)}
              onDelete={() => setDeletingId(row._id)}
            />
          )}
        />

        {!loading && filtered.length === 0 && (
          <div className={styles.empty}>
            <i className={`ri-calendar-line ${styles.emptyIcon}`} style={{ fontSize: 40 }} />
            <span>{q.hasActive ? 'No appointments match your filters' : 'No appointments yet'}</span>
            {q.hasActive && (
              <button type="button" onClick={q.resetAll} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
                <i className="ri-refresh-line" /> Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {showCreate && (
        <ApptFormModal
          mode="create"
          appt={null}
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); void fetchList(undefined, { force: true }); }}
        />
      )}

      {editing && (
        <ApptFormModal
          mode="edit"
          appt={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); void fetchList(undefined, { force: true }); }}
        />
      )}

      <ResourceDetailModal
        open={!!viewingId}
        id={viewingId}
        onClose={() => setViewingId(null)}
        fetcher={appointmentsApi.getOne}
        extraActions={(appt) => (
          <select
            className="form-input"
            value={(appt as { status?: string }).status ?? ''}
            onChange={(e) => handleStatusChange((appt as { _id: string })._id, e.target.value)}
            style={{ maxWidth: 200 }}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        )}
      />

      <ConfirmDialog
        open={!!deletingId}
        title="Delete this appointment?"
        message="This will remove the appointment record. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </>
  );
}

interface PatientLite { _id: string; personalInfo?: { name?: string; phone?: string } }
interface ServiceLite { _id: string; name: string }
interface UserLite { _id: string; name: string; role: string }

function ApptFormModal({
  mode,
  appt,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit';
  appt: Appt | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = mode === 'edit';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ApptForm>({
    defaultValues: appt
      ? {
          patient: typeof appt.patient === 'object' ? appt.patient._id : (appt.patient as string),
          doctor: typeof appt.doctor === 'object' ? appt.doctor._id : (appt.doctor as string),
          service: typeof appt.service === 'object' ? appt.service._id : (appt.service as string),
          scheduledAt: appt.scheduledAt ? new Date(appt.scheduledAt).toISOString().slice(0, 16) : '',
          duration: appt.duration ?? 30,
          type: (appt.type as ApptForm['type']) ?? 'new',
          notes: appt.notes ?? '',
        }
      : { duration: 30, type: 'new' },
  });
  const [submitErr, setSubmitErr] = useState('');
  const [patientQuery, setPatientQuery] = useState('');

  const services = useServicesStore((s) => s.items) as unknown as ServiceLite[];
  const fetchServices = useServicesStore((s) => s.fetchList);
  const doctorsAll = useUsersStore((s) => s.items) as unknown as UserLite[];
  const fetchUsers = useUsersStore((s) => s.fetchList);
  const patients = usePatientsStore((s) => s.searchResults) as unknown as PatientLite[];
  const searchPatients = usePatientsStore((s) => s.search);
  const bookAppointment = useAppointmentsStore((s) => s.book);
  const updateAppointment = useAppointmentsStore((s) => s.update);

  const doctors = useMemo(
    () => (doctorsAll ?? []).filter((x) => x.role === 'doctor'),
    [doctorsAll],
  );

  useEffect(() => {
    void fetchServices();
    void fetchUsers({ role: 'doctor' });
  }, [fetchServices, fetchUsers]);

  useEffect(() => {
    if (!patientQuery || patientQuery.length < 2) { void searchPatients(''); return; }
    const t = setTimeout(() => { void searchPatients(patientQuery); }, 300);
    return () => clearTimeout(t);
  }, [patientQuery, searchPatients]);

  const onSubmit = async (form: ApptForm) => {
    setSubmitErr('');
    const payload = { ...form, scheduledAt: new Date(form.scheduledAt).toISOString() };
    const result = isEdit && appt
      ? await updateAppointment(appt._id, payload as never)
      : await bookAppointment(payload as never);
    if (result) onSaved();
    else setSubmitErr('Failed to save');
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose} data-lenis-prevent>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} data-lenis-prevent>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>{isEdit ? 'Edit Appointment' : 'New Appointment'}</div>
          <button className={styles.iconBtn} onClick={onClose}><i className="ri-close-line" style={{ fontSize: 18 }} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.modalBody}>
            {submitErr && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{submitErr}</div>}
            <div className={styles.formGrid}>
              {!isEdit && (
                <div className="form-group full">
                  <label className="form-label">Search Patient *</label>
                  <input className="form-input" placeholder="Type name or phone..." value={patientQuery} onChange={(e) => setPatientQuery(e.target.value)} />
                  {patients.length > 0 && (
                    <select className="form-input" {...register('patient', { required: true })}>
                      <option value="">Select patient</option>
                      {patients.map((p) => (
                        <option key={p._id} value={p._id}>{p.personalInfo?.name} — {p.personalInfo?.phone}</option>
                      ))}
                    </select>
                  )}
                  {errors.patient && <div className="form-error">Patient is required</div>}
                </div>
              )}
              {isEdit && (
                <input type="hidden" {...register('patient', { required: true })} />
              )}

              <div className="form-group">
                <label className="form-label">Service *</label>
                <select className="form-input" {...register('service', { required: true })}>
                  <option value="">Select service</option>
                  {services.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Doctor *</label>
                <select className="form-input" {...register('doctor', { required: true })}>
                  <option value="">Select doctor</option>
                  {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date & Time *</label>
                <input type="datetime-local" className="form-input" {...register('scheduledAt', { required: true })} />
              </div>

              <div className="form-group">
                <label className="form-label">Duration (mins)</label>
                <input type="number" className="form-input" min={15} step={15} {...register('duration', { valueAsNumber: true })} />
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" {...register('type')}>
                  <option value="new">New Visit</option>
                  <option value="followup">Follow-up</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div className="form-group full">
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={3} {...register('notes')} />
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`${styles.btn} ${styles.btnPrimary}`}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
