/** Users (staff accounts) — list + toggle active status. */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AuthUser } from '@sai-physio/types';
import { usersApi } from '../api/services.api';
import { pickError, type ApiErrorShape, type PaginationMeta } from '../api/client';
import { REQUEST_STATUS, type RequestStatus } from '../constants/status';
import { emptyPagination, LIST_CACHE_TTL_MS } from '../constants/pagination';

interface UsersState {
  items: AuthUser[];
  pagination: PaginationMeta;
  status: RequestStatus;
  writeStatus: RequestStatus;
  error: ApiErrorShape | null;
  filters: Record<string, unknown>;
  lastFetchedAt: number | null;
}

interface UsersActions {
  fetchList: (params?: Record<string, unknown>, opts?: { force?: boolean }) => Promise<AuthUser[] | null>;
  toggleStatus: (id: string) => Promise<AuthUser | null>;
  update: (id: string, payload: Partial<AuthUser>) => Promise<AuthUser | null>;
  remove: (id: string) => Promise<boolean>;
  setFilters: (partial: Record<string, unknown>) => void;
  reset: () => void;
}

export type UsersStore = UsersState & UsersActions;

const initial: UsersState = {
  items: [],
  pagination: emptyPagination(),
  status: REQUEST_STATUS.IDLE,
  writeStatus: REQUEST_STATUS.IDLE,
  error: null,
  filters: {},
  lastFetchedAt: null,
};

export const useUsersStore = create<UsersStore>()(
  devtools(
    (set, get) => ({
      ...initial,
      fetchList: async (params, opts) => {
        const merged = { ...get().filters, ...(params ?? {}) };
        const now = Date.now();
        if (
          !opts?.force &&
          get().lastFetchedAt !== null &&
          now - (get().lastFetchedAt as number) < LIST_CACHE_TTL_MS
        ) {
          return get().items;
        }
        set({ status: REQUEST_STATUS.LOADING, error: null, filters: merged });
        try {
          const env = await usersApi.list(merged);
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
      toggleStatus: async (id) => {
        set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
        try {
          const env = await usersApi.toggleStatus(id);
          set((s) => ({
            items: env.data
              ? s.items.map((u) => (u._id === id ? { ...u, ...env.data! } : u))
              : s.items,
            writeStatus: REQUEST_STATUS.SUCCEEDED,
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
          const env = await usersApi.update(id, payload);
          set((s) => ({
            items: env.data
              ? s.items.map((u) => (u._id === id ? { ...u, ...env.data! } : u))
              : s.items,
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
          await usersApi.remove(id);
          set((s) => ({
            items: s.items.filter((u) => u._id !== id),
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
    { name: 'store/users', enabled: process.env.NODE_ENV !== 'production' },
  ),
);
