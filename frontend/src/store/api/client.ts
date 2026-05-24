/**
 * Central axios client used by every Zustand store action.
 *
 * Owns:
 *   • baseURL / timeout / JSON defaults
 *   • Request interceptor — attaches bearer token from localStorage
 *   • Response interceptor — refreshes the token once on 401, replays request
 *   • Toast interceptor — fires success toasts on mutating requests using the
 *     dynamic `message` returned by the backend, and error toasts using the
 *     backend's `error` / `errors[]` envelope. Per-request opt-out via the
 *     `silent: true` config flag (used by polling/list/silent-refresh calls).
 *
 * Components must never import this directly — they call store actions
 * which call services which call this client.
 */
import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { notifyFromError, notifyFromResponse } from '@/lib/toast';

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

// ── Per-request toast control ─────────────────────────────────────────────
export interface RequestMeta {
  /** Suppress success + error toasts for this single request. */
  silent?: boolean;
  /** Suppress only the success toast (errors still surface). */
  silentSuccess?: boolean;
  /** Suppress only the error toast (success still surfaces). */
  silentError?: boolean;
}

type ConfigWithMeta = (AxiosRequestConfig | InternalAxiosRequestConfig) & RequestMeta & { _retried?: boolean };

/**
 * Endpoints that should never auto-toast (backend chatter that the user
 * does not need surfaced — refresh dance, /me poll, silent activity feed).
 */
const SILENT_PATH_PATTERNS: RegExp[] = [
  /\/auth\/refresh-token$/,
  /\/auth\/me$/,
  /\/analytics\//,
  /\/upload\//,
];

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

function isSilentByPath(url?: string): boolean {
  if (!url) return false;
  return SILENT_PATH_PATTERNS.some((re) => re.test(url));
}

function isMutation(method?: string): boolean {
  return MUTATING_METHODS.has((method || 'get').toLowerCase());
}

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

// ── Response interceptor — refresh-once on 401 + global toasts ─────────────
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
  (response: AxiosResponse) => {
    const config = response.config as ConfigWithMeta;
    if (
      isMutation(config.method) &&
      !isSilentByPath(config.url) &&
      !config.silent &&
      !config.silentSuccess
    ) {
      notifyFromResponse(response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as ConfigWithMeta | undefined;
    if (original && original._retried !== true && error.response?.status === 401) {
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
        // Fall through and surface the 401 below.
      } else {
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
    }

    // Fire global error toast unless caller opted out.
    if (!original?.silent && !original?.silentError && !isSilentByPath(original?.url)) {
      notifyFromError(error);
    }
    return Promise.reject(error);
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
