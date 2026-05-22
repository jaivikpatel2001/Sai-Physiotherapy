'use client';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Image from 'next/image';
import { useGalleryStore, type UploadedFile } from '@/store';
import {
  PageHeader,
  AddButton,
  ActionMenu,
  Modal,
  ConfirmDialog,
  FileUpload,
  AsyncBoundary,
  StatusBadge,
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

  const [filter, setFilter] = useState<string>('');
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchList(filter ? { category: filter } : {}, { force: true });
  }, [filter, fetchList]);

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

  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle="Photos shown on the public gallery page, grouped by category."
        actions={<AddButton label="Add Image" onClick={openNew} />}
      />

      <div className={adminStyles.adminCard}>
        <div className={adminStyles.filterBar}>
          <div className={adminStyles.filterField}>
            <span className={adminStyles.filterLabel}>Category</span>
            <select className="form-input" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ padding: 'var(--space-6)' }}>
          <AsyncBoundary
            loading={loading}
            error={error || null}
            empty={items.length === 0}
            emptyTitle="No images yet"
            emptyDescription="Add your first gallery image to start curating what visitors see."
            emptyIcon="ri-image-2-line"
            emptyAction={<AddButton label="Add Image" onClick={openNew} />}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              {items.map((item) => (
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
                      onView={() => window.open(item.image.url, '_blank')}
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
