'use client';
import { useState } from 'react';
import { Calendar, User, Phone, Mail, FileText, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import styles from './book.module.css';

const SERVICES = [
  'Back Pain Treatment', 'Spine Care & Disc Problems', 'Paralysis Rehabilitation',
  'Knee Pain & Joint Care', 'Neck Pain & Cervical Care', 'Sports Injury Rehabilitation',
  'Neuro Physiotherapy', 'Post-Surgery Rehabilitation', 'Pediatric Physiotherapy',
  'Geriatric Care', 'Shoulder Pain Treatment', 'Frozen Shoulder', 'Other / Not Sure',
];

const TIME_SLOTS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'];

const STEPS = ['Service', 'Date & Time', 'Your Details', 'Confirm'];

type FormData = {
  service: string; otherCondition: string;
  date: string; time: string;
  name: string; phone: string; email: string; gender: string; age: string;
  notes: string; isFirstVisit: string;
};

const EMPTY: FormData = {
  service: '', otherCondition: '', date: '', time: '',
  name: '', phone: '', email: '', gender: '', age: '',
  notes: '', isFirstVisit: 'yes',
};

export default function BookAppointmentPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k: keyof FormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return !!form.service;
    if (step === 1) return !!form.date && !!form.time;
    if (step === 2) return !!form.name && !!form.phone;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitted(true);
    setLoading(false);
  };

  const today = new Date().toISOString().split('T')[0];

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.successCard}>
            <div className={styles.successIcon}><CheckCircle2 size={64} /></div>
            <h1 className={styles.successTitle}>Appointment Booked!</h1>
            <p className={styles.successDesc}>
              Your appointment has been requested for <strong>{form.date}</strong> at <strong>{form.time}</strong>.
              Our team will call you at <strong>{form.phone}</strong> to confirm within 30 minutes.
            </p>
            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}><span>Service</span><strong>{form.service}</strong></div>
              <div className={styles.summaryRow}><span>Date</span><strong>{form.date}</strong></div>
              <div className={styles.summaryRow}><span>Time</span><strong>{form.time}</strong></div>
              <div className={styles.summaryRow}><span>Patient</span><strong>{form.name}</strong></div>
            </div>
            <div className={styles.successActions}>
              <a href="https://wa.me/919999999999?text=I just booked an appointment at SAI Physiotherapy" target="_blank" rel="noopener noreferrer" className={styles.waConfirm}>
                Confirm on WhatsApp
              </a>
              <button onClick={() => { setSubmitted(false); setForm(EMPTY); setStep(0); }} className={styles.anotherBtn}>
                Book Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>Book an <span>Appointment</span></h1>
          <p className={styles.heroDesc}>Fill in the form below and our team will confirm your appointment within 30 minutes.</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.formWrap}>
          {/* Progress */}
          <div className={styles.stepper}>
            {STEPS.map((s, i) => (
              <div key={s} className={`${styles.stepperItem} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
                <div className={styles.stepCircle}>
                  {i < step ? <CheckCircle2 size={16} /> : <span>{i + 1}</span>}
                </div>
                <span className={styles.stepLabel}>{s}</span>
                {i < STEPS.length - 1 && <div className={styles.stepLine} />}
              </div>
            ))}
          </div>

          {/* Step 0: Service */}
          {step === 0 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}><FileText size={22} /> Select Your Condition</h2>
              <div className={styles.serviceGrid}>
                {SERVICES.map((s) => (
                  <button
                    key={s}
                    className={`${styles.serviceOption} ${form.service === s ? styles.serviceSelected : ''}`}
                    onClick={() => update('service', s)}
                    type="button"
                  >
                    {s}
                    {form.service === s && <CheckCircle2 size={16} className={styles.selectedCheck} />}
                  </button>
                ))}
              </div>
              {form.service === 'Other / Not Sure' && (
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Describe your condition briefly</label>
                  <textarea className="form-input" rows={3} placeholder="E.g., I have pain in my lower back after lifting..." value={form.otherCondition} onChange={(e) => update('otherCondition', e.target.value)} />
                </div>
              )}
            </div>
          )}

          {/* Step 1: Date & Time */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}><Calendar size={22} /> Choose Date & Time</h2>
              <div className={styles.dateTimeGrid}>
                <div className="form-group">
                  <label className="form-label">Preferred Date *</label>
                  <input type="date" className="form-input" min={today} value={form.date} onChange={(e) => update('date', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">First Visit?</label>
                  <select className="form-input" value={form.isFirstVisit} onChange={(e) => update('isFirstVisit', e.target.value)}>
                    <option value="yes">Yes, first visit</option>
                    <option value="no">No, follow-up</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Time Slot *</label>
                <div className={styles.slotGrid}>
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      className={`${styles.slotBtn} ${form.time === t ? styles.slotSelected : ''}`}
                      onClick={() => update('time', t)}
                      type="button"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Patient Details */}
          {step === 2 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}><User size={22} /> Your Details</h2>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="Your full name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input className="form-input" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                    <option value="">Select gender</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="form-input" type="number" placeholder="e.g. 35" min="1" max="120" value={form.age} onChange={(e) => update('age', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea className="form-input" rows={3} placeholder="Any specific symptoms, medications, or concerns..." value={form.notes} onChange={(e) => update('notes', e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}><CheckCircle2 size={22} /> Review & Confirm</h2>
              <div className={styles.reviewCard}>
                {[
                  { label: 'Service', value: form.service },
                  { label: 'Date', value: form.date },
                  { label: 'Time', value: form.time },
                  { label: 'Patient Name', value: form.name },
                  { label: 'Phone', value: form.phone },
                  form.email ? { label: 'Email', value: form.email } : null,
                  form.age ? { label: 'Age', value: form.age } : null,
                  form.notes ? { label: 'Notes', value: form.notes } : null,
                ].filter(Boolean).map((r) => r && (
                  <div key={r.label} className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>{r.label}</span>
                    <span className={styles.reviewValue}>{r.value}</span>
                  </div>
                ))}
              </div>
              <p className={styles.confirmNote}>
                📞 Our team will call you at <strong>{form.phone}</strong> within 30 minutes to confirm your appointment.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className={styles.navBtns}>
            {step > 0 && (
              <button className={styles.prevBtn} onClick={() => setStep(step - 1)} type="button">
                <ChevronLeft size={18} /> Back
              </button>
            )}
            {step < 3 ? (
              <button className={styles.nextBtn} onClick={() => setStep(step + 1)} disabled={!canNext()} type="button">
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading} type="button">
                {loading ? <span className={styles.spinner} /> : <><CheckCircle2 size={18} /> Confirm Appointment</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
