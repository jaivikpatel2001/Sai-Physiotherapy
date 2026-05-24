import type { Metadata, Viewport } from 'next';
import './globals.css';
import 'lenis/dist/lenis.css';
import SmoothScroll from '@/components/providers/SmoothScroll';
import ToastProvider from '@/components/providers/ToastProvider';
import Preloader from '@/components/ui/Preloader/Preloader';
import JsonLd from '@/components/seo/JsonLd';
import Analytics from '@/components/seo/Analytics';
import { CLINIC, SITE_URL, BASE_KEYWORDS } from '@/lib/seo/clinic';
import { siteGraph } from '@/lib/seo/schema';
import { SERVICES_SEO } from '@/lib/seo/content';

// Native-app viewport: cover the notch/status-bar area so env(safe-area-inset-*)
// becomes non-zero inside Android/iOS WebView containers. Theme-color paints the
// system status bar with the brand navy for a seamless app-shell look.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0C2641' },
    { media: '(prefers-color-scheme: dark)', color: '#0C2641' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${CLINIC.legalName} | Physiotherapy in Ahmedabad, Gujarat`,
    template: `%s | ${CLINIC.name}`,
  },
  description: CLINIC.description,
  keywords: BASE_KEYWORDS,
  applicationName: CLINIC.name,
  alternates: { canonical: '/' },
  authors: [{ name: CLINIC.legalName, url: SITE_URL }],
  creator: CLINIC.legalName,
  publisher: CLINIC.legalName,
  category: 'Health',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: CLINIC.legalName,
    title: `${CLINIC.legalName} | Physiotherapy in Ahmedabad, Gujarat`,
    description: CLINIC.description,
    images: [{ url: CLINIC.ogImage, width: 1200, height: 630, alt: CLINIC.legalName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: CLINIC.legalName,
    description: CLINIC.description,
    images: [CLINIC.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: { icon: '/favicon.ico' },
  manifest: '/manifest.webmanifest',
  // Fullscreen WebView / installed-PWA behaviour: translucent status bar so the
  // app shell paints edge-to-edge under it, no auto-linkifying phone numbers.
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SAI Physio',
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Site-wide knowledge graph: Organization + MedicalClinic/Physiotherapy
            /LocalBusiness + WebSite(SearchAction). One @id-linked entity for
            Google, AI Overview, ChatGPT, Gemini & Perplexity. */}
        <JsonLd data={siteGraph(SERVICES_SEO)} />
      </head>
      <body>
        <Preloader />
        <SmoothScroll />
        {children}
        <ToastProvider />
        <Analytics />
      </body>
    </html>
  );
}
