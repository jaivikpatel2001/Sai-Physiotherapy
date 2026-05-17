import type { Metadata, Viewport } from 'next';
import './globals.css';
import 'lenis/dist/lenis.css';
import SmoothScroll from '@/components/providers/SmoothScroll';
import Preloader from '@/components/ui/Preloader/Preloader';

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://saiphysiotherapy.com'),
  title: {
    default: 'SAI Physiotherapy Spine Care & Paralysis Centre | Ahmedabad, Gujarat',
    template: '%s | SAI Physiotherapy',
  },
  description:
    "Gujarat's leading physiotherapy and rehabilitation center. Expert treatment for back pain, spine care, paralysis, sports injuries, and more in Ahmedabad.",
  keywords: [
    'physiotherapy ahmedabad',
    'spine care gujarat',
    'paralysis rehabilitation',
    'back pain treatment ahmedabad',
    'sai physiotherapy',
    'neuro physiotherapy',
    'sports injury rehabilitation',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'SAI Physiotherapy Spine Care & Paralysis Centre',
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'MedicalClinic',
              name: 'SAI Physiotherapy Spine Care & Paralysis Centre',
              description: "Gujarat's leading physiotherapy and rehabilitation center",
              url: 'https://saiphysiotherapy.com',
              telephone: '+919999999999',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Ahmedabad',
                addressRegion: 'Gujarat',
                addressCountry: 'IN',
              },
              medicalSpecialty: 'PhysicalTherapy',
              openingHours: ['Mo-Fr 08:00-20:00', 'Sa 08:00-18:00', 'Su 09:00-13:00'],
              priceRange: '₹₹',
              aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '500' },
            }),
          }}
        />
      </head>
      <body>
        <Preloader />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
