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
      className={styles.addButton}
    >
      <i className="ri-add-line" style={{ fontSize: 18, flexShrink: 0 }} />
      <span>{label}</span>
    </button>
  );
}
