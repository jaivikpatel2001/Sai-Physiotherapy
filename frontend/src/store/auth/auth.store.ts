/**
 * Auth store — bearer-token session state, persisted to localStorage so
 * a hard refresh keeps the user logged in.
 *
 * Pattern:
 *   const user      = useAuthStore((s) => s.user)
 *   const loading   = useAuthStore((s) => s.status === 'loading')
 *   const login     = useAuthStore((s) => s.login)
 *   const logout    = useAuthStore((s) => s.logout)
 */
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '../api/services.api';
import { pickError, tokenStorage, type ApiErrorShape } from '../api/client';
import { REQUEST_STATUS, type RequestStatus } from '../constants/status';
import type { AuthUser } from '@sai-physio/types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  status: RequestStatus;
  error: ApiErrorShape | null;
}

interface AuthActions {
  login: (creds: { email: string; password: string }) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  loadCurrentUser: () => Promise<AuthUser | null>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (data: { token: string; password: string }) => Promise<boolean>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<boolean>;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;

const initial: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  status: REQUEST_STATUS.IDLE,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initial,

        login: async (creds) => {
          set({ status: REQUEST_STATUS.LOADING, error: null });
          try {
            const env = await authApi.login(creds);
            const { accessToken, refreshToken, user } = env.data;
            tokenStorage.setTokens(accessToken, refreshToken);
            set({
              user,
              accessToken,
              isAuthenticated: true,
              status: REQUEST_STATUS.SUCCEEDED,
            });
            return user;
          } catch (err) {
            set({ status: REQUEST_STATUS.FAILED, error: pickError(err) });
            return null;
          }
        },

        logout: async () => {
          try {
            await authApi.logout();
          } catch {
            // best-effort: server side may already be expired
          }
          tokenStorage.clear();
          set({ ...initial });
        },

        loadCurrentUser: async () => {
          const token = tokenStorage.getAccessToken();
          if (!token) {
            set({ ...initial });
            return null;
          }
          if (get().user) return get().user;
          set({ status: REQUEST_STATUS.LOADING, error: null });
          try {
            const env = await authApi.me();
            const user = env.data;
            set({
              user,
              accessToken: token,
              isAuthenticated: true,
              status: REQUEST_STATUS.SUCCEEDED,
            });
            return user;
          } catch (err) {
            tokenStorage.clear();
            set({ ...initial, status: REQUEST_STATUS.FAILED, error: pickError(err) });
            return null;
          }
        },

        forgotPassword: async (email) => {
          set({ status: REQUEST_STATUS.LOADING, error: null });
          try {
            await authApi.forgotPassword(email);
            set({ status: REQUEST_STATUS.SUCCEEDED });
            return true;
          } catch (err) {
            set({ status: REQUEST_STATUS.FAILED, error: pickError(err) });
            return false;
          }
        },

        resetPassword: async (data) => {
          set({ status: REQUEST_STATUS.LOADING, error: null });
          try {
            await authApi.resetPassword(data);
            set({ status: REQUEST_STATUS.SUCCEEDED });
            return true;
          } catch (err) {
            set({ status: REQUEST_STATUS.FAILED, error: pickError(err) });
            return false;
          }
        },

        changePassword: async (data) => {
          set({ status: REQUEST_STATUS.LOADING, error: null });
          try {
            await authApi.changePassword(data);
            set({ status: REQUEST_STATUS.SUCCEEDED });
            return true;
          } catch (err) {
            set({ status: REQUEST_STATUS.FAILED, error: pickError(err) });
            return false;
          }
        },

        setTokens: (accessToken, refreshToken) => {
          tokenStorage.setTokens(accessToken, refreshToken);
          set({ accessToken, isAuthenticated: true });
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'sai.auth',
        storage: createJSONStorage(() => localStorage),
        // Persist only the lightweight fields — never the loading status.
        partialize: (s) => ({
          user: s.user,
          accessToken: s.accessToken,
          isAuthenticated: s.isAuthenticated,
        }),
      },
    ),
    { name: 'store/auth', enabled: process.env.NODE_ENV !== 'production' },
  ),
);

// ── Selector helpers (use these in components for narrow subscriptions) ───
export const selectAuthUser = (s: AuthStore): AuthUser | null => s.user;
export const selectIsAuthenticated = (s: AuthStore): boolean => s.isAuthenticated;
export const selectAuthLoading = (s: AuthStore): boolean => s.status === REQUEST_STATUS.LOADING;
export const selectAuthError = (s: AuthStore): ApiErrorShape | null => s.error;
