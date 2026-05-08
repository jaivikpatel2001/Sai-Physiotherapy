import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Clock, Phone, Calendar, ArrowLeft, Star } from 'lucide-react';
import styles from './service-detail.module.css';

const SERVICES: Record<string, {
  icon: string; title: string; category: string; price: string; sessions: string;
  desc: string; longDesc: string; benefits: string[]; conditions: string[];
  process: { step: string; title: string; desc: string }[];
  faq: { q: string; a: string }[];
}> = {
  'back-pain-treatment': {
    icon: '🦴', title: 'Back Pain Treatment', category: 'Spine & Back',
    price: '₹500 – ₹2,000', sessions: '8–12 sessions',
    desc: 'Expert treatment for all types of back pain using advanced physiotherapy techniques.',
    longDesc: 'Back pain is one of the most common musculoskeletal complaints, affecting people of all ages. At SAI Physiotherapy, our expert team uses a combination of manual therapy, electrotherapy, and targeted exercises to address the root cause of your pain — not just the symptoms.',
    benefits: ['Complete pain relief without surgery', 'Improved spinal mobility & flexibility', 'Strengthened core and back muscles', 'Corrected posture and body mechanics', 'Long-term relapse prevention plan', 'Improved quality of life and sleep'],
    conditions: ['Lumbar disc herniation', 'Sciatica', 'Muscle strain/sprain', 'Spondylosis', 'Facet joint pain', 'Sacroiliac joint dysfunction'],
    process: [
      { step: '01', title: 'Assessment', desc: 'Comprehensive evaluation of your spine, posture, and movement patterns to identify the root cause.' },
      { step: '02', title: 'Treatment Plan', desc: 'A personalized protocol combining manual therapy, electrotherapy, and specific exercises.' },
      { step: '03', title: 'Active Rehabilitation', desc: 'Progressive strengthening and mobility exercises to rebuild your back health.' },
      { step: '04', title: 'Home Program', desc: 'A tailored home exercise program to maintain your results and prevent recurrence.' },
    ],
    faq: [
      { q: 'How many sessions will I need?', a: 'Most patients see significant improvement within 6–8 sessions. The total number depends on the severity and chronicity of your condition.' },
      { q: 'Can physiotherapy replace surgery?', a: 'In many cases, yes. Studies show that physiotherapy is as effective as surgery for many back conditions. Our team will guide you on the best course of action.' },
      { q: 'Do I need a doctor\'s referral?', a: 'No referral is needed. You can book directly with our physiotherapists for an initial assessment.' },
    ],
  },
  'spine-care-disc-problems': {
    icon: '🧠', title: 'Spine Care & Disc Problems', category: 'Spine & Back',
    price: '₹800 – ₹3,000', sessions: '10–15 sessions',
    desc: 'Specialized treatment for disc herniation, spondylosis, and spinal conditions.',
    longDesc: 'Spinal disc problems can cause debilitating pain and limit daily activities. Our spine specialists use advanced techniques including spinal traction, McKenzie method, and manual therapy to decompress affected discs and restore normal spinal function.',
    benefits: ['Disc decompression without surgery', 'Reduced nerve compression and pain', 'Restored spinal mobility', 'Improved posture and alignment', 'Prevention of further disc damage', 'Return to normal daily activities'],
    conditions: ['Disc herniation', 'Disc bulge', 'Degenerative disc disease', 'Spinal stenosis', 'Spondylolisthesis', 'Cervical & lumbar spondylosis'],
    process: [
      { step: '01', title: 'Spinal Assessment', desc: 'Detailed neurological and orthopedic assessment to identify the affected disc and nerve involvement.' },
      { step: '02', title: 'Decompression Therapy', desc: 'Mechanical traction and manual techniques to relieve pressure on the affected disc.' },
      { step: '03', title: 'Stabilization Exercises', desc: 'Progressive core strengthening to support the spine and prevent recurrence.' },
      { step: '04', title: 'Maintenance Program', desc: 'Ongoing exercises and lifestyle advice to maintain a healthy spine long-term.' },
    ],
    faq: [
      { q: 'Is disc herniation curable without surgery?', a: 'Yes, in 90% of cases disc herniation resolves with proper physiotherapy over 6–12 weeks.' },
      { q: 'Will traction therapy hurt?', a: 'Traction is generally comfortable and many patients find it relieving. Our therapists carefully control the force applied.' },
      { q: 'How soon can I return to work?', a: 'Most patients with desk jobs can return to work within 2–3 weeks with modifications.' },
    ],
  },
};

