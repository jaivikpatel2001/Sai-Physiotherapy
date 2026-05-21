import { create } from 'zustand';
import { authApi } from '../api';
import type { AuthUser } from '@sai-physio/types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (creds: { email: string; password: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  loadUser: () => Promise<AuthUser | null>;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

const readToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: readToken(),
  isAuthenticated: !!readToken(),
  loading: false,

  setTokens: (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
    set({ accessToken, isAuthenticated: true });
  },

  login: async (creds) => {
    set({ loading: true });
    try {
      const res = await authApi.login(creds);
      const { accessToken, refreshToken, user } = res.data.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }
      set({ user, accessToken, isAuthenticated: true, loading: false });
      return user as AuthUser;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = readToken();
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return null;
    }
    set({ loading: true });
    try {
      const res = await authApi.getMe();
      const user = (res.data.data ?? res.data) as AuthUser;
      set({ user, accessToken: token, isAuthenticated: true, loading: false });
      return user;
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      set({ user: null, accessToken: null, isAuthenticated: false, loading: false });
      return null;
    }
  },
}));
