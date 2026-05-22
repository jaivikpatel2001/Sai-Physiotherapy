'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel,
  useReactTable, getPaginationRowModel,
} from '@tanstack/react-table';
import {
  useAppointmentsStore,
  usePatientsStore,
  useServicesStore,
  useUsersStore,
} from '@/store';
import { formatDate, formatTime } from '@sai-physio/utils';
import styles from '../admin.module.css';

interface Appt {
  _id: string;
  appointmentId: string;
  patient: { _id: string; personalInfo?: { name?: string } } | string;
  doctor: { _id: string; name?: string } | string;
  service: { _id: string; name?: string } | string;
  scheduledAt: string;
  status: string;
  notes?: string;
}

const STATUS_BADGE: Record<string, string> = {
  scheduled: styles.badgeInfo,
  confirmed: styles.badgePrimary,
  in_progress: styles.badgeWarning,
  completed: styles.badgeSuccess,
  cancelled: styles.badgeError,
  no_show: styles.badgeNeutral,
};

const STATUSES = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];

interface NewApptForm {
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

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    if (dateFilter) params.date = dateFilter;
    void fetchList(params, { force: true });
  }, [statusFilter, dateFilter, fetchList]);

  const handleStatusChange = async (id: string, status: string) => {
    await updateApptStatus(id, status);
  };

  const columns = useMemo<ColumnDef<Appt>[]>(() => [
    { accessorKey: 'appointmentId', header: 'ID' },
    {
      header: 'Patient',
      accessorFn: (r) => typeof r.patient === 'object' ? (r.patient.personalInfo?.name ?? '—') : '—',
    },
    {
      header: 'Service',
      accessorFn: (r) => typeof r.service === 'object' ? (r.service.name ?? '—') : '—',
    },
    {
      header: 'Date & Time',
      accessorFn: (r) => r.scheduledAt,
      cell: (c) => {
        const v = c.getValue() as string;
        return v ? `${formatDate(v)} · ${formatTime(v)}` : '—';
      },
    },
    {
      header: 'Doctor',
      accessorFn: (r) => typeof r.doctor === 'object' ? (r.doctor.name ?? '—') : '—',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (c) => {
        const s = c.getValue() as string;
        return <span className={`${styles.badge} ${STATUS_BADGE[s] || styles.badgeNeutral}`}>{s.replace('_', ' ')}</span>;
      },
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (c) => {
        const row = c.row.original;
        return (
          <div className={styles.actions}>
            <select
              value={row.status}
              onChange={(e) => handleStatusChange(row._id, e.target.value)}
              className="form-input"
              style={{ padding: '4px 8px', fontSize: 'var(--text-xs)' }}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        );
      },
    },
  ], []);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((a) => {
      const pname = typeof a.patient === 'object' ? a.patient.personalInfo?.name ?? '' : '';
      return pname.toLowerCase().includes(q) || a.appointmentId?.toLowerCase().includes(q);
    });
  }, [data, search]);

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Appointments</h1>
          <p className={styles.pageSub}>Manage scheduled, today, and upcoming appointments</p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setShowModal(true)}>
          <i className="ri-add-line" style={{ fontSize: 16 }} /> New Appointment
        </button>
      </div>

      {error && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{error}</div>}

      <div className={styles.adminCard}>
        <div className={styles.filterBar}>
          <div className={styles.filterField} style={{ flex: 1, minWidth: 240 }}>
            <span className={styles.filterLabel}>Search</span>
            <div className={styles.searchWrap}>
              <i className={`ri-search-line ${styles.searchIcon}`} style={{ fontSize: 16 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Patient name or ID..."
                className={`form-input ${styles.searchInput}`}
              />
            </div>
          </div>
          <div className={styles.filterField}>
            <span className={styles.filterLabel}>Date</span>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="form-input" />
          </div>
          <div className={styles.filterField}>
            <span className={styles.filterLabel}>Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input">
              <option value="">All</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.spinner} />
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <i className={`ri-calendar-line ${styles.emptyIcon}`} style={{ fontSize: 40 }} />
              <span>No appointments found</span>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && <NewAppointmentModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); void fetchList(undefined, { force: true }); }} />}
    </>
  );
}

interface PatientLite { _id: string; personalInfo?: { name?: string; phone?: string } }
interface ServiceLite { _id: string; name: string }
interface UserLite { _id: string; name: string; role: string }

function NewAppointmentModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewApptForm>({
    defaultValues: { duration: 30, type: 'new' },
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

  const onSubmit = async (form: NewApptForm) => {
    setSubmitErr('');
    const payload = { ...form, scheduledAt: new Date(form.scheduledAt).toISOString() };
    const result = await bookAppointment(payload as never);
    if (result) onSaved();
    else setSubmitErr('Failed to save');
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose} data-lenis-prevent>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} data-lenis-prevent>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>New Appointment</div>
          <button className={styles.iconBtn} onClick={onClose}><i className="ri-close-line" style={{ fontSize: 18 }} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.modalBody}>
            {submitErr && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{submitErr}</div>}
            <div className={styles.formGrid}>
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
              {isSubmitting ? 'Saving...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
