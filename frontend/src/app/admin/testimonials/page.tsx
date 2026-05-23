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
  AsyncBoundary,
  StatusBadge,
  ResourceDetailModal,
  FilterToolbar,
  useTableQuery,
  applyTableQuery,
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

export default function TestimonialsPage() {
  const items = useTestimonialsStore((s) => s.items) as unknown as Testimonial[];
  const loading = useTestimonialsStore((s) => s.status === 'loading');
  const error = useTestimonialsStore((s) => s.error?.message ?? '');
  const fetchList = useTestimonialsStore((s) => s.fetchList);
  const moderateItem = useTestimonialsStore((s) => s.moderate);
  const removeItem = useTestimonialsStore((s) => s.remove);

  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
    searchFields: (t) => `${t.patientName} ${t.condition} ${t.review}`,
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

  const moderate = async (id: string, isApproved: boolean) => {
    await moderateItem(id, { isApproved });
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await moderateItem(id, { isApproved: true, isFeatured: !current });
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await removeItem(deletingId);
    setDeletingId(null);
  };

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

        <div style={{ padding: 'var(--space-6)' }}>
          <AsyncBoundary
            loading={loading}
            error={error || null}
            empty={filtered.length === 0}
            emptyTitle={q.hasActive ? 'No testimonials match your filters' : 'No testimonials'}
            emptyDescription={q.hasActive ? 'Try clearing one or more filters.' : 'Add a testimonial manually or wait for visitors to submit one.'}
            emptyIcon="ri-message-3-line"
            emptyAction={q.hasActive
              ? <button type="button" onClick={q.resetAll} className={`${styles.btn} ${styles.btnSecondary}`}><i className="ri-refresh-line" /> Reset filters</button>
              : <AddButton label="Add Testimonial" onClick={() => { setEditing(null); setShowModal(true); }} />}
          >
            <div className={styles.cardGrid}>
              {filtered.map((t) => (
                <div key={t._id} className={styles.serviceCard}>
                  <div className={styles.serviceCardBody}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div className={styles.serviceCardName}>
                          {t.patientName}
                          {t.patientAge ? `, ${t.patientAge}` : ''}
                        </div>
                        <div className={styles.serviceCardMeta}>{t.condition}</div>
                      </div>
                      <StatusBadge
                        label={t.isApproved ? 'Approved' : 'Pending'}
                        tone={t.isApproved ? 'success' : 'warning'}
                      />
                    </div>
                    <div className={styles.stars}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i
                          key={i}
                          className={i < t.rating ? 'ri-star-fill' : 'ri-star-line'}
                          style={{ fontSize: 14 }}
                        />
                      ))}
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', lineHeight: 'var(--leading-snug)' }}>
                      {t.review}
                    </p>
                    <div className={styles.serviceCardMeta}>
                      {formatDate(t.createdAt)} · {t.source.replace('_', ' ')}
                      {t.isFeatured && (
                        <>
                          {' · '}
                          <span style={{ color: 'var(--color-accent-cta)', fontWeight: 600 }}>Featured</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles.serviceCardActions} style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!t.isApproved ? (
                        <button
                          className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                          onClick={() => moderate(t._id, true)}
                        >
                          <i className="ri-check-line" style={{ fontSize: 14 }} /> Approve
                        </button>
                      ) : (
                        <button
                          className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                          onClick={() => moderate(t._id, false)}
                        >
                          <i className="ri-close-line" style={{ fontSize: 14 }} /> Unapprove
                        </button>
                      )}
                      {t.isApproved && (
                        <button
                          className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                          onClick={() => toggleFeatured(t._id, t.isFeatured)}
                        >
                          <i className={t.isFeatured ? 'ri-star-fill' : 'ri-star-line'} style={{ fontSize: 14 }} />
                        </button>
                      )}
                    </div>
                    <ActionMenu
                      onView={() => setViewingId(t._id)}
                      onEdit={() => { setEditing(t); setShowModal(true); }}
                      onDelete={() => setDeletingId(t._id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </AsyncBoundary>
        </div>
      </div>

      <TestimonialFormModal
        open={showModal}
        initial={editing}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); void fetchList(undefined, { force: true }); }}
      />

      <ConfirmDialog
        open={!!deletingId}
        title="Delete this testimonial?"
        message="This permanently removes the testimonial from the database."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      <ResourceDetailModal
        open={!!viewingId}
        id={viewingId}
        onClose={() => setViewingId(null)}
        fetcher={testimonialsApi.getOne}
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
  onSaved: () => void;
}) {
  const isEdit = !!initial;
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TestimonialForm>({
    defaultValues: defaultForm,
  });
  const [err, setErr] = useState('');
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
    setErr('');
  }, [open, initial, reset]);

  const onSubmit = async (form: TestimonialForm) => {
    setErr('');
    const payload = {
      ...form,
      rating: Number(form.rating),
      patientAge: form.patientAge ? Number(form.patientAge) : undefined,
    };
    const result = isEdit && initial
      ? await updateTestimonial(initial._id, payload as never)
      : await createTestimonial(payload as never);
    if (result) onSaved();
    else setErr('Failed to save');
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
        {err && (
          <div className={styles.errorBox}>
            <i className="ri-error-warning-line" /> {err}
          </div>
        )}

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
            <label className="form-label">Condition *</label>
            <input className="form-input" {...register('condition', { required: true })} />
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
