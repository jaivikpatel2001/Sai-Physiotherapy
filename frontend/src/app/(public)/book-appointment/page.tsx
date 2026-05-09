'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './book.module.css';

const SERVICES = [
  { value: 'Back Pain Treatment', icon: 'ri-walk-line' },
  { value: 'Spine Care & Disc Problems', icon: 'ri-mental-health-line' },
  { value: 'Paralysis Rehabilitation', icon: 'ri-heart-pulse-line' },
  { value: 'Knee Pain & Joint Care', icon: 'ri-run-line' },
  { value: 'Neck Pain & Cervical Care', icon: 'ri-emotion-unhappy-line' },
  { value: 'Sports Injury Rehabilitation', icon: 'ri-football-line' },
  { value: 'Neuro Physiotherapy', icon: 'ri-flashlight-line' },
  { value: 'Post-Surgery Rehabilitation', icon: 'ri-hospital-line' },
  { value: 'Pediatric Physiotherapy', icon: 'ri-parent-line' },
  { value: 'Geriatric Care', icon: 'ri-user-heart-line' },
  { value: 'Shoulder Pain Treatment', icon: 'ri-boxing-line' },
  { value: 'Frozen Shoulder', icon: 'ri-snowy-line' },
  { value: 'Other / Not Sure', icon: 'ri-question-line' },
];

const TIME_SLOTS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'];

const STEPS = ['Service', 'Date & Time', 'Your Details', 'Confirm'];

type FormData = {
  service: string; otherCondition: string;
  date: string; time: string;
  name: string; phone: string; email: string; gender: string; age: string;
  notes: string; isFirstVisit: 'yes' | 'no';
};

const EMPTY: FormData = {
  service: '', otherCondition: '', date: '', time: '',
  name: '', phone: '', email: '', gender: '', age: '',
  notes: '', isFirstVisit: 'yes',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildDates(): { iso: string; day: string; date: number; month: string }[] {
  const out: { iso: string; day: string; date: number; month: string }[] = [];
  const today = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({
      iso: d.toISOString().split('T')[0],
      day: i === 0 ? 'Today' : DAY_NAMES[d.getDay()],
      date: d.getDate(),
      month: monthNames[d.getMonth()],
    });
  }
  return out;
}

