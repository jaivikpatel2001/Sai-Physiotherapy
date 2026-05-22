/**
 * Testimonials — admin CRUD plus moderation toggle and public-form submission.
 * Hand-rolled (not via createCrudStore) because it needs the extra `moderate`
 * and `submitPublic` actions alongside the base CRUD shape.
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ITestimonial } from '@sai-physio/types';
import { testimonialsApi } from '../api/services.api';
import { pickError, type ApiErrorShape, type PaginationMeta } from '../api/client';
import { REQUEST_STATUS, type RequestStatus } from '../constants/status';
import { emptyPagination, LIST_CACHE_TTL_MS } from '../constants/pagination';

interface State {
  items: ITestimonial[];
  current: ITestimonial | null;
  pagination: PaginationMeta;
  status: RequestStatus;
  writeStatus: RequestStatus;
  error: ApiErrorShape | null;
  filters: Record<string, unknown>;
  lastFetchedAt: number | null;
}

interface Actions {
  fetchList: (params?: Record<string, unknown>, opts?: { force?: boolean }) => Promise<ITestimonial[] | null>;
  create: (payload: Partial<ITestimonial>) => Promise<ITestimonial | null>;
  update: (id: string, payload: Partial<ITestimonial>) => Promise<ITestimonial | null>;
  moderate: (id: string, payload: { isApproved: boolean; isFeatured?: boolean }) => Promise<ITestimonial | null>;
  submitPublic: (payload: Partial<ITestimonial>) => Promise<ITestimonial | null>;
  remove: (id: string) => Promise<boolean>;
  setFilters: (partial: Record<string, unknown>) => void;
  reset: () => void;
}

export type TestimonialsStore = State & Actions;

const initial: State = {
  items: [],
  current: null,
  pagination: emptyPagination(),
  status: REQUEST_STATUS.IDLE,
  writeStatus: REQUEST_STATUS.IDLE,
  error: null,
  filters: {},
  lastFetchedAt: null,
};

export const useTestimonialsStore = create<TestimonialsStore>()(
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
          const env = await testimonialsApi.list(merged);
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

      create: async (payload) => {
        set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
        try {
          const env = await testimonialsApi.create(payload);
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
          const env = await testimonialsApi.update(id, payload);
          set((s) => ({
            items: s.items.map((t) => (t._id === id && env.data ? env.data : t)),
            writeStatus: REQUEST_STATUS.SUCCEEDED,
          }));
          return env.data ?? null;
        } catch (err) {
          set({ writeStatus: REQUEST_STATUS.FAILED, error: pickError(err) });
          return null;
        }
      },

      moderate: async (id, payload) => {
        set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
        try {
          const env = await testimonialsApi.moderate(id, payload);
          set((s) => ({
            items: s.items.map((t) => (t._id === id && env.data ? env.data : t)),
            writeStatus: REQUEST_STATUS.SUCCEEDED,
          }));
          return env.data ?? null;
        } catch (err) {
          set({ writeStatus: REQUEST_STATUS.FAILED, error: pickError(err) });
          return null;
        }
      },

      submitPublic: async (payload) => {
        try {
          const env = await testimonialsApi.submit(payload);
          return env.data ?? null;
        } catch (err) {
          set({ error: pickError(err) });
          return null;
        }
      },

      remove: async (id) => {
        set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
        try {
          await testimonialsApi.remove(id);
          set((s) => ({
            items: s.items.filter((t) => t._id !== id),
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
    { name: 'store/testimonials', enabled: process.env.NODE_ENV !== 'production' },
  ),
);
