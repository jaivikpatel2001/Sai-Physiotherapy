import type { Metadata } from 'next';
import { CLINIC, SITE_URL, BASE_KEYWORDS } from './clinic';

type PageMetaInput = {
  title: string;
  description: string;
  /** Path beginning with "/" — used for canonical + OG url. */
  path: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  authors?: string[];
  noindex?: boolean;
};

/**
 * Single metadata factory used by every page/route layout. Guarantees a
 * canonical URL, complete Open Graph + Twitter cards, and consistent
 * title/description shaping for traditional + AI search.
 */
export function pageMeta(input: PageMetaInput): Metadata {
  const {
    title,
    description,
    path,
    keywords = [],
    image = CLINIC.ogImage,
    type = 'website',
    publishedTime,
    authors,
    noindex,
  } = input;

  const url = `${SITE_URL}${path === '/' ? '' : path}`;
  const fullTitle = title.includes(CLINIC.name) ? title : `${title} | ${CLINIC.name}`;
  const absImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return {
    title,
    description,
    keywords: [...keywords, ...BASE_KEYWORDS],
    alternates: { canonical: url },
    authors: authors?.map((name) => ({ name })),
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    openGraph: {
      type,
      url,
      title: fullTitle,
      description,
      siteName: CLINIC.legalName,
      locale: 'en_IN',
      images: [{ url: absImage, width: 1200, height: 630, alt: fullTitle }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [absImage],
    },
  };
}
