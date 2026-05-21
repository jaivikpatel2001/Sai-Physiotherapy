'use client';
import { useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import styles from './ServicesSection.module.css';
import type { CmsService } from '@/lib/cms';

interface ServiceCard {
  icon: string;
  title: string;
  slug: string;
  desc: string;
  sessions: string;
  surface: string;
  image: string;
}

const FALLBACK_SERVICES: ServiceCard[] = [
  { icon: 'ri-walk-line', title: 'Back Pain Treatment', slug: 'back-pain-treatment', desc: 'Evidence-based recovery from acute and chronic back pain.', sessions: '8-12 sessions', surface: 'sand', image: '/images/therapy/back_pain_treatment.png' },
  { icon: 'ri-mental-health-line', title: 'Spine Care & Disc', slug: 'spine-care-disc-problems', desc: 'Specialised treatment for disc and spine conditions.', sessions: '10-14 sessions', surface: 'sky', image: '/images/therapy/therapy_spine_treatment.png' },
  { icon: 'ri-heart-pulse-line', title: 'Paralysis Rehabilitation', slug: 'paralysis-rehabilitation', desc: 'Stroke and spinal injury rehab programs.', sessions: '12-24 weeks', surface: 'mint', image: '/images/therapy/therapy_neuro_rehab.png' },
  { icon: 'ri-run-line', title: 'Knee & Joint Care', slug: 'knee-pain-joint-care', desc: 'Pain relief, ligament and post-op rehab.', sessions: '6-10 sessions', surface: 'blush', image: '/images/therapy/therapy_knee_joint.png' },
  { icon: 'ri-football-line', title: 'Sports Injury Rehab', slug: 'sports-injury-rehabilitation', desc: 'Performance-driven recovery for athletes.', sessions: '4-8 weeks', surface: 'sand', image: '/images/therapy/therapy_sports_rehab.png' },
  { icon: 'ri-flashlight-line', title: 'Neuro Physiotherapy', slug: 'neuro-physiotherapy', desc: 'Specialised neuro-rehab care across conditions.', sessions: '12+ weeks', surface: 'lavender', image: '/images/therapy/therapy_pediatric.png' },
];

const SURFACE_CYCLE = ['sand', 'sky', 'mint', 'blush', 'lavender'] as const;
const ICON_CYCLE = ['ri-walk-line', 'ri-mental-health-line', 'ri-heart-pulse-line', 'ri-run-line', 'ri-football-line', 'ri-flashlight-line'];
const PLACEHOLDER_IMAGE = '/images/therapy/back_pain_treatment.png';

function fromCms(services: CmsService[]): ServiceCard[] {
  return services.map((s, i) => ({
    icon: ICON_CYCLE[i % ICON_CYCLE.length],
    title: s.name,
    slug: s.slug,
    desc: s.shortDescription,
    sessions: s.duration,
    surface: SURFACE_CYCLE[i % SURFACE_CYCLE.length],
    image: s.bannerImage || PLACEHOLDER_IMAGE,
  }));
}

const SURFACE_CLASS: Record<string, string> = {
  sky: styles.surfaceSky,
  mint: styles.surfaceMint,
  blush: styles.surfaceBlush,
  sand: styles.surfaceSand,
  lavender: styles.surfaceLavender,
};

interface Props {
  services?: CmsService[] | null;
}

export default function ServicesSection({ services }: Props = {}) {
  const SERVICES = useMemo(
    () => (services && services.length > 0 ? fromCms(services).slice(0, 6) : FALLBACK_SERVICES),
    [services],
  );
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        <div className="section-header">
          <motion.span className="section-label" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
            Our Specializations
          </motion.span>
          <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.08 }}>
            12+ <span>Specialized</span> Treatment Areas
          </motion.h2>
          <motion.p className="section-desc" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.16 }}>
            From acute injuries to chronic conditions, our expert physiotherapists deliver
            evidence-based treatments tailored to your unique recovery journey.
          </motion.p>
        </div>

        <div className={styles.bento}>
          {SERVICES.map((svc, i) => (
            <motion.div
              key={svc.slug}
              className={`${styles.card} ${SURFACE_CLASS[svc.surface]}`}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.05 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/services/${svc.slug}`} className={styles.cardLink}>
                <div className={styles.cardMedia}>
                  <Image
                    src={svc.image}
                    alt={svc.title}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 32vw"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className={styles.cardMediaOverlay} />
                  <div className={styles.cardIcon}>
                    <i className={svc.icon} style={{ fontSize: 22 }} />
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{svc.title}</h3>
                  <p className={styles.cardDesc}>{svc.desc}</p>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.recoveryChip}>
                    <i className="ri-time-line" style={{ fontSize: 12 }} /> {svc.sessions}
                  </span>
                  <span className={styles.learnMore}>
                    Learn more <i className="ri-arrow-right-line" style={{ fontSize: 14 }} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div className={styles.viewAll} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4, duration: 0.5 }}>
          <Link href="/services" className={styles.viewAllBtn}>
            Explore All 12 Treatments <i className="ri-arrow-right-line" style={{ fontSize: 18 }} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
