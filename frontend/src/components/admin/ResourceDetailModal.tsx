'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from './Modal';
import adminStyles from '../../app/admin/admin.module.css';
import styles from './ResourceDetailModal.module.css';

interface Envelope { success?: boolean; data?: unknown; message?: string }

interface ResourceDetailModalProps {
  open: boolean;
  onClose: () => void;
  id: string | null;
  /** Fetcher returning either the bare record or an `{ data }` envelope. */
  fetcher: (id: string) => Promise<unknown>;
  /** Optional title override; otherwise auto-derived from the data. */
  title?: string;
  /** Optional size; defaults to 'lg' for richer responses. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Optional CTA(s) shown in the footer alongside Close. */
  extraActions?: (data: Record<string, unknown>) => React.ReactNode;
}

type Json = Record<string, unknown>;

export function ResourceDetailModal({
  open,
  onClose,
  id,
  fetcher,
  title,
  size = 'lg',
  extraActions,
}: ResourceDetailModalProps) {
  const [data, setData] = useState<Json | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !id) {
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    fetcher(id)
      .then((res) => {
        if (cancelled) return;
        let unwrapped: unknown = res;
        if (res && typeof res === 'object' && 'data' in (res as object) && (res as Envelope).data !== undefined) {
          unwrapped = (res as Envelope).data;
        }
        setData(unwrapped && typeof unwrapped === 'object' ? (unwrapped as Json) : null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ?? (err as { message?: string })?.message ?? 'Failed to load details';
        setError(msg);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, id, fetcher]);

  const hero = useMemo(() => (data ? buildHero(data) : null), [data]);
  const sections = useMemo(() => (data ? buildSections(data, hero?.consumedKeys ?? new Set()) : []), [data, hero]);
  const meta = useMemo(() => (data ? buildMeta(data) : []), [data]);

  const derivedTitle = title || hero?.title || 'Details';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={derivedTitle}
      size={size}
      hideHeader={!!data}
      flushBody
      footer={
        <>
          <button type="button" onClick={onClose} className={`${adminStyles.btn} ${adminStyles.btnSecondary}`}>
            Close
          </button>
          {data && extraActions && extraActions(data)}
        </>
      }
    >
      <div className={styles.detail}>
        {loading && (
          <div className={styles.state}>
            <div className={styles.spinner} aria-hidden />
            <div className={styles.stateTitle}>Loading details…</div>
          </div>
        )}

        {!loading && error && (
          <div className={styles.state}>
            <span className={`${styles.stateIcon} ${styles.stateIconError}`} aria-hidden>
              <i className="ri-error-warning-line" />
            </span>
            <div className={styles.stateTitle}>Unable to load</div>
            <div className={styles.stateMsg}>{error}</div>
          </div>
        )}

        {!loading && !error && !data && open && id && (
          <div className={styles.state}>
            <span className={styles.stateIcon} aria-hidden>
              <i className="ri-inbox-line" />
            </span>
            <div className={styles.stateTitle}>No details found</div>
            <div className={styles.stateMsg}>The record was not returned by the API.</div>
          </div>
        )}

        {!loading && !error && data && hero && (
          <>
            {hero.bannerUrl ? (
              <div className={`${styles.hero} ${styles.heroBanner}`}>
                <div className={styles.heroBannerImageWrap}>
                  <img src={hero.bannerUrl} alt={hero.title} />
                  <div className={styles.heroBannerOverlay} aria-hidden />
                  <div className={styles.heroBannerContent}>
                    <div className={styles.heroText}>
                      {hero.eyebrow && <span className={styles.heroEyebrow}>{hero.eyebrow}</span>}
                      <h2 className={styles.heroTitle}>{hero.title}</h2>
                      {hero.subtitle && <span className={styles.heroSubtitle}>{hero.subtitle}</span>}
                    </div>
                    {hero.badges.length > 0 && (
                      <div className={styles.heroBadges}>
                        {hero.badges.map((b, i) => <StatusPill key={i} {...b} />)}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className={`${styles.heroClose} ${styles.heroBannerClose}`}
                  onClick={onClose}
                  aria-label="Close"
                >
                  <i className="ri-close-line" style={{ fontSize: 18 }} />
                </button>
              </div>
            ) : (
              <div className={`${styles.hero} ${hero.thumbnailUrl ? '' : styles.heroNoImage}`}>
                {hero.thumbnailUrl && <img src={hero.thumbnailUrl} alt={hero.title} className={styles.heroImage} />}
                <div className={styles.heroText}>
                  {hero.eyebrow && <span className={styles.heroEyebrow}>{hero.eyebrow}</span>}
                  <h2 className={styles.heroTitle}>{hero.title}</h2>
                  {hero.subtitle && <span className={styles.heroSubtitle}>{hero.subtitle}</span>}
                  {hero.badges.length > 0 && (
                    <div className={styles.heroBadges} style={{ marginTop: 6 }}>
                      {hero.badges.map((b, i) => <StatusPill key={i} {...b} />)}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.heroClose}
                  onClick={onClose}
                  aria-label="Close"
                >
                  <i className="ri-close-line" style={{ fontSize: 18 }} />
                </button>
              </div>
            )}

            {meta.length > 0 && (
              <div className={styles.metaStrip}>
                {meta.map((m) => (
                  <span key={m.label} className={styles.metaItem}>
                    <i className={m.icon} />
                    <span>{m.label}</span>
                    <strong>{m.value}</strong>
                  </span>
                ))}
              </div>
            )}

            <div className={styles.body}>
              {sections.map((sec, i) => (
                <SectionCard key={`${sec.title}-${i}`} section={sec} />
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// ─── Hero builder ───────────────────────────────────────────────────────

interface HeroData {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  badges: PillProps[];
  consumedKeys: Set<string>;
}

function buildHero(data: Json): HeroData {
  const consumed = new Set<string>();

  // Title
  const titleCandidates = ['name', 'title', 'invoiceNumber', 'appointmentId', 'patientId'];
  let title = 'Details';
  for (const k of titleCandidates) {
    const v = data[k];
    if (typeof v === 'string' && v.trim()) { title = v; consumed.add(k); break; }
  }
  // Patient personalInfo.name fallback
  if (title === 'Details') {
    const pi = data.personalInfo as { name?: string } | undefined;
    if (pi?.name) {
      title = pi.name;
      // Don't mark personalInfo as consumed — it has many other fields we want to show
    }
  }

  // Eyebrow — short category/role-like label above title
  const eyebrowCandidates = ['category', 'role', 'source', 'type', 'paymentMethod'];
  let eyebrow: string | undefined;
  for (const k of eyebrowCandidates) {
    const v = data[k];
    if (typeof v === 'string' && v.trim()) {
      eyebrow = humanize(v);
      consumed.add(k);
      break;
    }
  }

  // Subtitle — longer descriptor
  const subtitleCandidates = ['designation', 'shortDescription', 'shortBio', 'excerpt', 'email', 'slug', 'caption'];
  let subtitle: string | undefined;
  for (const k of subtitleCandidates) {
    const v = data[k];
    if (typeof v === 'string' && v.trim()) { subtitle = v; consumed.add(k); break; }
  }

  // Banner / thumbnail
  let bannerUrl: string | undefined;
  let thumbnailUrl: string | undefined;
  const featured = data.featuredImage;
  if (typeof featured === 'string' && featured) {
    bannerUrl = featured;
    consumed.add('featuredImage');
  }
  const bannerImg = data.bannerImage;
  if (!bannerUrl && typeof bannerImg === 'string' && bannerImg) {
    bannerUrl = bannerImg;
    consumed.add('bannerImage');
  }
  const photo = data.photo as { url?: string } | undefined;
  if (photo?.url) {
    thumbnailUrl = photo.url;
    consumed.add('photo');
  }
  const image = data.image as { url?: string } | undefined;
  if (image?.url) {
    if (!bannerUrl) bannerUrl = image.url;
    consumed.add('image');
  }

  // Badges
  const badges: PillProps[] = [];
  const status = data.status;
  if (typeof status === 'string') { badges.push({ label: humanize(status), tone: toneFor(status), icon: iconFor(status) }); consumed.add('status'); }
  const paymentStatus = data.paymentStatus;
  if (typeof paymentStatus === 'string') { badges.push({ label: humanize(paymentStatus), tone: toneFor(paymentStatus), icon: 'ri-bank-card-line' }); consumed.add('paymentStatus'); }
  if (typeof data.isActive === 'boolean') {
    badges.push({ label: data.isActive ? 'Active' : 'Inactive', tone: data.isActive ? 'success' : 'neutral', icon: data.isActive ? 'ri-checkbox-circle-line' : 'ri-pause-circle-line' });
    consumed.add('isActive');
  }
  if (typeof data.isPublished === 'boolean') {
    badges.push({ label: data.isPublished ? 'Published' : 'Draft', tone: data.isPublished ? 'success' : 'neutral', icon: data.isPublished ? 'ri-global-line' : 'ri-draft-line' });
    consumed.add('isPublished');
  }
  if (typeof data.isApproved === 'boolean') {
    badges.push({ label: data.isApproved ? 'Approved' : 'Pending', tone: data.isApproved ? 'success' : 'warning', icon: data.isApproved ? 'ri-shield-check-line' : 'ri-time-line' });
    consumed.add('isApproved');
  }
  if (data.isFeatured === true) {
    badges.push({ label: 'Featured', tone: 'primary', icon: 'ri-star-fill' });
    consumed.add('isFeatured');
  } else if (data.isFeatured === false) {
    consumed.add('isFeatured');
  }

  return { title, subtitle, eyebrow, thumbnailUrl, bannerUrl, badges, consumedKeys: consumed };
}

// ─── Meta strip builder (timestamps) ─────────────────────────────────────

interface MetaItem { icon: string; label: string; value: string }

const META_FIELDS: Array<{ key: string; icon: string; label: string }> = [
  { key: 'createdAt',   icon: 'ri-add-circle-line',     label: 'Created' },
  { key: 'updatedAt',   icon: 'ri-refresh-line',        label: 'Updated' },
  { key: 'publishedAt', icon: 'ri-global-line',         label: 'Published' },
  { key: 'lastLogin',   icon: 'ri-login-circle-line',   label: 'Last login' },
  { key: 'scheduledAt', icon: 'ri-calendar-event-line', label: 'Scheduled' },
];

function buildMeta(data: Json): MetaItem[] {
  return META_FIELDS
    .map(({ key, icon, label }) => {
      const v = data[key];
      if (typeof v !== 'string' || !v) return null;
      return { icon, label, value: formatDateTime(v) };
    })
    .filter((x): x is MetaItem => x !== null);
}

// ─── Sections builder ───────────────────────────────────────────────────

interface FieldRow { key: string; value: unknown }
interface Section {
  title: string;
  icon: string;
  rows: FieldRow[];
  /** When true, the body has its own padding (e.g. HTML content). */
  flush?: boolean;
  /** When set, renders the count next to the title. */
  count?: number;
  /** Render override for custom layouts (HTML content). */
  customRender?: () => React.ReactNode;
}

const HIDDEN_KEYS = new Set<string>([
  '_id', '__v', 'id',
  'password', 'refreshToken',
  'passwordResetToken', 'passwordResetExpires',
  'loginAttempts', 'lockUntil',
  'featuredStorageKey', 'featuredStorageProvider',
  'bannerStorageKey', 'bannerStorageProvider',
  'storageKey', 'storageProvider',
  // META_FIELDS already shown in meta strip
  'createdAt', 'updatedAt', 'publishedAt', 'lastLogin', 'scheduledAt',
]);

const SECTION_ICONS: Record<string, { icon: string; title?: string }> = {
  personalInfo:     { icon: 'ri-user-line',           title: 'Personal Info' },
  medicalHistory:   { icon: 'ri-stethoscope-line',    title: 'Medical History' },
  emergencyContact: { icon: 'ri-phone-line',          title: 'Emergency Contact' },
  address:          { icon: 'ri-map-pin-line',        title: 'Address' },
  availability:     { icon: 'ri-calendar-line',       title: 'Availability' },
  socials:          { icon: 'ri-share-line',          title: 'Social Links' },
  seo:              { icon: 'ri-search-eye-line',     title: 'SEO' },
  price:            { icon: 'ri-money-rupee-circle-line', title: 'Pricing' },
  items:            { icon: 'ri-list-check',          title: 'Line Items' },
  patient:          { icon: 'ri-user-heart-line',     title: 'Patient' },
  doctor:           { icon: 'ri-user-star-line',      title: 'Doctor' },
  service:          { icon: 'ri-service-line',        title: 'Service' },
  author:           { icon: 'ri-quill-pen-line',      title: 'Author' },
  assignedDoctor:   { icon: 'ri-user-star-line',      title: 'Assigned Doctor' },
  tags:             { icon: 'ri-price-tag-3-line',    title: 'Tags' },
  specialties:      { icon: 'ri-award-line',          title: 'Specialties' },
  credentials:      { icon: 'ri-verified-badge-line', title: 'Credentials' },
  qualifications:   { icon: 'ri-graduation-cap-line', title: 'Qualifications' },
  languages:        { icon: 'ri-translate-2',         title: 'Languages' },
  allergies:        { icon: 'ri-alert-line',          title: 'Allergies' },
  medications:      { icon: 'ri-capsule-line',        title: 'Medications' },
  content:          { icon: 'ri-article-line',        title: 'Content' },
  longDescription:  { icon: 'ri-file-text-line',      title: 'Description' },
  bio:              { icon: 'ri-information-line',    title: 'Biography' },
  review:           { icon: 'ri-double-quotes-l',     title: 'Review' },
  notes:            { icon: 'ri-sticky-note-line',    title: 'Notes' },
};

function buildSections(data: Json, consumed: Set<string>): Section[] {
  const sections: Section[] = [];
  const scalarRows: FieldRow[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (HIDDEN_KEYS.has(key) || consumed.has(key)) continue;
    if (isEmpty(value)) continue;

    // HTML content → its own section
    if (typeof value === 'string' && isHtml(value)) {
      const meta = SECTION_ICONS[key] ?? { icon: 'ri-article-line', title: humanize(key) };
      sections.push({
        title: meta.title!,
        icon: meta.icon,
        rows: [],
        flush: true,
        customRender: () => <div className={styles.htmlContent} dangerouslySetInnerHTML={{ __html: value }} />,
      });
      continue;
    }

    // Standalone image fields → dedicated section
    if (isImageObject(value)) {
      const meta = SECTION_ICONS[key] ?? { icon: 'ri-image-line', title: humanize(key) };
      sections.push({
        title: meta.title!,
        icon: meta.icon,
        rows: [{ key, value }],
      });
      continue;
    }

    // Array → dedicated section (unless empty)
    if (Array.isArray(value)) {
      const meta = SECTION_ICONS[key] ?? { icon: 'ri-list-unordered', title: humanize(key) };
      sections.push({
        title: meta.title!,
        icon: meta.icon,
        rows: [{ key, value }],
        count: value.length,
      });
      continue;
    }

    // Populated reference (e.g. doctor: { _id, name, ... }) → dedicated section
    if (isPopulatedRef(value)) {
      const meta = SECTION_ICONS[key] ?? { icon: 'ri-link', title: humanize(key) };
      sections.push({
        title: meta.title!,
        icon: meta.icon,
        rows: refToRows(value as Json),
      });
      continue;
    }

    // Nested object → dedicated section
    if (value !== null && typeof value === 'object') {
      const meta = SECTION_ICONS[key] ?? { icon: 'ri-folder-line', title: humanize(key) };
      const nested = value as Json;
      sections.push({
        title: meta.title!,
        icon: meta.icon,
        rows: Object.entries(nested)
          .filter(([k, v]) => !HIDDEN_KEYS.has(k) && !isEmpty(v))
          .map(([k, v]) => ({ key: k, value: v })),
      });
      continue;
    }

    // Scalar → buffer for the Overview card
    scalarRows.push({ key, value });
  }

  if (scalarRows.length > 0) {
    sections.unshift({ title: 'Overview', icon: 'ri-information-line', rows: scalarRows });
  }

  return sections;
}

function refToRows(ref: Json): FieldRow[] {
  return Object.entries(ref)
    .filter(([k, v]) => !HIDDEN_KEYS.has(k) && !isEmpty(v))
    .map(([k, v]) => ({ key: k, value: v }));
}

// ─── Section / row renderers ─────────────────────────────────────────────

function SectionCard({ section }: { section: Section }) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <span className={styles.sectionIcon}><i className={section.icon} /></span>
        <span className={styles.sectionTitle}>{section.title}</span>
        {section.count !== undefined && <span className={styles.sectionCount}>{section.count}</span>}
      </header>
      <div className={`${styles.sectionBody} ${section.flush ? styles.sectionBodyFlush : ''}`}>
        {section.customRender ? section.customRender() : <RowGrid rows={section.rows} />}
      </div>
    </section>
  );
}

function RowGrid({ rows }: { rows: FieldRow[] }) {
  if (rows.length === 0) {
    return <div className={styles.kvEmpty}>No data</div>;
  }

  // Single special-case row (image, array, long text) → full-width
  if (rows.length === 1) {
    const r = rows[0];
    if (isImageObject(r.value) || Array.isArray(r.value) || isLongText(r.value)) {
      return (
        <div className={styles.kvGrid}>
          <div className={`${styles.kvRow} ${styles.kvRowFull}`}>
            <ValueRenderer value={r.value} fieldKey={r.key} />
          </div>
        </div>
      );
    }
  }

  return (
    <div className={styles.kvGrid}>
      {rows.map((r) => {
        const full = isLongText(r.value) || Array.isArray(r.value) || isImageObject(r.value)
          || (typeof r.value === 'object' && r.value !== null && !isPopulatedRef(r.value));
        return (
          <div key={r.key} className={`${styles.kvRow} ${full ? styles.kvRowFull : ''}`}>
            <span className={styles.kvLabel}>
              <i className={iconForField(r.key)} />
              {humanize(r.key)}
            </span>
            <div className={styles.kvValue}>
              <ValueRenderer value={r.value} fieldKey={r.key} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ValueRenderer({ value, fieldKey }: { value: unknown; fieldKey: string }) {
  if (value === null || value === undefined || value === '') {
    return <span className={styles.kvEmpty}>—</span>;
  }

  // Booleans
  if (typeof value === 'boolean') {
    return <StatusPill label={value ? 'Yes' : 'No'} tone={value ? 'success' : 'neutral'} icon={value ? 'ri-check-line' : 'ri-close-line'} />;
  }

  // Numbers
  if (typeof value === 'number') {
    if (isCurrencyKey(fieldKey)) return <strong>{formatCurrency(value)}</strong>;
    return <span>{value.toLocaleString()}</span>;
  }

  // Strings
  if (typeof value === 'string') {
    if (DATE_KEYS.has(fieldKey) || ISO_RE.test(value)) {
      return <span>{formatDateTime(value)}</span>;
    }
    if (URL_RE.test(value) && IMAGE_URL_RE.test(value)) {
      return <img src={value} alt={fieldKey} className={styles.imgFrame} />;
    }
    if (URL_RE.test(value)) {
      return (
        <a className={styles.link} href={value} target="_blank" rel="noopener noreferrer">
          <i className="ri-external-link-line" />{value}
        </a>
      );
    }
    if (STATUS_KEYS.has(fieldKey)) {
      return <StatusPill label={humanize(value)} tone={toneFor(value)} icon={iconFor(value)} />;
    }
    if (value.includes('\n')) {
      return <div style={{ whiteSpace: 'pre-wrap' }}>{value}</div>;
    }
    return <span style={CAPITALIZE_KEYS.has(fieldKey) ? { textTransform: 'capitalize' } : undefined}>{value}</span>;
  }

  // Image object
  if (isImageObject(value)) {
    return <img src={value.url} alt={fieldKey} className={styles.imgFrame} />;
  }

  // Arrays
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === 'string' || typeof v === 'number')) {
      return (
        <div className={styles.chips}>
          {value.map((v, i) => <span key={i} className={styles.chip}>{String(v)}</span>)}
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {value.map((item, i) => (
          <div key={i} className={styles.nested}>
            {item && typeof item === 'object'
              ? <RowGrid rows={refToRows(item as Json)} />
              : <ValueRenderer value={item} fieldKey={`${fieldKey}-${i}`} />}
          </div>
        ))}
      </div>
    );
  }

  // Populated ref or plain object
  if (typeof value === 'object') {
    if (isPopulatedRef(value)) {
      const ref = value as { name?: string; email?: string; slug?: string };
      return <span>{ref.name ?? ref.email ?? ref.slug ?? '—'}</span>;
    }
    return (
      <div className={styles.nested}>
        <RowGrid rows={refToRows(value as Json)} />
      </div>
    );
  }

  return <span>{String(value)}</span>;
}

// ─── Status pill ─────────────────────────────────────────────────────────

type Tone = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'primary';
interface PillProps { label: string; tone: Tone; icon?: string }

function StatusPill({ label, tone, icon }: PillProps) {
  const toneClass =
    tone === 'success' ? styles.statusPillSuccess :
    tone === 'error'   ? styles.statusPillError :
    tone === 'warning' ? styles.statusPillWarning :
    tone === 'info'    ? styles.statusPillInfo :
    tone === 'primary' ? styles.statusPillPrimary :
    styles.statusPillNeutral;

  return (
    <span className={`${styles.statusPill} ${toneClass}`}>
      {icon && <i className={icon} />}
      {label}
    </span>
  );
}

// ─── Helpers / detection ────────────────────────────────────────────────

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const URL_RE = /^https?:\/\//i;
const IMAGE_URL_RE = /\.(jpe?g|png|webp|gif|avif|svg)(\?|$)/i;
const HTML_RE = /<(p|div|span|h[1-6]|ul|ol|li|strong|em|a|img|table|blockquote|br|hr)[\s>/]/i;

const DATE_KEYS = new Set<string>(['dob', 'date']);

const STATUS_KEYS = new Set<string>([
  'status', 'paymentStatus', 'role', 'source', 'category', 'gender', 'type', 'paymentMethod', 'discountType',
]);

const CAPITALIZE_KEYS = new Set<string>([
  'gender', 'role', 'category', 'source', 'type', 'paymentMethod', 'discountType', 'paymentStatus', 'status',
]);

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined || v === '') return true;
  if (Array.isArray(v) && v.length === 0) return true;
  if (typeof v === 'object' && v !== null && !Array.isArray(v) && Object.keys(v as object).length === 0) return true;
  return false;
}

function isHtml(s: string): boolean {
  return HTML_RE.test(s) && s.length > 40;
}

function isLongText(v: unknown): boolean {
  return typeof v === 'string' && (v.length > 100 || v.includes('\n'));
}

function isImageObject(v: unknown): v is { url: string; alt?: string } {
  return !!v && typeof v === 'object' && !Array.isArray(v) && typeof (v as { url?: unknown }).url === 'string';
}

function isPopulatedRef(v: unknown): boolean {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  const o = v as Json;
  return typeof o._id === 'string' && Object.keys(o).length <= 6;
}

function isCurrencyKey(k: string): boolean {
  return /amount|total|paid|due|price|fee|revenue|cash|upi|pending|subtotal|tax|discount|grand|balance/i.test(k);
}

function humanize(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bId\b/g, 'ID')
    .replace(/\bUrl\b/g, 'URL')
    .replace(/\bSeo\b/g, 'SEO');
}

function formatDateTime(v: string): string {
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    if (DATE_ONLY_RE.test(v)) return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return v;
  }
}

function formatCurrency(n: number): string {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  } catch {
    return `₹${n.toLocaleString()}`;
  }
}

function toneFor(v: string): Tone {
  const s = v.toLowerCase();
  if (['paid', 'active', 'published', 'approved', 'completed', 'confirmed', 'discharged', 'success'].includes(s)) return 'success';
  if (['cancelled', 'rejected', 'failed', 'unpaid', 'emergency', 'disabled', 'inactive'].includes(s)) return 'error';
  if (['partial', 'pending', 'draft', 'archived', 'on-hold', 'in-progress', 'in_progress', 'followup', 'follow-up'].includes(s)) return 'warning';
  if (['scheduled', 'info'].includes(s)) return 'info';
  if (['super_admin', 'admin'].includes(s)) return 'primary';
  return 'neutral';
}

function iconFor(v: string): string {
  const s = v.toLowerCase();
  if (s === 'paid' || s === 'approved' || s === 'completed') return 'ri-checkbox-circle-line';
  if (s === 'pending' || s === 'partial' || s === 'in_progress') return 'ri-time-line';
  if (s === 'cancelled' || s === 'rejected' || s === 'failed') return 'ri-close-circle-line';
  if (s === 'scheduled' || s === 'confirmed') return 'ri-calendar-event-line';
  if (s === 'published' || s === 'active') return 'ri-checkbox-circle-line';
  if (s === 'draft' || s === 'archived') return 'ri-draft-line';
  if (s === 'super_admin' || s === 'admin') return 'ri-shield-user-line';
  if (s === 'doctor') return 'ri-user-star-line';
  if (s === 'receptionist') return 'ri-customer-service-2-line';
  return 'ri-circle-line';
}

function iconForField(k: string): string {
  if (/email/i.test(k)) return 'ri-mail-line';
  if (/phone|mobile/i.test(k)) return 'ri-phone-line';
  if (/address|city|state|country|location/i.test(k)) return 'ri-map-pin-line';
  if (/name/i.test(k)) return 'ri-user-line';
  if (/role/i.test(k)) return 'ri-shield-user-line';
  if (/date|at$/i.test(k)) return 'ri-calendar-line';
  if (/url|link|website|linkedin|instagram|facebook/i.test(k)) return 'ri-link';
  if (/slug/i.test(k)) return 'ri-hashtag';
  if (/price|amount|total|paid|due|fee|revenue|tax|discount|balance|subtotal/i.test(k)) return 'ri-money-rupee-circle-line';
  if (/duration|time/i.test(k)) return 'ri-time-line';
  if (/rating|score/i.test(k)) return 'ri-star-line';
  if (/quantity|qty|count|order/i.test(k)) return 'ri-list-ordered';
  if (/description|bio|content|excerpt|notes|review|complaint/i.test(k)) return 'ri-file-text-line';
  if (/specialty|specialties|qualification|credential|tag|language/i.test(k)) return 'ri-award-line';
  if (/gender/i.test(k)) return 'ri-user-3-line';
  if (/age|year/i.test(k)) return 'ri-calendar-2-line';
  if (/active|published|featured|approved/i.test(k)) return 'ri-toggle-line';
  if (/status/i.test(k)) return 'ri-flag-line';
  if (/method/i.test(k)) return 'ri-bank-card-line';
  return 'ri-information-line';
}
