'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useBlogsStore, type UploadedFile, blogsApi } from '@/store';
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
  TagInput,
  toneFor,
  ResourceDetailModal,
  FilterToolbar,
  useTableQuery,
  applyTableQuery,
} from '@/components/admin';
import adminStyles from '../admin.module.css';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  featuredStorageKey?: string;
  featuredStorageProvider?: 'r2' | 'local';
  author: { _id: string; name?: string } | string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  views: number;
  publishedAt?: string;
  createdAt?: string;
}

interface BlogForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover: UploadedFile | null;
  category: string;
  tags: string[];
  status: BlogPost['status'];
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const defaultForm: BlogForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover: null,
  category: 'Health Tips',
  tags: [],
  status: 'draft',
};

export default function BlogAdminPage() {
  const posts = useBlogsStore((s) => s.items) as unknown as BlogPost[];
  const loading = useBlogsStore((s) => s.status === 'loading');
  const error = useBlogsStore((s) => s.error?.message ?? '');
  const fetchList = useBlogsStore((s) => s.fetchList);
  const removeBlog = useBlogsStore((s) => s.remove);

  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const q = useTableQuery({
    initialSortBy: 'date',
    initialSortOrder: 'desc',
    initialFilters: { status: '', category: '' },
  });

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const handleDelete = async () => {
    if (!deletingId) return;
    await removeBlog(deletingId);
    setDeletingId(null);
  };

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => { if (p.category) set.add(p.category); });
    return Array.from(set).sort().map((c) => ({ value: c, label: c }));
  }, [posts]);

  const filtered = useMemo(() => applyTableQuery({
    rows: posts,
    search: q.debouncedSearch,
    searchFields: (p) => `${p.title} ${p.slug} ${p.excerpt ?? ''} ${typeof p.author === 'object' ? p.author.name ?? '' : ''}`,
    filters: q.filters,
    filterAccessors: {
      status: (p) => p.status,
      category: (p) => p.category ?? '',
    },
    sortBy: q.sortBy,
    sortOrder: q.sortOrder,
    sortAccessors: {
      date: (p) => p.publishedAt ? new Date(p.publishedAt) : (p.createdAt ? new Date(p.createdAt) : undefined),
      title: (p) => p.title,
      views: (p) => p.views ?? 0,
      status: (p) => p.status,
    },
  }), [posts, q.debouncedSearch, q.filters, q.sortBy, q.sortOrder]);

  const columns: Column<BlogPost>[] = [
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
      key: 'author',
      header: 'Author',
      render: (p) => (typeof p.author === 'object' ? p.author.name ?? '—' : '—'),
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      render: (p) => <StatusBadge label={p.status} tone={toneFor(p.status)} />,
    },
    {
      key: 'views',
      header: 'Views',
      sortKey: 'views',
      render: (p) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <i className="ri-eye-line" style={{ fontSize: 14 }} /> {p.views ?? 0}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      sortKey: 'date',
      render: (p) => formatDate(p.publishedAt || p.createdAt || ''),
    },
  ];

  return (
    <>
      <PageHeader
        title="Blog Posts"
        subtitle="Articles published on the public site."
        actions={<AddButton label="Add Blog" onClick={() => { setEditing(null); setShowModal(true); }} />}
      />

      <div className={adminStyles.adminCard}>
        <FilterToolbar
          search={q.search}
          onSearchChange={q.setSearch}
          searchPlaceholder="Search title, slug, excerpt, or author…"
          filters={[
            {
              type: 'select', key: 'status', label: 'Status', icon: 'ri-flag-line',
              options: [
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ],
            },
            { type: 'select', key: 'category', label: 'Category', icon: 'ri-price-tag-3-line', options: categoryOptions },
          ]}
          filterValues={q.filters}
          onFilterChange={q.setFilter}
          sort={{
            options: [
              { value: 'date', label: 'Date' },
              { value: 'title', label: 'Title' },
              { value: 'views', label: 'Views' },
              { value: 'status', label: 'Status' },
            ],
          }}
          sortBy={q.sortBy}
          sortOrder={q.sortOrder}
          onSortChange={(by, order) => q.setSort(by, order)}
          onReset={q.resetAll}
          hasActive={q.hasActive}
          totalCount={posts.length}
          filteredCount={filtered.length}
        />

        <AsyncBoundary
          loading={loading}
          error={error || null}
          empty={filtered.length === 0}
          emptyTitle={q.hasActive ? 'No posts match your filters' : 'No posts yet'}
          emptyDescription={q.hasActive ? 'Try clearing one or more filters.' : 'Create your first article to publish on the public blog.'}
          emptyIcon="ri-file-text-line"
          emptyAction={q.hasActive
            ? <button type="button" onClick={q.resetAll} className={`${adminStyles.btn} ${adminStyles.btnSecondary}`}><i className="ri-refresh-line" /> Reset filters</button>
            : <AddButton label="Add Blog" onClick={() => { setEditing(null); setShowModal(true); }} />}
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

      <BlogFormModal
        open={showModal}
        post={editing}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); void fetchList(undefined, { force: true }); }}
      />

      <ConfirmDialog
        open={!!deletingId}
        title="Archive this post?"
        message="The post will be hidden from the public site (status set to archived)."
        confirmLabel="Archive"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      <ResourceDetailModal
        open={!!viewingId}
        id={viewingId}
        onClose={() => setViewingId(null)}
        fetcher={blogsApi.getOne}
      />
    </>
  );
}

