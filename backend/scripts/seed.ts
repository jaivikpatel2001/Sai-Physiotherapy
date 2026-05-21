/**
 * SAI Physiotherapy — Database Seeder
 *
 * Idempotent seeder for every model in the system. Re-running is safe —
 * existing records (matched by natural keys like email / slug / patientId)
 * are skipped, missing ones are inserted. After a fresh run:
 *
 *   - 5 users (Super Admin · 4 Doctors · 1 Receptionist · 1 Billing Staff)
 *   - 4 Doctor profiles (linked to User records) — public site dataset
 *   - 12 Services with banner image + SEO + FAQs
 *   - 10 Patients with realistic medical history + a sample document
 *   - 20+ Appointments spread across past, today, future
 *   - Treatment Sessions for every completed appointment (full SOAP notes)
 *   - Billing invoices with mixed payment states
 *   - 6 Blogs (published) with cover image + tags + SEO + view counts
 *   - 10 Testimonials (mix of approved / pending / featured + video + b/a images)
 *   - 12 Gallery items across clinic / treatments / events / awards / team
 *   - 4 CMS Pages — Privacy, Terms, Refund, About — shown in footer
 *   - 1 ClinicSettings document — fully populated (NAP, hours, socials, SEO,
 *     homepage hero slides, stats, promotion banner, featured services)
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import mongoose, { Types } from 'mongoose';
import { User, type IUserDocument } from '../src/models/User.model';
import { Service, type IServiceDocument } from '../src/models/Service.model';
import { ClinicSettings } from '../src/models/ClinicSettings.model';
import { Patient, type IPatientDocument } from '../src/models/Patient.model';
import { Appointment, type IAppointmentDocument } from '../src/models/Appointment.model';
import { TreatmentSession } from '../src/models/TreatmentSession.model';
import { Billing } from '../src/models/Billing.model';
import { Blog } from '../src/models/Blog.model';
import { Testimonial } from '../src/models/Testimonial.model';
import { Doctor } from '../src/models/Doctor.model';
import { Gallery } from '../src/models/Gallery.model';
import { Page } from '../src/models/Page.model';
import { UserRole } from '@sai-physio/types';
import { generateSlug } from '@sai-physio/utils';
import {
  generatePatientId,
  generateAppointmentId,
  generateInvoiceNumber,
} from '../src/utils/id-generator';

const MONGODB_URI = process.env.MONGODB_URI || '';

/** Asset paths — these resolve to files in `frontend/public/images/...` */
const ASSETS = {
  // Doctor photos
  doctorPatel: '/images/doctors/doctor_rajesh_patel.png',
  doctorMehta: '/images/doctors/doctor_anita_shah.png',
  doctorJoshi: '/images/doctors/doctor_meena_joshi.png',
  doctorShah: '/images/doctors/doctor_vikram_mehta.png',
  // Service banners
  svcBackPain: '/images/therapy/back_pain_treatment.png',
  svcSpine: '/images/therapy/therapy_spine_treatment.png',
  svcNeuro: '/images/therapy/therapy_neuro_rehab.png',
  svcKnee: '/images/therapy/therapy_knee_joint.png',
  svcSports: '/images/therapy/therapy_sports_rehab.png',
  svcPediatric: '/images/therapy/therapy_pediatric.png',
  // Blog covers
  blogBack: '/images/blog/blog_back_pain_exercises.png',
  blogSpondylosis: '/images/blog/blog_cervical_spondylosis.png',
  blogStroke: '/images/blog/blog_stroke_rehab.png',
  // Testimonial portraits
  testPriya: '/images/testimonials/testimonial_priya_sharma.png',
  testRajesh: '/images/testimonials/testimonial_rajesh_patel.png',
  testMeena: '/images/testimonials/testimonial_meena_joshi.png',
  testVikram: '/images/testimonials/testimonial_vikram_shah.png',
  // Misc
  logo: '/images/logo.png',
  favicon: '/favicon.ico',
};

// ────────────────────────────────────────────────────────────────────────────
// CATALOG DATA
// ────────────────────────────────────────────────────────────────────────────

const SERVICES_CATALOG = [
  {
    name: 'Back Pain Treatment',
    category: 'Spine & Back',
    shortDescription: 'Expert treatment for all types of back pain using advanced physiotherapy techniques and personalized care plans.',
    price: { from: 500, to: 2000 },
    duration: '30-45 minutes',
    bannerImage: ASSETS.svcBackPain,
    benefits: ['Reduced pain and inflammation', 'Improved posture', 'Strengthened back muscles', 'Better mobility', 'Non-surgical treatment'],
    treatmentProcess: ['Initial Assessment & Diagnosis', 'Personalized Treatment Plan', 'Manual Therapy & Mobilization', 'Therapeutic Exercises', 'Heat/Cold Therapy', 'Progress Review & Discharge'],
    faqs: [
      { question: 'How many sessions will I need?', answer: 'Most patients see significant improvement in 8-12 sessions. The exact number depends on severity and individual response to treatment.' },
      { question: 'Is physiotherapy safe for chronic back pain?', answer: 'Yes, physiotherapy is one of the safest and most effective treatments for chronic back pain without surgery or medication dependency.' },
    ],
  },
  { name: 'Spine Care & Disc Problems', category: 'Spine & Back', shortDescription: 'Specialized treatment for disc herniation, spondylosis, and other spinal conditions.', price: { from: 800, to: 3000 }, duration: '45-60 minutes', bannerImage: ASSETS.svcSpine, benefits: ['Disc decompression', 'Pain relief', 'Nerve function improvement', 'Posture correction'], treatmentProcess: ['Spinal Assessment', 'Traction Therapy', 'McKenzie Method', 'Core Strengthening', 'Ergonomic Training'], faqs: [{ question: 'Can physiotherapy help avoid spine surgery?', answer: 'In many cases, yes. Conservative physiotherapy management can successfully treat disc problems without surgery.' }] },
  { name: 'Paralysis Rehabilitation', category: 'Neuro Rehabilitation', shortDescription: 'Comprehensive rehabilitation program for stroke, spinal injury, and other causes of paralysis to maximize functional recovery.', price: { from: 1000, to: 4000 }, duration: '60-90 minutes', bannerImage: ASSETS.svcNeuro, benefits: ['Muscle strength recovery', 'Improved coordination', 'Functional independence', 'Better quality of life'], treatmentProcess: ['Neurological Assessment', 'Passive Range of Motion', 'Electrical Stimulation', 'Gait Training', 'Functional Task Training', 'Home Program Design'], faqs: [{ question: 'When should paralysis rehabilitation start?', answer: 'The earlier the better. Early intervention within days of the event leads to significantly better outcomes.' }] },
  { name: 'Knee Pain & Joint Care', category: 'Orthopedics', shortDescription: 'Effective treatment for knee pain, osteoarthritis, ligament injuries, and post-surgical rehabilitation.', price: { from: 600, to: 2500 }, duration: '30-45 minutes', bannerImage: ASSETS.svcKnee, benefits: ['Pain reduction', 'Improved joint mobility', 'Muscle strengthening', 'Delayed need for surgery'], treatmentProcess: ['Joint Assessment', 'Manual Therapy', 'Quadriceps Strengthening', 'Proprioception Training', 'Hydrotherapy (if available)'], faqs: [{ question: 'Can physiotherapy replace knee replacement?', answer: 'For mild to moderate osteoarthritis, physiotherapy can significantly delay or in some cases prevent knee replacement surgery.' }] },
  { name: 'Neck Pain & Cervical Spondylosis', category: 'Spine & Back', shortDescription: 'Targeted treatment for neck pain, cervical spondylosis, whiplash, and headaches arising from cervical spine.', price: { from: 500, to: 2000 }, duration: '30-45 minutes', bannerImage: ASSETS.svcSpine, benefits: ['Neck pain relief', 'Headache reduction', 'Improved neck mobility', 'Better sleep'], treatmentProcess: ['Cervical Assessment', 'Traction Therapy', 'Cervical Manipulation', 'Postural Correction', 'Home Exercise Program'], faqs: [{ question: 'How does sitting posture affect neck pain?', answer: 'Poor sitting posture for prolonged periods is the #1 cause of cervical spondylosis. We provide comprehensive ergonomic training.' }] },
  { name: 'Sports Injury Rehabilitation', category: 'Sports', shortDescription: 'Rapid recovery programs for athletes and active individuals with sports-related injuries.', price: { from: 800, to: 3000 }, duration: '45-60 minutes', bannerImage: ASSETS.svcSports, benefits: ['Faster return to sport', 'Re-injury prevention', 'Performance enhancement', 'Strength recovery'], treatmentProcess: ['Injury Assessment', 'RICE Protocol', 'Therapeutic Modalities', 'Functional Training', 'Sport-Specific Conditioning', 'Return to Sport Clearance'], faqs: [{ question: 'How long does sports injury recovery take?', answer: 'Recovery varies from 2 weeks for minor sprains to 6+ months for complex injuries like ACL tears.' }] },
  { name: 'Neuro Physiotherapy', category: 'Neuro Rehabilitation', shortDescription: "Specialized physiotherapy for neurological conditions including Parkinson's, MS, cerebral palsy, and stroke.", price: { from: 1000, to: 4000 }, duration: '60 minutes', bannerImage: ASSETS.svcNeuro, benefits: ['Improved balance', 'Better coordination', 'Enhanced cognitive function', 'Independence in daily activities'], treatmentProcess: ['Neurological Assessment', 'Balance Training', 'Bobath Technique', 'PNF Therapy', 'Cognitive-Motor Training'], faqs: [{ question: "Is neuro physiotherapy beneficial for Parkinson's disease?", answer: 'Yes, specialized physiotherapy can significantly improve gait, balance, and quality of life in Parkinson\'s patients.' }] },
  { name: 'Post-Surgery Rehabilitation', category: 'Orthopedics', shortDescription: 'Accelerate your recovery after orthopedic surgeries with structured rehabilitation protocols.', price: { from: 700, to: 3000 }, duration: '45-60 minutes', bannerImage: ASSETS.svcKnee, benefits: ['Faster healing', 'Scar tissue management', 'Strength restoration', 'Full function recovery'], treatmentProcess: ['Surgical Review', 'Early Mobilization', 'Pain Management', 'Progressive Strengthening', 'Return to Activity Testing'], faqs: [{ question: 'When should I start physio after surgery?', answer: 'Depending on the surgery type, physiotherapy often starts within 24-48 hours post-surgery.' }] },
  { name: 'Pediatric Physiotherapy', category: 'Pediatrics', shortDescription: 'Gentle and effective physiotherapy for children with developmental delays, cerebral palsy, and musculoskeletal conditions.', price: { from: 600, to: 2500 }, duration: '45 minutes', bannerImage: ASSETS.svcPediatric, benefits: ['Developmental milestone achievement', 'Improved motor skills', 'Better posture', 'Enhanced confidence'], treatmentProcess: ['Pediatric Assessment', 'Play-Based Therapy', 'Sensory Integration', 'Parent Training', 'School Recommendations'], faqs: [{ question: 'What age can children start physiotherapy?', answer: 'Physiotherapy can start from birth for conditions like torticollis, and is very effective for children of all ages.' }] },
  { name: 'Geriatric Care', category: 'Elderly Care', shortDescription: 'Specialized physiotherapy programs designed for elderly patients to maintain independence, prevent falls, and manage chronic conditions.', price: { from: 500, to: 2000 }, duration: '30-45 minutes', bannerImage: ASSETS.svcPediatric, benefits: ['Fall prevention', 'Improved balance', 'Pain management', 'Maintained independence', 'Better quality of life'], treatmentProcess: ['Comprehensive Geriatric Assessment', 'Balance & Stability Training', 'Gentle Strengthening', 'Home Safety Assessment', 'Family Education'], faqs: [{ question: 'Is physiotherapy safe for elderly patients?', answer: 'Yes, all exercises and treatments are carefully adapted to the individual\'s fitness level and medical conditions.' }] },
  { name: 'Shoulder Pain Treatment', category: 'Orthopedics', shortDescription: 'Comprehensive treatment for rotator cuff injuries, shoulder impingement, and chronic shoulder pain.', price: { from: 600, to: 2500 }, duration: '30-45 minutes', bannerImage: ASSETS.svcSports, benefits: ['Pain elimination', 'Full range of motion', 'Strength restoration', 'Injury prevention'], treatmentProcess: ['Shoulder Assessment', 'Manual Therapy', 'Rotator Cuff Strengthening', 'Scapular Stabilization', 'Return to Activity'], faqs: [{ question: 'Can physiotherapy cure rotator cuff tears?', answer: 'Partial tears often respond excellently to physiotherapy. Full thickness tears may require surgery followed by rehabilitation.' }] },
  { name: 'Frozen Shoulder', category: 'Orthopedics', shortDescription: 'Specialized treatment for adhesive capsulitis (frozen shoulder) to restore movement and eliminate pain.', price: { from: 700, to: 3000 }, duration: '45 minutes', bannerImage: ASSETS.svcSports, benefits: ['Pain relief', 'Restored shoulder movement', 'Improved function', 'Faster recovery'], treatmentProcess: ['Range of Motion Assessment', 'Joint Mobilization', 'Stretching Protocol', 'Strengthening Exercises', 'Self-Management Education'], faqs: [{ question: 'How long does frozen shoulder take to recover with physio?', answer: 'With consistent physiotherapy, most patients see significant improvement in 3-6 months, much faster than the natural course of 2+ years.' }] },
];

