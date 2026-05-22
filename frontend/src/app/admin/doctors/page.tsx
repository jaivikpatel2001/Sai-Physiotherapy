'use client';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Image from 'next/image';
import { useDoctorsStore, type UploadedFile } from '@/store';
import {
  PageHeader,
  AddButton,
  ActionMenu,
  Modal,
  ConfirmDialog,
  FileUpload,
  AsyncBoundary,
  StatusBadge,
  DataTable,
  type Column,
  TagInput,
} from '@/components/admin';
import adminStyles from '../admin.module.css';

type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

interface Doctor {
  _id: string;
  name: string;
  slug: string;
  designation: string;
  specialties: string[];
  bio: string;
  shortBio: string;
  photo: { url: string; storageKey: string; storageProvider: 'r2' | 'local' };
  credentials: string[];
  qualifications: string[];
  languages: string[];
  experienceYears: number;
  registrationNumber?: string;
  consultationFee?: number;
  availability: {
    days: Day[];
    timeStart: string;
    timeEnd: string;
    sessionDurationMins: number;
    notes?: string;
  };
  order: number;
  isActive: boolean;
  socials?: { linkedin?: string; instagram?: string; facebook?: string };
  seo: { metaTitle?: string; metaDescription?: string; keywords?: string[] };
  createdAt: string;
}

interface DoctorForm {
  name: string;
  slug: string;
  designation: string;
  specialties: string[];
  shortBio: string;
  bio: string;
  qualifications: string[];
  credentials: string[];
  languages: string[];
  experienceYears: number;
  registrationNumber?: string;
  consultationFee?: number;
  availabilityDays: Day[];
  timeStart: string;
  timeEnd: string;
  sessionDurationMins: number;
  notes?: string;
  order: number;
  isActive: boolean;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  photo: UploadedFile | null;
}

const DAYS: Array<{ value: Day; label: string }> = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const defaultForm: DoctorForm = {
  name: '',
  slug: '',
  designation: '',
  specialties: [],
  shortBio: '',
  bio: '',
  qualifications: [],
  credentials: [],
  languages: ['English', 'Hindi', 'Gujarati'],
  experienceYears: 0,
  registrationNumber: '',
  consultationFee: undefined,
  availabilityDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
  timeStart: '09:00',
  timeEnd: '20:00',
  sessionDurationMins: 30,
  notes: '',
  order: 0,
  isActive: true,
  linkedin: '',
  instagram: '',
  facebook: '',
  metaTitle: '',
  metaDescription: '',
  keywords: [],
  photo: null,
};

export default function DoctorsAdminPage() {
  const doctors = useDoctorsStore((s) => s.items) as unknown as Doctor[];
  const loading = useDoctorsStore((s) => s.status === 'loading');
  const error = useDoctorsStore((s) => s.error?.message ?? '');
  const fetchList = useDoctorsStore((s) => s.fetchList);
  const removeDoctor = useDoctorsStore((s) => s.remove);

  const [editing, setEditing] = useState<Doctor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const handleDelete = async () => {
    if (!deletingId) return;
    await removeDoctor(deletingId);
    setDeletingId(null);
  };

  const columns: Column<Doctor>[] = [
    {
      key: 'name',
      header: 'Doctor',
      render: (d) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: 'var(--color-surface)' }}>
            {d.photo?.url && (
              <Image src={d.photo.url} alt={d.name} fill sizes="44px" style={{ objectFit: 'cover' }} />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{d.name}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {d.designation}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'specialties',
      header: 'Specialty',
      render: (d) => (
        <span style={{ fontSize: 'var(--text-sm)' }}>{(d.specialties ?? []).slice(0, 2).join(', ') || '—'}</span>
      ),
    },
    {
      key: 'exp',
      header: 'Experience',
      render: (d) => <span>{d.experienceYears} yrs</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => (
        <StatusBadge label={d.isActive ? 'Active' : 'Hidden'} tone={d.isActive ? 'success' : 'neutral'} />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Doctors"
        subtitle="Manage doctor profiles shown on the public website."
        actions={<AddButton label="Add Doctor" onClick={() => { setEditing(null); setShowModal(true); }} />}
      />

      <div className={adminStyles.adminCard}>
        <AsyncBoundary
          loading={loading}
          error={error || null}
          empty={doctors.length === 0}
          emptyTitle="No doctors yet"
          emptyDescription="Add your first doctor profile to display on the website."
          emptyIcon="ri-user-heart-line"
          emptyAction={<AddButton label="Add Doctor" onClick={() => { setEditing(null); setShowModal(true); }} />}
        >
          <DataTable
            rows={doctors}
            columns={columns}
            rowKey={(d) => d._id}
            renderActions={(d) => (
              <ActionMenu
                onView={() => window.open(`/doctors`, '_blank')}
                onEdit={() => { setEditing(d); setShowModal(true); }}
                onDelete={() => setDeletingId(d._id)}
              />
            )}
          />
        </AsyncBoundary>
      </div>

      <DoctorFormModal
        open={showModal}
        doctor={editing}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); void fetchList(undefined, { force: true }); }}
      />

      <ConfirmDialog
        open={!!deletingId}
        title="Delete this doctor?"
        message="The profile will be removed from the public website permanently."
        confirmLabel="Delete doctor"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </>
  );
}

