import mongoose, { Document, Schema } from 'mongoose';

export interface IServiceDocument extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IServiceDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: String, required: true, default: 'General' },
    shortDescription: { type: String, required: true, maxlength: 300 },
    longDescription: { type: String, required: true },
    price: {
      from: { type: Number, required: true, min: 0 },
      to: { type: Number },
    },
    duration: { type: String, default: '30-45 minutes' },
    bannerImage: { type: String, default: '' },
    images: [{ type: String }],
    treatmentProcess: [{ type: String }],
    benefits: [{ type: String }],
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    relatedVideos: [{ type: String }],
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      keywords: [{ type: String }],
      canonicalUrl: { type: String },
      ogImage: { type: String },
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes (slug index created by unique:true above)
serviceSchema.index({ isActive: 1, order: 1 });
serviceSchema.index({ name: 'text', shortDescription: 'text' });

export const Service = mongoose.model<IServiceDocument>('Service', serviceSchema);
