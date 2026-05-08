import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sitemap | SAI Physiotherapy',
  description: 'A complete map of all pages on SAI Physiotherapy.',
};

const GROUPS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Main',
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
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms & Conditions', href: '/terms' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div style={{ background: 'var(--color-bg)' }}>
      <div style={{ background: 'var(--gradient-hero)', padding: 'calc(var(--header-height) + 3rem) 0 3rem', textAlign: 'center' }}>
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>Navigation</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', fontWeight: 700, letterSpacing: '-0.025em', margin: '0.75rem 0 0.5rem' }}>Sitemap</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>A complete map of every page on the site.</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="grid-3" style={{ gap: 'var(--space-6)', alignItems: 'start' }}>
            {GROUPS.map((g) => (
              <div key={g.title} style={{ background: 'white', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-7) var(--space-6)', boxShadow: 'var(--shadow-card)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 'var(--space-5)' }}>{g.title}</h2>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', listStyle: 'none', padding: 0, margin: 0 }}>
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--color-text)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border-light)', transition: 'color 0.15s' }}>
                        <i className="ri-arrow-right-s-line" style={{ fontSize: 16, color: 'var(--color-primary)' }} />
                        {l.label}
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
