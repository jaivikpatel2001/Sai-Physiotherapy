import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/clinic';
import { SERVICES_SEO, BLOG_SEO } from '@/lib/seo/content';

/**
 * Dynamic XML sitemap. Static routes + programmatic service & blog URLs,
 * with priority/changeFrequency tuned for a local healthcare site.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1.0, freq: 'weekly' },
    { path: '/services', priority: 0.9, freq: 'weekly' },
    { path: '/doctors', priority: 0.9, freq: 'monthly' },
    { path: '/book-appointment', priority: 0.9, freq: 'monthly' },
    { path: '/about', priority: 0.7, freq: 'monthly' },
    { path: '/contact', priority: 0.8, freq: 'monthly' },
    { path: '/mobile-app', priority: 0.7, freq: 'monthly' },
    { path: '/blog', priority: 0.8, freq: 'weekly' },
    { path: '/testimonials', priority: 0.6, freq: 'monthly' },
    { path: '/gallery', priority: 0.5, freq: 'monthly' },
    { path: '/privacy-policy', priority: 0.3, freq: 'yearly' },
    { path: '/terms', priority: 0.3, freq: 'yearly' },
  ];

  const base: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${SITE_URL}${r.path === '/' ? '' : r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  const services: MetadataRoute.Sitemap = SERVICES_SEO.map((s) => ({
    url: `${SITE_URL}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  const posts: MetadataRoute.Sitemap = BLOG_SEO.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...base, ...services, ...posts];
}
