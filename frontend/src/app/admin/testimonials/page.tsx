'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTestimonialsStore, testimonialsApi } from '@/store';
import { formatDate } from '@sai-physio/utils';
import {
  PageHeader,
  AddButton,
  ActionMenu,
  Modal,
  ConfirmDialog,
  StatusBadge,
  ResourceDetailModal,
  FilterToolbar,
  useTableQuery,
  applyTableQuery,
  DataTable,
  type Column,
} from '@/components/admin';
import styles from '../admin.module.css';

interface Testimonial {
  _id: string;
  patientName: string;
  patientAge?: number;
  condition: string;
  rating: number;
  review: string;
  videoUrl?: string;
  isApproved: boolean;
  isFeatured: boolean;
  source: 'manual' | 'google' | 'website_form';
  createdAt: string;
}

interface TestimonialForm {
  patientName: string;
  patientAge?: number;
  condition: string;
  rating: number;
  review: string;
  videoUrl?: string;
  isApproved: boolean;
  isFeatured: boolean;
}

const defaultForm: TestimonialForm = {
  patientName: '',
  condition: '',
  rating: 5,
  review: '',
  videoUrl: '',
  isApproved: true,
  isFeatured: false,
};

const SOURCE_LABEL: Record<Testimonial['source'], string> = {
  manual: 'Manual',
  website_form: 'Website form',
  google: 'Google',
};

const SOURCE_ICON: Record<Testimonial['source'], string> = {
  manual: 'ri-user-add-line',
  website_form: 'ri-quill-pen-line',
  google: 'ri-google-fill',
};

const initials = (name: string) => name
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase() || '?';

function Stars({ rating }: { rating: number }) {
  return (
    <div className={styles.stars} aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <i
          key={i}
          className={i < rating ? 'ri-star-fill' : 'ri-star-line'}
          style={{ fontSize: 14, color: i < rating ? 'var(--color-accent-cta)' : 'var(--color-border)' }}
        />
      ))}
      <span style={{ marginLeft: 6, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{rating}/5</span>
    </div>
  );
}

