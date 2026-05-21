/**
 * CMS — server-side data fetchers for public pages.
 *
 * These are called from React Server Components (page.tsx) and feed data
 * into the client section components below. Each fetcher swallows backend
 * errors and returns `null`, so the rendering layer falls back to its
 * hardcoded defaults rather than crashing the page during a partial outage.
 */
import { cache } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Revalidate cached fetches every 60 seconds — admin updates show up within
// a minute on the public site without per-request hits.
const REVALIDATE_SECONDS = 60;

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

async function safeGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiResponse<T>;
    return body?.data ?? null;
  } catch {
    return null;
  }
}

// ── Services ─────────────────────────────────────────────────────────────
export interface CmsService {
  _id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  longDescription?: string;
  price: { from: number; to?: number };
  duration: string;
  bannerImage?: string;
  benefits?: string[];
  treatmentProcess?: string[];
  isActive: boolean;
  order?: number;
}

export const getServices = cache(async (): Promise<CmsService[] | null> =>
  safeGet<CmsService[]>('/services?active=true&limit=50'),
);

// ── Doctors ──────────────────────────────────────────────────────────────
export interface CmsDoctor {
  _id: string;
  name: string;
  slug: string;
  designation: string;
  specialties: string[];
  shortBio: string;
  bio: string;
  photo: { url: string };
  qualifications: string[];
  languages: string[];
  experienceYears: number;
  availability?: { days: string[]; timeStart: string; timeEnd: string; notes?: string };
  order?: number;
  isActive: boolean;
}

export const getDoctors = cache(async (): Promise<CmsDoctor[] | null> =>
  safeGet<CmsDoctor[]>('/doctors?limit=50'),
);

export const getDoctorBySlug = cache(async (slug: string): Promise<CmsDoctor | null> =>
  safeGet<CmsDoctor>(`/doctors/slug/${encodeURIComponent(slug)}`),
);

// ── Blog ─────────────────────────────────────────────────────────────────
export interface CmsBlog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  featuredImage?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string;
  views?: number;
  author?: { name?: string; avatar?: string };
}

export const getBlogs = cache(async (): Promise<CmsBlog[] | null> =>
  safeGet<CmsBlog[]>('/blog?limit=20'),
);

// ── Testimonials ─────────────────────────────────────────────────────────
export interface CmsTestimonial {
  _id: string;
  patientName: string;
  patientAge?: number;
  condition: string;
  rating: number;
  review: string;
  videoUrl?: string;
  isFeatured: boolean;
  createdAt: string;
}

export const getTestimonials = cache(async (): Promise<CmsTestimonial[] | null> =>
  safeGet<CmsTestimonial[]>('/testimonials?limit=30'),
);

export const getFeaturedTestimonials = cache(async (): Promise<CmsTestimonial[] | null> =>
  safeGet<CmsTestimonial[]>('/testimonials?featured=true&limit=10'),
);

// ── Gallery ──────────────────────────────────────────────────────────────
export interface CmsGalleryItem {
  _id: string;
  title: string;
  caption?: string;
  category: 'clinic' | 'treatments' | 'events' | 'awards' | 'team';
  image: { url: string };
  alt: string;
  order: number;
}

export const getGallery = cache(async (): Promise<CmsGalleryItem[] | null> =>
  safeGet<CmsGalleryItem[]>('/gallery?limit=60'),
);

// ── CMS Pages (for footer + dynamic page routes) ─────────────────────────
export interface CmsPage {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  showInFooter: boolean;
  footerLabel?: string;
  footerOrder: number;
  publishedAt?: string;
  seo?: { metaTitle?: string; metaDescription?: string; keywords?: string[] };
}

export const getFooterPages = cache(async (): Promise<CmsPage[] | null> =>
  safeGet<CmsPage[]>('/pages?footer=true'),
);

export const getPageBySlug = cache(async (slug: string): Promise<CmsPage | null> =>
  safeGet<CmsPage>(`/pages/slug/${encodeURIComponent(slug)}`),
);
