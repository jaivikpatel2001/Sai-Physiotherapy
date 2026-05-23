'use client';
import React from 'react';
import adminStyles from '../../app/admin/admin.module.css';
import shared from './admin-shared.module.css';
import { SortableHeader } from './FilterToolbar';
import type { SortOrder } from './useTableQuery';

export interface Column<T> {
  key: string;
  header: string;
  width?: number | string;
  align?: 'left' | 'right' | 'center';
  /** When set, the header renders a click-to-sort control bound to this key. */
  sortKey?: string;
  render: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  renderActions?: (row: T) => React.ReactNode;
  skeletonRows?: number;
  /** Active sort field — must match a column's `sortKey` for the indicator to highlight. */
  sortBy?: string;
  sortOrder?: SortOrder;
  /** Called when the user clicks a sortable header. Implementations typically call `toggleSort(key)`. */
  onSort?: (key: string) => void;
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  loading,
  renderActions,
  skeletonRows = 5,
  sortBy = '',
  sortOrder = 'desc',
  onSort,
}: DataTableProps<T>) {
  const totalCols = columns.length + (renderActions ? 1 : 0);

  const renderHeader = (c: Column<T>) => {
    if (c.sortKey && onSort) {
      return (
        <SortableHeader
          label={c.header}
          sortKey={c.sortKey}
          current={sortBy}
          order={sortOrder}
          onSort={onSort}
        />
      );
    }
    return c.header;
  };

  if (loading) {
    return (
      <div className={adminStyles.tableWrap}>
        <table className={adminStyles.table}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={{ width: c.width, textAlign: c.align }}>
                  {renderHeader(c)}
                </th>
              ))}
              {renderActions && <th style={{ width: 140, textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: totalCols }).map((__, j) => (
                  <td key={j}>
                    <div className={shared.skeletonCell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={adminStyles.tableWrap}>
      <table className={adminStyles.table}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ width: c.width, textAlign: c.align }}>
                {c.header}
              </th>
            ))}
            {renderActions && <th style={{ width: 140, textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? adminStyles.rowClickable : undefined}
            >
              {columns.map((c) => (
                <td key={c.key} style={{ textAlign: c.align }}>
                  {c.render(row, idx)}
                </td>
              ))}
              {renderActions && (
                <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'right' }}>
                  {renderActions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
