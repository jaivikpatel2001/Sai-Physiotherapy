import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import mongoose from 'mongoose';
import { User } from '../src/models/User.model';
import { Service } from '../src/models/Service.model';
import { ClinicSettings } from '../src/models/ClinicSettings.model';
import { UserRole } from '@sai-physio/types';
import { generateSlug } from '@sai-physio/utils';

const MONGODB_URI = process.env.MONGODB_URI || '';

const SERVICES = [
  {
    name: 'Back Pain Treatment',
    category: 'Spine & Back',
    shortDescription: 'Expert treatment for all types of back pain using advanced physiotherapy techniques and personalized care plans.',
    price: { from: 500, to: 2000 },
    duration: '30-45 minutes',
    benefits: ['Reduced pain and inflammation', 'Improved posture', 'Strengthened back muscles', 'Better mobility', 'Non-surgical treatment'],
    treatmentProcess: ['Initial Assessment & Diagnosis', 'Personalized Treatment Plan', 'Manual Therapy & Mobilization', 'Therapeutic Exercises', 'Heat/Cold Therapy', 'Progress Review & Discharge'],
    faqs: [
      { question: 'How many sessions will I need?', answer: 'Most patients see significant improvement in 8-12 sessions. The exact number depends on severity and individual response to treatment.' },
      { question: 'Is physiotherapy safe for chronic back pain?', answer: 'Yes, physiotherapy is one of the safest and most effective treatments for chronic back pain without surgery or medication dependency.' },
    ],
  },
  { name: 'Spine Care & Disc Problems', category: 'Spine & Back', shortDescription: 'Specialized treatment for disc herniation, spondylosis, and other spinal conditions.', price: { from: 800, to: 3000 }, duration: '45-60 minutes', benefits: ['Disc decompression', 'Pain relief', 'Nerve function improvement', 'Posture correction'], treatmentProcess: ['Spinal Assessment', 'Traction Therapy', 'McKenzie Method', 'Core Strengthening', 'Ergonomic Training'], faqs: [{ question: 'Can physiotherapy help avoid spine surgery?', answer: 'In many cases, yes. Conservative physiotherapy management can successfully treat disc problems without surgery.' }] },
  { name: 'Paralysis Rehabilitation', category: 'Neuro Rehabilitation', shortDescription: "Comprehensive rehabilitation program for stroke, spinal injury, and other causes of paralysis to maximize functional recovery.", price: { from: 1000, to: 4000 }, duration: '60-90 minutes', benefits: ["Muscle strength recovery", "Improved coordination", "Functional independence", "Better quality of life"], treatmentProcess: ["Neurological Assessment", "Passive Range of Motion", "Electrical Stimulation", "Gait Training", "Functional Task Training", "Home Program Design"], faqs: [{ question: "When should paralysis rehabilitation start?", answer: "The earlier the better. Early intervention within days of the event leads to significantly better outcomes." }] },
  { name: 'Knee Pain & Joint Care', category: 'Orthopedics', shortDescription: 'Effective treatment for knee pain, osteoarthritis, ligament injuries, and post-surgical rehabilitation.', price: { from: 600, to: 2500 }, duration: '30-45 minutes', benefits: ['Pain reduction', 'Improved joint mobility', 'Muscle strengthening', 'Delayed need for surgery'], treatmentProcess: ['Joint Assessment', 'Manual Therapy', 'Quadriceps Strengthening', 'Proprioception Training', 'Hydrotherapy (if available)'], faqs: [{ question: 'Can physiotherapy replace knee replacement?', answer: 'For mild to moderate osteoarthritis, physiotherapy can significantly delay or in some cases prevent knee replacement surgery.' }] },
  { name: 'Neck Pain & Cervical Spondylosis', category: 'Spine & Back', shortDescription: 'Targeted treatment for neck pain, cervical spondylosis, whiplash, and headaches arising from cervical spine.', price: { from: 500, to: 2000 }, duration: '30-45 minutes', benefits: ['Neck pain relief', 'Headache reduction', 'Improved neck mobility', 'Better sleep'], treatmentProcess: ['Cervical Assessment', 'Traction Therapy', 'Cervical Manipulation', 'Postural Correction', 'Home Exercise Program'], faqs: [{ question: 'How does sitting posture affect neck pain?', answer: 'Poor sitting posture for prolonged periods is the #1 cause of cervical spondylosis. We provide comprehensive ergonomic training.' }] },
  { name: 'Sports Injury Rehabilitation', category: 'Sports', shortDescription: 'Rapid recovery programs for athletes and active individuals with sports-related injuries.', price: { from: 800, to: 3000 }, duration: '45-60 minutes', benefits: ['Faster return to sport', 'Re-injury prevention', 'Performance enhancement', 'Strength recovery'], treatmentProcess: ['Injury Assessment', 'RICE Protocol', 'Therapeutic Modalities', 'Functional Training', 'Sport-Specific Conditioning', 'Return to Sport Clearance'], faqs: [{ question: 'How long does sports injury recovery take?', answer: 'Recovery varies from 2 weeks for minor sprains to 6+ months for complex injuries like ACL tears.' }] },
  { name: 'Neuro Physiotherapy', category: 'Neuro Rehabilitation', shortDescription: 'Specialized physiotherapy for neurological conditions including Parkinson\'s, MS, cerebral palsy, and stroke.', price: { from: 1000, to: 4000 }, duration: '60 minutes', benefits: ['Improved balance', 'Better coordination', 'Enhanced cognitive function', 'Independence in daily activities'], treatmentProcess: ['Neurological Assessment', 'Balance Training', 'Bobath Technique', 'PNF Therapy', 'Cognitive-Motor Training'], faqs: [{ question: 'Is neuro physiotherapy beneficial for Parkinson\'s disease?', answer: 'Yes, specialized physiotherapy can significantly improve gait, balance, and quality of life in Parkinson\'s patients.' }] },
  { name: 'Post-Surgery Rehabilitation', category: 'Orthopedics', shortDescription: 'Accelerate your recovery after orthopedic surgeries with structured rehabilitation protocols.', price: { from: 700, to: 3000 }, duration: '45-60 minutes', benefits: ['Faster healing', 'Scar tissue management', 'Strength restoration', 'Full function recovery'], treatmentProcess: ['Surgical Review', 'Early Mobilization', 'Pain Management', 'Progressive Strengthening', 'Return to Activity Testing'], faqs: [{ question: 'When should I start physio after surgery?', answer: 'Depending on the surgery type, physiotherapy often starts within 24-48 hours post-surgery.' }] },
  { name: 'Pediatric Physiotherapy', category: 'Pediatrics', shortDescription: 'Gentle and effective physiotherapy for children with developmental delays, cerebral palsy, and musculoskeletal conditions.', price: { from: 600, to: 2500 }, duration: '45 minutes', benefits: ['Developmental milestone achievement', 'Improved motor skills', 'Better posture', 'Enhanced confidence'], treatmentProcess: ['Pediatric Assessment', 'Play-Based Therapy', 'Sensory Integration', 'Parent Training', 'School Recommendations'], faqs: [{ question: 'What age can children start physiotherapy?', answer: 'Physiotherapy can start from birth for conditions like torticollis, and is very effective for children of all ages.' }] },
  { name: 'Geriatric Care', category: 'Elderly Care', shortDescription: 'Specialized physiotherapy programs designed for elderly patients to maintain independence, prevent falls, and manage chronic conditions.', price: { from: 500, to: 2000 }, duration: '30-45 minutes', benefits: ['Fall prevention', 'Improved balance', 'Pain management', 'Maintained independence', 'Better quality of life'], treatmentProcess: ['Comprehensive Geriatric Assessment', 'Balance & Stability Training', 'Gentle Strengthening', 'Home Safety Assessment', 'Family Education'], faqs: [{ question: 'Is physiotherapy safe for elderly patients?', answer: 'Yes, all exercises and treatments are carefully adapted to the individual\'s fitness level and medical conditions.' }] },
  { name: 'Shoulder Pain Treatment', category: 'Orthopedics', shortDescription: 'Comprehensive treatment for rotator cuff injuries, shoulder impingement, and chronic shoulder pain.', price: { from: 600, to: 2500 }, duration: '30-45 minutes', benefits: ['Pain elimination', 'Full range of motion', 'Strength restoration', 'Injury prevention'], treatmentProcess: ['Shoulder Assessment', 'Manual Therapy', 'Rotator Cuff Strengthening', 'Scapular Stabilization', 'Return to Activity'], faqs: [{ question: 'Can physiotherapy cure rotator cuff tears?', answer: 'Partial tears often respond excellently to physiotherapy. Full thickness tears may require surgery followed by rehabilitation.' }] },
  { name: 'Frozen Shoulder', category: 'Orthopedics', shortDescription: 'Specialized treatment for adhesive capsulitis (frozen shoulder) to restore movement and eliminate pain.', price: { from: 700, to: 3000 }, duration: '45 minutes', benefits: ['Pain relief', 'Restored shoulder movement', 'Improved function', 'Faster recovery'], treatmentProcess: ['Range of Motion Assessment', 'Joint Mobilization', 'Stretching Protocol', 'Strengthening Exercises', 'Self-Management Education'], faqs: [{ question: 'How long does frozen shoulder take to recover with physio?', answer: 'With consistent physiotherapy, most patients see significant improvement in 3-6 months, much faster than the natural course of 2+ years.' }] },
];

