'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useServicesStore, type UploadedFile, servicesApi } from '@/store';
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
  DataTable,
  type Column,
  TagInput,
  ResourceDetailModal,
  FilterToolbar,
  ThumbnailCell,
  TablePagination,
  usePagination,
  useTableQuery,
  applyTableQuery,
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
  const data = useServicesStore((s) => s.items) as unknown as Service[];
  const loading = useServicesStore((s) => s.status === 'loading');
  const error = useServicesStore((s) => s.error?.message ?? '');
  const fetchList = useServicesStore((s) => s.fetchList);
  const removeService = useServicesStore((s) => s.remove);

  const [editing, setEditing] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const q = useTableQuery({
    initialSortBy: 'name',
    initialSortOrder: 'asc',
    initialFilters: { category: '', isActive: '' },
  });

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const handleDelete = async () => {
    if (!deletingId) return;
    await removeService(deletingId);
    setDeletingId(null);
  };

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((s) => { if (s.category) set.add(s.category); });
    return Array.from(set).sort().map((c) => ({ value: c, label: c }));
  }, [data]);

  const filtered = useMemo(() => applyTableQuery({
    rows: data,
    search: q.debouncedSearch,
    searchFields: (s) => `${s.name} ${s.category} ${s.shortDescription ?? ''} ${s.duration ?? ''}`,
    filters: q.filters,
    filterAccessors: {
      category: (s) => s.category,
      isActive: (s) => String(s.isActive ?? true),
    },
    sortBy: q.sortBy,
    sortOrder: q.sortOrder,
    sortAccessors: {
      name: (s) => s.name,
      price: (s) => s.price?.from ?? 0,
      category: (s) => s.category,
      order: (s) => s.order ?? 0,
    },
  }), [data, q.debouncedSearch, q.filters, q.sortBy, q.sortOrder]);

  const pager = usePagination(
    filtered,
    `${q.debouncedSearch}|${q.filters.category ?? ''}|${q.filters.isActive ?? ''}|${q.sortBy}|${q.sortOrder}`,
  );

  const columns: Column<Service>[] = [
    {
      key: 'name',
      header: 'Service',
      sortKey: 'name',
      render: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <ThumbnailCell src={s.bannerImage} alt={s.name} variant="square" size="md" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600 }}>{s.name}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              /{s.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortKey: 'category',
      render: (s) => <span style={{ fontSize: 'var(--text-sm)' }}>{s.category}</span>,
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (s) => <span style={{ fontSize: 'var(--text-sm)' }}>{s.duration}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      sortKey: 'price',
      render: (s) => (
        <span style={{ fontWeight: 600 }}>
          From {formatCurrency(s.price?.from ?? 0)}
          {s.price?.to ? <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}> – {formatCurrency(s.price.to)}</span> : null}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => (
        <StatusBadge label={s.isActive ? 'Active' : 'Inactive'} tone={s.isActive ? 'success' : 'neutral'} />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Services"
        subtitle="Treatments, packages, and pricing shown on the public services page."
        actions={<AddButton label="Add Service" onClick={() => { setEditing(null); setShowForm(true); }} />}
      />

      <div className={styles.adminCard}>
        <FilterToolbar
          search={q.search}
          onSearchChange={q.setSearch}
          searchPlaceholder="Search service name, category, or description…"
          filters={[
            { type: 'select', key: 'category', label: 'Category', icon: 'ri-price-tag-3-line', options: categoryOptions },
            {
              type: 'select', key: 'isActive', label: 'Visibility', icon: 'ri-eye-line',
              options: [
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ],
            },
          ]}
          filterValues={q.filters}
          onFilterChange={q.setFilter}
          sort={{
            options: [
              { value: 'name', label: 'Name' },
              { value: 'price', label: 'Starting price' },
              { value: 'category', label: 'Category' },
              { value: 'order', label: 'Display order' },
            ],
          }}
          sortBy={q.sortBy}
          sortOrder={q.sortOrder}
          onSortChange={(by, order) => q.setSort(by, order)}
          onReset={q.resetAll}
          hasActive={q.hasActive}
          totalCount={data.length}
          filteredCount={filtered.length}
        />

        <AsyncBoundary
          loading={loading}
          error={error || null}
          empty={filtered.length === 0}
          emptyTitle={q.hasActive ? 'No services match your filters' : 'No services yet'}
          emptyDescription={q.hasActive ? 'Try clearing one or more filters.' : 'Add your first service to display on the public site.'}
          emptyIcon="ri-stethoscope-line"
          emptyAction={q.hasActive
            ? <button type="button" onClick={q.resetAll} className={`${styles.btn} ${styles.btnSecondary}`}><i className="ri-refresh-line" /> Reset filters</button>
            : <AddButton label="Add Service" onClick={() => { setEditing(null); setShowForm(true); }} />}
        >
          <DataTable
            rows={pager.paginated}
            columns={columns}
            rowKey={(s) => s._id}
            sortBy={q.sortBy}
            sortOrder={q.sortOrder}
            onSort={q.toggleSort}
            renderActions={(s) => (
              <ActionMenu
                onView={() => setViewingId(s._id)}
                onEdit={() => { setEditing(s); setShowForm(true); }}
                onDelete={() => setDeletingId(s._id)}
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

      <ServiceFormModal
        open={showForm}
        initial={editing}
        onClose={() => setShowForm(false)}
        onSaved={() => { setShowForm(false); void fetchList(undefined, { force: true }); }}
      />

      <ConfirmDialog
        open={!!deletingId}
        title="Deactivate this service?"
        message="The service will be hidden from the public website. You can re-enable it from the edit form."
        confirmLabel="Deactivate"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      <ResourceDetailModal
        open={!!viewingId}
        id={viewingId}
        onClose={() => setViewingId(null)}
        fetcher={servicesApi.getOne}
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
  const createService = useServicesStore((s) => s.create);
  const updateService = useServicesStore((s) => s.update);

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
  }, [open, initial, reset]);

  useEffect(() => {
    if (!initial && name && !slug) setValue('slug', slugify(name));
  }, [name, slug, initial, setValue]);

  const onSubmit = async (f: ServiceForm) => {
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
    // Backend's "Service created" / "Service updated" success + any failure
    // surface via the global axios toast interceptor.
    const result = initial
      ? await updateService(initial._id, payload as never)
      : await createService(payload as never);
    if (result) onSaved();
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
