import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './mobile-app.module.css';

export const metadata: Metadata = {
  title: 'SAI Physio App — Book Appointments, Video Consults & Track Recovery',
  description:
    'Download the SAI Physiotherapy mobile app. Book appointments, consult on video, get prescriptions, view reports and pay — all from your phone. Free on Android & iOS.',
};

const APP_STATS = [
  { num: '50K+', label: 'Downloads', icon: 'ri-download-cloud-2-line' },
  { num: '18K+', label: 'Active Users', icon: 'ri-user-heart-line' },
  { num: '4.8', label: 'App Rating', icon: 'ri-star-smile-line' },
  { num: '3', label: 'Languages', icon: 'ri-translate-2' },
];

const FEATURES = [
  {
    icon: 'ri-calendar-check-line',
    title: 'Appointment Booking',
    desc: 'Book an in-clinic visit in three taps. Pick your doctor, slot and pay — done.',
    tint: 'sky',
  },
  {
    icon: 'ri-video-chat-line',
    title: 'Video Consultation',
    desc: 'Talk to our physiotherapists over a secure HD video call from anywhere in India.',
    tint: 'mint',
  },
  {
    icon: 'ri-file-list-3-line',
    title: 'Digital Prescriptions',
    desc: 'Get e-prescriptions instantly with dosage, exercises and review dates — never lose one again.',
    tint: 'peach',
  },
  {
    icon: 'ri-folder-chart-line',
    title: 'Reports & Records',
    desc: 'MRI, X-rays, SOAP notes and recovery charts — your full medical timeline in one place.',
    tint: 'lavender',
  },
  {
    icon: 'ri-notification-3-line',
    title: 'Smart Reminders',
    desc: 'Appointment alerts, exercise nudges and medication reminders so nothing slips.',
    tint: 'yellow',
  },
  {
    icon: 'ri-bank-card-line',
    title: 'UPI Payments',
    desc: 'Pay invoices with UPI, cards or net-banking. Receipts mailed to you automatically.',
    tint: 'rose',
  },
  {
    icon: 'ri-run-line',
    title: 'Home Exercises',
    desc: 'Video-guided exercise plans personalised by your therapist with daily progress tracking.',
    tint: 'mint',
  },
  {
    icon: 'ri-shield-check-line',
    title: 'Private & Secure',
    desc: 'End-to-end encryption, OTP login and DISHA-aligned data handling. Your records, your control.',
    tint: 'sky',
  },
];

const LOVE_REASONS = [
  { icon: 'ri-time-line', title: 'Save 2+ hours per visit', desc: 'No queues, no paperwork. Walk in at your slot and walk out faster.' },
  { icon: 'ri-stethoscope-line', title: 'Talk to a physio in 15 minutes', desc: 'On-demand video consults during clinic hours — average response 12 mins.' },
  { icon: 'ri-translate', title: 'Works in Gujarati, Hindi & English', desc: 'Switch the entire app to your preferred language with one tap.' },
  { icon: 'ri-medal-line', title: 'Trusted by 18,000+ Gujarati families', desc: 'From Ahmedabad to Surat and Rajkot — patients rate us 4.8 on Play Store.' },
];

const TESTIMONIALS = [
  {
    name: 'Rakesh Patel',
    role: 'Bopal, Ahmedabad',
    avatar: 'RP',
    rating: 5,
    quote:
      'Booking my father\'s paralysis follow-up used to take phone calls and waiting. With the app, I picked Dr. Mehta\'s slot in 30 seconds. Game changer for our family.',
  },
  {
    name: 'Priya Shah',
    role: 'Navrangpura',
    avatar: 'PS',
    rating: 5,
    quote:
      'The video consultation feature saved my back during pregnancy — I could speak to my physio from home. Exercise videos in Gujarati were a lovely touch.',
  },
  {
    name: 'Hardik Joshi',
    role: 'Vastrapur',
    avatar: 'HJ',
    rating: 5,
    quote:
      'After my ACL surgery I needed weekly tracking. The recovery charts in the app kept me motivated — went from 20% to 95% in 14 weeks.',
  },
  {
    name: 'Meera Desai',
    role: 'Satellite',
    avatar: 'MD',
    rating: 4,
    quote:
      'UPI payment and instant e-receipt is so convenient. My mother-in-law uses it in Gujarati without anyone\'s help. Truly built for Indian families.',
  },
];

