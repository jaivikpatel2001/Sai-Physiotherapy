'use client';
import React, { useState } from 'react';
import { Modal } from './Modal';
import adminStyles from '../../app/admin/admin.module.css';
import styles from './admin-shared.module.css';

type Tone = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

const TONE_ICON: Record<Tone, string> = {
  danger: 'ri-delete-bin-line',
  warning: 'ri-alert-line',
  info: 'ri-information-line',
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  const isBusy = loading || busy;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      hideClose
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className={`${adminStyles.btn} ${adminStyles.btnSecondary}`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isBusy}
            className={`${adminStyles.btn} ${tone === 'danger' ? adminStyles.btnDanger : adminStyles.btnPrimary}`}
          >
            {isBusy ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className={styles.confirmBody}>
        <div className={`${styles.confirmIcon} ${styles[tone]}`}>
          <i className={TONE_ICON[tone]} />
        </div>
        <div className={styles.confirmTitle}>{title}</div>
        <div className={styles.confirmMsg}>{message}</div>
      </div>
    </Modal>
  );
}
