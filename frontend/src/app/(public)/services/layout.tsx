import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { pageMeta } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/schema';
import { SERVICES_SEO } from '@/lib/seo/content';
import { SITE_URL } from '@/lib/seo/clinic';

export const metadata: Metadata = pageMeta({
  title: 'Physiotherapy Services in Ahmedabad — Back Pain, Spine, Neuro & Sports',
  description:
    'Explore physiotherapy services at SAI Physiotherapy, Ahmedabad: back pain, spine & disc care, paralysis rehab, sports injury, neuro & post-surgery rehabilitation.',
  path: '/services',
  keywords: ['physiotherapy services Ahmedabad', 'back pain treatment Ahmedabad', 'sports injury physiotherapy'],
});

const itemList = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Physiotherapy Services',
  itemListElement: SERVICES_SEO.map((s, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: s.title,
    url: `${SITE_URL}/services/${s.slug}`,
  })),
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: 'Services', path: '/services' }]), itemList]} />
      {children}
    </>
  );
}
