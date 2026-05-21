import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
          const { accessToken } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return api(error.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ── Public API Helpers ────────────────────────────────────────────────────────

export const servicesApi = {
  getAll: (params?: Record<string, string>) => api.get('/services', { params }),
  getBySlug: (slug: string) => api.get(`/services/slug/${slug}`),
};

export const blogApi = {
  getPublished: (params?: Record<string, string>) => api.get('/blog', { params }),
  getBySlug: (slug: string) => api.get(`/blog/slug/${slug}`),
};

export const testimonialsApi = {
  getApproved: (params?: Record<string, string>) => api.get('/testimonials', { params }),
  submit: (data: unknown) => api.post('/testimonials/submit', data),
};

export const settingsApi = {
  get: () => api.get('/settings'),
};

export const appointmentsApi = {
  getAvailableSlots: (doctorId: string, date: string) =>
    api.get('/appointments/available-slots', { params: { doctorId, date } }),
  book: (data: unknown) => api.post('/appointments', data),
  getAll: (params?: Record<string, string | number>) => api.get('/appointments', { params }),
  getToday: () => api.get('/appointments/today'),
  getById: (id: string) => api.get(`/appointments/${id}`),
  update: (id: string, data: unknown) => api.put(`/appointments/${id}`, data),
  updateStatus: (id: string, status: string, cancelReason?: string) =>
    api.patch(`/appointments/${id}/status`, { status, cancelReason }),
};

export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: unknown) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) => api.post('/auth/reset-password', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
};

// ── Patients ──────────────────────────────────────────────────────────────────
export const patientsApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/patients', { params }),
  search: (q: string) => api.get('/patients/search', { params: { q } }),
  getById: (id: string) => api.get(`/patients/${id}`),
  getSessions: (id: string) => api.get(`/patients/${id}/sessions`),
  getBills: (id: string) => api.get(`/patients/${id}/bills`),
  create: (data: unknown) => api.post('/patients', data),
  update: (id: string, data: unknown) => api.put(`/patients/${id}`, data),
  remove: (id: string) => api.delete(`/patients/${id}`),
};

// ── Sessions ──────────────────────────────────────────────────────────────────
export const sessionsApi = {
  getByPatient: (patientId: string) => api.get(`/sessions/patient/${patientId}`),
  getRecovery: (patientId: string) => api.get(`/sessions/patient/${patientId}/recovery`),
  getById: (id: string) => api.get(`/sessions/${id}`),
  create: (data: unknown) => api.post('/sessions', data),
  update: (id: string, data: unknown) => api.put(`/sessions/${id}`, data),
};

// ── Billing ───────────────────────────────────────────────────────────────────
export const billingApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/billing', { params }),
  getById: (id: string) => api.get(`/billing/${id}`),
  daily: (date?: string) => api.get('/billing/reports/daily', { params: date ? { date } : {} }),
  monthly: (month?: string) => api.get('/billing/reports/monthly', { params: month ? { month } : {} }),
  outstanding: () => api.get('/billing/reports/outstanding'),
  create: (data: unknown) => api.post('/billing', data),
  update: (id: string, data: unknown) => api.put(`/billing/${id}`, data),
  recordPayment: (id: string, data: { amount: number; paymentMethod: string; reference?: string }) =>
    api.patch(`/billing/${id}/payment`, data),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getAppointmentTrend: (params?: Record<string, string | number>) =>
    api.get('/analytics/appointments/trend', { params }),
  getAppointmentStatus: (params?: Record<string, string | number>) =>
    api.get('/analytics/appointments/status', { params }),
  getUpcomingAppointments: (params?: Record<string, string | number>) =>
    api.get('/analytics/appointments/upcoming', { params }),
  getRevenue: (params?: Record<string, string | number>) => api.get('/analytics/revenue', { params }),
  getRecentPayments: (params?: Record<string, string | number>) =>
    api.get('/analytics/payments/recent', { params }),
  getServiceBreakdown: () => api.get('/analytics/services/breakdown'),
  getDoctorWorkload: () => api.get('/analytics/doctors/workload'),
  getTopDoctors: (params?: Record<string, string | number>) =>
    api.get('/analytics/doctors/top', { params }),
  getPatientGrowth: (params?: Record<string, string | number>) =>
    api.get('/analytics/patients/growth', { params }),
  getRecentActivity: (params?: Record<string, string | number>) =>
    api.get('/analytics/activity/recent', { params }),
  getContentSummary: () => api.get('/analytics/content/summary'),
};

