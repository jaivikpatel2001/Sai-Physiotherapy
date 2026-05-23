'use client';
import React from 'react';
import styles from './FilterToolbar.module.css';
import type { SortOrder } from './useTableQuery';

export interface FilterOption {
  value: string;
  label: string;
}

export type FilterDef =
  | {
      type: 'select';
      key: string;
      label: string;
      icon?: string;
      options: FilterOption[];
      placeholder?: string;
    }
  | {
      type: 'date';
      key: string;
      label: string;
      icon?: string;
    };

export interface SortDef {
  options: FilterOption[];
}

interface FilterToolbarProps {
  /** Live search value. */
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  /** Configurable filter dropdowns/date inputs. */
  filters?: FilterDef[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  /** Optional sort dropdown. */
  sort?: SortDef;
  sortBy?: string;
  sortOrder?: SortOrder;
  onSortChange?: (by: string, order: SortOrder) => void;
  /** Reset button handler. Shown when any value is non-default. */
  onReset?: () => void;
  hasActive?: boolean;
  /** Visible total / filtered count, rendered on the right. */
  totalCount?: number;
  filteredCount?: number;
}

export function FilterToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  filters = [],
  filterValues = {},
  onFilterChange,
  sort,
  sortBy,
  sortOrder = 'desc',
  onSortChange,
  onReset,
  hasActive = false,
  totalCount,
  filteredCount,
}: FilterToolbarProps) {
  const activeChips = filters
    .map((f) => {
      const v = filterValues[f.key];
      if (!v) return null;
      const label = f.type === 'select'
        ? (f.options.find((o) => o.value === v)?.label ?? v)
        : new Date(v).toLocaleDateString(undefined, { dateStyle: 'medium' });
      return { key: f.key, fieldLabel: f.label, value: label };
    })
    .filter((x): x is { key: string; fieldLabel: string; value: string } => x !== null);

  return (
    <div className={styles.toolbar}>
      <div className={styles.row}>
        {/* Search */}
        <div className={styles.searchWrap}>
          <i className={`ri-search-line ${styles.searchIcon}`} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search"
          />
          {search && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              <i className="ri-close-line" />
            </button>
          )}
        </div>

        {/* Filters */}
        {filters.map((f) => {
          const value = filterValues[f.key] ?? '';
          if (f.type === 'select') {
            return (
              <div key={f.key} className={styles.control}>
                <i className={`${f.icon ?? 'ri-filter-3-line'} ${styles.controlLead}`} />
                <select
                  className={`${styles.select} ${value ? styles.selectActive : ''}`}
                  value={value}
                  onChange={(e) => onFilterChange?.(f.key, e.target.value)}
                  aria-label={f.label}
                >
                  <option value="">{f.placeholder ?? `All ${f.label.toLowerCase()}`}</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            );
          }
          // date
          return (
            <div key={f.key} className={styles.control}>
              <i className={`${f.icon ?? 'ri-calendar-line'} ${styles.controlLead}`} />
              <input
                type="date"
                className={`${styles.dateInput} ${value ? styles.dateInputActive : ''}`}
                value={value}
                onChange={(e) => onFilterChange?.(f.key, e.target.value)}
                aria-label={f.label}
              />
            </div>
          );
        })}

        {/* Sort */}
        {sort && (
          <div className={styles.sortGroup}>
            <div className={styles.control} style={{ position: 'relative' }}>
              <i className={`ri-sort-desc ${styles.sortIconLead}`} />
              <select
                className={styles.sortSelect}
                value={sortBy ?? ''}
                onChange={(e) => onSortChange?.(e.target.value, sortOrder)}
                aria-label="Sort by"
              >
                {sort.options.map((o) => (
                  <option key={o.value} value={o.value}>Sort: {o.label}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className={styles.sortOrderBtn}
              onClick={() => onSortChange?.(sortBy ?? '', sortOrder === 'asc' ? 'desc' : 'asc')}
              aria-label={sortOrder === 'asc' ? 'Switch to descending' : 'Switch to ascending'}
              title={sortOrder === 'asc' ? 'Ascending — click for descending' : 'Descending — click for ascending'}
            >
              <i className={sortOrder === 'asc' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} />
            </button>
          </div>
        )}

        <div className={styles.spacer} />

        {/* Result count */}
        {totalCount !== undefined && (
          <span className={styles.count}>
            {filteredCount !== undefined && filteredCount !== totalCount ? (
              <><strong>{filteredCount}</strong> of <strong>{totalCount}</strong></>
            ) : (
              <><strong>{totalCount}</strong> {totalCount === 1 ? 'item' : 'items'}</>
            )}
          </span>
        )}

        {/* Reset */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={!hasActive}
            className={styles.resetBtn}
            aria-label="Reset filters"
          >
            <i className="ri-refresh-line" /> Reset
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className={styles.activeRow}>
          <span className={styles.activeLabel}>Active</span>
          {activeChips.map((c) => (
            <span key={c.key} className={styles.chip}>
              <span className={styles.chipKey}>{c.fieldLabel}:</span>
              {c.value}
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => onFilterChange?.(c.key, '')}
                aria-label={`Remove ${c.fieldLabel} filter`}
              >
                <i className="ri-close-line" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Helper for use as a Column header — renders a click-to-sort title with arrows.
 * Usage: header: <SortableHeader label="Name" sortKey="name" current={sortBy} order={sortOrder} onSort={toggleSort} />
 */
export function SortableHeader({
  label,
  sortKey,
  current,
  order,
  onSort,
}: {
  label: string;
  sortKey: string;
  current: string;
  order: SortOrder;
  onSort: (key: string) => void;
}) {
  const active = current === sortKey;
  return (
    <button type="button" className={styles.sortableHeader} onClick={() => onSort(sortKey)}>
      {label}
      <span className={`${styles.sortIcon} ${active ? styles.sortIconActive : ''}`} aria-hidden>
        <i className={active && order === 'asc' ? 'ri-arrow-up-s-fill' : 'ri-arrow-up-s-line'} style={{ marginBottom: -3 }} />
        <i className={active && order === 'desc' ? 'ri-arrow-down-s-fill' : 'ri-arrow-down-s-line'} />
      </span>
    </button>
  );
}
