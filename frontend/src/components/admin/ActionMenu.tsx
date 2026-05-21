'use client';
import React from 'react';
import styles from './admin-shared.module.css';

interface ActionMenuProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
}

export function ActionMenu({
  onView,
  onEdit,
  onDelete,
  disabled,
  viewLabel = 'View',
  editLabel = 'Edit',
  deleteLabel = 'Delete',
}: ActionMenuProps) {
  return (
    <div className={styles.actionGroup} role="group" aria-label="Row actions">
      {onView && (
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.view}`}
          onClick={onView}
          aria-label={viewLabel}
          title={viewLabel}
          disabled={disabled}
        >
          <i className="ri-eye-line" style={{ fontSize: 16 }} />
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.edit}`}
          onClick={onEdit}
          aria-label={editLabel}
          title={editLabel}
          disabled={disabled}
        >
          <i className="ri-pencil-line" style={{ fontSize: 16 }} />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.danger}`}
          onClick={onDelete}
          aria-label={deleteLabel}
          title={deleteLabel}
          disabled={disabled}
        >
          <i className="ri-delete-bin-line" style={{ fontSize: 16 }} />
        </button>
      )}
    </div>
  );
}