export default function BookAppointmentPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const dates = useMemo(buildDates, []);

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return !!form.service;
    if (step === 1) return !!form.date && !!form.time;
    if (step === 2) return !!form.name && form.phone.replace(/\D/g, '').length >= 10;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.heroBg}>
          <div className={styles.heroMesh} />
        </div>
        <div className="container">
          <div className={styles.successCard}>
            <div className={styles.successCheck}>
              <i className="ri-checkbox-circle-fill" />
            </div>
            <h1 className={styles.successTitle}>
              <span className="gradient-text">Booked!</span>
            </h1>
            <p className={styles.successDesc}>
              Your appointment request has been received. Our team will call you at
              <strong> {form.phone} </strong>
              within 30 minutes to confirm.
            </p>
            <div className={styles.successSummary}>
              <div className={styles.summaryRow}><span>Service</span><strong>{form.service}</strong></div>
              <div className={styles.summaryRow}><span>Date</span><strong>{form.date}</strong></div>
              <div className={styles.summaryRow}><span>Time</span><strong>{form.time}</strong></div>
              <div className={styles.summaryRow}><span>Patient</span><strong>{form.name}</strong></div>
            </div>
            <p className={styles.reassurance}>
              <i className="ri-time-line" /> We&apos;ll call within 30 minutes to confirm.
            </p>
            <div className={styles.successActions}>
              <a
                href="https://wa.me/919999999999?text=I just booked an appointment at SAI Physiotherapy"
                target="_blank" rel="noopener noreferrer"
                className={styles.waBtn}
              >
                <i className="ri-whatsapp-line" /> Confirm on WhatsApp
              </a>
              <button onClick={() => { setSubmitted(false); setForm(EMPTY); setStep(0); }} className={styles.againBtn}>
                Book Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPct = (step / (STEPS.length - 1)) * 100;
  const fillWidth = `calc((${progressPct} / 100) * (75% - 40px))`;

  return (
    <div className={styles.page}>
      <div className={styles.heroBg}>
        <div className={styles.heroMesh} />
      </div>
      <section className={styles.hero}>
        <div className="container">
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} /> Quick & Easy Booking
          </span>
          <h1 className={styles.heroTitle}>Book Your <span className="gradient-text">Visit</span></h1>
          <p className={styles.heroDesc}>Fill in the details and our team confirms within 30 minutes — no waiting on hold.</p>
        </div>
      </section>

      <section className={styles.bodySection}>
        <div className="container">
          <div className={styles.layout}>
            <div className={styles.formArea}>
              {/* Stepper */}
              <div className={styles.stepper}>
                <div className={styles.stepperTrack} />
                <div className={styles.stepperFill} style={{ width: fillWidth }} />
                {STEPS.map((s, i) => {
                  const status = i === step ? 'active' : i < step ? 'done' : 'pending';
                  return (
                    <div key={s} className={`${styles.stepperItem} ${styles[`s_${status}`]}`}>
                      <div className={styles.stepCircle}>
                        {i < step ? <i className="ri-check-line" /> : <span>{i + 1}</span>}
                      </div>
                      <span className={styles.stepLabel}>{s}</span>
                    </div>
                  );
                })}
              </div>

              <div className={styles.stepCard}>
                {step === 0 && (
                  <div className={styles.stepContent}>
                    <h2 className={styles.stepTitle}>Select Your Treatment</h2>
                    <p className={styles.stepHelp}>Pick the area you need help with — or choose &quot;Not Sure&quot; and we&apos;ll guide you.</p>
                    <div className={styles.serviceGrid}>
                      {SERVICES.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => update('service', s.value)}
                          className={`${styles.serviceTile} ${form.service === s.value ? styles.serviceSelected : ''}`}
                        >
                          <i className={s.icon} />
                          <span>{s.value}</span>
                          {form.service === s.value && (
                            <i className={`ri-checkbox-circle-fill ${styles.serviceCheck}`} />
                          )}
                        </button>
                      ))}
                    </div>
                    {form.service === 'Other / Not Sure' && (
                      <div className={styles.otherBlock}>
                        <label className={styles.label}>Describe what&apos;s bothering you</label>
                        <textarea
                          rows={3}
                          placeholder="E.g., I have pain in my lower back after lifting..."
                          value={form.otherCondition}
                          onChange={(e) => update('otherCondition', e.target.value)}
                          className={styles.textarea}
                        />
                      </div>
                    )}
                  </div>
                )}

                {step === 1 && (
                  <div className={styles.stepContent}>
                    <h2 className={styles.stepTitle}>Choose Date &amp; Time</h2>
                    <p className={styles.stepHelp}>Available slots over the next 2 weeks.</p>

                    <p className={styles.label}>Pick a Date</p>
                    <div className={styles.dateStrip}>
                      {dates.map((d) => (
                        <button
                          key={d.iso}
                          type="button"
                          onClick={() => update('date', d.iso)}
                          className={`${styles.datePill} ${form.date === d.iso ? styles.datePillActive : ''}`}
                        >
                          <span className={styles.dpDay}>{d.day}</span>
                          <span className={styles.dpDate}>{d.date}</span>
                          <span className={styles.dpMonth}>{d.month}</span>
                        </button>
                      ))}
                    </div>

                    <p className={styles.label}>Available Time Slots</p>
                    <div className={styles.slotGrid}>
                      {TIME_SLOTS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => update('time', t)}
                          className={`${styles.slotPill} ${form.time === t ? styles.slotActive : ''}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <div className={styles.toggleRow}>
                      <span className={styles.toggleLabel}>First visit?</span>
                      <div className={styles.pillSwitch}>
                        <button
                          type="button"
                          onClick={() => update('isFirstVisit', 'yes')}
                          className={`${styles.switchOpt} ${form.isFirstVisit === 'yes' ? styles.switchOn : ''}`}
                        >Yes, first time</button>
                        <button
                          type="button"
                          onClick={() => update('isFirstVisit', 'no')}
                          className={`${styles.switchOpt} ${form.isFirstVisit === 'no' ? styles.switchOn : ''}`}
                        >Follow-up</button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className={styles.stepContent}>
                    <h2 className={styles.stepTitle}>Your Details</h2>
                    <p className={styles.stepHelp}>We&apos;ll only use this to coordinate your visit.</p>
                    <div className={styles.formGrid}>
                      <div className={styles.field}>
                        <label className={styles.label}>Full Name <span className={styles.req}>*</span></label>
                        <input
                          className={styles.input}
                          placeholder="Your full name"
                          value={form.name}
                          onChange={(e) => update('name', e.target.value)}
                          required
                        />
                        {!form.name && <p className={styles.hint}>Required for confirming your booking</p>}
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Phone Number <span className={styles.req}>*</span></label>
                        <input
                          type="tel"
                          className={styles.input}
                          placeholder="+91 XXXXX XXXXX"
                          value={form.phone}
                          onChange={(e) => update('phone', e.target.value)}
                          required
                        />
                        {form.phone && form.phone.replace(/\D/g, '').length < 10 && (
                          <p className={styles.hintErr}>Please enter a valid 10-digit phone number</p>
                        )}
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Email Address</label>
                        <input
                          type="email"
                          className={styles.input}
                          placeholder="your@email.com"
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                        />
                        <p className={styles.hint}>Optional — for emailed appointment summary</p>
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Gender</label>
                        <select
                          className={styles.input}
                          value={form.gender}
                          onChange={(e) => update('gender', e.target.value)}
                        >
                          <option value="">Select</option>
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Age</label>
                        <input
                          type="number"
                          className={styles.input}
                          placeholder="e.g. 35"
                          min="1"
                          max="120"
                          value={form.age}
                          onChange={(e) => update('age', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Additional Notes</label>
                      <textarea
                        rows={3}
                        className={styles.textarea}
                        placeholder="Symptoms, medications, or anything we should know..."
                        value={form.notes}
                        onChange={(e) => update('notes', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className={styles.stepContent}>
                    <h2 className={styles.stepTitle}>Review &amp; Confirm</h2>
                    <p className={styles.stepHelp}>Take a quick look — then confirm.</p>
                    <div className={styles.reviewCard}>
                      {[
                        { label: 'Service', value: form.service },
                        { label: 'Date', value: form.date },
                        { label: 'Time', value: form.time },
                        { label: 'Visit Type', value: form.isFirstVisit === 'yes' ? 'First Visit' : 'Follow-up' },
                        { label: 'Patient Name', value: form.name },
                        { label: 'Phone', value: form.phone },
                        form.email ? { label: 'Email', value: form.email } : null,
                        form.age ? { label: 'Age', value: form.age } : null,
                        form.gender ? { label: 'Gender', value: form.gender } : null,
                        form.notes ? { label: 'Notes', value: form.notes } : null,
                      ].filter((r): r is { label: string; value: string } => Boolean(r)).map((r) => (
                        <div key={r.label} className={styles.reviewRow}>
                          <span className={styles.reviewLabel}>{r.label}</span>
                          <span className={styles.reviewValue}>{r.value}</span>
                        </div>
                      ))}
                    </div>
                    <p className={styles.privacyNote}>
                      <i className="ri-shield-check-line" />
                      By confirming, you agree to our privacy policy. Your information is kept confidential.
                    </p>
                  </div>
                )}

                <div className={styles.navBtns}>
                  {step > 0 ? (
                    <button type="button" onClick={() => setStep(step - 1)} className={styles.prevBtn}>
                      <i className="ri-arrow-left-s-line" /> Back
                    </button>
                  ) : <span />}
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      disabled={!canNext()}
                      className={styles.nextBtn}
                    >
                      Continue <i className="ri-arrow-right-s-line" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className={styles.submitBtn}
                    >
                      {loading ? <span className={styles.spinner} /> : <><i className="ri-checkbox-circle-line" /> Confirm Appointment</>}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar summary */}
            <aside className={styles.summary}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Your Booking</h3>
                <div className={styles.summaryList}>
                  <div className={styles.summaryItem}>
                    <i className="ri-stethoscope-line" />
                    <div>
                      <p className={styles.smLabel}>Service</p>
                      <p className={styles.smVal}>{form.service || '—'}</p>
                    </div>
                  </div>
                  <div className={styles.summaryItem}>
                    <i className="ri-calendar-line" />
                    <div>
                      <p className={styles.smLabel}>Date</p>
                      <p className={styles.smVal}>{form.date || '—'}</p>
                    </div>
                  </div>
                  <div className={styles.summaryItem}>
                    <i className="ri-time-line" />
                    <div>
                      <p className={styles.smLabel}>Time</p>
                      <p className={styles.smVal}>{form.time || '—'}</p>
                    </div>
                  </div>
                  <div className={styles.summaryItem}>
                    <i className="ri-user-line" />
                    <div>
                      <p className={styles.smLabel}>Patient</p>
                      <p className={styles.smVal}>{form.name || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className={styles.summaryReassure}>
                  <i className="ri-shield-check-fill" />
                  <span>30-minute response · Free assessment available</span>
                </div>
                <div className={styles.altActions}>
                  <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className={styles.altWa}>
                    <i className="ri-whatsapp-line" /> Or chat on WhatsApp
                  </a>
                  <a href="tel:+919999999999" className={styles.altCall}>
                    <i className="ri-phone-line" /> Call +91 99999 99999
                  </a>
                </div>
                <Link href="/services" className={styles.altLink}>
                  <i className="ri-arrow-left-line" /> Back to services
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
