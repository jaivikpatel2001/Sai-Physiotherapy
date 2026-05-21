/**
 * Canonical content index for programmatic SEO.
 * Server-safe (no React) so it can feed sitemap.ts, robots.ts and
 * generateMetadata() without pulling client page bundles.
 */

export type ServiceSEO = {
  slug: string;
  title: string;
  description: string;
  category: string;
  image: string;
};

export const SERVICES_SEO: ServiceSEO[] = [
  { slug: 'back-pain-treatment', title: 'Back Pain Treatment', category: 'Spine & Back', image: '/images/therapy/back_pain_treatment.png', description: 'Expert, non-surgical back pain treatment in Ahmedabad — manual therapy, electrotherapy & targeted exercise. 95% success rate.' },
  { slug: 'spine-care-disc-problems', title: 'Spine Care & Disc Problems', category: 'Spine & Back', image: '/images/therapy/therapy_spine_treatment.png', description: 'Specialised physiotherapy for disc herniation, spondylosis & spinal conditions at SAI Physiotherapy, Ahmedabad.' },
  { slug: 'paralysis-rehabilitation', title: 'Paralysis Rehabilitation', category: 'Neuro Rehab', image: '/images/therapy/therapy_neuro_rehab.png', description: 'Comprehensive paralysis & stroke rehabilitation in Ahmedabad to maximise functional recovery and independence.' },
  { slug: 'knee-pain-joint-care', title: 'Knee Pain & Joint Care', category: 'Orthopedics', image: '/images/therapy/therapy_knee_joint.png', description: 'Effective treatment for knee pain, osteoarthritis, ligament injuries & post-surgical knee rehabilitation in Ahmedabad.' },
  { slug: 'neck-pain-cervical-spondylosis', title: 'Neck Pain & Cervical Care', category: 'Spine & Back', image: '/images/therapy/therapy_spine_treatment.png', description: 'Targeted physiotherapy for neck pain, cervical spondylosis, whiplash & cervicogenic headaches in Ahmedabad.' },
  { slug: 'sports-injury-rehabilitation', title: 'Sports Injury Rehabilitation', category: 'Sports', image: '/images/therapy/therapy_sports_rehab.png', description: 'Rapid sports injury physiotherapy in Ahmedabad — return-to-play programs for athletes & active individuals.' },
  { slug: 'neuro-physiotherapy', title: 'Neuro Physiotherapy', category: 'Neuro Rehab', image: '/images/therapy/therapy_neuro_rehab.png', description: "Specialised neuro physiotherapy for stroke, Parkinson's, MS & cerebral palsy in Ahmedabad, Gujarat." },
  { slug: 'post-surgery-rehabilitation', title: 'Post-Surgery Rehabilitation', category: 'Orthopedics', image: '/images/therapy/exercise_rehab_session.png', description: 'Structured post-operative rehabilitation in Ahmedabad to accelerate recovery after orthopedic surgery.' },
  { slug: 'pediatric-physiotherapy', title: 'Pediatric Physiotherapy', category: 'Pediatrics', image: '/images/therapy/therapy_pediatric.png', description: 'Gentle pediatric physiotherapy for developmental delays, cerebral palsy & childhood musculoskeletal conditions.' },
];

export type BlogSEO = {
  slug: string;
  title: string;
  description: string;
  category: string;
  author: string;
  date: string; // human label
  image: string;
};

export const BLOG_SEO: BlogSEO[] = [
  { slug: '5-exercises-for-lower-back-pain', title: '5 Physiotherapist-Approved Exercises for Lower Back Pain Relief', category: 'Back Pain', author: 'Dr. Sai Patel', date: 'April 28, 2026', image: '/images/blog/blog_back_pain_exercises.png', description: 'Five evidence-based exercises a senior physiotherapist recommends for fast, safe lower back pain relief at home.' },
  { slug: 'understanding-cervical-spondylosis', title: 'Understanding Cervical Spondylosis: Causes, Symptoms & Treatment', category: 'Spine Care', author: 'Dr. Anjali Mehta', date: 'April 15, 2026', image: '/images/blog/blog_cervical_spondylosis.png', description: 'How cervical spondylosis develops, its symptoms, and how physiotherapy provides long-term neck pain relief.' },
  { slug: 'post-stroke-rehabilitation-guide', title: 'A Complete Guide to Post-Stroke Rehabilitation & Recovery', category: 'Neuro Rehab', author: 'Dr. Rakesh Joshi', date: 'March 30, 2026', image: '/images/blog/blog_stroke_rehab.png', description: 'The stages of post-stroke recovery and what to expect from neuro physiotherapy rehabilitation.' },
  { slug: 'knee-osteoarthritis-management', title: 'Managing Knee Osteoarthritis with Physiotherapy', category: 'Joint Care', author: 'Dr. Sai Patel', date: 'March 15, 2026', image: '/images/therapy/therapy_knee_joint.png', description: 'How targeted physiotherapy reduces pain and improves function in knee osteoarthritis — without surgery.' },
  { slug: 'sports-injury-prevention-tips', title: '10 Physiotherapist Tips to Prevent Sports Injuries', category: 'Sports', author: 'Dr. Karan Shah', date: 'March 1, 2026', image: '/images/blog/blog_sports_injury.png', description: 'Essential warm-up, cool-down and conditioning tips from physiotherapists to prevent common sports injuries.' },
  { slug: 'frozen-shoulder-treatment', title: 'Frozen Shoulder: What It Is and How We Treat It', category: 'Shoulder', author: 'Dr. Anjali Mehta', date: 'February 20, 2026', image: '/images/therapy/consultation_doctor_patient.png', description: 'The stages, symptoms and physiotherapy treatment of frozen shoulder (adhesive capsulitis).' },
];

export type DoctorSEO = {
  name: string;
  title: string;
  qualification: string;
  experience: string;
  specialties: string[];
};

export const DOCTORS_SEO: DoctorSEO[] = [
  { name: 'Dr. Rajesh Patel', title: 'Senior Physiotherapist & Director', qualification: 'BPT, MPT (Orthopedics)', experience: '15+ Years', specialties: ['Spine Care', 'Sports Rehab', 'Orthopedics'] },
  { name: 'Dr. Anita Shah', title: 'Neuro Physiotherapy Specialist', qualification: 'BPT, MPT (Neurology)', experience: '12+ Years', specialties: ['Neuro Rehab', 'Stroke Rehab', 'Pediatrics'] },
  { name: 'Dr. Vikram Mehta', title: 'Sports & Orthopedic Physiotherapist', qualification: 'BPT, MPT, Cert. Sports Physio', experience: '10+ Years', specialties: ['Sports Rehab', 'Orthopedics', 'Post-Op'] },
  { name: 'Dr. Meena Joshi', title: "Geriatric & Women's Health Specialist", qualification: 'BPT, MPT (Geriatrics)', experience: '8+ Years', specialties: ['Elderly Care', "Women's Health"] },
  { name: 'Dr. Suresh Nair', title: 'Pediatric Physiotherapy Specialist', qualification: 'BPT, MPT (Pediatrics)', experience: '9+ Years', specialties: ['Pediatrics', 'Neuro Rehab'] },
  { name: 'Dr. Priya Desai', title: 'Musculoskeletal Physiotherapist', qualification: 'BPT, MPT, MIAP', experience: '7+ Years', specialties: ['Orthopedics', 'Spine Care'] },
];

export const getService = (slug: string) => SERVICES_SEO.find((s) => s.slug === slug);
export const getPost = (slug: string) => BLOG_SEO.find((p) => p.slug === slug);
