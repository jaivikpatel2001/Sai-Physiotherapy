import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo/metadata';
import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '@/components/sections/StatsSection';
import ServicesSection from '@/components/sections/ServicesSection';
import WhyChooseSection from '@/components/sections/WhyChooseSection';
import DoctorsSection from '@/components/sections/DoctorsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import BlogPreviewSection from '@/components/sections/BlogPreviewSection';
import CtaSection from '@/components/sections/CtaSection';
import EmergencyBanner from '@/components/sections/EmergencyBanner';

export const metadata: Metadata = pageMeta({
  title: 'SAI Physiotherapy Spine Care & Paralysis Centre | Ahmedabad, Gujarat',
  description:
    "Gujarat's leading physiotherapy & rehabilitation centre in Ahmedabad. Expert treatment for back pain, spine care, paralysis, sports injuries, knee pain & 12+ conditions. 10,000+ patients healed. Book your appointment today.",
  path: '/',
});

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
      <CtaSection />
    </>
  );
}
