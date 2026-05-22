/** Services (clinic-treatment services) — admin CRUD + public-side helpers. */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { IService } from '@sai-physio/types';
import { servicesApi } from '../api/services.api';
import { createCrudStore } from '../helpers/createCrudStore';
import { pickError, type ApiErrorShape } from '../api/client';
import { REQUEST_STATUS, type RequestStatus } from '../constants/status';

export const useServicesStore = createCrudStore<IService>({
  resource: 'services',
  list: servicesApi.list,
  getOne: servicesApi.getOne,
  create: servicesApi.create,
  update: servicesApi.update,
  remove: servicesApi.remove,
});

// ── Public-side slice for slug pages (separate so admin list doesn't leak) ─
interface PublicServiceState {
  bySlug: Record<string, IService>;
  status: RequestStatus;
  error: ApiErrorShape | null;
  fetchBySlug: (slug: string) => Promise<IService | null>;
}

export const usePublicServicesStore = create<PublicServiceState>()(
  devtools(
    (set, get) => ({
      bySlug: {},
      status: REQUEST_STATUS.IDLE,
      error: null,
      fetchBySlug: async (slug) => {
        const cached = get().bySlug[slug];
        if (cached) return cached;
        set({ status: REQUEST_STATUS.LOADING, error: null });
        try {
          const env = await servicesApi.publicGetBySlug(slug);
          set((s) => ({
            bySlug: { ...s.bySlug, [slug]: env.data },
            status: REQUEST_STATUS.SUCCEEDED,
          }));
          return env.data;
        } catch (err) {
          set({ status: REQUEST_STATUS.FAILED, error: pickError(err) });
          return null;
        }
      },
    }),
    { name: 'store/services-public', enabled: process.env.NODE_ENV !== 'production' },
  ),
);
