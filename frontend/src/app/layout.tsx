import type { Metadata } from 'next';
import './globals.css';

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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#1B4F8A" />
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
      <body>{children}</body>
    </html>
  );
}
