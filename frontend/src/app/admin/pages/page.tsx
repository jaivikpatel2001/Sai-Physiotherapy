'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { usePagesStore, pagesApi } from '@/store';
import { formatDate } from '@sai-physio/utils';
import {
  PageHeader,
  AddButton,
  ActionMenu,
  Modal,
  ConfirmDialog,
  AsyncBoundary,
  StatusBadge,
  DataTable,
  type Column,
  TagInput,
  ResourceDetailModal,
  FilterToolbar,
  useTableQuery,
  applyTableQuery,
} from '@/components/admin';
import adminStyles from '../admin.module.css';

interface CmsPage {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  showInFooter: boolean;
  footerLabel?: string;
  footerOrder: number;
  isPublished: boolean;
  publishedAt?: string;
  seo: { metaTitle?: string; metaDescription?: string; keywords?: string[] };
  updatedAt: string;
}

interface PageForm {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  showInFooter: boolean;
  footerLabel?: string;
  footerOrder: number;
  isPublished: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const defaultForm: PageForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  showInFooter: false,
  footerLabel: '',
  footerOrder: 0,
  isPublished: false,
  metaTitle: '',
  metaDescription: '',
  keywords: [],
};

export default function PagesAdminPage() {
  const pages = usePagesStore((s) => s.items) as unknown as CmsPage[];
  const loading = usePagesStore((s) => s.status === 'loading');
  const error = usePagesStore((s) => s.error?.message ?? '');
  const fetchList = usePagesStore((s) => s.fetchList);
  const removePage = usePagesStore((s) => s.remove);

  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const q = useTableQuery({
    initialSortBy: 'updated',
    initialSortOrder: 'desc',
    initialFilters: { isPublished: '', showInFooter: '' },
  });

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const handleDelete = async () => {
    if (!deletingId) return;
    await removePage(deletingId);
    setDeletingId(null);
  };

  const filtered = useMemo(() => applyTableQuery({
    rows: pages,
    search: q.debouncedSearch,
    searchFields: (p) => `${p.title} ${p.slug} ${p.excerpt ?? ''} ${p.footerLabel ?? ''}`,
    filters: q.filters,
    filterAccessors: {
      isPublished: (p) => String(p.isPublished),
      showInFooter: (p) => String(p.showInFooter),
    },
    sortBy: q.sortBy,
    sortOrder: q.sortOrder,
    sortAccessors: {
      updated: (p) => p.updatedAt ? new Date(p.updatedAt) : undefined,
      title: (p) => p.title,
      footer: (p) => p.footerOrder ?? 0,
    },
  }), [pages, q.debouncedSearch, q.filters, q.sortBy, q.sortOrder]);

  const columns: Column<CmsPage>[] = [
    {
      key: 'title',
      header: 'Title',
      sortKey: 'title',
      render: (p) => (
        <div>
          <div style={{ fontWeight: 600 }}>{p.title}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>/{p.slug}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <StatusBadge label={p.isPublished ? 'Published' : 'Draft'} tone={p.isPublished ? 'success' : 'neutral'} />
      ),
    },
    {
      key: 'footer',
      header: 'In footer',
      sortKey: 'footer',
      render: (p) =>
        p.showInFooter ? (
          <StatusBadge label={p.footerLabel || `Order ${p.footerOrder}`} tone="primary" icon="ri-link" />
        ) : (
          <span style={{ color: 'var(--color-text-muted)' }}>—</span>
        ),
    },
    {
      key: 'updated',
      header: 'Last edited',
      sortKey: 'updated',
      render: (p) => <span style={{ fontSize: 'var(--text-sm)' }}>{formatDate(p.updatedAt)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="CMS Pages"
        subtitle="Create admin-authored pages like Privacy Policy and Terms — pages marked “show in footer” appear in the site footer automatically."
        actions={<AddButton label="Add Page" onClick={() => { setEditing(null); setShowModal(true); }} />}
      />

      <div className={adminStyles.adminCard}>
        <FilterToolbar
          search={q.search}
          onSearchChange={q.setSearch}
          searchPlaceholder="Search title, slug, or excerpt…"
          filters={[
            {
              type: 'select', key: 'isPublished', label: 'Status', icon: 'ri-flag-line',
              options: [
                { value: 'true', label: 'Published' },
                { value: 'false', label: 'Draft' },
              ],
            },
            {
              type: 'select', key: 'showInFooter', label: 'Footer', icon: 'ri-link',
              options: [
                { value: 'true', label: 'In footer' },
                { value: 'false', label: 'Hidden' },
              ],
            },
          ]}
          filterValues={q.filters}
          onFilterChange={q.setFilter}
          sort={{
            options: [
              { value: 'updated', label: 'Last edited' },
              { value: 'title', label: 'Title' },
              { value: 'footer', label: 'Footer order' },
            ],
          }}
          sortBy={q.sortBy}
          sortOrder={q.sortOrder}
          onSortChange={(by, order) => q.setSort(by, order)}
          onReset={q.resetAll}
          hasActive={q.hasActive}
          totalCount={pages.length}
          filteredCount={filtered.length}
        />

        <AsyncBoundary
          loading={loading}
          error={error || null}
          empty={filtered.length === 0}
          emptyTitle={q.hasActive ? 'No pages match your filters' : 'No CMS pages yet'}
          emptyDescription={q.hasActive ? 'Try clearing one or more filters.' : 'Add a page (e.g. Privacy Policy, Terms & Conditions). Marked-for-footer pages appear automatically.'}
          emptyIcon="ri-pages-line"
          emptyAction={q.hasActive
            ? <button type="button" onClick={q.resetAll} className={`${adminStyles.btn} ${adminStyles.btnSecondary}`}><i className="ri-refresh-line" /> Reset filters</button>
            : <AddButton label="Add Page" onClick={() => { setEditing(null); setShowModal(true); }} />}
        >
          <DataTable
            rows={filtered}
            columns={columns}
            rowKey={(p) => p._id}
            sortBy={q.sortBy}
            sortOrder={q.sortOrder}
            onSort={q.toggleSort}
            renderActions={(p) => (
              <ActionMenu
                onView={() => setViewingId(p._id)}
                onEdit={() => { setEditing(p); setShowModal(true); }}
                onDelete={() => setDeletingId(p._id)}
              />
            )}
          />
        </AsyncBoundary>
      </div>

      <PageFormModal
        open={showModal}
        page={editing}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); void fetchList(undefined, { force: true }); }}
      />

      <ConfirmDialog
        open={!!deletingId}
        title="Delete this page?"
        message="This permanently removes the page from the public site and any footer links."
        confirmLabel="Delete page"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      <ResourceDetailModal
        open={!!viewingId}
        id={viewingId}
        onClose={() => setViewingId(null)}
        fetcher={pagesApi.getOne}
      />
    </>
  );
}

