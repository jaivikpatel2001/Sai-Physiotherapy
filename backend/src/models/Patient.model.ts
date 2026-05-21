import mongoose, { Document, Schema } from 'mongoose';

export interface IPatientDocument extends Document {
  userId?: mongoose.Types.ObjectId;
  patientId: string;
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
    _id: mongoose.Types.ObjectId;
    type: 'mri' | 'xray' | 'report' | 'prescription' | 'other';
    url: string;
    storageKey: string;
    storageProvider: 'r2' | 'local';
    mimetype?: string;
    size?: number;
    uploadedAt: Date;
    uploadedBy: mongoose.Types.ObjectId;
  }>;
  assignedDoctor: mongoose.Types.ObjectId;
  status: 'active' | 'discharged' | 'followup';
  tags?: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatientDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    patientId: { type: String, unique: true, required: true },
    personalInfo: {
      name: { type: String, required: true, trim: true },
      dob: { type: Date, required: true },
      gender: { type: String, enum: ['male', 'female', 'other'], required: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, lowercase: true, trim: true },
      address: { type: String, required: true },
      city: { type: String, required: true, default: 'Ahmedabad' },
      bloodGroup: { type: String },
      emergencyContact: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        relation: { type: String, required: true },
      },
    },
    medicalHistory: {
      chiefComplaint: { type: String, required: true },
      pastHistory: { type: String },
      surgicalHistory: { type: String },
      medications: [{ type: String }],
      allergies: [{ type: String }],
      comorbidities: [{ type: String }],
    },
    documents: [
      {
        type: { type: String, enum: ['mri', 'xray', 'report', 'prescription', 'other'] },
        url: { type: String },
        storageKey: { type: String },
        storageProvider: { type: String, enum: ['r2', 'local'], default: 'local' },
        mimetype: { type: String },
        size: { type: Number },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    assignedDoctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'discharged', 'followup'], default: 'active' },
    tags: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes (patientId index created by unique:true above)
patientSchema.index({ 'personalInfo.name': 'text', 'personalInfo.phone': 1 });
patientSchema.index({ assignedDoctor: 1 });
patientSchema.index({ status: 1 });
patientSchema.index({ createdAt: -1 });

export const Patient = mongoose.model<IPatientDocument>('Patient', patientSchema);