const FAQS = [
  {
    q: 'Is the SAI Physiotherapy app free to download?',
    a: 'Yes — the app is completely free on the Google Play Store and Apple App Store. You only pay for the consultations or treatments you book.',
  },
  {
    q: 'Which phones are supported?',
    a: 'Any Android phone running version 8.0 (Oreo) or above, and any iPhone on iOS 14 or above. The app works smoothly on most devices sold in India in the last 5 years.',
  },
  {
    q: 'Can I consult a physiotherapist over video?',
    a: 'Yes. Video consultations are available during clinic hours (Mon-Sat, 8 AM to 9 PM IST). Choose "Video Consult" while booking — slots are typically available the same day.',
  },
  {
    q: 'How is my medical data protected?',
    a: 'All your records are encrypted in transit and at rest. We follow DISHA (Digital Information Security in Healthcare Act) guidelines and never share data with third parties for marketing.',
  },
  {
    q: 'Do you accept UPI and Indian payment methods?',
    a: 'Absolutely. We support UPI (Google Pay, PhonePe, Paytm, BHIM), all major debit and credit cards, net-banking, and the option to pay at the clinic with cash.',
  },
  {
    q: 'Can family members manage my appointments?',
    a: 'Yes — you can add up to 5 family profiles under one account. Perfect for managing care for elderly parents or children from a single login.',
  },
  {
    q: 'What if I face a problem with the app?',
    a: 'Tap "Help & Support" inside the app to chat with our team or call +91 99999 99999 between 9 AM and 8 PM. We typically reply within an hour.',
  },
];

const DOWNLOAD_CTA = {
  play: 'https://play.google.com/store',
  appstore: 'https://www.apple.com/in/app-store/',
};

function Stars({ count }: { count: number }) {
  return (
    <span className={styles.stars} aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <i key={i} className={i < count ? 'ri-star-fill' : 'ri-star-line'} />
      ))}
    </span>
  );
}