// ────────────────────────────────────────────────────────────────────────────
// MAIN SEED PIPELINE
// ────────────────────────────────────────────────────────────────────────────

async function seedUsers(): Promise<{
  admin: IUserDocument;
  doctorPatel: IUserDocument;
  doctorMehta: IUserDocument;
  doctorJoshi: IUserDocument;
  doctorShah: IUserDocument;
  receptionist: IUserDocument;
  billingStaff: IUserDocument;
}> {
  console.log('\n📝 Seeding users...');

  const userSeeds = [
    {
      key: 'admin',
      name: 'Super Admin',
      email: 'admin@saiphysio.com',
      phone: '9999999999',
      password: 'Admin@123456',
      role: UserRole.SUPER_ADMIN,
      avatar: '',
      bio: 'Platform administrator with full access.',
    },
    {
      key: 'doctorPatel',
      name: 'Dr. Rajesh Patel',
      email: 'doctor@saiphysio.com',
      phone: '9888888888',
      password: 'Doctor@123456',
      role: UserRole.DOCTOR,
      avatar: ASSETS.doctorPatel,
      specialization: 'Spine Care & Rehabilitation',
      qualification: 'BPT, MPT (Orthopedics)',
      experience: 15,
      bio: 'Dr. Rajesh Patel is a senior physiotherapist specializing in spine care and neurological rehabilitation with over 15 years of experience treating 8,000+ patients.',
    },
    {
      key: 'doctorMehta',
      name: 'Dr. Anjali Mehta',
      email: 'anjali@saiphysio.com',
      phone: '9876500001',
      password: 'Doctor@123456',
      role: UserRole.DOCTOR,
      avatar: ASSETS.doctorMehta,
      specialization: 'Orthopedic Physiotherapy',
      qualification: 'BPT, MPT (Ortho), Cert. Manual Therapy',
      experience: 12,
      bio: 'Dr. Anjali specializes in joint pain, sports injuries, and post-surgical rehabilitation. Trained in advanced manual therapy and dry needling techniques.',
    },
    {
      key: 'doctorJoshi',
      name: 'Dr. Rakesh Joshi',
      email: 'rakesh@saiphysio.com',
      phone: '9876500002',
      password: 'Doctor@123456',
      role: UserRole.DOCTOR,
      avatar: ASSETS.doctorJoshi,
      specialization: 'Neuro Physiotherapy',
      qualification: 'BPT, MPT (Neurology), Bobath Cert.',
      experience: 14,
      bio: 'Dr. Rakesh leads the neuro-rehabilitation team with extensive expertise in stroke recovery, Parkinson\'s and pediatric neuro cases.',
    },
    {
      key: 'doctorShah',
      name: 'Dr. Karan Shah',
      email: 'karan@saiphysio.com',
      phone: '9876500003',
      password: 'Doctor@123456',
      role: UserRole.DOCTOR,
      avatar: ASSETS.doctorShah,
      specialization: 'Sports Physiotherapy',
      qualification: 'BPT, MPT (Sports), Certified Strength Coach',
      experience: 9,
      bio: 'Sports medicine specialist focused on injury prevention, ACL rehab, and return-to-play conditioning for amateur and elite athletes.',
    },
    {
      key: 'receptionist',
      name: 'Priya Sharma',
      email: 'reception@saiphysio.com',
      phone: '9777777777',
      password: 'Recept@123456',
      role: UserRole.RECEPTIONIST,
      avatar: '',
      bio: 'Front-desk coordinator handling appointments, patient registrations and inbound calls.',
    },
    {
      key: 'billingStaff',
      name: 'Nilesh Trivedi',
      email: 'billing@saiphysio.com',
      phone: '9777777778',
      password: 'Billing@123456',
      role: UserRole.RECEPTIONIST,
      avatar: '',
      bio: 'Billing & accounts coordinator handling invoicing, payment collection and reports.',
    },
  ] as const;

  const out = {} as Record<string, IUserDocument>;
  for (const seed of userSeeds) {
    const existing = await User.findOne({ email: seed.email });
    if (existing) {
      out[seed.key] = existing;
      console.log(`  ⚠️  User exists: ${seed.email}`);
      continue;
    }
    const { key, ...payload } = seed;
    void key;
    const user = await User.create(payload);
    out[seed.key] = user;
    console.log(`  ✅ User created: ${seed.email}`);
  }

  return out as {
    admin: IUserDocument;
    doctorPatel: IUserDocument;
    doctorMehta: IUserDocument;
    doctorJoshi: IUserDocument;
    doctorShah: IUserDocument;
    receptionist: IUserDocument;
    billingStaff: IUserDocument;
  };
}

async function seedServices(): Promise<IServiceDocument[]> {
  console.log('\n📝 Seeding services...');
  const created: IServiceDocument[] = [];
  for (let i = 0; i < SERVICES_CATALOG.length; i++) {
    const svc = SERVICES_CATALOG[i];
    const slug = generateSlug(svc.name);
    const existing = await Service.findOne({ slug });
    if (existing) {
      created.push(existing);
      console.log(`  ⚠️  Service exists: ${svc.name}`);
      continue;
    }
    const service = await Service.create({
      ...svc,
      slug,
      longDescription: `<p>${svc.shortDescription}</p><p>At SAI Physiotherapy, we provide comprehensive ${svc.name.toLowerCase()} using evidence-based techniques and state-of-the-art equipment. Our experienced therapists create personalized treatment plans tailored to each patient\'s specific needs and goals.</p><p>Treatment is delivered in a calm, modern clinical environment with one-to-one attention. Most plans run for 6–12 sessions depending on severity; full progress reports are shared with you (and your referring doctor on request) at the end of every phase.</p>`,
      bannerStorageProvider: 'local',
      bannerStorageKey: '',
      images: [svc.bannerImage],
      order: i + 1,
      isActive: true,
      seo: {
        metaTitle: `${svc.name} in Ahmedabad | SAI Physiotherapy`,
        metaDescription: `${svc.shortDescription} Book your appointment at SAI Physiotherapy Ahmedabad.`,
        keywords: [svc.name.toLowerCase(), 'physiotherapy ahmedabad', 'sai physiotherapy', svc.category.toLowerCase()],
        canonicalUrl: '',
        ogImage: svc.bannerImage,
      },
    });
    created.push(service);
    console.log(`  ✅ Service: ${svc.name}`);
  }
  return created;
}

