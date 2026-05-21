import mongoose, { Document, Schema } from 'mongoose';

export type GalleryCategory = 'clinic' | 'treatments' | 'events' | 'awards' | 'team';

export interface IGalleryDocument extends Document {
  title: string;
  caption?: string;
  category: GalleryCategory;
  image: {
    url: string;
    storageKey?: string;
    storageProvider?: 'r2' | 'local';
    mimetype?: string;
    width?: number;
    height?: number;
  };
  alt: string;
  order: number;
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGalleryDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    caption: { type: String, trim: true, maxlength: 500 },
    category: {
      type: String,
      enum: ['clinic', 'treatments', 'events', 'awards', 'team'],
      required: true,
      default: 'clinic',
    },
    image: {
      url: { type: String, required: true },
      storageKey: { type: String, default: '' },
      storageProvider: { type: String, enum: ['r2', 'local'], default: 'local' },
      mimetype: { type: String },
      width: { type: Number },
      height: { type: Number },
    },
    alt: { type: String, required: true, trim: true, maxlength: 200 },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

gallerySchema.index({ isPublished: 1, category: 1, order: 1 });
gallerySchema.index({ createdAt: -1 });

export const Gallery = mongoose.model<IGalleryDocument>('Gallery', gallerySchema);
