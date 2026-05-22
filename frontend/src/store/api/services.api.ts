/**
 * Service-layer functions for every backend module. Each export returns the
 * full envelope `{ success, data, pagination }` so stores can lift both the
 * data and the pagination meta without re-shaping.
 *
 * Stores import from here. Components import from store hooks only.
 */
import { apiClient, type ApiEnvelope, type PaginationMeta } from './client';

// ── Auth ──────────────────────────────────────────────────────────────────
export interface LoginPayload { email: string; password: string }
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: import('@sai-physio/types').AuthUser;
}

export const authApi = {
  login: (data: LoginPayload) =>
    apiClient.post<ApiEnvelope<LoginResponse>>('/auth/login', data).then((r) => r.data),
  register: (data: unknown) =>
    apiClient.post<ApiEnvelope<LoginResponse>>('/auth/register', data).then((r) => r.data),
  logout: () => apiClient.post<ApiEnvelope<null>>('/auth/logout').then((r) => r.data),
  me: () => apiClient.get<ApiEnvelope<import('@sai-physio/types').AuthUser>>('/auth/me').then((r) => r.data),
  forgotPassword: (email: string) =>
    apiClient.post<ApiEnvelope<null>>('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (data: { token: string; password: string }) =>
    apiClient.post<ApiEnvelope<null>>('/auth/reset-password', data).then((r) => r.data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.put<ApiEnvelope<null>>('/auth/change-password', data).then((r) => r.data),
};

// ── Generic CRUD builder ──────────────────────────────────────────────────
type Params = Record<string, unknown>;

function crud<T, Create = Partial<T>, Update = Partial<T>>(
  listPath: string,
  itemPath?: (id: string) => string,
  opts?: { listOverride?: string },
) {
  const itemPathFn = itemPath ?? ((id: string) => `${listPath}/${id}`);
  return {
    list: (params?: Params) =>
      apiClient.get<ApiEnvelope<T[]>>(opts?.listOverride ?? listPath, { params }).then((r) => r.data),
    getOne: (id: string) =>
      apiClient.get<ApiEnvelope<T>>(itemPathFn(id)).then((r) => r.data),
    create: (payload: Create) =>
      apiClient.post<ApiEnvelope<T>>(listPath, payload).then((r) => r.data),
    update: (id: string, payload: Update) =>
      apiClient.put<ApiEnvelope<T>>(itemPathFn(id), payload).then((r) => r.data),
    remove: (id: string) =>
      apiClient.delete<ApiEnvelope<unknown>>(itemPathFn(id)).then((r) => r.data),
  };
}

// ── Services (physiotherapy services) ─────────────────────────────────────
import type { IService, IBlog, ITestimonial, IPatient, IAppointment, ITreatmentSession, IBilling } from '@sai-physio/types';

export const servicesApi = {
  ...crud<IService>('/services'),
  publicGetBySlug: (slug: string) =>
    apiClient.get<ApiEnvelope<IService>>(`/services/slug/${slug}`).then((r) => r.data),
};

// ── Doctors ──────────────────────────────────────────────────────────────
export interface IDoctor {
  _id: string;
  name: string;
  slug: string;
  designation: string;
  specialties: string[];
  bio: string;
  shortBio: string;
  photo: { url: string; storageKey?: string; storageProvider?: 'r2' | 'local'; mimetype?: string };
  credentials: string[];
  qualifications: string[];
  languages: string[];
  experienceYears: number;
  registrationNumber?: string;
  consultationFee?: number;
  availability: { days: string[]; timeStart: string; timeEnd: string; sessionDurationMins: number; notes?: string };
  socials?: { linkedin?: string; instagram?: string; facebook?: string };
  order: number;
  isActive: boolean;
  seo: { metaTitle?: string; metaDescription?: string; keywords?: string[] };
  createdAt: string;
  updatedAt: string;
}

export const doctorsApi = {
  list: (params?: Params) =>
    apiClient.get<ApiEnvelope<IDoctor[]>>('/doctors/admin/list', { params }).then((r) => r.data),
  publicList: (params?: Params) =>
    apiClient.get<ApiEnvelope<IDoctor[]>>('/doctors', { params }).then((r) => r.data),
  publicGetBySlug: (slug: string) =>
    apiClient.get<ApiEnvelope<IDoctor>>(`/doctors/slug/${slug}`).then((r) => r.data),
  getOne: (id: string) => apiClient.get<ApiEnvelope<IDoctor>>(`/doctors/${id}`).then((r) => r.data),
  create: (payload: Partial<IDoctor>) =>
    apiClient.post<ApiEnvelope<IDoctor>>('/doctors', payload).then((r) => r.data),
  update: (id: string, payload: Partial<IDoctor>) =>
    apiClient.put<ApiEnvelope<IDoctor>>(`/doctors/${id}`, payload).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete<ApiEnvelope<unknown>>(`/doctors/${id}`).then((r) => r.data),
};

// ── Gallery ──────────────────────────────────────────────────────────────
export interface IGalleryItem {
  _id: string;
  title: string;
  caption?: string;
  category: 'clinic' | 'treatments' | 'events' | 'awards' | 'team';
  image: { url: string; storageKey?: string; storageProvider?: 'r2' | 'local'; mimetype?: string };
  alt: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
}

export const galleryApi = {
  list: (params?: Params) =>
    apiClient.get<ApiEnvelope<IGalleryItem[]>>('/gallery/admin/list', { params }).then((r) => r.data),
  publicList: (params?: Params) =>
    apiClient.get<ApiEnvelope<IGalleryItem[]>>('/gallery', { params }).then((r) => r.data),
  getOne: (id: string) =>
    apiClient.get<ApiEnvelope<IGalleryItem>>(`/gallery/${id}`).then((r) => r.data),
  create: (payload: Partial<IGalleryItem>) =>
    apiClient.post<ApiEnvelope<IGalleryItem>>('/gallery', payload).then((r) => r.data),
  update: (id: string, payload: Partial<IGalleryItem>) =>
    apiClient.put<ApiEnvelope<IGalleryItem>>(`/gallery/${id}`, payload).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete<ApiEnvelope<unknown>>(`/gallery/${id}`).then((r) => r.data),
};

// ── CMS Pages ────────────────────────────────────────────────────────────
export interface ICmsPage {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  showInFooter: boolean;
  footerLabel?: string;
  footerOrder: number;
  isPublished: boolean;
  publishedAt?: string;
  seo: { metaTitle?: string; metaDescription?: string; keywords?: string[] };
  updatedAt: string;
}

export const pagesApi = {
  list: (params?: Params) =>
    apiClient.get<ApiEnvelope<ICmsPage[]>>('/pages/admin/list', { params }).then((r) => r.data),
  publicList: (params?: Params) =>
    apiClient.get<ApiEnvelope<ICmsPage[]>>('/pages', { params }).then((r) => r.data),
  publicGetBySlug: (slug: string) =>
    apiClient.get<ApiEnvelope<ICmsPage>>(`/pages/slug/${slug}`).then((r) => r.data),
  getOne: (id: string) =>
    apiClient.get<ApiEnvelope<ICmsPage>>(`/pages/${id}`).then((r) => r.data),
  create: (payload: Partial<ICmsPage>) =>
    apiClient.post<ApiEnvelope<ICmsPage>>('/pages', payload).then((r) => r.data),
  update: (id: string, payload: Partial<ICmsPage>) =>
    apiClient.put<ApiEnvelope<ICmsPage>>(`/pages/${id}`, payload).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete<ApiEnvelope<unknown>>(`/pages/${id}`).then((r) => r.data),
};

// ── Blog ──────────────────────────────────────────────────────────────────
export const blogsApi = {
  list: (params?: Params) =>
    apiClient.get<ApiEnvelope<IBlog[]>>('/blog/admin', { params }).then((r) => r.data),
  publicList: (params?: Params) =>
    apiClient.get<ApiEnvelope<IBlog[]>>('/blog', { params }).then((r) => r.data),
  publicGetBySlug: (slug: string) =>
    apiClient.get<ApiEnvelope<IBlog>>(`/blog/slug/${slug}`).then((r) => r.data),
  getOne: (id: string) =>
    apiClient.get<ApiEnvelope<IBlog>>(`/blog/${id}`).then((r) => r.data),
  create: (payload: Partial<IBlog>) =>
    apiClient.post<ApiEnvelope<IBlog>>('/blog', payload).then((r) => r.data),
  update: (id: string, payload: Partial<IBlog>) =>
    apiClient.put<ApiEnvelope<IBlog>>(`/blog/${id}`, payload).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete<ApiEnvelope<unknown>>(`/blog/${id}`).then((r) => r.data),
};

// ── Testimonials ─────────────────────────────────────────────────────────
export const testimonialsApi = {
  list: (params?: Params) =>
    apiClient.get<ApiEnvelope<ITestimonial[]>>('/testimonials/admin', { params }).then((r) => r.data),
  publicList: (params?: Params) =>
    apiClient.get<ApiEnvelope<ITestimonial[]>>('/testimonials', { params }).then((r) => r.data),
  submit: (payload: Partial<ITestimonial>) =>
    apiClient.post<ApiEnvelope<ITestimonial>>('/testimonials/submit', payload).then((r) => r.data),
  create: (payload: Partial<ITestimonial>) =>
    apiClient.post<ApiEnvelope<ITestimonial>>('/testimonials/admin', payload).then((r) => r.data),
  update: (id: string, payload: Partial<ITestimonial>) =>
    apiClient.put<ApiEnvelope<ITestimonial>>(`/testimonials/${id}`, payload).then((r) => r.data),
  moderate: (id: string, payload: { isApproved: boolean; isFeatured?: boolean }) =>
    apiClient.patch<ApiEnvelope<ITestimonial>>(`/testimonials/${id}/moderate`, payload).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete<ApiEnvelope<unknown>>(`/testimonials/${id}`).then((r) => r.data),
};

// ── Users ─────────────────────────────────────────────────────────────────
import type { AuthUser } from '@sai-physio/types';

export const usersApi = {
  list: (params?: Params) =>
    apiClient.get<ApiEnvelope<AuthUser[]>>('/auth/users', { params }).then((r) => r.data),
  toggleStatus: (id: string) =>
    apiClient.patch<ApiEnvelope<AuthUser>>(`/auth/users/${id}/toggle-status`).then((r) => r.data),
};

// ── Patients ──────────────────────────────────────────────────────────────
export const patientsApi = {
  list: (params?: Params) =>
    apiClient.get<ApiEnvelope<IPatient[]>>('/patients', { params }).then((r) => r.data),
  search: (q: string) =>
    apiClient.get<ApiEnvelope<IPatient[]>>('/patients/search', { params: { q } }).then((r) => r.data),
  getOne: (id: string) =>
    apiClient.get<ApiEnvelope<IPatient>>(`/patients/${id}`).then((r) => r.data),
  getSessions: (id: string) =>
    apiClient.get<ApiEnvelope<ITreatmentSession[]>>(`/patients/${id}/sessions`).then((r) => r.data),
  getBills: (id: string) =>
    apiClient.get<ApiEnvelope<IBilling[]>>(`/patients/${id}/bills`).then((r) => r.data),
  create: (payload: Partial<IPatient>) =>
    apiClient.post<ApiEnvelope<IPatient>>('/patients', payload).then((r) => r.data),
  update: (id: string, payload: Partial<IPatient>) =>
    apiClient.put<ApiEnvelope<IPatient>>(`/patients/${id}`, payload).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete<ApiEnvelope<unknown>>(`/patients/${id}`).then((r) => r.data),
};

// ── Appointments ──────────────────────────────────────────────────────────
export const appointmentsApi = {
  list: (params?: Params) =>
    apiClient.get<ApiEnvelope<IAppointment[]>>('/appointments', { params }).then((r) => r.data),
  today: () =>
    apiClient.get<ApiEnvelope<IAppointment[]>>('/appointments/today').then((r) => r.data),
  availableSlots: (doctorId: string, date: string) =>
    apiClient.get<ApiEnvelope<string[]>>('/appointments/available-slots', { params: { doctorId, date } }).then((r) => r.data),
  getOne: (id: string) =>
    apiClient.get<ApiEnvelope<IAppointment>>(`/appointments/${id}`).then((r) => r.data),
  create: (payload: Partial<IAppointment>) =>
    apiClient.post<ApiEnvelope<IAppointment>>('/appointments', payload).then((r) => r.data),
  update: (id: string, payload: Partial<IAppointment>) =>
    apiClient.put<ApiEnvelope<IAppointment>>(`/appointments/${id}`, payload).then((r) => r.data),
  updateStatus: (id: string, status: string, cancelReason?: string) =>
    apiClient.patch<ApiEnvelope<IAppointment>>(`/appointments/${id}/status`, { status, cancelReason }).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete<ApiEnvelope<unknown>>(`/appointments/${id}`).then((r) => r.data),
};

// ── Treatment Sessions ────────────────────────────────────────────────────
export const sessionsApi = {
  byPatient: (patientId: string) =>
    apiClient.get<ApiEnvelope<ITreatmentSession[]>>(`/sessions/patient/${patientId}`).then((r) => r.data),
  recovery: (patientId: string) =>
    apiClient.get<ApiEnvelope<unknown>>(`/sessions/patient/${patientId}/recovery`).then((r) => r.data),
  getOne: (id: string) =>
    apiClient.get<ApiEnvelope<ITreatmentSession>>(`/sessions/${id}`).then((r) => r.data),
  create: (payload: Partial<ITreatmentSession>) =>
    apiClient.post<ApiEnvelope<ITreatmentSession>>('/sessions', payload).then((r) => r.data),
  update: (id: string, payload: Partial<ITreatmentSession>) =>
    apiClient.put<ApiEnvelope<ITreatmentSession>>(`/sessions/${id}`, payload).then((r) => r.data),
};

// ── Billing ──────────────────────────────────────────────────────────────
export const billingsApi = {
  list: (params?: Params) =>
    apiClient.get<ApiEnvelope<IBilling[]>>('/billing', { params }).then((r) => r.data),
  getOne: (id: string) =>
    apiClient.get<ApiEnvelope<IBilling>>(`/billing/${id}`).then((r) => r.data),
  daily: (date?: string) =>
    apiClient.get<ApiEnvelope<unknown>>('/billing/reports/daily', { params: date ? { date } : {} }).then((r) => r.data),
  monthly: (month?: string) =>
    apiClient.get<ApiEnvelope<unknown>>('/billing/reports/monthly', { params: month ? { month } : {} }).then((r) => r.data),
  outstanding: () =>
    apiClient.get<ApiEnvelope<unknown>>('/billing/reports/outstanding').then((r) => r.data),
  create: (payload: Partial<IBilling>) =>
    apiClient.post<ApiEnvelope<IBilling>>('/billing', payload).then((r) => r.data),
  update: (id: string, payload: Partial<IBilling>) =>
    apiClient.put<ApiEnvelope<IBilling>>(`/billing/${id}`, payload).then((r) => r.data),
  recordPayment: (id: string, payload: { amount: number; paymentMethod: string; reference?: string }) =>
    apiClient.patch<ApiEnvelope<IBilling>>(`/billing/${id}/payment`, payload).then((r) => r.data),
};

// ── Settings (clinic-wide) ────────────────────────────────────────────────
export const settingsApi = {
  get: () => apiClient.get<ApiEnvelope<unknown>>('/settings').then((r) => r.data),
  update: (data: unknown) => apiClient.put<ApiEnvelope<unknown>>('/settings', data).then((r) => r.data),
  updateHomepage: (data: unknown) =>
    apiClient.post<ApiEnvelope<unknown>>('/settings/homepage', data).then((r) => r.data),
};

// ── Analytics ─────────────────────────────────────────────────────────────
export const analyticsApi = {
  dashboard: () => apiClient.get<ApiEnvelope<unknown>>('/analytics/dashboard').then((r) => r.data),
  appointmentTrend: (params?: Params) =>
    apiClient.get<ApiEnvelope<unknown>>('/analytics/appointments/trend', { params }).then((r) => r.data),
  appointmentStatus: (params?: Params) =>
    apiClient.get<ApiEnvelope<unknown>>('/analytics/appointments/status', { params }).then((r) => r.data),
  upcomingAppointments: (params?: Params) =>
    apiClient.get<ApiEnvelope<unknown>>('/analytics/appointments/upcoming', { params }).then((r) => r.data),
  revenue: (params?: Params) =>
    apiClient.get<ApiEnvelope<unknown>>('/analytics/revenue', { params }).then((r) => r.data),
  recentPayments: (params?: Params) =>
    apiClient.get<ApiEnvelope<unknown>>('/analytics/payments/recent', { params }).then((r) => r.data),
  serviceBreakdown: () =>
    apiClient.get<ApiEnvelope<unknown>>('/analytics/services/breakdown').then((r) => r.data),
  doctorWorkload: () =>
    apiClient.get<ApiEnvelope<unknown>>('/analytics/doctors/workload').then((r) => r.data),
  topDoctors: (params?: Params) =>
    apiClient.get<ApiEnvelope<unknown>>('/analytics/doctors/top', { params }).then((r) => r.data),
  patientGrowth: (params?: Params) =>
    apiClient.get<ApiEnvelope<unknown>>('/analytics/patients/growth', { params }).then((r) => r.data),
  recentActivity: (params?: Params) =>
    apiClient.get<ApiEnvelope<unknown>>('/analytics/activity/recent', { params }).then((r) => r.data),
  contentSummary: () =>
    apiClient.get<ApiEnvelope<unknown>>('/analytics/content/summary').then((r) => r.data),
};

// ── Upload ───────────────────────────────────────────────────────────────
export type StorageModule = 'gallery' | 'services' | 'doctors' | 'testimonials' | 'blogs' | 'users' | 'patients' | 'pages' | 'settings';

export interface UploadedFile {
  url: string;
  key: string;
  storage: 'r2' | 'local';
  mimetype: string;
  size: number;
  originalName: string;
}

export const uploadApi = {
  status: () => apiClient.get<ApiEnvelope<unknown>>('/upload/status').then((r) => r.data),
  uploadImage: (module: StorageModule, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post<ApiEnvelope<UploadedFile>>(`/upload/image/${module}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60_000,
      })
      .then((r) => r.data);
  },
  uploadImages: (module: StorageModule, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return apiClient
      .post<ApiEnvelope<UploadedFile[]>>(`/upload/images/${module}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120_000,
      })
      .then((r) => r.data);
  },
  uploadDocument: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post<ApiEnvelope<UploadedFile>>('/upload/document', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60_000,
      })
      .then((r) => r.data);
  },
  remove: (key: string, storage: 'r2' | 'local') =>
    apiClient.delete<ApiEnvelope<unknown>>('/upload', { data: { key, storage } }).then((r) => r.data),
};

// Suppress unused-warning for the crud helper (kept exported for future modules)
void crud;
void (null as unknown as PaginationMeta);
