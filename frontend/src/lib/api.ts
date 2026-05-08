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
  getAppointmentTrend: (params?: Record<string, string>) =>
    api.get('/analytics/appointments/trend', { params }),
  getRevenue: (params?: Record<string, string>) => api.get('/analytics/revenue', { params }),
  getServiceBreakdown: () => api.get('/analytics/services/breakdown'),
  getDoctorWorkload: () => api.get('/analytics/doctors/workload'),
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