export default function TestimonialsPage() {
  const items = useTestimonialsStore((s) => s.items) as unknown as Testimonial[];
  const loading = useTestimonialsStore((s) => s.status === 'loading');
  const fetchList = useTestimonialsStore((s) => s.fetchList);
  const moderateItem = useTestimonialsStore((s) => s.moderate);
  const removeItem = useTestimonialsStore((s) => s.remove);

  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const q = useTableQuery({
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
    initialFilters: { isApproved: '', isFeatured: '', source: '', rating: '' },
  });

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const filtered = useMemo(() => applyTableQuery({
    rows: items,
    search: q.debouncedSearch,
    searchFields: (t) => `${t.patientName ?? ''} ${t.condition ?? ''} ${t.review ?? ''}`,
    filters: q.filters,
    filterAccessors: {
      isApproved: (t) => String(t.isApproved),
      isFeatured: (t) => String(t.isFeatured),
      source: (t) => t.source,
      rating: (t) => String(t.rating),
    },
    sortBy: q.sortBy,
    sortOrder: q.sortOrder,
    sortAccessors: {
      createdAt: (t) => new Date(t.createdAt),
      rating: (t) => t.rating,
      patientName: (t) => t.patientName,
    },
  }), [items, q.debouncedSearch, q.filters, q.sortBy, q.sortOrder]);

  // Backend's dynamic message ("Testimonial updated", "Testimonial deleted", …)
  // is shown via the global axios toast interceptor — no local state needed.
  const moderate = async (id: string, isApproved: boolean) => {
    await moderateItem(id, { isApproved });
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await moderateItem(id, { isApproved: true, isFeatured: !current });
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    const ok = await removeItem(deleting._id);
    setDeleteBusy(false);
    if (ok) setDeleting(null);
  };

  const columns: Column<Testimonial>[] = [
    {
      key: 'patient',
      header: 'Patient',
      sortKey: 'patientName',
      render: (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div className={styles.userAvatar} aria-hidden>{initials(t.patientName)}</div>
          <div className={styles.listMain}>
            <div className={styles.listTitle} style={{ fontWeight: 600 }}>
              {t.patientName}{t.patientAge ? `, ${t.patientAge}` : ''}
            </div>
            <div className={styles.listSubtitle} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {t.condition || '—'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      sortKey: 'rating',
      render: (t) => <Stars rating={t.rating} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
          <StatusBadge label={t.isApproved ? 'Approved' : 'Pending'} tone={t.isApproved ? 'success' : 'warning'} />
          {t.isFeatured && <StatusBadge label="Featured" tone="primary" icon="ri-star-fill" />}
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (t) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          <i className={SOURCE_ICON[t.source]} style={{ fontSize: 14 }} />
          {SOURCE_LABEL[t.source]}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortKey: 'createdAt',
      render: (t) => (
        <span style={{ fontSize: 'var(--text-sm)' }}>{formatDate(t.createdAt)}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Testimonials"
        subtitle="Approve, feature, or add patient testimonials."
        actions={<AddButton label="Add Testimonial" onClick={() => { setEditing(null); setShowModal(true); }} />}
      />

      <div className={styles.adminCard}>
        <FilterToolbar
          search={q.search}
          onSearchChange={q.setSearch}
          searchPlaceholder="Search patient name, condition, or review…"
          filters={[
            {
              type: 'select', key: 'isApproved', label: 'Status', icon: 'ri-shield-check-line',
              options: [
                { value: 'true', label: 'Approved' },
                { value: 'false', label: 'Pending' },
              ],
            },
            {
              type: 'select', key: 'isFeatured', label: 'Featured', icon: 'ri-star-line',
              options: [
                { value: 'true', label: 'Featured' },
                { value: 'false', label: 'Not featured' },
              ],
            },
            {
              type: 'select', key: 'source', label: 'Source', icon: 'ri-share-line',
              options: [
                { value: 'manual', label: 'Manual' },
                { value: 'website_form', label: 'Website form' },
                { value: 'google', label: 'Google' },
              ],
            },
            {
              type: 'select', key: 'rating', label: 'Rating', icon: 'ri-star-line',
              options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} stars` })),
            },
          ]}
          filterValues={q.filters}
          onFilterChange={q.setFilter}
          sort={{
            options: [
              { value: 'createdAt', label: 'Date submitted' },
              { value: 'rating', label: 'Rating' },
              { value: 'patientName', label: 'Patient name' },
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
          rowKey={(t) => t._id}
          loading={loading}
          sortBy={q.sortBy}
          sortOrder={q.sortOrder}
          onSort={q.toggleSort}
          renderActions={(t) => (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {!t.isApproved ? (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                  onClick={() => void moderate(t._id, true)}
                  title="Approve testimonial"
                >
                  <i className="ri-check-line" style={{ fontSize: 14 }} /> Approve
                </button>
              ) : (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                  onClick={() => void toggleFeatured(t._id, t.isFeatured)}
                  title={t.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                  aria-label={t.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                >
                  <i className={t.isFeatured ? 'ri-star-fill' : 'ri-star-line'} style={{ fontSize: 14, color: t.isFeatured ? 'var(--color-accent-cta)' : 'inherit' }} />
                </button>
              )}
              <ActionMenu
                onView={() => setViewingId(t._id)}
                onEdit={() => { setEditing(t); setShowModal(true); }}
                onDelete={() => setDeleting(t)}
              />
            </div>
          )}
        />

        {!loading && filtered.length === 0 && (
          <div className={styles.empty}>
            <i className={`ri-message-3-line ${styles.emptyIcon}`} style={{ fontSize: 40 }} />
            <span>{q.hasActive ? 'No testimonials match your filters' : 'No testimonials yet'}</span>
            {q.hasActive ? (
              <button type="button" onClick={q.resetAll} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
                <i className="ri-refresh-line" /> Reset filters
              </button>
            ) : (
              <AddButton label="Add Testimonial" onClick={() => { setEditing(null); setShowModal(true); }} />
            )}
          </div>
        )}
      </div>

      <TestimonialFormModal
        open={showModal}
        initial={editing}
        onClose={() => setShowModal(false)}
        onSaved={() => {
          setShowModal(false);
          void fetchList(undefined, { force: true });
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete this testimonial?"
        message={deleting ? `Permanently delete the testimonial from “${deleting.patientName}”? This cannot be undone.` : ''}
        confirmLabel="Delete"
        loading={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => { if (!deleteBusy) setDeleting(null); }}
      />

      <ResourceDetailModal
        open={!!viewingId}
        id={viewingId}
        onClose={() => setViewingId(null)}
        fetcher={testimonialsApi.getOne}
        extraActions={(record) => {
          const t = record as unknown as Testimonial;
          return (
            <>
              <button
                type="button"
                onClick={() => { setViewingId(null); setEditing(t); setShowModal(true); }}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                <i className="ri-pencil-line" style={{ fontSize: 16 }} /> Edit
              </button>
              {!t.isApproved ? (
                <button
                  type="button"
                  onClick={() => { void moderate(t._id, true); setViewingId(null); }}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  <i className="ri-check-line" style={{ fontSize: 16 }} /> Approve
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { void toggleFeatured(t._id, t.isFeatured); setViewingId(null); }}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                >
                  <i className={t.isFeatured ? 'ri-star-fill' : 'ri-star-line'} style={{ fontSize: 16 }} />
                  {t.isFeatured ? 'Unfeature' : 'Feature'}
                </button>
              )}
            </>
          );
        }}
      />
    </>
  );
}

function TestimonialFormModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: Testimonial | null;
  onClose: () => void;
  onSaved: (mode: 'create' | 'edit') => void;
}) {
  const isEdit = !!initial;
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TestimonialForm>({
    defaultValues: defaultForm,
  });
  const createTestimonial = useTestimonialsStore((s) => s.create);
  const updateTestimonial = useTestimonialsStore((s) => s.update);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      reset({
        patientName: initial.patientName,
        patientAge: initial.patientAge,
        condition: initial.condition,
        rating: initial.rating,
        review: initial.review,
        videoUrl: initial.videoUrl ?? '',
        isApproved: initial.isApproved,
        isFeatured: initial.isFeatured,
      });
    } else {
      reset(defaultForm);
    }
  }, [open, initial, reset]);

  const onSubmit = async (form: TestimonialForm) => {
    const payload = {
      ...form,
      rating: Number(form.rating),
      patientAge: form.patientAge ? Number(form.patientAge) : undefined,
    };
    // Success/error toasts come from the backend message via the global interceptor.
    const result = isEdit && initial
      ? await updateTestimonial(initial._id, payload as never)
      : await createTestimonial(payload as never);
    if (result) onSaved(isEdit ? 'edit' : 'create');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Testimonial' : 'Add Testimonial'}
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
          <button
            type="submit"
            form="testimonial-form"
            disabled={isSubmitting}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            {isSubmitting ? 'Saving…' : isEdit ? 'Update' : 'Create'}
          </button>
        </>
      }
    >
      <form id="testimonial-form" onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formGrid}>
          <div className="form-group">
            <label className="form-label">Patient name *</label>
            <input className="form-input" {...register('patientName', { required: true })} />
            {errors.patientName && <div className="form-error">Required</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Age</label>
            <input type="number" min={1} className="form-input" {...register('patientAge', { valueAsNumber: true })} />
          </div>
          <div className="form-group">
            <label className="form-label">Condition / Designation *</label>
            <input className="form-input" placeholder="e.g. Lower back pain · Athlete" {...register('condition', { required: true })} />
            {errors.condition && <div className="form-error">Required</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Rating *</label>
            <select className="form-input" {...register('rating', { valueAsNumber: true })}>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} star{r !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div className="form-group full">
            <label className="form-label">Review *</label>
            <textarea rows={4} className="form-input" {...register('review', { required: true, minLength: 10 })} />
            {errors.review && <div className="form-error">Minimum 10 characters</div>}
          </div>
          <div className="form-group full">
            <label className="form-label">Video URL (optional)</label>
            <input className="form-input" placeholder="https://youtube.com/…" {...register('videoUrl')} />
          </div>
          <div className="form-group">
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" {...register('isApproved')} />
              <span>Publish immediately</span>
            </label>
          </div>
          <div className="form-group">
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" {...register('isFeatured')} />
              <span>Feature on home page</span>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}
