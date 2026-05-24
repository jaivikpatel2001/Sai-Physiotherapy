/**
 * Centralised toast layer.
 *
 * Every toast in the app routes through here so that messages stay in lock-step
 * with the backend `{ success, message, data, error, errors }` envelope:
 *
 *   • `notifySuccess / notifyError / notifyWarning / notifyInfo` — direct helpers
 *   • `notifyFromResponse(env)` — fires a success toast using `env.message`
 *   • `notifyFromError(err)` — pulls the message from an axios / fetch / store
 *     error in this priority order:
 *         1. `errors[]` array → field-prefixed validation messages
 *         2. `error` (string) — our backend's failure envelope
 *         3. `message` (string) — Mongo / generic
 *         4. axios `message` / fallback "Something went wrong"
 *   • `toastPromise(promise)` — wraps an inflight promise; resolves & rejects
 *     using the backend-supplied message.
 *
 * Dedup: every toast uses a deterministic `toastId` derived from the message so
 * an interceptor that fires + a manual `notify*` call inside a store won't
 * stack two toasts for the same payload.
 *
 * Components NEVER hardcode static toast copy — they pass the backend response
 * (success or error) and this layer extracts the dynamic message.
 */
import { toast, Bounce, type Id, type ToastOptions } from 'react-toastify';
import type { AxiosError } from 'axios';

// ── Types ────────────────────────────────────────────────────────────────────
export interface ApiResponseEnvelope {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: Array<{ field?: string; message?: string } | string>;
  data?: unknown;
}

type ResponseLike = ApiResponseEnvelope | { data?: ApiResponseEnvelope } | null | undefined;

// ── Internals ───────────────────────────────────────────────────────────────
const DEFAULT_OPTS: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  theme: 'light',
  transition: Bounce,
};

/**
 * Deterministic toast id so duplicate fires (e.g. global interceptor +
 * an inline `.then()` handler) collapse into a single toast.
 */
function idFor(kind: 'success' | 'error' | 'warning' | 'info', msg: string): string {
  let hash = 0;
  for (let i = 0; i < msg.length; i++) {
    hash = (hash * 31 + msg.charCodeAt(i)) | 0;
  }
  return `${kind}:${hash}`;
}

function show(kind: 'success' | 'error' | 'warning' | 'info', message: string, opts?: ToastOptions): Id | null {
  const trimmed = (message || '').toString().trim();
  if (!trimmed) return null;
  const toastId = opts?.toastId ?? idFor(kind, trimmed);
  // react-toastify auto-dedups by toastId — calling toast with an active id is a no-op.
  return toast[kind](trimmed, { ...DEFAULT_OPTS, ...opts, toastId });
}

// ── Direct helpers ──────────────────────────────────────────────────────────
export const notifySuccess = (msg: string, opts?: ToastOptions): Id | null => show('success', msg, opts);
export const notifyError = (msg: string, opts?: ToastOptions): Id | null => show('error', msg, opts);
export const notifyWarning = (msg: string, opts?: ToastOptions): Id | null => show('warning', msg, opts);
export const notifyInfo = (msg: string, opts?: ToastOptions): Id | null => show('info', msg, opts);

export const dismissToast = (id?: Id): void => {
  if (id !== undefined) toast.dismiss(id);
  else toast.dismiss();
};

// ── Envelope / error extractors ─────────────────────────────────────────────

/**
 * Pulls the dynamic backend message off a success envelope and fires a success
 * toast. Returns the toast id (or null when the envelope carried no message).
 *
 *   notifyFromResponse(env)              // uses env.message
 *   notifyFromResponse(env, { kind })    // override toast kind (info/warning…)
 */
export function notifyFromResponse(
  env: ResponseLike,
  opts?: ToastOptions & { kind?: 'success' | 'info' | 'warning' },
): Id | null {
  const payload = extractEnvelope(env);
  const message = payload?.message?.trim();
  if (!message) return null;
  const kind = opts?.kind ?? 'success';
  return show(kind, message, opts);
}

/**
 * Pulls the dynamic backend error message off any thrown axios / store error
 * (or a raw failure envelope) and fires an error toast.
 *
 *   .catch(notifyFromError)
 *   notifyFromError(storeError)
 */
