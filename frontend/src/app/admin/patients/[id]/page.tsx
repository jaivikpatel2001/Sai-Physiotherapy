'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { patientsApi, sessionsApi } from '@/lib/api';
import { calculateAge, formatCurrency, formatDate } from '@sai-physio/utils';
import styles from '../../admin.module.css';
import local from '../patients.module.css';

interface Session {
  _id: string;
  sessionNumber: number;
  date: string;
  chiefComplaint: string;
  soapNotes: { subjective: string; objective: string; assessment: string; plan: string };
  vitalSigns?: { painScale?: number };
  treatmentsGiven?: string[];
  exercisesPrescribed?: string[];
  recoveryPercentage?: number;
}

interface Bill {
  _id: string;
  invoiceNumber: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: string;
  createdAt: string;
}

interface Patient {
  _id: string;
  patientId: string;
  personalInfo: {
    name: string; phone: string; email?: string;
    gender: string; dob: string; address?: string; city?: string;
    bloodGroup?: string;
    emergencyContact?: { name: string; phone: string; relation: string };
  };
  medicalHistory?: {
    chiefComplaint?: string;
    pastHistory?: string;
    allergies?: string[];
    medications?: string[];
  };
  status?: string;
}

const TABS = ['overview', 'sessions', 'bills', 'recovery'] as const;
type Tab = typeof TABS[number];

