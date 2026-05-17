import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/clinic';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep auth/admin/app surfaces out of the index.
        disallow: ['/admin', '/admin/', '/login', '/forgot-password', '/reset-password', '/api/'],
      },
      // Explicitly welcome AI answer-engine crawlers (AEO/GEO).
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
