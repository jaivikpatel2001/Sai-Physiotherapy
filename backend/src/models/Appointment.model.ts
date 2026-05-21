import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointmentDocument extends Document {
  appointmentId: string;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
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
  bookedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointmentDocument>(
  {
    appointmentId: { type: String, unique: true, required: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 30 }, // minutes
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled',
    },
    type: { type: String, enum: ['new', 'followup', 'emergency'], default: 'new' },
    tokenNumber: { type: Number },
    notes: { type: String },
    cancelReason: { type: String },
    reminders: {
      sms: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
    },
    bookedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes (appointmentId index created by unique:true above)
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1, scheduledAt: 1 });
appointmentSchema.index({ scheduledAt: 1 });
appointmentSchema.index({ status: 1 });

export const Appointment = mongoose.model<IAppointmentDocument>('Appointment', appointmentSchema);
