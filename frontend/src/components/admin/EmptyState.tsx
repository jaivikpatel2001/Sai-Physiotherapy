'use client';
import React from 'react';
import adminStyles from '../../app/admin/admin.module.css';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = 'ri-inbox-2-line',
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className={adminStyles.empty}>
      <i className={`${icon} ${adminStyles.emptyIcon}`} style={{ fontSize: 44 }} />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)' }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 'var(--text-sm)', maxWidth: 420 }}>{description}</div>
      )}
      {action && <div style={{ marginTop: 'var(--space-3)' }}>{action}</div>}
    </div>
  );
}

interface AsyncBoundaryProps {
  loading: boolean;
  error?: string | null;
  empty: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  emptyIcon?: string;
  children: React.ReactNode;
}

export function AsyncBoundary({
  loading,
  error,
  empty,
  emptyTitle,
  emptyDescription,
  emptyAction,
  emptyIcon,
  children,
}: AsyncBoundaryProps) {
  if (loading) return <div className={adminStyles.spinner} />;
  if (error) {
    return (
      <div className={adminStyles.errorBox}>
        <i className="ri-error-warning-line" style={{ fontSize: 16 }} />
        {error}
      </div>
    );
  }
  if (empty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }
  return <>{children}</>;
}
