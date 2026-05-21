import mongoose, { Document, Schema } from 'mongoose';

/**
 * Page — admin-authored CMS page (e.g. /privacy-policy, /terms,
 * /refund-policy). Pages flagged `showInFooter:true` are surfaced
 * automatically in the public site footer.
 */
export interface IPageDocument extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  showInFooter: boolean;
  footerLabel?: string;
  footerOrder: number;
  isPublished: boolean;
  publishedAt?: Date;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  lastEditedBy: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new Schema<IPageDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, trim: true, maxlength: 500 },
    content: { type: String, required: true },
    showInFooter: { type: Boolean, default: false },
    footerLabel: { type: String, trim: true, maxlength: 80 },
    footerOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    seo: {
      metaTitle: { type: String, trim: true, maxlength: 200 },
      metaDescription: { type: String, trim: true, maxlength: 320 },
      keywords: [{ type: String, trim: true }],
    },
    lastEditedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

pageSchema.index({ isPublished: 1, showInFooter: 1, footerOrder: 1 });

pageSchema.pre('save', function (next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const Page = mongoose.model<IPageDocument>('Page', pageSchema);
