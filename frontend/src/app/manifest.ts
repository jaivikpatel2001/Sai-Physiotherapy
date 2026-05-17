import type { MetadataRoute } from 'next';
import { CLINIC } from '@/lib/seo/clinic';

/**
 * PWA manifest — installable, app-like experience for the mobile/WebView
 * build and a mobile-SEO signal.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: CLINIC.legalName,
    short_name: CLINIC.shortName,
    description: CLINIC.description,
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F6FAF9',
    theme_color: '#0C2641',
    lang: 'en-IN',
    categories: ['health', 'medical', 'lifestyle'],
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
  };
}
