/**
 * Appointments — admin CRUD + today's list + slot availability + status patch.
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { IAppointment } from '@sai-physio/types';
import { appointmentsApi } from '../api/services.api';
import { pickError, type ApiErrorShape, type PaginationMeta } from '../api/client';
import { REQUEST_STATUS, type RequestStatus } from '../constants/status';
import { emptyPagination, LIST_CACHE_TTL_MS } from '../constants/pagination';

interface State {
  items: IAppointment[];
  current: IAppointment | null;
  todayList: IAppointment[];
  availableSlots: string[];
  pagination: PaginationMeta;
  status: RequestStatus;
  writeStatus: RequestStatus;
  error: ApiErrorShape | null;
  filters: Record<string, unknown>;
  lastFetchedAt: number | null;
}

interface Actions {
  fetchList: (params?: Record<string, unknown>, opts?: { force?: boolean }) => Promise<IAppointment[] | null>;
  fetchToday: () => Promise<IAppointment[] | null>;
  fetchAvailableSlots: (doctorId: string, date: string) => Promise<string[] | null>;
  fetchOne: (id: string) => Promise<IAppointment | null>;
  book: (payload: Partial<IAppointment>) => Promise<IAppointment | null>;
  update: (id: string, payload: Partial<IAppointment>) => Promise<IAppointment | null>;
  updateStatus: (id: string, status: string, cancelReason?: string) => Promise<IAppointment | null>;
  remove: (id: string) => Promise<boolean>;
  setFilters: (partial: Record<string, unknown>) => void;
  reset: () => void;
}

export type AppointmentsStore = State & Actions;

const initial: State = {
  items: [],
  current: null,
  todayList: [],
  availableSlots: [],
  pagination: emptyPagination(),
  status: REQUEST_STATUS.IDLE,
  writeStatus: REQUEST_STATUS.IDLE,
  error: null,
  filters: {},
  lastFetchedAt: null,
};

export const useAppointmentsStore = create<AppointmentsStore>()(
  devtools(
    (set, get) => ({
      ...initial,

      fetchList: async (params, opts) => {
        const merged = { ...get().filters, ...(params ?? {}) };
        const now = Date.now();
        if (
          !opts?.force &&
          get().lastFetchedAt !== null &&
          now - (get().lastFetchedAt as number) < LIST_CACHE_TTL_MS &&
          JSON.stringify(merged) === JSON.stringify(get().filters)
        ) {
          return get().items;
        }
        set({ status: REQUEST_STATUS.LOADING, error: null, filters: merged });
        try {
          const env = await appointmentsApi.list(merged);
          set({
            items: env.data ?? [],
            pagination: env.pagination ?? emptyPagination(),
            status: REQUEST_STATUS.SUCCEEDED,
            lastFetchedAt: Date.now(),
          });
          return env.data ?? [];
        } catch (err) {
          set({ status: REQUEST_STATUS.FAILED, error: pickError(err) });
          return null;
        }
      },

      fetchToday: async () => {
        try {
          const env = await appointmentsApi.today();
          set({ todayList: env.data ?? [] });
          return env.data ?? [];
        } catch (err) {
          set({ error: pickError(err) });
          return null;
        }
      },

      fetchAvailableSlots: async (doctorId, date) => {
        try {
          const env = await appointmentsApi.availableSlots(doctorId, date);
          set({ availableSlots: env.data ?? [] });
          return env.data ?? [];
        } catch (err) {
          set({ error: pickError(err) });
          return null;
        }
      },

      fetchOne: async (id) => {
        try {
          const env = await appointmentsApi.getOne(id);
          set({ current: env.data ?? null });
          return env.data ?? null;
        } catch (err) {
          set({ error: pickError(err) });
          return null;
        }
      },

      book: async (payload) => {
        set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
        try {
          const env = await appointmentsApi.create(payload);
          set((s) => ({
            items: env.data ? [env.data, ...s.items] : s.items,
            writeStatus: REQUEST_STATUS.SUCCEEDED,
            lastFetchedAt: null,
          }));
          return env.data ?? null;
        } catch (err) {
          set({ writeStatus: REQUEST_STATUS.FAILED, error: pickError(err) });
          return null;
        }
      },

      update: async (id, payload) => {
        set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
        try {
          const env = await appointmentsApi.update(id, payload);
          set((s) => ({
            items: s.items.map((a) => (a._id === id && env.data ? env.data : a)),
            writeStatus: REQUEST_STATUS.SUCCEEDED,
          }));
          return env.data ?? null;
        } catch (err) {
          set({ writeStatus: REQUEST_STATUS.FAILED, error: pickError(err) });
          return null;
        }
      },

      updateStatus: async (id, status, cancelReason) => {
        set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
        try {
          const env = await appointmentsApi.updateStatus(id, status, cancelReason);
          set((s) => ({
            items: s.items.map((a) => (a._id === id && env.data ? env.data : a)),
            writeStatus: REQUEST_STATUS.SUCCEEDED,
          }));
          return env.data ?? null;
        } catch (err) {
          set({ writeStatus: REQUEST_STATUS.FAILED, error: pickError(err) });
          return null;
        }
      },

      remove: async (id) => {
        set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
        try {
          await appointmentsApi.remove(id);
          set((s) => ({
            items: s.items.filter((a) => a._id !== id),
            writeStatus: REQUEST_STATUS.SUCCEEDED,
          }));
          return true;
        } catch (err) {
          set({ writeStatus: REQUEST_STATUS.FAILED, error: pickError(err) });
          return false;
        }
      },

      setFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial }, lastFetchedAt: null })),

      reset: () => set({ ...initial }),
    }),
    { name: 'store/appointments', enabled: process.env.NODE_ENV !== 'production' },
  ),
);