function PageFormModal({
  open,
  page,
  onClose,
  onSaved,
}: {
  open: boolean;
  page: CmsPage | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!page;
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PageForm>({ defaultValues: defaultForm });
  const [err, setErr] = useState('');
  const titleVal = watch('title');
  const slugVal = watch('slug');
  const createPage = usePagesStore((s) => s.create);
  const updatePage = usePagesStore((s) => s.update);

  useEffect(() => {
    if (!open) return;
    if (page) {
      reset({
        title: page.title,
        slug: page.slug,
        excerpt: page.excerpt ?? '',
        content: page.content,
        showInFooter: page.showInFooter,
        footerLabel: page.footerLabel ?? '',
        footerOrder: page.footerOrder ?? 0,
        isPublished: page.isPublished,
        metaTitle: page.seo?.metaTitle ?? '',
        metaDescription: page.seo?.metaDescription ?? '',
        keywords: page.seo?.keywords ?? [],
      });
    } else {
      reset(defaultForm);
    }
    setErr('');
  }, [open, page, reset]);

  useEffect(() => {
    if (!isEdit && titleVal && !slugVal) setValue('slug', slugify(titleVal));
  }, [titleVal, slugVal, isEdit, setValue]);

  const onSubmit = async (form: PageForm) => {
    setErr('');
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      showInFooter: form.showInFooter,
      footerLabel: form.footerLabel,
      footerOrder: Number(form.footerOrder) || 0,
      isPublished: form.isPublished,
      seo: {
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        keywords: form.keywords,
      },
    };
    const result = isEdit && page
      ? await updatePage(page._id, payload as never)
      : await createPage(payload as never);
    if (result) onSaved();
    else setErr('Failed to save');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Page' : 'Add Page'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className={`${adminStyles.btn} ${adminStyles.btnSecondary}`}>
            Cancel
          </button>
          <button
            type="submit"
            form="page-form"
            disabled={isSubmitting}
            className={`${adminStyles.btn} ${adminStyles.btnPrimary}`}
          >
            {isSubmitting ? 'Saving…' : isEdit ? 'Update Page' : 'Create Page'}
          </button>
        </>
      }
    >
      <form id="page-form" onSubmit={handleSubmit(onSubmit)}>
        {err && (
          <div className={adminStyles.errorBox}>
            <i className="ri-error-warning-line" /> {err}
          </div>
        )}

        <div className={adminStyles.formGrid}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" {...register('title', { required: true })} />
            {errors.title && <div className="form-error">Required</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Slug *</label>
            <input className="form-input" placeholder="privacy-policy" {...register('slug', { required: true })} />
          </div>

          <div className="form-group full">
            <label className="form-label">Excerpt</label>
            <textarea
              rows={2}
              className="form-input"
              placeholder="Short summary shown in listings & SEO previews."
              {...register('excerpt')}
            />
          </div>

          <div className="form-group full">
            <label className="form-label">Content (HTML or rich text) *</label>
            <textarea
              rows={12}
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}
              placeholder="<h2>Privacy Policy</h2>&#10;<p>…</p>"
              {...register('content', { required: true })}
            />
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
              HTML is rendered as-is on the public page. Use semantic headings (h2/h3) for SEO.
            </div>
          </div>

          <div className="form-group full">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              Footer placement
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" {...register('showInFooter')} />
              <span>Show this page in the site footer</span>
            </label>
          </div>
          <div className="form-group">
            <label className="form-label">Footer order</label>
            <input type="number" className="form-input" {...register('footerOrder', { valueAsNumber: true })} />
          </div>
          <div className="form-group full">
            <label className="form-label">Footer label (defaults to title)</label>
            <input className="form-input" {...register('footerLabel')} />
          </div>

          <div className="form-group full">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              SEO
            </div>
          </div>

          <div className="form-group full">
            <label className="form-label">Meta title</label>
            <input className="form-input" {...register('metaTitle')} />
          </div>
          <div className="form-group full">
            <label className="form-label">Meta description</label>
            <textarea rows={2} className="form-input" {...register('metaDescription')} />
          </div>
          <div className="form-group full">
            <label className="form-label">Keywords</label>
            <Controller
              control={control}
              name="keywords"
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
            />
          </div>

          <div className="form-group full">
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" {...register('isPublished')} />
              <span style={{ fontWeight: 600 }}>Publish (page is live on the public site)</span>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}