// Fallback for slugs not explicitly defined
function getServiceData(slug: string) {
  return SERVICES[slug] ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const svc = getServiceData(params.slug);
  if (!svc) return { title: 'Service Not Found' };
  return {
    title: `${svc.title} in Ahmedabad | SAI Physiotherapy`,
    description: svc.desc,
  };
}

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const svc = getServiceData(params.slug);
  if (!svc) notFound();

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className="container">
          <Link href="/services" className={styles.back}>
            <ArrowLeft size={16} /> All Services
          </Link>
          <div className={styles.heroContent}>
            <div>
              <span className={styles.category}>{svc.category}</span>
              <h1 className={styles.title}>{svc.title}</h1>
              <p className={styles.desc}>{svc.longDesc}</p>
              <div className={styles.meta}>
                <div className={styles.metaItem}>
                  <Clock size={16} />
                  <span>{svc.sessions}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.priceLabel}>Starting from</span>
                  <span className={styles.price}>{svc.price}</span>
                </div>
              </div>
              <div className={styles.heroCtas}>
                <Link href="/book-appointment" className={styles.bookBtn}>
                  <Calendar size={18} /> Book Appointment
                </Link>
                <a href="tel:+919999999999" className={styles.callBtn}>
                  <Phone size={18} /> Call Now
                </a>
              </div>
            </div>
            <div className={styles.heroIcon}>{svc.icon}</div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Main Content */}
          <main className={styles.main}>
            {/* Benefits */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>What You&apos;ll Achieve</h2>
              <div className={styles.benefitsGrid}>
                {svc.benefits.map((b) => (
                  <div key={b} className={styles.benefitItem}>
                    <CheckCircle2 size={18} className={styles.checkIcon} />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Conditions Treated */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Conditions We Treat</h2>
              <div className={styles.conditionsTags}>
                {svc.conditions.map((c) => (
                  <span key={c} className={styles.conditionTag}>{c}</span>
                ))}
              </div>
            </section>

            {/* Process */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Our Treatment Process</h2>
              <div className={styles.process}>
                {svc.process.map((p) => (
                  <div key={p.step} className={styles.processStep}>
                    <div className={styles.stepNum}>{p.step}</div>
                    <div>
                      <h3 className={styles.stepTitle}>{p.title}</h3>
                      <p className={styles.stepDesc}>{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
              <div className={styles.faq}>
                {svc.faq.map((item) => (
                  <div key={item.q} className={styles.faqItem}>
                    <h3 className={styles.faqQ}>{item.q}</h3>
                    <p className={styles.faqA}>{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.bookingCard}>
              <h3>Book Your Session</h3>
              <div className={styles.cardMeta}>
                <div className={styles.cardMetaItem}>
                  <Clock size={14} /> {svc.sessions}
                </div>
                <div className={styles.cardPrice}>{svc.price}</div>
              </div>
              <Link href="/book-appointment" className={styles.bookNow}>
                Book Appointment →
              </Link>
              <a href="tel:+919999999999" className={styles.callNow}>
                <Phone size={16} /> Call: +91 99999 99999
              </a>
              <div className={styles.guarantee}>
                <Star size={16} className={styles.starIcon} />
                <p>4.9★ rated service · Free assessment call available</p>
              </div>
            </div>

            <div className={styles.relatedCard}>
              <h3>Related Services</h3>
              <div className={styles.relatedList}>
                {['Back Pain Treatment', 'Spine Care', 'Neuro Physiotherapy'].map((s) => (
                  <Link key={s} href="/services" className={styles.relatedItem}>
                    → {s}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
