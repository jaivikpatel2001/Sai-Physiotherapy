/**
 * Analytics — multiple endpoints feeding the admin dashboard.
 * Each dataset has its own fetch action so widgets can refresh independently.
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { analyticsApi } from '../api/services.api';
import { pickError, type ApiErrorShape } from '../api/client';
import { REQUEST_STATUS, type RequestStatus } from '../constants/status';

interface DashboardKPIs {
  totalPatients: number;
  newPatientsThisMonth: number;
  patientGrowth: number;
  todayAppointments: number;
  weeklyAppointments: number;
  upcomingAppointments: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  pendingDues: number;
  activeDoctors: number;
  publishedBlogs: number;
  approvedTestimonials: number;
}

interface TrendPoint { date: string; count: number; completed: number; cancelled: number; scheduled: number }
interface RevenuePoint { period: string; billed: number; collected: number; outstanding: number; invoices: number }
interface ServiceSlice { name: string; value: number; category?: string }
interface TopDoctor { _id: string; name: string; avatar?: string; specialization?: string; appointments: number; completed: number; completionRate: number }
interface PatientGrowthPoint { period: string; newPatients: number; total: number }
interface UpcomingAppt {
  _id: string;
  appointmentId: string;
  scheduledAt: string;
  status: string;
  patient?: { personalInfo?: { name?: string }; patientId?: string };
  doctor?: { name?: string };
  service?: { name?: string };
}
interface PaymentRow {
  _id: string;
  invoiceNumber: string;
  amountPaid: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate?: string;
  patient?: { personalInfo?: { name?: string } };
}
interface ActivityEvent { kind: string; at: string; title: string; subtitle?: string; icon: string }
interface ContentSummary {
  recentBlogs: Array<{ _id: string; title: string; slug: string; views: number; publishedAt?: string; featuredImage?: string; excerpt?: string }>;
  latestTestimonials: Array<{ _id: string; patientName: string; condition: string; rating: number; review: string; isFeatured: boolean }>;
  mostViewedBlogs: Array<{ _id: string; title: string; slug: string; views: number; category?: string }>;
  gallerySize: number;
  serviceCount: number;
}

interface State {
  kpis: DashboardKPIs | null;
  trend: TrendPoint[];
  revenue: RevenuePoint[];
  serviceBreakdown: ServiceSlice[];
  topDoctors: TopDoctor[];
  upcoming: UpcomingAppt[];
  recentPayments: PaymentRow[];
  recentActivity: ActivityEvent[];
  content: ContentSummary | null;
  patientGrowth: PatientGrowthPoint[];
  doctorWorkload: unknown[];
  appointmentStatus: Array<{ name: string; value: number }>;
  status: RequestStatus;
  error: ApiErrorShape | null;
}

interface Actions {
  loadDashboard: () => Promise<void>;
  loadTrend: (days?: number) => Promise<void>;
  loadRevenue: (months?: number) => Promise<void>;
  loadServiceBreakdown: () => Promise<void>;
  loadTopDoctors: (days?: number) => Promise<void>;
  loadUpcoming: (limit?: number) => Promise<void>;
  loadRecentPayments: (limit?: number) => Promise<void>;
  loadRecentActivity: (limit?: number) => Promise<void>;
  loadContentSummary: () => Promise<void>;
  loadPatientGrowth: (months?: number) => Promise<void>;
  loadDoctorWorkload: () => Promise<void>;
  loadAppointmentStatus: (days?: number) => Promise<void>;
  loadEverything: () => Promise<void>;
  reset: () => void;
}

export type AnalyticsStore = State & Actions;

const initial: State = {
  kpis: null,
  trend: [],
  revenue: [],
  serviceBreakdown: [],
  topDoctors: [],
  upcoming: [],
  recentPayments: [],
  recentActivity: [],
  content: null,
  patientGrowth: [],
  doctorWorkload: [],
  appointmentStatus: [],
  status: REQUEST_STATUS.IDLE,
  error: null,
};

export const useAnalyticsStore = create<AnalyticsStore>()(
  devtools(
    (set, get) => ({
      ...initial,

      loadDashboard: async () => {
        try {
          const env = await analyticsApi.dashboard();
          const data = env.data as { kpis?: DashboardKPIs } | DashboardKPIs;
          const kpis = ((data as { kpis?: DashboardKPIs })?.kpis ?? (data as DashboardKPIs)) ?? null;
          set({ kpis });
        } catch (err) {
          set({ error: pickError(err) });
        }
      },

      loadTrend: async (days = 30) => {
        try {
          const env = await analyticsApi.appointmentTrend({ days });
          set({ trend: (env.data as TrendPoint[]) ?? [] });
        } catch (err) {
          set({ error: pickError(err) });
        }
      },

      loadRevenue: async (months = 12) => {
        try {
          const env = await analyticsApi.revenue({ months });
          set({ revenue: (env.data as RevenuePoint[]) ?? [] });
        } catch (err) {
          set({ error: pickError(err) });
        }
      },

      loadServiceBreakdown: async () => {
        try {
          const env = await analyticsApi.serviceBreakdown();
          set({ serviceBreakdown: (env.data as ServiceSlice[]) ?? [] });
        } catch (err) {
          set({ error: pickError(err) });
        }
      },

      loadTopDoctors: async (days = 30) => {
        try {
          const env = await analyticsApi.topDoctors({ days });
          set({ topDoctors: (env.data as TopDoctor[]) ?? [] });
        } catch (err) {
          set({ error: pickError(err) });
        }
      },

      loadUpcoming: async (limit = 8) => {
        try {
          const env = await analyticsApi.upcomingAppointments({ limit });
          set({ upcoming: (env.data as UpcomingAppt[]) ?? [] });
        } catch (err) {
          set({ error: pickError(err) });
        }
      },

      loadRecentPayments: async (limit = 8) => {
        try {
          const env = await analyticsApi.recentPayments({ limit });
          set({ recentPayments: (env.data as PaymentRow[]) ?? [] });
        } catch (err) {
          set({ error: pickError(err) });
        }
      },

      loadRecentActivity: async (limit = 10) => {
        try {
          const env = await analyticsApi.recentActivity({ limit });
          set({ recentActivity: (env.data as ActivityEvent[]) ?? [] });
        } catch (err) {
          set({ error: pickError(err) });
        }
      },

      loadContentSummary: async () => {
        try {
          const env = await analyticsApi.contentSummary();
          set({ content: (env.data as ContentSummary) ?? null });
        } catch (err) {
          set({ error: pickError(err) });
        }
      },

      loadPatientGrowth: async (months = 12) => {
        try {
          const env = await analyticsApi.patientGrowth({ months });
          set({ patientGrowth: (env.data as PatientGrowthPoint[]) ?? [] });
        } catch (err) {
          set({ error: pickError(err) });
        }
      },

      loadDoctorWorkload: async () => {
        try {
          const env = await analyticsApi.doctorWorkload();
          set({ doctorWorkload: (env.data as unknown[]) ?? [] });
        } catch (err) {
          set({ error: pickError(err) });
        }
      },

      loadAppointmentStatus: async (days = 30) => {
        try {
          const env = await analyticsApi.appointmentStatus({ days });
          set({ appointmentStatus: (env.data as Array<{ name: string; value: number }>) ?? [] });
        } catch (err) {
          set({ error: pickError(err) });
        }
      },

      loadEverything: async () => {
        set({ status: REQUEST_STATUS.LOADING, error: null });
        await Promise.allSettled([
          get().loadDashboard(),
          get().loadTrend(30),
          get().loadRevenue(12),
          get().loadServiceBreakdown(),
          get().loadTopDoctors(30),
          get().loadUpcoming(8),
          get().loadRecentPayments(8),
          get().loadRecentActivity(10),
          get().loadContentSummary(),
          get().loadPatientGrowth(12),
        ]);
        set({ status: REQUEST_STATUS.SUCCEEDED });
      },

      reset: () => set({ ...initial }),
    }),
    { name: 'store/analytics', enabled: process.env.NODE_ENV !== 'production' },
  ),
);
