/**
 * Upload store — wraps multipart uploads to /upload/image/:module and friends.
 * Components don't need to subscribe to in-flight progress (yet); they call
 * `uploadImage(module, file)` and await the resolved {url, key, ...} object.
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { uploadApi, type StorageModule, type UploadedFile } from '../api/services.api';
import { pickError, type ApiErrorShape } from '../api/client';
import { REQUEST_STATUS, type RequestStatus } from '../constants/status';

interface State {
  inFlight: number;
  status: RequestStatus;
  error: ApiErrorShape | null;
}

interface Actions {
  uploadImage: (module: StorageModule, file: File) => Promise<UploadedFile | null>;
  uploadImages: (module: StorageModule, files: File[]) => Promise<UploadedFile[] | null>;
  uploadDocument: (file: File) => Promise<UploadedFile | null>;
  remove: (key: string, storage: 'r2' | 'local') => Promise<boolean>;
  reset: () => void;
}

export type UploadStore = State & Actions;

const initial: State = {
  inFlight: 0,
  status: REQUEST_STATUS.IDLE,
  error: null,
};

export const useUploadStore = create<UploadStore>()(
  devtools(
    (set) => ({
      ...initial,

      uploadImage: async (module, file) => {
        set((s) => ({ inFlight: s.inFlight + 1, status: REQUEST_STATUS.LOADING, error: null }));
        try {
          const env = await uploadApi.uploadImage(module, file);
          return env.data ?? null;
        } catch (err) {
          set({ error: pickError(err), status: REQUEST_STATUS.FAILED });
          return null;
        } finally {
          set((s) => ({ inFlight: Math.max(0, s.inFlight - 1) }));
        }
      },

      uploadImages: async (module, files) => {
        set((s) => ({ inFlight: s.inFlight + 1, status: REQUEST_STATUS.LOADING, error: null }));
        try {
          const env = await uploadApi.uploadImages(module, files);
          return env.data ?? null;
        } catch (err) {
          set({ error: pickError(err), status: REQUEST_STATUS.FAILED });
          return null;
        } finally {
          set((s) => ({ inFlight: Math.max(0, s.inFlight - 1) }));
        }
      },

      uploadDocument: async (file) => {
        set((s) => ({ inFlight: s.inFlight + 1, status: REQUEST_STATUS.LOADING, error: null }));
        try {
          const env = await uploadApi.uploadDocument(file);
          return env.data ?? null;
        } catch (err) {
          set({ error: pickError(err), status: REQUEST_STATUS.FAILED });
          return null;
        } finally {
          set((s) => ({ inFlight: Math.max(0, s.inFlight - 1) }));
        }
      },

      remove: async (key, storage) => {
        try {
          await uploadApi.remove(key, storage);
          return true;
        } catch (err) {
          set({ error: pickError(err) });
          return false;
        }
      },

      reset: () => set({ ...initial }),
    }),
    { name: 'store/upload', enabled: process.env.NODE_ENV !== 'production' },
  ),
);
