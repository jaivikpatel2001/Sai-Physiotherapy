import { UserRole } from './roles';

// ─── Base ─────────────────────────────────────────────────────────────────────

export interface ITimestamps {
  createdAt: Date;
  updatedAt: Date;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface IUser extends ITimestamps {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  avatar?: string;
  specialization?: string; // for doctors
  qualification?: string;
  experience?: number; // years
  bio?: string;
  isActive: boolean;
  lastLogin?: Date;
}

// ─── Patient ──────────────────────────────────────────────────────────────────

export interface IPatient extends ITimestamps {
  _id: string;
  userId?: string;
  patientId: string; // SAI-2024-0001
  personalInfo: {
    name: string;
    dob: Date;
    gender: 'male' | 'female' | 'other';
    phone: string;
    email?: string;
    address: string;
    city: string;
    bloodGroup?: string;
    emergencyContact: {
      name: string;
      phone: string;
      relation: string;
    };
  };
  medicalHistory: {
    chiefComplaint: string;
    pastHistory?: string;
    surgicalHistory?: string;
    medications?: string[];
    allergies?: string[];
    comorbidities?: string[];
  };
  documents: Array<{
    _id: string;
    type: 'mri' | 'xray' | 'report' | 'prescription' | 'other';
    url: string;
    storageKey: string;
    storageProvider: 'r2' | 'local';
    mimetype?: string;
    size?: number;
    uploadedAt: Date;
    uploadedBy: string;
  }>;
  assignedDoctor: string;
  status: 'active' | 'discharged' | 'followup';
  tags?: string[];
  createdBy: string;
}

// ─── Appointment ──────────────────────────────────────────────────────────────

export interface IAppointment extends ITimestamps {
  _id: string;
  appointmentId: string; // APT-2024-00001
  patient: string;
  doctor: string;
  service: string;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  type: 'new' | 'followup' | 'emergency';
  tokenNumber?: number;
  notes?: string;
  cancelReason?: string;
  reminders: {
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  bookedBy: string;
}

// ─── Treatment Session ────────────────────────────────────────────────────────

export interface ITreatmentSession {
  _id: string;
  patient: string;
  appointment: string;
  doctor: string;
  sessionNumber: number;
  date: Date;
  chiefComplaint: string;
  soapNotes: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  vitalSigns?: {
    bp?: string;
    pulse?: number;
    temperature?: number;
    spo2?: number;
    painScale: number; // 0-10
  };
  treatmentsGiven: string[];
  exercisesPrescribed: string[];
  recoveryPercentage: number; // 0-100
  nextSessionDate?: Date;
  attachments?: string[];
  createdAt: Date;
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export type PaymentMethod = 'cash' | 'upi_manual' | 'bank_transfer' | 'cheque' | 'pending';
export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'waived';

export interface IBilling extends ITimestamps {
  _id: string;
  invoiceNumber: string; // INV-2024-00001
  patient: string;
  appointment?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  discountType: 'flat' | 'percentage';
  tax: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDate?: Date;
  receivedBy: string;
  notes?: string;
  packageId?: string;
  createdBy: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export interface IService extends ITimestamps {
  _id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  price: { from: number; to?: number };
  duration: string;
  bannerImage: string;
  images: string[];
  treatmentProcess: string[];
  benefits: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedVideos?: string[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl?: string;
    ogImage?: string;
  };
  isActive: boolean;
  order: number;
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export interface IBlog extends ITimestamps {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
  };
  views: number;
}

// ─── Testimonial ──────────────────────────────────────────────────────────────

export interface ITestimonial {
  _id: string;
  patientName: string;
  patientAge?: number;
  condition: string;
  rating: number; // 1-5
  review: string;
  videoUrl?: string;
  beforeAfterImages?: { before: string; after: string };
  isApproved: boolean;
  isFeatured: boolean;
  source: 'manual' | 'google' | 'website_form';
  googleReviewId?: string;
  createdAt: Date;
}

// ─── Clinic Settings ──────────────────────────────────────────────────────────

export interface IClinicSettings extends ITimestamps {
  _id: string;
  clinicName: string;
  tagline: string;
  logo: string;
  favicon: string;
  contact: {
    phones: string[];
    whatsapp: string;
    emails: string[];
    address: string;
    city: string;
    state: string;
    pincode: string;
    googleMapsUrl: string;
    googleMapsEmbed: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
  };
  businessHours: Array<{
    day: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
  seo: {
    globalMetaTitle: string;
    globalMetaDescription: string;
    googleAnalyticsId?: string;
    googleSearchConsole?: string;
  };
  homepage: {
    heroSlides: Array<{
      title: string;
      subtitle: string;
      image: string;
      ctaText: string;
      ctaLink: string;
    }>;
    stats: Array<{ label: string; value: string; icon: string }>;
    featuredServices: string[];
    promotionBanner?: { text: string; isActive: boolean };
  };
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
}
