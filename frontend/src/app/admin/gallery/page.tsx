'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useGalleryStore, type UploadedFile, galleryApi } from '@/store';
import { formatDate } from '@sai-physio/utils';
import {
  PageHeader,
  AddButton,
  ActionMenu,
  Modal,
  ConfirmDialog,
  FileUpload,
  AsyncBoundary,
  StatusBadge,
  DataTable,
  type Column,
  ThumbnailCell,
  TablePagination,
  usePagination,
  ResourceDetailModal,
  FilterToolbar,
  useTableQuery,
  applyTableQuery,
} from '@/components/admin';
import adminStyles from '../admin.module.css';
import { notifyWarning } from '@/lib/toast';

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

  const pager = usePagination(
    filtered,
    `${q.debouncedSearch}|${q.filters.category ?? ''}|${q.filters.isPublished ?? ''}|${q.sortBy}|${q.sortOrder}`,
  );

  const columns: Column<GalleryItem>[] = [
    {
      key: 'title',
      header: 'Title',
      sortKey: 'title',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <ThumbnailCell src={item.image?.url} alt={item.alt || item.title} variant="square" size="md" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600 }}>{item.title}</div>
            {item.caption && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.caption}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortKey: 'category',
      render: (item) => (
        <span style={{ textTransform: 'capitalize', fontSize: 'var(--text-sm)' }}>{item.category}</span>
      ),
    },
    {
      key: 'order',
      header: 'Order',
      sortKey: 'order',
      align: 'center',
      width: 80,
      render: (item) => <span>{item.order ?? 0}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge
          label={item.isPublished ? 'Published' : 'Draft'}
          tone={item.isPublished ? 'success' : 'neutral'}
        />
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortKey: 'createdAt',
      render: (item) => (
        <span style={{ fontSize: 'var(--text-sm)' }}>{item.createdAt ? formatDate(item.createdAt) : '—'}</span>
      ),
    },
  ];

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
          <DataTable
            rows={pager.paginated}
            columns={columns}
            rowKey={(item) => item._id}
            sortBy={q.sortBy}
            sortOrder={q.sortOrder}
            onSort={q.toggleSort}
            renderActions={(item) => (
              <ActionMenu
                onView={() => setViewingId(item._id)}
                onEdit={() => openEdit(item)}
                onDelete={() => setDeletingId(item._id)}
              />
            )}
          />
          <TablePagination
            page={pager.page}
            pageSize={pager.pageSize}
            total={pager.total}
            onPageChange={pager.setPage}
            onPageSizeChange={pager.setPageSize}
          />
        </AsyncBoundary>
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
  }, [open, item, reset]);

  const onSubmit = async (form: GalleryForm) => {
    if (!form.image) {
      notifyWarning('Please upload an image before saving.');
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
    // Backend's "Gallery item created/updated" + any failure surface via
    // the global axios toast interceptor.
    const result = isEdit && item
      ? await updateItem(item._id, payload as never)
      : await createItem(payload as never);
    if (result) onSaved();
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
