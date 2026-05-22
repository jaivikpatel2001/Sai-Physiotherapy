/**
 * Central axios client used by every Zustand store action.
 *
 * Owns:
 *   • baseURL / timeout / JSON defaults
 *   • Request interceptor — attaches bearer token from localStorage
 *   • Response interceptor — refreshes the token once on 401, replays request
 *
 * Components must never import this directly — they call store actions
 * which call services which call this client.
 */
import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  setTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) window.localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ────────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — refresh-once on 401 ─────────────────────────────
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
    const accessToken: string | undefined = res.data?.data?.accessToken;
    if (!accessToken) return null;
    tokenStorage.setTokens(accessToken);
    return accessToken;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (!original || original._retried || error.response?.status !== 401) {
      return Promise.reject(error);
    }
    original._retried = true;
    if (!refreshing) {
      refreshing = refreshAccessToken().finally(() => {
        refreshing = null;
      });
    }
    const newToken = await refreshing;
    if (!newToken) {
      tokenStorage.clear();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    original.headers = original.headers ?? {};
    (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
    return apiClient(original);
  },
);

// ── Envelope helpers ──────────────────────────────────────────────────────
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  pagination?: PaginationMeta;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiErrorShape {
  message: string;
  status?: number;
  raw?: unknown;
}

/**
 * Normalises any thrown axios error into a stable shape stored
 * on `state.error` of every module store.
 */
export function pickError(err: unknown): ApiErrorShape {
  const axErr = err as AxiosError<{ error?: string; message?: string }>;
  const status = axErr.response?.status;
  const body = axErr.response?.data;
  const message = body?.error || body?.message || axErr.message || 'Request failed';
  return { message, status, raw: body };
}
