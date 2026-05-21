import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogDocument extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredStorageKey?: string;
  featuredStorageProvider?: 'r2' | 'local';
  author: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlogDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, required: true, maxlength: 500 },
    content: { type: String, required: true }, // TipTap HTML
    featuredImage: { type: String, default: '' },
    featuredStorageKey: { type: String },
    featuredStorageProvider: { type: String, enum: ['r2', 'local'] },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true, default: 'Health Tips' },
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    publishedAt: { type: Date },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      keywords: [{ type: String }],
      ogImage: { type: String },
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes (slug index created by unique:true above)
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });

// Auto-set publishedAt when status changes to published
blogSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const Blog = mongoose.model<IBlogDocument>('Blog', blogSchema);
