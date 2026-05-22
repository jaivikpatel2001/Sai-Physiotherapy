import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import MedicalDisclaimer from '@/components/seo/MedicalDisclaimer';
import { pageMeta } from '@/lib/seo/metadata';
import { breadcrumbSchema, articleSchema } from '@/lib/seo/schema';
import { getPost, BLOG_SEO } from '@/lib/seo/content';

type Props = { params: { slug: string }; children: React.ReactNode };

// Prerender every blog slug at build time so the first visit to any post is
// instant in production. Unknown slugs still render dynamically thanks to the
// (default) `dynamicParams: true`.
export function generateStaticParams() {
  return BLOG_SEO.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) {
    return pageMeta({
      title: 'Physiotherapy Article',
      description: 'Evidence-based physiotherapy guidance from SAI Physiotherapy, Ahmedabad.',
      path: `/blog/${params.slug}`,
    });
  }
  return pageMeta({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    image: post.image,
    type: 'article',
    publishedTime: new Date(post.date).toISOString(),
    authors: [post.author],
    keywords: [post.category, `${post.category} physiotherapy`, 'physiotherapy advice Ahmedabad'],
  });
}

export default function BlogDetailLayout({ params, children }: Props) {
  const post = getPost(params.slug);
  return (
    <>
      {post && (
        <JsonLd
          data={[
            breadcrumbSchema([
              { name: 'Blog', path: '/blog' },
              { name: post.title, path: `/blog/${post.slug}` },
            ]),
            articleSchema(post),
          ]}
        />
      )}
      {children}
      {post && <MedicalDisclaimer />}
    </>
  );
}
