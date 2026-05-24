'use client';
/**
 * Minimal pagination control for client-side paginated DataTables.
 *
 * Stores in this project fetch the full list and apply filter/sort in-memory
 * (see `applyTableQuery`), so this control just slices the already-filtered
 * array. Stays small: prev / page-number cluster / next + page-size selector.
 *
 * Pair with `usePagination(filtered, q.debouncedSearch + JSON.stringify(q.filters))`
 * which auto-resets to page 1 whenever the filter signature changes.
 */
import { useEffect, useMemo, useState } from 'react';
import styles from './TablePagination.module.css';

interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  // Compact page number window: first, last, current ±1 with ellipsis.
  const numbers = useMemo<Array<number | 'gap'>>(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const out: Array<number | 'gap'> = [1];
    const left = Math.max(2, current - 1);
    const right = Math.min(totalPages - 1, current + 1);
    if (left > 2) out.push('gap');
    for (let i = left; i <= right; i++) out.push(i);
    if (right < totalPages - 1) out.push('gap');
    out.push(totalPages);
    return out;
  }, [current, totalPages]);

  if (total === 0) return null;

  return (
    <div className={styles.pager}>
      <div className={styles.summary}>
        Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{total}</strong>
      </div>

      <div className={styles.controls}>
        {onPageSizeChange && (
          <label className={styles.sizeWrap}>
            <span className={styles.sizeLabel}>Rows</span>
            <select
              className={styles.sizeSelect}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        )}

        <div className={styles.pageBtns} role="navigation" aria-label="Pagination">
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => onPageChange(current - 1)}
            disabled={current === 1}
            aria-label="Previous page"
          >
            <i className="ri-arrow-left-s-line" aria-hidden />
          </button>

          {numbers.map((n, i) =>
            n === 'gap' ? (
              <span key={`gap-${i}`} className={styles.gap}>…</span>
            ) : (
              <button
                key={n}
                type="button"
                className={`${styles.pageBtn} ${n === current ? styles.pageBtnActive : ''}`}
                onClick={() => onPageChange(n)}
                aria-current={n === current ? 'page' : undefined}
              >
                {n}
              </button>
            ),
          )}

          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => onPageChange(current + 1)}
            disabled={current === totalPages}
            aria-label="Next page"
          >
            <i className="ri-arrow-right-s-line" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook that owns the page state, exposes a sliced view of `rows`, and
 * automatically resets to page 1 when `resetKey` changes.
 *
 *   const { page, pageSize, setPage, setPageSize, paginated } =
 *     usePagination(filtered, JSON.stringify({ search, filters }));
 */
export function usePagination<T>(rows: T[], resetKey: unknown, initialPageSize = 25) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  // Clamp page when rows shrink below current window.
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  return { page, pageSize, setPage, setPageSize, paginated, total: rows.length };
}