const DEFAULT_CLINIC_SETTINGS = {
  clinicName: 'SAI Physiotherapy Spine Care & Paralysis Centre',
  tagline: "Gujarat's Leading Physiotherapy & Rehabilitation Center",
  contact: {
    phones: ['+91 99999 99999', '+91 88888 88888'],
    whatsapp: '+919999999999',
    emails: ['clinic@saiphysiotherapy.com', 'info@saiphysiotherapy.com'],
    address: 'SAI Physiotherapy Spine Care & Paralysis Centre, Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380001',
    googleMapsUrl: 'https://maps.google.com',
    googleMapsEmbed: '',
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
    globalMetaDescription: 'Gujarat\'s leading physiotherapy and rehabilitation center. Expert treatment for back pain, spine care, paralysis, sports injuries, and more. Book your appointment today.',
  },
  homepage: {
    stats: [
      { label: 'Patients Treated', value: '10,000+', icon: 'users' },
      { label: 'Years of Experience', value: '15+', icon: 'calendar' },
      { label: 'Services', value: '12+', icon: 'activity' },
      { label: 'Success Rate', value: '95%', icon: 'star' },
    ],
    heroSlides: [
      { title: 'Heal. Recover. Thrive.', subtitle: "Gujarat's Most Advanced Physiotherapy & Rehabilitation Center", ctaText: 'Book Appointment', ctaLink: '/book-appointment', image: '' },
      { title: 'Expert Spine Care', subtitle: 'Specialized treatment for all spinal conditions with cutting-edge technology', ctaText: 'Our Services', ctaLink: '/services', image: '' },
    ],
  },
};

