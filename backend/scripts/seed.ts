import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import mongoose from 'mongoose';
import { User } from '../src/models/User.model';
import { Service } from '../src/models/Service.model';
import { ClinicSettings } from '../src/models/ClinicSettings.model';
import { Patient } from '../src/models/Patient.model';
import { Appointment } from '../src/models/Appointment.model';
import { TreatmentSession } from '../src/models/TreatmentSession.model';
import { Billing } from '../src/models/Billing.model';
import { Blog } from '../src/models/Blog.model';
import { Testimonial } from '../src/models/Testimonial.model';
import { UserRole } from '@sai-physio/types';
import { generateSlug } from '@sai-physio/utils';
import {
  generatePatientId,
  generateAppointmentId,
  generateInvoiceNumber,
} from '../src/utils/id-generator';

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

  // ─── 2b. Additional Doctors ────────────────────────────────────────────────
  const EXTRA_DOCTORS = [
    { name: 'Dr. Anjali Mehta', email: 'anjali@saiphysio.com', phone: '9876500001', specialization: 'Orthopedic Physiotherapy', qualification: 'BPT, MPT (Ortho)', experience: 9, bio: 'Dr. Anjali specializes in joint pain, sports injuries, and post-surgical rehabilitation.' },
    { name: 'Dr. Rakesh Joshi', email: 'rakesh@saiphysio.com', phone: '9876500002', specialization: 'Neuro Physiotherapy', qualification: 'BPT, MPT (Neuro)', experience: 14, bio: 'Dr. Rakesh leads our neuro rehabilitation team with extensive stroke and Parkinson\'s expertise.' },
    { name: 'Dr. Karan Shah', email: 'karan@saiphysio.com', phone: '9876500003', specialization: 'Sports Physiotherapy', qualification: 'BPT, MPT (Sports)', experience: 7, bio: 'Sports medicine specialist with a focus on injury prevention and performance rehabilitation.' },
  ];
  for (const d of EXTRA_DOCTORS) {
    if (!(await User.findOne({ email: d.email }))) {
      await User.create({ ...d, password: 'Doctor@123456', role: UserRole.DOCTOR, isActive: true });
      console.log(`  ✅ Doctor created: ${d.email}`);
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

  // ─── 4. Patients ───────────────────────────────────────────────────────────
  console.log('\n📝 Seeding patients...');
  const adminUser = await User.findOne({ email: 'admin@saiphysio.com' });
  const doctorPatel = await User.findOne({ email: 'doctor@saiphysio.com' });
  const doctorMehta = await User.findOne({ email: 'anjali@saiphysio.com' });
  const doctorJoshi = await User.findOne({ email: 'rakesh@saiphysio.com' });
  const doctorShah = await User.findOne({ email: 'karan@saiphysio.com' });
  const allDoctors = [doctorPatel, doctorMehta, doctorJoshi, doctorShah].filter(Boolean);

  const PATIENT_SEEDS = [
    { name: 'Priya Sharma', dob: '1985-03-12', gender: 'female', phone: '9876543210', email: 'priya.sharma@example.com', address: 'B-204, Maple Heights, Bodakdev', city: 'Ahmedabad', bloodGroup: 'O+', emergency: { name: 'Rajeev Sharma', phone: '9876543211', relation: 'Husband' }, complaint: 'Chronic lower back pain for 3 years, worse on prolonged sitting', past: 'Hypertension, controlled', surgical: 'None', meds: ['Telmisartan 40mg'], allergies: ['Sulfa drugs'], comorbidities: ['Hypertension'], status: 'active', doctor: doctorPatel },
    { name: 'Rajesh Patel', dob: '1972-07-08', gender: 'male', phone: '9876543212', email: 'rajesh.patel@example.com', address: '12, Sunrise Apartments, Satellite', city: 'Ahmedabad', bloodGroup: 'B+', emergency: { name: 'Meera Patel', phone: '9876543213', relation: 'Wife' }, complaint: 'Post total knee replacement rehabilitation, left knee', past: 'Type 2 diabetes for 10 years', surgical: 'Left total knee replacement (2 weeks ago)', meds: ['Metformin 500mg', 'Aspirin 75mg'], allergies: [], comorbidities: ['Type 2 diabetes', 'Mild osteoarthritis'], status: 'active', doctor: doctorMehta },
    { name: 'Meena Joshi', dob: '1958-11-23', gender: 'female', phone: '9876543214', email: 'meena.joshi@example.com', address: '7, Lake View Society, Vastrapur', city: 'Ahmedabad', bloodGroup: 'A+', emergency: { name: 'Arvind Joshi', phone: '9876543215', relation: 'Son' }, complaint: 'Right hemiplegia after stroke, 6 weeks ago', past: 'Hypertension, atrial fibrillation', surgical: 'None', meds: ['Apixaban 5mg', 'Telmisartan 40mg', 'Rosuvastatin 10mg'], allergies: [], comorbidities: ['Stroke', 'AF', 'Hypertension'], status: 'active', doctor: doctorJoshi },
    { name: 'Vikram Shah', dob: '1990-05-19', gender: 'male', phone: '9876543216', email: 'vikram.shah@example.com', address: '34, Pearl Residency, Prahladnagar', city: 'Ahmedabad', bloodGroup: 'AB+', emergency: { name: 'Nisha Shah', phone: '9876543217', relation: 'Spouse' }, complaint: 'Cervical spondylosis with radiating pain to left arm', past: 'Migraine', surgical: 'None', meds: ['Sumatriptan PRN'], allergies: [], comorbidities: [], status: 'active', doctor: doctorPatel },
    { name: 'Anita Desai', dob: '1995-09-04', gender: 'female', phone: '9876543218', email: 'anita.desai@example.com', address: 'D-12, Green Park, Thaltej', city: 'Ahmedabad', bloodGroup: 'O-', emergency: { name: 'Pooja Desai', phone: '9876543219', relation: 'Sister' }, complaint: 'ACL tear, left knee — sports injury (badminton)', past: 'Healthy, recreational athlete', surgical: 'ACL reconstruction (3 weeks ago)', meds: ['Paracetamol PRN'], allergies: [], comorbidities: [], status: 'active', doctor: doctorShah },
    { name: 'Harish Kumar', dob: '1968-12-15', gender: 'male', phone: '9876543220', email: 'harish.kumar@example.com', address: '89, Royal Heritage, Bopal', city: 'Ahmedabad', bloodGroup: 'B-', emergency: { name: 'Sunita Kumar', phone: '9876543221', relation: 'Wife' }, complaint: 'Frozen shoulder, right side, ongoing 4 months', past: 'Type 2 diabetes', surgical: 'None', meds: ['Metformin 500mg', 'Glimepiride 1mg'], allergies: [], comorbidities: ['Diabetes'], status: 'active', doctor: doctorMehta },
    { name: 'Kavita Iyer', dob: '1980-04-27', gender: 'female', phone: '9876543222', email: 'kavita.iyer@example.com', address: '5, Crystal Apartments, Navrangpura', city: 'Ahmedabad', bloodGroup: 'A+', emergency: { name: 'Suresh Iyer', phone: '9876543223', relation: 'Husband' }, complaint: 'Tennis elbow, right side, 2 months', past: 'None', surgical: 'None', meds: [], allergies: [], comorbidities: [], status: 'discharged', doctor: doctorMehta },
    { name: 'Aarav Mehta', dob: '2018-06-30', gender: 'male', phone: '9876543224', email: '', address: '15, Springdale Society, SG Highway', city: 'Ahmedabad', bloodGroup: 'O+', emergency: { name: 'Pooja Mehta', phone: '9876543225', relation: 'Mother' }, complaint: 'Mild cerebral palsy, gross motor delay', past: 'Premature birth at 32 weeks', surgical: 'None', meds: [], allergies: [], comorbidities: ['Cerebral palsy'], status: 'active', doctor: doctorJoshi },
    { name: 'Ramesh Trivedi', dob: '1949-02-11', gender: 'male', phone: '9876543226', email: '', address: '22, Heritage Bungalows, Maninagar', city: 'Ahmedabad', bloodGroup: 'B+', emergency: { name: 'Nilesh Trivedi', phone: '9876543227', relation: 'Son' }, complaint: 'Geriatric balance and fall prevention', past: 'Two falls in last year, mild dementia', surgical: 'Cataract surgery 2020', meds: ['Donepezil 5mg'], allergies: [], comorbidities: ['Mild dementia', 'Osteoarthritis'], status: 'followup', doctor: doctorPatel },
    { name: 'Neha Verma', dob: '1992-08-14', gender: 'female', phone: '9876543228', email: 'neha.verma@example.com', address: '101, Skyline Towers, Chandkheda', city: 'Ahmedabad', bloodGroup: 'AB-', emergency: { name: 'Rahul Verma', phone: '9876543229', relation: 'Brother' }, complaint: 'Postpartum lower back pain and pelvic floor weakness', past: 'C-section delivery 4 months ago', surgical: 'C-section', meds: [], allergies: [], comorbidities: [], status: 'active', doctor: doctorMehta },
  ];

  const patientsCreated: any[] = [];
  for (const p of PATIENT_SEEDS) {
    const exists = await Patient.findOne({ 'personalInfo.phone': p.phone });
    if (exists) {
      patientsCreated.push(exists);
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
      assignedDoctor: p.doctor!._id,
      status: p.status,
      createdBy: adminUser!._id,
    });
    patientsCreated.push(patient);
    console.log(`  ✅ Patient: ${patient.patientId} — ${p.name}`);
  }

  // ─── 5. Appointments ───────────────────────────────────────────────────────
  console.log('\n📝 Seeding appointments...');
  const allServices = await Service.find();
  const findSvc = (keyword: string) => allServices.find((s) => s.name.toLowerCase().includes(keyword.toLowerCase()))!;

  const today = new Date();
  const dayOffset = (days: number, hour: number, min = 0) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    d.setHours(hour, min, 0, 0);
    return d;
  };

  const APPOINTMENT_SEEDS = [
    { patient: patientsCreated[0], service: findSvc('Back Pain'), doctor: doctorPatel, when: dayOffset(0, 10), status: 'completed', type: 'followup' },
    { patient: patientsCreated[1], service: findSvc('Post-Surgery'), doctor: doctorMehta, when: dayOffset(0, 11, 30), status: 'completed', type: 'followup' },
    { patient: patientsCreated[2], service: findSvc('Paralysis'), doctor: doctorJoshi, when: dayOffset(0, 14), status: 'in_progress', type: 'followup' },
    { patient: patientsCreated[3], service: findSvc('Neck Pain'), doctor: doctorPatel, when: dayOffset(0, 16), status: 'confirmed', type: 'followup' },
    { patient: patientsCreated[4], service: findSvc('Sports Injury'), doctor: doctorShah, when: dayOffset(0, 17, 30), status: 'scheduled', type: 'followup' },
    { patient: patientsCreated[5], service: findSvc('Frozen Shoulder'), doctor: doctorMehta, when: dayOffset(1, 9, 30), status: 'confirmed', type: 'followup' },
    { patient: patientsCreated[6], service: findSvc('Shoulder Pain'), doctor: doctorMehta, when: dayOffset(1, 11), status: 'scheduled', type: 'followup' },
    { patient: patientsCreated[7], service: findSvc('Pediatric'), doctor: doctorJoshi, when: dayOffset(1, 15), status: 'scheduled', type: 'followup' },
    { patient: patientsCreated[8], service: findSvc('Geriatric'), doctor: doctorPatel, when: dayOffset(2, 10), status: 'scheduled', type: 'followup' },
    { patient: patientsCreated[9], service: findSvc('Back Pain'), doctor: doctorMehta, when: dayOffset(2, 16), status: 'scheduled', type: 'new' },
    { patient: patientsCreated[0], service: findSvc('Back Pain'), doctor: doctorPatel, when: dayOffset(-2, 10), status: 'completed', type: 'followup' },
    { patient: patientsCreated[1], service: findSvc('Post-Surgery'), doctor: doctorMehta, when: dayOffset(-2, 11, 30), status: 'completed', type: 'followup' },
    { patient: patientsCreated[2], service: findSvc('Paralysis'), doctor: doctorJoshi, when: dayOffset(-3, 14), status: 'completed', type: 'followup' },
    { patient: patientsCreated[4], service: findSvc('Sports Injury'), doctor: doctorShah, when: dayOffset(-4, 17, 30), status: 'completed', type: 'followup' },
    { patient: patientsCreated[5], service: findSvc('Frozen Shoulder'), doctor: doctorMehta, when: dayOffset(-5, 9, 30), status: 'completed', type: 'followup' },
    { patient: patientsCreated[3], service: findSvc('Neck Pain'), doctor: doctorPatel, when: dayOffset(-6, 16), status: 'cancelled', type: 'followup' },
    { patient: patientsCreated[6], service: findSvc('Shoulder Pain'), doctor: doctorMehta, when: dayOffset(-7, 11), status: 'completed', type: 'new' },
    { patient: patientsCreated[8], service: findSvc('Geriatric'), doctor: doctorPatel, when: dayOffset(-10, 10), status: 'no_show', type: 'followup' },
  ];

  const appointmentsCreated: any[] = [];
  for (const a of APPOINTMENT_SEEDS) {
    const existing = await Appointment.findOne({ patient: a.patient._id, scheduledAt: a.when });
    if (existing) {
      appointmentsCreated.push(existing);
      continue;
    }
    const appt = await Appointment.create({
      appointmentId: await generateAppointmentId(),
      patient: a.patient._id,
      doctor: a.doctor!._id,
      service: a.service._id,
      scheduledAt: a.when,
      duration: 45,
      status: a.status,
      type: a.type,
      bookedBy: adminUser!._id,
    });
    appointmentsCreated.push(appt);
  }
  console.log(`  ✅ Created ${appointmentsCreated.length} appointments`);

  // ─── 6. Treatment Sessions ─────────────────────────────────────────────────
  console.log('\n📝 Seeding treatment sessions...');
  const completedAppts = appointmentsCreated.filter((a) => a.status === 'completed' || a.status === 'in_progress');
  const SOAP_TEMPLATES = [
    { subjective: 'Patient reports 60% improvement in pain since last session. Sleep is better. No new complaints.', objective: 'Lumbar ROM: flexion 70°, extension 20°. SLR negative bilaterally. Strength 4/5 in core stabilizers.', assessment: 'Significant improvement in lumbar function. Tolerating progressive loading well.', plan: 'Continue current protocol. Progress core strengthening to level 3. Reassess in 2 sessions.' },
    { subjective: 'Patient feeling much better. Able to perform daily activities with minimal discomfort.', objective: 'ROM near full. Pain on movement reduced from 6/10 to 2/10. Functional tests improved.', assessment: 'Excellent recovery progress. Ready for return-to-activity phase.', plan: 'Begin sport-specific drills. Add plyometric loading. Discharge planning in 2-3 sessions.' },
    { subjective: 'Reports occasional stiffness in mornings, otherwise comfortable throughout the day.', objective: 'Joint mobility within functional range. Mild residual tightness in capsule. Strength symmetrical.', assessment: 'Functional restoration achieved. Maintenance phase appropriate.', plan: 'Home exercise program reviewed. Monthly follow-up. Discharge with maintenance plan.' },
  ];

  let sessionsCreated = 0;
  for (let i = 0; i < completedAppts.length; i++) {
    const appt = completedAppts[i];
    const exists = await TreatmentSession.findOne({ appointment: appt._id });
    if (exists) continue;
    const tpl = SOAP_TEMPLATES[i % SOAP_TEMPLATES.length];
    const sessionNum = (await TreatmentSession.countDocuments({ patient: appt.patient })) + 1;
    await TreatmentSession.create({
      patient: appt.patient,
      appointment: appt._id,
      doctor: appt.doctor,
      sessionNumber: sessionNum,
      date: appt.scheduledAt,
      chiefComplaint: 'Per assigned protocol — ongoing rehabilitation',
      soapNotes: tpl,
      vitalSigns: { bp: '120/80', pulse: 72, painScale: Math.max(0, 6 - sessionNum) },
      treatmentsGiven: ['Manual therapy', 'Therapeutic ultrasound', 'IFT', 'Stretching protocol'],
      exercisesPrescribed: ['Pelvic tilts 3x10', 'Bridges 3x12', 'Bird-dog 2x10 each side', 'Stretching routine 10 min'],
      recoveryPercentage: Math.min(95, 30 + sessionNum * 12),
    });
    sessionsCreated++;
  }
  console.log(`  ✅ Created ${sessionsCreated} treatment sessions`);

  // ─── 7. Billings ───────────────────────────────────────────────────────────
  console.log('\n📝 Seeding billings...');
  let billsCreated = 0;
  for (let i = 0; i < completedAppts.length; i++) {
    const appt = completedAppts[i];
    const exists = await Billing.findOne({ appointment: appt._id });
    if (exists) continue;
    const svc = await Service.findById(appt.service);
    const unitPrice = svc?.price?.from ?? 800;
    const items = [{ description: `${svc?.name ?? 'Therapy session'} — Session ${(i % 6) + 1}`, quantity: 1, unitPrice, total: unitPrice }];
    const subtotal = unitPrice;
    const discount = i % 4 === 0 ? 100 : 0;
    const tax = 0;
    const totalAmount = subtotal - discount + tax;
    const paidScenarios = [
      { paid: totalAmount, status: 'paid', method: 'upi_manual' as const },
      { paid: totalAmount, status: 'paid', method: 'cash' as const },
      { paid: Math.round(totalAmount * 0.5), status: 'partial', method: 'cash' as const },
      { paid: 0, status: 'pending', method: 'pending' as const },
    ];
    const sc = paidScenarios[i % paidScenarios.length];
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
      receivedBy: sc.status !== 'pending' ? adminUser!._id : undefined,
      createdBy: adminUser!._id,
    });
    billsCreated++;
  }
  console.log(`  ✅ Created ${billsCreated} invoices`);

  // ─── 8. Blogs ──────────────────────────────────────────────────────────────
  console.log('\n📝 Seeding blogs...');
  const BLOG_SEEDS = [
    { title: '5 Physiotherapist-Approved Exercises for Lower Back Pain Relief', slug: '5-exercises-for-lower-back-pain', category: 'Back Pain', tags: ['back pain', 'exercise', 'home therapy'], excerpt: 'Lower back pain affects 80% of people. Our senior physiotherapist shares five evidence-based exercises you can do at home for immediate relief.', author: doctorPatel },
    { title: 'Understanding Cervical Spondylosis: Causes, Symptoms & Treatment', slug: 'understanding-cervical-spondylosis', category: 'Spine Care', tags: ['neck pain', 'spondylosis', 'spine'], excerpt: 'Neck pain and stiffness are increasingly common in the digital age. Learn how cervical spondylosis develops and how physiotherapy offers long-term relief.', author: doctorMehta },
    { title: 'A Complete Guide to Post-Stroke Rehabilitation & Recovery', slug: 'post-stroke-rehabilitation-guide', category: 'Neuro Rehab', tags: ['stroke', 'neuro', 'rehabilitation'], excerpt: 'Stroke recovery is a journey. Our neuro physio team explains the stages of recovery and what to expect from a structured rehabilitation program.', author: doctorJoshi },
    { title: 'Managing Knee Osteoarthritis with Physiotherapy — A Patient Guide', slug: 'knee-osteoarthritis-management', category: 'Joint Care', tags: ['knee', 'arthritis', 'joints'], excerpt: 'Knee osteoarthritis doesn\'t have to mean a lifetime of pain. Learn how targeted physiotherapy can significantly reduce pain and improve function.', author: doctorPatel },
    { title: '10 Physiotherapist Tips to Prevent Sports Injuries', slug: 'sports-injury-prevention-tips', category: 'Sports', tags: ['sports', 'prevention', 'fitness'], excerpt: 'Prevention is better than cure. Our sports physio experts share essential warm-up, cool-down, and conditioning tips for athletes of all levels.', author: doctorShah },
    { title: 'Frozen Shoulder: What It Is and How We Treat It', slug: 'frozen-shoulder-treatment', category: 'Shoulder', tags: ['shoulder', 'frozen shoulder', 'mobility'], excerpt: 'Adhesive capsulitis affects 2-5% of the population. Discover the stages, symptoms, and physiotherapy treatments that restore full shoulder mobility.', author: doctorMehta },
  ];

  for (const b of BLOG_SEEDS) {
    if (await Blog.findOne({ slug: b.slug })) continue;
    await Blog.create({
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: `<p>${b.excerpt}</p><p>This is sample blog content for the admin panel preview. Replace it with the full article body via the rich text editor in the admin blog page.</p><h2>Key Points</h2><ul><li>Evidence-based recommendations</li><li>Practical, actionable advice</li><li>When to seek professional help</li></ul>`,
      author: b.author!._id,
      category: b.category,
      tags: b.tags,
      status: 'published',
      publishedAt: new Date(),
      seo: { metaTitle: `${b.title} | SAI Physiotherapy`, metaDescription: b.excerpt, keywords: b.tags },
      views: Math.floor(Math.random() * 800) + 100,
    });
    console.log(`  ✅ Blog: ${b.title}`);
  }

  // ─── 9. Testimonials ───────────────────────────────────────────────────────
  console.log('\n📝 Seeding testimonials...');
  const TESTIMONIAL_SEEDS = [
    { patientName: 'Priya Sharma', patientAge: 39, condition: 'Chronic Lower Back Pain', rating: 5, review: 'After suffering from chronic back pain for 3 years, SAI Physiotherapy gave me my life back! Dr. Patel\'s treatment plan was exceptional and I recovered in just 2 months.', isApproved: true, isFeatured: true, source: 'manual' as const },
    { patientName: 'Rajesh Patel', patientAge: 51, condition: 'Knee Replacement Rehab', rating: 5, review: 'Post knee replacement, I was worried about recovery. The team here made it seamless. The exercises and physiotherapy sessions were perfectly planned. Highly recommend!', isApproved: true, isFeatured: true, source: 'manual' as const },
    { patientName: 'Meena Joshi', patientAge: 65, condition: 'Paralysis Rehab', rating: 5, review: 'My mother had a stroke and couldn\'t walk. After 6 months of rehabilitation at SAI, she can now walk independently. The staff is incredibly skilled and caring.', isApproved: true, isFeatured: true, source: 'manual' as const },
    { patientName: 'Vikram Shah', patientAge: 33, condition: 'Cervical Spondylosis', rating: 5, review: 'Cervical pain was affecting my work daily. The team here diagnosed correctly and within 10 sessions I felt 80% better. Excellent knowledge and professional approach.', isApproved: true, isFeatured: false, source: 'website_form' as const },
    { patientName: 'Anita Desai', patientAge: 28, condition: 'Sports Injury', rating: 5, review: 'As a runner with a ligament tear, I needed quick recovery. SAI\'s sports rehab program got me back on the track in record time. Couldn\'t be happier!', isApproved: true, isFeatured: false, source: 'google' as const },
    { patientName: 'Harish Kumar', patientAge: 55, condition: 'Frozen Shoulder', rating: 5, review: 'Frozen shoulder was limiting everything from driving to sleeping. The physiotherapists here are world-class. Full mobility restored in 8 weeks!', isApproved: true, isFeatured: false, source: 'website_form' as const },
    { patientName: 'Kavita Iyer', patientAge: 43, condition: 'Tennis Elbow', rating: 4, review: 'Quick recovery from tennis elbow. The staff was very knowledgeable and patient. Slightly long wait times on Saturdays but otherwise excellent.', isApproved: true, isFeatured: false, source: 'website_form' as const },
    { patientName: 'Ramesh Trivedi', patientAge: 75, condition: 'Geriatric Care', rating: 5, review: 'After two falls last year, I had lost confidence. The geriatric program here helped me regain my balance and independence. Highly recommended for seniors.', isApproved: true, isFeatured: false, source: 'manual' as const },
    { patientName: 'Sanjay Gupta', patientAge: 47, condition: 'Disc Herniation', rating: 5, review: 'My MRI showed a disc herniation and surgery was suggested. SAI Physiotherapy\'s conservative approach saved me from surgery. 6 months pain-free now.', isApproved: false, isFeatured: false, source: 'website_form' as const },
    { patientName: 'Pooja Mehta', patientAge: 32, condition: 'Pediatric Therapy', rating: 5, review: 'My son has been receiving pediatric therapy here. The therapists make him feel comfortable and the progress has been visible. Thank you SAI team!', isApproved: false, isFeatured: false, source: 'website_form' as const },
  ];

  for (const t of TESTIMONIAL_SEEDS) {
    if (await Testimonial.findOne({ patientName: t.patientName, condition: t.condition })) continue;
    await Testimonial.create(t);
  }
  console.log(`  ✅ Created testimonials`);

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
