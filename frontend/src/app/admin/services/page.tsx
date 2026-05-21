'use client';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Image from 'next/image';
import { servicesApi, adminServicesApi, type UploadedFile } from '@/lib/api';
import { formatCurrency } from '@sai-physio/utils';
import {
  PageHeader,
  AddButton,
  ActionMenu,
  Modal,
  ConfirmDialog,
  FileUpload,
  AsyncBoundary,
  StatusBadge,
  TagInput,
} from '@/components/admin';
import styles from '../admin.module.css';

interface ServicePrice {
  from: number;
  to?: number;
}

interface Service {
  _id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  longDescription?: string;
  price: ServicePrice;
  duration: string;
  bannerImage?: string;
  bannerStorageKey?: string;
  bannerStorageProvider?: 'r2' | 'local';
  benefits?: string[];
  treatmentProcess?: string[];
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
  banner: UploadedFile | null;
  isActive: boolean;
  order: number;
  benefits: string[];
  treatmentProcess: string[];
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const defaultForm: ServiceForm = {
  name: '',
  slug: '',
  category: 'General',
  shortDescription: '',
  longDescription: '',
  duration: '30 mins',
  priceFrom: 0,
  priceTo: undefined,
  banner: null,
  isActive: true,
  order: 0,
  benefits: [],
  treatmentProcess: [],
};

export default function ServicesAdminPage() {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await servicesApi.getAll();
      setData(r.data?.data ?? r.data ?? []);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    await adminServicesApi.remove(deletingId);
    setDeletingId(null);
    await fetchData();
  };

  return (
    <>
      <PageHeader
        title="Services"
        subtitle="Treatments, packages, and pricing shown on the public services page."
        actions={<AddButton label="Add Service" onClick={() => { setEditing(null); setShowForm(true); }} />}
      />

      <div className={styles.adminCard}>
        <div style={{ padding: 'var(--space-6)' }}>
          <AsyncBoundary
            loading={loading}
            error={error || null}
            empty={data.length === 0}
            emptyTitle="No services yet"
            emptyDescription="Add your first service to display on the public site."
            emptyIcon="ri-stethoscope-line"
            emptyAction={<AddButton label="Add Service" onClick={() => { setEditing(null); setShowForm(true); }} />}
          >
            <div className={styles.cardGrid}>
              {data.map((s) => (
                <article key={s._id} className={styles.serviceCard}>
                  <div style={{ position: 'relative', height: 140, background: 'var(--color-surface)' }}>
                    {s.bannerImage ? (
                      <Image
                        src={s.bannerImage}
                        alt={s.name}
                        fill
                        sizes="(max-width: 600px) 100vw, 320px"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                        <i className="ri-image-line" style={{ fontSize: 28 }} />
                      </div>
                    )}
                  </div>
                  <div className={styles.serviceCardBody}>
                    <div className={styles.serviceCardName}>{s.name}</div>
                    <div className={styles.serviceCardMeta}>{s.category} · {s.duration}</div>
                    <div className={styles.serviceCardMeta}>From {formatCurrency(s.price?.from ?? 0)}</div>
                    <div style={{ alignSelf: 'flex-start' }}>
                      <StatusBadge label={s.isActive ? 'Active' : 'Inactive'} tone={s.isActive ? 'success' : 'neutral'} />
                    </div>
                  </div>
                  <div className={styles.serviceCardActions} style={{ justifyContent: 'flex-end' }}>
                    <ActionMenu
                      onView={() => window.open(`/services/${s.slug}`, '_blank')}
                      onEdit={() => { setEditing(s); setShowForm(true); }}
                      onDelete={() => setDeletingId(s._id)}
                    />
                  </div>
                </article>
              ))}
            </div>
          </AsyncBoundary>
        </div>
      </div>

      <ServiceFormModal
        open={showForm}
        initial={editing}
        onClose={() => setShowForm(false)}
        onSaved={() => { setShowForm(false); void fetchData(); }}
      />

      <ConfirmDialog
        open={!!deletingId}
        title="Deactivate this service?"
        message="The service will be hidden from the public website. You can re-enable it from the edit form."
        confirmLabel="Deactivate"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </>
  );
}

function ServiceFormModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: Service | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit, control, watch, setValue, reset, formState: { isSubmitting } } = useForm<ServiceForm>({
    defaultValues: defaultForm,
  });
  const name = watch('name');
  const slug = watch('slug');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initial) {
      reset({
        name: initial.name,
        slug: initial.slug,
        category: initial.category,
        shortDescription: initial.shortDescription,
        longDescription: initial.longDescription ?? '',
        duration: initial.duration,
        priceFrom: initial.price.from,
        priceTo: initial.price.to,
        banner: initial.bannerImage
          ? {
              url: initial.bannerImage,
              key: initial.bannerStorageKey ?? '',
              storage: initial.bannerStorageProvider ?? 'r2',
              mimetype: 'image/jpeg',
              size: 0,
              originalName: initial.name,
            }
          : null,
        isActive: initial.isActive,
        order: initial.order ?? 0,
        benefits: initial.benefits ?? [],
        treatmentProcess: initial.treatmentProcess ?? [],
      });
    } else {
      reset(defaultForm);
    }
    setErr('');
  }, [open, initial, reset]);

  useEffect(() => {
    if (!initial && name && !slug) setValue('slug', slugify(name));
  }, [name, slug, initial, setValue]);

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
      bannerImage: f.banner?.url ?? '',
      bannerStorageKey: f.banner?.key,
      bannerStorageProvider: f.banner?.storage,
      images: [],
      treatmentProcess: f.treatmentProcess,
      benefits: f.benefits,
      faqs: [],
      seo: { metaTitle: f.name, metaDescription: f.shortDescription, keywords: [] },
      isActive: f.isActive,
      order: Number(f.order),
    };
    try {
      if (initial) await adminServicesApi.update(initial._id, payload);
      else await adminServicesApi.create(payload);
      onSaved();
    } catch (e: unknown) {
      setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to save');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Service' : 'Add Service'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
          <button
            type="submit"
            form="service-form"
            disabled={isSubmitting}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            {isSubmitting ? 'Saving…' : initial ? 'Update' : 'Create'}
          </button>
        </>
      }
    >
      <form id="service-form" onSubmit={handleSubmit(onSubmit)}>
        {err && (
          <div className={styles.errorBox}>
            <i className="ri-error-warning-line" /> {err}
          </div>
        )}

        <Controller
          control={control}
          name="banner"
          render={({ field }) => (
            <FileUpload
              module="services"
              value={field.value}
              onChange={field.onChange}
              label="Banner image"
              hint="16:9 recommended (1600×900). PNG/JPG/WebP up to 5MB."
            />
          )}
        />

        <div className={styles.formGrid} style={{ marginTop: 'var(--space-4)' }}>
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
            <label className="form-label">Price From (₹) *</label>
            <input type="number" min={0} className="form-input" {...register('priceFrom', { required: true, valueAsNumber: true })} />
          </div>
          <div className="form-group">
            <label className="form-label">Price To (₹)</label>
            <input type="number" min={0} className="form-input" {...register('priceTo', { valueAsNumber: true })} />
          </div>
          <div className="form-group full">
            <label className="form-label">Short description *</label>
            <textarea rows={2} className="form-input" {...register('shortDescription', { required: true })} />
          </div>
          <div className="form-group full">
            <label className="form-label">Long description</label>
            <textarea rows={4} className="form-input" {...register('longDescription')} />
          </div>
          <div className="form-group full">
            <label className="form-label">Benefits</label>
            <Controller
              control={control}
              name="benefits"
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} placeholder="Add a benefit & press Enter" />}
            />
          </div>
          <div className="form-group full">
            <label className="form-label">Treatment process steps</label>
            <Controller
              control={control}
              name="treatmentProcess"
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} placeholder="Add a step & press Enter" />}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Display order</label>
            <input type="number" className="form-input" {...register('order', { valueAsNumber: true })} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, paddingTop: 8 }}>
              <input type="checkbox" {...register('isActive')} />
              <span>Show on website</span>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}