function BlogFormModal({
  open,
  post,
  onClose,
  onSaved,
}: {
  open: boolean;
  post: BlogPost | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!post;
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlogForm>({ defaultValues: defaultForm });
  const titleVal = watch('title');
  const slugVal = watch('slug');
  const [err, setErr] = useState('');
  const createBlog = useBlogsStore((s) => s.create);
  const updateBlog = useBlogsStore((s) => s.update);

  useEffect(() => {
    if (!open) return;
    if (post) {
      reset({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        cover: post.featuredImage
          ? {
              url: post.featuredImage,
              key: post.featuredStorageKey ?? '',
              storage: post.featuredStorageProvider ?? 'r2',
              mimetype: 'image/jpeg',
              size: 0,
              originalName: post.title,
            }
          : null,
        category: post.category ?? 'Health Tips',
        tags: post.tags ?? [],
        status: post.status,
      });
    } else {
      reset(defaultForm);
    }
    setErr('');
  }, [open, post, reset]);

  useEffect(() => {
    if (!isEdit && titleVal && !slugVal) setValue('slug', slugify(titleVal));
  }, [titleVal, slugVal, isEdit, setValue]);

  const onSubmit = async (form: BlogForm) => {
    setErr('');
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      featuredImage: form.cover?.url ?? '',
      featuredStorageKey: form.cover?.key,
      featuredStorageProvider: form.cover?.storage,
      category: form.category,
      tags: form.tags,
      status: form.status,
    };
    const result = isEdit && post
      ? await updateBlog(post._id, payload as never)
      : await createBlog(payload as never);
    if (result) onSaved();
    else setErr('Failed to save');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Post' : 'Add Blog'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className={`${adminStyles.btn} ${adminStyles.btnSecondary}`}>Cancel</button>
          <button
            type="submit"
            form="blog-form"
            disabled={isSubmitting}
            className={`${adminStyles.btn} ${adminStyles.btnPrimary}`}
          >
            {isSubmitting ? 'Saving…' : isEdit ? 'Update' : 'Create'}
          </button>
        </>
      }
    >
      <form id="blog-form" onSubmit={handleSubmit(onSubmit)}>
        {err && (
          <div className={adminStyles.errorBox}>
            <i className="ri-error-warning-line" /> {err}
          </div>
        )}

        <Controller
          control={control}
          name="cover"
          render={({ field }) => (
            <FileUpload
              module="blogs"
              value={field.value}
              onChange={field.onChange}
              label="Cover image"
              hint="16:9 recommended (1600×900). PNG/JPG/WebP up to 5MB."
            />
          )}
        />

        <div className={adminStyles.formGrid} style={{ marginTop: 'var(--space-4)' }}>
          <div className="form-group full">
            <label className="form-label">Title *</label>
            <input className="form-input" {...register('title', { required: true })} />
            {errors.title && <div className="form-error">Required</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Slug *</label>
            <input className="form-input" {...register('slug', { required: true })} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <input className="form-input" {...register('category')} />
          </div>
          <div className="form-group full">
            <label className="form-label">Excerpt *</label>
            <textarea rows={2} className="form-input" {...register('excerpt', { required: true })} />
          </div>
          <div className="form-group full">
            <label className="form-label">Content (HTML) *</label>
            <textarea
              rows={10}
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}
              {...register('content', { required: true })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tags</label>
            <Controller
              control={control}
              name="tags"
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" {...register('status')}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
