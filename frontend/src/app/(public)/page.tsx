import type { Metadata } from 'next';
import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '@/components/sections/StatsSection';
import ServicesSection from '@/components/sections/ServicesSection';
import WhyChooseSection from '@/components/sections/WhyChooseSection';
import DoctorsSection from '@/components/sections/DoctorsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import BlogPreviewSection from '@/components/sections/BlogPreviewSection';
import EmergencyBanner from '@/components/sections/EmergencyBanner';

export const metadata: Metadata = {
  title: 'SAI Physiotherapy Spine Care & Paralysis Centre | Ahmedabad, Gujarat',
  description:
    "Gujarat's leading physiotherapy and rehabilitation center. Expert treatment for back pain, spine care, paralysis, sports injuries, knee pain & 12+ conditions. 10,000+ patients healed. Book your appointment in Ahmedabad today.",
  keywords: 'physiotherapy ahmedabad, spine care, paralysis rehabilitation, back pain treatment, sai physiotherapy, neuro physiotherapy gujarat',
  openGraph: {
    title: 'SAI Physiotherapy Spine Care & Paralysis Centre',
    description: "Gujarat's leading physiotherapy center — 10,000+ patients healed.",
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <WhyChooseSection />
      <DoctorsSection />
      <TestimonialsSection />
      <BlogPreviewSection />
      <EmergencyBanner />
    </>
  );
}