// ── Admin: Blog ───────────────────────────────────────────────────────────────
export const adminBlogApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/blog/admin', { params }),
  getById: (id: string) => api.get(`/blog/${id}`),
  create: (data: unknown) => api.post('/blog', data),
  update: (id: string, data: unknown) => api.put(`/blog/${id}`, data),
  remove: (id: string) => api.delete(`/blog/${id}`),
};

// ── Admin: Testimonials ───────────────────────────────────────────────────────
export const adminTestimonialsApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/testimonials/admin', { params }),
  create: (data: unknown) => api.post('/testimonials/admin', data),
  update: (id: string, data: unknown) => api.put(`/testimonials/${id}`, data),
  moderate: (id: string, data: { isApproved: boolean; isFeatured?: boolean }) =>
    api.patch(`/testimonials/${id}/moderate`, data),
  remove: (id: string) => api.delete(`/testimonials/${id}`),
};

// ── Admin: Services ───────────────────────────────────────────────────────────
export const adminServicesApi = {
  getById: (id: string) => api.get(`/services/${id}`),
  create: (data: unknown) => api.post('/services', data),
  update: (id: string, data: unknown) => api.put(`/services/${id}`, data),
  remove: (id: string) => api.delete(`/services/${id}`),
};

// ── Admin: Settings ───────────────────────────────────────────────────────────
export const adminSettingsApi = {
  update: (data: unknown) => api.put('/settings', data),
  updateHomepage: (data: unknown) => api.post('/settings/homepage', data),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/auth/users', { params }),
  toggleStatus: (id: string) => api.patch(`/auth/users/${id}/toggle-status`),
};

// ── Gallery (public + admin) ─────────────────────────────────────────────────
export const galleryApi = {
  getPublished: (params?: Record<string, string | number>) => api.get('/gallery', { params }),
};
export const adminGalleryApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/gallery/admin/list', { params }),
  getById: (id: string) => api.get(`/gallery/${id}`),
  create: (data: unknown) => api.post('/gallery', data),
  update: (id: string, data: unknown) => api.put(`/gallery/${id}`, data),
  remove: (id: string) => api.delete(`/gallery/${id}`),
};

// ── Doctors (public + admin) ─────────────────────────────────────────────────
export const doctorsApi = {
  getPublished: (params?: Record<string, string | number>) => api.get('/doctors', { params }),
  getBySlug: (slug: string) => api.get(`/doctors/slug/${slug}`),
};
export const adminDoctorsApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/doctors/admin/list', { params }),
  getById: (id: string) => api.get(`/doctors/${id}`),
  create: (data: unknown) => api.post('/doctors', data),
  update: (id: string, data: unknown) => api.put(`/doctors/${id}`, data),
  remove: (id: string) => api.delete(`/doctors/${id}`),
};

// ── CMS Pages (public + admin) ───────────────────────────────────────────────
export const pagesApi = {
  getPublished: (params?: Record<string, string | number>) => api.get('/pages', { params }),
  getBySlug: (slug: string) => api.get(`/pages/slug/${slug}`),
};
export const adminPagesApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/pages/admin/list', { params }),
  getById: (id: string) => api.get(`/pages/${id}`),
  create: (data: unknown) => api.post('/pages', data),
  update: (id: string, data: unknown) => api.put(`/pages/${id}`, data),
  remove: (id: string) => api.delete(`/pages/${id}`),
};

// ── Uploads (multipart) ───────────────────────────────────────────────────────
export type StorageModule =
  | 'gallery'
  | 'services'
  | 'doctors'
  | 'testimonials'
  | 'blogs'
  | 'users'
  | 'patients'
  | 'pages'
  | 'settings';

export interface UploadedFile {
  url: string;
  key: string;
  storage: 'r2' | 'local';
  mimetype: string;
  size: number;
  originalName: string;
}

export const uploadApi = {
  status: () => api.get('/upload/status'),
  uploadImage: (module: StorageModule, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/upload/image/${module}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
  uploadImages: (module: StorageModule, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return api.post(`/upload/images/${module}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },
  uploadDocument: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload/document', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
  remove: (key: string, storage: 'r2' | 'local') =>
    api.delete('/upload', { data: { key, storage } }),
};
