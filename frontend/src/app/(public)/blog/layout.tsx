import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { pageMeta } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/schema';
import { BLOG_SEO } from '@/lib/seo/content';
import { CLINIC, SITE_URL } from '@/lib/seo/clinic';

export const metadata: Metadata = pageMeta({
  title: 'Physiotherapy Health Articles & Recovery Guides',
  description:
    'Evidence-based physiotherapy articles and recovery guides written by the qualified physiotherapists at SAI Physiotherapy, Ahmedabad.',
  path: '/blog',
  keywords: ['physiotherapy blog', 'back pain exercises', 'recovery guide', 'physiotherapy tips Ahmedabad'],
});

const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: `${CLINIC.name} Health Resources`,
  url: `${SITE_URL}/blog`,
  publisher: { '@id': `${SITE_URL}/#organization` },
  blogPost: BLOG_SEO.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    url: `${SITE_URL}/blog/${p.slug}`,
    datePublished: new Date(p.date).toISOString(),
    author: { '@type': 'Person', name: p.author },
  })),
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: 'Blog', path: '/blog' }]), blogSchema]} />
      {children}
    </>
  );
}