async function seed() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file');
    process.exit(1);
  }

  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // ─── 1. Super Admin User ───────────────────────────────────────────────────
  console.log('\n📝 Seeding users...');
  const existingAdmin = await User.findOne({ email: 'admin@saiphysio.com' });
  if (!existingAdmin) {
    await User.create({
      name: 'Super Admin',
      email: 'admin@saiphysio.com',
      phone: '9999999999',
      password: 'Admin@123456',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    });
    console.log('  ✅ Super Admin created: admin@saiphysio.com / Admin@123456');
  } else {
    console.log('  ⚠️  Super Admin already exists');
  }

  // Sample Doctor
  const existingDoctor = await User.findOne({ email: 'doctor@saiphysio.com' });
  if (!existingDoctor) {
    await User.create({
      name: 'Dr. Rajesh Patel',
      email: 'doctor@saiphysio.com',
      phone: '9888888888',
      password: 'Doctor@123456',
      role: UserRole.DOCTOR,
      specialization: 'Spine Care & Rehabilitation',
      qualification: 'BPT, MPT (Orthopedics)',
      experience: 12,
      bio: 'Dr. Rajesh Patel is a senior physiotherapist specializing in spine care and neurological rehabilitation with over 12 years of experience.',
      isActive: true,
    });
    console.log('  ✅ Doctor created: doctor@saiphysio.com / Doctor@123456');
  }

  // Sample Receptionist
  const existingReception = await User.findOne({ email: 'reception@saiphysio.com' });
  if (!existingReception) {
    await User.create({
      name: 'Priya Sharma',
      email: 'reception@saiphysio.com',
      phone: '9777777777',
      password: 'Recept@123456',
      role: UserRole.RECEPTIONIST,
      isActive: true,
    });
    console.log('  ✅ Receptionist created: reception@saiphysio.com / Recept@123456');
  }

  // ─── 2. Services ───────────────────────────────────────────────────────────
  console.log('\n📝 Seeding services...');
  for (let i = 0; i < SERVICES.length; i++) {
    const svc = SERVICES[i];
    const slug = generateSlug(svc.name);
    const existing = await Service.findOne({ slug });
    if (!existing) {
      await Service.create({
        ...svc,
        slug,
        longDescription: `<p>${svc.shortDescription}</p><p>At SAI Physiotherapy, we provide comprehensive ${svc.name.toLowerCase()} using evidence-based techniques and state-of-the-art equipment. Our experienced therapists create personalized treatment plans tailored to each patient's specific needs and goals.</p>`,
        order: i + 1,
        seo: {
          metaTitle: `${svc.name} in Ahmedabad | SAI Physiotherapy`,
          metaDescription: `${svc.shortDescription} Book your appointment at SAI Physiotherapy Ahmedabad.`,
          keywords: [svc.name.toLowerCase(), 'physiotherapy ahmedabad', 'sai physiotherapy', svc.category.toLowerCase()],
        },
      });
      console.log(`  ✅ Service: ${svc.name}`);
    } else {
      console.log(`  ⚠️  Service exists: ${svc.name}`);
    }
  }

  // ─── 3. Clinic Settings ────────────────────────────────────────────────────
  console.log('\n📝 Seeding clinic settings...');
  const existingSettings = await ClinicSettings.findOne();
  if (!existingSettings) {
    await ClinicSettings.create(DEFAULT_CLINIC_SETTINGS);
    console.log('  ✅ Clinic settings created');
  } else {
    console.log('  ⚠️  Clinic settings already exist');
  }

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('═══════════════════════════════════════');
  console.log('  LOGIN CREDENTIALS');
  console.log('═══════════════════════════════════════');
  console.log('  Super Admin:   admin@saiphysio.com     / Admin@123456');
  console.log('  Doctor:        doctor@saiphysio.com    / Doctor@123456');
  console.log('  Receptionist:  reception@saiphysio.com / Recept@123456');
  console.log('═══════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