function DoctorFormModal({
  open,
  doctor,
  onClose,
  onSaved,
}: {
  open: boolean;
  doctor: Doctor | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!doctor;
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DoctorForm>({ defaultValues: defaultForm });
  const [err, setErr] = useState('');
  const nameVal = watch('name');
  const slugVal = watch('slug');
  const createDoctor = useDoctorsStore((s) => s.create);
  const updateDoctor = useDoctorsStore((s) => s.update);

  useEffect(() => {
    if (!open) return;
    if (doctor) {
      reset({
        name: doctor.name,
        slug: doctor.slug,
        designation: doctor.designation,
        specialties: doctor.specialties ?? [],
        shortBio: doctor.shortBio,
        bio: doctor.bio,
        qualifications: doctor.qualifications ?? [],
        credentials: doctor.credentials ?? [],
        languages: doctor.languages ?? [],
        experienceYears: doctor.experienceYears ?? 0,
        registrationNumber: doctor.registrationNumber ?? '',
        consultationFee: doctor.consultationFee,
        availabilityDays: doctor.availability?.days ?? [],
        timeStart: doctor.availability?.timeStart ?? '09:00',
        timeEnd: doctor.availability?.timeEnd ?? '20:00',
        sessionDurationMins: doctor.availability?.sessionDurationMins ?? 30,
        notes: doctor.availability?.notes ?? '',
        order: doctor.order ?? 0,
        isActive: doctor.isActive ?? true,
        linkedin: doctor.socials?.linkedin ?? '',
        instagram: doctor.socials?.instagram ?? '',
        facebook: doctor.socials?.facebook ?? '',
        metaTitle: doctor.seo?.metaTitle ?? '',
        metaDescription: doctor.seo?.metaDescription ?? '',
        keywords: doctor.seo?.keywords ?? [],
        photo: {
          url: doctor.photo.url,
          key: doctor.photo.storageKey,
          storage: doctor.photo.storageProvider,
          mimetype: 'image/jpeg',
          size: 0,
          originalName: doctor.name,
        },
      });
    } else {
      reset(defaultForm);
    }
    setErr('');
  }, [open, doctor, reset]);

  // Auto-generate slug from name on create
  useEffect(() => {
    if (!isEdit && nameVal && !slugVal) {
      setValue('slug', slugify(nameVal));
    }
  }, [nameVal, slugVal, isEdit, setValue]);

  const onSubmit = async (form: DoctorForm) => {
    setErr('');
    if (!form.photo) {
      setErr('Please upload a photo before saving.');
      return;
    }
    const payload = {
      name: form.name,
      slug: form.slug,
      designation: form.designation,
      specialties: form.specialties,
      shortBio: form.shortBio,
      bio: form.bio,
      qualifications: form.qualifications,
      credentials: form.credentials,
      languages: form.languages,
      experienceYears: Number(form.experienceYears) || 0,
      registrationNumber: form.registrationNumber || undefined,
      consultationFee: form.consultationFee ? Number(form.consultationFee) : undefined,
      availability: {
        days: form.availabilityDays,
        timeStart: form.timeStart,
        timeEnd: form.timeEnd,
        sessionDurationMins: Number(form.sessionDurationMins) || 30,
        notes: form.notes || undefined,
      },
      order: Number(form.order) || 0,
      isActive: form.isActive,
      socials: {
        linkedin: form.linkedin || undefined,
        instagram: form.instagram || undefined,
        facebook: form.facebook || undefined,
      },
      seo: {
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        keywords: form.keywords,
      },
      photo: {
        url: form.photo.url,
        storageKey: form.photo.key,
        storageProvider: form.photo.storage,
        mimetype: form.photo.mimetype,
      },
    };
    const result = isEdit && doctor
      ? await updateDoctor(doctor._id, payload as never)
      : await createDoctor(payload as never);
    if (result) onSaved();
    else setErr('Failed to save');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Doctor' : 'Add Doctor'}
      size="xl"
      footer={
        <>
          <button type="button" onClick={onClose} className={`${adminStyles.btn} ${adminStyles.btnSecondary}`}>
            Cancel
          </button>
          <button
            type="submit"
            form="doctor-form"
            disabled={isSubmitting}
            className={`${adminStyles.btn} ${adminStyles.btnPrimary}`}
          >
            {isSubmitting ? 'Saving…' : isEdit ? 'Update Doctor' : 'Create Doctor'}
          </button>
        </>
      }
    >
      <form id="doctor-form" onSubmit={handleSubmit(onSubmit)}>
        {err && (
          <div className={adminStyles.errorBox}>
            <i className="ri-error-warning-line" /> {err}
          </div>
        )}

        <Controller
          control={control}
          name="photo"
          render={({ field }) => (
            <FileUpload
              module="doctors"
              value={field.value}
              onChange={field.onChange}
              label="Profile photo"
              hint="Square 800×800 recommended. PNG/JPG/WebP up to 5MB."
              required
            />
          )}
        />

        <div className={adminStyles.formGrid} style={{ marginTop: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-input" {...register('name', { required: true })} />
            {errors.name && <div className="form-error">Required</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Slug *</label>
            <input className="form-input" placeholder="dr-jane-doe" {...register('slug', { required: true })} />
          </div>
          <div className="form-group full">
            <label className="form-label">Designation *</label>
            <input
              className="form-input"
              placeholder="Senior Physiotherapist · MPT (Sports)"
              {...register('designation', { required: true })}
            />
          </div>

          <div className="form-group full">
            <label className="form-label">Specialties</label>
            <Controller
              control={control}
              name="specialties"
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} placeholder="e.g. Spine Rehab" />}
            />
          </div>

          <div className="form-group full">
            <label className="form-label">Short bio *</label>
            <textarea
              rows={2}
              className="form-input"
              placeholder="One-line summary shown on the public listing."
              {...register('shortBio', { required: true, maxLength: 320 })}
            />
          </div>

          <div className="form-group full">
            <label className="form-label">Full bio *</label>
            <textarea
              rows={6}
              className="form-input"
              placeholder="Multi-paragraph bio shown on the doctor detail page."
              {...register('bio', { required: true })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Experience (yrs)</label>
            <input type="number" min={0} className="form-input" {...register('experienceYears', { valueAsNumber: true })} />
          </div>
          <div className="form-group">
            <label className="form-label">Registration No.</label>
            <input className="form-input" {...register('registrationNumber')} />
          </div>
          <div className="form-group">
            <label className="form-label">Consultation fee (₹)</label>
            <input type="number" min={0} className="form-input" {...register('consultationFee', { valueAsNumber: true })} />
          </div>
          <div className="form-group">
            <label className="form-label">Display order</label>
            <input type="number" className="form-input" {...register('order', { valueAsNumber: true })} />
          </div>

          <div className="form-group full">
            <label className="form-label">Qualifications</label>
            <Controller
              control={control}
              name="qualifications"
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} placeholder="MPT, BPT, …" />}
            />
          </div>

          <div className="form-group full">
            <label className="form-label">Credentials / awards</label>
            <Controller
              control={control}
              name="credentials"
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
            />
          </div>

          <div className="form-group full">
            <label className="form-label">Languages</label>
            <Controller
              control={control}
              name="languages"
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
            />
          </div>
        </div>

        <div className="form-group full" style={{ marginTop: 'var(--space-5)' }}>
          <div className="form-label">Availability</div>
          <Controller
            control={control}
            name="availabilityDays"
            render={({ field }) => (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {DAYS.map((d) => {
                  const checked = field.value.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => {
                        if (checked) field.onChange(field.value.filter((x) => x !== d.value));
                        else field.onChange([...field.value, d.value]);
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        background: checked ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: checked ? 'white' : 'var(--color-text-muted)',
                      }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>

        <div className={adminStyles.formGrid}>
          <div className="form-group">
            <label className="form-label">Start time</label>
            <input type="time" className="form-input" {...register('timeStart')} />
          </div>
          <div className="form-group">
            <label className="form-label">End time</label>
            <input type="time" className="form-input" {...register('timeEnd')} />
          </div>
          <div className="form-group">
            <label className="form-label">Session duration (min)</label>
            <input type="number" className="form-input" {...register('sessionDurationMins', { valueAsNumber: true })} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, paddingTop: 8 }}>
              <input type="checkbox" {...register('isActive')} />
              <span>Show on public website</span>
            </label>
          </div>
          <div className="form-group full">
            <label className="form-label">Availability notes</label>
            <input className="form-input" placeholder="e.g. Closed on public holidays" {...register('notes')} />
          </div>

          <div className="form-group">
            <label className="form-label">LinkedIn</label>
            <input className="form-input" {...register('linkedin')} />
          </div>
          <div className="form-group">
            <label className="form-label">Instagram</label>
            <input className="form-input" {...register('instagram')} />
          </div>
          <div className="form-group">
            <label className="form-label">Facebook</label>
            <input className="form-input" {...register('facebook')} />
          </div>

          <div className="form-group full">
            <label className="form-label">SEO meta title</label>
            <input className="form-input" {...register('metaTitle')} />
          </div>
          <div className="form-group full">
            <label className="form-label">SEO meta description</label>
            <textarea rows={2} className="form-input" {...register('metaDescription')} />
          </div>
          <div className="form-group full">
            <label className="form-label">SEO keywords</label>
            <Controller
              control={control}
              name="keywords"
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
