'use client';
import React from 'react';
import styles from './admin-shared.module.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerTitleBlock}>
        <h1 className={styles.headerTitle}>{title}</h1>
        {subtitle && <p className={styles.headerSubtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.headerActions}>{actions}</div>}
    </div>
  );
}

interface AddButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function AddButton({ label, onClick, disabled }: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="admin-btn admin-btn-primary"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-3) var(--space-5)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-accent-cta)',
        color: 'white',
        fontWeight: 600,
        fontSize: 'var(--text-sm)',
        boxShadow: 'var(--shadow-cta)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'transform 150ms ease, box-shadow 150ms ease',
      }}
    >
      <i className="ri-add-line" style={{ fontSize: 18 }} />
      <span>{label}</span>
    </button>
  );
}
