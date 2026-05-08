'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X, AlertCircle, Stethoscope, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { servicesApi, adminServicesApi } from '@/lib/api';
import { formatCurrency } from '@sai-physio/utils';
import styles from '../admin.module.css';
import local from './services.module.css';

interface Service {
  _id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  longDescription?: string;
  price: { from: number; to?: number };
  duration: string;
  bannerImage?: string;
  isActive: boolean;
  order?: number;
}

interface ServiceForm {
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  duration: string;
  priceFrom: number;
  priceTo?: number;
  bannerImage: string;
  isActive: boolean;
  order: number;
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function ServicesAdminPage() {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const r = await servicesApi.getAll();
      setData(r.data?.data ?? r.data ?? []);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      await adminServicesApi.remove(id);
      fetch();
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Services</h1>
          <p className={styles.pageSub}>Manage clinic services and pricing</p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus size={16} /> Add Service
        </button>
      </div>

      {error && <div className={styles.errorBox}><AlertCircle size={16} />{error}</div>}

      {loading ? <div className={styles.spinner} /> : data.length === 0 ? (
        <div className={styles.empty}><Stethoscope size={40} className={styles.emptyIcon} /><span>No services</span></div>
      ) : (
        <div className={styles.cardGrid}>
          {data.map((s) => (
            <div key={s._id} className={styles.serviceCard}>
              {s.bannerImage ? (
                <div className={styles.serviceCardImg} style={{ backgroundImage: `url(${s.bannerImage})` }} />
              ) : (
                <div className={local.imgPlaceholder}><ImageIcon size={28} /></div>
              )}
              <div className={styles.serviceCardBody}>
                <div className={styles.serviceCardName}>{s.name}</div>
                <div className={styles.serviceCardMeta}>{s.category} · {s.duration}</div>
                <div className={styles.serviceCardMeta}>From {formatCurrency(s.price?.from ?? 0)}</div>
                <span className={`${styles.badge} ${s.isActive ? styles.badgeSuccess : styles.badgeNeutral}`} style={{ alignSelf: 'flex-start' }}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className={styles.serviceCardActions}>
                <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} onClick={() => { setEditing(s); setShowForm(true); }}>
                  <Edit size={14} /> Edit
                </button>
                <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => handleDelete(s._id)} style={{ color: 'var(--color-error)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <ServiceFormModal initial={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetch(); }} />}
    </>
  );
}

function ServiceFormModal({ initial, onClose, onSaved }: { initial: Service | null; onClose: () => void; onSaved: () => void }) {
  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<ServiceForm>({
    defaultValues: initial ? {
      name: initial.name,
      slug: initial.slug,
      category: initial.category,
      shortDescription: initial.shortDescription,
      longDescription: initial.longDescription ?? '',
      duration: initial.duration,
      priceFrom: initial.price.from,
      priceTo: initial.price.to,
      bannerImage: initial.bannerImage ?? '',
      isActive: initial.isActive,
      order: initial.order ?? 0,
    } : {
      name: '', slug: '', category: '', shortDescription: '', longDescription: '',
      duration: '30 mins', priceFrom: 0, bannerImage: '', isActive: true, order: 0,
    },
  });
  const name = watch('name');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!initial && name) setValue('slug', slugify(name));
  }, [name, initial, setValue]);

  const onSubmit = async (f: ServiceForm) => {
    setErr('');
    const payload = {
      name: f.name,
      slug: f.slug,
      category: f.category,
      shortDescription: f.shortDescription,
      longDescription: f.longDescription,
      duration: f.duration,
      price: { from: Number(f.priceFrom), to: f.priceTo ? Number(f.priceTo) : undefined },
      bannerImage: f.bannerImage,
      images: [],
      treatmentProcess: [], benefits: [], faqs: [],
      seo: { metaTitle: f.name, metaDescription: f.shortDescription, keywords: [] },
      isActive: f.isActive,
      order: Number(f.order),
    };
    try {
      if (initial) await adminServicesApi.update(initial._id, payload);
      else await adminServicesApi.create(payload);
      onSaved();
    } catch (e: unknown) {
      setErr((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalLg}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>{initial ? 'Edit Service' : 'Add Service'}</div>
          <button className={styles.iconBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.modalBody}>
            {err && <div className={styles.errorBox}><AlertCircle size={16} />{err}</div>}
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" {...register('name', { required: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">Slug *</label>
                <input className="form-input" {...register('slug', { required: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <input className="form-input" {...register('category', { required: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">Duration *</label>
                <input className="form-input" placeholder="e.g. 45 mins" {...register('duration', { required: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">Price From *</label>
                <input type="number" min={0} className="form-input" {...register('priceFrom', { required: true, valueAsNumber: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">Price To</label>
                <input type="number" min={0} className="form-input" {...register('priceTo', { valueAsNumber: true })} />
              </div>
              <div className="form-group full">
                <label className="form-label">Short Description *</label>
                <textarea className="form-input" rows={2} {...register('shortDescription', { required: true })} />
              </div>
              <div className="form-group full">
                <label className="form-label">Long Description</label>
                <textarea className="form-input" rows={4} {...register('longDescription')} />
              </div>
              <div className="form-group full">
                <label className="form-label">Banner Image URL</label>
                <input className="form-input" {...register('bannerImage')} />
              </div>
              <div className="form-group">
                <label className="form-label">Order</label>
                <input type="number" className="form-input" {...register('order', { valueAsNumber: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">Active</label>
                <label className={styles.hstack} style={{ marginTop: 8 }}>
                  <input type="checkbox" {...register('isActive')} /> Show on website
                </label>
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`${styles.btn} ${styles.btnPrimary}`}>
              {isSubmitting ? 'Saving...' : (initial ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
