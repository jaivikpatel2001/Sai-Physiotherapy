'use client';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { adminBlogApi, type UploadedFile } from '@/lib/api';
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
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminBlogApi.getAll();
      setPosts(res.data?.data ?? res.data ?? []);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    await adminBlogApi.remove(deletingId);
    setPosts((arr) => arr.filter((p) => p._id !== deletingId));
    setDeletingId(null);
  };

  const columns: Column<BlogPost>[] = [
    {
      key: 'title',
      header: 'Title',
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
      render: (p) => <StatusBadge label={p.status} tone={toneFor(p.status)} />,
    },
    {
      key: 'views',
      header: 'Views',
      render: (p) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <i className="ri-eye-line" style={{ fontSize: 14 }} /> {p.views ?? 0}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
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
        <AsyncBoundary
          loading={loading}
          error={error || null}
          empty={posts.length === 0}
          emptyTitle="No posts yet"
          emptyDescription="Create your first article to publish on the public blog."
          emptyIcon="ri-file-text-line"
          emptyAction={<AddButton label="Add Blog" onClick={() => { setEditing(null); setShowModal(true); }} />}
        >
          <DataTable
            rows={posts}
            columns={columns}
            rowKey={(p) => p._id}
            renderActions={(p) => (
              <ActionMenu
                onView={() => window.open(`/blog/${p.slug}`, '_blank')}
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
        onSaved={() => { setShowModal(false); void fetchData(); }}
      />

      <ConfirmDialog
        open={!!deletingId}
        title="Archive this post?"
        message="The post will be hidden from the public site (status set to archived)."
        confirmLabel="Archive"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
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
    try {
      if (isEdit && post) await adminBlogApi.update(post._id, payload);
      else await adminBlogApi.create(payload);
      onSaved();
    } catch (e: unknown) {
      setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to save');
    }
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
