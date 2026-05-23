'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Image from 'next/image';
import { useGalleryStore, type UploadedFile, galleryApi } from '@/store';
import {
  PageHeader,
  AddButton,
  ActionMenu,
  Modal,
  ConfirmDialog,
  FileUpload,
  AsyncBoundary,
  StatusBadge,
  ResourceDetailModal,
  FilterToolbar,
  useTableQuery,
  applyTableQuery,
} from '@/components/admin';
import adminStyles from '../admin.module.css';

interface GalleryItem {
  _id: string;
  title: string;
  caption?: string;
  category: 'clinic' | 'treatments' | 'events' | 'awards' | 'team';
  image: { url: string; storageKey: string; storageProvider: 'r2' | 'local' };
  alt: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
}

interface GalleryForm {
  title: string;
  caption?: string;
  category: GalleryItem['category'];
  alt: string;
  order: number;
  isPublished: boolean;
  image: UploadedFile | null;
}

const CATEGORIES: Array<{ value: GalleryItem['category']; label: string }> = [
  { value: 'clinic', label: 'Clinic' },
  { value: 'treatments', label: 'Treatments' },
  { value: 'events', label: 'Events' },
  { value: 'awards', label: 'Awards' },
  { value: 'team', label: 'Team' },
];

export default function GalleryAdminPage() {
  const items = useGalleryStore((s) => s.items) as unknown as GalleryItem[];
  const loading = useGalleryStore((s) => s.status === 'loading');
  const error = useGalleryStore((s) => s.error?.message ?? '');
  const fetchList = useGalleryStore((s) => s.fetchList);
  const removeItem = useGalleryStore((s) => s.remove);

  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const q = useTableQuery({
    initialSortBy: 'order',
    initialSortOrder: 'asc',
    initialFilters: { category: '', isPublished: '' },
  });

  useEffect(() => {
    void fetchList(q.filters.category ? { category: q.filters.category } : {}, { force: true });
  }, [q.filters.category, fetchList]);

  const handleDelete = async () => {
    if (!deletingId) return;
    await removeItem(deletingId);
    setDeletingId(null);
  };

  const openNew = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setShowModal(true);
  };

  const filtered = useMemo(() => applyTableQuery({
    rows: items,
    search: q.debouncedSearch,
    searchFields: (i) => `${i.title} ${i.caption ?? ''} ${i.alt} ${i.category}`,
    filters: { isPublished: q.filters.isPublished ?? '' },
    filterAccessors: { isPublished: (i) => String(i.isPublished) },
    sortBy: q.sortBy,
    sortOrder: q.sortOrder,
    sortAccessors: {
      order: (i) => i.order ?? 0,
      title: (i) => i.title,
      createdAt: (i) => i.createdAt ? new Date(i.createdAt) : undefined,
      category: (i) => i.category,
    },
  }), [items, q.debouncedSearch, q.filters.isPublished, q.sortBy, q.sortOrder]);

  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle="Photos shown on the public gallery page, grouped by category."
        actions={<AddButton label="Add Image" onClick={openNew} />}
      />

      <div className={adminStyles.adminCard}>
        <FilterToolbar
          search={q.search}
          onSearchChange={q.setSearch}
          searchPlaceholder="Search title, caption, or alt text…"
          filters={[
            { type: 'select', key: 'category', label: 'Category', icon: 'ri-price-tag-3-line', options: CATEGORIES },
            {
              type: 'select', key: 'isPublished', label: 'Visibility', icon: 'ri-eye-line',
              options: [
                { value: 'true', label: 'Published' },
                { value: 'false', label: 'Draft' },
              ],
            },
          ]}
          filterValues={q.filters}
          onFilterChange={q.setFilter}
          sort={{
            options: [
              { value: 'order', label: 'Display order' },
              { value: 'title', label: 'Title' },
              { value: 'createdAt', label: 'Date added' },
              { value: 'category', label: 'Category' },
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
            emptyTitle={q.hasActive ? 'No images match your filters' : 'No images yet'}
            emptyDescription={q.hasActive ? 'Try clearing one or more filters.' : 'Add your first gallery image to start curating what visitors see.'}
            emptyIcon="ri-image-2-line"
            emptyAction={q.hasActive
              ? <button type="button" onClick={q.resetAll} className={`${adminStyles.btn} ${adminStyles.btnSecondary}`}><i className="ri-refresh-line" /> Reset filters</button>
              : <AddButton label="Add Image" onClick={openNew} />}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              {filtered.map((item) => (
                <article
                  key={item._id}
                  style={{
                    background: 'white',
                    border: '1px solid var(--color-hairline)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-card)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ position: 'relative', aspectRatio: '4/3', background: 'var(--color-surface)' }}>
                    <Image
                      src={item.image.url}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 600px) 50vw, 220px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </div>
                      <StatusBadge
                        label={item.isPublished ? 'Published' : 'Draft'}
                        tone={item.isPublished ? 'success' : 'neutral'}
                      />
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                      {item.category} · order {item.order}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      borderTop: '1px solid var(--color-hairline-soft)',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <ActionMenu
                      onView={() => setViewingId(item._id)}
                      onEdit={() => openEdit(item)}
                      onDelete={() => setDeletingId(item._id)}
                    />
                  </div>
                </article>
              ))}
            </div>
          </AsyncBoundary>
        </div>
      </div>

      <GalleryFormModal
        open={showModal}
        item={editing}
        onClose={() => setShowModal(false)}
        onSaved={() => {
          setShowModal(false);
          void fetchList(undefined, { force: true });
        }}
      />

      <ConfirmDialog
        open={!!deletingId}
        title="Delete this image?"
        message="The image will be removed from the public gallery and deleted from storage."
        confirmLabel="Delete image"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      <ResourceDetailModal
        open={!!viewingId}
        id={viewingId}
        onClose={() => setViewingId(null)}
        fetcher={galleryApi.getOne}
      />
    </>
  );
}

function GalleryFormModal({
  open,
  item,
  onClose,
  onSaved,
}: {
  open: boolean;
  item: GalleryItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!item;
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GalleryForm>({
    defaultValues: {
      title: '',
      caption: '',
      category: 'clinic',
      alt: '',
      order: 0,
      isPublished: true,
      image: null,
    },
  });
  const [err, setErr] = useState('');
  const createItem = useGalleryStore((s) => s.create);
  const updateItem = useGalleryStore((s) => s.update);

  useEffect(() => {
    if (!open) return;
    if (item) {
      reset({
        title: item.title,
        caption: item.caption ?? '',
        category: item.category,
        alt: item.alt,
        order: item.order,
        isPublished: item.isPublished,
        image: {
          url: item.image.url,
          key: item.image.storageKey,
          storage: item.image.storageProvider,
          mimetype: 'image/jpeg',
          size: 0,
          originalName: item.title,
        },
      });
    } else {
      reset({
        title: '',
        caption: '',
        category: 'clinic',
        alt: '',
        order: 0,
        isPublished: true,
        image: null,
      });
    }
    setErr('');
  }, [open, item, reset]);

  const onSubmit = async (form: GalleryForm) => {
    setErr('');
    if (!form.image) {
      setErr('Please upload an image before saving.');
      return;
    }
    const payload = {
      title: form.title,
      caption: form.caption,
      category: form.category,
      alt: form.alt,
      order: Number(form.order) || 0,
      isPublished: form.isPublished,
      image: {
        url: form.image.url,
        storageKey: form.image.key,
        storageProvider: form.image.storage,
        mimetype: form.image.mimetype,
      },
    };
    const result = isEdit && item
      ? await updateItem(item._id, payload as never)
      : await createItem(payload as never);
    if (result) onSaved();
    else setErr('Failed to save');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Gallery Image' : 'Add Gallery Image'}
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className={`${adminStyles.btn} ${adminStyles.btnSecondary}`}>
            Cancel
          </button>
          <button
            type="submit"
            form="gallery-form"
            disabled={isSubmitting}
            className={`${adminStyles.btn} ${adminStyles.btnPrimary}`}
          >
            {isSubmitting ? 'Saving…' : isEdit ? 'Update' : 'Create'}
          </button>
        </>
      }
    >
      <form id="gallery-form" onSubmit={handleSubmit(onSubmit)}>
        {err && (
          <div className={adminStyles.errorBox}>
            <i className="ri-error-warning-line" /> {err}
          </div>
        )}

        <Controller
          control={control}
          name="image"
          rules={{ required: 'Image required' }}
          render={({ field }) => (
            <FileUpload module="gallery" value={field.value} onChange={field.onChange} required />
          )}
        />

        <div className={adminStyles.formGrid} style={{ marginTop: 'var(--space-4)' }}>
          <div className="form-group full">
            <label className="form-label">Title *</label>
            <input className="form-input" {...register('title', { required: true })} />
            {errors.title && <div className="form-error">Required</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-input" {...register('category', { required: true })}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Display order</label>
            <input type="number" className="form-input" {...register('order', { valueAsNumber: true })} />
          </div>

          <div className="form-group full">
            <label className="form-label">Alt text *</label>
            <input
              className="form-input"
              placeholder="Describe the image for accessibility / SEO"
              {...register('alt', { required: true })}
            />
            {errors.alt && <div className="form-error">Required for accessibility</div>}
          </div>

          <div className="form-group full">
            <label className="form-label">Caption</label>
            <textarea rows={2} className="form-input" {...register('caption')} />
          </div>

          <div className="form-group full">
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" {...register('isPublished')} />
              <span className="form-label" style={{ margin: 0 }}>Publish on public gallery</span>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}