export default function PatientDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [tab, setTab] = useState<Tab>('overview');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [recovery, setRecovery] = useState<Array<{ date: string; pain: number; recovery?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSession, setShowSession] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, s, b, r] = await Promise.allSettled([
        patientsApi.getById(id),
        patientsApi.getSessions(id),
        patientsApi.getBills(id),
        sessionsApi.getRecovery(id),
      ]);
      if (p.status === 'fulfilled') setPatient(p.value.data?.data ?? p.value.data);
      if (s.status === 'fulfilled') setSessions(s.value.data?.data ?? s.value.data ?? []);
      if (b.status === 'fulfilled') setBills(b.value.data?.data ?? b.value.data ?? []);
      if (r.status === 'fulfilled') {
        const raw = r.value.data?.data ?? r.value.data ?? [];
        setRecovery(raw.map((x: { date: string; painScale?: number; recoveryPercentage?: number }) => ({
          date: formatDate(x.date),
          pain: x.painScale ?? 0,
          recovery: x.recoveryPercentage ?? 0,
        })));
      }
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchAll(); /* eslint-disable-next-line */ }, [id]);

  if (loading) return <div className={styles.spinner} />;
  if (!patient) return <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />Patient not found</div>;

  const pi = patient.personalInfo;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <Link href="/admin/patients" className={styles.muted} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', marginBottom: 8 }}>
            <i className="ri-arrow-left-line" style={{ fontSize: 14 }} /> Back to patients
          </Link>
          <h1 className={styles.pageTitle}>{pi.name}</h1>
          <p className={styles.pageSub}>{patient.patientId} · {pi.phone}</p>
        </div>
        {tab === 'sessions' && (
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setShowSession(true)}>
            <i className="ri-add-line" style={{ fontSize: 16 }} /> Add Session
          </button>
        )}
      </div>

      {error && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{error}</div>}

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.active : ''}`} onClick={() => setTab(t)}>
            {t === 'recovery' ? 'Recovery Chart' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className={local.detailGrid}>
          <div className={styles.adminCard}>
            <div className={styles.cardHeader}><div className={styles.cardTitle}>Personal Info</div></div>
            <div className={styles.cardBody}>
              <div className={local.infoRow}><span className={local.infoLabel}>Name</span><span className={local.infoValue}>{pi.name}</span></div>
              <div className={local.infoRow}><span className={local.infoLabel}>Age</span><span className={local.infoValue}>{pi.dob ? calculateAge(pi.dob) : '—'}</span></div>
              <div className={local.infoRow}><span className={local.infoLabel}>Gender</span><span className={local.infoValue} style={{ textTransform: 'capitalize' }}>{pi.gender}</span></div>
              <div className={local.infoRow}><span className={local.infoLabel}>Phone</span><span className={local.infoValue}>{pi.phone}</span></div>
              <div className={local.infoRow}><span className={local.infoLabel}>Email</span><span className={local.infoValue}>{pi.email ?? '—'}</span></div>
              <div className={local.infoRow}><span className={local.infoLabel}>City</span><span className={local.infoValue}>{pi.city ?? '—'}</span></div>
              <div className={local.infoRow}><span className={local.infoLabel}>Address</span><span className={local.infoValue}>{pi.address ?? '—'}</span></div>
            </div>
          </div>
          <div className={styles.adminCard}>
            <div className={styles.cardHeader}><div className={styles.cardTitle}>Medical & Emergency</div></div>
            <div className={styles.cardBody}>
              <div className={local.infoRow}><span className={local.infoLabel}>Chief Complaint</span><span className={local.infoValue}>{patient.medicalHistory?.chiefComplaint ?? '—'}</span></div>
              <div className={local.infoRow}><span className={local.infoLabel}>Allergies</span><span className={local.infoValue}>{patient.medicalHistory?.allergies?.join(', ') || '—'}</span></div>
              <div className={local.infoRow}><span className={local.infoLabel}>Medications</span><span className={local.infoValue}>{patient.medicalHistory?.medications?.join(', ') || '—'}</span></div>
              <div className={local.infoRow}><span className={local.infoLabel}>Blood Group</span><span className={local.infoValue}>{pi.bloodGroup ?? '—'}</span></div>
              <div className={local.infoRow}><span className={local.infoLabel}>Emergency</span><span className={local.infoValue}>{pi.emergencyContact ? `${pi.emergencyContact.name} (${pi.emergencyContact.relation}) — ${pi.emergencyContact.phone}` : '—'}</span></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'sessions' && (
        <div>
          {sessions.length === 0 ? (
            <div className={styles.empty}><i className={`ri-inbox-line ${styles.emptyIcon}`} style={{ fontSize: 36 }} /><span>No sessions logged yet</span></div>
          ) : sessions.map((s) => (
            <div key={s._id} className={local.sessionItem}>
              <div className={local.sessionHeader}>
                <div>
                  <strong>Session #{s.sessionNumber}</strong>
                  <div className={local.sessionMeta}>{formatDate(s.date)} · Pain: {s.vitalSigns?.painScale ?? '—'}/10 · Recovery: {s.recoveryPercentage ?? 0}%</div>
                </div>
              </div>
              <div className={local.soapGrid}>
                <div className={local.soapBlock}><div className={local.soapLabel}>Subjective</div>{s.soapNotes.subjective}</div>
                <div className={local.soapBlock}><div className={local.soapLabel}>Objective</div>{s.soapNotes.objective}</div>
                <div className={local.soapBlock}><div className={local.soapLabel}>Assessment</div>{s.soapNotes.assessment}</div>
                <div className={local.soapBlock}><div className={local.soapLabel}>Plan</div>{s.soapNotes.plan}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'bills' && (
        <div className={styles.adminCard}>
          <div className={styles.tableWrap}>
            {bills.length === 0 ? (
              <div className={styles.empty}><i className={`ri-inbox-line ${styles.emptyIcon}`} style={{ fontSize: 36 }} /><span>No bills</span></div>
            ) : (
              <table className={styles.table}>
                <thead><tr><th>Invoice #</th><th>Date</th><th>Total</th><th>Paid</th><th>Due</th><th>Status</th></tr></thead>
                <tbody>
                  {bills.map((b) => (
                    <tr key={b._id}>
                      <td>{b.invoiceNumber}</td>
                      <td>{formatDate(b.createdAt)}</td>
                      <td>{formatCurrency(b.totalAmount)}</td>
                      <td>{formatCurrency(b.amountPaid)}</td>
                      <td>{formatCurrency(b.balanceDue)}</td>
                      <td><span className={`${styles.badge} ${b.paymentStatus === 'paid' ? styles.badgeSuccess : styles.badgeWarning}`}>{b.paymentStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'recovery' && (
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>Pain & Recovery Progression</div>
          {recovery.length === 0 ? (
            <div className={styles.empty}><i className={`ri-inbox-line ${styles.emptyIcon}`} style={{ fontSize: 36 }} /><span>No data yet</span></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={recovery}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="pain" stroke="#EF4444" strokeWidth={2.5} name="Pain (0-10)" />
                <Line type="monotone" dataKey="recovery" stroke="#10B981" strokeWidth={2.5} name="Recovery %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {showSession && <AddSessionModal patientId={id} onClose={() => setShowSession(false)} onSaved={() => { setShowSession(false); fetchAll(); }} />}
    </>
  );
}

interface SessionForm {
  date: string;
  chiefComplaint: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  painScale: number;
  exercises: string;
  treatments: string;
  recoveryPercentage: number;
  notes?: string;
}

function AddSessionModal({ patientId, onClose, onSaved }: { patientId: string; onClose: () => void; onSaved: () => void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<SessionForm>({
    defaultValues: { painScale: 5, recoveryPercentage: 0, date: new Date().toISOString().split('T')[0] },
  });
  const [err, setErr] = useState('');

  const onSubmit = async (form: SessionForm) => {
    setErr('');
    try {
      await sessionsApi.create({
        patient: patientId,
        date: form.date,
        chiefComplaint: form.chiefComplaint,
        soapNotes: {
          subjective: form.subjective,
          objective: form.objective,
          assessment: form.assessment,
          plan: form.plan,
        },
        vitalSigns: { painScale: Number(form.painScale) },
        treatmentsGiven: form.treatments ? form.treatments.split(',').map((s) => s.trim()) : [],
        exercisesPrescribed: form.exercises ? form.exercises.split(',').map((s) => s.trim()) : [],
        recoveryPercentage: Number(form.recoveryPercentage),
      });
      onSaved();
    } catch (e: unknown) {
      setErr((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save');
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalLg}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>New Treatment Session</div>
          <button className={styles.iconBtn} onClick={onClose}><i className="ri-close-line" style={{ fontSize: 18 }} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.modalBody}>
            {err && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{err}</div>}
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-input" {...register('date', { required: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">Pain Level (0-10) *</label>
                <input type="number" min={0} max={10} className="form-input" {...register('painScale', { required: true, valueAsNumber: true })} />
              </div>
              <div className="form-group full">
                <label className="form-label">Chief Complaint</label>
                <input className="form-input" {...register('chiefComplaint', { required: true })} />
              </div>
              <div className="form-group full">
                <label className="form-label">Subjective</label>
                <textarea className="form-input" rows={2} {...register('subjective', { required: true })} />
              </div>
              <div className="form-group full">
                <label className="form-label">Objective</label>
                <textarea className="form-input" rows={2} {...register('objective', { required: true })} />
              </div>
              <div className="form-group full">
                <label className="form-label">Assessment</label>
                <textarea className="form-input" rows={2} {...register('assessment', { required: true })} />
              </div>
              <div className="form-group full">
                <label className="form-label">Plan</label>
                <textarea className="form-input" rows={2} {...register('plan', { required: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">Treatments Given (comma-separated)</label>
                <input className="form-input" {...register('treatments')} />
              </div>
              <div className="form-group">
                <label className="form-label">Exercises (comma-separated)</label>
                <input className="form-input" {...register('exercises')} />
              </div>
              <div className="form-group">
                <label className="form-label">Recovery %</label>
                <input type="number" min={0} max={100} className="form-input" {...register('recoveryPercentage', { valueAsNumber: true })} />
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`${styles.btn} ${styles.btnPrimary}`}>
              {isSubmitting ? 'Saving...' : 'Save Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