async function seedDoctors(users: Awaited<ReturnType<typeof seedUsers>>): Promise<void> {
  console.log('\n📝 Seeding doctor profiles...');

  const profiles = [
    {
      user: users.doctorPatel,
      name: 'Dr. Rajesh Patel',
      slug: 'dr-rajesh-patel',
      designation: 'Senior Physiotherapist · Spine & Ortho Specialist',
      specialties: ['Spine Care', 'Back Pain', 'Disc Herniation', 'Posture Correction'],
      shortBio: '15+ years treating spine and orthopedic conditions. MPT (Ortho) trained in McKenzie & Mulligan methods.',
      bio: 'Dr. Rajesh Patel is the founder and senior consultant at SAI Physiotherapy. He has treated over 8,000 patients with chronic back pain, sciatica, and post-surgical spine cases. He is certified in the McKenzie Method, Mulligan Concept and Maitland mobilisation, and frequently presents at national physiotherapy conferences. His approach blends evidence-based manual therapy with patient education so people leave the clinic understanding *why* their pain happened — not just how to treat it.',
      photo: ASSETS.doctorPatel,
      qualifications: ['Bachelor of Physiotherapy (BPT) — Gujarat University', 'Master of Physiotherapy (MPT — Orthopedics)', 'Certified McKenzie Practitioner'],
      credentials: ['Indian Association of Physiotherapists (IAP) — Lifetime Member', 'McKenzie Institute International — Cert. MDT', 'Conference Speaker (IAP 2022, 2023)'],
      languages: ['English', 'हिंदी', 'ગુજરાતી'],
      experienceYears: 15,
      registrationNumber: 'GUJ/PT/2010/00451',
      consultationFee: 800,
      days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const,
      timeStart: '09:00',
      timeEnd: '20:00',
      sessionDurationMins: 45,
      notes: 'Closed on second Saturday of each month.',
      socials: { linkedin: 'https://www.linkedin.com/in/dr-rajesh-patel-physio', instagram: '', facebook: '' },
      order: 1,
      seo: {
        metaTitle: 'Dr. Rajesh Patel — Senior Spine Physiotherapist | SAI Physiotherapy Ahmedabad',
        metaDescription: 'Meet Dr. Rajesh Patel, founder of SAI Physiotherapy. 15+ years of spine care, McKenzie & Mulligan certified. Book a consultation in Ahmedabad.',
        keywords: ['spine physiotherapist ahmedabad', 'mckenzie therapy', 'back pain specialist'],
      },
    },
    {
      user: users.doctorMehta,
      name: 'Dr. Anjali Mehta',
      slug: 'dr-anjali-mehta',
      designation: 'Orthopedic Physiotherapist · Post-Surgical Rehab Lead',
      specialties: ['Knee & Joint Care', 'Frozen Shoulder', 'Post-Surgical Rehab', 'Manual Therapy'],
      shortBio: 'Manual therapy & dry needling expert with 12 years guiding patients back from joint surgery and complex pain.',
      bio: 'Dr. Anjali Mehta leads the orthopedic and post-surgical rehab vertical at SAI. She works closely with referring orthopedic surgeons in Ahmedabad to deliver staged rehabilitation after knee replacements, ACL reconstructions, shoulder surgeries and frozen-shoulder manipulation. Her treatment style is hands-on (manual therapy, joint mobilisation, dry needling) combined with progressive strength loading so patients build durable recovery, not short-term relief.',
      photo: ASSETS.doctorMehta,
      qualifications: ['Bachelor of Physiotherapy (BPT)', 'Master of Physiotherapy (MPT — Orthopedics)', 'Certified Dry Needling Practitioner'],
      credentials: ['Indian Association of Physiotherapists — Member', 'Cert. Mulligan Concept (Upper & Lower Quadrant)', 'Cert. Dry Needling — IDN Academy'],
      languages: ['English', 'हिंदी', 'ગુજરાતી'],
      experienceYears: 12,
      registrationNumber: 'GUJ/PT/2013/00892',
      consultationFee: 700,
      days: ['mon', 'wed', 'fri', 'sat'] as const,
      timeStart: '10:00',
      timeEnd: '19:00',
      sessionDurationMins: 45,
      notes: 'Specialist consultation by prior appointment.',
      socials: { linkedin: 'https://www.linkedin.com/in/dr-anjali-mehta-physio', instagram: 'https://www.instagram.com/dranjali.physio', facebook: '' },
      order: 2,
      seo: {
        metaTitle: 'Dr. Anjali Mehta — Knee & Post-Surgical Rehab Specialist | SAI Physiotherapy',
        metaDescription: 'Dr. Anjali Mehta — orthopedic physiotherapist, knee replacement rehab and frozen shoulder specialist. 12+ years experience in Ahmedabad.',
        keywords: ['knee physiotherapist ahmedabad', 'post knee replacement rehab', 'frozen shoulder specialist'],
      },
    },
    {
      user: users.doctorJoshi,
      name: 'Dr. Rakesh Joshi',
      slug: 'dr-rakesh-joshi',
      designation: 'Neuro Physiotherapist · Stroke & Parkinson\'s Lead',
      specialties: ['Neuro Rehab', 'Stroke Recovery', 'Parkinson\'s', 'Pediatric Neuro'],
      shortBio: 'Bobath-certified neuro physio with 14 years of stroke and Parkinson\'s recovery expertise.',
      bio: 'Dr. Rakesh Joshi heads the neuro-rehabilitation team at SAI Physiotherapy. He has worked with several hundred post-stroke patients, ranging from acute (1–2 weeks post event) to chronic (5+ years later) presentations, and is one of very few Bobath-certified practitioners in Gujarat. He also runs the pediatric neuro program for children with cerebral palsy, developmental delay and torticollis.',
      photo: ASSETS.doctorJoshi,
      qualifications: ['Bachelor of Physiotherapy (BPT)', 'Master of Physiotherapy (MPT — Neurology)', 'Bobath Adult Cert. (IBITA)'],
      credentials: ['IBITA — Certified Bobath Practitioner', 'Cert. Pediatric Neurodevelopmental Treatment (NDT)', 'Indian Association of Neuro Physiotherapists — Member'],
      languages: ['English', 'हिंदी'],
      experienceYears: 14,
      registrationNumber: 'GUJ/PT/2011/00612',
      consultationFee: 900,
      days: ['mon', 'tue', 'thu', 'fri', 'sat'] as const,
      timeStart: '09:30',
      timeEnd: '18:30',
      sessionDurationMins: 60,
      notes: 'Pediatric slots reserved before 1 PM.',
      socials: { linkedin: 'https://www.linkedin.com/in/dr-rakesh-joshi-neuro', instagram: '', facebook: '' },
      order: 3,
      seo: {
        metaTitle: 'Dr. Rakesh Joshi — Neuro Physiotherapist (Stroke & Parkinson\'s) | SAI Physiotherapy',
        metaDescription: 'Bobath-certified neuro physiotherapist. Stroke recovery, Parkinson\'s and pediatric neuro rehab specialist in Ahmedabad.',
        keywords: ['stroke rehabilitation ahmedabad', 'neuro physiotherapist', 'parkinson\'s physiotherapy'],
      },
    },
    {
      user: users.doctorShah,
      name: 'Dr. Karan Shah',
      slug: 'dr-karan-shah',
      designation: 'Sports Physiotherapist · ACL & Return-to-Play Lead',
      specialties: ['Sports Injury', 'ACL Rehab', 'Tendinopathies', 'Performance Conditioning'],
      shortBio: 'Sports-medicine physio working with cricketers, runners and amateur athletes. ACL & RTP specialist.',
      bio: 'Dr. Karan Shah leads SAI\'s sports rehabilitation vertical. He works with state-level cricketers, marathon runners and weekend warriors across Gujarat. His structured ACL rehabilitation program (16–24 weeks, criteria-based progression with return-to-sport testing) has helped several athletes get back on the field safely. Outside the clinic he consults with two local cricket academies on injury prevention.',
      photo: ASSETS.doctorShah,
      qualifications: ['Bachelor of Physiotherapy (BPT)', 'Master of Physiotherapy (MPT — Sports)', 'Certified Strength & Conditioning Coach'],
      credentials: ['IAP — Member', 'NSCA Certified Strength & Conditioning Specialist', 'Conference Presenter — Sports Physio India 2023'],
      languages: ['English', 'हिंदी', 'ગુજરાતી'],
      experienceYears: 9,
      registrationNumber: 'GUJ/PT/2016/01103',
      consultationFee: 750,
      days: ['mon', 'tue', 'wed', 'thu', 'fri'] as const,
      timeStart: '08:00',
      timeEnd: '20:00',
      sessionDurationMins: 60,
      notes: 'Saturday availability on request.',
      socials: { linkedin: 'https://www.linkedin.com/in/dr-karan-shah-sportsphysio', instagram: 'https://www.instagram.com/karan.sportsphysio', facebook: '' },
      order: 4,
      seo: {
        metaTitle: 'Dr. Karan Shah — Sports Physiotherapist & ACL Rehab | SAI Physiotherapy',
        metaDescription: 'Sports medicine physiotherapist. ACL reconstruction rehab, return-to-play and performance conditioning in Ahmedabad.',
        keywords: ['sports physiotherapist ahmedabad', 'acl rehabilitation', 'return to play'],
      },
    },
  ];

  for (const p of profiles) {
    const existing = await Doctor.findOne({ slug: p.slug });
    if (existing) {
      console.log(`  ⚠️  Doctor profile exists: ${p.name}`);
      continue;
    }
    await Doctor.create({
      name: p.name,
      slug: p.slug,
      designation: p.designation,
      specialties: p.specialties,
      shortBio: p.shortBio,
      bio: p.bio,
      photo: {
        url: p.photo,
        storageKey: '',
        storageProvider: 'local',
        mimetype: 'image/png',
      },
      qualifications: p.qualifications,
      credentials: p.credentials,
      languages: p.languages,
      experienceYears: p.experienceYears,
      registrationNumber: p.registrationNumber,
      consultationFee: p.consultationFee,
      availability: {
        days: [...p.days],
        timeStart: p.timeStart,
        timeEnd: p.timeEnd,
        sessionDurationMins: p.sessionDurationMins,
        notes: p.notes,
      },
      userId: p.user._id,
      socials: p.socials,
      order: p.order,
      isActive: true,
      seo: p.seo,
    });
    console.log(`  ✅ Doctor profile: ${p.name}`);
  }
}

async function seedClinicSettings(services: IServiceDocument[]): Promise<void> {
  console.log('\n📝 Seeding clinic settings...');
  const featured = services
    .filter((s) => ['Back Pain Treatment', 'Spine Care & Disc Problems', 'Paralysis Rehabilitation', 'Knee Pain & Joint Care'].includes(s.name))
    .map((s) => s._id as Types.ObjectId);

  const payload = {
    clinicName: 'SAI Physiotherapy Spine Care & Paralysis Centre',
    tagline: "Gujarat's Leading Physiotherapy & Rehabilitation Center",
    logo: ASSETS.logo,
    favicon: ASSETS.favicon,
    contact: {
      phones: ['+91 99999 99999', '+91 88888 88888'],
      whatsapp: '+919999999999',
      emails: ['clinic@saiphysiotherapy.com', 'info@saiphysiotherapy.com'],
      address: 'SAI Physiotherapy Spine Care & Paralysis Centre, Bodakdev, Ahmedabad',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380054',
      googleMapsUrl: 'https://maps.google.com/?q=SAI+Physiotherapy+Ahmedabad',
      googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3672!2d72.5!3d23.03',
    },
    socialMedia: {
      facebook: 'https://www.facebook.com/saiphysiotherapy',
      instagram: 'https://www.instagram.com/saiphysiotherapy',
      youtube: 'https://www.youtube.com/@saiphysiotherapy',
      twitter: 'https://twitter.com/saiphysio',
      linkedin: 'https://www.linkedin.com/company/saiphysiotherapy',
    },
    businessHours: [
      { day: 'Monday', openTime: '08:00', closeTime: '20:00', isClosed: false },
      { day: 'Tuesday', openTime: '08:00', closeTime: '20:00', isClosed: false },
      { day: 'Wednesday', openTime: '08:00', closeTime: '20:00', isClosed: false },
      { day: 'Thursday', openTime: '08:00', closeTime: '20:00', isClosed: false },
      { day: 'Friday', openTime: '08:00', closeTime: '20:00', isClosed: false },
      { day: 'Saturday', openTime: '08:00', closeTime: '18:00', isClosed: false },
      { day: 'Sunday', openTime: '09:00', closeTime: '13:00', isClosed: false },
    ],
    seo: {
      globalMetaTitle: 'SAI Physiotherapy Spine Care & Paralysis Centre | Ahmedabad, Gujarat',
      globalMetaDescription: "Gujarat's leading physiotherapy and rehabilitation centre. Expert treatment for back pain, spine care, paralysis, sports injuries, and more. Book your appointment today.",
      googleAnalyticsId: 'G-XXXXXXXXXX',
      googleSearchConsole: 'sai-physio-verification-token',
    },
    homepage: {
      heroSlides: [
        {
          title: 'Heal. Recover. Thrive.',
          subtitle: "Gujarat's Most Advanced Physiotherapy & Rehabilitation Center",
          image: ASSETS.svcBackPain,
          ctaText: 'Book Appointment',
          ctaLink: '/book-appointment',
        },
        {
          title: 'Expert Spine Care',
          subtitle: 'Specialized treatment for all spinal conditions with cutting-edge technology.',
          image: ASSETS.svcSpine,
          ctaText: 'Our Services',
          ctaLink: '/services',
        },
        {
          title: 'Reclaim Your Mobility',
          subtitle: 'Comprehensive paralysis and stroke rehabilitation by Bobath-certified specialists.',
          image: ASSETS.svcNeuro,
          ctaText: 'Meet the Team',
          ctaLink: '/doctors',
        },
      ],
      stats: [
        { label: 'Patients Treated', value: '10,000+', icon: 'users' },
        { label: 'Years of Experience', value: '15+', icon: 'calendar' },
        { label: 'Specialised Services', value: '12+', icon: 'activity' },
        { label: 'Success Rate', value: '95%', icon: 'star' },
      ],
      featuredServices: featured,
      promotionBanner: {
        text: '🎉 First consultation is on us — book your free 20-min assessment this month.',
        isActive: true,
      },
    },
  };

  const existing = await ClinicSettings.findOne();
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    console.log('  ✅ Clinic settings updated');
  } else {
    await ClinicSettings.create(payload);
    console.log('  ✅ Clinic settings created');
  }
}

