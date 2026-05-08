import type { Metadata } from 'next';
import Link from 'next/link';
import { Star, Quote } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Patient Testimonials & Success Stories | SAI Physiotherapy',
  description: 'Read 500+ patient reviews and recovery success stories from SAI Physiotherapy. Real patients, real results.',
};

const TESTIMONIALS = [
  { name: 'Priya Sharma', location: 'Ahmedabad', rating: 5, condition: 'Back Pain', text: 'After suffering from chronic back pain for 3 years, SAI Physiotherapy gave me my life back! Dr. Patel\'s treatment plan was exceptional.', avatar: 'PS' },
  { name: 'Rajesh Patel', location: 'Gandhinagar', rating: 5, condition: 'Knee Replacement Rehab', text: 'Post knee replacement, the team here made recovery seamless. The exercises and sessions were perfectly planned. Highly recommend!', avatar: 'RP' },
  { name: 'Meena Joshi', location: 'Surat', rating: 5, condition: 'Paralysis Rehab', text: 'My mother had a stroke and couldn\'t walk. After 6 months of rehabilitation at SAI, she can now walk independently. Incredibly skilled staff.', avatar: 'MJ' },
  { name: 'Vikram Shah', location: 'Vadodara', rating: 5, condition: 'Cervical Spondylosis', text: 'Cervical pain was affecting my work daily. Within 10 sessions I felt 80% better. Excellent knowledge and professional approach.', avatar: 'VS' },
  { name: 'Anita Desai', location: 'Ahmedabad', rating: 5, condition: 'Sports Injury', text: 'As a runner with a ligament tear, SAI\'s sports rehab program got me back on the track in record time. Couldn\'t be happier!', avatar: 'AD' },
  { name: 'Harish Kumar', location: 'Rajkot', rating: 5, condition: 'Frozen Shoulder', text: 'Full mobility restored in 8 weeks! The physiotherapists here are world-class. Frozen shoulder was limiting everything from driving to sleeping.', avatar: 'HK' },
  { name: 'Sita Bhatt', location: 'Ahmedabad', rating: 5, condition: 'Post Surgery Rehab', text: 'After hip replacement surgery I was scared about recovery. The team gave me confidence and got me walking normally within weeks.', avatar: 'SB' },
  { name: 'Arun Malhotra', location: 'Ahmedabad', rating: 5, condition: 'Sciatica', text: 'Sciatica pain was unbearable — I couldn\'t sit or stand for more than a minute. After 12 sessions, I\'m completely pain free.', avatar: 'AM' },
  { name: 'Kavita Rao', location: 'Anand', rating: 5, condition: 'Neuro Physiotherapy', text: 'My son has cerebral palsy. The pediatric physio team at SAI has helped him achieve milestones we thought impossible. Grateful forever.', avatar: 'KR' },
];

export default function TestimonialsPage() {
  return (
    <div style={{ background: 'var(--color-bg)' }}>
      <div style={{ background: 'var(--gradient-primary)', padding: 'calc(var(--header-height) + 4rem) 0 4rem', textAlign: 'center' }}>
        <div className="container">
          <p className="section-label" style={{ justifyContent: 'center' }}>Patient Stories</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'white', fontWeight: 800, margin: '0.75rem 0 1rem' }}>
            Real Stories, <span style={{ color: 'var(--color-accent-light)' }}>Real Results</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'var(--text-lg)', maxWidth: 560, margin: '0 auto' }}>
            Over 500 patients have shared their recovery journeys with us. Here are just a few.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 'var(--radius-full)', padding: '0.75rem 2rem', width: 'fit-content', margin: '2rem auto 0' }}>
            <span style={{ color: '#FBBF24', fontSize: '1.5rem', letterSpacing: 2 }}>★★★★★</span>
            <span style={{ color: 'white', fontWeight: 700 }}>4.9 / 5.0</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>Based on 500+ Google Reviews</span>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.25s, box-shadow 0.25s' }}>
                <Quote size={24} style={{ color: 'var(--color-primary-100)' }} />
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="#FBBF24" color="#FBBF24" />
                  ))}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.7, fontStyle: 'italic', flex: 1 }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border-light)' }}>
                  <div style={{ width: 44, height: 44, background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)' }}>{t.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t.location} · {t.condition}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/book-appointment" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2.5rem', background: 'var(--gradient-primary)', color: 'white', borderRadius: 999, fontWeight: 700, boxShadow: 'var(--shadow-blue)' }}>
              Start Your Recovery Journey →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
