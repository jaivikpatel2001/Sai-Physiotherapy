'use client';
import React, { useEffect } from 'react';
import adminStyles from '../../app/admin/admin.module.css';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: ModalSize;
  hideClose?: boolean;
  /** Hide the default header entirely (use when the body provides its own hero). */
  hideHeader?: boolean;
  /** Remove the default body padding (use when the body provides its own layout). */
  flushBody?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const SIZE_PX: Record<ModalSize, number> = {
  sm: 420,
  md: 640,
  lg: 880,
  xl: 1080,
};

export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  hideClose = false,
  hideHeader = false,
  flushBody = false,
  footer,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={adminStyles.modalBackdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-lenis-prevent
    >
      <div
        className={adminStyles.modal}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: SIZE_PX[size] }}
        data-lenis-prevent
      >
        {!hideHeader && (
          <div className={adminStyles.modalHeader}>
            <div className={adminStyles.modalTitle}>{title}</div>
            {!hideClose && (
              <button
                type="button"
                className={adminStyles.iconBtn}
                onClick={onClose}
                aria-label="Close dialog"
              >
                <i className="ri-close-line" style={{ fontSize: 18 }} />
              </button>
            )}
          </div>
        )}
        <div
          className={adminStyles.modalBody}
          data-lenis-prevent
          style={flushBody ? { padding: 0 } : undefined}
        >
          {children}
        </div>
        {footer && <div className={adminStyles.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
}
