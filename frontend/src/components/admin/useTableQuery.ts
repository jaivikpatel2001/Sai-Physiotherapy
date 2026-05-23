'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type SortOrder = 'asc' | 'desc';

interface UseTableQueryOptions {
  /** Initial sort field key. */
  initialSortBy?: string;
  /** Initial sort order. Defaults to 'desc'. */
  initialSortOrder?: SortOrder;
  /** Debounce window for search input (ms). Defaults to 300. */
  debounceMs?: number;
  /** Initial filter values. */
  initialFilters?: Record<string, string>;
}

interface UseTableQueryReturn {
  /** Live search input value (updates immediately, bind to <input>). */
  search: string;
  setSearch: (v: string) => void;
  /** Debounced search value (use this for filtering / API calls). */
  debouncedSearch: string;

  /** Filter map. Empty string means "unset". */
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  resetFilters: () => void;

  /** Sort state. */
  sortBy: string;
  sortOrder: SortOrder;
  setSort: (by: string, order?: SortOrder) => void;
  /** Toggle sort: if same key, flip order; otherwise switch and default to 'desc'. */
  toggleSort: (key: string) => void;

  /** Reset everything to initial state. */
  resetAll: () => void;

  /** Count of non-empty filters (excluding search/sort). */
  activeFilterCount: number;
  /** True when there's anything to reset (search, filters, or non-initial sort). */
  hasActive: boolean;
}

export function useTableQuery(opts: UseTableQueryOptions = {}): UseTableQueryReturn {
  const {
    initialSortBy = '',
    initialSortOrder = 'desc',
    debounceMs = 300,
    initialFilters = {},
  } = opts;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);
  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), debounceMs);
    return () => clearTimeout(t);
  }, [search, debounceMs]);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const setSort = useCallback((by: string, order?: SortOrder) => {
    setSortBy(by);
    if (order) setSortOrder(order);
  }, []);

  const toggleSort = useCallback((key: string) => {
    setSortBy((currentBy) => {
      setSortOrder((currentOrder) => {
        if (currentBy === key) return currentOrder === 'asc' ? 'desc' : 'asc';
        return 'desc';
      });
      return key;
    });
  }, []);

  const resetAll = useCallback(() => {
    setSearch('');
    setFilters(initialFilters);
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
  }, [initialFilters, initialSortBy, initialSortOrder]);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v && v.length > 0).length,
    [filters],
  );

  const hasActive = useMemo(
    () => search.length > 0 || activeFilterCount > 0 || sortBy !== initialSortBy || sortOrder !== initialSortOrder,
    [search, activeFilterCount, sortBy, sortOrder, initialSortBy, initialSortOrder],
  );

  return {
    search, setSearch, debouncedSearch,
    filters, setFilter, resetFilters,
    sortBy, sortOrder, setSort, toggleSort,
    resetAll,
    activeFilterCount,
    hasActive,
  };
}

/**
 * Generic client-side filter+sort helper.
 * - Searches across the provided `searchFields` (case-insensitive substring match).
 * - Applies each filter as exact match against the corresponding `filterAccessor[key](row)`.
 * - Sorts by `sortAccessor[sortBy](row)` (number, string, or Date).
 */
export interface ApplyOptions<T> {
  rows: T[];
  search: string;
  /** For each row, return the concatenated searchable text. */
  searchFields?: (row: T) => string;
  filters: Record<string, string>;
  /** Accessor map by filter key. Return the value to compare against the filter selection. */
  filterAccessors?: Record<string, (row: T) => unknown>;
  sortBy: string;
  sortOrder: SortOrder;
  /** Accessor map by sort key. Return a comparable (string | number | Date). */
  sortAccessors?: Record<string, (row: T) => string | number | Date | undefined | null>;
}

export function applyTableQuery<T>({
  rows,
  search,
  searchFields,
  filters,
  filterAccessors,
  sortBy,
  sortOrder,
  sortAccessors,
}: ApplyOptions<T>): T[] {
  let out = rows;

  // Search
  if (search && searchFields) {
    const q = search.toLowerCase();
    out = out.filter((r) => searchFields(r).toLowerCase().includes(q));
  }

  // Filters
  if (filterAccessors) {
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      const access = filterAccessors[key];
      if (!access) continue;
      out = out.filter((r) => {
        const v = access(r);
        if (Array.isArray(v)) return v.map(String).includes(value);
        return String(v ?? '') === value;
      });
    }
  }

  // Sort
  if (sortBy && sortAccessors?.[sortBy]) {
    const access = sortAccessors[sortBy];
    const dir = sortOrder === 'asc' ? 1 : -1;
    out = [...out].sort((a, b) => {
      const av = access(a);
      const bv = access(b);
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (av instanceof Date && bv instanceof Date) return (av.getTime() - bv.getTime()) * dir;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }

  return out;
}
