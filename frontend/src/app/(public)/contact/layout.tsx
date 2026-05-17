import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { pageMeta } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/schema';
import { CLINIC, SITE_URL } from '@/lib/seo/clinic';

export const metadata: Metadata = pageMeta({
  title: 'Contact SAI Physiotherapy — Ahmedabad Clinic Address & Phone',
  description: `Contact ${CLINIC.legalName} in Ahmedabad. Call ${CLINIC.phoneDisplay}, WhatsApp, or visit our clinic. Open Mon–Sat with Sunday morning hours.`,
  path: '/contact',
  keywords: ['physiotherapy clinic Ahmedabad contact', 'physiotherapist near me', 'book physiotherapy Ahmedabad'],
});

const contactPage = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  url: `${SITE_URL}/contact`,
  about: { '@id': `${SITE_URL}/#clinic` },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: 'Contact', path: '/contact' }]), contactPage]} />
      {children}
    </>
  );
}
