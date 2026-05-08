'use client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './blog-detail.module.css';

type Section = { heading: string; body: string; bullets?: string[] };
type Post = {
  slug: string;
  category: string;
  icon: string;
  tint: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  authorBio: string;
  readTime: string;
  date: string;
  sections: Section[];
  takeaway: string;
};

const POSTS: Record<string, Post> = {
  '5-exercises-for-lower-back-pain': {
    slug: '5-exercises-for-lower-back-pain', category: 'Back Pain', icon: 'ri-walk-line', tint: 'sky',
    title: '5 Physiotherapist-Approved Exercises for Lower Back Pain Relief',
    excerpt: 'Lower back pain affects 80% of people. Our senior physiotherapist shares five evidence-based exercises you can do at home for immediate relief.',
    author: 'Dr. Sai Patel', authorRole: 'Senior Physiotherapist',
    authorBio: '15 years treating spine conditions. Trained in McKenzie method and clinical Pilates.',
    readTime: '5 min', date: 'April 28, 2026',
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
    slug: 'understanding-cervical-spondylosis', category: 'Spine Care', icon: 'ri-mental-health-line', tint: 'sand',
    title: 'Understanding Cervical Spondylosis: Causes, Symptoms & Treatment',
    excerpt: 'Neck pain and stiffness are increasingly common in the digital age. Learn how cervical spondylosis develops and how physiotherapy offers long-term relief.',
    author: 'Dr. Anjali Mehta', authorRole: 'Spine Specialist',
    authorBio: 'MPT (Musculoskeletal). Specialist in cervical and lumbar spine rehabilitation.',
    readTime: '7 min', date: 'April 15, 2026',
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
    slug: 'post-stroke-rehabilitation-guide', category: 'Neuro Rehab', icon: 'ri-heart-pulse-line', tint: 'mint',
    title: 'A Complete Guide to Post-Stroke Rehabilitation & Recovery',
    excerpt: 'Stroke recovery is a journey. Our neuro physio team explains the stages of recovery and what to expect from a structured rehabilitation program.',
    author: 'Dr. Rakesh Joshi', authorRole: 'Neuro Physiotherapist',
    authorBio: 'Specializes in stroke and neurological rehabilitation. Bobath-trained.',
    readTime: '8 min', date: 'March 30, 2026',
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
    slug: 'knee-osteoarthritis-management', category: 'Joint Care', icon: 'ri-run-line', tint: 'blush',
    title: 'Managing Knee Osteoarthritis with Physiotherapy — A Patient Guide',
    excerpt: 'Knee osteoarthritis doesn\'t have to mean a lifetime of pain. Learn how targeted physiotherapy can significantly reduce pain and improve function.',
    author: 'Dr. Sai Patel', authorRole: 'Senior Physiotherapist',
    authorBio: '15 years treating spine and joint conditions. Clinical Pilates and movement specialist.',
    readTime: '6 min', date: 'March 15, 2026',
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
    slug: 'sports-injury-prevention-tips', category: 'Sports', icon: 'ri-football-line', tint: 'sky',
    title: '10 Physiotherapist Tips to Prevent Sports Injuries',
    excerpt: 'Prevention is better than cure. Our sports physio experts share essential warm-up, cool-down, and conditioning tips for athletes of all levels.',
    author: 'Dr. Karan Shah', authorRole: 'Sports Physiotherapist',
    authorBio: 'Certified Sports Physiotherapist. Works with state and national-level athletes.',
    readTime: '5 min', date: 'March 1, 2026',
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
    slug: 'frozen-shoulder-treatment', category: 'Shoulder', icon: 'ri-snowy-line', tint: 'lavender',
    title: 'Frozen Shoulder: What It Is and How We Treat It',
    excerpt: 'Adhesive capsulitis affects 2-5% of the population. Discover the stages, symptoms, and physiotherapy treatments that restore full shoulder mobility.',
    author: 'Dr. Anjali Mehta', authorRole: 'Spine & Upper Limb Specialist',
    authorBio: 'MPT (Musculoskeletal). Specialist in cervical, shoulder, and upper limb rehab.',
    readTime: '6 min', date: 'February 20, 2026',
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

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];
  if (!post) notFound();
  const related = Object.values(POSTS).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className={styles.page}>
      <section className={`${styles.hero} ${styles[`tint_${post.tint}`]}`}>
        <div className={styles.heroMesh} />
        <div className="container">
          <Link href="/blog" className={styles.back}>
            <i className="ri-arrow-left-line" /> All Articles
          </Link>
          <span className={styles.cat}>{post.category}</span>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.excerpt}>{post.excerpt}</p>
          <div className={styles.metaRow}>
            <div className={styles.authorRow}>
              <div className={styles.authorAvatar}>
                {post.author.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className={styles.authorName}>{post.author}</p>
                <p className={styles.authorRole}>{post.authorRole}</p>
              </div>
            </div>
            <span className={styles.dot} />
            <span className={styles.metaItem}><i className="ri-calendar-line" /> {post.date}</span>
            <span className={styles.dot} />
            <span className={styles.metaItem}><i className="ri-time-line" /> {post.readTime} read</span>
          </div>
        </div>
      </section>

      <div className="container">
        <div className={`${styles.coverIcon} ${styles[`tintBox_${post.tint}`]}`}>
          <i className={post.icon} />
        </div>
      </div>

      <section className={styles.body}>
        <div className="container">
          <div className={styles.layout}>
            <article className={styles.article}>
              {post.sections.map((s) => (
                <section key={s.heading} className={styles.section} id={slugify(s.heading)}>
                  <h2 className={styles.h2}>{s.heading}</h2>
                  <p className={styles.p}>{s.body}</p>
                  {s.bullets && (
                    <ul className={styles.bullets}>
                      {s.bullets.map((b) => (
                        <li key={b}>
                          <i className="ri-checkbox-circle-fill" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              <div className={styles.takeaway}>
                <span className={styles.takeawayLabel}>Key Takeaway</span>
                <p>{post.takeaway}</p>
              </div>

              <div className={styles.authorBio}>
                <div className={styles.authorAvatarLg}>
                  {post.author.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className={styles.authorBioName}>About {post.author}</p>
                  <p className={styles.authorBioRole}>{post.authorRole}</p>
                  <p className={styles.authorBioText}>{post.authorBio}</p>
                </div>
              </div>
            </article>

            <aside className={styles.sidebar}>
              <div className={styles.sideCard}>
                <h3 className={styles.sideTitle}>Author</h3>
                <div className={styles.authorRow}>
                  <div className={styles.authorAvatar}>
                    {post.author.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className={styles.authorName}>{post.author}</p>
                    <p className={styles.authorRole}>{post.authorRole}</p>
                  </div>
                </div>
              </div>

              <div className={styles.sideCard}>
                <h3 className={styles.sideTitle}>Share</h3>
                <div className={styles.shareRow}>
                  <button type="button" className={styles.shareBtn} aria-label="Share on X"><i className="ri-twitter-x-line" /></button>
                  <button type="button" className={styles.shareBtn} aria-label="Share on Facebook"><i className="ri-facebook-circle-line" /></button>
                  <button type="button" className={styles.shareBtn} aria-label="Share on LinkedIn"><i className="ri-linkedin-line" /></button>
                  <button type="button" className={styles.shareBtn} aria-label="Copy link"><i className="ri-link-m" /></button>
                </div>
              </div>

              <div className={styles.sideCard}>
                <h3 className={styles.sideTitle}>Contents</h3>
                <ul className={styles.toc}>
                  {post.sections.map((s) => (
                    <li key={s.heading}>
                      <a href={`#${slugify(s.heading)}`}>
                        <i className="ri-arrow-right-s-line" /> {s.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/book-appointment" className={styles.bookCta}>
                Book Consultation <i className="ri-arrow-right-line" />
              </Link>
            </aside>
          </div>

          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>More Articles</h2>
            <div className={styles.relatedGrid}>
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className={styles.relatedCard}>
                  <div className={`${styles.relCover} ${styles[`tint_${p.tint}`]}`}>
                    <i className={p.icon} />
                  </div>
                  <div className={styles.relBody}>
                    <span className={styles.relCat}>{p.category}</span>
                    <h3 className={styles.relCardTitle}>{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
