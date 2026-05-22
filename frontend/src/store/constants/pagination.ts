import type { PaginationMeta } from '../api/client';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * Default cache TTL — how long a list result is considered fresh before a
 * store action re-fetches on next mount. Stores explicitly bypass this when
 * the user changes filters or after a write (create/update/remove).
 */
export const LIST_CACHE_TTL_MS = 60_000;

export const emptyPagination = (): PaginationMeta => ({
  page: DEFAULT_PAGE,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
});
