import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Physiotherapy Health Articles & Guides | SAI Physiotherapy Blog',
  description: 'Expert health articles written by SAI Physiotherapy doctors. Tips for back pain, spine care, sports injuries, and rehabilitation.',
};

const POSTS = [
  { slug: '5-exercises-for-lower-back-pain', category: 'Back Pain', icon: 'ri-walk-line', title: '5 Physiotherapist-Approved Exercises for Lower Back Pain Relief', excerpt: 'Lower back pain affects 80% of people. Our senior physiotherapist shares five evidence-based exercises you can do at home for immediate relief.', readTime: '5 min', date: 'April 28, 2026', color: 'var(--color-primary-50)' },
  { slug: 'understanding-cervical-spondylosis', category: 'Spine Care', icon: 'ri-mental-health-line', title: 'Understanding Cervical Spondylosis: Causes, Symptoms & Treatment', excerpt: 'Neck pain and stiffness are increasingly common in the digital age. Learn how cervical spondylosis develops and how physiotherapy offers long-term relief.', readTime: '7 min', date: 'April 15, 2026', color: 'var(--color-sand-50)' },
  { slug: 'post-stroke-rehabilitation-guide', category: 'Neuro Rehab', icon: 'ri-heart-pulse-line', title: 'A Complete Guide to Post-Stroke Rehabilitation & Recovery', excerpt: 'Stroke recovery is a journey. Our neuro physio team explains the stages of recovery and what to expect from a structured rehabilitation program.', readTime: '8 min', date: 'March 30, 2026', color: 'var(--color-mint-50)' },
  { slug: 'knee-osteoarthritis-management', category: 'Joint Care', icon: 'ri-run-line', title: 'Managing Knee Osteoarthritis with Physiotherapy — A Patient Guide', excerpt: 'Knee osteoarthritis doesn\'t have to mean a lifetime of pain. Learn how targeted physiotherapy can significantly reduce pain and improve function.', readTime: '6 min', date: 'March 15, 2026', color: 'var(--color-blush-50)' },
  { slug: 'sports-injury-prevention-tips', category: 'Sports', icon: 'ri-football-line', title: '10 Physiotherapist Tips to Prevent Sports Injuries', excerpt: 'Prevention is better than cure. Our sports physio experts share essential warm-up, cool-down, and conditioning tips for athletes of all levels.', readTime: '5 min', date: 'March 1, 2026', color: 'var(--color-primary-50)' },
  { slug: 'frozen-shoulder-treatment', category: 'Shoulder', icon: 'ri-snowy-line', title: 'Frozen Shoulder: What It Is and How We Treat It', excerpt: 'Adhesive capsulitis affects 2-5% of the population. Discover the stages, symptoms, and physiotherapy treatments that restore full shoulder mobility.', readTime: '6 min', date: 'February 20, 2026', color: 'var(--color-lavender-50)' },
];

export default function BlogPage() {
  return (
    <div style={{ background: 'var(--color-bg)' }}>
      <div style={{ background: 'var(--gradient-hero)', padding: 'calc(var(--header-height) + 4rem) 0 4rem', textAlign: 'center' }}>
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>Health Resources</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text)', fontWeight: 700, margin: '0.75rem 0 1rem', letterSpacing: '-0.02em' }}>
            Health Articles & <span style={{ color: 'var(--color-primary)' }}>Guides</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', maxWidth: 560, margin: '0 auto' }}>
            Evidence-based health information written by our qualified physiotherapists.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {POSTS.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{ display: 'flex', flexDirection: 'column', background: 'white', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', textDecoration: 'none', color: 'inherit', transition: 'transform 0.25s, box-shadow 0.25s', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ background: post.color, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <i className={post.icon} style={{ fontSize: 64, color: 'var(--color-primary)', opacity: 0.55 }} />
                  <span style={{ position: 'absolute', top: 12, left: 12, background: 'var(--color-white)', color: 'var(--color-primary)', padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--color-border)' }}>{post.category}</span>
                </div>
                <div style={{ padding: '1.25rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <span>{post.date}</span><span>·</span><span>{post.readTime} read</span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.35 }}>{post.title}</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6, flex: 1 }}>{post.excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border-light)' }}>
                    Read Article <i className="ri-arrow-right-line" style={{ fontSize: 14 }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
