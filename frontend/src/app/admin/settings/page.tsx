'use client';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSettingsStore } from '@/store';
import { getRole } from '@/lib/auth';
import { UserRole } from '@sai-physio/types';
import { FileUpload } from '@/components/admin';
import type { UploadedFile } from '@/store';
import styles from '../admin.module.css';
import settingsStyles from './settings.module.css';

interface BusinessHoursEntry {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface SettingsForm {
  clinicName: string;
  tagline: string;
  logo: UploadedFile | null;
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
  businessHours: BusinessHoursEntry[];
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

const DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
] as const;

const DEFAULT_HOURS: BusinessHoursEntry[] = DAYS.map(({ key }) => ({
  day: key,
  openTime: key === 'sunday' ? '' : key === 'saturday' ? '09:00' : '09:00',
  closeTime: key === 'sunday' ? '' : key === 'saturday' ? '14:00' : '19:00',
  isClosed: key === 'sunday',
}));

const urlToUploadedFile = (url: string | undefined): UploadedFile | null => {
  if (!url) return null;
  return {
    url,
    key: '',
    storage: 'r2' as const,
    mimetype: 'image/*',
    size: 0,
    originalName: url.split('/').pop() || 'logo',
  };
};

const buildBusinessHours = (existing?: ClinicSettings['businessHours']): BusinessHoursEntry[] => {
  return DAYS.map(({ key }) => {
    const match = existing?.find((h) => h.day?.toLowerCase() === key);
    if (!match) {
      return DEFAULT_HOURS.find((d) => d.day === key)!;
    }
    return {
      day: key,
      openTime: match.openTime || '09:00',
      closeTime: match.closeTime || '19:00',
      isClosed: !!match.isClosed,
    };
  });
};

export default function SettingsPage() {
  const role = getRole();
  const allowed = role === UserRole.SUPER_ADMIN;
  const { register, handleSubmit, reset, control, watch, setValue, formState: { isSubmitting } } = useForm<SettingsForm>({
    defaultValues: { businessHours: DEFAULT_HOURS, logo: null },
  });
  const data = useSettingsStore((s) => s.data) as ClinicSettings | null;
  const storeLoading = useSettingsStore((s) => s.status === 'loading');
  const fetchSettings = useSettingsStore((s) => s.fetch);
  const updateSettings = useSettingsStore((s) => s.update);
  const [hydrated, setHydrated] = useState(false);
  const loading = allowed ? (!hydrated && storeLoading) : false;
  const businessHours = watch('businessHours');

  useEffect(() => {
    if (!allowed) return;
    void fetchSettings();
  }, [allowed, fetchSettings]);

  useEffect(() => {
    if (!allowed || !data || hydrated) return;
    const s = data;
    reset({
      clinicName: s.clinicName ?? '',
      tagline: s.tagline ?? '',
      logo: urlToUploadedFile(s.logo),
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
      businessHours: buildBusinessHours(s.businessHours),
      metaTitle: s.seo?.globalMetaTitle ?? '',
      metaDescription: s.seo?.globalMetaDescription ?? '',
    });
    setHydrated(true);
  }, [allowed, data, hydrated, reset]);

  const onSubmit = async (form: SettingsForm) => {
    const normalisedHours: BusinessHoursEntry[] = form.businessHours.map((h) => ({
      day: h.day,
      openTime: h.isClosed ? '' : (h.openTime || '09:00'),
      closeTime: h.isClosed ? '' : (h.closeTime || '19:00'),
      isClosed: !!h.isClosed,
    }));

    const payload = {
      clinicName: form.clinicName,
      tagline: form.tagline,
      logo: form.logo?.url ?? '',
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
      businessHours: normalisedHours,
      seo: {
        globalMetaTitle: form.metaTitle,
        globalMetaDescription: form.metaDescription,
      },
    };
    // Backend's "Settings updated successfully" surfaces via the global axios toast.
    await updateSettings(payload);
  };

  const applyToAllWeekdays = (idx: number) => {
    const source = businessHours[idx];
    if (!source) return;
    const next = businessHours.map((h, i) => {
      if (i === idx) return h;
      if (h.day === 'sunday') return h;
      return { ...h, openTime: source.openTime, closeTime: source.closeTime, isClosed: source.isClosed };
    });
    setValue('businessHours', next, { shouldDirty: true });
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
                  <Controller
                    control={control}
                    name="logo"
                    render={({ field }) => (
                      <FileUpload
                        module="settings"
                        value={field.value}
                        onChange={field.onChange}
                        label="Clinic Logo"
                        hint="PNG, JPG, WebP, SVG up to 5MB · transparent background recommended"
                        accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
                      />
                    )}
                  />
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
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Business Hours</div>
              <span className={settingsStyles.cardHint}>Set opening &amp; closing times per day, or mark a day as closed.</span>
            </div>
            <div className={styles.cardBody}>
              <div className={settingsStyles.hoursList}>
                {DAYS.map(({ key, label, short }, idx) => (
                  <Controller
                    key={key}
                    control={control}
                    name={`businessHours.${idx}` as const}
                    render={({ field }) => (
                      <HoursRow
                        label={label}
                        short={short}
                        value={field.value}
                        onChange={field.onChange}
                        onCopyToWeekdays={key !== 'sunday' ? () => applyToAllWeekdays(idx) : undefined}
                      />
                    )}
                  />
                ))}
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

// ── Hours editor ──────────────────────────────────────────────────────────

interface HoursRowProps {
  label: string;
  short: string;
  value: BusinessHoursEntry;
  onChange: (next: BusinessHoursEntry) => void;
  onCopyToWeekdays?: () => void;
}

function HoursRow({ label, short, value, onChange, onCopyToWeekdays }: HoursRowProps) {
  const toggleClosed = (checked: boolean) => {
    onChange({
      ...value,
      isClosed: checked,
      openTime: checked ? '' : (value.openTime || '09:00'),
      closeTime: checked ? '' : (value.closeTime || '19:00'),
    });
  };

  return (
    <div className={`${settingsStyles.hoursRow} ${value.isClosed ? settingsStyles.hoursRowClosed : ''}`}>
      <div className={settingsStyles.hoursDay}>
        <span className={settingsStyles.hoursDayLabel}>{label}</span>
        <span className={settingsStyles.hoursDayShort}>{short}</span>
      </div>

      <div className={settingsStyles.hoursTimes}>
        <TimeField
          label="Opens"
          value={value.openTime}
          onChange={(t) => onChange({ ...value, openTime: t })}
          disabled={value.isClosed}
        />
        <span className={settingsStyles.hoursDash}>—</span>
        <TimeField
          label="Closes"
          value={value.closeTime}
          onChange={(t) => onChange({ ...value, closeTime: t })}
          disabled={value.isClosed}
        />
      </div>

      <div className={settingsStyles.hoursActions}>
        <label className={settingsStyles.hoursToggle} title="Mark this day closed">
          <input
            type="checkbox"
            checked={value.isClosed}
            onChange={(e) => toggleClosed(e.target.checked)}
          />
          <span>Closed</span>
        </label>
        {onCopyToWeekdays && (
          <button
            type="button"
            className={settingsStyles.hoursCopy}
            onClick={onCopyToWeekdays}
            title="Apply these hours to all other days except Sunday"
            disabled={value.isClosed}
          >
            <i className="ri-file-copy-line" /> Copy to weekdays
          </button>
        )}
      </div>
    </div>
  );
}

// 12-hour AM/PM time field that stores HH:MM in 24h format ────────────────
interface TimeFieldProps {
  label: string;
  value: string; // "HH:MM" 24h
  onChange: (v: string) => void;
  disabled?: boolean;
}

function parse24(value: string): { hour12: string; minute: string; period: 'AM' | 'PM' } {
  const m = /^(\d{1,2}):(\d{2})$/.exec((value || '').trim());
  if (!m) return { hour12: '09', minute: '00', period: 'AM' };
  const h24 = Math.max(0, Math.min(23, parseInt(m[1], 10)));
  const minute = m[2];
  const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  const hour12 = (h24 % 12 || 12).toString().padStart(2, '0');
  return { hour12, minute, period };
}

function to24(hour12: string, minute: string, period: 'AM' | 'PM'): string {
  let h = parseInt(hour12, 10);
  if (Number.isNaN(h)) h = 12;
  if (period === 'AM') h = h === 12 ? 0 : h;
  else h = h === 12 ? 12 : h + 12;
  return `${h.toString().padStart(2, '0')}:${minute}`;
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const MINUTES_15 = ['00', '15', '30', '45'];

function TimeField({ label, value, onChange, disabled }: TimeFieldProps) {
  const { hour12, minute, period } = parse24(value);

  const emit = (next: { hour12?: string; minute?: string; period?: 'AM' | 'PM' }) => {
    onChange(
      to24(
        next.hour12 ?? hour12,
        next.minute ?? minute,
        next.period ?? period,
      ),
    );
  };

  return (
    <label className={settingsStyles.timeField} aria-label={label}>
      <span className={settingsStyles.timeFieldLabel}>{label}</span>
      <div className={settingsStyles.timeFieldControls}>
        <select
          className={settingsStyles.timeSelect}
          value={hour12}
          disabled={disabled}
          onChange={(e) => emit({ hour12: e.target.value })}
          aria-label={`${label} hour`}
        >
          {HOURS_12.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
        <span className={settingsStyles.timeColon}>:</span>
        <select
          className={settingsStyles.timeSelect}
          value={minute}
          disabled={disabled}
          onChange={(e) => emit({ minute: e.target.value })}
          aria-label={`${label} minute`}
        >
          {MINUTES_15.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <div className={settingsStyles.periodToggle} role="group" aria-label={`${label} period`}>
          {(['AM', 'PM'] as const).map((p) => (
            <button
              key={p}
              type="button"
              className={`${settingsStyles.periodBtn} ${period === p ? settingsStyles.periodBtnActive : ''}`}
              onClick={() => emit({ period: p })}
              disabled={disabled}
              aria-pressed={period === p}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </label>
  );
}