function PhoneMockup({ variant = 'home' }: { variant?: 'home' | 'consult' | 'progress' }) {
  return (
    <div className={`${styles.phone} ${styles[`phone_${variant}`]}`}>
      <div className={styles.phoneNotch} />
      <div className={styles.phoneScreen}>
        {variant === 'home' && (
          <>
            <div className={styles.phoneStatus}>
              <span>9:41</span>
              <span className={styles.phoneStatusIcons}>
                <i className="ri-signal-wifi-line" />
                <i className="ri-battery-fill" />
              </span>
            </div>
            <div className={styles.phoneHeader}>
              <div>
                <p className={styles.phoneGreet}>Namaste,</p>
                <p className={styles.phoneName}>Priya Shah</p>
              </div>
              <div className={styles.phoneAvatar}>PS</div>
            </div>
            <div className={styles.phoneCard + ' ' + styles.phoneCardCta}>
              <div>
                <p className={styles.phoneCardLabel}>Next appointment</p>
                <p className={styles.phoneCardTitle}>Dr. Anjali Mehta</p>
                <p className={styles.phoneCardSub}>Tomorrow · 10:30 AM</p>
              </div>
              <i className={`${styles.phoneCardIcon} ri-calendar-event-line`} />
            </div>
            <p className={styles.phoneSection}>Quick actions</p>
            <div className={styles.phoneGrid}>
              {[
                { i: 'ri-calendar-check-line', t: 'Book' },
                { i: 'ri-video-chat-line', t: 'Consult' },
                { i: 'ri-file-list-3-line', t: 'Reports' },
                { i: 'ri-bank-card-line', t: 'Pay' },
              ].map((q) => (
                <div key={q.t} className={styles.phoneTile}>
                  <i className={q.i} />
                  <span>{q.t}</span>
                </div>
              ))}
            </div>
            <p className={styles.phoneSection}>Today&apos;s exercises</p>
            <div className={styles.phoneList}>
              {[
                { t: 'Neck rotations', s: '3 sets · 10 reps', done: true },
                { t: 'Hamstring stretch', s: '2 sets · 30 sec', done: false },
              ].map((e) => (
                <div key={e.t} className={styles.phoneRow}>
                  <span className={`${styles.phoneCheck} ${e.done ? styles.phoneCheckDone : ''}`}>
                    {e.done && <i className="ri-check-line" />}
                  </span>
                  <div className={styles.phoneRowText}>
                    <p>{e.t}</p>
                    <p>{e.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {variant === 'consult' && (
          <>
            <div className={styles.phoneStatus}>
              <span>9:41</span>
              <span className={styles.phoneStatusIcons}>
                <i className="ri-signal-wifi-line" />
                <i className="ri-battery-fill" />
              </span>
            </div>
            <p className={styles.phoneConsultLabel}>Video Consultation · Live</p>
            <div className={styles.phoneVideo}>
              <div className={styles.phoneVideoMain}>
                <i className="ri-user-smile-line" />
                <span className={styles.phoneVideoName}>Dr. Anjali Mehta</span>
              </div>
              <div className={styles.phoneVideoSelf}>You</div>
              <div className={styles.phoneVideoTimer}>
                <span className={styles.phoneRecDot} /> 12:46
              </div>
            </div>
            <div className={styles.phoneControls}>
              <button className={styles.phoneCtrl}><i className="ri-mic-line" /></button>
              <button className={styles.phoneCtrl}><i className="ri-vidicon-line" /></button>
              <button className={`${styles.phoneCtrl} ${styles.phoneCtrlEnd}`}><i className="ri-phone-fill" /></button>
              <button className={styles.phoneCtrl}><i className="ri-chat-3-line" /></button>
            </div>
            <div className={styles.phoneNote}>
              <p className={styles.phoneNoteTitle}>Quick note from Dr. Mehta</p>
              <p className={styles.phoneNoteText}>
                Continue hamstring stretches twice daily. Switching to TENS therapy next week.
              </p>
            </div>
          </>
        )}

        {variant === 'progress' && (
          <>
            <div className={styles.phoneStatus}>
              <span>9:41</span>
              <span className={styles.phoneStatusIcons}>
                <i className="ri-signal-wifi-line" />
                <i className="ri-battery-fill" />
              </span>
            </div>
            <p className={styles.phoneSection}>Recovery progress</p>
            <div className={styles.phoneProgressRing}>
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" />
                <circle cx="50" cy="50" r="42" className={styles.phoneRingFg} />
              </svg>
              <div className={styles.phoneRingValue}>
                <span>78%</span>
                <small>Recovered</small>
              </div>
            </div>
            <div className={styles.phoneStatsRow}>
              <div className={styles.phoneStat}>
                <p>14</p>
                <span>Sessions</span>
              </div>
              <div className={styles.phoneStat}>
                <p>92%</p>
                <span>Adherence</span>
              </div>
              <div className={styles.phoneStat}>
                <p>4</p>
                <span>Weeks left</span>
              </div>
            </div>
            <div className={styles.phoneChart}>
              {[40, 55, 48, 62, 70, 68, 78].map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MobileAppPage() {
  return (
    <div className={styles.page}>
      {/* ── Hero (canonical centered header) ─────────────────────────── */}
      <section className={styles.hero}>
        <div className={`${styles.heroMesh} hero-aura`} aria-hidden />
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>SAI Physio App</p>
          <h1 className={styles.heroTitle}>
            Your recovery, <span className="gradient-text">in your pocket.</span>
          </h1>
          <p className={styles.heroDesc}>
            Book appointments, consult on video, follow guided exercises and pay your bills —
            all in one secure app, designed for Gujarati families and the way you actually live.
          </p>

          <div className={styles.heroDownloads}>
            <a href={DOWNLOAD_CTA.play} target="_blank" rel="noopener noreferrer" className={styles.storeBtn}>
              <i className="ri-google-play-fill" />
              <span>
                <small>GET IT ON</small>
                <strong>Google Play</strong>
              </span>
            </a>
            <a href={DOWNLOAD_CTA.appstore} target="_blank" rel="noopener noreferrer" className={styles.storeBtn}>
              <i className="ri-apple-fill" />
              <span>
                <small>Download on the</small>
                <strong>App Store</strong>
              </span>
            </a>
          </div>

          <div className={styles.heroProof}>
            <div className={styles.heroProofAvatars}>
              {['RP', 'PS', 'HJ', 'MD'].map((a) => (
                <span key={a} className={styles.heroProofAvatar}>{a}</span>
              ))}
            </div>
            <div>
              <Stars count={5} />
              <p>Rated <strong>4.8 / 5</strong> by 18,000+ patients across Gujarat</p>
            </div>
          </div>

          <div className={styles.heroPhones} aria-hidden>
            <div className={styles.heroPhoneBack}><PhoneMockup variant="progress" /></div>
            <div className={styles.heroPhoneFront}><PhoneMockup variant="home" /></div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            {APP_STATS.map((s) => (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statIcon}>
                  <i className={s.icon} />
                </div>
                <div>
                  <p className={styles.statNum}>{s.num}</p>
                  <p className={styles.statLabel}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Everything in one app</p>
            <h2 className="section-title">
              Built for <span>real Indian clinics</span>, not generic templates
            </h2>
            <p className="section-desc">
              Each feature was shaped by feedback from 12+ doctors and 1,000+ patients at our
              Ahmedabad clinic. No bloat, no jargon — just the tools you actually use.
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <article key={f.title} className={`${styles.featureCard} ${styles[`tint_${f.tint}`]}`}>
                <div className={styles.featureIcon}>
                  <i className={f.icon} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Book in Seconds ─────────────────────────────────────────── */}
      <section className={`section ${styles.sectionAlt}`}>
        <div className="container">
          <div className={styles.split}>
            <div className={styles.splitText}>
              <p className="section-label">Book appointments in seconds</p>
              <h2 className={styles.splitTitle}>From symptom to slot in three taps</h2>
              <p className={styles.splitDesc}>
                No phone calls. No waiting on hold. Pick your specialist, choose a slot that fits
                your day and confirm — your appointment is locked in instantly with a UPI payment
                option built right in.
              </p>
              <ul className={styles.splitList}>
                {[
                  { i: 'ri-user-search-line', t: 'Filter doctors by speciality, language and rating' },
                  { i: 'ri-calendar-2-line', t: 'See live slot availability — including evenings and weekends' },
                  { i: 'ri-secure-payment-line', t: 'Pay with UPI or card — receipts emailed instantly' },
                  { i: 'ri-pulse-line', t: 'Get an SMS, WhatsApp and email confirmation' },
                ].map((p) => (
                  <li key={p.t}>
                    <i className={p.i} />
                    <span>{p.t}</span>
                  </li>
                ))}
              </ul>
              <Link href="/book-appointment" className={styles.btnPrimary}>
                Try it now <i className="ri-arrow-right-line" />
              </Link>
            </div>
            <div className={styles.splitPhone}>
              <PhoneMockup variant="home" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Manage Health Anywhere ──────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className={`${styles.split} ${styles.splitReverse}`}>
            <div className={styles.splitPhone}>
              <PhoneMockup variant="consult" />
            </div>
            <div className={styles.splitText}>
              <p className="section-label">Manage your health anywhere</p>
              <h2 className={styles.splitTitle}>
                One app for your entire family&apos;s recovery
              </h2>
              <p className={styles.splitDesc}>
                Add up to five family members. Track your father&apos;s paralysis rehab, your
                child&apos;s posture plan and your own back-pain sessions — all from a single login,
                without juggling phone calls and paperwork.
              </p>
              <ul className={styles.splitList}>
                {[
                  { i: 'ri-group-line', t: 'Family profiles — up to 5 members per account' },
                  { i: 'ri-video-on-line', t: 'HD video consults that work even on 4G' },
                  { i: 'ri-file-shield-2-line', t: 'Encrypted records, exportable as PDF anytime' },
                  { i: 'ri-translate-2', t: 'Switch interface to Gujarati, Hindi or English' },
                ].map((p) => (
                  <li key={p.t}>
                    <i className={p.i} />
                    <span>{p.t}</span>
                  </li>
                ))}
              </ul>
              <Link href="/contact" className={styles.btnSecondary}>
                Talk to our team <i className="ri-arrow-right-line" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why patients love ──────────────────────────────────────── */}
      <section className={`section ${styles.sectionLove}`}>
        <div className="container">
          <div className="section-header">
            <p className="section-label">Why patients love our app</p>
            <h2 className="section-title">
              Designed around <span>your life</span>, not our clinic&apos;s
            </h2>
            <p className="section-desc">
              Real numbers from real patients across Ahmedabad, Surat and Rajkot — measured over
              the last 12 months.
            </p>
          </div>

          <div className={styles.loveShowcase}>
            {/* Left: dark phone showcase with floating chips */}
            <div className={styles.loveStage}>
              <div className={styles.loveStageOrb} aria-hidden />
              <div className={styles.loveStageOrbAlt} aria-hidden />

              <div className={styles.loveStagePhone}>
                <PhoneMockup variant="progress" />
              </div>

              <div className={`${styles.loveChip} ${styles.loveChipTop}`} aria-hidden>
                <span className={styles.loveChipDot} />
                <div>
                  <p>92%</p>
                  <small>Avg. recovery</small>
                </div>
              </div>

              <div className={`${styles.loveChip} ${styles.loveChipMid}`} aria-hidden>
                <i className="ri-star-fill" />
                <div>
                  <p>4.8 / 5</p>
                  <small>18K+ ratings</small>
                </div>
              </div>

              <div className={`${styles.loveChip} ${styles.loveChipBot}`} aria-hidden>
                <i className="ri-time-line" />
                <div>
                  <p>12 min</p>
                  <small>Avg. consult wait</small>
                </div>
              </div>
            </div>

            {/* Right: numbered reason stack */}
            <ol className={styles.loveList}>
              {LOVE_REASONS.map((r, i) => (
                <li key={r.title} className={styles.loveItem}>
                  <span className={styles.loveNum}>{String(i + 1).padStart(2, '0')}</span>
                  <div className={styles.loveBody}>
                    <div className={styles.loveItemHead}>
                      <i className={r.icon} />
                      <h3>{r.title}</h3>
                    </div>
                    <p>{r.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Patient stories</p>
            <h2 className="section-title">
              Loved by <span>18,000+ families</span> across Gujarat
            </h2>
          </div>
          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map((t) => (
              <article key={t.name} className={styles.testimonial}>
                <Stars count={t.rating} />
                <p className={styles.testimonialQuote}>“{t.quote}”</p>
                <div className={styles.testimonialFoot}>
                  <span className={styles.testimonialAvatar}>{t.avatar}</span>
                  <div>
                    <p className={styles.testimonialName}>{t.name}</p>
                    <p className={styles.testimonialRole}>{t.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section className={`section ${styles.sectionAlt}`}>
        <div className="container">
          <div className="section-header">
            <p className="section-label">FAQ</p>
            <h2 className="section-title">
              Quick answers about <span>our app</span>
            </h2>
          </div>
          <div className={styles.faqList}>
            {FAQS.map((f) => (
              <details key={f.q} className={styles.faqItem}>
                <summary>
                  <span>{f.q}</span>
                  <i className="ri-add-line" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────── */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaTitle}>
                Start your recovery today
              </h2>
              <p className={styles.ctaDesc}>
                Free to download. No subscription. Pay only for the consultations you book.
              </p>
              <div className={styles.heroDownloads}>
                <a href={DOWNLOAD_CTA.play} target="_blank" rel="noopener noreferrer" className={styles.storeBtnLight}>
                  <i className="ri-google-play-fill" />
                  <span>
                    <small>GET IT ON</small>
                    <strong>Google Play</strong>
                  </span>
                </a>
                <a href={DOWNLOAD_CTA.appstore} target="_blank" rel="noopener noreferrer" className={styles.storeBtnLight}>
                  <i className="ri-apple-fill" />
                  <span>
                    <small>Download on the</small>
                    <strong>App Store</strong>
                  </span>
                </a>
              </div>
              <p className={styles.ctaFine}>
                <i className="ri-shield-check-line" /> DISHA-aligned · End-to-end encrypted · 4.8★ on Play Store
              </p>
            </div>
            <div className={styles.ctaPhoneWrap} aria-hidden>
              <PhoneMockup variant="home" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
