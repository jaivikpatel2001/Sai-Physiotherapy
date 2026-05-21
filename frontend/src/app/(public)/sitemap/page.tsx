import type { Metadata } from 'next';
import Link from 'next/link';
import legal from '../privacy-policy/legal.module.css';
import styles from './sitemap.module.css';

export const metadata: Metadata = {
  title: 'Sitemap | SAI Physiotherapy',
  description: 'A complete map of all pages on SAI Physiotherapy.',
};

const GROUPS: { title: string; icon: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Main',
    icon: 'ri-home-4-line',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Doctors', href: '/doctors' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Blog', href: '/blog' },
      { label: 'Testimonials', href: '/testimonials' },
      { label: 'Contact', href: '/contact' },
      { label: 'Book Appointment', href: '/book-appointment' },
    ],
  },
  {
    title: 'Services',
    icon: 'ri-stethoscope-line',
    links: [
      { label: 'All Services', href: '/services' },
      { label: 'Back Pain Treatment', href: '/services/back-pain-treatment' },
      { label: 'Spine Care & Disc Problems', href: '/services/spine-care-disc-problems' },
      { label: 'Paralysis Rehabilitation', href: '/services/paralysis-rehabilitation' },
      { label: 'Knee Pain & Joint Care', href: '/services/knee-pain-joint-care' },
      { label: 'Neck Pain & Cervical Care', href: '/services/neck-pain-cervical-spondylosis' },
      { label: 'Sports Injury Rehabilitation', href: '/services/sports-injury-rehabilitation' },
      { label: 'Neuro Physiotherapy', href: '/services/neuro-physiotherapy' },
      { label: 'Post-Surgery Rehabilitation', href: '/services/post-surgery-rehabilitation' },
      { label: 'Pediatric Physiotherapy', href: '/services/pediatric-physiotherapy' },
      { label: 'Geriatric Care', href: '/services/geriatric-care' },
      { label: 'Shoulder Pain Treatment', href: '/services/shoulder-pain-treatment' },
      { label: 'Frozen Shoulder', href: '/services/frozen-shoulder' },
    ],
  },
  {
    title: 'Health Articles',
    icon: 'ri-article-line',
    links: [
      { label: 'Lower Back Pain Exercises', href: '/blog/5-exercises-for-lower-back-pain' },
      { label: 'Cervical Spondylosis', href: '/blog/understanding-cervical-spondylosis' },
      { label: 'Post-Stroke Rehabilitation', href: '/blog/post-stroke-rehabilitation-guide' },
      { label: 'Knee Osteoarthritis Management', href: '/blog/knee-osteoarthritis-management' },
      { label: 'Sports Injury Prevention', href: '/blog/sports-injury-prevention-tips' },
      { label: 'Frozen Shoulder Treatment', href: '/blog/frozen-shoulder-treatment' },
    ],
  },
  {
    title: 'Legal',
    icon: 'ri-shield-check-line',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms & Conditions', href: '/terms' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className={legal.page}>
      <section className={legal.hero}>
        <div className={legal.heroMesh} />
        <div className="container">
          <span className={legal.eyebrow}>Navigation</span>
          <h1 className={legal.title}>
            <span className="gradient-text">Sitemap</span>
          </h1>
          <p className={legal.lastUpdated}>A complete map of every page on the site.</p>
        </div>
      </section>
      <section className={styles.body}>
        <div className="container">
          <div className={styles.grid}>
            {GROUPS.map((g) => (
              <div key={g.title} className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardIcon}><i className={g.icon} /></div>
                  <h2 className={styles.cardTitle}>{g.title}</h2>
                </div>
                <ul className={styles.list}>
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={styles.link}>
                        <i className="ri-arrow-right-s-line" />
                        <span>{l.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