async function seedPatients(
  users: Awaited<ReturnType<typeof seedUsers>>,
): Promise<IPatientDocument[]> {
  console.log('\n📝 Seeding patients...');
  const { admin, doctorPatel, doctorMehta, doctorJoshi, doctorShah } = users;

  const PATIENT_SEEDS = [
    { name: 'Priya Sharma', dob: '1985-03-12', gender: 'female', phone: '9876543210', email: 'priya.sharma@example.com', address: 'B-204, Maple Heights, Bodakdev', city: 'Ahmedabad', bloodGroup: 'O+', emergency: { name: 'Rajeev Sharma', phone: '9876543211', relation: 'Husband' }, complaint: 'Chronic lower back pain for 3 years, worse on prolonged sitting', past: 'Hypertension, controlled', surgical: 'None', meds: ['Telmisartan 40mg'], allergies: ['Sulfa drugs'], comorbidities: ['Hypertension'], status: 'active', doctor: doctorPatel, tags: ['Chronic', 'Office worker'] },
    { name: 'Rajesh Patel', dob: '1972-07-08', gender: 'male', phone: '9876543212', email: 'rajesh.patel@example.com', address: '12, Sunrise Apartments, Satellite', city: 'Ahmedabad', bloodGroup: 'B+', emergency: { name: 'Meera Patel', phone: '9876543213', relation: 'Wife' }, complaint: 'Post total knee replacement rehabilitation, left knee', past: 'Type 2 diabetes for 10 years', surgical: 'Left total knee replacement (2 weeks ago)', meds: ['Metformin 500mg', 'Aspirin 75mg'], allergies: [], comorbidities: ['Type 2 diabetes', 'Mild osteoarthritis'], status: 'active', doctor: doctorMehta, tags: ['Post-surgical'] },
    { name: 'Meena Joshi', dob: '1958-11-23', gender: 'female', phone: '9876543214', email: 'meena.joshi@example.com', address: '7, Lake View Society, Vastrapur', city: 'Ahmedabad', bloodGroup: 'A+', emergency: { name: 'Arvind Joshi', phone: '9876543215', relation: 'Son' }, complaint: 'Right hemiplegia after stroke, 6 weeks ago', past: 'Hypertension, atrial fibrillation', surgical: 'None', meds: ['Apixaban 5mg', 'Telmisartan 40mg', 'Rosuvastatin 10mg'], allergies: [], comorbidities: ['Stroke', 'AF', 'Hypertension'], status: 'active', doctor: doctorJoshi, tags: ['Neuro', 'Geriatric'] },
    { name: 'Vikram Shah', dob: '1990-05-19', gender: 'male', phone: '9876543216', email: 'vikram.shah@example.com', address: '34, Pearl Residency, Prahladnagar', city: 'Ahmedabad', bloodGroup: 'AB+', emergency: { name: 'Nisha Shah', phone: '9876543217', relation: 'Spouse' }, complaint: 'Cervical spondylosis with radiating pain to left arm', past: 'Migraine', surgical: 'None', meds: ['Sumatriptan PRN'], allergies: [], comorbidities: [], status: 'active', doctor: doctorPatel, tags: ['Spine', 'IT professional'] },
    { name: 'Anita Desai', dob: '1995-09-04', gender: 'female', phone: '9876543218', email: 'anita.desai@example.com', address: 'D-12, Green Park, Thaltej', city: 'Ahmedabad', bloodGroup: 'O-', emergency: { name: 'Pooja Desai', phone: '9876543219', relation: 'Sister' }, complaint: 'ACL tear, left knee — sports injury (badminton)', past: 'Healthy, recreational athlete', surgical: 'ACL reconstruction (3 weeks ago)', meds: ['Paracetamol PRN'], allergies: [], comorbidities: [], status: 'active', doctor: doctorShah, tags: ['Sports'] },
    { name: 'Harish Kumar', dob: '1968-12-15', gender: 'male', phone: '9876543220', email: 'harish.kumar@example.com', address: '89, Royal Heritage, Bopal', city: 'Ahmedabad', bloodGroup: 'B-', emergency: { name: 'Sunita Kumar', phone: '9876543221', relation: 'Wife' }, complaint: 'Frozen shoulder, right side, ongoing 4 months', past: 'Type 2 diabetes', surgical: 'None', meds: ['Metformin 500mg', 'Glimepiride 1mg'], allergies: [], comorbidities: ['Diabetes'], status: 'active', doctor: doctorMehta, tags: ['Chronic'] },
    { name: 'Kavita Iyer', dob: '1980-04-27', gender: 'female', phone: '9876543222', email: 'kavita.iyer@example.com', address: '5, Crystal Apartments, Navrangpura', city: 'Ahmedabad', bloodGroup: 'A+', emergency: { name: 'Suresh Iyer', phone: '9876543223', relation: 'Husband' }, complaint: 'Tennis elbow, right side, 2 months', past: 'None', surgical: 'None', meds: [], allergies: [], comorbidities: [], status: 'discharged', doctor: doctorMehta, tags: ['Discharged'] },
    { name: 'Aarav Mehta', dob: '2018-06-30', gender: 'male', phone: '9876543224', email: '', address: '15, Springdale Society, SG Highway', city: 'Ahmedabad', bloodGroup: 'O+', emergency: { name: 'Pooja Mehta', phone: '9876543225', relation: 'Mother' }, complaint: 'Mild cerebral palsy, gross motor delay', past: 'Premature birth at 32 weeks', surgical: 'None', meds: [], allergies: [], comorbidities: ['Cerebral palsy'], status: 'active', doctor: doctorJoshi, tags: ['Pediatric'] },
    { name: 'Ramesh Trivedi', dob: '1949-02-11', gender: 'male', phone: '9876543226', email: '', address: '22, Heritage Bungalows, Maninagar', city: 'Ahmedabad', bloodGroup: 'B+', emergency: { name: 'Nilesh Trivedi', phone: '9876543227', relation: 'Son' }, complaint: 'Geriatric balance and fall prevention', past: 'Two falls in last year, mild dementia', surgical: 'Cataract surgery 2020', meds: ['Donepezil 5mg'], allergies: [], comorbidities: ['Mild dementia', 'Osteoarthritis'], status: 'followup', doctor: doctorPatel, tags: ['Geriatric'] },
    { name: 'Neha Verma', dob: '1992-08-14', gender: 'female', phone: '9876543228', email: 'neha.verma@example.com', address: '101, Skyline Towers, Chandkheda', city: 'Ahmedabad', bloodGroup: 'AB-', emergency: { name: 'Rahul Verma', phone: '9876543229', relation: 'Brother' }, complaint: 'Postpartum lower back pain and pelvic floor weakness', past: 'C-section delivery 4 months ago', surgical: 'C-section', meds: [], allergies: [], comorbidities: [], status: 'active', doctor: doctorMehta, tags: ['Postpartum'] },
  ];

  const created: IPatientDocument[] = [];
  for (const p of PATIENT_SEEDS) {
    const existing = await Patient.findOne({ 'personalInfo.phone': p.phone });
    if (existing) {
      created.push(existing);
      continue;
    }
    const patient = await Patient.create({
      patientId: await generatePatientId(),
      personalInfo: {
        name: p.name,
        dob: new Date(p.dob),
        gender: p.gender,
        phone: p.phone,
        email: p.email,
        address: p.address,
        city: p.city,
        bloodGroup: p.bloodGroup,
        emergencyContact: p.emergency,
      },
      medicalHistory: {
        chiefComplaint: p.complaint,
        pastHistory: p.past,
        surgicalHistory: p.surgical,
        medications: p.meds,
        allergies: p.allergies,
        comorbidities: p.comorbidities,
      },
      // Sample document attachment on first two patients
      documents:
        created.length < 2
          ? [
              {
                type: 'mri' as const,
                url: '/uploads/patients/2026/05/sample-mri-report.pdf',
                storageKey: `patients/2026/05/${p.phone}-sample-mri.pdf`,
                storageProvider: 'local' as const,
                mimetype: 'application/pdf',
                size: 245_678,
                uploadedAt: new Date(),
                uploadedBy: admin._id,
              },
            ]
          : [],
      assignedDoctor: p.doctor._id,
      status: p.status,
      tags: p.tags,
      createdBy: admin._id,
    });
    created.push(patient);
    console.log(`  ✅ Patient: ${patient.patientId} — ${p.name}`);
  }

  return created;
}

async function seedAppointments(
  patients: IPatientDocument[],
  users: Awaited<ReturnType<typeof seedUsers>>,
  services: IServiceDocument[],
): Promise<IAppointmentDocument[]> {
  console.log('\n📝 Seeding appointments...');
  const { admin, doctorPatel, doctorMehta, doctorJoshi, doctorShah } = users;

  const findSvc = (keyword: string) =>
    services.find((s) => s.name.toLowerCase().includes(keyword.toLowerCase())) ?? services[0];

  const today = new Date();
  const dayOffset = (days: number, hour: number, min = 0) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    d.setHours(hour, min, 0, 0);
    return d;
  };

  const APPOINTMENT_SEEDS = [
    { patient: patients[0], service: findSvc('Back Pain'), doctor: doctorPatel, when: dayOffset(0, 10), status: 'completed', type: 'followup' },
    { patient: patients[1], service: findSvc('Post-Surgery'), doctor: doctorMehta, when: dayOffset(0, 11, 30), status: 'completed', type: 'followup' },
    { patient: patients[2], service: findSvc('Paralysis'), doctor: doctorJoshi, when: dayOffset(0, 14), status: 'in_progress', type: 'followup' },
    { patient: patients[3], service: findSvc('Neck Pain'), doctor: doctorPatel, when: dayOffset(0, 16), status: 'confirmed', type: 'followup' },
    { patient: patients[4], service: findSvc('Sports Injury'), doctor: doctorShah, when: dayOffset(0, 17, 30), status: 'scheduled', type: 'followup' },
    { patient: patients[5], service: findSvc('Frozen Shoulder'), doctor: doctorMehta, when: dayOffset(1, 9, 30), status: 'confirmed', type: 'followup' },
    { patient: patients[6], service: findSvc('Shoulder Pain'), doctor: doctorMehta, when: dayOffset(1, 11), status: 'scheduled', type: 'followup' },
    { patient: patients[7], service: findSvc('Pediatric'), doctor: doctorJoshi, when: dayOffset(1, 15), status: 'scheduled', type: 'followup' },
    { patient: patients[8], service: findSvc('Geriatric'), doctor: doctorPatel, when: dayOffset(2, 10), status: 'scheduled', type: 'followup' },
    { patient: patients[9], service: findSvc('Back Pain'), doctor: doctorMehta, when: dayOffset(2, 16), status: 'scheduled', type: 'new' },
    { patient: patients[0], service: findSvc('Back Pain'), doctor: doctorPatel, when: dayOffset(-2, 10), status: 'completed', type: 'followup' },
    { patient: patients[1], service: findSvc('Post-Surgery'), doctor: doctorMehta, when: dayOffset(-2, 11, 30), status: 'completed', type: 'followup' },
    { patient: patients[2], service: findSvc('Paralysis'), doctor: doctorJoshi, when: dayOffset(-3, 14), status: 'completed', type: 'followup' },
    { patient: patients[4], service: findSvc('Sports Injury'), doctor: doctorShah, when: dayOffset(-4, 17, 30), status: 'completed', type: 'followup' },
    { patient: patients[5], service: findSvc('Frozen Shoulder'), doctor: doctorMehta, when: dayOffset(-5, 9, 30), status: 'completed', type: 'followup' },
    { patient: patients[3], service: findSvc('Neck Pain'), doctor: doctorPatel, when: dayOffset(-6, 16), status: 'cancelled', type: 'followup' },
    { patient: patients[6], service: findSvc('Shoulder Pain'), doctor: doctorMehta, when: dayOffset(-7, 11), status: 'completed', type: 'new' },
    { patient: patients[8], service: findSvc('Geriatric'), doctor: doctorPatel, when: dayOffset(-10, 10), status: 'no_show', type: 'followup' },
    { patient: patients[7], service: findSvc('Pediatric'), doctor: doctorJoshi, when: dayOffset(-12, 14), status: 'completed', type: 'followup' },
    { patient: patients[9], service: findSvc('Back Pain'), doctor: doctorMehta, when: dayOffset(-14, 16), status: 'completed', type: 'new' },
  ];

  const created: IAppointmentDocument[] = [];
  let tokenCounter = 1;
  for (const a of APPOINTMENT_SEEDS) {
    const existing = await Appointment.findOne({ patient: a.patient._id, scheduledAt: a.when });
    if (existing) {
      created.push(existing);
      continue;
    }
    const appt = await Appointment.create({
      appointmentId: await generateAppointmentId(),
      patient: a.patient._id,
      doctor: a.doctor._id,
      service: a.service._id,
      scheduledAt: a.when,
      duration: 45,
      status: a.status,
      type: a.type,
      tokenNumber: tokenCounter++,
      notes:
        a.status === 'cancelled'
          ? 'Rescheduled by patient — flu symptoms.'
          : a.status === 'no_show'
            ? 'No-show, follow-up call scheduled.'
            : 'Per assigned rehab protocol.',
      cancelReason: a.status === 'cancelled' ? 'Patient unwell' : undefined,
      reminders: { sms: true, email: false, whatsapp: true },
      bookedBy: admin._id,
    });
    created.push(appt);
  }
  console.log(`  ✅ Created ${created.length} appointments`);
  return created;
}

