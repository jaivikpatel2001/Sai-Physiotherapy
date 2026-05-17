import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { pageMeta } from '@/lib/seo/metadata';
import { breadcrumbSchema, physicianSchema } from '@/lib/seo/schema';
import { DOCTORS_SEO } from '@/lib/seo/content';

export const metadata: Metadata = pageMeta({
  title: 'Our Physiotherapists — BPT & MPT Specialists in Ahmedabad',
  description:
    'Meet the BPT & MPT qualified physiotherapists at SAI Physiotherapy, Ahmedabad — specialists in spine care, neuro rehab, sports injury and orthopedic physiotherapy.',
  path: '/doctors',
  keywords: ['physiotherapist in Ahmedabad', 'best physiotherapy doctor Gujarat', 'MPT specialist Ahmedabad'],
});

export default function DoctorsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: 'Doctors', path: '/doctors' }]),
          ...DOCTORS_SEO.map(physicianSchema),
        ]}
      />
      {children}
    </>
  );
}
