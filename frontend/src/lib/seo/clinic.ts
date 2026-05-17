/**
 * Single source of truth for clinic NAP, geo, EEAT & brand entity data.
 * Consumed by metadata builders, JSON-LD schema, sitemap, robots and UI.
 * Keeping this centralized guarantees NAP consistency (a core local-SEO signal).
 */

const rawSite = process.env.NEXT_PUBLIC_SITE_URL;
// Canonical URLs must point at the production origin, never localhost.
export const SITE_URL =
  rawSite && rawSite.startsWith('http') && !rawSite.includes('localhost')
    ? rawSite.replace(/\/$/, '')
    : 'https://saiphysiotherapy.com';

export const CLINIC = {
  legalName: 'SAI Physiotherapy Spine Care & Paralysis Centre',
  name: 'SAI Physiotherapy',
  shortName: 'SAI Physio',
  tagline: 'Spine Care & Paralysis Centre',
  description:
    "Gujarat's leading physiotherapy & rehabilitation centre in Ahmedabad. Expert, evidence-based treatment for back pain, spine & disc problems, paralysis, sports injuries, neuro & post-surgery rehabilitation. NABH-aligned care since 2009.",
  foundingYear: '2009',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  ogImage: `${SITE_URL}/images/hero/hero_main.png`,
  email: 'clinic@saiphysiotherapy.com',
  phone: '+919999999999',
  phoneDisplay: '+91 99999 99999',
  whatsapp: '919999999999',
  priceRange: '₹₹',
  currency: 'INR',
  languages: ['en', 'hi', 'gu'],

  address: {
    street: 'SAI Physiotherapy, Spine Care & Paralysis Centre',
    locality: 'Ahmedabad',
    region: 'Gujarat',
    postalCode: '380001',
    country: 'IN',
  },
  // Ahmedabad city centroid — replace with exact clinic coordinates when available.
  geo: { latitude: 23.0225, longitude: 72.5714 },

  // Areas served — powers "near me" / geo-targeted local SEO.
  areasServed: [
    'Ahmedabad',
    'Bopal',
    'Satellite',
    'Navrangpura',
    'Vastrapur',
    'Maninagar',
    'Gandhinagar',
    'Bodakdev',
    'Prahlad Nagar',
    'Gujarat',
  ],

  openingHours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '20:00' },
    { days: ['Saturday'], opens: '08:00', closes: '18:00' },
    { days: ['Sunday'], opens: '09:00', closes: '13:00' },
  ],

  rating: { value: '4.9', count: '500' },

  social: [
    'https://www.facebook.com/saiphysiotherapy',
    'https://www.instagram.com/saiphysiotherapy',
    'https://www.youtube.com/@saiphysiotherapy',
    'https://www.linkedin.com/company/saiphysiotherapy',
  ],

  medicalSpecialties: [
    'Physiotherapy',
    'Physical Therapy',
    'Rehabilitation',
    'Sports Medicine',
    'Neurological Rehabilitation',
  ],
} as const;

/** Default keyword set — extended per page. */
export const BASE_KEYWORDS = [
  'physiotherapy Ahmedabad',
  'physiotherapy clinic near me',
  'physiotherapist in Ahmedabad',
  'back pain treatment Ahmedabad',
  'spine care Gujarat',
  'paralysis rehabilitation Ahmedabad',
  'sports injury physiotherapy Ahmedabad',
  'neuro physiotherapy',
  'best physiotherapy clinic Gujarat',
  'SAI Physiotherapy',
];
