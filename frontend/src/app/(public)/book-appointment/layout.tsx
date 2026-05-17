import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { pageMeta } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/schema';

export const metadata: Metadata = pageMeta({
  title: 'Book a Physiotherapy Appointment in Ahmedabad — Online Booking',
  description:
    'Book your physiotherapy appointment at SAI Physiotherapy, Ahmedabad in seconds. Choose your specialist and slot for back pain, spine, sports or neuro rehab.',
  path: '/book-appointment',
  keywords: ['book physiotherapy appointment Ahmedabad', 'physiotherapy near me booking', 'physiotherapist appointment Gujarat'],
});

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'Book Appointment', path: '/book-appointment' }])} />
      {children}
    </>
  );
}