async function seedTreatmentSessions(
  appointments: IAppointmentDocument[],
  patients: IPatientDocument[],
): Promise<void> {
  console.log('\n📝 Seeding treatment sessions...');
  const finished = appointments.filter((a) => a.status === 'completed' || a.status === 'in_progress');

  const SOAP_TEMPLATES = [
    {
      subjective: 'Patient reports 60% improvement in pain since last session. Sleep is better. No new complaints.',
      objective: 'Lumbar ROM: flexion 70°, extension 20°. SLR negative bilaterally. Strength 4/5 in core stabilizers.',
      assessment: 'Significant improvement in lumbar function. Tolerating progressive loading well.',
      plan: 'Continue current protocol. Progress core strengthening to level 3. Reassess in 2 sessions.',
    },
    {
      subjective: 'Patient feeling much better. Able to perform daily activities with minimal discomfort.',
      objective: 'ROM near full. Pain on movement reduced from 6/10 to 2/10. Functional tests improved.',
      assessment: 'Excellent recovery progress. Ready for return-to-activity phase.',
      plan: 'Begin sport-specific drills. Add plyometric loading. Discharge planning in 2-3 sessions.',
    },
    {
      subjective: 'Reports occasional stiffness in mornings, otherwise comfortable throughout the day.',
      objective: 'Joint mobility within functional range. Mild residual tightness in capsule. Strength symmetrical.',
      assessment: 'Functional restoration achieved. Maintenance phase appropriate.',
      plan: 'Home exercise program reviewed. Monthly follow-up. Discharge with maintenance plan.',
    },
  ];

  let count = 0;
  for (let i = 0; i < finished.length; i++) {
    const appt = finished[i];
    const exists = await TreatmentSession.findOne({ appointment: appt._id });
    if (exists) continue;

    const sessionNumber = (await TreatmentSession.countDocuments({ patient: appt.patient })) + 1;
    const tpl = SOAP_TEMPLATES[i % SOAP_TEMPLATES.length];
    const patient = patients.find((p) => p._id.toString() === appt.patient.toString());

    await TreatmentSession.create({
      patient: appt.patient,
      appointment: appt._id,
      doctor: appt.doctor,
      sessionNumber,
      date: appt.scheduledAt,
      chiefComplaint:
        patient?.medicalHistory?.chiefComplaint ?? 'Per assigned protocol — ongoing rehabilitation',
      soapNotes: tpl,
      vitalSigns: {
        bp: '120/80',
        pulse: 72,
        temperature: 36.7,
        spo2: 98,
        painScale: Math.max(0, 6 - sessionNumber),
      },
      treatmentsGiven: ['Manual therapy', 'Therapeutic ultrasound', 'IFT', 'Stretching protocol'],
      exercisesPrescribed: [
        'Pelvic tilts 3×10',
        'Bridges 3×12',
        'Bird-dog 2×10 each side',
        'Stretching routine 10 min',
      ],
      recoveryPercentage: Math.min(95, 30 + sessionNumber * 12),
      nextSessionDate: new Date(appt.scheduledAt.getTime() + 3 * 24 * 60 * 60 * 1000),
      attachments:
        i === 0
          ? ['/uploads/patients/2026/05/sample-session-photo.jpg']
          : [],
    });
    count++;
  }
  console.log(`  ✅ Created ${count} treatment sessions`);
}

async function seedBillings(
  appointments: IAppointmentDocument[],
  services: IServiceDocument[],
  users: Awaited<ReturnType<typeof seedUsers>>,
): Promise<void> {
  console.log('\n📝 Seeding billings...');
  const { admin, billingStaff } = users;
  const finished = appointments.filter((a) => a.status === 'completed' || a.status === 'in_progress');

  let count = 0;
  for (let i = 0; i < finished.length; i++) {
    const appt = finished[i];
    const exists = await Billing.findOne({ appointment: appt._id });
    if (exists) continue;

    const svc = services.find((s) => s._id.toString() === appt.service.toString()) ?? services[0];
    const unitPrice = svc.price?.from ?? 800;
    const items = [
      {
        description: `${svc.name} — Session ${(i % 6) + 1}`,
        quantity: 1,
        unitPrice,
        total: unitPrice,
      },
    ];
    const subtotal = unitPrice;
    const discount = i % 4 === 0 ? 100 : 0;
    const tax = 0;
    const totalAmount = subtotal - discount + tax;

    const scenarios = [
      { paid: totalAmount, status: 'paid' as const, method: 'upi_manual' as const },
      { paid: totalAmount, status: 'paid' as const, method: 'cash' as const },
      { paid: Math.round(totalAmount * 0.5), status: 'partial' as const, method: 'cash' as const },
      { paid: 0, status: 'pending' as const, method: 'pending' as const },
    ];
    const sc = scenarios[i % scenarios.length];

    await Billing.create({
      invoiceNumber: await generateInvoiceNumber(),
      patient: appt.patient,
      appointment: appt._id,
      items,
      subtotal,
      discount,
      discountType: 'flat',
      tax,
      totalAmount,
      amountPaid: sc.paid,
      balanceDue: totalAmount - sc.paid,
      paymentMethod: sc.method,
      paymentStatus: sc.status,
      paymentDate: sc.status === 'paid' ? appt.scheduledAt : undefined,
      receivedBy: sc.status !== 'pending' ? billingStaff._id : admin._id,
      notes:
        sc.status === 'partial'
          ? 'Partial payment — balance due at next visit.'
          : sc.status === 'pending'
            ? 'Awaiting payment at next visit.'
            : 'Paid in full.',
      createdBy: admin._id,
    });
    count++;
  }
  console.log(`  ✅ Created ${count} invoices`);
}

async function seedBlogs(users: Awaited<ReturnType<typeof seedUsers>>): Promise<void> {
  console.log('\n📝 Seeding blogs...');
  const { doctorPatel, doctorMehta, doctorJoshi, doctorShah } = users;

  const BLOGS = [
    { title: '5 Physiotherapist-Approved Exercises for Lower Back Pain Relief', slug: '5-exercises-for-lower-back-pain', category: 'Back Pain', tags: ['back pain', 'exercise', 'home therapy'], excerpt: 'Lower back pain affects 80% of people. Our senior physiotherapist shares five evidence-based exercises you can do at home for immediate relief.', author: doctorPatel, cover: ASSETS.blogBack },
    { title: 'Understanding Cervical Spondylosis: Causes, Symptoms & Treatment', slug: 'understanding-cervical-spondylosis', category: 'Spine Care', tags: ['neck pain', 'spondylosis', 'spine'], excerpt: 'Neck pain and stiffness are increasingly common in the digital age. Learn how cervical spondylosis develops and how physiotherapy offers long-term relief.', author: doctorMehta, cover: ASSETS.blogSpondylosis },
    { title: 'A Complete Guide to Post-Stroke Rehabilitation & Recovery', slug: 'post-stroke-rehabilitation-guide', category: 'Neuro Rehab', tags: ['stroke', 'neuro', 'rehabilitation'], excerpt: 'Stroke recovery is a journey. Our neuro physio team explains the stages of recovery and what to expect from a structured rehabilitation program.', author: doctorJoshi, cover: ASSETS.blogStroke },
    { title: 'Managing Knee Osteoarthritis with Physiotherapy — A Patient Guide', slug: 'knee-osteoarthritis-management', category: 'Joint Care', tags: ['knee', 'arthritis', 'joints'], excerpt: "Knee osteoarthritis doesn\'t have to mean a lifetime of pain. Learn how targeted physiotherapy can significantly reduce pain and improve function.", author: doctorPatel, cover: ASSETS.svcKnee },
    { title: '10 Physiotherapist Tips to Prevent Sports Injuries', slug: 'sports-injury-prevention-tips', category: 'Sports', tags: ['sports', 'prevention', 'fitness'], excerpt: 'Prevention is better than cure. Our sports physio experts share essential warm-up, cool-down, and conditioning tips for athletes of all levels.', author: doctorShah, cover: ASSETS.svcSports },
    { title: 'Frozen Shoulder: What It Is and How We Treat It', slug: 'frozen-shoulder-treatment', category: 'Shoulder', tags: ['shoulder', 'frozen shoulder', 'mobility'], excerpt: 'Adhesive capsulitis affects 2-5% of the population. Discover the stages, symptoms, and physiotherapy treatments that restore full shoulder mobility.', author: doctorMehta, cover: ASSETS.svcSports },
  ];

  for (const b of BLOGS) {
    if (await Blog.findOne({ slug: b.slug })) continue;
    await Blog.create({
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: `<p>${b.excerpt}</p><h2>Introduction</h2><p>At SAI Physiotherapy we treat hundreds of patients with this exact condition each year. This article distills what we have learnt into a practical, evidence-based guide.</p><h2>Key Points</h2><ul><li>Evidence-based recommendations from clinical practice.</li><li>Practical, actionable advice you can start today.</li><li>Clear indicators of when to seek professional help.</li></ul><h2>What we recommend</h2><p>Begin with the gentlest progression. Pain that worsens, radiates or persists beyond 72 hours warrants an in-person assessment. <a href="/book-appointment">Book a consultation</a> with our team to get a personalised plan.</p>`,
      featuredImage: b.cover,
      featuredStorageKey: '',
      featuredStorageProvider: 'local',
      author: b.author._id,
      category: b.category,
      tags: b.tags,
      status: 'published',
      publishedAt: new Date(Date.now() - Math.floor(Math.random() * 40) * 24 * 60 * 60 * 1000),
      seo: {
        metaTitle: `${b.title} | SAI Physiotherapy`,
        metaDescription: b.excerpt,
        keywords: b.tags,
        ogImage: b.cover,
      },
      views: Math.floor(Math.random() * 800) + 120,
    });
    console.log(`  ✅ Blog: ${b.title}`);
  }
}

