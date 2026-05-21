import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctorDocument extends Document {
  name: string;
  slug: string;
  designation: string;
  specialties: string[];
  bio: string;
  shortBio: string;
  photo: {
    url: string;
    storageKey?: string;
    storageProvider?: 'r2' | 'local';
    mimetype?: string;
  };
  credentials: string[];
  qualifications: string[];
  languages: string[];
  experienceYears: number;
  registrationNumber?: string;
  consultationFee?: number;
  availability: {
    days: Array<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'>;
    timeStart: string;
    timeEnd: string;
    sessionDurationMins: number;
    notes?: string;
  };
  userId?: mongoose.Types.ObjectId;
  socials?: { linkedin?: string; instagram?: string; facebook?: string };
  order: number;
  isActive: boolean;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctorDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    designation: { type: String, required: true, trim: true, maxlength: 200 },
    specialties: [{ type: String, trim: true }],
    bio: { type: String, required: true },
    shortBio: { type: String, required: true, maxlength: 320 },
    photo: {
      url: { type: String, required: true },
      storageKey: { type: String, default: '' },
      storageProvider: { type: String, enum: ['r2', 'local'], default: 'local' },
      mimetype: { type: String },
    },
    credentials: [{ type: String, trim: true }],
    qualifications: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    experienceYears: { type: Number, default: 0, min: 0 },
    registrationNumber: { type: String, trim: true },
    consultationFee: { type: Number, min: 0 },
    availability: {
      days: [
        {
          type: String,
          enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        },
      ],
      timeStart: { type: String, default: '09:00' },
      timeEnd: { type: String, default: '20:00' },
      sessionDurationMins: { type: Number, default: 30 },
      notes: { type: String, trim: true },
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    socials: {
      linkedin: { type: String, trim: true },
      instagram: { type: String, trim: true },
      facebook: { type: String, trim: true },
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seo: {
      metaTitle: { type: String, trim: true, maxlength: 200 },
      metaDescription: { type: String, trim: true, maxlength: 320 },
      keywords: [{ type: String, trim: true }],
    },
  },
  { timestamps: true },
);

doctorSchema.index({ isActive: 1, order: 1 });
doctorSchema.index({ specialties: 1 });
doctorSchema.index({ name: 'text', shortBio: 'text', bio: 'text' });

export const Doctor = mongoose.model<IDoctorDocument>('Doctor', doctorSchema);
