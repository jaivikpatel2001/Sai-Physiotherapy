'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { settingsApi, adminSettingsApi } from '@/lib/api';
import { getRole } from '@/lib/auth';
import { UserRole } from '@sai-physio/types';
import styles from '../admin.module.css';

interface SettingsForm {
  clinicName: string;
  tagline: string;
  logo?: string;
  phones: string;
  whatsapp: string;
  emails: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  googleMapsUrl?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
  hoursWeekday: string;
  hoursWeekend: string;
  metaTitle: string;
  metaDescription: string;
}

interface ClinicSettings {
  clinicName?: string;
  tagline?: string;
  logo?: string;
  contact?: {
    phones?: string[];
    whatsapp?: string;
    emails?: string[];
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    googleMapsUrl?: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
  };
  businessHours?: Array<{ day: string; openTime: string; closeTime: string; isClosed: boolean }>;
  seo?: { globalMetaTitle?: string; globalMetaDescription?: string };
}

export default function SettingsPage() {
  const role = getRole();
  const allowed = role === UserRole.SUPER_ADMIN;
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<SettingsForm>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!allowed) { setLoading(false); return; }
    (async () => {
      try {
        const res = await settingsApi.get();
        const s: ClinicSettings = res.data?.data ?? res.data ?? {};
        const weekdayHrs = s.businessHours?.find((h) => h.day === 'monday');
        const weekendHrs = s.businessHours?.find((h) => h.day === 'sunday');
        reset({
          clinicName: s.clinicName ?? '',
          tagline: s.tagline ?? '',
          logo: s.logo ?? '',
          phones: (s.contact?.phones ?? []).join(', '),
          whatsapp: s.contact?.whatsapp ?? '',
          emails: (s.contact?.emails ?? []).join(', '),
          address: s.contact?.address ?? '',
          city: s.contact?.city ?? '',
          state: s.contact?.state ?? '',
          pincode: s.contact?.pincode ?? '',
          googleMapsUrl: s.contact?.googleMapsUrl ?? '',
          facebook: s.socialMedia?.facebook ?? '',
          instagram: s.socialMedia?.instagram ?? '',
          youtube: s.socialMedia?.youtube ?? '',
          twitter: s.socialMedia?.twitter ?? '',
          linkedin: s.socialMedia?.linkedin ?? '',
          hoursWeekday: weekdayHrs ? `${weekdayHrs.openTime}-${weekdayHrs.closeTime}` : '09:00-19:00',
          hoursWeekend: weekendHrs ? (weekendHrs.isClosed ? 'closed' : `${weekendHrs.openTime}-${weekendHrs.closeTime}`) : 'closed',
          metaTitle: s.seo?.globalMetaTitle ?? '',
          metaDescription: s.seo?.globalMetaDescription ?? '',
        });
      } catch (e: unknown) {
        setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, [allowed, reset]);

  const parseHours = (raw: string): { openTime: string; closeTime: string; isClosed: boolean } => {
    if (raw.trim().toLowerCase() === 'closed') return { openTime: '', closeTime: '', isClosed: true };
    const [o, c] = raw.split('-').map((s) => s.trim());
    return { openTime: o ?? '09:00', closeTime: c ?? '19:00', isClosed: false };
  };

  const onSubmit = async (form: SettingsForm) => {
    setError('');
    setSuccess('');
    const weekday = parseHours(form.hoursWeekday);
    const weekend = parseHours(form.hoursWeekend);
    const businessHours = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((d) => ({
      day: d,
      ...(d === 'sunday' ? weekend : weekday),
    }));
    const payload = {
      clinicName: form.clinicName,
      tagline: form.tagline,
      logo: form.logo,
      contact: {
        phones: form.phones.split(',').map((s) => s.trim()).filter(Boolean),
        whatsapp: form.whatsapp,
        emails: form.emails.split(',').map((s) => s.trim()).filter(Boolean),
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        googleMapsUrl: form.googleMapsUrl,
      },
      socialMedia: {
        facebook: form.facebook,
        instagram: form.instagram,
        youtube: form.youtube,
        twitter: form.twitter,
        linkedin: form.linkedin,
      },
      businessHours,
      seo: {
        globalMetaTitle: form.metaTitle,
        globalMetaDescription: form.metaDescription,
      },
    };
    try {
      await adminSettingsApi.update(payload);
      setSuccess('Settings saved successfully');
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save');
    }
  };

  if (!allowed) {
    return (
      <div className={styles.adminCard}>
        <div className={styles.empty}>
          <i className={`ri-shield-cross-line ${styles.emptyIcon}`} style={{ fontSize: 40 }} />
          <span>Only super admins can access clinic settings.</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Clinic Settings</h1>
          <p className={styles.pageSub}>Update public-facing clinic information</p>
        </div>
      </div>

      {loading ? <div className={styles.spinner} /> : (
        <form onSubmit={handleSubmit(onSubmit)}>
          {error && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{error}</div>}
          {success && <div className={styles.successBox}><i className="ri-checkbox-circle-line" style={{ fontSize: 16 }} />{success}</div>}

          <div className={styles.adminCard} style={{ marginBottom: 'var(--space-5)' }}>
            <div className={styles.cardHeader}><div className={styles.cardTitle}>General</div></div>
            <div className={styles.cardBody}>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Clinic Name *</label>
                  <input className="form-input" {...register('clinicName', { required: true })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tagline</label>
                  <input className="form-input" {...register('tagline')} />
                </div>
                <div className="form-group full">
                  <label className="form-label">Logo URL</label>
                  <input className="form-input" {...register('logo')} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.adminCard} style={{ marginBottom: 'var(--space-5)' }}>
            <div className={styles.cardHeader}><div className={styles.cardTitle}>Contact</div></div>
            <div className={styles.cardBody}>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Phones (comma-separated)</label>
                  <input className="form-input" {...register('phones')} />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp</label>
                  <input className="form-input" {...register('whatsapp')} />
                </div>
                <div className="form-group full">
                  <label className="form-label">Emails (comma-separated)</label>
                  <input className="form-input" {...register('emails')} />
                </div>
                <div className="form-group full">
                  <label className="form-label">Address</label>
                  <textarea className="form-input" rows={2} {...register('address')} />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" {...register('city')} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" {...register('state')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input className="form-input" {...register('pincode')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Google Maps URL</label>
                  <input className="form-input" {...register('googleMapsUrl')} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.adminCard} style={{ marginBottom: 'var(--space-5)' }}>
            <div className={styles.cardHeader}><div className={styles.cardTitle}>Hours</div></div>
            <div className={styles.cardBody}>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Mon – Sat (e.g. 09:00-19:00)</label>
                  <input className="form-input" {...register('hoursWeekday')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sunday (HH:MM-HH:MM or &quot;closed&quot;)</label>
                  <input className="form-input" {...register('hoursWeekend')} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.adminCard} style={{ marginBottom: 'var(--space-5)' }}>
            <div className={styles.cardHeader}><div className={styles.cardTitle}>Social Links</div></div>
            <div className={styles.cardBody}>
              <div className={styles.formGrid}>
                <div className="form-group"><label className="form-label">Facebook</label><input className="form-input" {...register('facebook')} /></div>
                <div className="form-group"><label className="form-label">Instagram</label><input className="form-input" {...register('instagram')} /></div>
                <div className="form-group"><label className="form-label">YouTube</label><input className="form-input" {...register('youtube')} /></div>
                <div className="form-group"><label className="form-label">Twitter</label><input className="form-input" {...register('twitter')} /></div>
                <div className="form-group"><label className="form-label">LinkedIn</label><input className="form-input" {...register('linkedin')} /></div>
              </div>
            </div>
          </div>

          <div className={styles.adminCard} style={{ marginBottom: 'var(--space-5)' }}>
            <div className={styles.cardHeader}><div className={styles.cardTitle}>SEO</div></div>
            <div className={styles.cardBody}>
              <div className={styles.formGrid}>
                <div className="form-group full">
                  <label className="form-label">Global Meta Title</label>
                  <input className="form-input" {...register('metaTitle')} />
                </div>
                <div className="form-group full">
                  <label className="form-label">Global Meta Description</label>
                  <textarea className="form-input" rows={3} {...register('metaDescription')} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={isSubmitting} className={`${styles.btn} ${styles.btnPrimary}`}>
              <i className="ri-save-line" style={{ fontSize: 16 }} /> {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