async function seedTestimonials(): Promise<void> {
  console.log('\n📝 Seeding testimonials...');

  const TESTIMONIALS = [
    { patientName: 'Priya Sharma', patientAge: 39, condition: 'Chronic Lower Back Pain', rating: 5, review: "After suffering from chronic back pain for 3 years, SAI Physiotherapy gave me my life back! Dr. Patel\'s treatment plan was exceptional and I recovered in just 2 months.", isApproved: true, isFeatured: true, source: 'manual' as const, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { patientName: 'Rajesh Patel', patientAge: 51, condition: 'Knee Replacement Rehab', rating: 5, review: 'Post knee replacement, I was worried about recovery. The team here made it seamless. The exercises and physiotherapy sessions were perfectly planned. Highly recommend!', isApproved: true, isFeatured: true, source: 'manual' as const, beforeAfterImages: { before: ASSETS.svcKnee, after: ASSETS.svcSports } },
    { patientName: 'Meena Joshi', patientAge: 65, condition: 'Paralysis Rehab', rating: 5, review: "My mother had a stroke and couldn\'t walk. After 6 months of rehabilitation at SAI, she can now walk independently. The staff is incredibly skilled and caring.", isApproved: true, isFeatured: true, source: 'manual' as const },
    { patientName: 'Vikram Shah', patientAge: 33, condition: 'Cervical Spondylosis', rating: 5, review: 'Cervical pain was affecting my work daily. The team here diagnosed correctly and within 10 sessions I felt 80% better. Excellent knowledge and professional approach.', isApproved: true, isFeatured: false, source: 'website_form' as const },
    { patientName: 'Anita Desai', patientAge: 28, condition: 'Sports Injury', rating: 5, review: "As a runner with a ligament tear, I needed quick recovery. SAI\'s sports rehab program got me back on the track in record time. Couldn\'t be happier!", isApproved: true, isFeatured: false, source: 'google' as const },
    { patientName: 'Harish Kumar', patientAge: 55, condition: 'Frozen Shoulder', rating: 5, review: 'Frozen shoulder was limiting everything from driving to sleeping. The physiotherapists here are world-class. Full mobility restored in 8 weeks!', isApproved: true, isFeatured: false, source: 'website_form' as const },
    { patientName: 'Kavita Iyer', patientAge: 43, condition: 'Tennis Elbow', rating: 4, review: 'Quick recovery from tennis elbow. The staff was very knowledgeable and patient. Slightly long wait times on Saturdays but otherwise excellent.', isApproved: true, isFeatured: false, source: 'website_form' as const },
    { patientName: 'Ramesh Trivedi', patientAge: 75, condition: 'Geriatric Care', rating: 5, review: 'After two falls last year, I had lost confidence. The geriatric program here helped me regain my balance and independence. Highly recommended for seniors.', isApproved: true, isFeatured: false, source: 'manual' as const },
    { patientName: 'Sanjay Gupta', patientAge: 47, condition: 'Disc Herniation', rating: 5, review: "My MRI showed a disc herniation and surgery was suggested. SAI Physiotherapy\'s conservative approach saved me from surgery. 6 months pain-free now.", isApproved: false, isFeatured: false, source: 'website_form' as const },
    { patientName: 'Pooja Mehta', patientAge: 32, condition: 'Pediatric Therapy', rating: 5, review: 'My son has been receiving pediatric therapy here. The therapists make him feel comfortable and the progress has been visible. Thank you SAI team!', isApproved: false, isFeatured: false, source: 'website_form' as const },
  ];

  for (const t of TESTIMONIALS) {
    if (await Testimonial.findOne({ patientName: t.patientName, condition: t.condition })) continue;
    await Testimonial.create(t);
  }
  console.log('  ✅ Testimonials seeded');
}

async function seedGallery(users: Awaited<ReturnType<typeof seedUsers>>): Promise<void> {
  console.log('\n📝 Seeding gallery...');
  const { admin } = users;

  const GALLERY = [
    { title: 'SAI Physiotherapy reception', caption: 'Modern, welcoming front-desk and patient lounge.', category: 'clinic' as const, image: ASSETS.svcBackPain, alt: 'Reception area of SAI Physiotherapy clinic', order: 1 },
    { title: 'Spine traction unit', caption: 'Computerised intermittent lumbar traction.', category: 'clinic' as const, image: ASSETS.svcSpine, alt: 'Spine traction machine at SAI Physiotherapy', order: 2 },
    { title: 'Rehab gym floor', caption: 'Strength & conditioning corner with full equipment.', category: 'clinic' as const, image: ASSETS.svcSports, alt: 'Physiotherapy rehabilitation gym', order: 3 },
    { title: 'Manual therapy session', caption: 'Hands-on mobilisation by Dr. Anjali Mehta.', category: 'treatments' as const, image: ASSETS.svcKnee, alt: 'Manual therapy session in progress', order: 4 },
    { title: 'Neuro-rehab gait training', caption: 'Post-stroke gait training with parallel bars.', category: 'treatments' as const, image: ASSETS.svcNeuro, alt: 'Patient practising walking on parallel bars', order: 5 },
    { title: 'Pediatric play-based therapy', caption: 'Sensory integration session for a young patient.', category: 'treatments' as const, image: ASSETS.svcPediatric, alt: 'Child engaged in play-based physiotherapy', order: 6 },
    { title: 'World Physiotherapy Day 2025', caption: 'Free consultation camp organised by SAI on Sept 8th.', category: 'events' as const, image: ASSETS.svcBackPain, alt: 'Group photo at World Physiotherapy Day event', order: 7 },
    { title: 'Sports injury awareness camp', caption: 'Outreach session at a local cricket academy.', category: 'events' as const, image: ASSETS.svcSports, alt: 'Sports injury awareness camp at cricket academy', order: 8 },
    { title: 'Best Physiotherapy Clinic 2024', caption: 'Gujarat Healthcare Excellence Award.', category: 'awards' as const, image: ASSETS.svcSpine, alt: 'Healthcare excellence award certificate', order: 9 },
    { title: 'NABH Recognition', caption: 'Quality and safety standards recognition.', category: 'awards' as const, image: ASSETS.svcKnee, alt: 'NABH recognition certificate', order: 10 },
    { title: 'Dr. Rajesh Patel', caption: 'Founder & Senior Physiotherapist', category: 'team' as const, image: ASSETS.doctorPatel, alt: 'Portrait of Dr. Rajesh Patel', order: 11 },
    { title: 'Dr. Anjali Mehta', caption: 'Orthopedic Physiotherapy Lead', category: 'team' as const, image: ASSETS.doctorMehta, alt: 'Portrait of Dr. Anjali Mehta', order: 12 },
  ];

  for (const g of GALLERY) {
    const existing = await Gallery.findOne({ title: g.title, category: g.category });
    if (existing) continue;
    await Gallery.create({
      title: g.title,
      caption: g.caption,
      category: g.category,
      image: {
        url: g.image,
        storageKey: '',
        storageProvider: 'local',
        mimetype: 'image/png',
      },
      alt: g.alt,
      order: g.order,
      isPublished: true,
      createdBy: admin._id,
    });
    console.log(`  ✅ Gallery: ${g.title}`);
  }
}

async function seedCmsPages(users: Awaited<ReturnType<typeof seedUsers>>): Promise<void> {
  console.log('\n📝 Seeding CMS pages...');
  const { admin } = users;

  const PAGES = [
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      excerpt: 'How SAI Physiotherapy collects, uses, and protects your personal and medical information.',
      content: `<h2>1. Introduction</h2><p>SAI Physiotherapy Spine Care & Paralysis Centre ("we", "us", "our") is committed to protecting the privacy of every person who visits our clinic, our website, or who interacts with us via phone, WhatsApp or email.</p><h2>2. What we collect</h2><ul><li>Identity & contact details (name, age, phone, email, address)</li><li>Medical information you share during consultation</li><li>Photos, scans and reports you upload</li><li>Appointment, billing and treatment records</li></ul><h2>3. How we use your data</h2><p>Your information is used only to provide care, generate invoices, send appointment reminders, and improve our services. We never sell or share your data with marketers.</p><h2>4. Data retention</h2><p>Medical records are retained for 7 years as required under Indian healthcare regulations. You may request deletion of your data at any time by emailing <a href="mailto:privacy@saiphysiotherapy.com">privacy@saiphysiotherapy.com</a>.</p><h2>5. Your rights</h2><ul><li>Right to access your medical records</li><li>Right to correction of inaccurate data</li><li>Right to deletion of non-essential records</li><li>Right to withdraw consent for non-medical communications</li></ul>`,
      footerLabel: 'Privacy',
      footerOrder: 1,
      seo: {
        metaTitle: 'Privacy Policy | SAI Physiotherapy',
        metaDescription: 'Read how SAI Physiotherapy collects, uses, and safeguards your personal and medical information.',
        keywords: ['privacy policy', 'sai physiotherapy', 'data protection'],
      },
    },
    {
      title: 'Terms & Conditions',
      slug: 'terms-and-conditions',
      excerpt: 'The terms that govern your use of our services and website.',
      content: `<h2>1. Acceptance of terms</h2><p>By booking an appointment, walking into our clinic, or using our website, you agree to these terms. If you do not agree, please do not use our services.</p><h2>2. Services</h2><p>SAI Physiotherapy offers physiotherapy assessment, treatment and rehabilitation services. Outcomes vary by individual and no specific result is guaranteed.</p><h2>3. Appointments & cancellations</h2><p>Please give at least 4 hours notice for cancellations or rescheduling. Repeated no-shows may result in a small cancellation fee.</p><h2>4. Payments</h2><p>Consultation and treatment fees are payable at the clinic. Insurance reimbursement is the patient\'s responsibility — we will provide all necessary receipts and documentation.</p><h2>5. Medical advice disclaimer</h2><p>The information on our website and blog is for educational purposes and does not replace a clinical consultation. Always seek the advice of a qualified healthcare provider.</p>`,
      footerLabel: 'Terms',
      footerOrder: 2,
      seo: {
        metaTitle: 'Terms & Conditions | SAI Physiotherapy',
        metaDescription: 'Terms governing the use of SAI Physiotherapy services and website.',
        keywords: ['terms and conditions', 'sai physiotherapy', 'service terms'],
      },
    },
    {
      title: 'Refund & Cancellation Policy',
      slug: 'refund-policy',
      excerpt: 'When and how refunds and cancellations apply at SAI Physiotherapy.',
      content: `<h2>Refund policy</h2><p>Pre-paid treatment packages are refundable on a pro-rata basis for unused sessions, less a 5% administrative fee, within 30 days of purchase.</p><h2>Cancellations</h2><p>Cancellations made at least 4 hours before the appointment are fully refundable. Late cancellations may incur a small fee at the discretion of the clinic manager.</p><h2>Insurance</h2><p>Refunds for insurance-reimbursed services are subject to your insurer\'s policy and timelines.</p><h2>Contact</h2><p>For any refund queries write to <a href="mailto:billing@saiphysiotherapy.com">billing@saiphysiotherapy.com</a>.</p>`,
      footerLabel: 'Refunds',
      footerOrder: 3,
      seo: {
        metaTitle: 'Refund & Cancellation Policy | SAI Physiotherapy',
        metaDescription: 'Refund and cancellation policy for SAI Physiotherapy services and treatment packages.',
        keywords: ['refund policy', 'cancellation policy', 'sai physiotherapy'],
      },
    },
    {
      title: 'About SAI Physiotherapy',
      slug: 'about-clinic',
      excerpt: 'Our story, mission, and the team behind SAI Physiotherapy.',
      content: `<h2>Our story</h2><p>SAI Physiotherapy Spine Care & Paralysis Centre was founded in 2010 by Dr. Rajesh Patel with a single goal: deliver evidence-based physiotherapy that genuinely improves quality of life. Over 15 years we have grown from a single treatment room into Gujarat\'s leading rehabilitation centre, treating more than 10,000 patients across spine, neuro, ortho, sports and pediatric care.</p><h2>Our mission</h2><p>To make world-class physiotherapy accessible to every patient in Gujarat — through compassionate care, modern facilities, and a science-first approach.</p><h2>Why choose us</h2><ul><li>15+ years of clinical experience</li><li>Senior physiotherapists with MPT specialisations</li><li>State-of-the-art equipment for traction, IFT, ultrasound and gait training</li><li>Transparent, evidence-based treatment plans</li><li>Multi-language care (English, Hindi, Gujarati)</li></ul>`,
      footerLabel: 'About Clinic',
      footerOrder: 4,
      seo: {
        metaTitle: 'About SAI Physiotherapy | Story, Mission & Team',
        metaDescription: "Learn about SAI Physiotherapy\'s story, mission and team — Gujarat\'s leading physiotherapy and rehabilitation centre in Ahmedabad.",
        keywords: ['about sai physiotherapy', 'our story', 'physiotherapy clinic ahmedabad'],
      },
    },
  ];

  for (const p of PAGES) {
    const existing = await Page.findOne({ slug: p.slug });
    if (existing) continue;
    await Page.create({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      showInFooter: true,
      footerLabel: p.footerLabel,
      footerOrder: p.footerOrder,
      isPublished: true,
      publishedAt: new Date(),
      seo: p.seo,
      createdBy: admin._id,
      lastEditedBy: admin._id,
    });
    console.log(`  ✅ CMS page: ${p.title}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// BULK HISTORICAL DATA — gives the dashboard 12 months of meaningful charts
// ────────────────────────────────────────────────────────────────────────────

// Stable, repeatable pseudo-random (xmur3 + sfc32). Same seed → same dataset.
function rng(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h ^ 0x9e3779b9;
  let b = h ^ 0x243f6a88;
  let c = h ^ 0xb7e15162;
  let d = h ^ 0xdeadbeef;
  return function (): number {
    a |= 0; b |= 0; c |= 0; d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

const FIRST_NAMES_F = ['Aanya', 'Aarohi', 'Aditi', 'Ananya', 'Avani', 'Diya', 'Disha', 'Ishaani', 'Kiara', 'Lavanya', 'Mahi', 'Mira', 'Nisha', 'Pari', 'Riya', 'Saanvi', 'Shreya', 'Siya', 'Tanvi', 'Vanya', 'Bhumi', 'Charvi', 'Devanshi', 'Esha', 'Falguni'];
const FIRST_NAMES_M = ['Aarav', 'Aayush', 'Advait', 'Arjun', 'Atharv', 'Ayaan', 'Darsh', 'Devansh', 'Dhruv', 'Karan', 'Krish', 'Kunal', 'Manav', 'Neel', 'Parth', 'Pranav', 'Reyansh', 'Rudra', 'Shivansh', 'Veer', 'Vihaan', 'Yash', 'Aniket', 'Bhavin', 'Chirag'];
const LAST_NAMES = ['Patel', 'Shah', 'Mehta', 'Joshi', 'Desai', 'Trivedi', 'Iyer', 'Rao', 'Kumar', 'Sharma', 'Verma', 'Gupta', 'Choksi', 'Modi', 'Pandya', 'Dave', 'Bhatt', 'Vyas', 'Thakkar', 'Soni', 'Parmar', 'Goswami', 'Solanki', 'Patil'];
const CITIES = ['Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara', 'Rajkot'];
const AREAS = ['Bodakdev', 'Satellite', 'Vastrapur', 'Prahladnagar', 'Thaltej', 'Bopal', 'Navrangpura', 'SG Highway', 'Maninagar', 'Chandkheda', 'Naranpura', 'Paldi'];
const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const COMPLAINTS = [
  'Chronic lower back pain',
  'Cervical spondylosis with radiating pain',
  'Frozen shoulder, right side',
  'Knee osteoarthritis, bilateral',
  'Post-knee replacement rehabilitation',
  'Sports injury — ACL rehabilitation',
  'Sciatica with leg pain',
  'Tennis elbow',
  'Plantar fasciitis',
  'Rotator cuff tendinopathy',
  'Post-stroke hemiparesis rehabilitation',
  'Cerebral palsy — pediatric',
  'Pre-/post-natal back pain',
  'Whiplash injury after RTA',
  'Post-fracture mobilisation',
];
const COMORBIDITIES_POOL = ['Hypertension', 'Type 2 diabetes', 'Hypothyroidism', 'Asthma', 'Osteoporosis', 'High cholesterol'];

interface GeneratedPatient {
  doc: IPatientDocument;
  preferredDoctor: IUserDocument;
}

async function seedBulkHistoricalData(
  users: Awaited<ReturnType<typeof seedUsers>>,
  baseServices: IServiceDocument[],
): Promise<void> {
  console.log('\n📝 Seeding bulk historical data for analytics…');

  const rand = rng('sai-physio-v1');
  const { admin, doctorPatel, doctorMehta, doctorJoshi, doctorShah, billingStaff } = users;
  const doctorPool = [doctorPatel, doctorMehta, doctorJoshi, doctorShah];

  const now = new Date();
  const TOTAL_PATIENTS = 60;
  const APPOINTMENTS_PER_MONTH_RAMP = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 35]; // 12 months → 277 total

  // ── 1. Generate bulk patients ─────────────────────────────────────────────
  const created: GeneratedPatient[] = [];
  let patientsAdded = 0;
  let patientsSkipped = 0;

  for (let i = 1; i <= TOTAL_PATIENTS; i++) {
    const phone = `9000${String(i).padStart(6, '0')}`;
    const existing = await Patient.findOne({ 'personalInfo.phone': phone });
    if (existing) {
      const doctor = doctorPool[i % doctorPool.length];
      created.push({ doc: existing, preferredDoctor: doctor });
      patientsSkipped++;
      continue;
    }

    const isFemale = rand() > 0.5;
    const first = isFemale ? FIRST_NAMES_F[Math.floor(rand() * FIRST_NAMES_F.length)] : FIRST_NAMES_M[Math.floor(rand() * FIRST_NAMES_M.length)];
    const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const fullName = `${first} ${last}`;

    // createdAt spread over last 365 days, weighted toward more recent months
    const daysAgo = Math.floor(rand() * rand() * 365);
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const age = 18 + Math.floor(rand() * 65);
    const dob = new Date(now.getFullYear() - age, Math.floor(rand() * 12), 1 + Math.floor(rand() * 27));

    const complaint = COMPLAINTS[Math.floor(rand() * COMPLAINTS.length)];
    const status: 'active' | 'discharged' | 'followup' = rand() < 0.7 ? 'active' : rand() < 0.85 ? 'followup' : 'discharged';
    const doctor = doctorPool[i % doctorPool.length];

    const hasComorbidity = rand() < 0.35;
    const comorbidities = hasComorbidity ? [COMORBIDITIES_POOL[Math.floor(rand() * COMORBIDITIES_POOL.length)]] : [];

    const patient = await Patient.create({
      patientId: await generatePatientId(),
      personalInfo: {
        name: fullName,
        dob,
        gender: isFemale ? 'female' : 'male',
        phone,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
        address: `${1 + Math.floor(rand() * 200)}, ${AREAS[Math.floor(rand() * AREAS.length)]}`,
        city: CITIES[Math.floor(rand() * CITIES.length)],
        bloodGroup: BLOOD_GROUPS[Math.floor(rand() * BLOOD_GROUPS.length)],
        emergencyContact: {
          name: `${LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]} Family`,
          phone: `9${String(100000000 + Math.floor(rand() * 899999999))}`.slice(0, 10),
          relation: isFemale ? 'Husband' : 'Wife',
        },
      },
      medicalHistory: {
        chiefComplaint: complaint,
        pastHistory: hasComorbidity ? 'Documented in case file.' : 'Unremarkable.',
        surgicalHistory: rand() < 0.2 ? 'Yes — see referral letter.' : 'None.',
        medications: hasComorbidity ? ['Multivitamin', 'Telmisartan 40mg'] : [],
        allergies: rand() < 0.1 ? ['Sulfa drugs'] : [],
        comorbidities,
      },
      documents: [],
      assignedDoctor: doctor._id,
      status,
      tags: status === 'discharged' ? ['Discharged'] : status === 'followup' ? ['Follow-up'] : [],
      createdBy: admin._id,
      createdAt,
      updatedAt: createdAt,
    });

    // Force createdAt to honour our backdated value (timestamps:true auto-sets it)
    await Patient.updateOne(
      { _id: patient._id },
      { $set: { createdAt, updatedAt: createdAt } },
    );

    created.push({ doc: patient, preferredDoctor: doctor });
    patientsAdded++;
  }
  console.log(`  ✅ Patients — added ${patientsAdded}, skipped ${patientsSkipped}`);

  if (created.length === 0) {
    console.log('  ⚠️  No bulk patients available — skipping bulk appointments.');
    return;
  }

  // ── 2. Generate appointments distributed across 12 months ─────────────────
  let apptsAdded = 0;
  let apptsSkipped = 0;
  let sessionsAdded = 0;
  let billsAdded = 0;
  const HOURS_OF_DAY = [9, 10, 11, 12, 14, 15, 16, 17, 18, 19];

  for (let monthsBack = 11; monthsBack >= 0; monthsBack--) {
    const volume = APPOINTMENTS_PER_MONTH_RAMP[11 - monthsBack];
    const monthAnchor = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    const daysInMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0).getDate();

    for (let i = 0; i < volume; i++) {
      const dayOfMonth = 1 + Math.floor(rand() * daysInMonth);
      const hour = HOURS_OF_DAY[Math.floor(rand() * HOURS_OF_DAY.length)];
      const minute = rand() < 0.5 ? 0 : 30;
      const scheduledAt = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), dayOfMonth, hour, minute, 0);

      // Skip far-future overshoots
      const daysFromNow = (scheduledAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
      if (daysFromNow > 30) continue;

      const patientEntry = created[Math.floor(rand() * created.length)];
      const doctor = rand() < 0.7 ? patientEntry.preferredDoctor : doctorPool[Math.floor(rand() * doctorPool.length)];
      const service = baseServices[Math.floor(rand() * baseServices.length)];

      const exists = await Appointment.findOne({ patient: patientEntry.doc._id, scheduledAt });
      if (exists) {
        apptsSkipped++;
        continue;
      }

      // Status distribution by date
      let status: IAppointmentDocument['status'];
      if (daysFromNow > 0.5) {
        // Future
        const r = rand();
        status = r < 0.6 ? 'scheduled' : r < 0.95 ? 'confirmed' : 'in_progress';
      } else if (daysFromNow > -7) {
        const r = rand();
        status = r < 0.55 ? 'completed' : r < 0.75 ? 'confirmed' : r < 0.85 ? 'in_progress' : r < 0.95 ? 'cancelled' : 'no_show';
      } else if (daysFromNow > -60) {
        const r = rand();
        status = r < 0.78 ? 'completed' : r < 0.9 ? 'cancelled' : r < 0.97 ? 'no_show' : 'in_progress';
      } else {
        const r = rand();
        status = r < 0.88 ? 'completed' : r < 0.95 ? 'cancelled' : 'no_show';
      }

      const type: IAppointmentDocument['type'] = rand() < 0.7 ? 'followup' : rand() < 0.95 ? 'new' : 'emergency';

      const appt = await Appointment.create({
        appointmentId: await generateAppointmentId(),
        patient: patientEntry.doc._id,
        doctor: doctor._id,
        service: service._id,
        scheduledAt,
        duration: 45,
        status,
        type,
        tokenNumber: 1 + Math.floor(rand() * 50),
        notes:
          status === 'cancelled'
            ? 'Patient rescheduled.'
            : status === 'no_show'
              ? 'Patient did not show up.'
              : 'Per assigned rehab protocol.',
        cancelReason: status === 'cancelled' ? 'Patient unavailable' : undefined,
        reminders: { sms: true, email: rand() < 0.4, whatsapp: rand() < 0.6 },
        bookedBy: admin._id,
      });
      apptsAdded++;

      // ── Create session for completed/in_progress appointments ───────────
      if (status === 'completed' || status === 'in_progress') {
        const sessionNumber = (await TreatmentSession.countDocuments({ patient: appt.patient })) + 1;
        const painScale = Math.max(0, 7 - sessionNumber);
        await TreatmentSession.create({
          patient: appt.patient,
          appointment: appt._id,
          doctor: appt.doctor,
          sessionNumber,
          date: scheduledAt,
          chiefComplaint: patientEntry.doc.medicalHistory?.chiefComplaint ?? 'Per protocol',
          soapNotes: {
            subjective: 'Patient reports steady improvement. Sleep quality better; less morning stiffness.',
            objective: `ROM improved. Pain ${painScale}/10 (down from ${painScale + 2}). Strength 4/5 across key groups.`,
            assessment: 'Consistent progress along expected recovery curve.',
            plan: 'Continue current protocol with progressive loading. Reassess at next visit.',
          },
          vitalSigns: {
            bp: '120/80',
            pulse: 70 + Math.floor(rand() * 12),
            temperature: 36.6 + rand() * 0.6,
            spo2: 97 + Math.floor(rand() * 3),
            painScale,
          },
          treatmentsGiven: ['Manual therapy', 'IFT', 'Therapeutic exercise', 'Stretching'],
          exercisesPrescribed: ['Bridges 3×12', 'Bird-dog 2×10', 'Stretching routine 10 min'],
          recoveryPercentage: Math.min(95, 30 + sessionNumber * 8),
          nextSessionDate: new Date(scheduledAt.getTime() + 3 * 24 * 60 * 60 * 1000),
          attachments: [],
        });
        sessionsAdded++;

        // ── Create invoice ────────────────────────────────────────────────
        const unitPrice = service.price?.from ?? 800;
        const subtotal = unitPrice;
        const discount = rand() < 0.2 ? 100 : 0;
        const totalAmount = subtotal - discount;

        // Payment scenario by age
        let paid: number;
        let paymentStatus: 'paid' | 'partial' | 'pending';
        let paymentMethod: 'cash' | 'upi_manual' | 'bank_transfer' | 'pending';
        if (daysFromNow < -60) {
          paid = totalAmount;
          paymentStatus = 'paid';
          paymentMethod = rand() < 0.5 ? 'upi_manual' : 'cash';
        } else if (daysFromNow < -30) {
          const r = rand();
          if (r < 0.9) { paid = totalAmount; paymentStatus = 'paid'; paymentMethod = rand() < 0.5 ? 'upi_manual' : 'cash'; }
          else { paid = Math.round(totalAmount * 0.5); paymentStatus = 'partial'; paymentMethod = 'cash'; }
        } else if (daysFromNow < -7) {
          const r = rand();
          if (r < 0.7) { paid = totalAmount; paymentStatus = 'paid'; paymentMethod = rand() < 0.5 ? 'upi_manual' : 'cash'; }
          else if (r < 0.9) { paid = Math.round(totalAmount * 0.5); paymentStatus = 'partial'; paymentMethod = 'cash'; }
          else { paid = 0; paymentStatus = 'pending'; paymentMethod = 'pending'; }
        } else {
          const r = rand();
          if (r < 0.5) { paid = totalAmount; paymentStatus = 'paid'; paymentMethod = rand() < 0.5 ? 'upi_manual' : 'cash'; }
          else if (r < 0.8) { paid = Math.round(totalAmount * 0.5); paymentStatus = 'partial'; paymentMethod = 'cash'; }
          else { paid = 0; paymentStatus = 'pending'; paymentMethod = 'pending'; }
        }

        await Billing.create({
          invoiceNumber: await generateInvoiceNumber(),
          patient: appt.patient,
          appointment: appt._id,
          items: [{ description: `${service.name} — Session ${sessionNumber}`, quantity: 1, unitPrice, total: unitPrice }],
          subtotal,
          discount,
          discountType: 'flat',
          tax: 0,
          totalAmount,
          amountPaid: paid,
          balanceDue: totalAmount - paid,
          paymentMethod,
          paymentStatus,
          paymentDate: paymentStatus !== 'pending' ? scheduledAt : undefined,
          receivedBy: paymentStatus !== 'pending' ? billingStaff._id : admin._id,
          notes:
            paymentStatus === 'partial'
              ? 'Partial payment — balance due at next visit.'
              : paymentStatus === 'pending'
                ? 'Awaiting payment.'
                : 'Paid in full.',
          createdBy: admin._id,
          createdAt: scheduledAt,
          updatedAt: scheduledAt,
        });
        // Force createdAt backdated for correct revenue charting
        await Billing.updateOne(
          { appointment: appt._id },
          { $set: { createdAt: scheduledAt, updatedAt: scheduledAt } },
        );
        billsAdded++;
      }
    }
  }

  console.log(`  ✅ Appointments — added ${apptsAdded}, skipped ${apptsSkipped}`);
  console.log(`  ✅ Sessions added ${sessionsAdded}`);
  console.log(`  ✅ Invoices added ${billsAdded}`);

  // ── 3. Bump testimonials with extra data ──────────────────────────────────
  const EXTRA_TESTIMONIALS = [
    'Sneha Pandya', 'Devansh Patel', 'Riya Choksi', 'Karan Modi', 'Pooja Vyas',
    'Aniket Dave', 'Falguni Thakkar', 'Bhavin Bhatt', 'Mahi Solanki', 'Yash Soni',
    'Charvi Iyer', 'Pranav Joshi', 'Esha Goswami', 'Reyansh Parmar', 'Diya Patel',
  ];
  const CONDITIONS = ['Back Pain', 'Knee Pain', 'Neck Pain', 'Sports Injury', 'Stroke Recovery', 'Frozen Shoulder', 'Pediatric Therapy', 'Pregnancy Back Pain', 'Geriatric Care'];
  const REVIEWS = [
    'Lifesaver. The team here genuinely listened and built a recovery plan I could stick to.',
    'Best decision I made for my health. The progress in just a few weeks is incredible.',
    'Compassionate, skilled and on time every single session. Highly recommend.',
    'Helped me avoid surgery. The conservative approach worked beautifully.',
    'My recovery curve has been faster than what my surgeon predicted. Top facility.',
    'Modern equipment, calm environment and excellent therapists. 10/10.',
  ];

  let testAdded = 0;
  for (const name of EXTRA_TESTIMONIALS) {
    const exists = await Testimonial.findOne({ patientName: name });
    if (exists) continue;
    const condition = CONDITIONS[Math.floor(rand() * CONDITIONS.length)];
    const review = REVIEWS[Math.floor(rand() * REVIEWS.length)];
    const r = rand();
    await Testimonial.create({
      patientName: name,
      patientAge: 22 + Math.floor(rand() * 50),
      condition,
      rating: r < 0.85 ? 5 : 4,
      review,
      isApproved: rand() > 0.15,
      isFeatured: rand() > 0.85,
      source: rand() < 0.6 ? 'website_form' : rand() < 0.8 ? 'google' : 'manual',
    });
    testAdded++;
  }
  console.log(`  ✅ Testimonials added ${testAdded}`);

  // ── 4. Bump blog view counts so analytics looks realistic ─────────────────
  const blogs = await Blog.find({ status: 'published' });
  for (const blog of blogs) {
    const bumpedViews = 500 + Math.floor(rand() * 4500);
    if ((blog.views ?? 0) < bumpedViews) {
      blog.views = bumpedViews;
      await blog.save();
    }
  }
  console.log(`  ✅ Blog views normalised on ${blogs.length} posts`);
}

// ────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ────────────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file');
    process.exit(1);
  }

  console.log('🌱 Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const users = await seedUsers();
  const services = await seedServices();
  await seedDoctors(users);
  await seedClinicSettings(services);
  const patients = await seedPatients(users);
  const appointments = await seedAppointments(patients, users, services);
  await seedTreatmentSessions(appointments, patients);
  await seedBillings(appointments, services, users);
  await seedBlogs(users);
  await seedTestimonials();
  await seedGallery(users);
  await seedCmsPages(users);
  await seedBulkHistoricalData(users, services);

  // ── Summary counts ─────────────────────────────────────────────────────────
  console.log('\n📊 Final collection counts:');
  const counts = await Promise.all([
    User.countDocuments().then((n) => ['users', n] as const),
    Service.countDocuments().then((n) => ['services', n] as const),
    Doctor.countDocuments().then((n) => ['doctors', n] as const),
    ClinicSettings.countDocuments().then((n) => ['clinic settings', n] as const),
    Patient.countDocuments().then((n) => ['patients', n] as const),
    Appointment.countDocuments().then((n) => ['appointments', n] as const),
    TreatmentSession.countDocuments().then((n) => ['treatment sessions', n] as const),
    Billing.countDocuments().then((n) => ['billings', n] as const),
    Blog.countDocuments().then((n) => ['blogs', n] as const),
    Testimonial.countDocuments().then((n) => ['testimonials', n] as const),
    Gallery.countDocuments().then((n) => ['gallery items', n] as const),
    Page.countDocuments().then((n) => ['cms pages', n] as const),
  ]);
  for (const [k, n] of counts) console.log(`  ${k.padEnd(20)} ${n}`);

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('═══════════════════════════════════════');
  console.log('  LOGIN CREDENTIALS');
  console.log('═══════════════════════════════════════');
  console.log('  Super Admin:    admin@saiphysio.com      / Admin@123456');
  console.log('  Doctor:         doctor@saiphysio.com     / Doctor@123456');
  console.log('  Doctor (ortho): anjali@saiphysio.com     / Doctor@123456');
  console.log('  Doctor (neuro): rakesh@saiphysio.com     / Doctor@123456');
  console.log('  Doctor (sport): karan@saiphysio.com      / Doctor@123456');
  console.log('  Receptionist:   reception@saiphysio.com  / Recept@123456');
  console.log('  Billing Staff:  billing@saiphysio.com    / Billing@123456');
  console.log('═══════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  void mongoose.disconnect();
  process.exit(1);
});
