/**
 * Billing — invoices, payments and reports (daily / monthly / outstanding).
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { IBilling } from '@sai-physio/types';
import { billingsApi } from '../api/services.api';
import { pickError, type ApiErrorShape, type PaginationMeta } from '../api/client';
import { REQUEST_STATUS, type RequestStatus } from '../constants/status';
import { emptyPagination, LIST_CACHE_TTL_MS } from '../constants/pagination';

interface State {
  items: IBilling[];
  current: IBilling | null;
  pagination: PaginationMeta;
  status: RequestStatus;
  writeStatus: RequestStatus;
  error: ApiErrorShape | null;
  filters: Record<string, unknown>;
  lastFetchedAt: number | null;
  reports: {
    daily?: unknown;
    monthly?: unknown;
    outstanding?: unknown;
  };
}

interface Actions {
  fetchList: (params?: Record<string, unknown>, opts?: { force?: boolean }) => Promise<IBilling[] | null>;
  fetchOne: (id: string) => Promise<IBilling | null>;
  fetchDaily: (date?: string) => Promise<unknown>;
  fetchMonthly: (month?: string) => Promise<unknown>;
  fetchOutstanding: () => Promise<unknown>;
  create: (payload: Partial<IBilling>) => Promise<IBilling | null>;
  update: (id: string, payload: Partial<IBilling>) => Promise<IBilling | null>;
  recordPayment: (id: string, payload: { amount: number; paymentMethod: string; reference?: string }) => Promise<IBilling | null>;
  setFilters: (partial: Record<string, unknown>) => void;
  reset: () => void;
}

export type BillingsStore = State & Actions;

const initial: State = {
  items: [],
  current: null,
  pagination: emptyPagination(),
  status: REQUEST_STATUS.IDLE,
  writeStatus: REQUEST_STATUS.IDLE,
  error: null,
  filters: {},
  lastFetchedAt: null,
  reports: {},
};

export const useBillingsStore = create<BillingsStore>()(
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
          const env = await billingsApi.list(merged);
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

      fetchOne: async (id) => {
        try {
          const env = await billingsApi.getOne(id);
          set({ current: env.data ?? null });
          return env.data ?? null;
        } catch (err) {
          set({ error: pickError(err) });
          return null;
        }
      },

      fetchDaily: async (date) => {
        try {
          const env = await billingsApi.daily(date);
          set((s) => ({ reports: { ...s.reports, daily: env.data } }));
          return env.data;
        } catch (err) {
          set({ error: pickError(err) });
          return null;
        }
      },

      fetchMonthly: async (month) => {
        try {
          const env = await billingsApi.monthly(month);
          set((s) => ({ reports: { ...s.reports, monthly: env.data } }));
          return env.data;
        } catch (err) {
          set({ error: pickError(err) });
          return null;
        }
      },

      fetchOutstanding: async () => {
        try {
          const env = await billingsApi.outstanding();
          set((s) => ({ reports: { ...s.reports, outstanding: env.data } }));
          return env.data;
        } catch (err) {
          set({ error: pickError(err) });
          return null;
        }
      },

      create: async (payload) => {
        set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
        try {
          const env = await billingsApi.create(payload);
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
          const env = await billingsApi.update(id, payload);
          set((s) => ({
            items: s.items.map((b) => (b._id === id && env.data ? env.data : b)),
            writeStatus: REQUEST_STATUS.SUCCEEDED,
          }));
          return env.data ?? null;
        } catch (err) {
          set({ writeStatus: REQUEST_STATUS.FAILED, error: pickError(err) });
          return null;
        }
      },

      recordPayment: async (id, payload) => {
        set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
        try {
          const env = await billingsApi.recordPayment(id, payload);
          set((s) => ({
            items: s.items.map((b) => (b._id === id && env.data ? env.data : b)),
            writeStatus: REQUEST_STATUS.SUCCEEDED,
          }));
          return env.data ?? null;
        } catch (err) {
          set({ writeStatus: REQUEST_STATUS.FAILED, error: pickError(err) });
          return null;
        }
      },

      setFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial }, lastFetchedAt: null })),

      reset: () => set({ ...initial }),
    }),
    { name: 'store/billings', enabled: process.env.NODE_ENV !== 'production' },
  ),
);