export function notifyFromError(err: unknown, opts?: ToastOptions): Id | null {
  const message = extractErrorMessage(err);
  if (!message) return null;
  return show('error', message, opts);
}

/**
 * Wrap a request promise so the toast text comes from the backend response.
 * The `pending` label is the only static copy — `success` / `error` resolve
 * dynamically from the envelope.
 */
export function toastPromise<T extends ResponseLike>(
  promise: Promise<T>,
  opts: { pending: string; fallbackSuccess?: string; fallbackError?: string } & ToastOptions,
): Promise<T> {
  const { pending, fallbackSuccess, fallbackError, ...rest } = opts;
  return toast.promise(
    promise,
    {
      pending,
      success: {
        render: ({ data }) => extractEnvelope(data as ResponseLike)?.message || fallbackSuccess || 'Done',
      },
      error: {
        render: ({ data }) => extractErrorMessage(data) || fallbackError || 'Something went wrong',
      },
    },
    { ...DEFAULT_OPTS, ...rest } as ToastOptions<T>,
  ) as Promise<T>;
}

// ── Pure extractors (also useful in interceptors/stores) ───────────────────

export function extractEnvelope(input: ResponseLike): ApiResponseEnvelope | null {
  if (!input) return null;
  if (typeof input !== 'object') return null;
  // axios response: { data: { success, message, ... } }
  if ('data' in input && input.data && typeof input.data === 'object' && ('success' in (input.data as object) || 'message' in (input.data as object) || 'error' in (input.data as object))) {
    return input.data as ApiResponseEnvelope;
  }
  return input as ApiResponseEnvelope;
}

/**
 * Extracts the most meaningful human-readable error message from anything:
 *   • Axios error → response.data.error | .message | .errors[]
 *   • Plain envelope → error | message | errors[]
 *   • Store `ApiErrorShape` → message
 *   • Native Error → message
 *   • Network/timeout → "Network error. Please check your connection."
 *
 * Never returns a generic string when the backend supplied a specific one.
 */
export function extractErrorMessage(err: unknown): string {
  if (!err) return '';

  // String error
  if (typeof err === 'string') return err;

  // Axios error
  const ax = err as AxiosError<ApiResponseEnvelope>;
  if (ax && typeof ax === 'object' && 'isAxiosError' in ax && ax.isAxiosError) {
    // No response → network / timeout / CORS
    if (!ax.response) {
      if (ax.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
      return 'Network error. Please check your connection.';
    }
    const body = ax.response.data;
    return (
      pickValidationMessages(body?.errors) ||
      body?.error ||
      body?.message ||
      statusFallback(ax.response.status)
    );
  }

  // Already an envelope
  const env = err as ApiResponseEnvelope;
  if (env && typeof env === 'object') {
    const fromArr = pickValidationMessages(env.errors);
    if (fromArr) return fromArr;
    if (env.error) return env.error;
    if (env.message) return env.message;
  }

  // Native Error
  if (err instanceof Error) return err.message;

  return 'Something went wrong';
}

function pickValidationMessages(errors?: ApiResponseEnvelope['errors']): string | null {
  if (!errors || !Array.isArray(errors) || errors.length === 0) return null;
  const parts = errors
    .map((e) => {
      if (typeof e === 'string') return e;
      if (!e) return '';
      const field = e.field ? `${e.field}: ` : '';
      return `${field}${e.message ?? ''}`.trim();
    })
    .filter(Boolean);
  if (parts.length === 0) return null;
  // Cap to first 3 so the toast doesn't become a wall of text.
  const visible = parts.slice(0, 3).join(' · ');
  const overflow = parts.length > 3 ? ` (+${parts.length - 3} more)` : '';
  return `${visible}${overflow}`;
}

function statusFallback(status: number): string {
  if (status === 400) return 'Validation failed';
  if (status === 401) return 'Unauthorized access';
  if (status === 403) return 'You do not have permission for this action';
  if (status === 404) return 'Resource not found';
  if (status === 409) return 'Conflict — duplicate or stale data';
  if (status === 422) return 'Validation failed';
  if (status === 429) return 'Too many requests. Please slow down.';
  if (status >= 500) return 'Server error. Please try again later.';
  return 'Request failed';
}
