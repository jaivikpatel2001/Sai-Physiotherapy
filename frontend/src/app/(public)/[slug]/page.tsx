import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pageMeta } from '@/lib/seo/metadata';
import { getPageBySlug, getAllPublishedPages } from '@/lib/cms';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/seo/schema';
import styles from './cms-page.module.css';

interface Params {
  slug: string;
}

// Prerender every published CMS page at build time. If the backend is offline
// at build (or there are no pages yet), we fall through to `dynamicParams:true`
// (the default) and pages are rendered on demand with ISR.
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const pages = await getAllPublishedPages();
  if (!pages?.length) return [];
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const page = await getPageBySlug(params.slug);
  if (!page) {
    return pageMeta({ title: 'Page not found', description: '', path: `/${params.slug}` });
  }
  return pageMeta({
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription || page.excerpt || '',
    path: `/${page.slug}`,
    keywords: page.seo?.keywords,
  });
}

export default async function CmsPage({ params }: { params: Params }) {
  const page = await getPageBySlug(params.slug);
  if (!page) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: page.title, path: `/${page.slug}` },
        ])}
      />

      <article className={styles.wrap}>
        <div className="container">
          <header className={styles.header}>
            <p className="section-label" style={{ justifyContent: 'flex-start' }}>Page</p>
            <h1 className={styles.title}>{page.title}</h1>
            {page.excerpt && <p className={styles.excerpt}>{page.excerpt}</p>}
          </header>

          <div
            className={styles.body}
            // CMS-authored HTML — sanitisation happens at write-time in the admin.
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </article>
    </>
  );
}
