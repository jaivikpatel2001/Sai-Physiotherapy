import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { pageMeta } from '@/lib/seo/metadata';
import { breadcrumbSchema, serviceSchema } from '@/lib/seo/schema';
import { getService } from '@/lib/seo/content';

type Props = { params: { slug: string }; children: React.ReactNode };

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
