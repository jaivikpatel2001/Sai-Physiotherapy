import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Section = { heading: string; body: string; bullets?: string[] };
type Post = {
  slug: string;
  category: string;
  icon: string;
  color: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  readTime: string;
  date: string;
  sections: Section[];
  takeaway: string;
};

const POSTS: Record<string, Post> = {
  '5-exercises-for-lower-back-pain': {
    slug: '5-exercises-for-lower-back-pain', category: 'Back Pain', icon: 'ri-walk-line', color: 'var(--color-primary-50)',
    title: '5 Physiotherapist-Approved Exercises for Lower Back Pain Relief',
    excerpt: 'Lower back pain affects 80% of people. Our senior physiotherapist shares five evidence-based exercises you can do at home for immediate relief.',
    author: 'Dr. Sai Patel', authorRole: 'Senior Physiotherapist', readTime: '5 min', date: 'April 28, 2026',
    sections: [
      { heading: 'Why lower back pain is so common', body: 'Sedentary lifestyles, poor posture, and weak core muscles combine to make the lower back vulnerable. The good news: most non-specific lower back pain responds remarkably well to targeted exercise.' },
      { heading: 'The five exercises', body: 'These five movements are evidence-based and form the foundation of most rehabilitation programs we prescribe at the clinic. Perform them daily, slowly, and stop if any movement provokes sharp pain.', bullets: [
        'Cat-Cow stretch — 10 reps to mobilize the spine',
        'Glute bridges — 3 sets of 10 to activate posterior chain',
        'Bird-dog — 3 sets of 8 each side for core stability',
        'Child\'s pose — hold 30 seconds for capsular stretch',
        'Pelvic tilts — 15 reps to retrain neutral spine'
      ]},
      { heading: 'When to see a physiotherapist', body: 'If pain persists beyond 2 weeks, radiates into the leg, or is accompanied by numbness or weakness, book an assessment. Targeted manual therapy combined with these exercises produces faster, more durable results.' },
    ],
    takeaway: 'Consistent daily movement beats expensive interventions for most lower back pain. Start with these five exercises — and if you don\'t improve in two weeks, get assessed.',
  },
  'understanding-cervical-spondylosis': {
    slug: 'understanding-cervical-spondylosis', category: 'Spine Care', icon: 'ri-mental-health-line', color: 'var(--color-sand-50)',
    title: 'Understanding Cervical Spondylosis: Causes, Symptoms & Treatment',
    excerpt: 'Neck pain and stiffness are increasingly common in the digital age. Learn how cervical spondylosis develops and how physiotherapy offers long-term relief.',
    author: 'Dr. Anjali Mehta', authorRole: 'Spine Specialist', readTime: '7 min', date: 'April 15, 2026',
    sections: [
      { heading: 'What is cervical spondylosis?', body: 'Cervical spondylosis is age-related wear of the discs and joints in the neck. While it sounds alarming, it is extremely common — and most people with X-ray changes have no symptoms at all.' },
      { heading: 'Common symptoms', body: 'Symptoms vary but often include:', bullets: [
        'Neck stiffness, especially in the morning',
        'Headaches starting at the base of the skull',
        'Pain or tingling radiating into the shoulder or arm',
        'A grinding sensation when turning the head',
      ]},
      { heading: 'How physiotherapy helps', body: 'Physiotherapy works by addressing the modifiable factors — posture, deep neck flexor weakness, and joint stiffness. A combination of manual mobilization, targeted strengthening, and ergonomic correction produces durable improvements in over 80% of patients.' },
    ],
    takeaway: 'Spondylosis on imaging is normal with age — but symptomatic spondylosis is highly treatable. Don\'t accept "live with it" as the only answer.',
  },
  'post-stroke-rehabilitation-guide': {
    slug: 'post-stroke-rehabilitation-guide', category: 'Neuro Rehab', icon: 'ri-heart-pulse-line', color: 'var(--color-mint-50)',
    title: 'A Complete Guide to Post-Stroke Rehabilitation & Recovery',
    excerpt: 'Stroke recovery is a journey. Our neuro physio team explains the stages of recovery and what to expect from a structured rehabilitation program.',
    author: 'Dr. Rakesh Joshi', authorRole: 'Neuro Physiotherapist', readTime: '8 min', date: 'March 30, 2026',
    sections: [
      { heading: 'The first 90 days matter most', body: 'The brain\'s capacity for reorganization — neuroplasticity — peaks in the first three months after a stroke. Intensive, task-specific rehabilitation during this window produces the largest functional gains.' },
      { heading: 'Phases of stroke recovery', body: 'Recovery typically progresses through several recognizable phases:', bullets: [
        'Acute (0–7 days) — early mobilization and protection',
        'Subacute (1–6 weeks) — intensive task-specific training',
        'Chronic (6+ weeks) — refinement and community reintegration',
      ]},
      { heading: 'What good rehabilitation looks like', body: 'Effective rehabilitation is intensive (multiple hours per day), task-specific (practicing the actual movements you need), and patient-centered (driven by your personal goals). Generic exercise alone produces limited gains.' },
    ],
    takeaway: 'Stroke recovery is not passive. The earlier and more intensive the rehabilitation, the better the long-term outcome — and family involvement amplifies every gain.',
  },
  'knee-osteoarthritis-management': {
    slug: 'knee-osteoarthritis-management', category: 'Joint Care', icon: 'ri-run-line', color: 'var(--color-blush-50)',
    title: 'Managing Knee Osteoarthritis with Physiotherapy — A Patient Guide',
    excerpt: 'Knee osteoarthritis doesn\'t have to mean a lifetime of pain. Learn how targeted physiotherapy can significantly reduce pain and improve function.',
    author: 'Dr. Sai Patel', authorRole: 'Senior Physiotherapist', readTime: '6 min', date: 'March 15, 2026',
    sections: [
      { heading: 'Strength is medicine for OA', body: 'Strong quadriceps and hip muscles unload the knee joint, dramatically reducing pain in osteoarthritis. Multiple high-quality studies confirm exercise rivals medication for symptom control.' },
      { heading: 'What to do — and what to avoid', body: 'A structured program includes:', bullets: [
        'Twice-weekly resistance training of the quadriceps and glutes',
        'Low-impact cardio: cycling, swimming, or brisk walking',
        'Range-of-motion work to maintain joint mobility',
        'Avoid: deep squats with poor form, high-impact running on hard surfaces',
      ]},
      { heading: 'Can I delay knee replacement?', body: 'Often, yes. A 12-week structured physiotherapy program can delay surgery by years for many patients — and for some, indefinitely.' },
    ],
    takeaway: 'Knee OA is not a sentence to inactivity. The right strengthening program reduces pain, improves function, and may delay or avoid surgery entirely.',
  },
  'sports-injury-prevention-tips': {
    slug: 'sports-injury-prevention-tips', category: 'Sports', icon: 'ri-football-line', color: 'var(--color-primary-50)',
    title: '10 Physiotherapist Tips to Prevent Sports Injuries',
    excerpt: 'Prevention is better than cure. Our sports physio experts share essential warm-up, cool-down, and conditioning tips for athletes of all levels.',
    author: 'Dr. Karan Shah', authorRole: 'Sports Physiotherapist', readTime: '5 min', date: 'March 1, 2026',
    sections: [
      { heading: 'Why most injuries are preventable', body: 'Roughly 50% of sports injuries are non-contact and overuse-related — meaning they\'re largely preventable with proper preparation, recovery, and load management.' },
      { heading: 'Top 10 prevention strategies', body: 'Apply these consistently:', bullets: [
        'Dynamic warm-up for at least 10 minutes before any sport',
        'Progressive load increases — never more than 10% per week',
        'Strength train at least twice weekly, year-round',
        'Prioritize 7–9 hours of sleep per night',
        'Hydrate adequately — even mild dehydration impairs performance',
        'Address asymmetries and old injuries before they recur',
        'Use proper, well-fitted footwear',
        'Cool down and stretch after every session',
        'Periodize your training — schedule rest weeks',
        'Get a movement screen if you\'re repeatedly injured',
      ]},
      { heading: 'When to see a professional', body: 'If pain lingers more than a week, recurs frequently, or limits performance, get screened. Early intervention almost always shortens recovery.' },
    ],
    takeaway: 'The best athletes are those who stay on the field. Prevention is unsexy but unbeatable — invest in it.',
  },
  'frozen-shoulder-treatment': {
    slug: 'frozen-shoulder-treatment', category: 'Shoulder', icon: 'ri-snowy-line', color: 'var(--color-lavender-50)',
    title: 'Frozen Shoulder: What It Is and How We Treat It',
    excerpt: 'Adhesive capsulitis affects 2-5% of the population. Discover the stages, symptoms, and physiotherapy treatments that restore full shoulder mobility.',
    author: 'Dr. Anjali Mehta', authorRole: 'Spine Specialist', readTime: '6 min', date: 'February 20, 2026',
    sections: [
      { heading: 'A predictable but painful condition', body: 'Frozen shoulder (adhesive capsulitis) progresses through three phases — painful, frozen, and thawing — typically over 1–3 years if left untreated. Physiotherapy can substantially shorten this timeline.' },
      { heading: 'Stages and what to expect', body: 'Each phase has different goals:', bullets: [
        'Painful (2–9 months) — pain control, gentle mobility',
        'Frozen (4–12 months) — capsular stretching, mobility recovery',
        'Thawing (5–24 months) — strengthening and full restoration',
      ]},
      { heading: 'Treatment principles', body: 'Effective treatment combines manual capsular mobilization, graded stretching, scapular control work, and education. Diabetic patients need particularly careful long-term management as recurrence risk is higher.' },
    ],
    takeaway: 'Frozen shoulder will eventually resolve on its own — but life is short. Targeted physiotherapy gets you back to full function in months instead of years.',
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = POSTS[params.slug];
  if (!post) return { title: 'Article Not Found' };
  return {
    title: `${post.title} | SAI Physiotherapy Blog`,
    description: post.excerpt,
  };
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];
  if (!post) notFound();

  const related = Object.values(POSTS).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div style={{ background: 'var(--color-bg)' }}>
      <div style={{ background: 'var(--gradient-hero)', padding: 'calc(var(--header-height) + 3rem) 0 4rem' }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-6)' }}>
            <i className="ri-arrow-left-line" style={{ fontSize: 16 }} /> All Articles
          </Link>
          <span style={{ display: 'inline-block', background: 'white', color: 'var(--color-primary)', padding: '4px 14px', borderRadius: 999, fontSize: 'var(--text-xs)', fontWeight: 600, border: '1px solid var(--color-border)', marginBottom: 'var(--space-4)' }}>{post.category}</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 'var(--space-5)' }}>
            {post.title}
          </h1>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>{post.excerpt}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{ width: 36, height: 36, background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 'var(--text-xs)' }}>
                {post.author.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ color: 'var(--color-text)', fontWeight: 600 }}>{post.author}</div>
                <div style={{ fontSize: 'var(--text-xs)' }}>{post.authorRole}</div>
              </div>
            </div>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-text-light)' }} />
            <span><i className="ri-calendar-line" style={{ marginRight: 4 }} />{post.date}</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-text-light)' }} />
            <span><i className="ri-time-line" style={{ marginRight: 4 }} />{post.readTime} read</span>
          </div>
        </div>
      </div>

      <article className="section" style={{ paddingTop: 'var(--space-12)' }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <div style={{ background: post.color, height: 220, borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-10)', border: '1px solid var(--color-border-light)' }}>
            <i className={post.icon} style={{ fontSize: 80, color: 'var(--color-primary)', opacity: 0.5 }} />
          </div>

          {post.sections.map((s) => (
            <section key={s.heading} style={{ marginBottom: 'var(--space-10)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 'var(--space-4)' }}>{s.heading}</h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text)', lineHeight: 1.75, marginBottom: s.bullets ? 'var(--space-4)' : 0 }}>{s.body}</p>
              {s.bullets && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {s.bullets.map((b) => (
                    <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', fontSize: 'var(--text-base)', color: 'var(--color-text)', lineHeight: 1.6 }}>
                      <i className="ri-checkbox-circle-fill" style={{ fontSize: 18, color: 'var(--color-primary)', flexShrink: 0, marginTop: 3 }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <div style={{ background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-7) var(--space-8)', marginTop: 'var(--space-10)' }}>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>Key takeaway</p>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text)', lineHeight: 1.5, fontWeight: 500, margin: 0 }}>{post.takeaway}</p>
          </div>

          <div style={{ marginTop: 'var(--space-12)', padding: 'var(--space-8)', background: 'white', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-xl)', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>Need expert care?</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>Book a consultation with our specialists for a personalized treatment plan.</p>
            <Link href="/book-appointment" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.875rem 2rem', background: 'var(--gradient-primary)', color: 'white', borderRadius: 999, fontWeight: 600, boxShadow: 'var(--shadow-blue)' }}>
              Book Appointment <i className="ri-arrow-right-line" style={{ fontSize: 16 }} />
            </Link>
          </div>
        </div>
      </article>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h2)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.025em', marginBottom: 'var(--space-8)', textAlign: 'center' }}>Related Articles</h2>
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {related.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} style={{ display: 'flex', flexDirection: 'column', background: 'white', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', textDecoration: 'none', color: 'inherit', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ background: p.color, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={p.icon} style={{ fontSize: 56, color: 'var(--color-primary)', opacity: 0.55 }} />
                </div>
                <div style={{ padding: '1.25rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>{p.category}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.35 }}>{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
