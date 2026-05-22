import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { pageMeta } from '@/lib/seo/metadata';
import { breadcrumbSchema, serviceSchema } from '@/lib/seo/schema';
import { getService, SERVICES_SEO } from '@/lib/seo/content';

type Props = { params: { slug: string }; children: React.ReactNode };

// Prerender every service slug at build time. Unknown slugs still render
// dynamically (default `dynamicParams: true`).
export function generateStaticParams() {
  return SERVICES_SEO.map((svc) => ({ slug: svc.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const svc = getService(params.slug);
  if (!svc) {
    return pageMeta({
      title: 'Physiotherapy Service',
      description: 'Expert physiotherapy treatment at SAI Physiotherapy, Ahmedabad.',
      path: `/services/${params.slug}`,
    });
  }
  return pageMeta({
    title: `${svc.title} in Ahmedabad — SAI Physiotherapy`,
    description: svc.description,
    path: `/services/${svc.slug}`,
    image: svc.image,
    keywords: [
      `${svc.title} Ahmedabad`,
      `${svc.title} physiotherapy`,
      `${svc.title.toLowerCase()} near me`,
      `${svc.category} physiotherapy Gujarat`,
    ],
  });
}

export default function ServiceDetailLayout({ params, children }: Props) {
  const svc = getService(params.slug);
  return (
    <>
      {svc && (
        <JsonLd
          data={[
            breadcrumbSchema([
              { name: 'Services', path: '/services' },
              { name: svc.title, path: `/services/${svc.slug}` },
            ]),
            serviceSchema(svc),
          ]}
        />
      )}
      {children}
    </>
  );
}
