import mongoose, { Document, Schema } from 'mongoose';

export type PaymentMethod = 'cash' | 'upi_manual' | 'bank_transfer' | 'cheque' | 'pending';
export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'waived';

export interface IBillingDocument extends Document {
  invoiceNumber: string;
  patient: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
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
  receivedBy: mongoose.Types.ObjectId;
  notes?: string;
  packageId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const billingSchema = new Schema<IBillingDocument>(
  {
    invoiceNumber: { type: String, unique: true, required: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    discountType: { type: String, enum: ['flat', 'percentage'], default: 'flat' },
    tax: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    balanceDue: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi_manual', 'bank_transfer', 'cheque', 'pending'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'partial', 'pending', 'waived'],
      default: 'pending',
    },
    paymentDate: { type: Date },
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
    packageId: { type: Schema.Types.ObjectId, ref: 'Package' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes (invoiceNumber index created by unique:true above)
billingSchema.index({ patient: 1 });
billingSchema.index({ paymentStatus: 1 });
billingSchema.index({ createdAt: -1 });

// ─── Auto-calculate balance ───────────────────────────────────────────────────
billingSchema.pre('save', function (next) {
  this.balanceDue = Math.max(0, this.totalAmount - this.amountPaid);
  if (this.amountPaid >= this.totalAmount) {
    this.paymentStatus = 'paid';
  } else if (this.amountPaid > 0) {
    this.paymentStatus = 'partial';
  }
  next();
});

export const Billing = mongoose.model<IBillingDocument>('Billing', billingSchema);
