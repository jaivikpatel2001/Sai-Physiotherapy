'use client';
import React from 'react';
import adminStyles from '../../app/admin/admin.module.css';
import shared from './admin-shared.module.css';

export interface Column<T> {
  key: string;
  header: string;
  width?: number | string;
  align?: 'left' | 'right' | 'center';
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
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  loading,
  renderActions,
  skeletonRows = 5,
}: DataTableProps<T>) {
  const totalCols = columns.length + (renderActions ? 1 : 0);

  if (loading) {
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
