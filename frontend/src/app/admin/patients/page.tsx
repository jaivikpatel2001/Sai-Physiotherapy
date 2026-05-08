'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { patientsApi } from '@/lib/api';
import { calculateAge, formatDate } from '@sai-physio/utils';
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
  };
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
  chiefComplaint: string;
  allergies?: string;
  medications?: string;
}

export default function PatientsPage() {
  const router = useRouter();
  const [data, setData] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchData = async (q?: string) => {
    setLoading(true);
    setError('');
    try {
      const res = q ? await patientsApi.search(q) : await patientsApi.getAll();
      setData(res.data?.data ?? res.data ?? []);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchData(search || undefined), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const columns = useMemo<ColumnDef<Patient>[]>(() => [
    { accessorKey: 'patientId', header: 'Patient ID' },
    { header: 'Name', accessorFn: (r) => r.personalInfo.name },
    { header: 'Phone', accessorFn: (r) => r.personalInfo.phone },
    { header: 'Gender', accessorFn: (r) => r.personalInfo.gender, cell: (c) => <span style={{ textTransform: 'capitalize' }}>{c.getValue() as string}</span> },
    { header: 'Age', accessorFn: (r) => r.personalInfo.dob ? calculateAge(r.personalInfo.dob) : '—' },
    { header: 'Last Visit', accessorFn: (r) => r.updatedAt ? formatDate(r.updatedAt) : '—' },
  ], []);

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Patients</h1>
          <p className={styles.pageSub}>All registered patients</p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setShowModal(true)}>
          <i className="ri-add-line" style={{ fontSize: 16 }} /> Add Patient
        </button>
      </div>

      {error && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{error}</div>}

      <div className={styles.adminCard}>
        <div className={styles.filterBar}>
          <div className={styles.filterField} style={{ flex: 1 }}>
            <span className={styles.filterLabel}>Search</span>
            <div className={styles.searchWrap}>
              <i className={`ri-search-line ${styles.searchIcon}`} style={{ fontSize: 16 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, phone, or ID..."
                className={`form-input ${styles.searchInput}`}
              />
            </div>
          </div>
        </div>

        <div className={styles.tableWrap}>
          {loading ? <div className={styles.spinner} /> : data.length === 0 ? (
            <div className={styles.empty}><i className={`ri-team-line ${styles.emptyIcon}`} style={{ fontSize: 40 }} /><span>No patients found</span></div>
          ) : (
            <table className={styles.table}>
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>)}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className={styles.rowClickable} onClick={() => router.push(`/admin/patients/${row.original._id}`)}>
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

      {showModal && <AddPatientModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchData(); }} />}
    </>
  );
}

function AddPatientModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewPatientForm>();
  const [err, setErr] = useState('');

  const onSubmit = async (form: NewPatientForm) => {
    setErr('');
    try {
      await patientsApi.create({
        personalInfo: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          dob: form.dob,
          gender: form.gender,
          address: form.address,
          city: form.city,
          emergencyContact: {
            name: form.emergencyName,
            phone: form.emergencyPhone,
            relation: form.emergencyRelation,
          },
        },
        medicalHistory: {
          chiefComplaint: form.chiefComplaint,
          allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()) : [],
          medications: form.medications ? form.medications.split(',').map((s) => s.trim()) : [],
        },
      });
      onSaved();
    } catch (e: unknown) {
      setErr((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create patient');
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalLg}`} onClick={(e) => e.stopPropagation()}>
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
                <input className="form-input" {...register('phone', { required: true })} />
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
                <input className="form-input" {...register('city')} />
              </div>
              <div className="form-group full">
                <label className="form-label">Address</label>
                <textarea className="form-input" rows={2} {...register('address')} />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Contact Name</label>
                <input className="form-input" {...register('emergencyName')} />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Phone</label>
                <input className="form-input" {...register('emergencyPhone')} />
              </div>
              <div className="form-group">
                <label className="form-label">Relation</label>
                <input className="form-input" placeholder="e.g. Spouse" {...register('emergencyRelation')} />
              </div>
              <div className="form-group full">
                <label className="form-label">Chief Complaint *</label>
                <textarea className="form-input" rows={2} {...register('chiefComplaint', { required: true })} />
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
