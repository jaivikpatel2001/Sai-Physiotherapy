'use client';
import { useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import styles from './service-detail.module.css';

const SERVICES: Record<string, {
  icon: string; title: string; category: string; price: string; sessions: string;
  desc: string; longDesc: string; benefits: string[]; conditions: string[];
  process: { step: string; title: string; desc: string }[];
  faq: { q: string; a: string }[];
  recoveryTime: string; successRate: string;
}> = {
  'back-pain-treatment': {
    icon: 'ri-walk-line', title: 'Back Pain Treatment', category: 'Spine & Back',
    price: '₹500 – ₹2,000', sessions: '8–12 sessions',
    recoveryTime: '4–8 weeks', successRate: '95%',
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
    icon: 'ri-mental-health-line', title: 'Spine Care & Disc Problems', category: 'Spine & Back',
    price: '₹800 – ₹3,000', sessions: '10–15 sessions',
    recoveryTime: '6–12 weeks', successRate: '92%',
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
  'paralysis-rehabilitation': {
    icon: 'ri-heart-pulse-line', title: 'Paralysis Rehabilitation', category: 'Neuro Rehab',
    price: '₹1,000 – ₹4,000', sessions: '20–30 sessions',
    recoveryTime: '3–6 months', successRate: '85%',
    desc: 'Comprehensive rehabilitation program for stroke, spinal cord injury, and other paralytic conditions.',
    longDesc: 'Recovering from paralysis requires a structured, intensive rehabilitation approach. Our neuro physiotherapy team uses task-specific training, neuromuscular electrical stimulation, gait training, and functional retraining to help patients regain maximum independence after stroke, spinal cord injury, or peripheral nerve damage.',
    benefits: ['Restored muscle strength and tone', 'Improved gait and balance', 'Greater daily-activity independence', 'Activation of neuroplasticity', 'Reduced spasticity and contractures', 'Family caregiver training included'],
    conditions: ['Stroke / hemiplegia', 'Spinal cord injury', 'Bell\'s palsy', 'Guillain-Barré syndrome', 'Peripheral nerve injuries', 'Post-polio syndrome'],
    process: [
      { step: '01', title: 'Neurological Assessment', desc: 'Detailed evaluation of motor function, tone, sensation, and functional capacity.' },
      { step: '02', title: 'Goal-Oriented Plan', desc: 'Patient-centered goals with measurable functional milestones at every stage.' },
      { step: '03', title: 'Intensive Therapy', desc: 'Multi-modal sessions combining manual facilitation, NMES, and task-specific training.' },
      { step: '04', title: 'Community Reintegration', desc: 'Home and community training to ensure lasting independence and quality of life.' },
    ],
    faq: [
      { q: 'How long is the recovery?', a: 'Recovery is highly individual. Most patients see meaningful gains within 3–6 months of consistent rehabilitation.' },
      { q: 'Can a patient regain full mobility?', a: 'Outcomes depend on the cause and severity. Early intervention significantly improves the chances of substantial recovery.' },
      { q: 'Do you offer home visits?', a: 'Yes, home physiotherapy is available for patients unable to travel during the early stages of recovery.' },
    ],
  },
  'knee-pain-joint-care': {
    icon: 'ri-run-line', title: 'Knee Pain & Joint Care', category: 'Orthopedics',
    price: '₹600 – ₹2,500', sessions: '8–15 sessions',
    recoveryTime: '4–10 weeks', successRate: '93%',
    desc: 'Effective treatment for knee pain, osteoarthritis, ligament injuries, and post-surgical rehabilitation.',
    longDesc: 'Knee pain can significantly affect your mobility and quality of life. Our specialists use evidence-based techniques including manual therapy, targeted strengthening, taping, and joint mobilization to address the underlying cause — whether it\'s arthritis, ligament injury, or post-surgical stiffness.',
    benefits: ['Reduced joint pain and inflammation', 'Improved range of motion', 'Strengthened supporting muscles', 'Delayed need for surgery', 'Better walking and stair climbing', 'Return to recreational activities'],
    conditions: ['Knee osteoarthritis', 'ACL/MCL/PCL injuries', 'Meniscus tears', 'Patellofemoral pain syndrome', 'Post-knee replacement', 'Runner\'s knee'],
    process: [
      { step: '01', title: 'Functional Assessment', desc: 'Biomechanical analysis of gait, knee alignment, and surrounding musculature.' },
      { step: '02', title: 'Pain Management', desc: 'Manual therapy, electrotherapy, and taping to control pain and swelling.' },
      { step: '03', title: 'Progressive Loading', desc: 'Structured strengthening of the quadriceps, hamstrings, and hip stabilizers.' },
      { step: '04', title: 'Return to Activity', desc: 'Sport- or activity-specific drills to restore confidence and full performance.' },
    ],
    faq: [
      { q: 'Can physiotherapy delay knee replacement?', a: 'Yes — research shows targeted strengthening can delay or even avoid surgery in many osteoarthritis patients.' },
      { q: 'How soon can I walk after ACL surgery?', a: 'With supervised rehab, most patients walk without crutches within 2–3 weeks and run by month 4–5.' },
      { q: 'Is knee pain age-related only?', a: 'No. Knee pain affects athletes, office workers, and the elderly. Cause matters more than age.' },
    ],
  },
  'neck-pain-cervical-spondylosis': {
    icon: 'ri-emotion-unhappy-line', title: 'Neck Pain & Cervical Care', category: 'Spine & Back',
    price: '₹500 – ₹2,000', sessions: '8–12 sessions',
    recoveryTime: '4–8 weeks', successRate: '94%',
    desc: 'Targeted treatment for neck pain, cervical spondylosis, whiplash, and tension headaches.',
    longDesc: 'Persistent neck pain is increasingly common in the era of smartphones and desk work. Our cervical specialists use posture correction, manual mobilization, deep cervical flexor training, and ergonomic coaching to deliver lasting relief — not just short-term comfort.',
    benefits: ['Lasting neck pain relief', 'Reduced tension headaches', 'Improved cervical mobility', 'Corrected posture and ergonomics', 'Reduced reliance on medication', 'Prevention of disc degeneration'],
    conditions: ['Cervical spondylosis', 'Whiplash injury', 'Cervical radiculopathy', 'Tension-type headaches', 'Tech neck / postural strain', 'Cervical disc bulge'],
    process: [
      { step: '01', title: 'Posture Assessment', desc: 'Detailed analysis of cervical posture, range of motion, and muscle imbalances.' },
      { step: '02', title: 'Manual Mobilization', desc: 'Gentle hands-on techniques to restore joint mobility and reduce muscle tension.' },
      { step: '03', title: 'Strengthening', desc: 'Deep cervical flexor and scapular stabilizer strengthening for long-term support.' },
      { step: '04', title: 'Ergonomic Coaching', desc: 'Workplace and lifestyle adjustments to prevent recurrence.' },
    ],
    faq: [
      { q: 'Are tension headaches related to my neck?', a: 'Often, yes. Cervicogenic headaches arise from neck dysfunction and respond well to targeted physiotherapy.' },
      { q: 'Will I need a cervical collar?', a: 'Rarely. Modern guidelines favor active rehabilitation over prolonged immobilization.' },
      { q: 'Can ergonomics alone fix my pain?', a: 'Ergonomics helps prevent recurrence but rarely reverses established pain — combined therapy works best.' },
    ],
  },
  'sports-injury-rehabilitation': {
    icon: 'ri-football-line', title: 'Sports Injury Rehabilitation', category: 'Sports',
    price: '₹800 – ₹3,000', sessions: '10–20 sessions',
    recoveryTime: '6–12 weeks', successRate: '96%',
    desc: 'Rapid, structured recovery programs for athletes and active individuals.',
    longDesc: 'Athletes need more than pain relief — they need to return to performance. Our sports rehabilitation programs combine acute injury management, progressive loading, sport-specific drills, and biomechanical correction to get you back on the field stronger and less injury-prone than before.',
    benefits: ['Faster return to sport', 'Reduced re-injury risk', 'Enhanced performance metrics', 'Sport-specific conditioning', 'Mental confidence to perform', 'Long-term injury resilience'],
    conditions: ['ACL & meniscus injuries', 'Hamstring strains', 'Tennis / golfer\'s elbow', 'Rotator cuff tears', 'Stress fractures', 'Ankle sprains'],
    process: [
      { step: '01', title: 'Injury Diagnosis', desc: 'Clinical assessment combined with movement screening to identify the injury and its causes.' },
      { step: '02', title: 'Acute Management', desc: 'Pain and swelling control with manual therapy, electrotherapy, and taping.' },
      { step: '03', title: 'Progressive Loading', desc: 'Structured strengthening to restore tissue capacity beyond pre-injury levels.' },
      { step: '04', title: 'Return-to-Sport Testing', desc: 'Objective performance tests to ensure full readiness before competitive return.' },
    ],
    faq: [
      { q: 'When can I return to my sport?', a: 'Return-to-sport timing depends on injury severity but is always guided by objective testing — not just time.' },
      { q: 'Do you treat amateur athletes too?', a: 'Absolutely. We treat athletes at every level, from weekend warriors to professionals.' },
      { q: 'Can you help with performance, not just injury?', a: 'Yes — performance enhancement and injury prevention programs are core to what we do.' },
    ],
  },
  'neuro-physiotherapy': {
    icon: 'ri-flashlight-line', title: 'Neuro Physiotherapy', category: 'Neuro Rehab',
    price: '₹1,000 – ₹4,000', sessions: '20+ sessions',
    recoveryTime: '3–6 months', successRate: '88%',
    desc: 'Specialized physiotherapy for neurological conditions including Parkinson\'s, MS, and cerebral palsy.',
    longDesc: 'Neurological conditions require a specialized approach to physiotherapy. Our neuro team uses neuroplasticity-driven techniques — task-specific training, dual-task exercises, balance training, and gait retraining — to help patients improve function and slow disease progression.',
    benefits: ['Improved balance and coordination', 'Better cognitive-motor integration', 'Greater independence in daily life', 'Slowed disease progression', 'Reduced fall risk', 'Improved confidence and quality of life'],
    conditions: ['Parkinson\'s disease', 'Multiple sclerosis', 'Cerebral palsy', 'Traumatic brain injury', 'Ataxia', 'Vestibular disorders'],
    process: [
      { step: '01', title: 'Neuro Assessment', desc: 'Comprehensive evaluation of balance, gait, motor control, and functional capacity.' },
      { step: '02', title: 'Personalized Plan', desc: 'Treatment tailored to your specific neurological condition and goals.' },
      { step: '03', title: 'Skill-Based Training', desc: 'Task-specific practice to drive neuroplasticity and motor learning.' },
      { step: '04', title: 'Long-Term Maintenance', desc: 'Home programs and periodic check-ins to maintain gains over time.' },
    ],
    faq: [
      { q: 'Can physiotherapy slow Parkinson\'s?', a: 'Evidence shows structured exercise and skill training can slow functional decline and improve quality of life.' },
      { q: 'How long should I continue therapy?', a: 'Many neurological conditions benefit from ongoing periodic intervention — duration varies by condition.' },
      { q: 'Will I see improvement quickly?', a: 'Improvements are typically gradual but meaningful, often visible within 4–6 weeks of consistent therapy.' },
    ],
  },
  'post-surgery-rehabilitation': {
    icon: 'ri-hospital-line', title: 'Post-Surgery Rehabilitation', category: 'Orthopedics',
    price: '₹700 – ₹3,000', sessions: '12–20 sessions',
    recoveryTime: '8–16 weeks', successRate: '94%',
    desc: 'Accelerated, structured recovery after orthopedic and neurological surgery.',
    longDesc: 'Surgery is just the beginning of your recovery. Our post-surgical rehabilitation programs are designed in coordination with your surgeon to optimize healing, restore function, and ensure you return to daily life — and beyond — stronger than before.',
    benefits: ['Faster healing and tissue recovery', 'Effective scar management', 'Restoration of strength and mobility', 'Prevention of post-op complications', 'Safe return to work and activity', 'Confidence in your recovered limb'],
    conditions: ['Post knee/hip replacement', 'Post ACL reconstruction', 'Post rotator cuff repair', 'Post spine surgery', 'Post fracture fixation', 'Post tendon repair'],
    process: [
      { step: '01', title: 'Protocol Review', desc: 'We coordinate with your surgeon to follow procedure-specific rehabilitation guidelines.' },
      { step: '02', title: 'Early Mobilization', desc: 'Gentle range-of-motion and pain control techniques in the early post-op phase.' },
      { step: '03', title: 'Progressive Strengthening', desc: 'Carefully graded loading to rebuild strength and tissue capacity.' },
      { step: '04', title: 'Functional Return', desc: 'Activity-specific training to ensure full return to work, sport, or hobbies.' },
    ],
    faq: [
      { q: 'When should rehab begin after surgery?', a: 'For most procedures, rehabilitation begins within days — early mobilization improves outcomes significantly.' },
      { q: 'Will I feel pain during therapy?', a: 'Some discomfort is normal but never severe pain. Our therapists progress you carefully within safe limits.' },
      { q: 'Do you coordinate with my surgeon?', a: 'Yes, we follow your surgeon\'s protocol and communicate with them throughout your recovery.' },
    ],
  },
  'pediatric-physiotherapy': {
    icon: 'ri-parent-line', title: 'Pediatric Physiotherapy', category: 'Pediatrics',
    price: '₹600 – ₹2,500', sessions: '10–20 sessions',
    recoveryTime: 'Varies', successRate: '90%',
    desc: 'Gentle, play-based physiotherapy for infants, children, and adolescents.',
    longDesc: 'Children are not small adults — they need specialized, play-based therapy. Our pediatric specialists work with children to address developmental delays, congenital conditions, and musculoskeletal issues using engaging, age-appropriate techniques that achieve real outcomes.',
    benefits: ['Achievement of developmental milestones', 'Improved gross and fine motor skills', 'Better posture and alignment', 'Enhanced confidence and independence', 'Family-centered education', 'Engaging, child-friendly sessions'],
    conditions: ['Cerebral palsy', 'Developmental delay', 'Torticollis', 'Down syndrome', 'Toe walking / gait abnormalities', 'Pediatric orthopedic conditions'],
    process: [
      { step: '01', title: 'Pediatric Assessment', desc: 'Age-appropriate evaluation involving the parents in the assessment process.' },
      { step: '02', title: 'Play-Based Therapy', desc: 'Therapeutic activities disguised as play to engage and motivate the child.' },
      { step: '03', title: 'Family Coaching', desc: 'Empowering parents with home strategies and exercises to continue progress.' },
      { step: '04', title: 'Milestone Tracking', desc: 'Regular reassessment to celebrate progress and adjust the plan as needed.' },
    ],
    faq: [
      { q: 'At what age can therapy start?', a: 'Therapy can begin from the newborn period. Early intervention often produces the best outcomes.' },
      { q: 'How can I help at home?', a: 'Our therapists train you with simple home routines that fit naturally into your child\'s daily life.' },
      { q: 'Will my child enjoy the sessions?', a: 'Sessions are designed to feel like play — most children look forward to coming.' },
    ],
  },
  'geriatric-care': {
    icon: 'ri-user-heart-line', title: 'Geriatric Care', category: 'Elderly Care',
    price: '₹500 – ₹2,000', sessions: '10–15 sessions',
    recoveryTime: 'Ongoing', successRate: '92%',
    desc: 'Compassionate physiotherapy programs designed for elderly patients to maintain independence.',
    longDesc: 'Aging well requires staying active and mobile. Our geriatric programs focus on fall prevention, balance, strength, and managing chronic conditions — helping older adults preserve independence, dignity, and joy in everyday life.',
    benefits: ['Significant fall risk reduction', 'Improved balance and steadiness', 'Better management of chronic pain', 'Preserved independence in daily tasks', 'Enhanced confidence in mobility', 'Improved overall quality of life'],
    conditions: ['Osteoarthritis', 'Osteoporosis', 'Balance disorders', 'Post-fall recovery', 'Parkinson\'s in elderly', 'General deconditioning'],
    process: [
      { step: '01', title: 'Geriatric Assessment', desc: 'Holistic evaluation including fall risk, strength, balance, and chronic conditions.' },
      { step: '02', title: 'Gentle Conditioning', desc: 'Age-appropriate strengthening and flexibility work — never too intense.' },
      { step: '03', title: 'Balance Training', desc: 'Evidence-based balance exercises to dramatically reduce fall risk.' },
      { step: '04', title: 'Lifestyle Integration', desc: 'Sustainable home routines that fit comfortably into your daily life.' },
    ],
    faq: [
      { q: 'Is exercise safe at my age?', a: 'Properly supervised exercise is one of the safest, most effective interventions for older adults — at any age.' },
      { q: 'Can therapy prevent falls?', a: 'Yes, evidence-based balance training can reduce fall risk by up to 50% in seniors.' },
      { q: 'Do you visit homes?', a: 'Yes, home visits are available for patients unable to travel to the clinic.' },
    ],
  },
  'shoulder-pain-treatment': {
    icon: 'ri-boxing-line', title: 'Shoulder Pain Treatment', category: 'Orthopedics',
    price: '₹600 – ₹2,500', sessions: '8–15 sessions',
    recoveryTime: '4–10 weeks', successRate: '93%',
    desc: 'Comprehensive treatment for rotator cuff injuries, shoulder impingement, and chronic shoulder pain.',
    longDesc: 'Shoulder pain can disrupt sleep, work, and daily activities. Our specialists use a combination of manual therapy, scapular stabilization, and progressive strengthening to treat the root cause — giving you back full, pain-free shoulder function.',
    benefits: ['Complete pain elimination', 'Restored full range of motion', 'Strength and stability rebuilt', 'Better posture and scapular control', 'Prevention of further injury', 'Improved sleep quality'],
    conditions: ['Rotator cuff tears / tendinitis', 'Shoulder impingement', 'AC joint dysfunction', 'Bursitis', 'Labral tears', 'Chronic shoulder instability'],
    process: [
      { step: '01', title: 'Shoulder Assessment', desc: 'Detailed evaluation of shoulder mobility, strength, and scapular movement patterns.' },
      { step: '02', title: 'Pain Reduction', desc: 'Manual therapy and electrotherapy to control pain and inflammation.' },
      { step: '03', title: 'Stability Training', desc: 'Targeted rotator cuff and scapular stabilizer strengthening.' },
      { step: '04', title: 'Functional Restoration', desc: 'Sport- or work-specific drills to restore full functional capacity.' },
    ],
    faq: [
      { q: 'Do I need surgery for a rotator cuff tear?', a: 'Many partial tears respond well to physiotherapy. Surgery is typically reserved for full-thickness tears or failed conservative care.' },
      { q: 'How long until I can sleep on my side?', a: 'Most patients regain comfortable side sleeping within 4–6 weeks of consistent therapy.' },
      { q: 'Can shoulder pain be from posture?', a: 'Yes — poor posture is a leading cause of shoulder impingement and is highly treatable.' },
    ],
  },
  'frozen-shoulder': {
    icon: 'ri-snowy-line', title: 'Frozen Shoulder', category: 'Orthopedics',
    price: '₹700 – ₹3,000', sessions: '12–20 sessions',
    recoveryTime: '8–16 weeks', successRate: '90%',
    desc: 'Specialized treatment for adhesive capsulitis to restore movement and eliminate pain.',
    longDesc: 'Frozen shoulder (adhesive capsulitis) progresses through painful, frozen, and thawing phases — but the right physiotherapy can dramatically shorten the journey. We combine manual mobilization, capsular stretching, and targeted exercises to restore full mobility faster than waiting it out.',
    benefits: ['Full mobility restored', 'Significant pain relief', 'Faster recovery vs. natural course', 'Preserved sleep and daily function', 'Prevention of recurrence', 'Confidence to use the arm freely'],
    conditions: ['Primary adhesive capsulitis', 'Secondary frozen shoulder (post-injury)', 'Diabetic frozen shoulder', 'Post-immobilization stiffness'],
    process: [
      { step: '01', title: 'Phase Assessment', desc: 'Identify the current phase (painful / frozen / thawing) to tailor treatment intensity.' },
      { step: '02', title: 'Capsular Mobilization', desc: 'Targeted manual techniques to stretch the contracted shoulder capsule.' },
      { step: '03', title: 'Active Mobility', desc: 'Progressive active stretching and strengthening within tolerable limits.' },
      { step: '04', title: 'Maintenance Plan', desc: 'Home program and lifestyle guidance to prevent recurrence — especially in diabetics.' },
    ],
    faq: [
      { q: 'Will frozen shoulder resolve on its own?', a: 'It often does, but recovery can take 1–3 years. Physiotherapy typically halves that timeline.' },
      { q: 'Is the treatment painful?', a: 'Some discomfort is expected during stretching, but treatment is carefully graded to be tolerable.' },
      { q: 'Why is it more common in diabetics?', a: 'Diabetes promotes capsular fibrosis. Diabetic patients need particularly careful management to avoid recurrence.' },
    ],
  },
};

const RELATED_BY_CATEGORY: Record<string, string[]> = {
  'Spine & Back': ['back-pain-treatment', 'spine-care-disc-problems', 'neck-pain-cervical-spondylosis'],
  'Orthopedics': ['knee-pain-joint-care', 'shoulder-pain-treatment', 'frozen-shoulder'],
  'Neuro Rehab': ['paralysis-rehabilitation', 'neuro-physiotherapy', 'post-surgery-rehabilitation'],
  'Sports': ['sports-injury-rehabilitation', 'knee-pain-joint-care', 'shoulder-pain-treatment'],
  'Pediatrics': ['pediatric-physiotherapy', 'neuro-physiotherapy', 'paralysis-rehabilitation'],
  'Elderly Care': ['geriatric-care', 'knee-pain-joint-care', 'back-pain-treatment'],
};

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const svc = SERVICES[params.slug];
  if (!svc) notFound();

  const relatedSlugs = (RELATED_BY_CATEGORY[svc.category] || []).filter((s) => s !== params.slug).slice(0, 3);
  const related = relatedSlugs.map((s) => ({ slug: s, ...SERVICES[s] }));

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroMesh} />
        <div className={styles.heroOrb} />
        <div className="container">
          <nav className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <i className="ri-arrow-right-s-line" />
            <Link href="/services">Services</Link>
            <i className="ri-arrow-right-s-line" />
            <span>{svc.title}</span>
          </nav>

          <span className={styles.category}>{svc.category}</span>
          <h1 className={styles.title}>
            {svc.title.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="gradient-text">{svc.title.split(' ').slice(-1)[0]}</span>
          </h1>
          <p className={styles.longDesc}>{svc.longDesc}</p>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                <i className="ri-time-line" />
              </div>
              <div>
                <p className={styles.statNum}>{svc.recoveryTime}</p>
                <p className={styles.statLabel}>Recovery Time</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconTeal}`}>
                <i className="ri-calendar-2-line" />
              </div>
              <div>
                <p className={styles.statNum}>{svc.sessions}</p>
                <p className={styles.statLabel}>Treatment Sessions</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                <i className="ri-trophy-line" />
              </div>
              <div>
                <p className={styles.statNum}>{svc.successRate}</p>
                <p className={styles.statLabel}>Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className={styles.layout}>
          <main className={styles.main}>
            <section className={styles.cardSection}>
              <h2 className={styles.h2}>Conditions We Treat</h2>
              <p className={styles.lead}>This treatment addresses a wide range of conditions:</p>
              <div className={styles.conditionsTags}>
                {svc.conditions.map((c) => (
                  <span key={c} className={styles.conditionTag}>
                    <i className="ri-checkbox-circle-fill" /> {c}
                  </span>
                ))}
              </div>
            </section>

            <section className={styles.cardSection}>
              <h2 className={styles.h2}>What You&apos;ll Achieve</h2>
              <ul className={styles.benefitsGrid}>
                {svc.benefits.map((b) => (
                  <li key={b}>
                    <i className="ri-checkbox-circle-fill" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.cardSection}>
              <h2 className={styles.h2}>Our Treatment Process</h2>
              <div className={styles.process}>
                {svc.process.map((p, idx) => (
                  <div key={p.step} className={styles.processStep}>
                    <div className={styles.stepNum}>{p.step}</div>
                    <div className={styles.stepBody}>
                      <h3 className={styles.stepTitle}>{p.title}</h3>
                      <p className={styles.stepDesc}>{p.desc}</p>
                    </div>
                    {idx < svc.process.length - 1 && <span className={styles.processLine} />}
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.cardSection}>
              <h2 className={styles.h2}>Frequently Asked Questions</h2>
              <div className={styles.faq}>
                {svc.faq.map((item, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div key={item.q} className={`${styles.faqItem} ${isOpen ? styles.faqOpen : ''}`}>
                      <button
                        type="button"
                        className={styles.faqQ}
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        aria-expanded={isOpen}
                      >
                        <span>{item.q}</span>
                        <i className={`ri-add-line ${styles.faqIcon}`} />
                      </button>
                      <div className={styles.faqA}>
                        <p>{item.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>

          <aside className={styles.sidebar}>
            <div className={styles.bookingCard}>
              <div className={styles.docRow}>
                <div className={styles.docAvatar}>
                  <i className={svc.icon} />
                </div>
                <div className={styles.docMeta}>
                  <p className={styles.docTitle}>Specialist available</p>
                  <p className={styles.docSub}>
                    <span className={styles.greenDot} />
                    Same-day slots open
                  </p>
                </div>
              </div>

              <div className={styles.priceBlock}>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Starting from</span>
                  <span className={styles.priceVal}>{svc.price.split('–')[0].trim()}</span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Sessions</span>
                  <span className={styles.priceValAlt}>{svc.sessions}</span>
                </div>
              </div>

              <Link href="/book-appointment" className={styles.bookCta}>
                Book This Treatment
                <i className="ri-arrow-right-line" />
              </Link>

              <a
                href="https://wa.me/919999999999?text=I'd like to book a consultation"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.waCta}
              >
                <i className="ri-whatsapp-line" /> WhatsApp Us
              </a>

              <a href="tel:+919999999999" className={styles.phoneLink}>
                <i className="ri-phone-line" />
                +91 99999 99999
              </a>

              <div className={styles.guarantee}>
                <i className="ri-shield-check-fill" />
                <span>30-min response · Free assessment call</span>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.h2}>Related Services</h2>
            <div className={styles.relatedGrid}>
              {related.map((r) => (
                <Link key={r.slug} href={`/services/${r.slug}`} className={styles.relatedCard}>
                  <div className={styles.relatedIcon}>
                    <i className={r.icon} />
                  </div>
                  <div>
                    <span className={styles.relatedCategory}>{r.category}</span>
                    <h3 className={styles.relatedTitle}>{r.title}</h3>
                    <p className={styles.relatedDesc}>{r.desc}</p>
                  </div>
                  <i className={`ri-arrow-right-line ${styles.relatedArrow}`} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className={styles.mobileBar}>
        <Link href="/book-appointment" className={styles.mobileBook}>
          <i className="ri-calendar-2-line" /> Book
        </Link>
        <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className={styles.mobileWa}>
          <i className="ri-whatsapp-line" /> WhatsApp
        </a>
        <a href="tel:+919999999999" className={styles.mobileCall}>
          <i className="ri-phone-line" /> Call
        </a>
      </div>
    </div>
  );
}
