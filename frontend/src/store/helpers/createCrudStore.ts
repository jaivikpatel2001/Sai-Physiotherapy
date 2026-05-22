/**
 * createCrudStore — a Zustand-store factory for "list/get/create/update/remove"
 * style resources. Every module store (blogs, services, doctors, gallery,
 * testimonials, pages, users, patients, appointments, billings, sessions)
 * shares the same shape:
 *
 *   • items[], current, status, error, pagination, filters, lastFetchedAt
 *   • fetchList(params?, { force? })   — list, with TTL-based cache skip
 *   • fetchOne(id)                     — single record
 *   • create(payload)                  — appends to items
 *   • update(id, payload)              — patches in items
 *   • remove(id)                       — drops from items
 *   • setFilters(partial)              — merges + triggers a fresh fetch
 *   • reset()                          — clear everything
 *
 * Stores wrap this with `devtools` middleware so they show up in the Redux
 * DevTools extension during development. Auth and analytics build on the
 * same patterns but expose a custom shape (see auth.store.ts).
 */
import { create, type StateCreator, type StoreApi, type UseBoundStore } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  emptyPagination,
  LIST_CACHE_TTL_MS,
} from '../constants/pagination';
import { REQUEST_STATUS, type RequestStatus } from '../constants/status';
import {
  pickError,
  type ApiEnvelope,
  type ApiErrorShape,
  type PaginationMeta,
} from '../api/client';

export interface ListParams {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface CrudService<T, CreateInput, UpdateInput> {
  resource: string;
  list?: (params?: ListParams) => Promise<ApiEnvelope<T[]>>;
  getOne?: (id: string) => Promise<ApiEnvelope<T>>;
  create?: (payload: CreateInput) => Promise<ApiEnvelope<T>>;
  update?: (id: string, payload: UpdateInput) => Promise<ApiEnvelope<T>>;
  remove?: (id: string) => Promise<ApiEnvelope<unknown>>;
  /** Optional override for matching the stable id of a record. Defaults to `_id`. */
  idOf?: (item: T) => string;
}

export interface CrudState<T> {
  items: T[];
  current: T | null;
  status: RequestStatus;
  writeStatus: RequestStatus;
  error: ApiErrorShape | null;
  pagination: PaginationMeta;
  filters: ListParams;
  lastFetchedAt: number | null;
}

export interface CrudActions<T, CreateInput, UpdateInput> {
  fetchList: (params?: ListParams, opts?: { force?: boolean }) => Promise<T[] | null>;
  fetchOne: (id: string) => Promise<T | null>;
  create: (payload: CreateInput) => Promise<T | null>;
  update: (id: string, payload: UpdateInput) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
  setFilters: (partial: ListParams, opts?: { autoFetch?: boolean }) => void;
  setCurrent: (item: T | null) => void;
  reset: () => void;
}

export type CrudStore<T, CreateInput = Partial<T>, UpdateInput = Partial<T>> = CrudState<T> &
  CrudActions<T, CreateInput, UpdateInput>;

function defaultIdOf<T>(item: T): string {
  return (item as { _id?: string })._id ?? '';
}

const initialState = <T,>(): CrudState<T> => ({
  items: [],
  current: null,
  status: REQUEST_STATUS.IDLE,
  writeStatus: REQUEST_STATUS.IDLE,
  error: null,
  pagination: emptyPagination(),
  filters: {},
  lastFetchedAt: null,
});

/**
 * Factory. Call once per resource — exports the bound store hook directly.
 * Stores can extend the shape by composing the returned creator inside `create()`.
 */
export function createCrudStore<T, CreateInput = Partial<T>, UpdateInput = Partial<T>>(
  service: CrudService<T, CreateInput, UpdateInput>,
): UseBoundStore<StoreApi<CrudStore<T, CreateInput, UpdateInput>>> {
  const idOf = service.idOf ?? defaultIdOf;

  const creator: StateCreator<CrudStore<T, CreateInput, UpdateInput>> = (set, get) => ({
    ...initialState<T>(),

    fetchList: async (params, opts) => {
      if (!service.list) return null;
      const merged: ListParams = { ...get().filters, ...(params ?? {}) };
      const now = Date.now();
      const last = get().lastFetchedAt;
      const cacheHit =
        !opts?.force &&
        last !== null &&
        now - last < LIST_CACHE_TTL_MS &&
        get().status === REQUEST_STATUS.SUCCEEDED &&
        JSON.stringify(merged) === JSON.stringify(get().filters);
      if (cacheHit) return get().items;

      set({ status: REQUEST_STATUS.LOADING, error: null, filters: merged });
      try {
        const env = await service.list(merged);
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
      if (!service.getOne) return null;
      set({ status: REQUEST_STATUS.LOADING, error: null });
      try {
        const env = await service.getOne(id);
        set({ current: env.data ?? null, status: REQUEST_STATUS.SUCCEEDED });
        return env.data ?? null;
      } catch (err) {
        set({ status: REQUEST_STATUS.FAILED, error: pickError(err) });
        return null;
      }
    },

    create: async (payload) => {
      if (!service.create) return null;
      set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
      try {
        const env = await service.create(payload);
        const created = env.data;
        set((s) => ({
          items: created ? [created, ...s.items] : s.items,
          current: created ?? s.current,
          writeStatus: REQUEST_STATUS.SUCCEEDED,
          lastFetchedAt: null, // invalidate so next fetchList re-pulls
        }));
        return created ?? null;
      } catch (err) {
        set({ writeStatus: REQUEST_STATUS.FAILED, error: pickError(err) });
        return null;
      }
    },

    update: async (id, payload) => {
      if (!service.update) return null;
      set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
      try {
        const env = await service.update(id, payload);
        const updated = env.data;
        set((s) => ({
          items: s.items.map((it) => (idOf(it) === id && updated ? updated : it)),
          current: s.current && idOf(s.current) === id && updated ? updated : s.current,
          writeStatus: REQUEST_STATUS.SUCCEEDED,
        }));
        return updated ?? null;
      } catch (err) {
        set({ writeStatus: REQUEST_STATUS.FAILED, error: pickError(err) });
        return null;
      }
    },

    remove: async (id) => {
      if (!service.remove) return false;
      set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
      try {
        await service.remove(id);
        set((s) => ({
          items: s.items.filter((it) => idOf(it) !== id),
          current: s.current && idOf(s.current) === id ? null : s.current,
          writeStatus: REQUEST_STATUS.SUCCEEDED,
        }));
        return true;
      } catch (err) {
        set({ writeStatus: REQUEST_STATUS.FAILED, error: pickError(err) });
        return false;
      }
    },

    setFilters: (partial, opts) => {
      const next: ListParams = { ...get().filters, ...partial };
      set({ filters: next, lastFetchedAt: null });
      if (opts?.autoFetch !== false) {
        void get().fetchList(next, { force: true });
      }
    },

    setCurrent: (item) => set({ current: item }),

    reset: () => set(initialState<T>()),
  });

  return create<CrudStore<T, CreateInput, UpdateInput>>()(
    devtools(creator, { name: `store/${service.resource}`, enabled: process.env.NODE_ENV !== 'production' }),
  );
}
