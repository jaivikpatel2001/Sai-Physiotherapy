import mongoose, { Document, Schema } from 'mongoose';

export interface ITreatmentSessionDocument extends Document {
  patient: mongoose.Types.ObjectId;
  appointment: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
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
    painScale: number;
  };
  treatmentsGiven: string[];
  exercisesPrescribed: string[];
  recoveryPercentage: number;
  nextSessionDate?: Date;
  attachments?: string[];
  createdAt: Date;
}

const treatmentSessionSchema = new Schema<ITreatmentSessionDocument>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionNumber: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true, default: Date.now },
    chiefComplaint: { type: String, required: true },
    soapNotes: {
      subjective: { type: String, required: true },
      objective: { type: String, required: true },
      assessment: { type: String, required: true },
      plan: { type: String, required: true },
    },
    vitalSigns: {
      bp: { type: String },
      pulse: { type: Number },
      temperature: { type: Number },
      spo2: { type: Number },
      painScale: { type: Number, min: 0, max: 10, required: true },
    },
    treatmentsGiven: [{ type: String }],
    exercisesPrescribed: [{ type: String }],
    recoveryPercentage: { type: Number, min: 0, max: 100, default: 0 },
    nextSessionDate: { type: Date },
    attachments: [{ type: String }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
treatmentSessionSchema.index({ patient: 1, date: -1 });
treatmentSessionSchema.index({ doctor: 1 });
treatmentSessionSchema.index({ appointment: 1 });

export const TreatmentSession = mongoose.model<ITreatmentSessionDocument>(
  'TreatmentSession',
  treatmentSessionSchema
);
