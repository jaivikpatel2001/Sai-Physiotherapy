import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { pageMeta } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/schema';
import { CLINIC, SITE_URL } from '@/lib/seo/clinic';

export const metadata: Metadata = pageMeta({
  title: 'Patient Testimonials & Reviews — SAI Physiotherapy Ahmedabad',
  description: `Read real patient reviews of ${CLINIC.legalName}. Rated ${CLINIC.rating.value}/5 by ${CLINIC.rating.count}+ patients across Ahmedabad and Gujarat.`,
  path: '/testimonials',
  keywords: ['SAI Physiotherapy reviews', 'physiotherapy clinic reviews Ahmedabad', 'best physiotherapist Gujarat reviews'],
});

const reviewAggregate = {
  '@context': 'https://schema.org',
  '@type': 'AggregateRating',
  itemReviewed: { '@id': `${SITE_URL}/#clinic` },
  ratingValue: CLINIC.rating.value,
  reviewCount: CLINIC.rating.count,
  bestRating: '5',
  worstRating: '1',
};

export default function TestimonialsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: 'Testimonials', path: '/testimonials' }]), reviewAggregate]} />
      {children}
    </>
  );
}
