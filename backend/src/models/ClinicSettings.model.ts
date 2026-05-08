import mongoose, { Document, Schema } from 'mongoose';

export interface IClinicSettingsDocument extends Document {
  clinicName: string;
  tagline: string;
  logo: string;
  favicon: string;
  contact: {
    phones: string[];
    whatsapp: string;
    emails: string[];
    address: string;
    city: string;
    state: string;
    pincode: string;
    googleMapsUrl: string;
    googleMapsEmbed: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
  };
  businessHours: Array<{
    day: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
  seo: {
    globalMetaTitle: string;
    globalMetaDescription: string;
    googleAnalyticsId?: string;
    googleSearchConsole?: string;
  };
  homepage: {
    heroSlides: Array<{
      title: string;
      subtitle: string;
      image: string;
      ctaText: string;
      ctaLink: string;
    }>;
    stats: Array<{ label: string; value: string; icon: string }>;
    featuredServices: mongoose.Types.ObjectId[];
    promotionBanner?: { text: string; isActive: boolean };
  };
  updatedAt: Date;
}

const clinicSettingsSchema = new Schema<IClinicSettingsDocument>(
  {
    clinicName: { type: String, required: true, default: 'SAI Physiotherapy Spine Care & Paralysis Centre' },
    tagline: { type: String, default: "Gujarat's Leading Physiotherapy & Rehabilitation Center" },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    contact: {
      phones: [{ type: String }],
      whatsapp: { type: String, default: '' },
      emails: [{ type: String }],
      address: { type: String, default: 'Ahmedabad, Gujarat' },
      city: { type: String, default: 'Ahmedabad' },
      state: { type: String, default: 'Gujarat' },
      pincode: { type: String, default: '380001' },
      googleMapsUrl: { type: String, default: '' },
      googleMapsEmbed: { type: String, default: '' },
    },
    socialMedia: {
      facebook: { type: String },
      instagram: { type: String },
      youtube: { type: String },
      twitter: { type: String },
      linkedin: { type: String },
    },
    businessHours: [
      {
        day: { type: String },
        openTime: { type: String },
        closeTime: { type: String },
        isClosed: { type: Boolean, default: false },
      },
    ],
    seo: {
      globalMetaTitle: { type: String, default: 'SAI Physiotherapy | Best Spine & Paralysis Care in Ahmedabad' },
      globalMetaDescription: { type: String, default: 'SAI Physiotherapy Spine Care & Paralysis Centre - Expert physiotherapy, spine care, paralysis rehabilitation in Ahmedabad, Gujarat.' },
      googleAnalyticsId: { type: String },
      googleSearchConsole: { type: String },
    },
    homepage: {
      heroSlides: [
        {
          title: { type: String },
          subtitle: { type: String },
          image: { type: String },
          ctaText: { type: String },
          ctaLink: { type: String },
        },
      ],
      stats: [
        {
          label: { type: String },
          value: { type: String },
          icon: { type: String },
        },
      ],
      featuredServices: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
      promotionBanner: {
        text: { type: String },
        isActive: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

export const ClinicSettings = mongoose.model<IClinicSettingsDocument>(
  'ClinicSettings',
  clinicSettingsSchema
);
