import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { pageMeta } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/schema';

export const metadata: Metadata = pageMeta({
  title: 'Clinic Gallery — Inside SAI Physiotherapy, Ahmedabad',
  description:
    'Take a visual tour of SAI Physiotherapy, Ahmedabad — our modern treatment bays, electrotherapy equipment, rehab gym and patient care facilities.',
  path: '/gallery',
  keywords: ['SAI Physiotherapy clinic photos', 'physiotherapy clinic Ahmedabad facility', 'physiotherapy centre gallery'],
});

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'Gallery', path: '/gallery' }])} />
      {children}
    </>
  );
}
