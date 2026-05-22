/**
 * Treatment sessions — accessed via patient ID. No top-level list endpoint
 * on the API (sessions are always scoped to a patient).
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ITreatmentSession } from '@sai-physio/types';
import { sessionsApi } from '../api/services.api';
import { pickError, type ApiErrorShape } from '../api/client';
import { REQUEST_STATUS, type RequestStatus } from '../constants/status';

interface State {
  byPatient: Record<string, ITreatmentSession[]>;
  recoveryByPatient: Record<string, unknown>;
  current: ITreatmentSession | null;
  status: RequestStatus;
  writeStatus: RequestStatus;
  error: ApiErrorShape | null;
}

interface Actions {
  fetchByPatient: (patientId: string) => Promise<ITreatmentSession[] | null>;
  fetchRecovery: (patientId: string) => Promise<unknown>;
  fetchOne: (id: string) => Promise<ITreatmentSession | null>;
  create: (payload: Partial<ITreatmentSession>) => Promise<ITreatmentSession | null>;
  update: (id: string, payload: Partial<ITreatmentSession>) => Promise<ITreatmentSession | null>;
  reset: () => void;
}

export type SessionsStore = State & Actions;

const initial: State = {
  byPatient: {},
  recoveryByPatient: {},
  current: null,
  status: REQUEST_STATUS.IDLE,
  writeStatus: REQUEST_STATUS.IDLE,
  error: null,
};

export const useSessionsStore = create<SessionsStore>()(
  devtools(
    (set) => ({
      ...initial,

      fetchByPatient: async (patientId) => {
        set({ status: REQUEST_STATUS.LOADING, error: null });
        try {
          const env = await sessionsApi.byPatient(patientId);
          set((s) => ({
            byPatient: { ...s.byPatient, [patientId]: env.data ?? [] },
            status: REQUEST_STATUS.SUCCEEDED,
          }));
          return env.data ?? [];
        } catch (err) {
          set({ status: REQUEST_STATUS.FAILED, error: pickError(err) });
          return null;
        }
      },

      fetchRecovery: async (patientId) => {
        try {
          const env = await sessionsApi.recovery(patientId);
          set((s) => ({ recoveryByPatient: { ...s.recoveryByPatient, [patientId]: env.data } }));
          return env.data;
        } catch (err) {
          set({ error: pickError(err) });
          return null;
        }
      },

      fetchOne: async (id) => {
        try {
          const env = await sessionsApi.getOne(id);
          set({ current: env.data ?? null });
          return env.data ?? null;
        } catch (err) {
          set({ error: pickError(err) });
          return null;
        }
      },

      create: async (payload) => {
        set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
        try {
          const env = await sessionsApi.create(payload);
          if (env.data) {
            const patientId = (env.data as ITreatmentSession).patient as unknown as string;
            set((s) => ({
              byPatient: {
                ...s.byPatient,
                [patientId]: [env.data as ITreatmentSession, ...(s.byPatient[patientId] ?? [])],
              },
              writeStatus: REQUEST_STATUS.SUCCEEDED,
            }));
          }
          return env.data ?? null;
        } catch (err) {
          set({ writeStatus: REQUEST_STATUS.FAILED, error: pickError(err) });
          return null;
        }
      },

      update: async (id, payload) => {
        set({ writeStatus: REQUEST_STATUS.LOADING, error: null });
        try {
          const env = await sessionsApi.update(id, payload);
          if (env.data) {
            const updated = env.data as ITreatmentSession;
            const patientId = updated.patient as unknown as string;
            set((s) => ({
              byPatient: {
                ...s.byPatient,
                [patientId]: (s.byPatient[patientId] ?? []).map((ss) => (ss._id === id ? updated : ss)),
              },
              current: s.current && s.current._id === id ? updated : s.current,
              writeStatus: REQUEST_STATUS.SUCCEEDED,
            }));
          }
          return env.data ?? null;
        } catch (err) {
          set({ writeStatus: REQUEST_STATUS.FAILED, error: pickError(err) });
          return null;
        }
      },

      reset: () => set({ ...initial }),
    }),
    { name: 'store/sessions', enabled: process.env.NODE_ENV !== 'production' },
  ),
);
