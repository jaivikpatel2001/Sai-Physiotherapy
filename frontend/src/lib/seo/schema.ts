/**
 * JSON-LD builders. Every entity is @id-anchored so search & generative
 * engines resolve one consistent knowledge graph (key GEO signal).
 */
import { CLINIC, SITE_URL } from './clinic';
import type { BlogSEO, DoctorSEO, ServiceSEO } from './content';

const ORG_ID = `${SITE_URL}/#organization`;
const CLINIC_ID = `${SITE_URL}/#clinic`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const postalAddress = {
  '@type': 'PostalAddress',
  streetAddress: CLINIC.address.street,
  addressLocality: CLINIC.address.locality,
  addressRegion: CLINIC.address.region,
  postalCode: CLINIC.address.postalCode,
  addressCountry: CLINIC.address.country,
};

const geo = {
  '@type': 'GeoCoordinates',
  latitude: CLINIC.geo.latitude,
  longitude: CLINIC.geo.longitude,
};

const openingHoursSpecification = CLINIC.openingHours.map((h) => ({
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: h.days,
  opens: h.opens,
  closes: h.closes,
}));

const aggregateRating = {
  '@type': 'AggregateRating',
  ratingValue: CLINIC.rating.value,
  reviewCount: CLINIC.rating.count,
  bestRating: '5',
  worstRating: '1',
};

export function organizationSchema() {
  return {
    '@type': ['Organization', 'MedicalOrganization'],
    '@id': ORG_ID,
    name: CLINIC.legalName,
    alternateName: CLINIC.name,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: CLINIC.logo },
    image: CLINIC.ogImage,
    email: CLINIC.email,
    telephone: CLINIC.phone,
    foundingDate: CLINIC.foundingYear,
    description: CLINIC.description,
    address: postalAddress,
    sameAs: [...CLINIC.social],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: CLINIC.phone,
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi', 'Gujarati'],
    },
  };
}

/** MedicalClinic + Physiotherapy + LocalBusiness — the primary local entity. */
export function medicalClinicSchema(services: ServiceSEO[] = []) {
  return {
    '@type': ['MedicalClinic', 'Physiotherapy', 'LocalBusiness'],
    '@id': CLINIC_ID,
    name: CLINIC.legalName,
    alternateName: CLINIC.name,
    url: SITE_URL,
    logo: CLINIC.logo,
    image: CLINIC.ogImage,
    email: CLINIC.email,
    telephone: CLINIC.phone,
    priceRange: CLINIC.priceRange,
    currenciesAccepted: CLINIC.currency,
    paymentAccepted: 'Cash, UPI, Credit Card, Debit Card, Net Banking',
    description: CLINIC.description,
    parentOrganization: { '@id': ORG_ID },
    address: postalAddress,
    geo,
    hasMap: `https://www.google.com/maps/search/?api=1&query=${CLINIC.geo.latitude},${CLINIC.geo.longitude}`,
    openingHoursSpecification,
    aggregateRating,
    sameAs: [...CLINIC.social],
    medicalSpecialty: [...CLINIC.medicalSpecialties],
    availableLanguage: ['English', 'Hindi', 'Gujarati'],
    areaServed: CLINIC.areasServed.map((name) => ({
      '@type': 'City',
      name,
    })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Physiotherapy Services',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'MedicalTherapy',
          name: s.title,
          url: `${SITE_URL}/services/${s.slug}`,
        },
      })),
    },
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: CLINIC.legalName,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-IN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** The site-wide @graph injected once in the root layout. */
export function siteGraph(services: ServiceSEO[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema(), medicalClinicSchema(services), websiteSchema()],
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === '/' ? '' : item.path}`,
    })),
  };
}

export function faqSchema(qa: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map((x) => ({
      '@type': 'Question',
      name: x.q,
      acceptedAnswer: { '@type': 'Answer', text: x.a },
    })),
  };
}

export function physicianSchema(doc: DoctorSEO) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: doc.name,
    jobTitle: doc.title,
    description: `${doc.title} at ${CLINIC.name} — ${doc.qualification}, ${doc.experience} experience.`,
    medicalSpecialty: doc.specialties,
    hasCredential: doc.qualification,
    worksFor: { '@id': ORG_ID },
    workLocation: { '@id': CLINIC_ID },
  };
}

export function serviceSchema(svc: ServiceSEO, faq?: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalTherapy',
    name: svc.title,
    url: `${SITE_URL}/services/${svc.slug}`,
    description: svc.description,
    image: `${SITE_URL}${svc.image}`,
    medicineSystem: 'https://schema.org/WesternConventional',
    relevantSpecialty: 'Physiotherapy',
    provider: { '@id': CLINIC_ID },
    areaServed: CLINIC.areasServed.map((name) => ({ '@type': 'City', name })),
    ...(faq && faq.length
      ? {
          mainEntityOfPage: {
            '@type': 'FAQPage',
            mainEntity: faq.map((x) => ({
              '@type': 'Question',
              name: x.q,
              acceptedAnswer: { '@type': 'Answer', text: x.a },
            })),
          },
        }
      : {}),
  };
}

export function articleSchema(post: BlogSEO) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': url,
    headline: post.title,
    description: post.description,
    image: `${SITE_URL}${post.image}`,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    inLanguage: 'en-IN',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@type': 'MedicalCondition', name: post.category },
    author: {
      '@type': 'Person',
      name: post.author,
      jobTitle: 'Physiotherapist',
      worksFor: { '@id': ORG_ID },
    },
    reviewedBy: {
      '@type': 'Person',
      name: post.author,
      jobTitle: 'Physiotherapist',
    },
    publisher: { '@id': ORG_ID },
    lastReviewed: new Date(post.date).toISOString(),
  };
}
