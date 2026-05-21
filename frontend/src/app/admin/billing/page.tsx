'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { billingApi, patientsApi, servicesApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@sai-physio/utils';
import styles from '../admin.module.css';
import local from './billing.module.css';

interface Bill {
  _id: string;
  invoiceNumber: string;
  patient: { _id: string; personalInfo?: { name?: string } } | string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

const TABS = ['invoices', 'daily', 'monthly', 'outstanding'] as const;
type Tab = typeof TABS[number];

const STATUS_BADGE: Record<string, string> = {
  paid: styles.badgeSuccess,
  partial: styles.badgeWarning,
  pending: styles.badgeError,
  waived: styles.badgeNeutral,
};

export default function BillingPage() {
  const [tab, setTab] = useState<Tab>('invoices');

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Billing</h1>
          <p className={styles.pageSub}>Invoices, payments, and revenue reports</p>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.active : ''}`} onClick={() => setTab(t)}>
            {t === 'outstanding' ? 'Outstanding Dues' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'invoices' && <InvoicesView />}
      {tab === 'daily' && <DailyView />}
      {tab === 'monthly' && <MonthlyView />}
      {tab === 'outstanding' && <OutstandingView />}
    </>
  );
}

function InvoicesView() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<Bill | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await billingApi.getAll(params);
      setBills(res.data?.data ?? res.data ?? []);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); /* eslint-disable-next-line */ }, [statusFilter]);

  return (
    <>
      {error && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{error}</div>}
      <div className={styles.adminCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Invoices</div>
          <div className={styles.actions}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input" style={{ padding: '6px 10px' }}>
              <option value="">All statuses</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
              <option value="waived">Waived</option>
            </select>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setShowCreate(true)}>
              <i className="ri-add-line" style={{ fontSize: 16 }} /> Create Invoice
            </button>
          </div>
        </div>
        <div className={styles.tableWrap}>
          {loading ? <div className={styles.spinner} /> : bills.length === 0 ? (
            <div className={styles.empty}><i className={`ri-receipt-line ${styles.emptyIcon}`} style={{ fontSize: 40 }} /><span>No invoices yet</span></div>
          ) : (
            <table className={styles.table}>
              <thead><tr><th>Invoice #</th><th>Patient</th><th>Date</th><th>Total</th><th>Paid</th><th>Due</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b._id}>
                    <td>{b.invoiceNumber}</td>
                    <td>{typeof b.patient === 'object' ? b.patient.personalInfo?.name ?? '—' : '—'}</td>
                    <td>{formatDate(b.createdAt)}</td>
                    <td>{formatCurrency(b.totalAmount)}</td>
                    <td>{formatCurrency(b.amountPaid)}</td>
                    <td>{formatCurrency(b.balanceDue)}</td>
                    <td><span className={`${styles.badge} ${STATUS_BADGE[b.paymentStatus] || styles.badgeNeutral}`}>{b.paymentStatus}</span></td>
                    <td>
                      {b.balanceDue > 0 && (
                        <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} onClick={() => setPaymentTarget(b)}>
                          <i className="ri-bank-card-line" style={{ fontSize: 14 }} /> Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); fetch(); }} />}
      {paymentTarget && <RecordPaymentModal bill={paymentTarget} onClose={() => setPaymentTarget(null)} onSaved={() => { setPaymentTarget(null); fetch(); }} />}
    </>
  );
}

function DailyView() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<{ totalRevenue?: number; totalInvoices?: number; cash?: number; upi?: number; pending?: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    billingApi.daily(date).then((r) => setData(r.data?.data ?? r.data ?? {})).catch(() => setData({})).finally(() => setLoading(false));
  }, [date]);

  return (
    <div className={styles.adminCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>Daily Report</div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" style={{ maxWidth: 200 }} />
      </div>
      <div className={styles.cardBody}>
        {loading ? <div className={styles.spinner} /> : (
          <div className={local.summaryGrid}>
            <div className={local.summaryBox}>
              <div className={local.summaryLabel}>Total Revenue</div>
              <div className={local.summaryValue}>{formatCurrency(data?.totalRevenue ?? 0)}</div>
            </div>
            <div className={local.summaryBox}>
              <div className={local.summaryLabel}>Invoices</div>
              <div className={local.summaryValue}>{data?.totalInvoices ?? 0}</div>
            </div>
            <div className={local.summaryBox}>
              <div className={local.summaryLabel}>Cash</div>
              <div className={local.summaryValue}>{formatCurrency(data?.cash ?? 0)}</div>
            </div>
            <div className={local.summaryBox}>
              <div className={local.summaryLabel}>UPI / Transfer</div>
              <div className={local.summaryValue}>{formatCurrency(data?.upi ?? 0)}</div>
            </div>
            <div className={local.summaryBox}>
              <div className={local.summaryLabel}>Pending</div>
              <div className={local.summaryValue}>{formatCurrency(data?.pending ?? 0)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MonthlyView() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<Array<{ day: string; revenue: number }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    billingApi.monthly(month)
      .then((r) => {
        const raw = r.data?.data ?? r.data ?? [];
        setData(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [month]);

  return (
    <div className={styles.adminCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>Monthly Report</div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="form-input" style={{ maxWidth: 200 }} />
      </div>
      <div className={styles.cardBody}>
        {loading ? <div className={styles.spinner} /> : data.length === 0 ? (
          <div className={styles.empty}><i className={`ri-inbox-line ${styles.emptyIcon}`} style={{ fontSize: 36 }} /><span>No data for this month</span></div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#1B4F8A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function OutstandingView() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billingApi.outstanding()
      .then((r) => setBills(r.data?.data ?? r.data ?? []))
      .catch(() => setBills([]))
      .finally(() => setLoading(false));
  }, []);

  const total = useMemo(() => bills.reduce((s, b) => s + (b.balanceDue || 0), 0), [bills]);

  return (
    <div className={styles.adminCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>Outstanding Dues — {formatCurrency(total)}</div>
      </div>
      <div className={styles.tableWrap}>
        {loading ? <div className={styles.spinner} /> : bills.length === 0 ? (
          <div className={styles.empty}><i className={`ri-inbox-line ${styles.emptyIcon}`} style={{ fontSize: 36 }} /><span>No outstanding dues</span></div>
        ) : (
          <table className={styles.table}>
            <thead><tr><th>Invoice #</th><th>Patient</th><th>Total</th><th>Paid</th><th>Due</th><th>Date</th></tr></thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b._id}>
                  <td>{b.invoiceNumber}</td>
                  <td>{typeof b.patient === 'object' ? b.patient.personalInfo?.name ?? '—' : '—'}</td>
                  <td>{formatCurrency(b.totalAmount)}</td>
                  <td>{formatCurrency(b.amountPaid)}</td>
                  <td><strong>{formatCurrency(b.balanceDue)}</strong></td>
                  <td>{formatDate(b.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

interface InvoiceForm {
  patient: string;
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
  discount: number;
  discountType: 'flat' | 'percentage';
  tax: number;
  paymentMethod: string;
  notes?: string;
}

interface PatientLite { _id: string; personalInfo?: { name?: string; phone?: string } }
interface ServiceLite { _id: string; name: string; price?: { from?: number } }

function CreateInvoiceModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { register, handleSubmit, control, watch, formState: { isSubmitting } } = useForm<InvoiceForm>({
    defaultValues: {
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      discount: 0, discountType: 'flat', tax: 0, paymentMethod: 'pending',
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = watch('items');
  const discount = watch('discount');
  const discountType = watch('discountType');
  const tax = watch('tax');

  const subtotal = useMemo(() => items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0), [items]);
  const discountAmt = discountType === 'percentage' ? (subtotal * (Number(discount) || 0)) / 100 : Number(discount) || 0;
  const taxAmt = ((subtotal - discountAmt) * (Number(tax) || 0)) / 100;
  const grand = subtotal - discountAmt + taxAmt;

  const [patients, setPatients] = useState<PatientLite[]>([]);
  const [pq, setPq] = useState('');
  const [services, setServices] = useState<ServiceLite[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => { servicesApi.getAll().then((r) => setServices(r.data?.data ?? r.data ?? [])).catch(() => {}); }, []);
  useEffect(() => {
    if (!pq || pq.length < 2) return;
    const t = setTimeout(() => patientsApi.search(pq).then((r) => setPatients(r.data?.data ?? r.data ?? [])).catch(() => {}), 300);
    return () => clearTimeout(t);
  }, [pq]);

  const onSubmit = async (form: InvoiceForm) => {
    setErr('');
    try {
      await billingApi.create({
        patient: form.patient,
        items: form.items.map((i) => ({ ...i, total: Number(i.quantity) * Number(i.unitPrice) })),
        subtotal,
        discount: Number(form.discount) || 0,
        discountType: form.discountType,
        tax: Number(form.tax) || 0,
        totalAmount: grand,
        paymentMethod: form.paymentMethod,
        notes: form.notes,
      });
      onSaved();
    } catch (e: unknown) {
      setErr((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose} data-lenis-prevent>
      <div
        className={`${styles.modal} ${styles.modalLg}`}
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Create Invoice</div>
          <button className={styles.iconBtn} onClick={onClose}><i className="ri-close-line" style={{ fontSize: 18 }} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.modalBody}>
            {err && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{err}</div>}

            <div className="form-group">
              <label className="form-label">Search Patient *</label>
              <input className="form-input" placeholder="Type name or phone..." value={pq} onChange={(e) => setPq(e.target.value)} />
              <select className="form-input" {...register('patient', { required: true })} style={{ marginTop: 8 }}>
                <option value="">Select patient</option>
                {patients.map((p) => <option key={p._id} value={p._id}>{p.personalInfo?.name} — {p.personalInfo?.phone}</option>)}
              </select>
            </div>

            <div style={{ marginTop: 'var(--space-4)' }}>
              <label className="form-label">Line Items</label>
              {fields.map((f, idx) => (
                <div key={f.id} className={local.itemsRow}>
                  <Controller
                    control={control}
                    name={`items.${idx}.description`}
                    render={({ field }) => (
                      <input
                        list="services-list"
                        className="form-input"
                        placeholder="Service / item"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          const svc = services.find((s) => s.name === e.target.value);
                          if (svc?.price?.from !== undefined) {
                            const ev = new Event('input', { bubbles: true });
                            const el = document.querySelector(`[name="items.${idx}.unitPrice"]`) as HTMLInputElement | null;
                            if (el) { el.value = String(svc.price.from); el.dispatchEvent(ev); }
                          }
                        }}
                      />
                    )}
                  />
                  <input type="number" min={1} className="form-input" placeholder="Qty" {...register(`items.${idx}.quantity`, { valueAsNumber: true })} />
                  <input type="number" min={0} className="form-input" placeholder="Price" {...register(`items.${idx}.unitPrice`, { valueAsNumber: true })} />
                  <input className="form-input" readOnly value={formatCurrency((Number(items[idx]?.quantity) || 0) * (Number(items[idx]?.unitPrice) || 0))} />
                  <button type="button" className={styles.iconBtn} onClick={() => fields.length > 1 && remove(idx)}><i className="ri-delete-bin-line" style={{ fontSize: 16 }} /></button>
                </div>
              ))}
              <datalist id="services-list">
                {services.map((s) => <option key={s._id} value={s.name} />)}
              </datalist>
              <button type="button" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}>
                <i className="ri-add-line" style={{ fontSize: 14 }} /> Add Item
              </button>
            </div>

            <div className={styles.formGrid} style={{ marginTop: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Discount</label>
                <input type="number" min={0} className="form-input" {...register('discount', { valueAsNumber: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">Discount Type</label>
                <select className="form-input" {...register('discountType')}>
                  <option value="flat">Flat (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tax (%)</label>
                <input type="number" min={0} className="form-input" {...register('tax', { valueAsNumber: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-input" {...register('paymentMethod')}>
                  <option value="pending">Pending</option>
                  <option value="cash">Cash</option>
                  <option value="upi_manual">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div className="form-group full">
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} {...register('notes')} />
              </div>
            </div>

            <div className={local.totals}>
              <div className={local.totalRow}><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className={local.totalRow}><span>Discount</span><span>−{formatCurrency(discountAmt)}</span></div>
              <div className={local.totalRow}><span>Tax</span><span>+{formatCurrency(taxAmt)}</span></div>
              <div className={`${local.totalRow} ${local.grand}`}><span>Total</span><span>{formatCurrency(grand)}</span></div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`${styles.btn} ${styles.btnPrimary}`}>
              {isSubmitting ? 'Saving...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RecordPaymentModal({ bill, onClose, onSaved }: { bill: Bill; onClose: () => void; onSaved: () => void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ amount: number; paymentMethod: string; reference?: string }>({
    defaultValues: { amount: bill.balanceDue, paymentMethod: 'cash' },
  });
  const [err, setErr] = useState('');

  const onSubmit = async (form: { amount: number; paymentMethod: string; reference?: string }) => {
    setErr('');
    try {
      await billingApi.recordPayment(bill._id, { amount: Number(form.amount), paymentMethod: form.paymentMethod, reference: form.reference });
      onSaved();
    } catch (e: unknown) {
      setErr((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose} data-lenis-prevent>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} data-lenis-prevent>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Record Payment — {bill.invoiceNumber}</div>
          <button className={styles.iconBtn} onClick={onClose}><i className="ri-close-line" style={{ fontSize: 18 }} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.modalBody}>
            {err && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{err}</div>}
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Amount *</label>
                <input type="number" min={0} max={bill.balanceDue} className="form-input" {...register('amount', { required: true, valueAsNumber: true })} />
                <span className={styles.muted} style={{ fontSize: 'var(--text-xs)' }}>Due: {formatCurrency(bill.balanceDue)}</span>
              </div>
              <div className="form-group">
                <label className="form-label">Method *</label>
                <select className="form-input" {...register('paymentMethod', { required: true })}>
                  <option value="cash">Cash</option>
                  <option value="upi_manual">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div className="form-group full">
                <label className="form-label">Reference (txn id, cheque no.)</label>
                <input className="form-input" {...register('reference')} />
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`${styles.btn} ${styles.btnPrimary}`}>
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
