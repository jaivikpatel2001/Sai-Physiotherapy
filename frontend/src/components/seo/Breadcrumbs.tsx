import Link from 'next/link';
import JsonLd from './JsonLd';
import { breadcrumbSchema } from '@/lib/seo/schema';
import styles from './Breadcrumbs.module.css';

/**
 * Accessible visible breadcrumb + BreadcrumbList JSON-LD.
 * Improves crawl depth, internal linking and Google breadcrumb rich results.
 */
export default function Breadcrumbs({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  const trail = [{ name: 'Home', path: '/' }, ...items];

  return (
    <nav className={styles.wrap} aria-label="Breadcrumb">
      <JsonLd data={breadcrumbSchema(trail)} />
      <ol className={styles.list}>
        {trail.map((item, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={item.path} className={styles.item}>
              {last ? (
                <span aria-current="page" className={styles.current}>
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.path} className={styles.link}>
                    {item.name}
                  </Link>
                  <i className="ri-arrow-right-s-line" aria-hidden />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
