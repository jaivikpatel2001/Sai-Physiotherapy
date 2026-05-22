/** Request-status enum used by every module store. */
export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export const REQUEST_STATUS = {
  IDLE: 'idle' as const,
  LOADING: 'loading' as const,
  SUCCEEDED: 'succeeded' as const,
  FAILED: 'failed' as const,
};

export const isLoading = (s: RequestStatus): boolean => s === 'loading';
export const isSuccess = (s: RequestStatus): boolean => s === 'succeeded';
export const isFailure = (s: RequestStatus): boolean => s === 'failed';
