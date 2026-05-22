/**
 * Clinic settings (NAP, hours, socials, SEO defaults, homepage hero) —
 * one document on the backend, cached here for both admin form + public site
 * to consume without re-fetching.
 */
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { settingsApi } from '../api/services.api';
import { pickError, type ApiErrorShape } from '../api/client';
import { REQUEST_STATUS, type RequestStatus } from '../constants/status';

interface State {
  data: unknown | null;
  status: RequestStatus;
  writeStatus: RequestStatus;
  error: ApiErrorShape | null;
}

interface Actions {
  fetch: () => Promise<unknown>;
  update: (data: unknown) => Promise<unknown>;
  updateHomepage: (data: unknown) => Promise<unknown>;
  reset: () => void;
}

export type SettingsStore = State & Actions;

const initial: State = {
  data: null,
  status: REQUEST_STATUS.IDLE,
  writeStatus: REQUEST_STATUS.IDLE,
  error: null,
};

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        ...initial,

        fetch: async () => {
          set({ status: REQUEST_STATUS.LOADING, error: null });
          try {
            const env = await settingsApi.get();
            set({ data: env.data, status: REQUEST_STATUS.SUCCEEDED });
            return env.data;
          } catch (err) {
            set({ status: REQUEST_STATUS.FAILED, error: pickError(err) });
            return null;
          }
        },

        update: async (data) => {
          set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
          try {
            const env = await settingsApi.update(data);
            set({ data: env.data, writeStatus: REQUEST_STATUS.SUCCEEDED });
            return env.data;
          } catch (err) {
            set({ writeStatus: REQUEST_STATUS.FAILED, error: pickError(err) });
            return null;
          }
        },

        updateHomepage: async (data) => {
          set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
          try {
            const env = await settingsApi.updateHomepage(data);
            set({ data: env.data, writeStatus: REQUEST_STATUS.SUCCEEDED });
            return env.data;
          } catch (err) {
            set({ writeStatus: REQUEST_STATUS.FAILED, error: pickError(err) });
            return null;
          }
        },

        reset: () => set({ ...initial }),
      }),
      {
        name: 'sai.settings',
        storage: createJSONStorage(() => localStorage),
        partialize: (s) => ({ data: s.data }),
      },
    ),
    { name: 'store/settings', enabled: process.env.NODE_ENV !== 'production' },
  ),
);
