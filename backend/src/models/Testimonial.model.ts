import mongoose, { Document, Schema } from 'mongoose';

export interface ITestimonialDocument extends Document {
  patientName: string;
  patientAge?: number;
  condition: string;
  rating: number;
  review: string;
  videoUrl?: string;
  beforeAfterImages?: { before: string; after: string };
  isApproved: boolean;
  isFeatured: boolean;
  source: 'manual' | 'google' | 'website_form';
  googleReviewId?: string;
  createdAt: Date;
}

const testimonialSchema = new Schema<ITestimonialDocument>(
  {
    patientName: { type: String, required: true, trim: true },
    patientAge: { type: Number, min: 1, max: 120 },
    condition: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true, minlength: 10 },
    videoUrl: { type: String },
    beforeAfterImages: {
      before: { type: String },
      after: { type: String },
    },
    isApproved: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    source: { type: String, enum: ['manual', 'google', 'website_form'], default: 'website_form' },
    googleReviewId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

testimonialSchema.index({ isApproved: 1, isFeatured: -1 });
testimonialSchema.index({ rating: -1 });

export const Testimonial = mongoose.model<ITestimonialDocument>('Testimonial', testimonialSchema);
