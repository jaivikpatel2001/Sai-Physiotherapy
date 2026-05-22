/**
 * Patients — admin CRUD + per-patient sessions/bills aggregates.
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { IPatient, ITreatmentSession, IBilling } from '@sai-physio/types';
import { patientsApi } from '../api/services.api';
import { pickError, type ApiErrorShape, type PaginationMeta } from '../api/client';
import { REQUEST_STATUS, type RequestStatus } from '../constants/status';
import { emptyPagination, LIST_CACHE_TTL_MS } from '../constants/pagination';

interface State {
  items: IPatient[];
  current: IPatient | null;
  pagination: PaginationMeta;
  status: RequestStatus;
  writeStatus: RequestStatus;
  error: ApiErrorShape | null;
  filters: Record<string, unknown>;
  lastFetchedAt: number | null;
  /** Per-patient cache of sessions / bills, keyed by patient _id. */
  sessionsByPatient: Record<string, ITreatmentSession[]>;
  billsByPatient: Record<string, IBilling[]>;
  searchResults: IPatient[];
}

interface Actions {
  fetchList: (params?: Record<string, unknown>, opts?: { force?: boolean }) => Promise<IPatient[] | null>;
  fetchOne: (id: string) => Promise<IPatient | null>;
  search: (q: string) => Promise<IPatient[] | null>;
  fetchSessions: (id: string) => Promise<ITreatmentSession[] | null>;
  fetchBills: (id: string) => Promise<IBilling[] | null>;
  create: (payload: Partial<IPatient>) => Promise<IPatient | null>;
  update: (id: string, payload: Partial<IPatient>) => Promise<IPatient | null>;
  remove: (id: string) => Promise<boolean>;
  setFilters: (partial: Record<string, unknown>) => void;
  reset: () => void;
}

export type PatientsStore = State & Actions;

const initial: State = {
  items: [],
  current: null,
  pagination: emptyPagination(),
  status: REQUEST_STATUS.IDLE,
  writeStatus: REQUEST_STATUS.IDLE,
  error: null,
  filters: {},
  lastFetchedAt: null,
  sessionsByPatient: {},
  billsByPatient: {},
  searchResults: [],
};

export const usePatientsStore = create<PatientsStore>()(
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
          const env = await patientsApi.list(merged);
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
        set({ status: REQUEST_STATUS.LOADING, error: null });
        try {
          const env = await patientsApi.getOne(id);
          set({ current: env.data ?? null, status: REQUEST_STATUS.SUCCEEDED });
          return env.data ?? null;
        } catch (err) {
          set({ status: REQUEST_STATUS.FAILED, error: pickError(err) });
          return null;
        }
      },

      search: async (q) => {
        if (!q?.trim()) {
          set({ searchResults: [] });
          return [];
        }
        try {
          const env = await patientsApi.search(q);
          set({ searchResults: env.data ?? [] });
          return env.data ?? [];
        } catch (err) {
          set({ error: pickError(err) });
          return null;
        }
      },

      fetchSessions: async (id) => {
        try {
          const env = await patientsApi.getSessions(id);
          set((s) => ({ sessionsByPatient: { ...s.sessionsByPatient, [id]: env.data ?? [] } }));
          return env.data ?? [];
        } catch (err) {
          set({ error: pickError(err) });
          return null;
        }
      },

      fetchBills: async (id) => {
        try {
          const env = await patientsApi.getBills(id);
          set((s) => ({ billsByPatient: { ...s.billsByPatient, [id]: env.data ?? [] } }));
          return env.data ?? [];
        } catch (err) {
          set({ error: pickError(err) });
          return null;
        }
      },

      create: async (payload) => {
        set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
        try {
          const env = await patientsApi.create(payload);
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
          const env = await patientsApi.update(id, payload);
          set((s) => ({
            items: s.items.map((p) => (p._id === id && env.data ? env.data : p)),
            current: s.current && s.current._id === id && env.data ? env.data : s.current,
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
          await patientsApi.remove(id);
          set((s) => ({
            items: s.items.filter((p) => p._id !== id),
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
    { name: 'store/patients', enabled: process.env.NODE_ENV !== 'production' },
  ),
);
