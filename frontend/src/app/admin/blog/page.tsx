'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { adminBlogApi } from '@/lib/api';
import { formatDate } from '@sai-physio/utils';
import styles from '../admin.module.css';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
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
  featuredImage?: string;
  category?: string;
  tags?: string;
  status: 'draft' | 'published' | 'archived';
}

const STATUS_BADGE: Record<string, string> = {
  draft: styles.badgeNeutral,
  published: styles.badgeSuccess,
  archived: styles.badgeWarning,
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminBlogApi.getAll();
      setPosts(res.data?.data ?? res.data ?? []);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return;
    try {
      await adminBlogApi.remove(id);
      setPosts((p) => p.filter((x) => x._id !== id));
    } catch {
      setError('Failed to delete');
    }
  };

  const openNew = () => { setEditing(null); setShowModal(true); };
  const openEdit = (p: BlogPost) => { setEditing(p); setShowModal(true); };

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Blog Posts</h1>
          <p className={styles.pageSub}>Manage articles for the public site</p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openNew}>
          <i className="ri-add-line" style={{ fontSize: 16 }} /> New Post
        </button>
      </div>

      {error && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{error}</div>}

      <div className={styles.adminCard}>
        <div className={styles.tableWrap}>
          {loading ? <div className={styles.spinner} /> : posts.length === 0 ? (
            <div className={styles.empty}><i className={`ri-file-text-line ${styles.emptyIcon}`} style={{ fontSize: 40 }} /><span>No posts yet. Create your first article.</span></div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.title}</div>
                      <div className={styles.muted} style={{ fontSize: 'var(--text-xs)' }}>/{p.slug}</div>
                    </td>
                    <td>{typeof p.author === 'object' ? (p.author.name ?? '—') : '—'}</td>
                    <td><span className={`${styles.badge} ${STATUS_BADGE[p.status] || styles.badgeNeutral}`}>{p.status}</span></td>
                    <td><span className={styles.hstack}><i className="ri-eye-line" style={{ fontSize: 14 }} /> {p.views ?? 0}</span></td>
                    <td>{p.publishedAt ? formatDate(p.publishedAt) : (p.createdAt ? formatDate(p.createdAt) : '—')}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => openEdit(p)} title="Edit"><i className="ri-edit-line" style={{ fontSize: 14 }} /></button>
                        <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => handleDelete(p._id)} title="Delete" style={{ color: 'var(--color-error)' }}><i className="ri-delete-bin-line" style={{ fontSize: 14 }} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <BlogModal
          post={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchData(); }}
        />
      )}
    </>
  );
}

function BlogModal({ post, onClose, onSaved }: { post: BlogPost | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!post;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BlogForm>({
    defaultValues: post ? {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage,
      category: post.category,
      tags: (post.tags ?? []).join(', '),
      status: post.status,
    } : { status: 'draft' },
  });
  const [err, setErr] = useState('');

  const onSubmit = async (form: BlogForm) => {
    setErr('');
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    try {
      if (isEdit && post) await adminBlogApi.update(post._id, payload);
      else await adminBlogApi.create(payload);
      onSaved();
    } catch (e: unknown) {
      setErr((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save');
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalLg}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>{isEdit ? 'Edit Post' : 'New Post'}</div>
          <button className={styles.iconBtn} onClick={onClose}><i className="ri-close-line" style={{ fontSize: 18 }} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.modalBody}>
            {err && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{err}</div>}
            <div className={styles.formGrid}>
              <div className="form-group full">
                <label className="form-label">Title *</label>
                <input className="form-input" {...register('title', { required: true })} />
                {errors.title && <div className="form-error">Required</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Slug *</label>
                <input className="form-input" placeholder="my-post-url" {...register('slug', { required: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" {...register('category')} />
              </div>
              <div className="form-group full">
                <label className="form-label">Cover Image URL</label>
                <input className="form-input" placeholder="https://..." {...register('featuredImage')} />
              </div>
              <div className="form-group full">
                <label className="form-label">Excerpt *</label>
                <textarea className="form-input" rows={2} {...register('excerpt', { required: true })} />
              </div>
              <div className="form-group full">
                <label className="form-label">Content *</label>
                <textarea className="form-input" rows={8} {...register('content', { required: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input className="form-input" {...register('tags')} />
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
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`${styles.btn} ${styles.btnPrimary}`}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
